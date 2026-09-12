import { randomUUID } from "node:crypto";
import type { DB, Database } from "../db/client";
import { AppError, hash, publicToken } from "../security";
import { addDays, type Trial } from "./model";
import { enqueue } from "../email/service";
export async function load(tx: DB, id: string, lock = false) {
  const { rows } = await tx.query<Trial>(
    `SELECT * FROM trial_orders WHERE id=$1${lock ? " FOR UPDATE" : ""}`,
    [id],
  );
  if (!rows[0]) throw new AppError("NOT_FOUND", 404);
  return rows[0];
}
export async function tokenOrder(tx: DB, token: string, lock = false) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new AppError("NOT_FOUND", 404);
  const { rows } = await tx.query<Trial>(
    `SELECT * FROM trial_orders WHERE public_token_hash=$1${lock ? " FOR UPDATE" : ""}`,
    [hash(token)],
  );
  if (!rows[0]) throw new AppError("NOT_FOUND", 404);
  return rows[0];
}
export async function audit(
  tx: DB,
  t: Trial,
  actor: string,
  event: string,
  after: Record<string, unknown>,
) {
  await tx.query(
    "INSERT INTO audit_events(id,trial_order_id,actor_type,actor_id,event_type,before_json,after_json) VALUES($1,$2,$3,$4,$5,$6,$7)",
    [
      randomUUID(),
      t.id,
      actor === "system"
        ? "system"
        : actor === "customer"
          ? "customer"
          : "admin",
      actor,
      event,
      JSON.stringify({
        status: t.status,
        billing_hold: t.billing_hold,
        scheduled_charge_at: t.scheduled_charge_at,
      }),
      JSON.stringify(after),
    ],
  );
}
export async function update(
  tx: DB,
  t: Trial,
  fields: Record<string, unknown>,
  actor: string,
  event: string,
) {
  const keys = Object.keys(fields);
  if (keys.some((k) => !/^[a-z_]+$/.test(k))) throw new Error("INVALID_FIELD");
  await tx.query(
    `UPDATE trial_orders SET ${keys.map((k, i) => `${k}=$${i + 2}`).join(",")},updated_at=now() WHERE id=$1`,
    [t.id, ...Object.values(fields)],
  );
  await audit(tx, t, actor, event, fields);
  return { ...t, ...fields } as Trial;
}
export async function requestReturn(
  db: Database,
  token: string,
  now = new Date(),
) {
  return db.transaction(async (tx) => {
    const t = await tokenOrder(tx, token, true);
    if (t.return_requested_at) return { status: t.status };
    if (
      now > t.return_request_deadline ||
      !["trial_active", "charge_due"].includes(t.status) ||
      t.charged_at
    )
      throw new AppError("RETURN_NOT_AVAILABLE", 409);
    const next = await update(
      tx,
      t,
      {
        status: "return_requested",
        return_requested_at: now,
        return_ship_deadline: addDays(now, 7),
        billing_hold: true,
        billing_hold_reason: "return",
        return_review_status: "pending",
      },
      "customer",
      "return_requested",
    );
    await enqueue(
      tx,
      next,
      "返品申請を受け付けました",
      `商品代の自動請求を保留しました。申請から7日以内に枕と箱を元払いで発送し、配送会社と追跡番号を登録してください。返送先:〒273-0111 千葉県鎌ケ谷市北中沢2丁目12-39 長谷川 峻平（夢重力マクラ） 電話090-9325-5945。商品の受領・承認後に商品代の免除が確定します。`,
    );
    return { status: next.status };
  });
}
export async function tracking(
  db: Database,
  token: string,
  carrier: string,
  number: string,
  now = new Date(),
) {
  return db.transaction(async (tx) => {
    const t = await tokenOrder(tx, token, true);
    if (!["return_requested", "return_in_transit"].includes(t.status))
      throw new AppError("INVALID_STATE", 409);
    const deadline = t.grace_deadline || t.return_ship_deadline;
    if (!deadline || now > deadline) throw new AppError("CONTACT_SUPPORT", 409);
    const next = await update(
      tx,
      t,
      {
        status: "return_in_transit",
        return_carrier: carrier,
        return_tracking_number: number,
        return_shipped_at: now,
        billing_hold: true,
        billing_hold_reason: "return",
      },
      "customer",
      "return_tracking",
    );
    await enqueue(
      tx,
      next,
      "返送情報を受け付けました",
      "商品代の自動請求は返品審査が終わるまで保留します。",
    );
    return { status: next.status };
  });
}
export type AdminAction =
  | "hold"
  | "release"
  | "extend"
  | "ship"
  | "confirm-shipped"
  | "delivered"
  | "return-received"
  | "return-approve"
  | "return-reject"
  | "waive-box"
  | "retry-payment"
  | "cancel"
  | "redeliver";
