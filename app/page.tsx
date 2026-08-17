import Image from "next/image";
import Link from "next/link";
import TrialForm from "@/app/components/trial-form";
import AiFitPrompt from "@/app/components/ai-fit-prompt";

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string | string[]; checkout?: string | string[] }>;
}) {
  const params = await searchParams;
  const referralCode = stringParam(params.ref) || "";
  const checkoutCancelled = stringParam(params.checkout) === "cancelled";

  return (
    <main>
      <header className="topbar">
        <Link href="#hero" className="brand" aria-label="夢重力マクラ ホーム">
          夢重力<span>マクラ</span>
        </Link>
        <nav className="topnav" aria-label="メインナビゲーション">
          <Link href="#how-it-works">仕組み</Link>
          <Link href="#return">返却方法</Link>
          <Link href="#referral">友達紹介</Link>
          <Link href="#faq">FAQ</Link>
          <Link href="/16.html">睡眠診断</Link>
        </nav>
        <Link href="#trial" className="nav-cta">
          0円で試す
        </Link>
      </header>

      {checkoutCancelled && (
        <div className="notice-bar" role="status">
          申込はまだ完了していません。カード登録まで進めると、30日試眠が始まります。
        </div>
      )}

      <section className="hero-section" id="hero">
        <div className="hero-copy">
          <p className="eyebrow">30日試眠 / 今日のお支払い 0円</p>
          <h1>
            感動したら、<br />
            <em>返さないでください。</em>
          </h1>
          <p className="hero-lead">
            写真やレビューだけでは、枕のことは分からない。
            <br />
            だから、あなたのベッドで30日間寝てみてください。
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#trial">
              0円で寝てみる <span>→</span>
            </a>
            <span className="microcopy">カード登録のみ。申込時の請求はありません。</span>
          </div>
          <div className="hero-proof">
            <span>30日</span> 使って、気に入らなければ箱に戻して返すだけ。
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <div className="hero-image-frame">
            <Image
              src="/makura/tate.png"
              alt="夢重力マクラ"
              width={560}
              height={560}
              priority
              className="hero-pillow"
            />
          </div>
          <div className="floating-note floating-note-top">一晩寝れば、分かる。</div>
          <div className="floating-note floating-note-bottom">
            <strong>¥0</strong>
            <span>today</span>
          </div>
        </div>
      </section>

      <section className="promise-strip" aria-label="試眠の約束">
        <div>
          <span className="strip-number">01</span>
          <strong>先に、家へ届く</strong>
          <p>支払いの前に、いつものベッドで試せます。</p>
        </div>
        <div>
          <span className="strip-number">02</span>
          <strong>30日、普通に使う</strong>
          <p>特別なレビューや返却判断は必要ありません。</p>
        </div>
        <div>
          <span className="strip-number">03</span>
          <strong>気に入れば、何もしない</strong>
          <p>返却されなかった場合だけ、30日後に決済します。</p>
        </div>
      </section>

      <section className="section section-light" id="how-it-works">
        <div className="section-heading">
          <p className="eyebrow">HOW IT WORKS</p>
          <h2>「買う」を、<br />30日後に移動する。</h2>
          <p>
            夢重力マクラは、届いてからが本番です。毎晩使って、体が答えを出すまで待つ。
            そのための30日間です。
          </p>
        </div>
        <div className="steps-grid">
          <article className="step-card step-card-accent">
            <span>01</span>
            <h3>0円で申し込む</h3>
            <p>サイズを選び、カードを登録。今日の請求はありません。</p>
            <div className="step-icon">↗</div>
          </article>
          <article className="step-card">
            <span>02</span>
            <h3>箱ごと届く</h3>
            <p>箱は捨てないでください。合わなかったときの帰りのチケットです。</p>
            <div className="step-icon">□</div>
          </article>
          <article className="step-card">
            <span>03</span>
            <h3>30日間、寝る</h3>
            <p>いつものベッドで、いつものように。試すための特別なことは不要です。</p>
            <div className="step-icon">✦</div>
          </article>
          <article className="step-card step-card-dark">
            <span>04</span>
            <h3>気に入れば、返さない</h3>
            <p>返却がなければ、30日後に{`13,480円`}であなたのものになります。</p>
            <div className="step-icon">♥</div>
          </article>
        </div>
      </section>

      <section className="section product-section">
        <div className="product-image-wrap">
          <Image src="/makura/hani.png" alt="夢重力マクラのハニカム構造" width={580} height={580} />
          <div className="image-caption">TPEハニカムグリッド</div>
        </div>
        <div className="product-copy">
          <p className="eyebrow">WHY YOU SHOULD SLEEP ON IT</p>
          <h2>枕は、<br /><em>一晩寝れば分かる。</em></h2>
          <p>
            頭の熱を逃がす通気性。首と肩に合わせて沈み、支える弾力。仰向けにも横向きにも対応する、180度回転の高さ設計。
          </p>
          <p>
            スペックを読むより、あなたの体に聞いてみてください。30日間、家で使えるからこそ分かることがあります。
          </p>
          <ul className="check-list">
            <li>頭部の熱がこもりにくいハニカム構造</li>
            <li>圧力を分散するTPE素材</li>
            <li>仰向け・横向きに合わせた2段階の高さ</li>
          </ul>
        </div>
      </section>

      <section className="section ai-section" id="ai-fit">
        <AiFitPrompt />
      </section>

      <section className="section return-section" id="return">
        <div className="return-copy">
          <p className="eyebrow">THE BOX IS YOUR RETURN TICKET</p>
          <h2>合わなかったら、<br /><em>箱に戻すだけ。</em></h2>
          <p>
            箱は捨てないでください。マイページで「返品する」を押すと、返却用のQRコードと受付番号が表示されます。
          </p>
          <div className="return-note">
            <strong>この箱は捨てないでください。</strong>
            <span>合わなかったら、この箱が帰りのチケットです。</span>
          </div>
        </div>
        <div className="return-flow">
          <div className="return-flow-line" />
          <div className="return-step"><b>01</b><span>マイページで<br /><strong>「返品する」</strong></span></div>
          <div className="return-step"><b>02</b><span>QRコードと<br /><strong>受付番号を表示</strong></span></div>
          <div className="return-step"><b>03</b><span>コンビニ or ヤマトへ<br /><strong>持っていく</strong></span></div>
        </div>
      </section>

      <section className="section referral-section" id="referral">
        <div className="referral-badge">FRIEND PASS</div>
        <div className="referral-content">
          <div>
            <p className="eyebrow">SHARE THE SLEEP</p>
            <h2>友達にも、<br /><em>45日間の試眠を。</em></h2>
            <p>
              友達が3人、カード登録と発送申込まで完了すると、あなたの試用期間は30日延長。招待された友達は45日間使えます。
            </p>
          </div>
          <div className="referral-card">
            <div className="referral-card-top"><span>あなた</span><strong>+30日</strong></div>
            <div className="referral-card-mid"><span>友達 3人が申込完了</span><span className="referral-arrow">↓</span></div>
            <div className="referral-card-bottom"><span>招待された友達</span><strong>45日無料</strong></div>
            <p>リンクを送るだけ。クリックではなく、申込完了でカウントします。</p>
          </div>
        </div>
      </section>

      <section className="section timeline-section">
        <div className="section-heading compact-heading">
          <p className="eyebrow">YOUR TRIAL, AT A GLANCE</p>
          <h2>今どこにいるか、<br />いつでも分かる。</h2>
        </div>
        <div className="dashboard-preview">
          <div className="dashboard-header"><span>夢重力マクラ / マイページ</span><span className="live-dot">● 試用中</span></div>
          <div className="dashboard-body">
            <div className="dashboard-days"><strong>17</strong><span>残り日数</span></div>
            <div className="dashboard-progress"><div className="progress-label"><span>無料体験の進み具合</span><span>13 / 30日</span></div><div className="progress-bar"><span /></div><div className="progress-foot"><span>8月15日</span><strong>9月14日</strong></div></div>
            <div className="dashboard-charges"><div><span>返却期限</span><strong>9月14日まで</strong></div><div><span>返送しない場合</span><strong>9月15日に ¥13,480</strong></div></div>
          </div>
          <div className="dashboard-footer">気に入ったら、何もしなくて大丈夫です。</div>
        </div>
      </section>

      <section className="trial-section" id="trial">
        <div className="trial-inner">
          <div className="trial-copy">
            <p className="eyebrow">TRY IT AT HOME</p>
            <h2>今日のお支払い、<br /><em>0円。</em></h2>
            <p>30日間、あなたのベッドで試してください。カード登録は必要ですが、申込時には請求しません。</p>
            <div className="trial-price"><span>30日後</span><strong>¥13,480</strong><small>返却されなかった場合のみ</small></div>
          </div>
          <TrialForm initialReferralCode={referralCode} />
        </div>
      </section>

      <section className="section faq-section" id="faq">
        <div className="section-heading compact-heading">
          <p className="eyebrow">QUESTIONS, ANSWERED</p>
          <h2>よくある質問</h2>
        </div>
        <div className="faq-grid">
          <details open><summary>本当に申込時は0円ですか？</summary><p>はい。申込時はカード情報の登録のみで、請求はありません。返却されなかった場合のみ、試用終了後に13,480円を決済します。</p></details>
          <details><summary>30日後の決済を止めるには？</summary><p>期限までにマイページの「返品する」から返却申請を完了してください。申請が完了すると課金対象から外れます。</p></details>
          <details><summary>返却送料はかかりますか？</summary><p>返却条件と送料負担は申込時の最終確認画面に表示します。運用開始前に確定した条件をここへ反映します。</p></details>
          <details><summary>カード決済に失敗したら？</summary><p>決済失敗時はメールでお知らせし、マイページからカード情報を更新できる導線を用意します。自動で何度も請求し続けることはありません。</p></details>
          <details><summary>紹介は何をしたら成立しますか？</summary><p>紹介リンクを受け取った友達が、カード登録と発送申込まで完了した時点で1人としてカウントします。クリックだけでは成立しません。</p></details>
          <details><summary>返却した枕は新品として販売されますか？</summary><p>いいえ。返却品は洗浄・検品のうえ、無料体験専用のTRY在庫として管理します。新品販売在庫とは分けます。</p></details>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-main"><Link href="#hero" className="brand">夢重力<span>マクラ</span></Link><p>感動したら、返さないでください。</p><Link href="/admin" className="footer-admin">管理者ログイン</Link></div>
        <div className="footer-bottom"><span>© 夢重力マクラ</span><span>30日試眠型 D2C</span></div>
      </footer>
    </main>
  );
}
