import { z } from "zod";
import { admin } from "@/lib/auth";
import { api, assertOrigin, readJson } from "@/lib/security";
import { getDb } from "@/lib/db/client";
import { adminAction } from "@/lib/trials/service";
const actions = z.enum([
  "hold",
  "release",
  "extend",
  "ship",
  "confirm-shipped",
  "delivered",
  "return-received",
  "return-approve",
  "return-reject",
  "waive-box",
  "retry-payment",
  "cancel",
  "redeliver",
]);
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
  return api(async () => {
    assertOrigin(req);
    const who = await admin();
    const p = await params;
    const id = z.uuid().parse(p.id);
    const action = actions.parse(p.action);
    const v = await readJson(
      req,
      z
        .object({
          days: z.number().int().min(1).max(365).optional(),
          pillow: z.boolean().optional(),
          box: z.boolean().optional(),
          guide: z.boolean().optional(),
          reason: z.string().trim().min(1).max(500).optional(),
          tracking: z.string().trim().min(6).max(80).optional(),
        })
        .strict(),
    );
    return adminAction(getDb(), id, action, v, who);
  });
}
