"use client";
import { useState } from "react";
import Link from "next/link";
import {
  CONSENT_TEXT,
  CONSENT_VERSION,
  PRODUCTS,
  addDays,
  formatDate,
  type ProductType,
} from "@/lib/trials/model";
import TrialSummary from "@/app/components/trial-summary";
import { useCard, post, type CardConfig } from "@/app/components/card-form";
export default function CheckoutForm({
  type,
  config,
  enabled,
}: {
  type: ProductType;
  config: CardConfig | null;
  enabled: boolean;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    postalCode: "",
    address1: "",
    address2: "",
  });
  const [review, setReview] = useState(false),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [estimate, setEstimate] = useState("");
  const [key] = useState(() => crypto.randomUUID());
  const card = useCard(config);
  async function submit() {
    setBusy(true);
    setError("");
    try {
      const sourceId = await card.tokenize({
        givenName: form.name,
        email: form.email,
        phone: form.phone,
        addressLines: [form.address1, form.address2],
        postalCode: form.postalCode,
      });
      const r = await post("/api/checkout/start", {
        ...form,
        type,
        sourceId,
        key,
        consent,
        consentVersion: CONSENT_VERSION,
      });
      window.location.assign(r.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "申込を完了できませんでした。");
      setBusy(false);
    }
  }
  return (
    <>
      <h1>{review ? "注文内容の最終確認" : "0円で、30日試す"}</h1>
      <p>{PRODUCTS[type]}・1点</p>
      <TrialSummary />
      {!enabled && (
        <p className="notice" role="status">
          新規申込の受付準備中です。受付開始までお待ちください。
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!review) {
            setReview(true);
            setEstimate(formatDate(addDays(new Date(), 30)));
          } else void submit();
        }}
      >
        <fieldset disabled={busy}>
          <legend>お届け先</legend>
          {(
            Object.entries({
              name: "氏名",
              email: "メールアドレス",
              phone: "電話番号",
              postalCode: "郵便番号",
              address1: "都道府県・市区町村・番地",
              address2: "建物名・部屋番号",
            }) as [keyof typeof form, string][]
          ).map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                name={key}
                type={key === "email" ? "email" : "text"}
                autoComplete={
                  (
                    {
                      name: "name",
                      email: "email",
                      phone: "tel",
                      postalCode: "postal-code",
                      address1: "street-address",
                      address2: "address-line2",
                    } as const
                  )[key]
                }
                required={key !== "address2"}
                maxLength={key === "address1" ? 250 : 150}
                value={form[key]}
                readOnly={review}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((previous) => ({ ...previous, [key]: value }));
                }}
              />
            </label>
          ))}
        </fieldset>
        <section>
          <h2>お支払いに使うカード</h2>
          <p>
            Squareにカードを安全に登録します。本日の商品代決済はありません。
          </p>
          {card.element}
        </section>
        {review && (
          <section className="trial-summary">
            <h2>この内容で申込みを確定します</h2>
            <p>
              商品:{PRODUCTS[type]} × 1<br />
              本日:0円 ／ 商品代:13,480円（税込） ／ 往路送料:0円
              <br />
              請求予定・返品申請期限:{estimate}
              <br />
              <small>
                上記は目安です。申込完了時刻から30日後の日時を完了画面・メールに記載します。
              </small>
              <br />
              発送:原則7営業日以内
            </p>
            <p>
              返品条件:期限内申請、申請後7日以内に枕と箱を元払いで返送し、販売者の受領・承認で商品代免除。
            </p>
            <label className="consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
              />
              {CONSENT_TEXT}
            </label>
            <Link href="/terms" target="_blank">
              規約を確認する
            </Link>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setReview(false);
                setConsent(false);
              }}
            >
              入力内容を訂正する
            </button>
          </section>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button
          disabled={!enabled || !card.ready || busy || (review && !consent)}
        >
          {busy
            ? "登録を確認しています…"
            : review
              ? "本日0円で申し込む（30日後自動請求）"
              : "注文内容を確認する"}
        </button>
      </form>
    </>
  );
}
