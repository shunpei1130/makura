"use client";
import { useState } from "react";
import { post } from "@/app/components/card-form";
export default function BillingSwitch({
  enabled,
  environment,
}: {
  enabled: boolean;
  environment: boolean;
}) {
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  async function apply() {
    setBusy(true);
    try {
      await post("/api/admin/billing", { enabled: !enabled });
      location.reload();
    } catch (e) {
      setMessage((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <section className="notice">
      <p>
        自動課金:{enabled && environment ? "有効" : "停止中"} ／ 管理画面の設定:
        {enabled ? "有効" : "停止"}
      </p>
      {!environment && (
        <p>
          公開設定で自動課金を停止しています。管理画面側を有効にしても、公開設定を変更するまでは請求されません。
        </p>
      )}
      <button disabled={busy || confirming} onClick={() => setConfirming(true)}>
        {enabled ? "自動課金を緊急停止" : "自動課金を有効化"}
      </button>
      {confirming && (
        <section className="notice" aria-label="課金設定の確認">
          <p>
            {enabled
              ? "自動課金を停止します。"
              : "管理画面側の課金設定を有効にします。運用準備と試験は完了していますか？"}
          </p>
          <button disabled={busy} onClick={apply}>
            変更を確定する
          </button>
          <button
            className="secondary"
            disabled={busy}
            onClick={() => setConfirming(false)}
          >
            戻る
          </button>
        </section>
      )}
      <p role="alert">{message}</p>
    </section>
  );
}
