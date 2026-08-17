import { createHash, randomBytes } from "node:crypto";

export function createAccessToken() {
  return randomBytes(32).toString("hex");
}

export function hashAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createReferralCode() {
  return `ref-${randomBytes(6).toString("hex")}`;
}

export function createReturnCode() {
  return `RT-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null
  );
}
