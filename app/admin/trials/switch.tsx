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
  return (
    <section className="notice">
      <p>
        自動課金:{enabled && environment ? "有効" : "停止中"} ／ 環境変数:
        {environment ? "有効" : "停止"}
      </p>
      <button
        onClick={async () => {
          if (
            !confirm(
              enabled
                ? "自動課金を停止しますか？"
                : "本番設定と検証を確認済みですか？ 自動課金を有効化します。",
            )
          )
            return;
          try {
            await post("/api/admin/billing", { enabled: !enabled });
            location.reload();
          } catch (e) {
            setMessage((e as Error).message);
          }
        }}
      >
        {enabled ? "自動課金を緊急停止" : "自動課金を有効化"}
      </button>
      <p role="alert">{message}</p>
    </section>
  );
}
