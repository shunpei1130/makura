import Image from "next/image";
import Link from "next/link";
import AiFitPrompt from "@/app/components/ai-fit-prompt";
import LegacyHero from "@/app/components/legacy-hero";
import PurchaseOptions from "@/app/components/purchase-options";

export default function Home() {
  return (
    <main className="legacy-site">
      <header className="topbar">
        <Link href="#hero" className="brand" aria-label="夢重力マクラ ホーム">
          夢重力<span>マクラ</span>
        </Link>
        <nav className="topnav" aria-label="メインナビゲーション">
          <Link href="#how-it-works">購入方法</Link>
          <Link href="#product">特徴</Link>
          <Link href="#ai-fit">AI相性チェック</Link>
          <Link href="#faq">FAQ</Link>
          <Link href="/16.html">睡眠診断</Link>
        </nav>
        <Link href="#purchase" className="nav-cta">
          13,480円で購入
        </Link>
      </header>

      <LegacyHero />

      <section className="promise-strip" aria-label="購入の流れ">
        <div>
          <span className="strip-number">01</span>
          <strong>寝姿勢で選ぶ</strong>
          <p>仰向け中心か、横向き中心か。合う向きから選べます。</p>
        </div>
        <div>
          <span className="strip-number">02</span>
          <strong>Squareで購入</strong>
          <p>商品ページの内容を確認して、そのまま決済できます。</p>
        </div>
        <div>
          <span className="strip-number">03</span>
          <strong>毎晩、使う</strong>
          <p>届いたその日から、あなたのベッドでお使いください。</p>
        </div>
      </section>

      <section className="section section-light" id="how-it-works">
        <div className="section-heading">
          <p className="eyebrow">HOW TO BUY</p>
          <h2>迷わず選んで、<br />すぐ使う。</h2>
          <p>
            枕は、実際に眠る場所で使ってこそ分かるもの。タイプを選び、
            商品ページで内容を確認して購入してください。
          </p>
        </div>
        <div className="steps-grid">
          <article className="step-card step-card-accent">
            <span>01</span>
            <h3>寝姿勢を選ぶ</h3>
            <p>仰向け中心なら縦向き、横向き中心なら横向きタイプを選びます。</p>
            <div className="step-icon">↗</div>
          </article>
          <article className="step-card">
            <span>02</span>
            <h3>商品ページを確認</h3>
            <p>商品内容と購入条件をSquareの商品ページで確認します。</p>
            <div className="step-icon">□</div>
          </article>
          <article className="step-card">
            <span>03</span>
            <h3>Squareで決済</h3>
            <p>選んだ商品の購入ボタンから、Squareの決済画面へ進みます。</p>
            <div className="step-icon">✦</div>
          </article>
          <article className="step-card step-card-dark">
            <span>04</span>
            <h3>いつものベッドへ</h3>
            <p>届いた夢重力マクラを、毎晩の睡眠に取り入れてください。</p>
            <div className="step-icon">♥</div>
          </article>
        </div>
      </section>

      <section className="section product-section" id="product">
        <div className="product-image-wrap">
          <Image src="/makura/hani.png" alt="夢重力マクラのハニカム構造" width={580} height={580} />
          <div className="image-caption">TPEハニカムグリッド</div>
        </div>
        <div className="product-copy">
          <p className="eyebrow">WHY YOU SHOULD SLEEP ON IT</p>
          <h2>枕は、<br /><em>一晩寝れば分かる。</em></h2>
          <p>
            頭の熱を逃がす通気性。首と肩に合わせて沈み、支える弾力。仰向けにも横向きにも対応する、
            180度回転の高さ設計。
          </p>
          <p>
            スペックを読むより、あなたの体に聞いてみてください。毎日のベッドで使うからこそ、
            分かることがあります。
          </p>
          <ul className="check-list">
            <li>頭部の熱がこもりにくいハニカム構造</li>
            <li>圧力を分散するTPE素材</li>
            <li>仰向け・横向きに合わせた2段階の高さ</li>
          </ul>
        </div>
      </section>

      <PurchaseOptions />

      <section className="section ai-section" id="ai-fit">
        <AiFitPrompt />
      </section>

      <section className="section faq-section" id="faq">
        <div className="section-heading compact-heading">
          <p className="eyebrow">QUESTIONS, ANSWERED</p>
          <h2>よくある質問</h2>
        </div>
        <div className="faq-grid">
          <details open>
            <summary>価格はいくらですか？</summary>
            <p>どちらのタイプも13,480円（税込）の一回払いです。購入ボタンからSquareの商品ページをご確認ください。</p>
          </details>
          <details>
            <summary>どちらのタイプを選べばいいですか？</summary>
            <p>仰向けで眠る時間が長い方は縦向き、横向きで眠る時間が長い方は横向きタイプを目安にしてください。</p>
          </details>
          <details>
            <summary>支払いはどこで行いますか？</summary>
            <p>購入ボタンからSquareが提供する決済ページへ移動します。商品内容と最終的な購入条件は決済前に表示されます。</p>
          </details>
          <details>
            <summary>配送や返品について知りたいです。</summary>
            <p>配送時期、返品・交換条件、送料などは購入前にSquareの商品ページと販売事業者の表示をご確認ください。</p>
          </details>
          <details>
            <summary>睡眠診断から購入できますか？</summary>
            <p><Link href="/16.html">睡眠タイプ診断</Link>の結果に合わせて、仰向け向け・横向き向けの商品ページへ進めます。</p>
          </details>
          <details>
            <summary>枕の特徴を詳しく知りたいです。</summary>
            <p>ハニカム構造、TPE素材、高さ設計の説明はこのページの特徴欄と、<Link href="/llms-full.txt">公式説明書</Link>をご覧ください。</p>
          </details>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <Link href="#hero" className="brand">夢重力<span>マクラ</span></Link>
          <p>一晩寝れば、分かる。</p>
          <Link href="/terms" className="footer-admin">購入前のご案内</Link>
        </div>
        <div className="footer-bottom"><span>© 夢重力マクラ</span><span>ONE-TIME PURCHASE</span></div>
      </footer>
    </main>
  );
}
