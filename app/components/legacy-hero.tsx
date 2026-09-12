"use client";

import Image from "next/image";
import { useState } from "react";

const slides = [
  {
    label: "仰向け中心・縦向きタイプ",
    image: "/makura/tate.png",
    detailImages: [
      "/makura/images/1.png",
      "/makura/images/2.png",
      "/makura/images/3.png",
    ],
    desc: "仰向けで寝ることが多い方向け。フィット感と頭部の納まりを追求。",
    price: "¥13,480",
    isSoldOut: false,
  },
  {
    label: "横向き中心・横向きタイプ",
    image: "/makura/yoko.png",
    detailImages: [
      "/makura/images/2.png",
      "/makura/images/3.png",
      "/makura/images/1.png",
    ],
    desc: "横向きで寝ることが多い方向け。肩口の圧力を逃がす設計。",
    price: "¥13,480",
    isSoldOut: false,
  },
  {
    label: "横向き専用モデル（購入のみ）",
    image: "/two_pillows.png",
    detailImages: [
      "/two_pillows.png",
      "/makura/images/1.png",
      "/makura/images/2.png",
    ],
    desc: "横向き寝に特化したスタンダードモデル（レンタル対象外・購入のみ）。現在大変ご好評につき完売（Sold Out）しております。",
    price: "¥24,000",
    isSoldOut: true,
  },
] as const;

