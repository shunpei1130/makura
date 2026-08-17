CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  orientation text NOT NULL CHECK (orientation IN ('vertical', 'horizontal')),
  shipping_name text,
  shipping_address jsonb,
  status text NOT NULL DEFAULT 'pending_checkout' CHECK (status IN ('pending_checkout', 'active', 'return_requested', 'purchased', 'payment_failed', 'cancelled')),
  access_token_hash text NOT NULL UNIQUE,
  referral_code text NOT NULL UNIQUE,
  referrer_id uuid REFERENCES trials(id),
  trial_started_at timestamptz,
  trial_ends_at timestamptz NOT NULL,
  return_requested_at timestamptz,
  return_code text UNIQUE,
  return_status text NOT NULL DEFAULT 'not_requested' CHECK (return_status IN ('not_requested', 'requested', 'received', 'cancelled')),
  stripe_customer_id text UNIQUE,
  stripe_checkout_session_id text UNIQUE,
  stripe_setup_intent_id text UNIQUE,
  stripe_payment_method_id text,
  stripe_payment_intent_id text UNIQUE,
  charge_status text NOT NULL DEFAULT 'pending' CHECK (charge_status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled')),
  charge_attempts integer NOT NULL DEFAULT 0,
  next_charge_attempt_at timestamptz,
  last_charge_error text,
  consent_text text NOT NULL,
  consented_at timestamptz NOT NULL,
  consent_ip text,
  consent_user_agent text,
  referral_rewarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE trials ADD COLUMN IF NOT EXISTS shipping_name text;
ALTER TABLE trials ADD COLUMN IF NOT EXISTS shipping_address jsonb;

CREATE INDEX IF NOT EXISTS trials_charge_queue_idx
  ON trials (trial_ends_at, next_charge_attempt_at)
  WHERE status = 'active' AND return_status = 'not_requested';

CREATE INDEX IF NOT EXISTS trials_email_idx ON trials (lower(email));
CREATE INDEX IF NOT EXISTS trials_referrer_idx ON trials (referrer_id);

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_trial_id uuid NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
  referred_trial_id uuid NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
  qualified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (referrer_trial_id, referred_trial_id)
);

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'processed', 'failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE TABLE IF NOT EXISTS payment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_id uuid NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
  stripe_payment_intent_id text,
  attempt_number integer NOT NULL,
  status text NOT NULL CHECK (status IN ('processing', 'succeeded', 'failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_attempts_trial_idx ON payment_attempts (trial_id, created_at DESC);
