import { PRODUCT_NAME } from "@/lib/constants";
import { getStripe } from "@/lib/stripe";
import { updateTrialCheckoutSession } from "@/lib/trials";
import { randomBytes } from "node:crypto";

export async function createSetupCheckout(input: {
  trialId: string;
  accessToken: string;
  customerId: string;
  trialDays: number;
  origin: string;
}) {
  const stripe = getStripe();
  const integrationIdentifier = `trial_${randomBytes(4).toString("hex")}`;
  const session = await stripe.checkout.sessions.create({
    mode: "setup",
    customer: input.customerId,
    success_url: `${input.origin}/success?token=${encodeURIComponent(input.accessToken)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/?checkout=cancelled`,
    billing_address_collection: "required",
    shipping_address_collection: { allowed_countries: ["JP"] },
    locale: "ja",
    metadata: {
      trialId: input.trialId,
      accessToken: input.accessToken,
      trialDays: String(input.trialDays),
      product: PRODUCT_NAME,
    },
    setup_intent_data: {
      metadata: {
        trialId: input.trialId,
        accessToken: input.accessToken,
        product: PRODUCT_NAME,
      },
    },
    integration_identifier: integrationIdentifier,
  });

  if (!session.url) {
    throw new Error("Stripe Checkout did not return a URL.");
  }

  await updateTrialCheckoutSession(input.trialId, session.id);
  return session;
}
