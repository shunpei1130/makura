import Image from "next/image";
import Link from "next/link";
import AiFitPrompt from "@/app/components/ai-fit-prompt";
import LegacyHero from "@/app/components/legacy-hero";
import PillowQuiz from "@/app/components/pillow-quiz";
import PurchaseOptions from "@/app/components/purchase-options";
import RefundPolicy from "@/app/components/refund-policy";
import WhyRefund from "@/app/components/why-refund";

const minimalFeatures = [
  {
    title: "沈みすぎない、押し返しすぎない",
    body: "新素材TPEゲルのハニカム構造が、頭と首にかかる圧力をまんべんなく受け止めます。",
  },
  {
    title: "朝まで涼しい、ムレない構造",
    body: "立体グリッドが空気の通り道をつくり、頭まわりの熱と蒸れを逃がし続けます。",
  },
  {
    title: "あなたの寝方に合わせて選べる",
    body: "仰向け派も横向き派も。主な寝姿勢に合ったタイプを選べます。",
  },
] as const;

const faqItems = [
  {
    q: "Q. 本当に返品・全額返金できますか？",
    a: "はい。購入日から30日以内に返品申請をいただければ、理由を問わず商品代金（13,480円）を全額返金いたします。"
  },
  {
    q: "Q. 最初に支払いは必要ですか？",
    a: "はい。購入時に13,480円（税込）をお支払いいただきます。30日以内のお試し後に万が一合わない場合は、商品代金を全額返金いたします。"
  },
  {
    q: "Q. どちらのタイプを選べばいいか分かりません。",
    a: "「自分のAIに聞く」または「3問の簡易診断」をご利用いただくことで、あなたにピッタリ合うタイプ（仰向け中心 / 横向き中心）を簡単に確認できます。"
  },
  {
    q: "Q. 30日以内に商品を返送しないといけませんか？",
    a: "いいえ。購入日から30日以内に「返品申請」を完了していただければ保証対象となります。商品の返送は申請後7日以内に行っていただければ問題ありません。"
  },
  {
    q: "Q. 返金はいつ・どのように行われますか？",
    a: "ご返送いただいた商品の到着・確認後、決済にご利用いただいたSquareを通じて速やかに全額返金手続きを行います。"
  }
];

export default function Home() {
  return (
    <main className="legacy-site">
      <header className="legacy-header">
        <Link href="#hero" className="legacy-brand" aria-label="夢重力マクラ ホーム">
          夢重力<span>マクラ</span>
        </Link>
        <nav className="legacy-nav" aria-label="メインナビゲーション">
          <Link href="#hero">ホーム</Link>
          <Link href="#why-refund">返金の理由</Link>
          <Link href="#features">特徴</Link>
          <Link href="#select-type">30日試す</Link>
          <Link href="#ai-fit">自分のAIに聞く</Link>
          <Link href="#pillow-quiz">簡易診断</Link>
          <Link href="#returns">返品ルール</Link>
          <Link href="#faq">FAQ</Link>
        </nav>
      </header>

      {/* 1. HERO (以前の無重力カルーセル構造を復元) */}
      <LegacyHero />

      {/* 2. なぜ30日以内なら返金するのか */}
      <WhyRefund />

      {/* 3. 商品の特徴 */}
      <section className="legacy-features" id="features" style={{ padding: "3rem 1rem" }}>
        <div className="legacy-section-inner">
          <div className="legacy-section-heading legacy-section-heading-center" style={{ marginBottom: "1.5rem" }}>
            <p className="legacy-kicker" style={{ color: "#ffd700" }}>WHY IT WORKS</p>
            <h2 style={{ fontSize: "1.6rem" }}>30日後も手放せない、3つの理由</h2>
          </div>

          {/* 横スクロールコンテナ（純粋なUIUXグラデーションフェード & Peek演出） */}
          <div className="scroll-container-mask">
            <div 
              className="horizontal-scroll-container" 
              style={{ 
                display: "flex", 
                gap: "1.2rem", 
                overflowX: "auto", 
                scrollSnapType: "x mandatory", 
                padding: "0.5rem 1.5rem 1.2rem 0.5rem",
                WebkitOverflowScrolling: "touch"
              }}
            >
              {minimalFeatures.map((feature, index) => (
                <article 
                  className="legacy-feature-card" 
                  key={feature.title} 
                  style={{ 
                    flex: "0 0 min(280px, 80vw)",
                    scrollSnapAlign: "start",
                    background: "rgba(255,255,255,0.04)", 
                    padding: "1.5rem", 
                    borderRadius: "16px", 
                    border: "1px solid rgba(255,255,255,0.1)",
                    minHeight: "auto"
                  }}
                >
                  <span style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#ffd700", display: "block", marginBottom: "0.4rem" }}>0{index + 1}</span>
                  <h3 style={{ fontSize: "1.15rem", margin: "0.4rem 0 0.6rem", color: "#fff" }}>{feature.title}</h3>
                  <p style={{ fontSize: "0.88rem", opacity: 0.9, lineHeight: 1.6 }}>{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. 2種類の商品選択 (スワイプ/タブ対応の購入導線) */}
      <PurchaseOptions />

      {/* 5. 迷った人だけ：自分のAIに聞く & 3問で簡易診断 */}
      <section className="legacy-ai-section" id="ai-fit" style={{ padding: "3rem 1rem" }}>
        <AiFitPrompt />
      </section>

      <PillowQuiz />

      {/* 6. 返金保証の具体的なルール */}
      <RefundPolicy />

      {/* 7. 最低限のFAQ (高コントラスト＆Aがはっきり見えるUI) */}
      <section className="legacy-faq" id="faq" style={{ padding: "3.5rem 1rem", background: "rgba(10,12,20,0.8)" }}>
        <div className="legacy-section-inner" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="legacy-section-heading legacy-section-heading-center" style={{ marginBottom: "2rem" }}>
            <p className="legacy-kicker" style={{ color: "#ffd700" }}>FAQ</p>
            <h2 style={{ color: "#ffffff", fontSize: "1.8rem" }}>よくある質問</h2>
          </div>

          <div className="legacy-faq-list" style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {faqItems.map((item, idx) => (
              <details 
                key={idx} 
                open={true}
                style={{ 
                  background: "#161b26", 
                  padding: "1.2rem 1.5rem", 
                  borderRadius: "14px", 
                  border: "1px solid rgba(255,215,0,0.35)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                }}
              >
                <summary style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#ffd700", cursor: "pointer", outline: "none", listStyle: "none" }}>
                  {item.q}
                </summary>
                <div style={{ marginTop: "0.8rem", paddingTop: "0.8rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <p style={{ color: "#ffffff", fontSize: "1rem", lineHeight: 1.7, margin: 0, fontWeight: "500" }}>
                    <strong style={{ color: "#ffd700", marginRight: "0.4rem" }}>A.</strong>
                    {item.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="legacy-footer">
        <div className="legacy-section-inner legacy-footer-inner">
          <div>
            <Link href="#hero" className="legacy-brand">夢重力<span>マクラ</span></Link>
            <p style={{ color: "#ffffff", opacity: 0.9 }}>合わなければ返金。それが、自信の証です。</p>
          </div>
          <Link href="#select-type" className="legacy-footer-link">30日試してみる →</Link>
        </div>
        <div className="legacy-section-inner legacy-footer-bottom">
          <span>© 夢重力マクラ</span>
          <span>ZERO GRAVITY SLEEP</span>
        </div>
      </footer>
    </main>
  );
}
