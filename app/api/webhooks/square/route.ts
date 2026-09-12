import { api, AppError, appUrl, required } from "@/lib/security";
import { getDb } from "@/lib/db/client";
import { verifyWebhook, gateway } from "@/lib/square/client";
import { reconcilePayment } from "@/lib/trials/billing";
export const maxDuration = 60;
export async function POST(req: Request) {
  return api(async () => {
    const raw = await req.text();
    if (raw.length > 200000) throw new AppError("TOO_LARGE", 413);
    if (
      !verifyWebhook(
        raw,
        req.headers.get("x-square-hmacsha256-signature") || "",
        process.env.SQUARE_WEBHOOK_URL || `${appUrl()}/api/webhooks/square`,
        required("SQUARE_WEBHOOK_SIGNATURE_KEY"),
      )
    )
      throw new AppError("INVALID_SIGNATURE", 401);
    let event;
    try {
      event = JSON.parse(raw);
    } catch {
      throw new AppError("INVALID_INPUT");
    }
    if (
      !event.event_id ||
      !["payment.created", "payment.updated"].includes(event.type)
    )
      return { ok: true };
    const db = getDb();
    const p = event.data?.object?.payment;
    if (!p?.id || !p?.reference_id) return { ok: true };
    const known = (
      await db.query("SELECT event_id FROM webhook_events WHERE event_id=$1", [
        event.event_id,
      ])
    ).rows[0];
    if (known) return { ok: true };
    const attempt = (
      await db.query<{ trial_order_id: string }>(
        `SELECT trial_order_id FROM payment_attempts WHERE trial_order_id::text=$1 AND (square_payment_id=$2 OR square_payment_id IS NULL) ORDER BY attempt_number DESC LIMIT 1`,
        [p.reference_id, p.id],
      )
    ).rows[0];
    if (attempt) {
      await reconcilePayment(db, await gateway.getPayment(p.id));
    }
    await db.query(
      "INSERT INTO webhook_events(event_id) VALUES($1) ON CONFLICT DO NOTHING",
      [event.event_id],
    );
    return { ok: true };
  });
}
