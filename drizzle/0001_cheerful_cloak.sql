ALTER TABLE "email_outbox" ADD COLUMN "canceled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "trial_orders" ADD COLUMN "return_rejection_notified_at" timestamp with time zone;