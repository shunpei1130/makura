import { NextResponse } from "next/server";
import * as oidc from "openid-client";
import { googleConfig, signSession, cookieOptions } from "@/lib/auth";
import { appUrl } from "@/lib/security";
export async function GET() {
  try {
    const config = await googleConfig();
    const state = oidc.randomState(),
      verifier = oidc.randomPKCECodeVerifier(),
      nonce = oidc.randomNonce();
    const url = oidc.buildAuthorizationUrl(config, {
      redirect_uri: `${appUrl()}/api/auth/callback/google`,
      scope: "openid email",
      state,
      nonce,
      code_challenge: await oidc.calculatePKCECodeChallenge(verifier),
      code_challenge_method: "S256",
      prompt: "select_account",
    });
    const res = NextResponse.redirect(url);
    res.cookies.set(
      "makura_oauth",
      await signSession({ state, verifier, nonce }, "oauth", "10m"),
      { ...cookieOptions, maxAge: 600 },
    );
    return res;
  } catch {
    return NextResponse.redirect(`${appUrl()}/admin/login?error=config`);
  }
}
