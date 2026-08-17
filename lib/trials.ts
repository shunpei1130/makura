import { getDb, type DbRow } from "@/lib/db";
import { hashAccessToken } from "@/lib/tokens";

export type TrialStatus =
  | "pending_checkout"
  | "active"
  | "return_requested"
  | "purchased"
  | "payment_failed"
  | "cancelled";

export type ReturnStatus = "not_requested" | "requested" | "received" | "cancelled";

export type Trial = {
  id: string;
  name: string;
  email: string;
  orientation: "vertical" | "horizontal";
  shippingName: string | null;
  shippingAddress: Record<string, unknown> | null;
  status: TrialStatus;
  accessTokenHash: string;
  referralCode: string;
  referrerId: string | null;
  trialStartedAt: string | null;
  trialEndsAt: string;
  returnRequestedAt: string | null;
  returnCode: string | null;
  returnStatus: ReturnStatus;
  stripeCustomerId: string | null;
  stripeCheckoutSessionId: string | null;
  stripeSetupIntentId: string | null;
  stripePaymentMethodId: string | null;
  stripePaymentIntentId: string | null;
  chargeStatus: "pending" | "processing" | "succeeded" | "failed" | "cancelled";
  chargeAttempts: number;
  nextChargeAttemptAt: string | null;
  lastChargeError: string | null;
  consentText: string;
  consentedAt: string;
  referralRewardedAt: string | null;
};

function value(row: DbRow, key: string) {
  return row[key] ?? null;
}

function dateValue(row: DbRow, key: string) {
  const raw = value(row, key);
  return raw ? new Date(String(raw)).toISOString() : null;
}

export function mapTrial(row: DbRow): Trial {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    orientation: row.orientation === "horizontal" ? "horizontal" : "vertical",
    shippingName: value(row, "shipping_name") ? String(row.shipping_name) : null,
    shippingAddress: value(row, "shipping_address") ? (typeof row.shipping_address === "string" ? JSON.parse(row.shipping_address) : row.shipping_address) : null,
    status: String(row.status) as TrialStatus,
    accessTokenHash: String(row.access_token_hash),
    referralCode: String(row.referral_code),
    referrerId: value(row, "referrer_id") ? String(row.referrer_id) : null,
    trialStartedAt: dateValue(row, "trial_started_at"),
    trialEndsAt: String(new Date(String(row.trial_ends_at)).toISOString()),
    returnRequestedAt: dateValue(row, "return_requested_at"),
    returnCode: value(row, "return_code") ? String(row.return_code) : null,
    returnStatus: String(row.return_status) as ReturnStatus,
    stripeCustomerId: value(row, "stripe_customer_id") ? String(row.stripe_customer_id) : null,
    stripeCheckoutSessionId: value(row, "stripe_checkout_session_id")
      ? String(row.stripe_checkout_session_id)
      : null,
    stripeSetupIntentId: value(row, "stripe_setup_intent_id")
      ? String(row.stripe_setup_intent_id)
      : null,
    stripePaymentMethodId: value(row, "stripe_payment_method_id")
      ? String(row.stripe_payment_method_id)
      : null,
    stripePaymentIntentId: value(row, "stripe_payment_intent_id")
      ? String(row.stripe_payment_intent_id)
      : null,
    chargeStatus: String(row.charge_status) as Trial["chargeStatus"],
    chargeAttempts: Number(row.charge_attempts ?? 0),
    nextChargeAttemptAt: dateValue(row, "next_charge_attempt_at"),
    lastChargeError: value(row, "last_charge_error") ? String(row.last_charge_error) : null,
    consentText: String(row.consent_text),
    consentedAt: String(new Date(String(row.consented_at)).toISOString()),
    referralRewardedAt: dateValue(row, "referral_rewarded_at"),
  };
}

