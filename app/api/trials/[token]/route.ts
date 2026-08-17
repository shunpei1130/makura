import { NextResponse } from "next/server";
import { getReferralCount } from "@/lib/referrals";
import { getTrialByToken } from "@/lib/trials";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const trial = await getTrialByToken(token);

  if (!trial) return NextResponse.json({ error: "申込が見つかりません。" }, { status: 404 });

  return NextResponse.json({
    name: trial.name,
    status: trial.status,
    orientation: trial.orientation,
    trialStartedAt: trial.trialStartedAt,
    trialEndsAt: trial.trialEndsAt,
    returnRequestedAt: trial.returnRequestedAt,
    returnCode: trial.returnCode,
    returnStatus: trial.returnStatus,
    chargeStatus: trial.chargeStatus,
    chargeAttempts: trial.chargeAttempts,
    lastChargeError: trial.lastChargeError,
    referralCode: trial.referralCode,
    referralCount: await getReferralCount(trial.id),
  });
}