export default function LegacyHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [detailIndex, setDetailIndex] = useState<number | null>(null);

  function moveSlide(direction: number) {
    setActiveIndex(
      (current) => (current + direction + slides.length) % slides.length,
    );
  }

  const activeSlide = detailIndex === null ? null : slides[detailIndex];
  const currentHeroSlide = slides[activeIndex];

  return (
    <>
      <section className="legacy-hero" id="hero">
        <div className="legacy-hero-stars" aria-hidden="true" />
        <div className="legacy-hero-center">
          <p className="legacy-kicker">ZERO GRAVITY SLEEP</p>
          <h1
            className="legacy-title"
            style={{
              fontSize: "clamp(1.8rem, 5vw, 3.2rem)",
              lineHeight: 1.35,
              letterSpacing: "-0.02em",
            }}
          >
            30日、0円で試してください。
            <br />
            <span style={{ color: "var(--accent, #ffd700)" }}>
              返品承認で、商品代は請求なし。
            </span>
          </h1>

          <div
            className="hero-subcopy-box"
            style={{
              margin: "1.2rem auto",
              maxWidth: "680px",
              color: "rgba(255,255,255,0.9)",
              fontSize: "1.05rem",
              lineHeight: 1.7,
            }}
          >
            <p>枕は「試す」のが一番早い。自宅のベッドで30日間。</p>
            <p
              style={{ opacity: 0.7, fontSize: "0.88rem", marginTop: "0.3rem" }}
            >
              商品価格13,480円（税込）／本日0円・カード登録のみ。返さなければ30日後に自動請求。返品送料はお客様負担です。
            </p>
          </div>

          {/* 無重力カルーセル構造 */}
          <div
            className="legacy-hero-visual"
            style={{
              margin: "2rem auto 1.5rem",
              position: "relative",
              minHeight: "340px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="legacy-carousel"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                width: "100%",
                maxWidth: "650px",
                position: "relative",
              }}
            >
              <button
                className="legacy-carousel-button legacy-carousel-prev"
                type="button"
                onClick={() => moveSlide(-1)}
                aria-label="前の枕を見る"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,215,0,0.4)",
                  color: "#ffd700",
                  fontSize: "2rem",
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  backdropFilter: "blur(4px)",
                }}
              >
                ‹
              </button>

              <div
                className="legacy-carousel-stage"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  width: "280px",
                  height: "260px",
                }}
              >
                {slides.map((slide, index) => {
                  const offset =
                    (index - activeIndex + slides.length) % slides.length;
                  const isActive = offset === 0;
                  const isVisible =
                    isActive || offset === 1 || offset === slides.length - 1;

                  if (!isVisible) return null;

                  return (
                    <button
                      key={slide.label}
                      type="button"
                      onClick={() =>
                        isActive ? setDetailIndex(index) : setActiveIndex(index)
                      }
                      style={{
                        position: "absolute",
                        background: isActive
                          ? "rgba(255,215,0,0.08)"
                          : "transparent",
                        border: isActive
                          ? "1px solid rgba(255,215,0,0.5)"
                          : "none",
                        borderRadius: "20px",
                        padding: "1rem",
                        cursor: "pointer",
                        opacity: isActive ? 1 : 0.4,
                        transform: isActive
                          ? "scale(1)"
                          : offset === 1
                            ? "translateX(70px) scale(0.75)"
                            : "translateX(-70px) scale(0.75)",
                        transition: "all 0.35s ease",
                        zIndex: isActive ? 5 : 2,
                        width: "240px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      {slide.isSoldOut && (
                        <span
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            background: "#ff4d4f",
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: "0.75rem",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "10px",
                            boxShadow: "0 2px 8px rgba(255,77,79,0.4)",
                          }}
                        >
                          SOLD OUT
                        </span>
                      )}

                      <Image
                        src={slide.image}
                        alt={slide.label}
                        width={200}
                        height={200}
                        style={{
                          objectFit: "contain",
                          filter: slide.isSoldOut ? "grayscale(40%)" : "none",
                        }}
                        priority={isActive}
                      />

                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: isActive ? "#ffd700" : "#fff",
                          marginTop: "0.5rem",
                          fontWeight: "bold",
                        }}
                      >
                        {slide.label}
                      </span>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: slide.isSoldOut ? "#ff7875" : "#ffd700",
                          marginTop: "0.2rem",
                          fontWeight: "bold",
                        }}
                      >
                        {slide.price} (税込){" "}
                        {slide.isSoldOut ? " [売り切れ]" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                className="legacy-carousel-button legacy-carousel-next"
                type="button"
                onClick={() => moveSlide(1)}
                aria-label="次の枕を見る"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,215,0,0.4)",
                  color: "#ffd700",
                  fontSize: "2rem",
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  backdropFilter: "blur(4px)",
                }}
              >
                ›
              </button>
            </div>

            {/* カルーセルインジケーター */}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              {slides.map((s, idx) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`スライド ${idx + 1}`}
                  style={{
                    width: idx === activeIndex ? "24px" : "8px",
                    height: "8px",
                    borderRadius: "4px",
                    background:
                      idx === activeIndex
                        ? s.isSoldOut
                          ? "#ff4d4f"
                          : "#ffd700"
                        : "rgba(255,255,255,0.3)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.25s",
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            {currentHeroSlide.isSoldOut ? (
              <button
                className="legacy-scroll-cta mobile-full-width"
                disabled
                style={{
                  fontSize: "1.2rem",
                  padding: "1rem 2.5rem",
                  fontWeight: "bold",
                  background: "#555",
                  color: "#ccc",
                  borderRadius: "50px",
                  border: "none",
                  cursor: "not-allowed",
                  display: "inline-block",
                  textAlign: "center",
                  boxSizing: "border-box",
                }}
              >
                SOLD OUT（現在入荷待ち）
              </button>
            ) : (
              <a
                className="legacy-scroll-cta mobile-full-width"
                href="#select-type"
                style={{
                  fontSize: "1.2rem",
                  padding: "1rem 2.5rem",
                  fontWeight: "bold",
                  background:
                    "linear-gradient(135deg, #ffd700 0%, #ffa500 100%)",
                  color: "#111",
                  borderRadius: "50px",
                  textDecoration: "none",
                  boxShadow: "0 8px 24px rgba(255,215,0,0.3)",
                  display: "inline-block",
                  textAlign: "center",
                  boxSizing: "border-box",
                }}
              >
                30日試してみる →
              </a>
            )}
          </div>

          <div className="hero-price-tag" style={{ color: "#fff" }}>
            <span
              style={{
                fontSize: "1.6rem",
                fontWeight: "bold",
                color: currentHeroSlide.isSoldOut ? "#ff7875" : "#ffd700",
              }}
            >
              {currentHeroSlide.price}
            </span>{" "}
            <small style={{ opacity: 0.8 }}>(税込)</small>
            {currentHeroSlide.isSoldOut ? (
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#ff7875",
                  marginTop: "0.4rem",
                  fontWeight: "bold",
                }}
              >
                ※このモデルは購入専用です（レンタル無し・現在Sold Out）
              </div>
            ) : (
              <div
                style={{
                  fontSize: "0.85rem",
                  opacity: 0.75,
                  marginTop: "0.4rem",
                }}
              >
                ※本日0円。返品が成立しない場合、申込から30日後に13,480円を自動請求。
                <br />
                ※30日以内に申請、7日以内に枕と箱を元払い返送。当社の受領・承認で商品代免除。
              </div>
            )}
          </div>
        </div>
        <div className="legacy-hero-glow" aria-hidden="true" />
      </section>

      {/* 横スライド型ギャラリーセクション */}
      <section className="legacy-gallery-section" id="gallery">
        <div className="legacy-section-inner">
          <p
            className="legacy-kicker"
            style={{ color: "#ffd700", textAlign: "center" }}
          >
            GALLERY & DETAILS
          </p>
          <h2
            style={{
              textAlign: "center",
              color: "#fff",
              marginBottom: "1.5rem",
              fontSize: "1.6rem",
            }}
          >
            商品ラインナップ
          </h2>

          <div className="scroll-container-mask">
            <div
              className="horizontal-scroll-container"
              style={{
                display: "flex",
                gap: "1.2rem",
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                padding: "0.5rem 1.5rem 1.2rem 0.5rem",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <article
                className="legacy-gallery-intro-card"
                style={{
                  flex: "0 0 min(260px, 75vw)",
                  scrollSnapAlign: "start",
                  minHeight: "320px",
                  borderRadius: "16px",
                }}
              >
                <p className="legacy-kicker">DREAM WEIGHT</p>
                <h2>
                  夢重力
                  <br />
                  マクラ
                </h2>
                <p>
                  説明を読むより、
                  <br />
                  実際に30日試してください。
                </p>
                <a className="legacy-gold-link" href="#select-type">
                  商品を選択して試す →
                </a>
              </article>

              {slides.map((slide, index) => (
                <button
                  className="legacy-gallery-card"
                  key={slide.label}
                  type="button"
                  onClick={() => setDetailIndex(index)}
                  aria-label={`${slide.label}の詳細を見る`}
                  style={{
                    flex: "0 0 min(250px, 75vw)",
                    scrollSnapAlign: "start",
                    minHeight: "320px",
                    borderRadius: "16px",
                    position: "relative",
                  }}
                >
                  {slide.isSoldOut && (
                    <span
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "#ff4d4f",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "0.7rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "8px",
                        zIndex: 10,
                      }}
                    >
                      SOLD OUT
                    </span>
                  )}
                  <span
                    className="legacy-gallery-card-glow"
                    aria-hidden="true"
                  />
                  <span className="legacy-gallery-card-label">
                    {slide.label}
                  </span>
                  <Image
                    src={slide.image}
                    alt={slide.label}
                    width={240}
                    height={240}
                    style={{
                      filter: slide.isSoldOut ? "grayscale(40%)" : "none",
                    }}
                  />
                  <span className="legacy-gallery-card-link">
                    {slide.price} - 詳細を見る ↗
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {activeSlide && (
        <div
          className="legacy-gallery-modal"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setDetailIndex(null)
          }
        >
          <div
            className="legacy-gallery-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="枕の詳細画像"
          >
            <button
              className="legacy-gallery-close"
              type="button"
              onClick={() => setDetailIndex(null)}
              aria-label="詳細画像を閉じる"
            >
              ×
            </button>
            <p className="legacy-kicker">DETAIL GALLERY</p>
            <h2>
              {activeSlide.label} {activeSlide.isSoldOut ? "(SOLD OUT)" : ""}
            </h2>
            <p
              style={{
                marginBottom: "0.5rem",
                color: activeSlide.isSoldOut ? "#ff7875" : "#ffd700",
                fontWeight: "bold",
              }}
            >
              価格: {activeSlide.price} (税込){" "}
              {activeSlide.isSoldOut ? "【購入のみ・現在売り切れ】" : ""}
            </p>
            <p style={{ marginBottom: "1rem", opacity: 0.8 }}>
              {activeSlide.desc}
            </p>
            <div className="legacy-gallery-grid">
              {activeSlide.detailImages.map((src) => (
                <Image
                  key={src}
                  src={src}
                  alt={`${activeSlide.label}の詳細`}
                  width={420}
                  height={420}
                />
              ))}
            </div>

            {activeSlide.isSoldOut ? (
              <button
                className="legacy-cta"
                disabled
                style={{
                  background: "#555",
                  color: "#ccc",
                  cursor: "not-allowed",
                }}
              >
                SOLD OUT (入荷待ち)
              </button>
            ) : (
              <a
                className="legacy-cta"
                href="#select-type"
                onClick={() => setDetailIndex(null)}
              >
                0円で30日試す <span>→</span>
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
