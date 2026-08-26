import Image from "next/image";
import { PRODUCT_PRICE_JPY, PURCHASE_LINKS } from "@/lib/constants";

const priceLabel = "¥" + PRODUCT_PRICE_JPY.toLocaleString("ja-JP");

const options = [
  {
    key: "vertical",
    eyebrow: "BACK SLEEP",
    title: "仰向け中心",
    subtitle: "縦向きタイプ",
    description: "首と頭を安定させたい方へ。仰向けで眠る時間が長い方におすすめです。",
    image: "/makura/tate.png",
    href: PURCHASE_LINKS.vertical,
  },
  {
    key: "horizontal",
    eyebrow: "SIDE SLEEP",
    title: "横向き中心",
    subtitle: "横向きタイプ",
    description: "肩まわりまで支えたい方へ。横向きで眠る時間が長い方におすすめです。",
    image: "/makura/yoko.png",
    href: PURCHASE_LINKS.horizontal,
  },
] as const;

export default function PurchaseOptions() {
  return (
    <section className="purchase-section" id="purchase">
      <div className="purchase-inner">
        <div className="purchase-copy">
          <p className="eyebrow">CHOOSE YOUR PILLOW</p>
          <h2>あなたの寝姿勢に、<br /><em>合う向きから。</em></h2>
          <p>
            夢重力マクラは、向きを選んで購入できます。商品ページで内容をご確認のうえ、
            Squareの決済画面からお手続きください。
          </p>
          <div className="purchase-price">
            <span>ONE-TIME PURCHASE</span>
            <strong>{priceLabel}</strong>
            <small>税込・一回払い</small>
          </div>
        </div>

        <div className="purchase-options">
          {options.map((option) => (
            <article className="purchase-card" key={option.key}>
              <div className="purchase-card-image">
                <Image src={option.image} alt={option.subtitle + "の夢重力マクラ"} width={280} height={280} />
              </div>
              <div className="purchase-card-body">
                <p className="purchase-card-eyebrow">{option.eyebrow}</p>
                <h3>{option.title}<small>{option.subtitle}</small></h3>
                <p>{option.description}</p>
                <a className="button button-primary full-button" href={option.href} target="_blank" rel="noopener noreferrer">
                  Squareで購入 <span>{priceLabel} →</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
