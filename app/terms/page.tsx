import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="dashboard-page">
      <header className="simple-header"><Link href="/" className="brand">夢重力<span>マクラ</span></Link><Link href="/">トップへ戻る</Link></header>
      <article className="return-page-wrap">
        <p className="eyebrow">TERMS / RETURN POLICY</p>
        <h1>30日試眠の<br /><em>利用条件</em></h1>
        <p>以下は実装用の確認ページです。本番公開前に、販売事業者情報、返品送料、配送条件、決済失敗時の対応、特商法表記を確定した正式な規約へ差し替えてください。</p>
        <div className="dashboard-panel" style={{ marginTop: 28 }}>
          <h2>試眠と決済</h2>
          <ol className="check-list"><li>申込時の支払いは0円です。カード情報をStripeで登録します。</li><li>試用終了日までに返却申請が完了しなかった場合、13,480円（税込）を一度だけ決済します。</li><li>決済失敗時はメールで案内し、再決済またはカード更新の手続きを案内します。</li></ol>
          <h2 style={{ marginTop: 32 }}>返却</h2>
          <ol className="check-list"><li>届いた箱を返却に使用してください。</li><li>マイページから期限内に返却申請を行い、受付番号を取得してください。</li><li>返送先、送料負担、返品受付条件は本番運用開始前に確定して表示します。</li></ol>
        </div>
      </article>
    </main>
  );
}
