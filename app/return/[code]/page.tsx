import Link from "next/link";

export default async function ReturnPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <main className="return-page">
      <header className="simple-header"><Link href="/" className="brand">夢重力<span>マクラ</span></Link><Link href="/">トップへ戻る</Link></header>
      <section className="return-page-wrap">
        <p className="eyebrow">RETURN PASS</p>
        <h1>箱に戻して、<br /><em>返すだけ。</em></h1>
        <p>下の受付番号を返送時に提示してください。枕を届いた箱へ戻し、コンビニまたはヤマトの窓口へお持ちください。</p>
        <div className="return-code">{code}</div>
        <div className="dashboard-panel" style={{ marginTop: 25 }}><h2>返却手順</h2><ol className="check-list"><li>枕を届いた箱へ戻す</li><li>受付番号を提示する</li><li>返送完了まで控えを保管する</li></ol><p className="dashboard-copy">返送先や送料負担などの最終条件は、申込時の最終確認画面および利用規約に表示します。</p></div>
      </section>
    </main>
  );
}
