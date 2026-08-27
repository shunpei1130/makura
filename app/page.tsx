import Image from "next/image";
import Link from "next/link";
import AiFitPrompt from "@/app/components/ai-fit-prompt";
import LegacyHero from "@/app/components/legacy-hero";
import PillowQuiz from "@/app/components/pillow-quiz";
import PurchaseOptions from "@/app/components/purchase-options";

const features = [
  {
    title: "一晩中涼しい",
    body: "ハニカムパターングリッドが空気の通り道をつくり、頭部の熱がこもりにくい構造です。",
  },
  {
    title: "圧力分散＋夢重力サポート",
    body: "TPEの柔らかさと弾力性で、頭や首にかかる圧力を分散しながら支えます。",
  },
  {
    title: "高さを使い分ける",
    body: "枕を180度回転させることで、2段階の高さに調整できます。",
  },
] as const;

export default function Home() {
  return (
    <main className="legacy-site">
      <header className="legacy-header">
        <Link href="#hero" className="legacy-brand" aria-label="夢重力マクラ ホーム">
          夢重力<span>マクラ</span>
        </Link>
        <nav className="legacy-nav" aria-label="メインナビゲーション">
          <Link href="/16.html">睡眠絶望診断</Link>
          <Link href="#hero">ホーム</Link>
          <Link href="#gallery">ギャラリー</Link>
          <Link href="#features">特徴</Link>
          <Link href="#about">私たちについて</Link>
          <Link href="#faq">FAQ</Link>
          <Link href="#ai-fit">ASK AI</Link>
        </nav>
      </header>

      <LegacyHero />

      <PillowQuiz />

      <section className="legacy-product-story" id="product">
        <div className="legacy-section-inner legacy-story-grid">
          <div className="legacy-story-panel">
            <p className="legacy-kicker">A NEW SLEEPING MATERIAL</p>
            <h2><strong>夢</strong>重力マクラは、<br />TPEゲル構造。</h2>
            <p>
              柔らかく衛生的な新素材TPEと、ハニカムパターンのグリッドを採用した新しい寝具素材です。
            </p>
          </div>
          <div className="legacy-story-image">
            <Image src="/makura/hani.png" alt="夢重力マクラのTPEハニカム構造" width={620} height={620} />
            <span>HONEYCOMB / TPE</span>
          </div>
          <div className="legacy-story-panel legacy-story-panel-wide">
            <p>
              従来のウレタンフォームやファイバーとは異なる圧力分散と、無重力のような寝心地を目指した構造。
              仰向けや横向きなど、さまざまな寝姿勢に合わせて使えます。
            </p>
          </div>
        </div>
      </section>

      <section className="legacy-features" id="features">
        <div className="legacy-section-inner">
          <div className="legacy-section-heading legacy-section-heading-center">
            <p className="legacy-kicker">WHY ZERO GRAVITY</p>
            <h2>夢重力マクラの特徴</h2>
          </div>
          <div className="legacy-feature-grid">
            {features.map((feature, index) => (
              <article className="legacy-feature-card" key={feature.title}>
                <span>0{index + 1}</span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="legacy-about" id="about">
        <div className="legacy-section-inner legacy-about-inner">
          <p className="legacy-kicker">ABOUT ZERO GRAVITY</p>
          <h2>眠りの時間を、<br /><em>もっと自由に。</em></h2>
          <p>
            夢重力マクラは、毎日の睡眠を少しでも心地よくするために開発されたマクラです。
            素材の弾力、空気の通り道、向きと高さの使い分け。自分の眠り方に合わせて、使い方を見つけてください。
          </p>
          <p>
            使用感や購入条件については、購入前にSquareの商品ページに表示される正式な案内をご確認ください。
          </p>
        </div>
      </section>

      <section className="legacy-faq" id="faq">
        <div className="legacy-section-inner">
          <div className="legacy-section-heading legacy-section-heading-center">
            <p className="legacy-kicker">QUESTIONS</p>
            <h2>よくある質問</h2>
          </div>
          <div className="legacy-faq-list">
            <details>
              <summary>夢重力マクラの素材は何ですか？</summary>
              <p>TPE（ゲル構造）とハニカムパターンのグリッドを採用しています。</p>
            </details>
            <details>
              <summary>枕の高さは調整できますか？</summary>
              <p>枕を180度回転させることで、2段階の高さを使い分けられます。</p>
            </details>
            <details>
              <summary>どちらの向きを選べばいいですか？</summary>
              <p>迷ったら、上のおすすめ枕診断で主な寝姿勢・高さ・反発力からお選びください。</p>
            </details>
            <details>
              <summary>配送や返品について知りたいです。</summary>
              <p>配送時期、送料、返品・交換条件などは、購入前にSquareの商品ページの正式な表示をご確認ください。</p>
            </details>
          </div>
        </div>
      </section>

      <PurchaseOptions />

      <section className="legacy-ai-section" id="ai-fit">
        <AiFitPrompt />
      </section>

      <footer className="legacy-footer">
        <div className="legacy-section-inner legacy-footer-inner">
          <div>
            <Link href="#hero" className="legacy-brand">夢重力<span>マクラ</span></Link>
            <p>一晩寝れば、分かる。</p>
          </div>
          <Link href="/16.html" className="legacy-footer-link">睡眠絶望診断を見る →</Link>
        </div>
        <div className="legacy-section-inner legacy-footer-bottom">
          <span>© 夢重力マクラ</span>
          <span>ZERO GRAVITY SLEEP</span>
        </div>
      </footer>
    </main>
  );
}
