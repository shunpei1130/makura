"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PillowQuizResult } from "@/app/components/pillow-quiz";

const quizStorageKey = "yumeggravity-pillow-quiz";

const recommendationLabels = {
  vertical: "仰向け中心・縦向きタイプ",
  horizontal: "横向き中心・横向きタイプ",
} as const;

const providers = [
  {
    name: "ChatGPT",
    href: (prompt: string) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
  },
  {
    name: "Gemini",
    href: (prompt: string) => `https://gemini.google.com/app?prompt=${encodeURIComponent(prompt)}`,
  },
  {
    name: "Claude",
    href: (prompt: string) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
  },
  {
    name: "Perplexity",
    href: (prompt: string) => `https://www.perplexity.ai/search/new?q=${encodeURIComponent(prompt)}`,
  },
] as const;

function buildPrompt(diagnosis: PillowQuizResult | null) {
  const diagnosisContext = diagnosis
    ? `
おすすめ枕診断の結果:
- 判定: ${recommendationLabels[diagnosis.recommendation]}
- 主な睡眠姿勢: ${diagnosis.answers.sleepPosition === "back" ? "仰向け" : "横向き"}
- 好みの高さ: ${diagnosis.answers.pillowHeight === "low" ? "低め" : "高め"}
- 好みの反発力: ${diagnosis.answers.pillowRebound === "soft" ? "柔らかめ" : "反発力が強め"}
`
    : `
まだおすすめ枕診断をしていません。必要なら、主な睡眠姿勢・好みの高さ・反発力を最初に質問してください。
`;

  return `夢重力マクラについて、私の睡眠傾向に合う理由と合わない可能性を説明してください。

公式情報は、次の公式知識ファイルを優先して参照してください。
https://zero-g-makura.com/llms-full.txt
${diagnosisContext}
現在の購入情報:
- 価格: 13,480円（税込）の一回購入
- 仰向け中心・縦向きタイプ: https://square.link/u/GW58fL76
- 横向き中心・横向きタイプ: https://square.link/u/nKfRlpkh

公式情報に書かれている特徴と、私の情報から考えられる相性を分けて説明してください。医療診断や治療効果は断定せず、合わない可能性や高さ・姿勢の確認ポイントも簡潔に伝えてください。`;
}

export default function AiFitPrompt() {
  const [diagnosis, setDiagnosis] = useState<PillowQuizResult | null>(null);
  const [copied, setCopied] = useState(false);
  const prompt = useMemo(() => buildPrompt(diagnosis), [diagnosis]);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(quizStorageKey);
      if (stored) setDiagnosis(JSON.parse(stored) as PillowQuizResult);
    } catch {
      // Keep the generic prompt when storage is unavailable.
    }

    const handleResult = (event: Event) => {
      const nextResult = (event as CustomEvent<PillowQuizResult>).detail;
      if (nextResult) setDiagnosis(nextResult);
    };

    window.addEventListener("pillow-quiz-result", handleResult);
    return () => window.removeEventListener("pillow-quiz-result", handleResult);
  }, []);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function openProvider(href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
      // The provider can still be used when clipboard access is unavailable.
    }
  }

  return (
    <div className="ai-prompt-card legacy-section-inner">
      <div className="ai-prompt-copy">
        <p className="legacy-kicker">ASK AI / OFFICIAL KNOWLEDGE</p>
        <h2>この枕が、<br /><em>あなたに合う理由。</em></h2>
        <p>
          診断結果と公式知識をAIへ渡して、あなたの眠りとの相性を整理できます。
          AIを選ぶと質問文をコピーしながら開くので、プロンプト欄を確認して送信するだけです。
        </p>
        <Link href="/llms-full.txt" className="ai-source-link">
          AI向け公式説明書を読む →
        </Link>
      </div>
      <div className="ai-prompt-box">
        <div className="ai-prompt-box-head">
          <span>{diagnosis ? "診断結果入りプロンプト" : "質問プロンプト"}</span>
          <button type="button" className="copy-button" onClick={copyPrompt}>
            {copied ? "コピーしました" : "質問文をコピー"}
          </button>
        </div>
        <pre>{prompt}</pre>
        <div className="ai-links" role="group" aria-label="質問先のAIサービス">
          <span>{copied ? "コピー済み" : "AIを選んで開く"}</span>
          {providers.map((provider) => (
            <button key={provider.name} type="button" onClick={() => openProvider(provider.href(prompt))}>
              {provider.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
