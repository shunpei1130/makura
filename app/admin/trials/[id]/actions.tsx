"use client";
import { useState } from "react";
import { post } from "@/app/components/card-form";
export default function Actions({ id }: { id: string }) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function run(action: string, data: unknown = {}, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return;
    setBusy(true);
    try {
      await post(`/api/admin/trials/${id}/${action}`, data);
      location.reload();
    } catch (e) {
      setMessage((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <fieldset disabled={busy}>
      <legend>申込の管理</legend>
      <div className="action-buttons">
        <button onClick={() => run("hold")}>手動で課金保留</button>
        <button
          onClick={() =>
            run("release", {}, "手動保留を解除します。返品保留は維持されます。")
          }
        >
          手動保留を解除
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run("extend", {
            days: Number(new FormData(e.currentTarget).get("days")),
          });
        }}
      >
        <label>
          課金日と返品期限を延長する日数
          <input
            name="days"
            type="number"
            min="1"
            max="365"
            required
            defaultValue="7"
          />
        </label>
        <button>両方を延長する</button>
      </form>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          void run("ship", {
            pillow: d.has("pillow"),
            box: d.has("box"),
            guide: d.has("guide"),
            tracking: d.get("tracking"),
          });
        }}
      >
        <h2>出荷チェック</h2>
        {[
          ["pillow", "枕本体"],
          ["box", "返品に再利用できる箱"],
          ["guide", "箱の保管案内カード"],
        ].map(([k, label]) => (
          <label className="consent" key={k}>
            <input type="checkbox" name={k} required />
            {label}
          </label>
        ))}
        <label>
          出荷追跡番号
          <input name="tracking" required minLength={6} />
        </label>
        <button>発送完了</button>
      </form>
      <h2>返送・受領</h2>
      <div className="action-buttons">
        <button
          onClick={() =>
            run(
              "confirm-shipped",
              {},
              "期限内に発送されたことを確認しましたか？",
            )
          }
        >
          管理者が期限内発送を確認
        </button>
        <button
          onClick={() =>
            run("delivered", {}, "配送会社の追跡で配達完了を確認しましたか？")
          }
        >
          追跡上の配達完了
        </button>
        <button
          onClick={() =>
            run(
              "waive-box",
              {},
              "販売者側の同梱漏れ等のため、箱の返送条件を免除しますか？",
            )
          }
        >
          箱条件を免除
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          void run("return-received", {
            pillow: d.has("pillow"),
            box: d.has("box"),
          });
        }}
      >
        <label className="consent">
          <input name="pillow" type="checkbox" />
          枕本体を実際に受領
        </label>
        <label className="consent">
          <input name="box" type="checkbox" />
          同梱箱を実際に受領
        </label>
        <button>実物の受領を記録</button>
      </form>
      <button
        onClick={() =>
          run(
            "return-approve",
            {},
            "返品条件を確認し、商品代13,480円の請求を免除しますか？",
          )
        }
      >
        返品承認・商品代免除
      </button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(
            "return-reject",
            { reason: new FormData(e.currentTarget).get("reason") },
            "返品不成立を通知し、元の請求日以降の課金対象に戻します。商品は販売者負担で再送します。",
          );
        }}
      >
        <label>
          返品却下の理由
          <textarea name="reason" maxLength={500} required />
        </label>
        <button>返品を却下する</button>
      </form>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run("redeliver", {
            tracking: new FormData(e.currentTarget).get("tracking"),
          });
        }}
      >
        <label>
          却下品の再送追跡番号
          <input name="tracking" minLength={6} required />
        </label>
        <button>販売者負担で再送したことを記録</button>
      </form>
      <div className="action-buttons">
        <button
          onClick={() =>
            run(
              "retry-payment",
              {},
              "未払いが確定した商品代の再請求を予約しますか？",
            )
          }
        >
          手動再請求を予約
        </button>
        <button
          onClick={() =>
            run(
              "cancel",
              {},
              "この申込をキャンセルして商品代請求を停止しますか？",
            )
          }
        >
          申込をキャンセル
        </button>
      </div>
      <p role="alert">{message}</p>
    </fieldset>
  );
}
