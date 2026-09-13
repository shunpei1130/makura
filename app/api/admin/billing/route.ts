import { randomUUID } from "node:crypto";
import { z } from "zod";
import { admin } from "@/lib/auth";
import { api, assertOrigin, readJson } from "@/lib/security";
import { getDb } from "@/lib/db/client";
export async function POST(req: Request) {
  return api(async () => {
    assertOrigin(req);
    const who = await admin();
    const { enabled } = await readJson(
      req,
      z.object({ enabled: z.boolean() }).strict(),
    );
    await getDb().transaction(async (tx) => {
      await tx.query(
        "INSERT INTO system_controls(key,enabled) VALUES('auto_charge_enabled',$1) ON CONFLICT(key) DO UPDATE SET enabled=$1,updated_at=now()",
        [enabled],
      );
      await tx.query(
        "INSERT INTO audit_events(id,actor_type,actor_id,event_type,after_json) VALUES($1,$2,$3,$4,$5)",
        [
          randomUUID(),
          "admin",
          who,
          "billing_switch",
          JSON.stringify({ enabled }),
        ],
      );
    });
    return {
      enabled,
      environment_enabled: process.env.AUTO_CHARGE_ENABLED === "true",
    };
  });
}
