"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { PRODUCT_PRICE_JPY, CHECKOUT_LINKS } from "@/lib/constants";

const priceLabel = "¥" + PRODUCT_PRICE_JPY.toLocaleString("ja-JP");

const options = [
  {
    key: "vertical",
    eyebrow: "BACK SLEEP TYPE",
    title: "仰向け中心・縦向きタイプ",
    target: "仰向けで寝ることが多い人向け",
    description:
      "首と頭をしっかり包み込み、理想のS字カーブをキープ。仰向け時の圧力を均一に分散します。",
    image: "/makura/tate.png",
    href: CHECKOUT_LINKS.vertical,
  },
  {
    key: "horizontal",
    eyebrow: "SIDE SLEEP TYPE",
    title: "横向き中心・横向きタイプ",
    target: "横向きで寝ることが多い人向け",
    description:
      "肩幅の高さをしっかり支え、寝返り時の肩口の圧迫感を軽減。両サイドのフィット感が快適です。",
    image: "/makura/yoko.png",
    href: CHECKOUT_LINKS.horizontal,
  },
] as const;

export default function PurchaseOptions() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  function handleTabClick(index: number) {
    setActiveTab(index);
    cardRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }

  return (
    <section
      className="purchase-section"
      id="select-type"
      style={{
        padding: "3rem 1rem",
        background: "rgba(255,255,255,0.02)",
        overflow: "hidden",
      }}
    >
      <div
        className="purchase-inner"
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
          minWidth: 0,
          display: "block",
        }}
      >
        <div
          className="purchase-copy"
          style={{ textAlign: "center", marginBottom: "2rem" }}
        >
          <p
            className="eyebrow"
            style={{
              color: "#ffd700",
              letterSpacing: "0.15em",
              fontSize: "0.85rem",
            }}
          >
            SELECT YOUR TYPE
          </p>
          <h2
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              margin: "0.4rem 0 0.8rem",
            }}
          >
            あなたは、仰向け派？横向き派？
          </h2>
          <p style={{ opacity: 0.85, fontSize: "0.95rem" }}>
            どちらも本日0円。返さなければ30日後13,480円。返品は期限内の申請・返送と当社の承認が必要です。
          </p>
        </div>

        {/* タブ切り替えボタン */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          {options.map((opt, idx) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleTabClick(idx)}
              style={{
                padding: "0.6rem 1.2rem",
                borderRadius: "20px",
                border:
                  idx === activeTab
                    ? "1px solid #ffd700"
                    : "1px solid rgba(255,255,255,0.2)",
                background:
                  idx === activeTab
                    ? "rgba(255,215,0,0.15)"
                    : "rgba(255,255,255,0.04)",
                color: idx === activeTab ? "#ffd700" : "#fff",
                fontWeight: "bold",
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.25s",
              }}
            >
              {idx === 0 ? "仰向け中心" : "横向き中心"}
            </button>
          ))}
        </div>

        {/* 横スライド形式カード領域 (他のセクション同様にスムーズ横スワイプ可能) */}
        <div
          className="scroll-container-mask"
          style={{ width: "100%", minWidth: 0 }}
        >
          <div
            className="horizontal-scroll-container"
            style={{
              display: "flex",
              gap: "1.2rem",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              padding: "0.5rem 1.5rem 1.2rem 0.5rem",
              WebkitOverflowScrolling: "touch",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {options.map((option, idx) => (
              <article
                className="purchase-card"
                key={option.key}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                style={{
                  flex: "0 0 min(280px, 78vw)",
                  scrollSnapAlign: "start",
                  background:
                    idx === activeTab
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(255,255,255,0.03)",
                  border:
                    idx === activeTab
                      ? "2px solid #ffd700"
                      : "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "20px",
                  padding: "1.5rem 1.2rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  position: "relative",
                  transition: "border 0.3s, background 0.3s",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "0.8rem",
                    right: "0.8rem",
                    background: "rgba(255,215,0,0.15)",
                    border: "1px solid #ffd700",
                    color: "#ffd700",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                  }}
                >
                  本日0円・30日お試し
                </div>

                <div
                  className="purchase-card-image"
                  style={{ margin: "1.2rem 0 0.8rem" }}
                >
                  <Image
                    src={option.image}
                    alt={option.title}
                    width={200}
                    height={200}
                    style={{ objectFit: "contain" }}
                  />
                </div>

                <div className="purchase-card-body" style={{ width: "100%" }}>
                  <p
                    className="purchase-card-eyebrow"
                    style={{
                      fontSize: "0.75rem",
                      color: "#ffd700",
                      opacity: 0.9,
                    }}
                  >
                    {option.eyebrow}
                  </p>
                  <h3
                    style={{ fontSize: "1.25rem", margin: "0.2rem 0 0.4rem" }}
                  >
                    {option.title}
                  </h3>
                  <p
                    style={{
                      fontWeight: "bold",
                      color: "#fff",
                      marginBottom: "0.6rem",
                      fontSize: "0.88rem",
                    }}
                  >
                    {option.target}
                  </p>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      opacity: 0.8,
                      lineHeight: 1.5,
                      marginBottom: "1.2rem",
                    }}
                  >
                    {option.description}
                  </p>

                  <div
                    style={{
                      marginBottom: "1rem",
                      fontSize: "1.4rem",
                      fontWeight: "bold",
                      color: "#ffd700",
                    }}
                  >
                    本日0円 ／ 30日後{priceLabel}{" "}
                    <small
                      style={{
                        fontSize: "0.75rem",
                        color: "#fff",
                        opacity: 0.7,
                      }}
                    >
                      (税込)
                    </small>
                  </div>

                  <a
                    className="button button-primary full-button mobile-full-width"
                    href={option.href}

                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "0.85rem 1rem",
                      background:
                        "linear-gradient(135deg, #ffd700 0%, #ffa500 100%)",
                      color: "#111",
                      fontWeight: "bold",
                      borderRadius: "30px",
                      textDecoration: "none",
                      boxShadow: "0 4px 15px rgba(255,215,0,0.2)",
                      boxSizing: "border-box",
                    }}
                  >
                    0円で30日試す →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* どっちか分からない？ 分岐セクション */}
        <div
          className="dont-know-box"
          style={{
            marginTop: "2rem",
            padding: "1.5rem 1rem",
            background: "rgba(255,255,255,0.03)",
            border: "1px dashed rgba(255,215,0,0.4)",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              color: "#ffd700",
              marginBottom: "0.4rem",
            }}
          >
            どっちか分からない？
          </h3>
          <p
            style={{ opacity: 0.85, marginBottom: "1rem", fontSize: "0.85rem" }}
          >
            自分にどちらが合うか迷った方は、お好みの方法で確認できます。
          </p>
          <div
            className="dont-know-buttons"
            style={{
              display: "flex",
              gap: "0.8rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="#ai-fit"
              className="button"
              style={{
                padding: "0.7rem 1.2rem",
                borderRadius: "30px",
                border: "1px solid #ffd700",
                color: "#ffd700",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: "bold",
                background: "rgba(255,215,0,0.05)",
              }}
            >
              🤖 自分のAIに聞く →
            </a>
            <a
              href="#pillow-quiz"
              className="button"
              style={{
                padding: "0.7rem 1.2rem",
                borderRadius: "30px",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.9rem",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              📋 3问で簡易診断する →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
