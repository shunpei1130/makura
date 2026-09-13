"use client";
import { useState } from "react";
import { post } from "@/app/components/card-form";
export default function Lookup() {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const data = new FormData(e.currentTarget);
        try {
          const r = await post("/api/returns/lookup", {
            number: data.get("number"),
            email: data.get("email"),
          });
          setMessage(r.message);
        } catch (e) {
          setMessage((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>返品申請をはじめる</h2>
      <p>
        受付メールの専用リンクから直接申請できます。リンクが見つからない場合は再送します。
      </p>
      <label>
        申込番号
        <input name="number" placeholder="MG-…" required />
      </label>
      <label>
        申込時のメールアドレス
        <input name="email" type="email" required />
      </label>
      <button disabled={busy}>返品申請用リンクをメールで受け取る</button>
      <p role="status">{message}</p>
    </form>
  );
}
