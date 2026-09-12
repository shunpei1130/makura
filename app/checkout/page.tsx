import { headers } from "next/headers";
import CommerceShell from "@/app/components/commerce-shell";
import CheckoutForm from "./checkout-form";
import { notFound } from "next/navigation";
import { squareConfig } from "@/lib/square/client";
export const dynamic = "force-dynamic";
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  if (type !== "vertical" && type !== "horizontal") notFound();
  let config = null;
  try {
    config = squareConfig();
  } catch {}
  return (
    <CommerceShell>
      <CheckoutForm
        type={type}
        config={
          config
            ? {
                applicationId: config.applicationId,
                locationId: config.locationId,
                environment: config.environment,
                nonce: (await headers()).get("x-nonce") || undefined,
              }
            : null
        }
        enabled={process.env.CHECKOUT_ENABLED === "true" && !!config}
      />
    </CommerceShell>
  );
}
