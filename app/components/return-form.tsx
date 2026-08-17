"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function ReturnForm({ token, canReturn }: { token: string; canReturn: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ returnCode: string; returnUrl: string } | null>(null);

  async function requestReturn() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "返品申請に失敗しました。");
      setResult({ returnCode: data.returnCode, returnUrl: data.returnUrl });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "返品申請に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return <div className="return-result"><div><p className="eyebrow">RETURN REQUESTED</p><h3>返却申請を受け付けました。</h3><p>箱に枕を戻し、下のQRコードをコンビニまたはヤマトで提示してください。</p><strong className="return-code">{result.returnCode}</strong></div><div className="qr-box"><QRCodeSVG value={result.returnUrl} size={148} bgColor="#ffffff" fgColor="#17151d" /><small>返却受付ページ</small></div></div>;
  }

  return <div className="return-action"><div><h3>合わなかった場合</h3><p>期限内に返品申請を完了すれば、13,480円の請求は発生しません。</p></div><button className="button button-secondary" type="button" disabled={!canReturn || loading} onClick={requestReturn}>{loading ? "申請中…" : "返品する"}</button>{!canReturn && <p className="form-error">現在は返品申請を受け付けられない状態です。</p>}{error && <p className="form-error" role="alert">{error}</p>}</div>;
}
