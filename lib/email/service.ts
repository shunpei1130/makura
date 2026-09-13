import { randomUUID } from "node:crypto";
import { Resend } from "resend";
import type { DB, Database } from "../db/client";
import {
  AppError,
  appUrl,
  publicToken,
  required,
  seal,
  unseal,
} from "../security";
import { formatDate, type Trial } from "../trials/model";
interface QueuedMail {
  id: string;
  trial_order_id: string;
  dedupe_key: string;
  kind: string;
  recipient: string;
  subject: string;
  body_encrypted: string;
}
export type MailSender = (mail: {
  id: string;
  to: string;
  subject: string;
  text: string;
}) => Promise<string>;
const deliver: MailSender = async (mail) => {
  const r = await new Resend(required("RESEND_API_KEY")).emails.send(
    {
      from: required("EMAIL_FROM"),
      replyTo: "s.hasegawa1130@gmail.com",
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
    },
    { idempotencyKey: mail.id },
  );
  if (r.error || !r.data?.id) throw new Error("EMAIL_PROVIDER_ERROR");
  return r.data.id;
};
export async function sendPreviewTestEmail(sender: MailSender = deliver) {
  if (
    process.env.VERCEL_ENV !== "preview" ||
    process.env.SQUARE_ENVIRONMENT !== "sandbox"
  )
    throw new AppError("NOT_FOUND", 404);
  const jstDate = new Date(Date.now() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  return sender({
    id: `makura-preview-email-test-${jstDate}`,
    to: "s.hasegawa1130@gmail.com",
    subject: "夢重力マクラ｜メール送信テスト（Preview）",
    text: "夢重力マクラのPreview環境から送信した管理者向けテストメールです。送信元とメール配信を確認するための通知で、実際の申込・注文・決済・発送は発生していません。",
  });
}
function obsolete(row: QueuedMail, t: Trial) {
  const key = row.dedupe_key.slice(t.id.length + 1);
  if (key.startsWith("reminder:"))
    return (
      !["trial_active", "charge_due"].includes(t.status) ||
      !key.endsWith(t.scheduled_charge_at.toISOString())
    );
  if (
    ["返送期限超過・最終のご案内", "返送期限が近づいています"].includes(
      row.kind,
    )
  )
    return t.status !== "return_requested" || !!t.return_shipped_at;
  if (key.startsWith("review-alert:"))
    return t.return_review_status !== "pending";
  if (key.startsWith("transit-alert:")) return t.status !== "return_in_transit";
  if (key.startsWith("payment_failed:"))
    return !["payment_failed", "collection_failed"].includes(t.status);
  return false;
}
export async function enqueue(
  tx: DB,
  t: Trial,
  kind: string,
  body: string,
  key = kind,
  admin = false,
) {
  const number = t.order_number;
  const url = `${appUrl()}/return/${publicToken(t.id)}`;
  const text = `夢重力マクラ｜申込番号 ${number}\n${t.product_name}\n\n${body}\n\n商品代:13,480円（税込）\n請求予定:${formatDate(t.scheduled_charge_at)}\n返品申請期限:${formatDate(t.return_request_deadline)}\n返品・申込状況:${url}\n\n届いた箱は30日間、期限延長時は延長期限まで保管してください。返品送料は元払いで配送会社へ直接お支払いください。返品承認時のカード請求はありません。\nお問い合わせ:s.hasegawa1130@gmail.com`;
  await tx.query(
    `INSERT INTO email_outbox (id,trial_order_id,dedupe_key,kind,recipient,subject,body_encrypted) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(dedupe_key) DO NOTHING`,
    [
      randomUUID(),
      t.id,
      `${t.id}:${key}`,
      kind,
      admin ? "s.hasegawa1130@gmail.com" : t.email,
      `夢重力マクラ｜${kind}`,
      seal(text),
    ],
  );
}
export async function sendOutbox(
  db: Database,
  limit = 20,
  sender: MailSender = deliver,
) {
  const ids = await db.query<{ id: string; trial_order_id: string }>(
    `SELECT id,trial_order_id FROM email_outbox WHERE sent_at IS NULL AND canceled_at IS NULL AND next_attempt_at<=now() ORDER BY created_at LIMIT $1`,
    [limit],
  );
  let sent = 0,
    failed = 0,
    canceled = 0;
  for (const { id, trial_order_id } of ids.rows)
    await db.transaction(async (tx) => {
      // Match the order -> outbox lock order used by every business transaction.
      const t = (
        await tx.query<Trial>(
          "SELECT * FROM trial_orders WHERE id=$1 FOR UPDATE",
          [trial_order_id],
        )
      ).rows[0];
      const { rows } = await tx.query<QueuedMail>(
        `SELECT * FROM email_outbox WHERE id=$1 AND sent_at IS NULL AND canceled_at IS NULL AND next_attempt_at<=now() FOR UPDATE SKIP LOCKED`,
        [id],
      );
      const row = rows[0];
      if (!row) return;
      if (!t || obsolete(row, t)) {
        await tx.query(
          "UPDATE email_outbox SET canceled_at=now() WHERE id=$1",
          [id],
        );
        canceled++;
        return;
      }
      try {
        const providerId = await sender({
          id: row.id,
          to: row.recipient,
          subject: row.subject,
          text: unseal(row.body_encrypted),
        });
        await tx.query(
          "UPDATE email_outbox SET sent_at=now(),provider_id=$2,last_error=NULL WHERE id=$1",
          [id, providerId],
        );
        if (row.kind === "返送期限超過・最終のご案内")
          await tx.query(
            `UPDATE trial_orders SET grace_notified_at=now(),grace_deadline=now()+interval '24 hours' WHERE id=$1 AND grace_notified_at IS NULL`,
            [row.trial_order_id],
          );
        if (row.dedupe_key.startsWith(`${t.id}:return-reject:`))
          await tx.query(
            "UPDATE trial_orders SET return_rejection_notified_at=now() WHERE id=$1 AND return_review_status='rejected'",
            [t.id],
          );
        sent++;
      } catch {
        await tx.query(
          `UPDATE email_outbox SET attempts=attempts+1,last_error='SEND_FAILED',next_attempt_at=now()+interval '1 hour' WHERE id=$1`,
          [id],
        );
        failed++;
      }
    });
  return { sent, failed, canceled };
}
