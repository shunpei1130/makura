export const DAY = 86_400_000;
export const PRODUCT_PRICE = 13480;
export const CONSENT_VERSION = "2026-09-11-prepaid-return-v1";
export const PRODUCTS = {
  vertical: "仰向け中心・縦向きタイプ",
  horizontal: "横向き中心・横向きタイプ",
} as const;
export type ProductType = keyof typeof PRODUCTS;
export const STATUSES = [
  "trial_active",
  "return_requested",
  "return_in_transit",
  "return_received",
  "return_accepted",
  "return_expired",
  "return_rejected",
  "charge_due",
  "charge_processing",
  "paid",
  "payment_failed",
  "collection_failed",
  "cancelled",
] as const;
export type TrialStatus = (typeof STATUSES)[number];
export const STATUS_LABELS: Record<TrialStatus, string> = {
  trial_active: "お試し中",
  return_requested: "返品申請済み",
  return_in_transit: "返送中",
  return_received: "返品確認待ち",
  return_accepted: "返品承認・商品代免除",
  return_expired: "返送期限超過",
  return_rejected: "返品不成立",
  charge_due: "請求待ち",
  charge_processing: "決済結果確認中",
  paid: "お支払い済み",
  payment_failed: "決済失敗",
  collection_failed: "お支払い方法の確認が必要",
  cancelled: "キャンセル済み",
};
export interface Trial {
  id: string;
  order_number: string;
  public_token_hash: string;
  product_type: ProductType;
  product_name: string;
  amount_jpy: number;
  customer_name: string;
  email: string;
  phone: string;
  postal_code: string;
  address1: string;
  address2: string;
  square_customer_id: string;
  square_card_id: string;
  status: TrialStatus;
  trial_started_at: Date;
  return_request_deadline: Date;
  scheduled_charge_at: Date;
  return_requested_at: Date | null;
  return_ship_deadline: Date | null;
  return_tracking_number: string | null;
  return_carrier: string | null;
  return_shipped_at: Date | null;
  return_delivered_at: Date | null;
  return_received_at: Date | null;
  box_included: boolean;
  pillow_packed: boolean;
  guide_packed: boolean;
  shipped_at: Date | null;
  outbound_tracking: string | null;
  pillow_returned: boolean;
  box_returned: boolean;
  box_requirement_waived: boolean;
  return_review_status: string | null;
  return_reject_reason: string | null;
  return_rejection_notified_at: Date | null;
  redelivery_tracking: string | null;
  billing_hold: boolean;
  billing_hold_reason: string | null;
  manual_hold: boolean;
  square_payment_id: string | null;
  payment_status: string | null;
  charged_at: Date | null;
  retry_count: number;
  next_retry_at: Date | null;
  first_charge_at: Date | null;
  consent_version: string;
  consented_at: Date;
  created_at: Date;
  updated_at: Date;
  grace_notified_at: Date | null;
  grace_deadline: Date | null;
}
export const addDays = (d: Date, days: number) =>
  new Date(d.getTime() + days * DAY);
export function dates(start: Date) {
  const deadline = addDays(start, 30);
  return { start, deadline };
}
export function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(d));
}
export function canCharge(t: Trial, now: Date) {
  return (
    [
      "trial_active",
      "charge_due",
      "return_expired",
      "return_rejected",
      "payment_failed",
    ].includes(t.status) &&
    !t.billing_hold &&
    !t.manual_hold &&
    !t.charged_at &&
    t.scheduled_charge_at.getTime() < now.getTime() &&
    (!t.next_retry_at || t.next_retry_at <= now) &&
    (t.return_review_status !== "rejected" ||
      !!t.return_rejection_notified_at) &&
    (!t.return_requested_at ||
      ["expired", "rejected"].includes(t.return_review_status || ""))
  );
}
export function retryAt(first: Date, failedAttempt: number) {
  return [1, 3, 7][failedAttempt - 1] === undefined
    ? null
    : addDays(first, [1, 3, 7][failedAttempt - 1]);
}
export const CONSENT_TEXT =
  "本日のお支払いは0円です。返品しない場合、申込完了から30日後に13,480円（税込）が登録カードへ1回だけ自動請求されます。返品は期限内に申請し、申請から7日以内に枕本体とお届け時の箱を元払いで返送します。商品代の免除は販売者が受領・承認した時点で確定します。返品送料は配送会社へ直接支払い、販売者による返品送料のカード請求はありません。返品不成立時の商品代請求は案内した請求予定日以降です。これらと利用規約に同意し、Squareへのカード保存と後日の自動請求を承諾します。";
