import Stripe from "stripe";

let cachedStripe: Stripe | undefined;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  cachedStripe ??= new Stripe(secretKey, {
    apiVersion: "2026-06-24.dahlia" as Stripe.LatestApiVersion,
    typescript: true,
  });

  return cachedStripe;
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
