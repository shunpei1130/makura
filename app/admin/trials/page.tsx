import Link from "next/link";
import { redirect } from "next/navigation";
import CommerceShell from "@/app/components/commerce-shell";
import { admin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { formatDate, STATUS_LABELS, type Trial } from "@/lib/trials/model";
import BillingSwitch from "./switch";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
const filters: Record<string, { label: string; where: string }> = {
  all: { label: "すべて", where: "true" },
  today: {
    label: "今日課金",
    where:
      "(scheduled_charge_at AT TIME ZONE 'Asia/Tokyo')::date=(now() AT TIME ZONE 'Asia/Tokyo')::date AND status IN ('trial_active','charge_due','return_expired','return_rejected','payment_failed')",
  },
  week: {
    label: "7日以内課金",
    where:
      "scheduled_charge_at BETWEEN now() AND now()+interval '7 days' AND status IN ('trial_active','charge_due','return_expired','return_rejected','payment_failed')",
  },
  requested: {
    label: "返品申請あり",
    where: "return_requested_at IS NOT NULL",
  },
  overdue: {
    label: "返送期限超過",
    where:
      "return_ship_deadline<now() AND return_shipped_at IS NULL AND status IN ('return_requested','return_expired')",
  },
  transit: { label: "返品到着待ち", where: "status='return_in_transit'" },
  review: {
    label: "返品確認待ち",
    where:
      "(return_delivered_at IS NOT NULL OR return_received_at IS NOT NULL) AND return_review_status='pending'",
  },
  failed: {
    label: "決済失敗・確認中",
    where:
      "status IN ('payment_failed','collection_failed','charge_processing')",
  },
  reship: {
    label: "却下品の再送待ち",
    where: "return_review_status='rejected' AND redelivery_tracking IS NULL",
  },
};
const reviewLabels: Record<string, string> = {
  pending: "確認待ち",
  accepted: "返品承認",
  rejected: "返品不成立",
  expired: "期限超過",
};
const paymentLabels: Record<string, string> = {
  COMPLETED: "支払済み",
  FAILED: "支払い失敗",
  CANCELED: "決済取消",
  APPROVED: "決済確認中",
  PENDING: "決済確認中",
};
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>;
}) {
  try {
    await admin();
  } catch {
    redirect("/admin/login");
  }
  const s = await searchParams;
  const f = filters[s.filter || "all"] || filters.all;
  const page = Math.min(100000, Math.max(1, Math.floor(Number(s.page)) || 1));
  const db = getDb();
  const { rows } = await db.query<Trial>(
    `SELECT * FROM trial_orders WHERE ${f.where} ORDER BY (return_delivered_at IS NOT NULL AND return_review_status='pending') DESC,created_at DESC LIMIT 50 OFFSET $1`,
    [(page - 1) * 50],
  );
  const enabled =
    (
      await db.query<{ enabled: boolean }>(
        "SELECT enabled FROM system_controls WHERE key='auto_charge_enabled'",
      )
    ).rows[0]?.enabled === true;
  const mail = (
    await db.query<{ count: string }>(
      "SELECT count(*) FROM email_outbox WHERE sent_at IS NULL AND canceled_at IS NULL AND attempts>0",
    )
  ).rows[0].count;
  return (
    <CommerceShell>
      <h1>トライアル管理</h1>
      <BillingSwitch
        enabled={enabled}
        environment={process.env.AUTO_CHARGE_ENABLED === "true"}
      />
      <p>送信失敗メール:{mail}件</p>
      <nav className="filter-nav">
        {Object.entries(filters).map(([key, v]) => (
          <Link key={key} href={`?filter=${key}`}>
            {v.label}
          </Link>
        ))}
      </nav>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {[
                "申込番号・氏名",
                "商品",
                "申込日",
                "課金予定",
                "状態",
                "返品",
                "決済",
                "箱",
              ].map((x) => (
                <th key={x}>{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td>
                  <Link href={`/admin/trials/${t.id}`}>{t.order_number}</Link>
                  <br />
                  {t.customer_name}
                </td>
                <td>{t.product_name}</td>
                <td>{formatDate(t.trial_started_at)}</td>
                <td>{formatDate(t.scheduled_charge_at)}</td>
                <td>
                  {STATUS_LABELS[t.status]}
                  {(t.manual_hold || t.billing_hold) &&
                    !["cancelled", "return_accepted"].includes(t.status) &&
                    "（保留）"}
                </td>
                <td>
                  {reviewLabels[t.return_review_status || ""] ||
                    (t.status === "cancelled" ? "対応終了" : "—")}
                </td>
                <td>{paymentLabels[t.payment_status || ""] || "未請求"}</td>
                <td>{t.box_included ? "同梱済" : "出荷確認待ち"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p>該当する申込はありません。</p>}
      <nav>
        <Link
          href={`?filter=${s.filter || "all"}&page=${Math.max(1, page - 1)}`}
        >
          前へ
        </Link>
        <span>{page}ページ</span>
        <Link href={`?filter=${s.filter || "all"}&page=${page + 1}`}>次へ</Link>
      </nav>
      <form action="/api/auth/logout" method="post">
        <button className="secondary">ログアウト</button>
      </form>
    </CommerceShell>
  );
}
