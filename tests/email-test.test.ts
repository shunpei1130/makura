import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { sendPreviewTestEmail, type MailSender } from "../lib/email/service";

const originalVercelEnv = process.env.VERCEL_ENV;
const originalSquareEnvironment = process.env.SQUARE_ENVIRONMENT;

beforeEach(() => {
  process.env.VERCEL_ENV = "preview";
  process.env.SQUARE_ENVIRONMENT = "sandbox";
});

afterEach(() => {
  if (originalVercelEnv === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = originalVercelEnv;
  if (originalSquareEnvironment === undefined)
    delete process.env.SQUARE_ENVIRONMENT;
  else process.env.SQUARE_ENVIRONMENT = originalSquareEnvironment;
});

describe("Preview email test", () => {
  it("sends only a fixed admin test message with a daily idempotency key", async () => {
    let sent: Parameters<MailSender>[0] | undefined;
    const sender: MailSender = async (mail) => {
      sent = mail;
      return "resend-test-id";
    };

    await expect(sendPreviewTestEmail(sender)).resolves.toBe("resend-test-id");
    expect(sent).toMatchObject({
      to: "s.hasegawa1130@gmail.com",
      subject: "夢重力マクラ｜メール送信テスト（Preview）",
    });
    expect(sent?.id).toMatch(/^makura-preview-email-test-\d{4}-\d{2}-\d{2}$/);
    expect(sent?.text).toContain("注文・決済・発送は発生していません");
    expect(sent?.text).not.toContain("申込番号");
  });

  it.each([
    { vercel: "production", square: "production" },
    { vercel: "preview", square: "production" },
    { vercel: undefined, square: "sandbox" },
  ])("refuses to send outside a Preview Sandbox deployment", async (env) => {
    if (env.vercel) process.env.VERCEL_ENV = env.vercel;
    else delete process.env.VERCEL_ENV;
    if (env.square) process.env.SQUARE_ENVIRONMENT = env.square;
    else delete process.env.SQUARE_ENVIRONMENT;
    const sender: MailSender = async () => "should-not-send";

    await expect(sendPreviewTestEmail(sender)).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
  });
});
