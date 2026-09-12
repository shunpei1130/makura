import { headers } from "next/headers";
import CommerceShell from "@/app/components/commerce-shell";
import { squareConfig } from "@/lib/square/client";
import UpdateCard from "./update-card";
export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let cfg = null;
  try {
    cfg = squareConfig();
  } catch {}
  return (
    <CommerceShell>
      <h1>お支払いカードの更新</h1>
      <UpdateCard
        token={token}
        config={
          cfg
            ? {
                applicationId: cfg.applicationId,
                locationId: cfg.locationId,
                environment: cfg.environment,
                nonce: (await headers()).get("x-nonce") || undefined,
              }
            : null
        }
      />
    </CommerceShell>
  );
}
