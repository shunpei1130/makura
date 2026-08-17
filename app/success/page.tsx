import Link from "next/link";

export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  return (
    <main className="success-page">
      <header className="simple-header"><Link href="/" className="brand">夢重力<span>マクラ</span></Link><Link href="/">トップへ戻る</Link></header>
      <section className="success-wrap">
        <div className="success-mark">✓</div>
        <p className="eyebrow">CARD SAVED / TRIAL STARTING</p>
        <h1>30日試眠の<br /><em>準備ができました。</em></h1>
        <p>カード登録が完了しました。Stripeからの通知を受け取り次第、試眠状態が有効になります。マイページで期限と返却方法を確認できます。</p>
        <div className="success-actions">
          {token ? <Link className="button button-primary" href={`/mypage/${token}`}>マイページを見る →</Link> : null}
          <Link className="button button-secondary" href="/">トップへ戻る</Link>
        </div>
      </section>
    </main>
  );
}
