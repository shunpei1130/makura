"use client";

import { useMemo, useState } from "react";

const providers = [
  {
    name: "ChatGPTで聞く",
    href: (prompt: string) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
  },
  {
    name: "Geminiで聞く",
    href: (prompt: string) => `https://gemini.google.com/app?prompt=${encodeURIComponent(prompt)}`,
  },
  {
    name: "Claudeで聞く",
    href: (prompt: string) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
  },
  {
    name: "Perplexityで聞く",
    href: (prompt: string) => `https://www.perplexity.ai/search/new?q=${encodeURIComponent(prompt)}`,
  },
] as const;

export default function AiFitPrompt() {
  const [position, setPosition] = useState("仰向けが多い");
  const [height, setHeight] = useState("普通");
  const [hardness, setHardness] = useState("普通");
  const [copied, setCopied] = useState(false);

  const promptText = useMemo(() => {
    return `夢重力マクラを購入しようとしています。

以下の2種類があります。
・仰向け中心・縦向きタイプ
・横向き中心・横向きタイプ

私に合う方を判断してください。

私の寝姿勢：${position}
好きな枕の高さ：${height}
好きな硬さ：${hardness}

必要であれば追加で質問してください。`;
  }, [position, height, hardness]);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function openProvider(href: string) {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
    } catch {
      // Proceed even if clipboard fails
    }
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="ai-prompt-card legacy-section-inner" style={{ padding: "3rem 1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div className="ai-prompt-copy" style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p className="legacy-kicker" style={{ color: "#ffd700" }}>ASK YOUR OWN AI</p>
        <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", margin: "0.5rem 0 0.8rem" }}>
          迷ったら、<br />
          <em style={{ color: "#ffd700", fontStyle: "normal" }}>AIに聞いてみてください。</em>
        </h2>
        <p style={{ opacity: 0.85, maxWidth: "600px", margin: "0 auto", fontSize: "0.95rem" }}>
          下の条件を選ぶだけ。いつも使っているAIがあなたに合うタイプを教えてくれます。
        </p>
      </div>

      <div className="ai-selector-box" style={{ maxWidth: "680px", margin: "0 auto 1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", padding: "0.8rem 1rem", borderRadius: "12px" }}>
          <label style={{ display: "block", fontSize: "0.8rem", color: "#ffd700", marginBottom: "0.4rem" }}>寝姿勢</label>
          <select 
            value={position} 
            onChange={(e) => setPosition(e.target.value)}
            style={{ width: "100%", background: "#1a1a2e", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "0.4rem", borderRadius: "6px" }}
          >
            <option value="仰向けが多い">仰向けが多い</option>
            <option value="横向きが多い">横向きが多い</option>
            <option value="寝返りが多い・半々">寝返りが多い・半々</option>
          </select>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", padding: "0.8rem 1rem", borderRadius: "12px" }}>
          <label style={{ display: "block", fontSize: "0.8rem", color: "#ffd700", marginBottom: "0.4rem" }}>枕の高さ</label>
          <select 
            value={height} 
            onChange={(e) => setHeight(e.target.value)}
            style={{ width: "100%", background: "#1a1a2e", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "0.4rem", borderRadius: "6px" }}
          >
            <option value="低め">低め</option>
            <option value="普通">普通</option>
            <option value="高め">高め</option>
          </select>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", padding: "0.8rem 1rem", borderRadius: "12px" }}>
          <label style={{ display: "block", fontSize: "0.8rem", color: "#ffd700", marginBottom: "0.4rem" }}>好みの硬さ</label>
          <select 
            value={hardness} 
            onChange={(e) => setHardness(e.target.value)}
            style={{ width: "100%", background: "#1a1a2e", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "0.4rem", borderRadius: "6px" }}
          >
            <option value="柔らかめ">柔らかめ</option>
            <option value="普通">普通</option>
            <option value="やや硬め">やや硬め</option>
          </select>
        </div>
      </div>

      <div className="ai-prompt-box" style={{ maxWidth: "680px", margin: "0 auto", background: "rgba(0,0,0,0.3)", borderRadius: "16px", padding: "1.2rem", border: "1px solid rgba(255,255,255,0.15)", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
        <div className="ai-prompt-box-head" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <button 
            type="button" 
            className="copy-button mobile-full-width" 
            onClick={copyPrompt}
            style={{ background: "#ffd700", color: "#111", border: "none", padding: "0.6rem 1.4rem", borderRadius: "20px", fontWeight: "bold", cursor: "pointer", fontSize: "0.9rem" }}
          >
            {copied ? "✓ 質問文をコピーしました" : "📋 AIへの質問文をコピー"}
          </button>
        </div>

        <div className="ai-links" style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
          {providers.map((provider) => (
            <button 
              key={provider.name} 
              type="button" 
              onClick={() => openProvider(provider.href(promptText))}
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "0.55rem 1.1rem",
                borderRadius: "20px",
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {provider.name} →
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

