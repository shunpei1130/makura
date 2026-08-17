import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { activateTrialFromSetupIntent, getTrialById } from "@/lib/trials";
import { qualifyReferral } from "@/lib/referrals";
import { sendPurchaseConfirmationEmail, sendTrialActivatedEmail } from "@/lib/notifications";
import { formatDate } from "@/lib/format";

export const runtime = "nodejs";

async function activateFromSetupIntent(
  setupIntent: Stripe.SetupIntent,
  metadataOverride?: Stripe.MetadataParam,
  shippingName: string | null = null,
  shippingAddress: string | null = null,
) {
  const metadata = { ...(setupIntent.metadata ?? {}), ...(metadataOverride ?? {}) };
  const trialId = metadata.trialId ? String(metadata.trialId) : null;
  const paymentMethodId = typeof setupIntent.payment_method === "string" ? setupIntent.payment_method : setupIntent.payment_method?.id;
  const customerId = typeof setupIntent.customer === "string" ? setupIntent.customer : setupIntent.customer?.id;

  if (!trialId || !paymentMethodId || setupIntent.status !== "succeeded") return;

  const before = await getTrialById(trialId);
  const trial = await activateTrialFromSetupIntent({
    trialId,
    setupIntentId: setupIntent.id,
    paymentMethodId,
    customerId: customerId || null,
    shippingName,
    shippingAddress,
  });
  if (!trial) return;

  if (before?.status === "pending_checkout" || !before?.trialStartedAt) {
    const origin = process.env.APP_URL || "http://localhost:3000";
    const token = metadata.accessToken ? String(metadata.accessToken) : undefined;
    await sendTrialActivatedEmail({
      email: trial.email,
      name: trial.name,
      trialEndsAt: formatDate(trial.trialEndsAt),
      pageUrl: token ? `${origin}/mypage/${token}` : origin,
    });
    await qualifyReferral(trial.id);
  }
}

async function handleEvent(event: Stripe.Event) {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== "setup" || !session.setup_intent) return;
    const stripe = getStripe();
    const setupIntentId = typeof session.setup_intent === "string" ? session.setup_intent : session.setup_intent.id;
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    const shippingDetails = (session as unknown as {
      shipping_details?: { name?: string | null; address?: Record<string, unknown> | null } | null;
    }).shipping_details;
    const shippingName = shippingDetails?.name || null;
    const shippingAddress = shippingDetails?.address ? JSON.stringify(shippingDetails.address) : null;
    await activateFromSetupIntent(setupIntent, session.metadata ?? undefined, shippingName, shippingAddress);
    return;
  }

  if (event.type === "setup_intent.succeeded") {
    await activateFromSetupIntent(event.data.object as Stripe.SetupIntent);
    return;
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const trialId = paymentIntent.metadata?.trialId;
    if (!trialId) return;
    const before = await getTrialById(trialId);
    const sql = getDb();
    await sql`
      UPDATE trials
      SET status = 'purchased', charge_status = 'succeeded',
          stripe_payment_intent_id = ${paymentIntent.id}, last_charge_error = NULL,
          updated_at = now()
      WHERE id = ${trialId}
    `;
    if (before && before.status !== "purchased") {
      await sendPurchaseConfirmationEmail({ email: before.email, name: before.name });
    }
    return;
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const trialId = paymentIntent.metadata?.trialId;
    if (!trialId) return;
    const message = paymentIntent.last_payment_error?.message || "決済に失敗しました。";
    const sql = getDb();
    await sql`
      UPDATE trials
      SET status = CASE WHEN charge_attempts >= 3 THEN 'payment_failed' ELSE status END,
          charge_status = 'failed', stripe_payment_intent_id = ${paymentIntent.id},
          last_charge_error = ${message}, updated_at = now()
      WHERE id = ${trialId}
    `;
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) return new Response("Webhook is not configured", { status: 400 });

  try {
    const body = await request.text();
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    const sql = getDb();
    const claimed = await sql`
      INSERT INTO stripe_webhook_events (event_id, event_type)
      VALUES (${event.id}, ${event.type})
      ON CONFLICT (event_id) DO NOTHING
      RETURNING event_id
    `;
    if (claimed.length === 0) return NextResponse.json({ received: true, duplicate: true });

    try {
      await handleEvent(event);
      await sql`UPDATE stripe_webhook_events SET status = 'processed', processed_at = now() WHERE event_id = ${event.id}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      await sql`UPDATE stripe_webhook_events SET status = 'failed', error_message = ${message} WHERE event_id = ${event.id}`;
      throw error;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("stripe webhook failed", error);
    return new Response("Webhook processing failed", { status: 400 });
  }
}
