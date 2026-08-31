"use client";

import { useState } from "react";

export default function RefundPolicy() {
  const [purchaseDate, setPurchaseDate] = useState("");
  const [deadlineInfo, setDeadlineInfo] = useState<{ applyDeadline: string; returnDeadline: string } | null>(null);

  function calculateDeadlines(dateStr: string) {
    if (!dateStr) return;
    const pDate = new Date(dateStr);
    if (isNaN(pDate.getTime())) return;

    const applyDate = new Date(pDate);
    applyDate.setDate(applyDate.getDate() + 30);

    const returnDate = new Date(applyDate);
    returnDate.setDate(returnDate.getDate() + 7);

    const formatDate = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

    setDeadlineInfo({
      applyDeadline: formatDate(applyDate),
      returnDeadline: formatDate(returnDate),
    });
  }

  return (
    <section className="refund-policy-section legacy-section" id="returns">
      <div className="legacy-section-inner" style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p className="legacy-kicker" style={{ color: "#ffd700" }}>30-DAY MONEY BACK GUARANTEE</p>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", margin: "0.5rem 0 1rem" }}>
            返品は、こんなに簡単です。
          </h2>
          <p style={{ opacity: 0.85, fontSize: "1rem", lineHeight: 1.6 }}>
            面倒な手続きはありません。購入から30日以内に申請するだけ。
          </p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "20px", padding: "2rem", marginBottom: "2.5rem" }}>
          <h3 style={{ fontSize: "1.2rem", color: "#ffd700", marginBottom: "1rem", textAlign: "center" }}>
            【重要】安心の返品・返送ルール
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 1.8, fontSize: "0.95rem" }}>
            <li style={{ marginBottom: "0.8rem", paddingLeft: "1.5rem", position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "#ffd700" }}>✓</span>
              <strong>返品申請期限：</strong>購入日から<strong>30日以内</strong>にフォームまたはメールで申請を完了してください。（※30日以内に商品が到着している必要はありません）
            </li>
            <li style={{ marginBottom: "0.8rem", paddingLeft: "1.5rem", position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "#ffd700" }}>✓</span>
              <strong>返送期限：</strong>返品申請完了日から<strong>7日以内</strong>に商品を発送・ご返送ください。
            </li>
            <li style={{ paddingLeft: "1.5rem", position: "relative" }}>
              <span style={{ position: "absolute", left: 0, color: "#ffd700" }}>✓</span>
              <strong>返金方法：</strong>商品の到着・確認後、Square決済を通じて商品代金（13,480円）を全額返金いたします。
            </li>
          </ul>
        </div>

        {/* 返送期限シミュレーター */}
        <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "1.8rem", textAlign: "center" }}>
          <h4 style={{ fontSize: "1.05rem", margin: "0 0 0.8rem", color: "#fff" }}>
            📅 あなたの返送期限を調べる
          </h4>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "1rem" }}>
            購入日を入力すると、具体的な返品申請・返送の最終期限が表示されます。
          </p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <input 
              type="date" 
              value={purchaseDate}
              onChange={(e) => {
                setPurchaseDate(e.target.value);
                calculateDeadlines(e.target.value);
              }}
              style={{
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                border: "1px solid #ffd700",
                background: "#1a1a2e",
                color: "#fff",
                fontSize: "0.95rem"
              }}
            />
          </div>

          {deadlineInfo && (
            <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(255,215,0,0.1)", border: "1px solid #ffd700", borderRadius: "12px", textAlign: "left" }}>
              <p style={{ margin: "0 0 0.4rem", fontSize: "0.95rem" }}>
                ・返品申請の最終期限：<strong style={{ color: "#ffd700" }}>{deadlineInfo.applyDeadline} まで</strong>
              </p>
              <p style={{ margin: 0, fontSize: "0.95rem" }}>
                ・申請後の返送最終期限：<strong style={{ color: "#ffd700" }}>{deadlineInfo.returnDeadline} まで</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
