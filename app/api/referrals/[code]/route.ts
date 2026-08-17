import { NextResponse } from "next/server";
import { getReferralCount } from "@/lib/referrals";
import { getTrialByReferralCode } from "@/lib/trials";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const trial = await getTrialByReferralCode(code);
  if (!trial) return NextResponse.json({ valid: false }, { status: 404 });
  return NextResponse.json({ valid: ["active", "purchased"].includes(trial.status), count: await getReferralCount(trial.id) });
}
