import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import * as oidc from "openid-client";
import {
  googleConfig,
  verifySession,
  signSession,
  cookieOptions,
  allowedAdmin,
} from "@/lib/auth";
import { appUrl } from "@/lib/security";
export async function GET(req: Request) {
  try {
    const token = (await cookies()).get("makura_oauth")?.value || "";
    const p = await verifySession(token, "oauth");
    const current = new URL("/api/auth/callback/google", appUrl());
    current.search = new URL(req.url).search;
    const tokens = await oidc.authorizationCodeGrant(
      await googleConfig(),
      current,
      {
        pkceCodeVerifier: String(p.verifier),
        expectedState: String(p.state),
        expectedNonce: String(p.nonce),
        idTokenExpected: true,
      },
    );
    const claims = tokens.claims();
    if (!allowedAdmin(claims?.email, claims?.email_verified))
      throw new Error("NOT_ALLOWED");
    const res = NextResponse.redirect(`${appUrl()}/admin/trials`);
    res.cookies.set(
      "makura_admin",
      await signSession(
        { email: String(claims!.email).toLowerCase(), sub: claims!.sub },
        "admin",
      ),
      { ...cookieOptions, maxAge: 28800 },
    );
    res.cookies.delete("makura_oauth");
    return res;
  } catch {
    const res = NextResponse.redirect(`${appUrl()}/admin/login?error=auth`);
    res.cookies.delete("makura_oauth");
    return res;
  }
}
