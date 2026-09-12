import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  api,
  assertOrigin,
  rateLimit,
  readJson,
  AppError,
} from "@/lib/security";
import { getDb } from "@/lib/db/client";
import { gateway } from "@/lib/square/client";
import { tokenOrder, update } from "@/lib/trials/service";
import { enqueue } from "@/lib/email/service";
export async function POST(req: Request) {
  return api(async () => {
    assertOrigin(req);
    const db = getDb();
    await rateLimit(db, req, "card-update", 8);
    const v = await readJson(
      req,
      z
        .object({
          token: z.string().length(43),
          sourceId: z.string().min(10).max(200),
          consent: z.literal(true),
          key: z.uuid(),
        })
        .strict(),
    );
    return db.transaction(async (tx) => {
      const t = await tokenOrder(tx, v.token, true);
      if (!["payment_failed", "collection_failed"].includes(t.status))
        throw new AppError("INVALID_STATE", 409);
      const card = await gateway.storeCard(
        v.key,
        v.sourceId,
        t.square_customer_id,
        t.customer_name,
      );
      const next = await update(
        tx,
        t,
        {
          square_card_id: card,
          status: "charge_due",
          next_retry_at: new Date(),
        },
        "customer",
        "card_updated",
      );
      await enqueue(
        tx,
        next,
        "カードを更新しました",
        "新しく登録したカードで、商品代の決済を再試行します。",
        `card_updated:${randomUUID()}`,
      );
      return { ok: true };
    });
  });
}
