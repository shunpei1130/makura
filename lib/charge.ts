import { getDb } from "@/lib/db";
import { PRODUCT_PRICE_JPY } from "@/lib/constants";
import { getStripe } from "@/lib/stripe";
import { sendPaymentFailureEmail, sendPurchaseConfirmationEmail } from "@/lib/notifications";

type ChargeResult = { trialId: string; status: string; message?: string };

function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return "決済に失敗しました。";
}

export async function chargeDueTrials(limit = 25): Promise<ChargeResult[]> {
  const sql = getDb();
  const stripe = getStripe();
  const dueTrials = await sql`
    SELECT * FROM trials
    WHERE status = 'active'
      AND return_status = 'not_requested'
      AND trial_ends_at <= now()
      AND charge_status IN ('pending', 'failed')
      AND (next_charge_attempt_at IS NULL OR next_charge_attempt_at <= now())
    ORDER BY trial_ends_at ASC
    LIMIT ${limit}
  `;
  const results: ChargeResult[] = [];

  for (const candidate of dueTrials) {
    const claimed = await sql`
      UPDATE trials
      SET charge_status = 'processing', charge_attempts = charge_attempts + 1, updated_at = now()
      WHERE id = ${candidate.id}
        AND status = 'active'
        AND return_status = 'not_requested'
        AND charge_status IN ('pending', 'failed')
      RETURNING id, charge_attempts, email, name, stripe_customer_id, stripe_payment_method_id
    `;
    if (claimed.length === 0) continue;

    const row = claimed[0];
    const attemptNumber = Number(row.charge_attempts);
    const idempotencyKey = `trial-charge-${row.id}-${attemptNumber}`;
    await sql`
      INSERT INTO payment_attempts (trial_id, attempt_number, status)
      VALUES (${row.id}, ${attemptNumber}, 'processing')
    `;

    try {
      if (!row.stripe_customer_id || !row.stripe_payment_method_id) {
        throw new Error("Stripeの決済手段が登録されていません。");
      }

      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: PRODUCT_PRICE_JPY,
          currency: "jpy",
          customer: String(row.stripe_customer_id),
          payment_method: String(row.stripe_payment_method_id),
          confirm: true,
          off_session: true,
          metadata: { trialId: String(row.id), product: "yumeggravity-trial" },
        },
        { idempotencyKey },
      );

      const success = paymentIntent.status === "succeeded";
      await sql`
        UPDATE payment_attempts
        SET status = ${success ? "succeeded" : "failed"}, stripe_payment_intent_id = ${paymentIntent.id}
        WHERE trial_id = ${row.id} AND attempt_number = ${attemptNumber}
      `;
      const updatedTrial = await sql`
        UPDATE trials
        SET status = ${success ? "purchased" : "payment_failed"},
            charge_status = ${success ? "succeeded" : "failed"},
            stripe_payment_intent_id = ${paymentIntent.id},
            last_charge_error = ${success ? null : `PaymentIntent status: ${paymentIntent.status}`},
            updated_at = now()
        WHERE id = ${row.id}
          AND status <> 'purchased'
        RETURNING id
      `;

      if (success && updatedTrial.length > 0) {
        await sendPurchaseConfirmationEmail({ email: String(row.email), name: String(row.name) });
        results.push({ trialId: String(row.id), status: "succeeded" });
      } else {
        await sendPaymentFailureEmail({ email: String(row.email), pageUrl: process.env.APP_URL || "http://localhost:3000" });
        results.push({ trialId: String(row.id), status: "failed", message: `PaymentIntent status: ${paymentIntent.status}` });
      }
    } catch (error) {
      const message = errorMessage(error);
      const terminal = attemptNumber >= 3;
      await sql`
        UPDATE payment_attempts
        SET status = 'failed', error_message = ${message}
        WHERE trial_id = ${row.id} AND attempt_number = ${attemptNumber}
      `;
      await sql`
        UPDATE trials
        SET status = ${terminal ? "payment_failed" : "active"},
            charge_status = 'failed',
            next_charge_attempt_at = CASE WHEN ${terminal} THEN NULL ELSE now() + INTERVAL '1 day' END,
            last_charge_error = ${message}, updated_at = now()
        WHERE id = ${row.id}
      `;
      await sendPaymentFailureEmail({ email: String(row.email), pageUrl: process.env.APP_URL || "http://localhost:3000" });
      results.push({ trialId: String(row.id), status: terminal ? "payment_failed" : "retry_scheduled", message });
    }
  }

  return results;
}
