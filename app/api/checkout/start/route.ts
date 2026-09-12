import {
  api,
  assertOrigin,
  rateLimit,
  readJson,
  AppError,
} from "@/lib/security";
import { getDb } from "@/lib/db/client";
import { checkout, checkoutSchema } from "@/lib/trials/checkout";
export const maxDuration = 60;
export async function POST(req: Request) {
  return api(async () => {
    assertOrigin(req);
    if (process.env.CHECKOUT_ENABLED !== "true")
      throw new AppError("CHECKOUT_PAUSED", 503);
    const db = getDb();
    await rateLimit(db, req, "checkout", 8);
    return checkout(db, await readJson(req, checkoutSchema));
  });
}
