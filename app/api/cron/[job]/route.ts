import { api, AppError, required, secureEqual } from "@/lib/security";
import { getDb } from "@/lib/db/client";
import { chargeTrials, reminders } from "@/lib/trials/billing";
import { returnDeadlines } from "@/lib/trials/service";
import { sendOutbox } from "@/lib/email/service";
export const maxDuration = 300;
export async function GET(
  req: Request,
  { params }: { params: Promise<{ job: string }> },
) {
  return api(async () => {
    if (
      !secureEqual(
        req.headers.get("authorization") || "",
        `Bearer ${required("CRON_SECRET")}`,
      )
    )
      throw new AppError("UNAUTHORIZED", 401);
    const { job } = await params;
    const db = getDb();
    if (job === "charge-trials") return chargeTrials(db);
    if (job === "return-deadlines") return returnDeadlines(db);
    if (job === "notifications") {
      await reminders(db);
      return sendOutbox(db);
    }
    throw new AppError("NOT_FOUND", 404);
  });
}
