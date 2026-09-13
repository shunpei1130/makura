"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { CHECKOUT_LINKS } from "@/lib/constants";

export type PillowQuizResult = {
  recommendation: "vertical" | "horizontal";
  reason: string;
  answers: {
    position: "back" | "side" | "both";
    height: "low" | "normal" | "high";
    priority: "stability" | "shoulder";
  };
};

type Answers = Partial<PillowQuizResult["answers"]>;

const recommendations = {
  vertical: {
    name: "仰向け中心・縦向きタイプ",
    title: "あなたには「仰向け中心・縦向きタイプ」がおすすめです",
    image: "/makura/tate.png",
    href: CHECKOUT_LINKS.vertical,
  },
  horizontal: {
    name: "横向き中心・横向きタイプ",
    title: "あなたには「横向き中心・横向きタイプ」がおすすめです",
    image: "/makura/yoko.png",
    href: CHECKOUT_LINKS.horizontal,
  },
} as const;

export default function PillowQuiz() {
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<PillowQuizResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  function chooseAnswer<K extends keyof Answers>(name: K, value: Answers[K]) {
    setAnswers((current) => ({ ...current, [name]: value }));
    setResult(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!answers.position || !answers.height || !answers.priority) return;

    let score = 0;
    if (answers.position === "back") score += 2;
    if (answers.position === "side") score -= 2;
    if (answers.priority === "stability") score += 2;
    if (answers.priority === "shoulder") score -= 2;
    if (answers.height === "low") score += 1;
    if (answers.height === "high") score -= 1;

    const isVertical = score >= 0;

    let reasonText = "";
    if (isVertical) {
      reasonText =
        answers.position === "back"
          ? "仰向けで寝ることが多く、首・頭のフィット感と安定感を重視されているため。"
          : "仰向けの安定感と頚椎のサポートを高めたい好みに合致するため。";
    } else {
      reasonText =
        answers.position === "side"
          ? "横向きで寝ることが多く、肩・首まわりの高さと空間を支える必要があるため。"
          : "横向き時の肩への負担軽減や横幅のサポートを重視されているため。";
    }

    const nextResult: PillowQuizResult = {
      recommendation: isVertical ? "vertical" : "horizontal",
      reason: reasonText,
      answers: {
        position: answers.position,
        height: answers.height,
        priority: answers.priority,
      },
    };

    setResult(nextResult);
    window.setTimeout(
      () => resultRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  }

  const rec = result ? recommendations[result.recommendation] : null;

  return (
    <section className="legacy-diagnosis-section" id="pillow-quiz">
      <div className="legacy-section-inner">
        <div className="legacy-section-heading legacy-section-heading-center">
          <p className="legacy-kicker">3 QUESTIONS QUIZ</p>
          <h2>3問で簡易診断</h2>
          <p>
            どっちのタイプが良いか迷った方へ。3つの質問からあなたに合うタイプを提案します。
          </p>
        </div>

        <form
          className="legacy-quiz"
          onSubmit={handleSubmit}
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          <fieldset style={{ marginBottom: "2rem" }}>
            <legend
              style={{
                fontSize: "1.05rem",
                fontWeight: "bold",
                color: "#ffd700",
                marginBottom: "1rem",
              }}
            >
              Q1. 普段の寝姿勢は？
            </legend>
            <div
              className="legacy-option-grid quiz-option-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.8rem",
              }}
            >
              {[
                { value: "back", label: "仰向けが多い" },
                { value: "side", label: "横向きが多い" },
                { value: "both", label: "半々" },
              ].map((opt) => (
                <label
                  className="legacy-option"
                  key={opt.value}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="radio"
                    name="position"
                    value={opt.value}
                    checked={answers.position === opt.value}
                    onChange={() =>
                      chooseAnswer("position", opt.value as Answers["position"])
                    }
                    required
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset style={{ marginBottom: "2rem" }}>
            <legend
              style={{
                fontSize: "1.05rem",
                fontWeight: "bold",
                color: "#ffd700",
                marginBottom: "1rem",
              }}
            >
              Q2. 枕の高さは？
            </legend>
            <div
              className="legacy-option-grid quiz-option-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.8rem",
              }}
            >
              {[
                { value: "low", label: "低め" },
                { value: "normal", label: "普通" },
                { value: "high", label: "高め" },
              ].map((opt) => (
                <label
                  className="legacy-option"
                  key={opt.value}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="radio"
                    name="height"
                    value={opt.value}
                    checked={answers.height === opt.value}
                    onChange={() =>
                      chooseAnswer("height", opt.value as Answers["height"])
                    }
                    required
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset style={{ marginBottom: "2.5rem" }}>
            <legend
              style={{
                fontSize: "1.05rem",
                fontWeight: "bold",
                color: "#ffd700",
                marginBottom: "1rem",
              }}
            >
              Q3. どちらを重視する？
            </legend>
            <div
              className="legacy-option-grid quiz-option-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "0.8rem",
              }}
            >
              {[
                { value: "stability", label: "仰向けの安定感" },
                { value: "shoulder", label: "横向き時の肩・首まわり" },
              ].map((opt) => (
                <label
                  className="legacy-option"
                  key={opt.value}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={opt.value}
                    checked={answers.priority === opt.value}
                    onChange={() =>
                      chooseAnswer("priority", opt.value as Answers["priority"])
                    }
                    required
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            className="legacy-quiz-submit mobile-full-width"
            type="submit"
            style={{
              width: "100%",
              padding: "1rem",
              fontSize: "1.05rem",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #ffd700 0%, #ffa500 100%)",
              color: "#111",
              borderRadius: "30px",
              border: "none",
              cursor: "pointer",
            }}
          >
            診断結果を見る <span>→</span>
          </button>
        </form>

        {result && rec && (
          <div
            className="legacy-quiz-result"
            ref={resultRef}
            tabIndex={-1}
            style={{
              marginTop: "2.5rem",
              background: "rgba(255,255,255,0.06)",
              border: "2px solid #ffd700",
              borderRadius: "20px",
              padding: "1.5rem 1.2rem",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "1.5rem",
              maxWidth: "750px",
              margin: "2.5rem auto 0",
              flexWrap: "wrap",
            }}
          >
            <div
              className="legacy-quiz-result-image"
              style={{ width: "180px", margin: "0 auto" }}
            >
              <Image
                src={rec.image}
                alt={rec.name}
                width={180}
                height={180}
                style={{ objectFit: "contain" }}
              />
            </div>
            <div
              className="legacy-quiz-result-copy"
              style={{ flex: 1, minWidth: "240px", textAlign: "center" }}
            >
              <p
                className="legacy-kicker"
                style={{ color: "#ffd700", fontWeight: "bold" }}
              >
                DIAGNOSIS RESULT
              </p>
              <h3
                style={{
                  fontSize: "1.2rem",
                  margin: "0.4rem 0 0.8rem",
                  color: "#fff",
                }}
              >
                {rec.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  opacity: 0.9,
                  lineHeight: 1.6,
                  marginBottom: "1.2rem",
                }}
              >
                <strong>理由：</strong>
                {result.reason}
              </p>
              <a
                href={rec.href}
                target="_blank"
                rel="noopener noreferrer"
                className="legacy-quiz-purchase mobile-full-width"
                style={{
                  display: "inline-block",
                  padding: "0.85rem 1.5rem",
                  background:
                    "linear-gradient(135deg, #ffd700 0%, #ffa500 100%)",
                  color: "#111",
                  fontWeight: "bold",
                  borderRadius: "30px",
                  textDecoration: "none",
                  boxShadow: "0 4px 15px rgba(255,215,0,0.3)",
                  boxSizing: "border-box",
                }}
              >
                0円で30日試す →
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
