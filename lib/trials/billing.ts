import { randomUUID } from "node:crypto";
import type { DB, Database } from "../db/client";
import {
  gateway,
  SquareError,
  type SquareGateway,
  type Payment,
} from "../square/client";
import { canCharge, retryAt, addDays, type Trial } from "./model";
import { load, update } from "./service";
import { enqueue } from "../email/service";
import { appUrl, publicToken } from "../security";
interface Attempt {
  id: string;
  attempt_number: number;
  idempotency_key: string;
  source_card_id: string;
  status: string;
  square_payment_id: string | null;
  created_at: Date;
}
export async function billingEnabled(db: DB) {
  if (process.env.AUTO_CHARGE_ENABLED !== "true") return false;
  const r = await db.query<{ enabled: boolean }>(
    "SELECT enabled FROM system_controls WHERE key='auto_charge_enabled'",
  );
  return r.rows[0]?.enabled === true;
}
const retryable = new Set([
  "CARD_DECLINED",
  "GENERIC_DECLINE",
  "INSUFFICIENT_FUNDS",
  "TEMPORARY_ERROR",
]);
async function applyPayment(
  tx: DB,
  t: Trial,
  a: Attempt,
  p: Payment,
  now: Date,
) {
  if (
    p.amount_money.amount !== 13480 ||
    p.amount_money.currency !== "JPY" ||
    p.reference_id !== t.id ||
    p.customer_id !== t.square_customer_id ||
    p.note !== `makura-attempt:${a.idempotency_key}`
  )
    throw new SquareError("PAYMENT_MISMATCH", true);
  if (["FAILED", "CANCELED"].includes(a.status) && p.status !== "COMPLETED")
    return "skipped";
  await tx.query(
    "UPDATE payment_attempts SET square_payment_id=$2,status=$3,updated_at=now() WHERE id=$1",
    [a.id, p.id, p.status],
  );
  if (p.status === "COMPLETED") {
    const next = await update(
      tx,
      t,
      {
        status: "paid",
        payment_status: p.status,
        square_payment_id: p.id,
        charged_at: now,
        next_retry_at: null,
      },
      "system",
      "payment_completed",
    );
    await enqueue(
      tx,
      next,
      "お支払いが完了しました",
      `13,480円（税込）のお支払いが完了しました。決済番号:${p.id}${p.receipt_url ? "\n領収書:" + p.receipt_url : ""}`,
      "payment_completed",
    );
    return "charged";
  }
  if (["FAILED", "CANCELED"].includes(p.status)) {
    if (["FAILED", "CANCELED"].includes(a.status)) return "skipped";
    const newer = await tx.query(
      "SELECT id FROM payment_attempts WHERE trial_order_id=$1 AND attempt_number>$2 LIMIT 1",
      [t.id, a.attempt_number],
    );
    if (newer.rows.length) return "skipped";
    await failed(tx, t, a, "CARD_DECLINED", now);
    return "failed";
  }
  await update(
    tx,
    t,
    {
      status: "charge_processing",
      payment_status: p.status,
      square_payment_id: p.id,
    },
    "system",
    "payment_pending",
  );
  return "pending";
}
async function failed(tx: DB, t: Trial, a: Attempt, code: string, now: Date) {
  const nextTime = retryable.has(code)
    ? retryAt(t.first_charge_at || now, a.attempt_number)
    : null;
  await tx.query(
    "UPDATE payment_attempts SET status='FAILED',error_code=$2,updated_at=now() WHERE id=$1",
    [a.id, code],
  );
  const next = await update(
    tx,
    t,
    {
      status: nextTime ? "payment_failed" : "collection_failed",
      payment_status: "FAILED",
      retry_count: a.attempt_number,
      next_retry_at: nextTime,
    },
    "system",
    "payment_failed",
  );
  await enqueue(
    tx,
    next,
    "お支払い方法をご確認ください",
    `商品代のお支払いを完了できませんでした。${nextTime ? "後日再試行します。" : "自動再試行を停止しました。"}カードの更新はこちら:${appUrl()}/payment/update/${publicToken(t.id)}`,
    `payment_failed:${a.id}`,
  );
}
export async function chargeOne(
  db: Database,
  id: string,
  api: SquareGateway = gateway,
  now = new Date(),
) {
  if (!(await billingEnabled(db))) return "disabled";
  // Commit the immutable request identity before making an external payment.
  const attempt = await db.transaction(async (tx) => {
    const t = await load(tx, id, true);
    if (
      t.charged_at ||
      ["paid", "cancelled", "return_accepted"].includes(t.status)
    )
      return null;
    const existing = (
      await tx.query<Attempt>(
        "SELECT * FROM payment_attempts WHERE trial_order_id=$1 AND status IN ('PREPARED','UNKNOWN','APPROVED','PENDING') ORDER BY attempt_number DESC LIMIT 1",
        [id],
      )
    ).rows[0];
    if (existing) return existing;
    if (!canCharge(t, now)) return null;
    const n = (
      await tx.query<{ n: number }>(
        "SELECT COALESCE(MAX(attempt_number),0)::int+1 as n FROM payment_attempts WHERE trial_order_id=$1",
        [id],
      )
    ).rows[0].n;
    const a: Attempt = {
      id: randomUUID(),
      attempt_number: n,
      idempotency_key: randomUUID(),
      source_card_id: t.square_card_id,
      status: "PREPARED",
      square_payment_id: null,
      created_at: now,
    };
    await tx.query(
      "INSERT INTO payment_attempts(id,trial_order_id,attempt_number,idempotency_key,source_card_id,amount_jpy,status) VALUES($1,$2,$3,$4,$5,13480,$6)",
      [a.id, id, n, a.idempotency_key, a.source_card_id, a.status],
    );
    await update(
      tx,
      t,
      {
        status: "charge_processing",
        first_charge_at: t.first_charge_at || now,
      },
      "system",
      "payment_prepared",
    );
    return a;
  });
  if (!attempt) return "skipped";
  return db.transaction(async (tx) => {
    const t = await load(tx, id, true);
    const a = (
      await tx.query<Attempt>(
        "SELECT * FROM payment_attempts WHERE id=$1 FOR UPDATE",
        [attempt.id],
      )
    ).rows[0];
    if (t.charged_at || ["COMPLETED", "FAILED", "CANCELED"].includes(a.status))
      return "skipped";
    if (!(await billingEnabled(tx))) return "disabled";
    if (
      a.status === "UNKNOWN" &&
      !a.square_payment_id &&
      (t.manual_hold || t.billing_hold)
    )
      return "pending";
    // PREPARED has never been sent. UNKNOWN is reconciled with the same key/body only.
    if (
      a.status === "PREPARED" &&
      (t.manual_hold ||
        t.billing_hold ||
        (t.return_requested_at &&
          !["expired", "rejected"].includes(t.return_review_status || "")))
    ) {
      await tx.query(
        "UPDATE payment_attempts SET status='CANCELED' WHERE id=$1",
        [a.id],
      );
      if (t.status === "charge_processing")
        await update(tx, t, { status: "charge_due" }, "system", "payment_held");
      return "skipped";
    }
    try {
      const p = a.square_payment_id
        ? await api.getPayment(a.square_payment_id)
        : await api.pay(
            a.idempotency_key,
            a.source_card_id,
            t.square_customer_id,
            t.id,
          );
      return await applyPayment(tx, t, a, p, now);
    } catch (e) {
      if (!(e instanceof SquareError) || e.uncertain) {
        await tx.query(
          "UPDATE payment_attempts SET status='UNKNOWN',error_code='RESULT_UNKNOWN',updated_at=now() WHERE id=$1",
          [a.id],
        );
        await tx.query("UPDATE trial_orders SET updated_at=now() WHERE id=$1", [
          t.id,
        ]);
        await enqueue(
          tx,
          t,
          "決済結果の確認が必要です",
          "Squareの決済結果を確認中です。別の決済や手動再請求を実施せず、同じ決済の照合を待ってください。",
          `unknown:${a.id}`,
          true,
        );
        return "pending";
      }
      await failed(tx, t, a, e.code, now);
      return "failed";
    }
  });
}
export async function chargeTrials(db: Database, now = new Date()) {
  if (!(await billingEnabled(db)))
    return {
      disabled: true,
      checked: 0,
      eligible: 0,
      charged: 0,
      failed: 0,
      skipped: 0,
    };
  const { rows } = await db.query<{ id: string }>(
    `SELECT id FROM trial_orders WHERE (scheduled_charge_at<$1 AND status IN ('trial_active','charge_due','return_expired','return_rejected','payment_failed') AND NOT billing_hold AND NOT manual_hold AND charged_at IS NULL AND (next_retry_at IS NULL OR next_retry_at<=$1) AND (return_review_status IS DISTINCT FROM 'rejected' OR return_rejection_notified_at IS NOT NULL) AND (return_requested_at IS NULL OR return_review_status IN ('expired','rejected'))) OR (status='charge_processing' AND (square_payment_id IS NOT NULL OR (NOT manual_hold AND NOT billing_hold))) ORDER BY updated_at,scheduled_charge_at LIMIT 20`,
    [now],
  );
  const counts = {
    checked: rows.length,
    eligible: 0,
    charged: 0,
    failed: 0,
    skipped: 0,
    pending: 0,
  };
  for (const { id } of rows) {
    try {
      const r = await chargeOne(db, id, gateway, now);
      if (["charged", "failed", "pending"].includes(r)) counts.eligible++;
      if (r === "charged") counts.charged++;
      else if (r === "failed") counts.failed++;
      else if (r === "pending") counts.pending++;
      else counts.skipped++;
    } catch {
      counts.failed++;
    }
  }
  console.info("charge_run", counts);
  return counts;
}
export async function reconcilePayment(
  db: Database,
  p: Payment,
  now = new Date(),
) {
  if (!p.reference_id) return;
  await db.transaction(async (tx) => {
    const found = (
      await tx.query<Trial>(
        "SELECT * FROM trial_orders WHERE id::text=$1 FOR UPDATE",
        [p.reference_id],
      )
    ).rows[0];
    if (!found || found.charged_at) return;
    const a = (
      await tx.query<Attempt>(
        `SELECT * FROM payment_attempts WHERE trial_order_id=$1 AND idempotency_key=$2 AND (square_payment_id=$3 OR square_payment_id IS NULL) FOR UPDATE`,
        [
          found.id,
          p.note?.startsWith("makura-attempt:") ? p.note.slice(15) : "",
          p.id,
        ],
      )
    ).rows[0];
    if (!a) return;
    await applyPayment(tx, found, a, p, now);
  });
}
export async function reminders(db: Database, now = new Date()) {
  const { rows } = await db.query<Trial>(
    `SELECT t.* FROM trial_orders t
     WHERE status IN ('trial_active','charge_due') AND scheduled_charge_at>$1 AND scheduled_charge_at<=$2
     AND EXISTS (
       SELECT 1 FROM (VALUES (7),(3)) AS w(days)
       WHERE t.scheduled_charge_at<=$1+w.days*interval '1 day' AND NOT EXISTS (
         SELECT 1 FROM email_outbox e
         WHERE e.dedupe_key=t.id::text||':reminder:'||w.days::text||':'||to_char(t.scheduled_charge_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
       )
     ) ORDER BY scheduled_charge_at,t.id LIMIT 300`,
    [now, addDays(now, 7)],
  );
  for (const t of rows)
    for (const days of [7, 3])
      if (now >= addDays(t.scheduled_charge_at, -days))
        await enqueue(
          db,
          t,
          "商品代の請求予定日が近づいています",
          "返品をご希望の場合は、期限までに専用ページから申請してください。",
          `reminder:${days}:${t.scheduled_charge_at.toISOString()}`,
        );
  return { checked: rows.length };
}
