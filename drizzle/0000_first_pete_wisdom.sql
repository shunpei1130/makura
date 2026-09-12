CREATE TABLE "payment_attempts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"trial_order_id" uuid NOT NULL,
	"attempt_number" integer NOT NULL,
	"square_payment_id" text,
	"idempotency_key" text NOT NULL,
	"source_card_id" text NOT NULL,
	"amount_jpy" integer NOT NULL,
	"status" text NOT NULL,
	"error_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_attempts_square_payment_id_unique" UNIQUE("square_payment_id"),
	CONSTRAINT "payment_attempts_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"trial_order_id" uuid,
	"actor_type" text NOT NULL,
	"actor_id" text NOT NULL,
	"event_type" text NOT NULL,
	"before_json" jsonb,
	"after_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkout_intents" (
	"key" uuid PRIMARY KEY NOT NULL,
	"input_hash" text NOT NULL,
	"customer_id" text,
	"card_id" text,
	"token_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_controls" (
	"key" text PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_outbox" (
	"id" uuid PRIMARY KEY NOT NULL,
	"trial_order_id" uuid,
	"dedupe_key" text NOT NULL,
	"kind" text NOT NULL,
	"recipient" text NOT NULL,
	"subject" text NOT NULL,
	"body_encrypted" text NOT NULL,
	"sent_at" timestamp with time zone,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"provider_id" text,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_outbox_dedupe_key_unique" UNIQUE("dedupe_key")
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trial_orders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"public_token_hash" text NOT NULL,
	"checkout_key" uuid NOT NULL,
	"product_type" text NOT NULL,
	"product_name" text NOT NULL,
	"amount_jpy" integer DEFAULT 13480 NOT NULL,
	"customer_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"postal_code" text NOT NULL,
	"address1" text NOT NULL,
	"address2" text DEFAULT '' NOT NULL,
	"square_customer_id" text NOT NULL,
	"square_card_id" text NOT NULL,
	"status" text DEFAULT 'trial_active' NOT NULL,
	"trial_started_at" timestamp with time zone NOT NULL,
	"return_request_deadline" timestamp with time zone NOT NULL,
	"scheduled_charge_at" timestamp with time zone NOT NULL,
	"return_requested_at" timestamp with time zone,
	"return_ship_deadline" timestamp with time zone,
	"return_tracking_number" text,
	"return_carrier" text,
	"return_shipped_at" timestamp with time zone,
	"return_delivered_at" timestamp with time zone,
	"return_received_at" timestamp with time zone,
	"box_included" boolean DEFAULT false NOT NULL,
	"pillow_packed" boolean DEFAULT false NOT NULL,
	"guide_packed" boolean DEFAULT false NOT NULL,
	"shipped_at" timestamp with time zone,
	"outbound_tracking" text,
	"pillow_returned" boolean DEFAULT false NOT NULL,
	"box_returned" boolean DEFAULT false NOT NULL,
	"box_requirement_waived" boolean DEFAULT false NOT NULL,
	"return_review_status" text,
	"return_reject_reason" text,
	"redelivery_tracking" text,
	"billing_hold" boolean DEFAULT false NOT NULL,
	"billing_hold_reason" text,
	"manual_hold" boolean DEFAULT false NOT NULL,
	"square_payment_id" text,
	"payment_status" text,
	"charged_at" timestamp with time zone,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"next_retry_at" timestamp with time zone,
	"first_charge_at" timestamp with time zone,
	"consent_version" text NOT NULL,
	"consented_at" timestamp with time zone NOT NULL,
	"grace_notified_at" timestamp with time zone,
	"grace_deadline" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trial_orders_order_number_unique" UNIQUE("order_number"),
	CONSTRAINT "trial_orders_public_token_hash_unique" UNIQUE("public_token_hash"),
	CONSTRAINT "trial_orders_checkout_key_unique" UNIQUE("checkout_key"),
	CONSTRAINT "trial_orders_square_payment_id_unique" UNIQUE("square_payment_id"),
	CONSTRAINT "trial_amount_check" CHECK ("trial_orders"."amount_jpy" = 13480),
	CONSTRAINT "trial_type_check" CHECK ("trial_orders"."product_type" in ('vertical','horizontal'))
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_trial_order_id_trial_orders_id_fk" FOREIGN KEY ("trial_order_id") REFERENCES "public"."trial_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_trial_order_id_trial_orders_id_fk" FOREIGN KEY ("trial_order_id") REFERENCES "public"."trial_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_outbox" ADD CONSTRAINT "email_outbox_trial_order_id_trial_orders_id_fk" FOREIGN KEY ("trial_order_id") REFERENCES "public"."trial_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "attempt_order_number" ON "payment_attempts" USING btree ("trial_order_id","attempt_number");--> statement-breakpoint
CREATE INDEX "trial_due_idx" ON "trial_orders" USING btree ("scheduled_charge_at","status");