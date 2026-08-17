import { NextResponse } from "next/server";
import { z } from "zod";
import { createReturnCode } from "@/lib/tokens";
import { getTrialByToken, requestTrialReturn } from "@/lib/trials";

const schema = z.object({ token: z.string().min(40).max(100) });

export async function POST(request: Request) {
  try {
    const { token } = schema.parse(await request.json());
    const trial = await getTrialByToken(token);

    if (!trial) return NextResponse.json({ error: "申込が見つかりません。" }, { status: 404 });

    if (trial.returnStatus === "requested" && trial.returnCode) {
      const origin = process.env.APP_URL || new URL(request.url).origin;
      return NextResponse.json({ returnCode: trial.returnCode, returnUrl: `${origin}/return/${trial.returnCode}` });
    }

    if (trial.chargeStatus === "processing" || trial.chargeStatus === "succeeded") {
      return NextResponse.json({ error: "現在、決済処理中のため返却申請を受け付けられません。" }, { status: 409 });
    }

    const updated = await requestTrialReturn(trial.id, createReturnCode());
    if (!updated || !updated.returnCode) {
      return NextResponse.json({ error: "返却期限を過ぎているか、すでに状態が変わっています。" }, { status: 409 });
    }

    const origin = process.env.APP_URL || new URL(request.url).origin;
    return NextResponse.json({ returnCode: updated.returnCode, returnUrl: `${origin}/return/${updated.returnCode}` });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "返却トークンが正しくありません。" }, { status: 400 });
    console.error("return request failed", error);
    return NextResponse.json({ error: "返却申請に失敗しました。" }, { status: 500 });
  }
}
