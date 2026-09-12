import Link from "next/link";
export default function WhyRefund() {
  return (
    <section className="legacy-section" id="why-refund">
      <div
        className="legacy-section-inner"
        style={{ maxWidth: 800, padding: "3rem 1.5rem" }}
      >
        <p className="legacy-kicker">TRY AT HOME</p>
        <h2>使ってから、決めてください。</h2>
        <p>
          枕の使い心地は、自宅で眠って確かめるのがいちばん。本日の商品代は0円。気に入ったら、そのまま使い続けるだけです。
        </p>
        <p>
          返さなければ申込から30日後に13,480円を登録カードへ自動請求します。期限内に申請・返送し、当社が受領・承認すれば商品代は請求しません。返品送料はお客様負担です。
        </p>
        <Link href="/return">返品方法を先に見る →</Link>
      </div>
    </section>
  );
}
