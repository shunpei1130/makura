import CommerceShell from "@/app/components/commerce-shell";
import TrialSummary from "@/app/components/trial-summary";
import Lookup from "./lookup";
export const dynamic = "force-dynamic";
export default function ReturnPage() {
  return (
    <CommerceShell>
      <h1>返品は、かんたんです。</h1>
      <p>
        30日以内に申請し、申請後7日以内に枕と届いた箱を元払いで返送してください。期限内の返品申請で商品代の自動請求を一時保留します。
      </p>
      <Lookup />
      <TrialSummary />
    </CommerceShell>
  );
}
