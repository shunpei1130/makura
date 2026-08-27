"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    label: "夢重力マクラ 横向き",
    image: "/makura/yoko.png",
    detailImages: ["/makura/images/1.png", "/makura/images/2.png", "/makura/images/3.png"],
  },
  {
    label: "夢重力マクラ 縦向き",
    image: "/makura/tate.png",
    detailImages: ["/makura/images/2.png", "/makura/images/3.png", "/makura/images/1.png"],
  },
] as const;

const typeLines = [
  { top: "無重力マクラ", bottom: "一般的な普通の枕" },
  { top: "夢重力マクラ", bottom: "夢の中で無重力体験を" },
] as const;

export default function LegacyHero() {
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [typedTop, setTypedTop] = useState("");
  const [typedBottom, setTypedBottom] = useState("");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setTypedTop(typeLines[1].top);
      setTypedBottom(typeLines[1].bottom);
      return;
    }

    let lineIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let pause = 0;

    const timer = window.setInterval(() => {
      const line = typeLines[lineIndex];
      const length = Math.max(line.top.length, line.bottom.length);

      if (pause > 0) {
        pause -= 1;
        return;
      }

      if (!deleting) {
        characterIndex += 1;
        setTypedTop(line.top.slice(0, characterIndex));
        setTypedBottom(line.bottom.slice(0, characterIndex));
        if (characterIndex >= length) {
          pause = 16;
          deleting = true;
        }
        return;
      }

      characterIndex -= 1;
      setTypedTop(line.top.slice(0, Math.max(characterIndex, 0)));
      setTypedBottom(line.bottom.slice(0, Math.max(characterIndex, 0)));
      if (characterIndex <= 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % typeLines.length;
      }
    }, 105);

    return () => window.clearInterval(timer);
  }, []);

  const activeSlide = detailIndex === null ? null : slides[detailIndex];

  return (
    <>
      <section className="legacy-hero" id="hero">
        <div className="legacy-hero-stars" aria-hidden="true" />
        <div className="legacy-hero-center">
          <p className="legacy-kicker">ZERO GRAVITY SLEEP</p>
          <h1 className="legacy-title" aria-live="polite">
            <span>{typedTop}</span>
            <i className="legacy-cursor" aria-hidden="true" />
            <small>{typedBottom}</small>
          </h1>
          <p className="legacy-hero-copyline">TPEハニカム構造で、眠りを軽く。</p>
          <a className="legacy-scroll-cta" href="#recommendedPillow">
            あなたは縦横どちら？ <span>↓</span>
          </a>
        </div>
        <div className="legacy-hero-glow" aria-hidden="true" />
      </section>

      <section className="legacy-gallery-section" id="gallery">
        <div className="legacy-section-inner">
          <div className="legacy-gallery-cards">
            <article className="legacy-gallery-intro-card">
              <p className="legacy-kicker">DREAM WEIGHT</p>
              <h2>夢重力<br />マクラ</h2>
              <p>触ってみてほしい。<br />いや、一晩寝てみてほしい。</p>
              <a className="legacy-gold-link" href="#recommendedPillow">おすすめを診断する →</a>
            </article>

            {slides.map((slide, index) => (
              <button
                className="legacy-gallery-card"
                key={slide.label}
                type="button"
                onClick={() => setDetailIndex(index)}
                aria-label={`${slide.label}の詳細を見る`}
              >
                <span className="legacy-gallery-card-glow" aria-hidden="true" />
                <span className="legacy-gallery-card-label">{slide.label}</span>
                <Image src={slide.image} alt={slide.label} width={420} height={420} />
                <span className="legacy-gallery-card-link">詳細を見る ↗</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeSlide && (
        <div
          className="legacy-gallery-modal"
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && setDetailIndex(null)}
        >
          <div className="legacy-gallery-dialog" role="dialog" aria-modal="true" aria-label="枕の詳細画像">
            <button className="legacy-gallery-close" type="button" onClick={() => setDetailIndex(null)} aria-label="詳細画像を閉じる">
              ×
            </button>
            <p className="legacy-kicker">DETAIL GALLERY</p>
            <h2>{activeSlide.label}</h2>
            <div className="legacy-gallery-grid">
              {activeSlide.detailImages.map((src) => (
                <Image key={src} src={src} alt={`${activeSlide.label}の詳細`} width={420} height={420} />
              ))}
            </div>
            <a className="legacy-cta" href="#recommendedPillow" onClick={() => setDetailIndex(null)}>
              おすすめを診断する <span>→</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
