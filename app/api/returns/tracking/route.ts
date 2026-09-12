import { z } from "zod";
import { api, assertOrigin, rateLimit, readJson } from "@/lib/security";
import { getDb } from "@/lib/db/client";
import { tracking } from "@/lib/trials/service";
export async function POST(req: Request) {
  return api(async () => {
    assertOrigin(req);
    const db = getDb();
    await rateLimit(db, req, "tracking");
    const v = await readJson(
      req,
      z
        .object({
          token: z.string().length(43),
          carrier: z.string().trim().min(1).max(60),
          number: z.string().regex(/^[a-zA-Z0-9-]{6,50}$/),
        })
        .strict(),
    );
    return tracking(db, v.token, v.carrier, v.number);
  });
}