export async function getTrialById(id: string) {
  const sql = getDb();
  const rows = await sql`SELECT * FROM trials WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapTrial(rows[0]) : null;
}

export async function getTrialByToken(token: string) {
  const sql = getDb();
  const tokenHash = hashAccessToken(token);
  const rows = await sql`SELECT * FROM trials WHERE access_token_hash = ${tokenHash} LIMIT 1`;
  return rows[0] ? mapTrial(rows[0]) : null;
}

export async function getTrialByReferralCode(code: string) {
  const sql = getDb();
  const rows = await sql`SELECT * FROM trials WHERE referral_code = ${code} LIMIT 1`;
  return rows[0] ? mapTrial(rows[0]) : null;
}

export async function getTrialByCheckoutSessionId(sessionId: string) {
  const sql = getDb();
  const rows = await sql`SELECT * FROM trials WHERE stripe_checkout_session_id = ${sessionId} LIMIT 1`;
  return rows[0] ? mapTrial(rows[0]) : null;
}

export async function getTrialByPaymentIntentId(paymentIntentId: string) {
  const sql = getDb();
  const rows = await sql`SELECT * FROM trials WHERE stripe_payment_intent_id = ${paymentIntentId} LIMIT 1`;
  return rows[0] ? mapTrial(rows[0]) : null;
}

export async function updateTrialCheckoutSession(trialId: string, sessionId: string) {
  const sql = getDb();
  await sql`
    UPDATE trials
    SET stripe_checkout_session_id = ${sessionId}, updated_at = now()
    WHERE id = ${trialId}
  `;
}

export async function updateTrialStripeCustomer(trialId: string, customerId: string) {
  const sql = getDb();
  await sql`
    UPDATE trials
    SET stripe_customer_id = ${customerId}, updated_at = now()
    WHERE id = ${trialId}
  `;
}

export async function createTrial(input: {
  name: string;
  email: string;
  orientation: "vertical" | "horizontal";
  accessTokenHash: string;
  referralCode: string;
  referrerId: string | null;
  trialEndsAt: Date;
  consentText: string;
  consentIp: string | null;
  consentUserAgent: string | null;
}) {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO trials (
      name, email, orientation, access_token_hash, referral_code, referrer_id,
      trial_ends_at, consent_text, consented_at, consent_ip, consent_user_agent
    ) VALUES (
      ${input.name}, ${input.email}, ${input.orientation}, ${input.accessTokenHash},
      ${input.referralCode}, ${input.referrerId}, ${input.trialEndsAt}, ${input.consentText},
      now(), ${input.consentIp}, ${input.consentUserAgent}
    )
    RETURNING *
  `;

  return mapTrial(rows[0]);
}

export async function activateTrialFromSetupIntent(input: {
  trialId: string;
  setupIntentId: string;
  paymentMethodId: string;
  customerId: string | null;
  shippingName: string | null;
  shippingAddress: string | null;
}) {
  const sql = getDb();
  const rows = await sql`
    UPDATE trials
    SET
      status = CASE WHEN status IN ('pending_checkout', 'payment_failed') THEN 'active' ELSE status END,
      trial_started_at = COALESCE(trial_started_at, now()),
      stripe_setup_intent_id = ${input.setupIntentId},
      stripe_payment_method_id = ${input.paymentMethodId},
      stripe_customer_id = COALESCE(${input.customerId}, stripe_customer_id),
      shipping_name = COALESCE(${input.shippingName}, shipping_name),
      shipping_address = COALESCE(CAST(${input.shippingAddress} AS jsonb), shipping_address),
      charge_status = CASE WHEN charge_status = 'cancelled' THEN charge_status ELSE 'pending' END,
      next_charge_attempt_at = NULL,
      last_charge_error = NULL,
      updated_at = now()
    WHERE id = ${input.trialId}
    RETURNING *
  `;

  return rows[0] ? mapTrial(rows[0]) : null;
}

export async function requestTrialReturn(trialId: string, returnCode: string) {
  const sql = getDb();
  const rows = await sql`
    UPDATE trials
    SET
      status = 'return_requested',
      return_status = 'requested',
      return_requested_at = now(),
      return_code = ${returnCode},
      charge_status = CASE WHEN charge_status IN ('succeeded', 'processing') THEN charge_status ELSE 'cancelled' END,
      updated_at = now()
    WHERE id = ${trialId}
      AND status = 'active'
      AND return_status = 'not_requested'
      AND charge_status IN ('pending', 'failed')
      AND trial_ends_at >= now()
    RETURNING *
  `;

  return rows[0] ? mapTrial(rows[0]) : null;
}
