import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || request.headers.get("x-admin-secret") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sql = getDb();
  const rows = await sql`
    SELECT id, name, email, orientation, shipping_name, shipping_address, status, trial_ends_at, return_status,
      charge_status, charge_attempts, last_charge_error, referral_code, created_at
    FROM trials
    ORDER BY created_at DESC
    LIMIT 200
  `;
  return NextResponse.json({ trials: rows });
}
