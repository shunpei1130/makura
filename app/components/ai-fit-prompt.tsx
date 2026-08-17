"use client";

import Link from "next/link";
import { useState } from "react";

const prompt = `夢重力マクラについて、私に合う理由と合わない可能性を説明してください。

公式情報は、次のページだけを参照してください。
https://zero-g-makura.com/llms-full.txt

私の情報:
- 主な睡眠姿勢: （仰向け / 横向き / どちらも）
- 好みの枕の高さ: （低め / 高め / わからない）
- 枕に求めること: （通気性 / 圧力分散 / 高さ調整 / その他）
- 気になっていること:

医療診断や治療効果を断定せず、公式情報に書かれている特徴と私の情報を分けて、わかりやすく説明してください。`;

const aiLinks = [
  { name: "ChatGPT", href: "https://chatgpt.com/" },
  { name: "Gemini", href: "https://gemini.google.com/" },
  { name: "Claude", href: "https://claude.ai/new" },
  { name: "Perplexity", href: "https://www.perplexity.ai/" },
];

export default function AiFitPrompt() {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="ai-prompt-card">
      <div className="ai-prompt-copy">
        <p className="eyebrow">ASK AI / OFFICIAL KNOWLEDGE</p>
        <h2>この枕が、<br /><em>あなたに合う理由。</em></h2>
        <p>
          睡眠姿勢や好みを質問文に入れて、AIに聞いてみてください。
          夢重力マクラの公式説明書を参照しながら、特徴との相性を整理できます。
        </p>
        <Link href="/llms-full.txt" className="ai-source-link">
          AI向け公式説明書を読む →
        </Link>
      </div>
      <div className="ai-prompt-box">
        <div className="ai-prompt-box-head">
          <span>質問テンプレート</span>
          <button type="button" className="copy-button" onClick={copyPrompt}>
            {copied ? "コピーしました" : "質問文をコピー"}
          </button>
        </div>
        <pre>{prompt}</pre>
        <div className="ai-links" aria-label="質問先のAIサービス">
          <span>コピー後に開く</span>
          {aiLinks.map((link) => (
            <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
