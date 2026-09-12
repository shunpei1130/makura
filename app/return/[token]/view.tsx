"use client";
import { useState } from "react";
import {
  formatDate,
  STATUS_LABELS,
  type TrialStatus,
} from "@/lib/trials/model";
import { post } from "@/app/components/card-form";
type Order = {
  order_number: string;
  product_name: string;
  email: string;
  status: TrialStatus;
  scheduled_charge_at: string;
  return_request_deadline: string;
  return_ship_deadline: string | null;
  return_requested_at: string | null;
  return_carrier: string | null;
  return_tracking_number: string | null;
  grace_deadline: string | null;
  billing_hold: boolean;
  charged_at: string | null;
  return_reject_reason: string | null;
};
export default function OrderView({
  token,
  order: t,
}: {
  token: string;
  order: Order;
}) {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [requesting, setRequesting] = useState(false);
  async function action(path: string, data: unknown) {
    setBusy(true);
    try {
      await post(path, data);
      window.location.reload();
    } catch (e) {
      setMessage((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <>
      <p className="eyebrow">YOUR TRIAL</p>
      <h1>申込・返品の状況</h1>
      <section className="trial-summary">
        <h2>{t.order_number}</h2>
        <p>
          {t.product_name}
          <br />
          状態:{STATUS_LABELS[t.status]}
          <br />
          申込時のお支払い:0円
          <br />
          商品代:13,480円（税込）
          <br />
          {t.status === "cancelled" || t.status === "return_accepted"
            ? "商品代の請求はありません"
            : t.charged_at
              ? `決済完了:${formatDate(t.charged_at)}`
              : `請求予定:${formatDate(t.scheduled_charge_at)}`}
          <br />
          返品申請期限:{formatDate(t.return_request_deadline)}
          <br />
          登録メール:{t.email}
        </p>
        {t.billing_hold &&
          !["cancelled", "return_accepted"].includes(t.status) && (
            <p>
              <b>商品代の請求は保留中です。</b>
            </p>
          )}
        {t.status === "return_accepted" && (
          <p>
            返品が承認され、商品代の請求が免除されました。当社からのカード請求はありません。
          </p>
        )}
        <p>
          <strong>届いた箱は捨てずに保管してください。</strong>
        </p>
      </section>
      {!t.return_requested_at &&
        ["trial_active", "charge_due"].includes(t.status) && (
          <section>
            <h2>返品する</h2>
            <p>
              申請すると商品代の自動請求を保留します。枕と箱を申請後7日以内に元払いで返送してください。
            </p>
            {!requesting ? (
              <button onClick={() => setRequesting(true)}>
                返品申請をはじめる
              </button>
            ) : (
              <>
                <p>この申込の返品を申請します。</p>
                <button
                  disabled={busy}
                  onClick={() => action("/api/returns/request", { token })}
                >
                  返品申請を確定する
                </button>
                <button
                  className="secondary"
                  onClick={() => setRequesting(false)}
                >
                  戻る
                </button>
              </>
            )}
          </section>
        )}
      {t.return_requested_at &&
        !["cancelled", "return_accepted"].includes(t.status) && (
          <section>
            <h2>返送のご案内</h2>
            <p>
              返送期限:
              {t.return_ship_deadline && formatDate(t.return_ship_deadline)}
              {t.grace_deadline && (
                <> ／ 最終確認期限:{formatDate(t.grace_deadline)}</>
              )}
            </p>
            <p>
              〒273-0111
              <br />
              千葉県鎌ケ谷市北中沢2丁目12-39
              <br />
              長谷川 峻平（夢重力マクラ）
              <br />
              電話:090-9325-5945
            </p>
            <p>
              枕本体・お届け時の箱を、追跡できる配送方法で元払いにて返送してください。送料は配送会社へ直接お支払いください。申請番号のメモを同梱すると確認がスムーズです。
            </p>
            <p>
              登録追跡番号:{t.return_carrier}{" "}
              {t.return_tracking_number || "未登録"}
            </p>
            {["return_requested", "return_in_transit"].includes(t.status) && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const d = new FormData(e.currentTarget);
                  void action("/api/returns/tracking", {
                    token,
                    carrier: d.get("carrier"),
                    number: d.get("number"),
                  });
                }}
              >
                <label>
                  配送会社
                  <input
                    name="carrier"
                    required
                    defaultValue={t.return_carrier || ""}
                  />
                </label>
                <label>
                  追跡番号
                  <input
                    name="number"
                    required
                    pattern="[a-zA-Z0-9-]{6,50}"
                    defaultValue={t.return_tracking_number || ""}
                  />
                </label>
                <button disabled={busy}>発送済みの追跡情報を登録する</button>
              </form>
            )}
            {t.return_reject_reason && (
              <p>
                返品不成立の理由:{t.return_reject_reason}
                。商品は販売者負担で再送します。
              </p>
            )}
          </section>
        )}
      {["payment_failed", "collection_failed"].includes(t.status) && (
        <a className="button" href={`/payment/update/${token}`}>
          お支払いカードを更新する
        </a>
      )}
      <p role="alert">{message}</p>
      <p>
        返品申請だけでは商品代の免除は確定しません。販売者が枕と箱を受領・承認して確定します。返品送料を当社が追加でカード請求することはありません。
      </p>
    </>
  );
}
