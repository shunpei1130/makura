import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";
import { z } from "zod";
import type { DB } from "./db/client";
export class AppError extends Error {
  constructor(
    public code: string,
    public status = 400,
  ) {
    super(code);
  }
}
export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function required(name: string) {
  const v = process.env[name];
  if (!v) throw new AppError("SERVICE_UNAVAILABLE", 503);
  return v;
}
export function secret() {
  const s = required("APP_SECRET");
  if (s.length < 32) throw new AppError("SERVICE_UNAVAILABLE", 503);
  return s;
}
export function publicToken(id: string) {
  return createHmac("sha256", secret())
    .update(`trial:${id}`)
    .digest("base64url");
}
export function secureEqual(a: string, b: string) {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function seal(text: string) {
  const iv = randomBytes(12);
  const c = createCipheriv(
    "aes-256-gcm",
    createHash("sha256").update(secret()).digest(),
    iv,
  );
  return Buffer.concat([
    iv,
    c.update(text, "utf8"),
    c.final(),
    c.getAuthTag(),
  ]).toString("base64url");
}
export function unseal(text: string) {
  const b = Buffer.from(text, "base64url");
  const c = createDecipheriv(
    "aes-256-gcm",
    createHash("sha256").update(secret()).digest(),
    b.subarray(0, 12),
  );
  c.setAuthTag(b.subarray(-16));
  return Buffer.concat([c.update(b.subarray(12, -16)), c.final()]).toString(
    "utf8",
  );
}
export function appUrl() {
  return required("APP_URL").replace(/\/$/, "");
}
export function assertOrigin(req: Request) {
  if (req.headers.get("origin") !== new URL(appUrl()).origin)
    throw new AppError("FORBIDDEN", 403);
}
export async function readJson<T>(
  req: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  if (Number(req.headers.get("content-length") || 0) > 16000)
    throw new AppError("TOO_LARGE", 413);
  const raw = await req.text();
  if (raw.length > 16000) throw new AppError("TOO_LARGE", 413);
  try {
    return schema.parse(JSON.parse(raw));
  } catch {
    throw new AppError("INVALID_INPUT");
  }
}
export async function rateLimit(db: DB, req: Request, scope: string, max = 15) {
  const ip =
    req.headers.get("x-vercel-forwarded-for") ||
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    "local";
  const key = hash(`${scope}:${ip}`);
  const { rows } = await db.query<{ count: number }>(
    `INSERT INTO rate_limits (key,count,expires_at) VALUES ($1,1,now()+interval '10 minutes') ON CONFLICT (key) DO UPDATE SET count=CASE WHEN rate_limits.expires_at<now() THEN 1 ELSE rate_limits.count+1 END, expires_at=CASE WHEN rate_limits.expires_at<now() THEN now()+interval '10 minutes' ELSE rate_limits.expires_at END RETURNING count`,
    [key],
  );
  if (rows[0].count > max) throw new AppError("RATE_LIMITED", 429);
}
export async function api(fn: () => Promise<unknown>) {
  try {
    return Response.json(await fn(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    const known = e instanceof AppError;
    if (!known) console.error("request_failed");
    return Response.json(
      { error: known ? e.code : "SERVICE_UNAVAILABLE" },
      {
        status: known ? e.status : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
