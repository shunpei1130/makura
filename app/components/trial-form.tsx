"use client";

import { useState } from "react";

type TrialFormProps = { initialReferralCode?: string };

export default function TrialForm({ initialReferralCode = "" }: TrialFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [referralCode, setReferralCode] = useState(initialReferralCode);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/trials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, orientation, referralCode, consent }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "申込を開始できませんでした。");
      }

      if (!data.checkoutUrl) {
        throw new Error("Stripe CheckoutのURLを受け取れませんでした。");
      }

      window.location.assign(data.checkoutUrl);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "申込に失敗しました。");
      setLoading(false);
    }
  }

  return (
    <>
      <div className="trial-card">
        <div className="trial-card-heading"><span className="card-kicker">30-DAY HOME TRIAL</span><span className="zero-price">¥0</span></div>
        <h3>まず、寝てみる。</h3>
        <p>カード登録は必要ですが、今日のお支払いはありません。</p>
        <button className="button button-primary full-button" type="button" onClick={() => setOpen(true)}>0円で寝てみる <span>→</span></button>
        <div className="trial-card-foot"><span>✓ 30日間自宅で試せる</span><span>✓ 返却で課金なし</span></div>
      </div>

      {open && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
          <section className="trial-modal" role="dialog" aria-modal="true" aria-labelledby="trial-modal-title">
            <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="閉じる">×</button>
            <p className="eyebrow">STEP 1 / 2</p>
            <h2 id="trial-modal-title">30日間、<em>寝てみる。</em></h2>
            <p className="modal-intro">まず配送情報を入力してください。次の画面でStripeがカードを安全に登録します。</p>
            <form onSubmit={submit} className="trial-form">
              <label>お名前<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="夢重力 太郎" autoComplete="name" /></label>
              <label>メールアドレス<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
              <fieldset><legend>枕の向き</legend><div className="orientation-options"><label className={orientation === "vertical" ? "selected" : ""}><input type="radio" name="orientation" value="vertical" checked={orientation === "vertical"} onChange={() => setOrientation("vertical")} /><span>仰向け中心<small>低め・標準</small></span></label><label className={orientation === "horizontal" ? "selected" : ""}><input type="radio" name="orientation" value="horizontal" checked={orientation === "horizontal"} onChange={() => setOrientation("horizontal")} /><span>横向き中心<small>高め・サポート</small></span></label></div></fieldset>
              <label>紹介コード（任意）<input value={referralCode} onChange={(event) => setReferralCode(event.target.value)} placeholder="ref-xxxxxxxxxxxx" /></label>
              <label className="consent-row"><input required type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>30日以内に返却申請をしなかった場合、試用終了後に13,480円（税込）を一度だけ決済することに同意します。<small>決済の時期・金額・返却条件は<a href="/terms" target="_blank" rel="noreferrer">利用規約・返却条件</a>と最終確認画面に表示します。</small></span></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button-primary full-button" type="submit" disabled={loading}>{loading ? "Stripeへ移動中…" : "カード登録へ進む →"}</button>
              <p className="secure-note">🔒 カード情報はStripeが管理し、このサイトには保存されません。</p>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
