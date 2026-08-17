import { NextResponse } from "next/server";
import { chargeDueTrials } from "@/lib/charge";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || authorization !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const results = await chargeDueTrials();
    return NextResponse.json({ ok: true, processed: results.length, results });
  } catch (error) {
    console.error("trial charge cron failed", error);
    return NextResponse.json({ ok: false, error: "Charge job failed" }, { status: 500 });
  }
}
