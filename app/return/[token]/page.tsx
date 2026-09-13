import CommerceShell from "@/app/components/commerce-shell";
import { getDb } from "@/lib/db/client";
import { tokenOrder, customerView } from "@/lib/trials/service";
import OrderView from "./view";
import { notFound } from "next/navigation";
import { AppError } from "@/lib/security";
export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer" as const,
};
export default async function OrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  try {
    const t = await tokenOrder(getDb(), token);
    return (
      <CommerceShell>
        <OrderView
          token={token}
          order={JSON.parse(JSON.stringify(customerView(t)))}
        />
      </CommerceShell>
    );
  } catch (e) {
    if (e instanceof AppError && e.status === 404) notFound();
    return (
      <CommerceShell>
        <h1>申込状況を確認できませんでした</h1>
        <p>
          時間を置いて再読み込みしてください。申込を重複して行わず、お急ぎの場合はお問い合わせください。
        </p>
      </CommerceShell>
    );
  }
}
