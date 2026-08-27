"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { PURCHASE_LINKS } from "@/lib/constants";

export type PillowQuizResult = {
  recommendation: "vertical" | "horizontal";
  score: number;
  answers: {
    sleepPosition: "back" | "side";
    pillowHeight: "low" | "high";
    pillowRebound: "soft" | "strong";
  };
};

type Answers = Partial<PillowQuizResult["answers"]>;

const recommendations = {
  vertical: {
    name: "縦向きマクラ",
    title: "仰向け中心のあなたへ",
    description: "首と頭を安定させたい方に。180度回転による高さ調整で、仰向けの寝姿勢を支えます。",
    image: "/makura/tate.png",
    href: PURCHASE_LINKS.vertical,
  },
  horizontal: {
    name: "横向きマクラ",
    title: "横向き中心のあなたへ",
    description: "肩まわりまで支えたい方に。横向きで眠る時間が長い方へおすすめするタイプです。",
    image: "/makura/yoko.png",
    href: PURCHASE_LINKS.horizontal,
  },
} as const;

const quizStorageKey = "yumeggravity-pillow-quiz";

function storeResult(result: PillowQuizResult) {
  try {
    window.sessionStorage.setItem(quizStorageKey, JSON.stringify(result));
  } catch {
    // Storage can be unavailable in privacy-restricted browsers.
  }
  window.dispatchEvent(new CustomEvent("pillow-quiz-result", { detail: result }));
}

export default function PillowQuiz() {
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<PillowQuizResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  function chooseAnswer(name: keyof Answers, value: string) {
    setAnswers((current) => ({ ...current, [name]: value } as Answers));
    setResult(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!answers.sleepPosition || !answers.pillowHeight || !answers.pillowRebound) return;

    let score = 0;
    score += answers.sleepPosition === "back" ? 1 : -1;
    score += answers.pillowHeight === "low" ? 1 : -1;
    score += answers.pillowRebound === "soft" ? 1 : -1;

    const nextResult: PillowQuizResult = {
      recommendation: score < 0 ? "horizontal" : "vertical",
      score,
      answers: {
        sleepPosition: answers.sleepPosition,
        pillowHeight: answers.pillowHeight,
        pillowRebound: answers.pillowRebound,
      },
    };

    setResult(nextResult);
    storeResult(nextResult);
    window.setTimeout(() => resultRef.current?.focus(), 0);
  }

  const recommendation = result ? recommendations[result.recommendation] : null;

  return (
    <section className="legacy-diagnosis-section" id="recommendedPillow">
      <div className="legacy-section-inner">
        <div className="legacy-section-heading">
          <p className="legacy-kicker">FIND YOUR PILLOW</p>
          <h2>おすすめ枕診断</h2>
          <p>3つの質問に答えるだけ。あなたの眠り方に合う向きを、簡単に見つけます。</p>
        </div>

        <form className="legacy-quiz" onSubmit={handleSubmit}>
          <fieldset>
            <legend>1. あなたの主な睡眠姿勢は？</legend>
            <div className="legacy-option-grid">
              <label className="legacy-option">
                <input
                  type="radio"
                  name="sleepPosition"
                  value="back"
                  checked={answers.sleepPosition === "back"}
                  onChange={(event) => chooseAnswer("sleepPosition", event.target.value)}
                  required
                />
                <span>仰向け</span>
              </label>
              <label className="legacy-option">
                <input
                  type="radio"
                  name="sleepPosition"
                  value="side"
                  checked={answers.sleepPosition === "side"}
                  onChange={(event) => chooseAnswer("sleepPosition", event.target.value)}
                />
                <span>横向き</span>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>2. 枕の高さはどの程度が好みですか？</legend>
            <div className="legacy-option-grid">
              <label className="legacy-option">
                <input
                  type="radio"
                  name="pillowHeight"
                  value="low"
                  checked={answers.pillowHeight === "low"}
                  onChange={(event) => chooseAnswer("pillowHeight", event.target.value)}
                  required
                />
                <span>低め</span>
              </label>
              <label className="legacy-option">
                <input
                  type="radio"
                  name="pillowHeight"
                  value="high"
                  checked={answers.pillowHeight === "high"}
                  onChange={(event) => chooseAnswer("pillowHeight", event.target.value)}
                />
                <span>高め</span>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>3. 枕の反発力についてどう感じますか？</legend>
            <div className="legacy-option-grid">
              <label className="legacy-option">
                <input
                  type="radio"
                  name="pillowRebound"
                  value="soft"
                  checked={answers.pillowRebound === "soft"}
                  onChange={(event) => chooseAnswer("pillowRebound", event.target.value)}
                  required
                />
                <span>柔らかい方がいい</span>
              </label>
              <label className="legacy-option">
                <input
                  type="radio"
                  name="pillowRebound"
                  value="strong"
                  checked={answers.pillowRebound === "strong"}
                  onChange={(event) => chooseAnswer("pillowRebound", event.target.value)}
                />
                <span>反発力が強い方がいい</span>
              </label>
            </div>
          </fieldset>

          <button className="legacy-quiz-submit" type="submit">
            診断する <span>→</span>
          </button>
        </form>

        {result && recommendation && (
          <div className="legacy-quiz-result" ref={resultRef} tabIndex={-1} aria-live="polite">
            <div className="legacy-quiz-result-image">
              <Image src={recommendation.image} alt={recommendation.name} width={300} height={300} />
            </div>
            <div className="legacy-quiz-result-copy">
              <p className="legacy-kicker">YOUR MATCH</p>
              <h3>{recommendation.title}</h3>
              <p>{recommendation.description}</p>
              <a href={recommendation.href} target="_blank" rel="noopener noreferrer" className="legacy-quiz-purchase">
                {recommendation.name}を購入 <span>¥13,480 →</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
