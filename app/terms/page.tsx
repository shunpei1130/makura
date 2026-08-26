import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="dashboard-page">
      <header className="simple-header">
        <Link href="/" className="brand">夢重力<span>マクラ</span></Link>
        <Link href="/">トップへ戻る</Link>
      </header>
      <article className="return-page-wrap">
        <p className="eyebrow">PURCHASE GUIDE</p>
        <h1>購入前の<br /><em>ご案内</em></h1>
        <p>
          商品ページに表示される内容と、購入前の最終確認画面をご確認のうえ、お申し込みください。
          このページは購入導線の案内です。
        </p>
        <div className="dashboard-panel" style={{ marginTop: 28 }}>
          <h2>購入について</h2>
          <ol className="check-list">
            <li>夢重力マクラは、仰向け中心の縦向きタイプと、横向き中心の横向きタイプから選べます。</li>
            <li>販売価格は各タイプ13,480円（税込）の一回払いです。</li>
            <li>購入ボタンからSquareの商品ページへ移動し、商品内容と購入条件を確認して決済します。</li>
          </ol>
          <h2 style={{ marginTop: 32 }}>配送・返品について</h2>
          <p>
            配送時期、返品・交換条件、送料、販売事業者情報などは、購入前にSquareの商品ページおよび
            そこに表示される正式な案内をご確認ください。
          </p>
          <p style={{ marginTop: 18 }}>
            <Link href="/#purchase" className="ai-source-link">購入タイプを選ぶ →</Link>
          </p>
        </div>
      </article>
    </main>
  );
}
