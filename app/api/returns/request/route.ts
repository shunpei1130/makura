import { z } from "zod";
import { api, assertOrigin, rateLimit, readJson } from "@/lib/security";
import { getDb } from "@/lib/db/client";
import { requestReturn } from "@/lib/trials/service";
export async function POST(req: Request) {
  return api(async () => {
    assertOrigin(req);
    const db = getDb();
    await rateLimit(db, req, "return");
    const { token } = await readJson(
      req,
      z.object({ token: z.string().length(43) }).strict(),
    );
    return requestReturn(db, token);
  });
}
