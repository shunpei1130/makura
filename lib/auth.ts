import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import * as oidc from "openid-client";
import { AppError, appUrl, required, secret } from "./security";
const allowed = "s.hasegawa1130@gmail.com";
export async function googleConfig() {
  return oidc.discovery(
    new URL("https://accounts.google.com"),
    required("GOOGLE_CLIENT_ID"),
    required("GOOGLE_CLIENT_SECRET"),
  );
}
export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};
export async function signSession(
  payload: Record<string, unknown>,
  purpose: string,
  expires = "8h",
) {
  return new SignJWT({ ...payload, purpose })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(appUrl())
    .setAudience("makura")
    .setExpirationTime(expires)
    .sign(new TextEncoder().encode(secret()));
}
export async function verifySession(token: string, purpose: string) {
  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(secret()),
    { algorithms: ["HS256"], issuer: appUrl(), audience: "makura" },
  );
  if (payload.purpose !== purpose) throw new Error("PURPOSE");
  return payload;
}
export async function admin() {
  try {
    const token = (await cookies()).get("makura_admin")?.value;
    if (!token) throw new Error("NO_SESSION");
    const p = await verifySession(token, "admin");
    if (p.email !== allowed) throw new Error("NOT_ALLOWED");
    return allowed;
  } catch {
    throw new AppError("UNAUTHORIZED", 401);
  }
}
export function allowedAdmin(email: unknown, verified: unknown) {
  return (
    typeof email === "string" &&
    email.toLowerCase() === allowed &&
    verified === true
  );
}
