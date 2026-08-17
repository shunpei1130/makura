import { NextResponse } from "next/server";
import { z } from "zod";
import { createSetupCheckout } from "@/lib/checkout";
import { getTrialByToken } from "@/lib/trials";

const schema = z.object({ token: z.string().min(40).max(100) });

export async function POST(request: Request) {
  try {
    const { token } = schema.parse(await request.json());
    const trial = await getTrialByToken(token);
    if (!trial || !trial.stripeCustomerId || !["active", "payment_failed"].includes(trial.status)) {
      return NextResponse.json({ error: "この申込ではカード更新を開始できません。" }, { status: 400 });
    }

    const remainingDays = Math.max(1, Math.ceil((new Date(trial.trialEndsAt).getTime() - Date.now()) / 86_400_000));
    const session = await createSetupCheckout({
      trialId: trial.id,
      accessToken: token,
      customerId: trial.stripeCustomerId,
      trialDays: remainingDays,
      origin: process.env.APP_URL || new URL(request.url).origin,
    });
    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "申込トークンが正しくありません。" }, { status: 400 });
    console.error("payment method update failed", error);
    return NextResponse.json({ error: "カード更新画面を開けませんでした。" }, { status: 500 });
  }
}
