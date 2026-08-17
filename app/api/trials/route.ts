import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CONSENT_TEXT,
  REFERRED_TRIAL_DAYS,
  STANDARD_TRIAL_DAYS,
} from "@/lib/constants";
import { createSetupCheckout } from "@/lib/checkout";
import { createTrial, getTrialByReferralCode, updateTrialStripeCustomer } from "@/lib/trials";
import { createAccessToken, createReferralCode, addDays, getClientIp, hashAccessToken } from "@/lib/tokens";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getDb } from "@/lib/db";

const trialSchema = z.object({
  name: z.string().trim().min(1, "お名前を入力してください。").max(80),
  email: z.string().trim().email("メールアドレスを確認してください.").max(180),
  orientation: z.enum(["vertical", "horizontal"]),
  referralCode: z.string().trim().max(80).optional().default(""),
  consent: z.literal(true, { error: "後日決済への同意が必要です。" }),
});

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "現在は申込受付の設定中です。Stripeのテストキーを設定してください。" },
        { status: 503 },
      );
    }

    const input = trialSchema.parse(await request.json());
    const email = input.email.toLowerCase();
    const sql = getDb();
    const existing = await sql`
      SELECT id FROM trials
      WHERE lower(email) = ${email}
        AND status IN ('pending_checkout', 'active', 'return_requested')
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "このメールアドレスでは、すでに試眠申込があります。マイページをご確認ください。" },
        { status: 409 },
      );
    }

    const referrer = input.referralCode ? await getTrialByReferralCode(input.referralCode) : null;
    const validReferrer = referrer && ["active", "purchased"].includes(referrer.status) ? referrer : null;
    const trialDays = validReferrer ? REFERRED_TRIAL_DAYS : STANDARD_TRIAL_DAYS;
    const accessToken = createAccessToken();
    const trial = await createTrial({
      name: input.name,
      email,
      orientation: input.orientation,
      accessTokenHash: hashAccessToken(accessToken),
      referralCode: createReferralCode(),
      referrerId: validReferrer?.id ?? null,
      trialEndsAt: addDays(new Date(), trialDays),
      consentText: CONSENT_TEXT,
      consentIp: getClientIp(request),
      consentUserAgent: request.headers.get("user-agent"),
    });

    const stripe = getStripe();
    const customer = await stripe.customers.create({
      email,
      name: input.name,
      metadata: { trialId: trial.id, product: "yumeggravity-trial" },
    });
    await updateTrialStripeCustomer(trial.id, customer.id);

    const origin = process.env.APP_URL || new URL(request.url).origin;
    const session = await createSetupCheckout({
      trialId: trial.id,
      accessToken,
      customerId: customer.id,
      trialDays,
      origin,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "入力内容を確認してください。" }, { status: 400 });
    }

    console.error("trial creation failed", error);
    return NextResponse.json({ error: "申込を開始できませんでした。時間をおいて再度お試しください。" }, { status: 500 });
  }
}
