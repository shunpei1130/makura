"use client";

import { useState } from "react";

export default function UpdatePaymentForm({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function updatePaymentMethod() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/payment-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "カード更新を開始できませんでした。");
      window.location.assign(data.checkoutUrl);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "カード更新に失敗しました。");
      setLoading(false);
    }
  }

  return <div className="return-action"><div><h3>カード情報を更新してください。</h3><p>更新後、次回の決済処理で再度確認します。</p></div><div><button className="button button-primary" type="button" onClick={updatePaymentMethod} disabled={loading}>{loading ? "Stripeへ移動中…" : "カードを更新する →"}</button>{error && <p className="form-error" role="alert">{error}</p>}</div></div>;
}
