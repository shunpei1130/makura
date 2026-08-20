"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const slides = [
  {
    label: "無重力マクラ 横向き",
    image: "/makura/yoko.png",
    detailImages: ["/makura/images/1.png", "/makura/images/2.png", "/makura/images/3.png"],
  },
  {
    label: "夢重力マクラ",
    image: "/makura/tate.png",
    detailImages: ["/makura/images/2.png", "/makura/images/3.png", "/makura/images/1.png"],
  },
  {
    label: "TPE ハニカム構造",
    image: "/makura/hani.png",
    detailImages: ["/makura/hani.png", "/makura/images/1.png", "/makura/images/2.png"],
  },
] as const;

const typeLines = [
  { top: "無重力マクラ", bottom: "一般的な普通の枕" },
  { top: "夢重力マクラ", bottom: "夢の中で無重力体験を" },
] as const;

export default function LegacyHero() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [typedTop, setTypedTop] = useState<string>(typeLines[0].top);
  const [typedBottom, setTypedBottom] = useState<string>(typeLines[0].bottom);
  const [detailIndex, setDetailIndex] = useState<number | null>(null);

  const activeSlide = slides[activeIndex];
  const activeDetails = useMemo(
    () => (detailIndex === null ? [] : slides[detailIndex].detailImages),
    [detailIndex],
  );

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
      const fullTop = line.top;
      const fullBottom = line.bottom;

      if (pause > 0) {
        pause -= 1;
        return;
      }

      if (!deleting) {
        characterIndex += 1;
        setTypedTop(fullTop.slice(0, characterIndex));
        setTypedBottom(fullBottom.slice(0, Math.min(characterIndex, fullBottom.length)));
        if (characterIndex >= Math.max(fullTop.length, fullBottom.length)) {
          pause = 18;
          deleting = true;
        }
        return;
      }

      characterIndex -= 1;
      setTypedTop(fullTop.slice(0, Math.max(characterIndex, 0)));
      setTypedBottom(fullBottom.slice(0, Math.min(Math.max(characterIndex, 0), fullBottom.length)));
      if (characterIndex <= 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % typeLines.length;
      }
    }, 105);

    return () => window.clearInterval(timer);
  }, []);

  function moveSlide(direction: number) {
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);
  }

  return (
    <section className="legacy-hero" id="hero">
      <div className="legacy-hero-copy">
        <p className="legacy-kicker">ZERO GRAVITY SLEEP / 30-DAY HOME TRIAL</p>
        <h1 className="legacy-title" aria-live="polite">
          <span>{typedTop}</span>
          <i className="legacy-cursor" aria-hidden="true" />
          <small>{typedBottom}</small>
        </h1>
        <div className="legacy-message">
          <span>感動したら、</span>
          <strong>返さないでください。</strong>
        </div>
        <p className="legacy-lead">
          触ってみてほしい。いや、30日寝てみてほしい。
          <br />
          今日のお支払いは0円。あなたのベッドで試せます。
        </p>
        <div className="legacy-actions">
          <a className="legacy-cta" href="#trial">
            0円で寝てみる <span>→</span>
          </a>
          <span className="legacy-note">カード登録のみ / 申込時の請求なし</span>
        </div>
      </div>

      <div className="legacy-hero-visual" aria-label="夢重力マクラのギャラリー">
        <div className="legacy-orbit legacy-orbit-one" aria-hidden="true" />
        <div className="legacy-orbit legacy-orbit-two" aria-hidden="true" />
        <div className="legacy-carousel">
          <button className="legacy-carousel-button legacy-carousel-prev" type="button" onClick={() => moveSlide(-1)} aria-label="前の枕を見る">
            ‹
          </button>
          <div className="legacy-carousel-stage">
            {slides.map((slide, index) => {
              const offset = (index - activeIndex + slides.length) % slides.length;
              const position = offset === 0 ? "active" : offset === 1 ? "next" : "prev";
              return (
                <button
                  className={`legacy-slide legacy-slide-${position}`}
                  key={slide.label}
                  type="button"
                  onClick={() => (position === "active" ? setDetailIndex(index) : setActiveIndex(index))}
                  aria-label={`${slide.label}の詳細を見る`}
                  aria-current={position === "active" ? "true" : undefined}
                >
                  <span className="legacy-slide-glow" aria-hidden="true" />
                  <Image src={slide.image} alt="" width={440} height={440} priority={position === "active"} />
                  <span>{slide.label}</span>
                </button>
              );
            })}
          </div>
          <button className="legacy-carousel-button legacy-carousel-next" type="button" onClick={() => moveSlide(1)} aria-label="次の枕を見る">
            ›
          </button>
        </div>
        <div className="legacy-visual-caption">
          <span>一晩寝れば、分かる。</span>
          <strong>¥0 <small>today</small></strong>
        </div>
      </div>

      {detailIndex !== null && (
        <div className="legacy-gallery-modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setDetailIndex(null)}>
          <div className="legacy-gallery-dialog" role="dialog" aria-modal="true" aria-label="枕の詳細画像">
            <button className="legacy-gallery-close" type="button" onClick={() => setDetailIndex(null)} aria-label="詳細画像を閉じる">×</button>
            <p className="legacy-kicker">DETAIL GALLERY</p>
            <h2>{activeSlide.label}</h2>
            <div className="legacy-gallery-grid">
              {activeDetails.map((src) => <Image key={src} src={src} alt="夢重力マクラの詳細" width={420} height={420} />)}
            </div>
            <a className="legacy-cta" href="#trial" onClick={() => setDetailIndex(null)}>30日試眠を申し込む <span>→</span></a>
          </div>
        </div>
      )}
    </section>
  );
}
