import { redirect } from "next/navigation";
import CommerceShell from "@/app/components/commerce-shell";
import { admin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { load } from "@/lib/trials/service";
import { formatDate, STATUS_LABELS } from "@/lib/trials/model";
import Actions from "./actions";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function Detail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    await admin();
  } catch {
    redirect("/admin/login");
  }
  const { id } = await params;
  const db = getDb(),
    t = await load(db, id);
  const events = (
    await db.query<{ event_type: string; actor_id: string; created_at: Date }>(
      "SELECT event_type,actor_id,created_at FROM audit_events WHERE trial_order_id=$1 ORDER BY created_at DESC LIMIT 100",
      [id],
    )
  ).rows;
  return (
    <CommerceShell>
      <h1>{t.order_number}</h1>
      <p>
        {t.product_name} ／ {STATUS_LABELS[t.status]}
      </p>
      <section className="trial-summary">
        <h2>お届け先</h2>
        <p>
          {t.customer_name}
          <br />〒{t.postal_code}
          <br />
          {t.address1} {t.address2}
          <br />
          {t.phone}
          <br />
          {t.email}
        </p>
        <p>
          課金予定:{formatDate(t.scheduled_charge_at)}
          <br />
          返品期限:{formatDate(t.return_request_deadline)}
          <br />
          手動保留:{t.manual_hold ? "あり" : "なし"} ／ 返品による保留:
          {t.billing_hold ? "あり" : "なし"}
        </p>
        <p>
          返送追跡:{t.return_carrier} {t.return_tracking_number || "未登録"}
          <br />
          実物受領:
          {t.return_received_at
            ? formatDate(t.return_received_at)
            : "未確認"}{" "}
          ／ 枕:{t.pillow_returned ? "あり" : "未確認"} ／ 箱:
          {t.box_returned ? "あり" : "未確認"}
          <br />
          箱免除:{t.box_requirement_waived ? "適用" : "なし"}
        </p>
      </section>
      <Actions id={id} />
      <h2>操作履歴</h2>
      <ul>
        {events.map((e, i) => (
          <li key={i}>
            {formatDate(e.created_at)} · {e.event_type} · {e.actor_id}
          </li>
        ))}
      </ul>
    </CommerceShell>
  );
}
