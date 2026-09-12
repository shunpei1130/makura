import Link from "next/link";
export default function RefundPolicy() {
  return (
    <section className="refund-policy-section legacy-section" id="returns">
      <div
        className="legacy-section-inner"
        style={{ maxWidth: 800, padding: "3rem 1.5rem" }}
      >
        <p className="legacy-kicker">30-DAY TRIAL</p>
        <h2>返品は、こんなに簡単です。</h2>
        <ol style={{ lineHeight: 2 }}>
          <li>申込から30日以内にWebで返品申請</li>
          <li>申請から7日以内に枕本体と届いた箱を元払いで返送</li>
          <li>配送会社・追跡番号を登録</li>
          <li>販売者が受領・承認すると商品代13,480円を免除</li>
        </ol>
        <p>
          返品申請中は商品代の自動請求を一時保留します。返品送料は配送会社へ直接お支払いください。箱はお試し期間中保管してください。
        </p>
        <Link className="button button-primary" href="/return">
          返品申請をはじめる →
        </Link>
        <p>
          <Link href="/terms">返品条件を詳しく見る</Link>
        </p>
      </div>
    </section>
  );
}
