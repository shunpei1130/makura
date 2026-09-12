"use client";
import { useState } from "react";
import { useCard, post, type CardConfig } from "@/app/components/card-form";
export default function UpdateCard({
  token,
  config,
}: {
  token: string;
  config: CardConfig | null;
}) {
  const card = useCard(config),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const sourceId = await card.tokenize({});
          await post("/api/payment/update", {
            token,
            sourceId,
            key: crypto.randomUUID(),
            consent: true,
          });
          setMessage("カードを更新しました。商品代の再請求を予定しています。");
        } catch (e) {
          setMessage((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {card.element}
      <label className="consent">
        <input type="checkbox" required />
        新しいカードの保存と、未払いの商品代13,480円の再請求に同意します。
      </label>
      <button disabled={busy || !card.ready}>カードを更新する</button>
      <p role="status">{message}</p>
    </form>
  );
}