export async function adminAction(
  db: Database,
  id: string,
  action: AdminAction,
  values: Record<string, unknown>,
  actor: string,
  now = new Date(),
) {
  return db.transaction(async (tx) => {
    const t = await load(tx, id, true);
    let fields: Record<string, unknown> = {};
    let message = "";
    if (t.status === "charge_processing" && action !== "hold")
      throw new AppError("PAYMENT_RECONCILIATION_REQUIRED", 409);
    switch (action) {
      case "hold":
        fields = { manual_hold: true };
        break;
      case "release":
        fields = { manual_hold: false };
        break;
      case "extend": {
        const days = Number(values.days);
        if (
          !Number.isInteger(days) ||
          days < 1 ||
          days > 365 ||
          ["paid", "cancelled", "return_accepted"].includes(t.status)
        )
          throw new AppError("INVALID_INPUT");
        fields = {
          scheduled_charge_at: addDays(t.scheduled_charge_at, days),
          return_request_deadline: addDays(t.return_request_deadline, days),
        };
        message = "返品申請期限と請求予定日を同じ日数延長しました。";
        break;
      }
      case "ship":
        if (
          !values.pillow ||
          !values.box ||
          !values.guide ||
          !String(values.tracking || "").trim() ||
          t.shipped_at ||
          t.status === "cancelled"
        )
          throw new AppError("PACKING_REQUIRED");
        fields = {
          pillow_packed: true,
          box_included: true,
          guide_packed: true,
          shipped_at: now,
          outbound_tracking: values.tracking,
        };
        message =
          "枕・返品用箱・案内カードを発送しました。箱は保管してください。";
        break;
      case "confirm-shipped":
        if (!["return_requested", "return_expired"].includes(t.status))
          throw new AppError("INVALID_STATE", 409);
        fields = {
          status: "return_in_transit",
          return_shipped_at: now,
          billing_hold: true,
          billing_hold_reason: "return",
          return_review_status: "pending",
        };
        break;
      case "delivered":
        if (!["return_in_transit", "return_requested"].includes(t.status))
          throw new AppError("INVALID_STATE", 409);
        fields = { return_delivered_at: now, billing_hold: true };
        break;
      case "return-received":
        if (
          ![
            "return_requested",
            "return_in_transit",
            "return_received",
          ].includes(t.status)
        )
          throw new AppError("INVALID_STATE", 409);
        fields = {
          status: "return_received",
          return_received_at: now,
          pillow_returned: !!values.pillow,
          box_returned: !!values.box,
          billing_hold: true,
        };
        break;
      case "waive-box":
        fields = { box_requirement_waived: true };
        break;
      case "return-approve":
        if (
          t.status !== "return_received" ||
          !t.pillow_returned ||
          (!t.box_returned && !t.box_requirement_waived)
        )
          throw new AppError("RETURN_ITEMS_REQUIRED", 409);
        fields = {
          status: "return_accepted",
          return_review_status: "accepted",
          billing_hold: true,
          billing_hold_reason: "product_waived",
          next_retry_at: null,
        };
        message =
          "返品を承認しました。商品代13,480円の請求を免除します。当社からのカード請求はありません。";
        break;
      case "return-reject":
        if (
          t.status !== "return_received" ||
          !String(values.reason || "").trim() ||
          (t.pillow_returned && t.box_requirement_waived)
        )
          throw new AppError("INVALID_REJECTION", 409);
        fields = {
          status: "return_rejected",
          return_review_status: "rejected",
          return_reject_reason: values.reason,
          billing_hold: false,
          billing_hold_reason: null,
        };
        message = `返品は承認できませんでした。理由:${String(values.reason)}。商品は当社負担で再送します。案内した請求予定日以降に13,480円を請求します。`;
        break;
      case "redeliver":
        if (
          t.return_review_status !== "rejected" ||
          !String(values.tracking || "").trim()
        )
          throw new AppError("INVALID_STATE", 409);
        fields = { redelivery_tracking: values.tracking };
        message = "返品不成立の商品を当社負担で再送しました。";
        break;
      case "retry-payment":
        if (
          !["payment_failed", "collection_failed"].includes(t.status) ||
          t.charged_at
        )
          throw new AppError("INVALID_STATE", 409);
        fields = { status: "charge_due", next_retry_at: now };
        message = "登録済みカードで再請求を予定しています。";
        break;
      case "cancel":
        if (t.charged_at) throw new AppError("PAID_ORDER_REQUIRES_REFUND", 409);
        fields = {
          status: "cancelled",
          billing_hold: true,
          billing_hold_reason: "cancelled",
          next_retry_at: null,
        };
        message = "申込をキャンセルしました。商品代の請求はありません。";
        break;
    }
    const next = await update(tx, t, fields, actor, action);
    if (message)
      await enqueue(
        tx,
        next,
        message.startsWith("返品を承認")
          ? "返品を承認しました"
          : "申込状況のお知らせ",
        message,
        `${action}:${randomUUID()}`,
      );
    return { status: next.status };
  });
}
export async function returnDeadlines(db: Database, now = new Date()) {
  const rows = await db.query<{ id: string }>(
    `SELECT t.id FROM trial_orders t
     WHERE t.status IN ('return_requested','return_in_transit','return_received') AND (
       (t.status='return_requested' AND t.return_shipped_at IS NULL AND (
         t.grace_deadline<$1 OR
         (t.return_ship_deadline<$1 AND t.grace_notified_at IS NULL AND NOT EXISTS (
           SELECT 1 FROM email_outbox e WHERE e.dedupe_key=t.id::text||':返送期限超過・最終のご案内'
         )) OR
         (t.return_ship_deadline>=$1 AND t.return_ship_deadline<=$1+interval '1 day' AND NOT EXISTS (
           SELECT 1 FROM email_outbox e WHERE e.dedupe_key=t.id::text||':返送期限が近づいています'
         ))
       )) OR
       (COALESCE(t.return_received_at,t.return_delivered_at)<$1-interval '1 day' AND NOT EXISTS (
         SELECT 1 FROM email_outbox e WHERE e.dedupe_key=t.id::text||':review-alert:'||$2
       )) OR
       (t.status='return_in_transit' AND t.return_shipped_at<$1-interval '7 days' AND NOT EXISTS (
         SELECT 1 FROM email_outbox e WHERE e.dedupe_key=t.id::text||':transit-alert:'||$2
       ))
     ) ORDER BY t.updated_at,t.id LIMIT 300`,
    [now, now.toISOString().slice(0, 10)],
  );
  for (const { id } of rows.rows)
    await db.transaction(async (tx) => {
      const t = await load(tx, id, true);
      if (
        t.status === "return_requested" &&
        !t.return_shipped_at &&
        t.return_ship_deadline
      ) {
        if (now > t.return_ship_deadline && !t.grace_notified_at)
          await enqueue(
            tx,
            t,
            "返送期限超過・最終のご案内",
            "返送が確認できません。通知後24時間以内に返送情報を登録するか、発送済みの場合は窓口へご連絡ください。その後も確認できない場合は商品代の請求対象となります。",
          );
        else if (t.grace_deadline && now > t.grace_deadline)
          await update(
            tx,
            t,
            {
              status: "return_expired",
              return_review_status: "expired",
              billing_hold: false,
              billing_hold_reason: null,
            },
            "system",
            "return_expired",
          );
        else if (now >= addDays(t.return_ship_deadline, -1))
          await enqueue(
            tx,
            t,
            "返送期限が近づいています",
            "未発送の場合は、期限までに枕と箱を元払いで返送し、追跡番号を登録してください。",
          );
      }
      if (
        (t.return_received_at || t.return_delivered_at) &&
        now.getTime() -
          new Date(t.return_received_at || t.return_delivered_at!).getTime() >
          86400000
      )
        await enqueue(
          tx,
          t,
          "返品確認待ち",
          "到着済みの返品が24時間以上未処理です。管理画面で実物を確認してください。",
          `review-alert:${now.toISOString().slice(0, 10)}`,
          true,
        );
      if (
        t.status === "return_in_transit" &&
        t.return_shipped_at &&
        now > addDays(t.return_shipped_at, 7)
      )
        await enqueue(
          tx,
          t,
          "返送追跡の確認",
          "返送登録から7日以上経過しています。配送会社の追跡情報を確認してください。",
          `transit-alert:${now.toISOString().slice(0, 10)}`,
          true,
        );
    });
  return { checked: rows.rows.length };
}
export function customerView(t: Trial) {
  return {
    order_number: t.order_number,
    product_name: t.product_name,
    email: t.email,
    status: t.status,
    scheduled_charge_at: t.scheduled_charge_at,
    return_request_deadline: t.return_request_deadline,
    return_ship_deadline: t.return_ship_deadline,
    return_tracking_number: t.return_tracking_number,
    return_carrier: t.return_carrier,
    grace_deadline: t.grace_deadline,
    return_reject_reason: t.return_reject_reason,
    charged_at: t.charged_at,
    billing_hold: t.billing_hold || t.manual_hold,
    return_requested_at: t.return_requested_at,
  };
}
export function returnUrl(t: Trial) {
  return `/return/${publicToken(t.id)}`;
}
