"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
type Card = {
  attach: (selector: string) => Promise<void>;
  destroy: () => Promise<void>;
  tokenize: (
    details: Record<string, unknown>,
  ) => Promise<{ status: string; token?: string }>;
};
declare global {
  interface Window {
    Square?: {
      payments: (
        app: string,
        location: string,
      ) => { card: () => Promise<Card> };
    };
  }
}
export type CardConfig = {
  applicationId: string;
  locationId: string;
  environment: string;
  nonce?: string;
};
export function useCard(config: CardConfig | null) {
  const card = useRef<Card | null>(null),
    initializing = useRef(false);
  const [ready, setReady] = useState(false),
    [error, setError] = useState("");
  async function initialize() {
    if (!config || initializing.current || card.current) return;
    initializing.current = true;
    try {
      if (!window.Square) throw new Error();
      const c = await window.Square.payments(
        config.applicationId,
        config.locationId,
      ).card();
      await c.attach("#square-card");
      card.current = c;
      setReady(true);
    } catch (e) {
      console.error(
        "square_init_failed",
        e instanceof Error ? e.message : "SDK initialization failed",
      );
      setError(
        "カード入力を読み込めませんでした。ページを再読み込みしてください。",
      );
    } finally {
      initializing.current = false;
    }
  }
  useEffect(
    () => () => {
      void card.current?.destroy();
      card.current = null;
    },
    [],
  );
  async function tokenize(contact: Record<string, unknown>) {
    if (!card.current) throw new Error("カード入力の準備中です。");
    const result = await card.current.tokenize({
      intent: "STORE",
      customerInitiated: true,
      sellerKeyedIn: false,
      billingContact: { ...contact, countryCode: "JP" },
    });
    if (result.status !== "OK" || !result.token)
      throw new Error(
        "カードを登録できませんでした。入力内容・本人認証をご確認ください。",
      );
    return result.token;
  }
  const element = (
    <>
      <div id="square-card" aria-label="Squareの安全なカード入力" />
      {error && <p role="alert">{error}</p>}
      {config && (
        <Script
          nonce={config.nonce}
          src={
            config.environment === "production"
              ? "https://web.squarecdn.com/v1/square.js"
              : "https://sandbox.web.squarecdn.com/v1/square.js"
          }
          onReady={() => {
            void initialize();
          }}
          onError={() =>
            setError(
              "カード入力を読み込めませんでした。ページを再読み込みしてください。",
            )
          }
        />
      )}
    </>
  );
  return { element, ready, tokenize };
}
export async function post(path: string, body: unknown) {
  const r = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await r.json();
  if (!r.ok) {
    const messages: Record<string, string> = {
      RETURN_NOT_AVAILABLE: "返品申請期限または申込状況をご確認ください。",
      CONTACT_SUPPORT:
        "期限を過ぎています。発送済みの場合は窓口へご連絡ください。",
      CHECKOUT_PAUSED: "現在、新規申込の受付を一時停止しています。",
      CHECKOUT_CHANGED:
        "前回の申込内容と異なります。ページを再読み込みして入力内容をご確認ください。",
      RATE_LIMITED: "操作が続いています。10分ほど待ってからお試しください。",
      INVALID_INPUT: "入力内容をご確認ください。",
      UNAUTHORIZED: "ログインが必要です。",
      PAYMENT_RECONCILIATION_REQUIRED:
        "決済結果を確認中です。照合完了までお待ちください。",
    };
    throw new Error(
      messages[result.error] ||
        "処理を完了できませんでした。入力内容と状態を確認して、再度お試しください。",
    );
  }
  return result;
}
