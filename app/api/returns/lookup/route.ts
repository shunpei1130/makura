import { z } from "zod";
import { api, assertOrigin, rateLimit, readJson } from "@/lib/security";
import { getDb } from "@/lib/db/client";
import { enqueue } from "@/lib/email/service";
import type { Trial } from "@/lib/trials/model";
export async function POST(req: Request) {
  return api(async () => {
    assertOrigin(req);
    const db = getDb();
    await rateLimit(db, req, "lookup", 5);
    const v = await readJson(
      req,
      z.object({ number: z.string().max(50), email: z.email() }).strict(),
    );
    const t = (
      await db.query<Trial>(
        "SELECT * FROM trial_orders WHERE order_number=$1 AND email=$2",
        [v.number.toUpperCase(), v.email.toLowerCase()],
      )
    ).rows[0];
    if (t)
      await enqueue(
        db,
        t,
        "申込状況を確認するリンク",
        "以下のリンクから返品申請・申込状況を確認できます。",
        `lookup:${Math.floor(Date.now() / 600000)}`,
      );
    return {
      message:
        "入力が登録情報と一致する場合、確認用リンクをメールでお送りします。",
    };
  });
}
