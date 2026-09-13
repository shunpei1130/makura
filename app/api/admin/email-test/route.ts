import { z } from "zod";
import { admin } from "@/lib/auth";
import { getDb } from "@/lib/db/client";
import { sendPreviewTestEmail } from "@/lib/email/service";
import {
  api,
  AppError,
  assertOrigin,
  rateLimit,
  readJson,
} from "@/lib/security";

export async function POST(req: Request) {
  return api(async () => {
    if (
      process.env.VERCEL_ENV !== "preview" ||
      process.env.SQUARE_ENVIRONMENT !== "sandbox"
    )
      throw new AppError("NOT_FOUND", 404);
    assertOrigin(req);
    await admin();
    await readJson(req, z.object({}).strict());
    await rateLimit(getDb(), req, "preview-email-test", 1);
    const providerId = await sendPreviewTestEmail();
    return { sent: true, providerId };
  });
}
