"use client";
import { useState } from "react";
import { post } from "@/app/components/card-form";

export default function PreviewEmailTest() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function send() {
    setBusy(true);
    setMessage("");
    try {
      await post("/api/admin/email-test", {});
      setMessage(
        "テストメールを送信しました。受信トレイと迷惑メールフォルダをご確認ください。",
      );
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="notice" aria-label="メール送信テスト">
      <h2>メール送信テスト</h2>
      <p>
        Previewから管理者（s.hasegawa1130@gmail.com）へテストメールを1通送ります。申込・決済・発送は発生しません。
      </p>
      <button disabled={busy} onClick={send}>
        {busy ? "送信中…" : "管理者へテストメールを送る"}
      </button>
      <p role="status">{message}</p>
    </section>
  );
}
