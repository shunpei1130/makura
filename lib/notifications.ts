type EmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

async function sendEmail(input: EmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.info(`[email skipped] ${input.to}: ${input.subject}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html ?? input.text.replaceAll("\n", "<br>")
    }),
  });

  if (!response.ok) {
    console.error("Email delivery failed", await response.text());
  }
}

export async function sendTrialActivatedEmail(input: {
  email: string;
  name: string;
  trialEndsAt: string;
  pageUrl: string;
}) {
  await sendEmail({
    to: input.email,
    subject: "夢重力マクラの30日試眠が始まりました",
    text: `${input.name} 様\n\nカード登録が完了しました。試眠期限は ${input.trialEndsAt} です。\n\n気に入ったら返却不要です。返却する場合は期限までにマイページから申請してください。\n\nマイページ: ${input.pageUrl}`,
  });
}

export async function sendPaymentFailureEmail(input: {
  email: string;
  pageUrl: string;
}) {
  await sendEmail({
    to: input.email,
    subject: "夢重力マクラのお支払いを確認できませんでした",
    text: `夢重力マクラの試眠終了後のお支払いを確認できませんでした。カード情報を確認し、マイページから手続きを進めてください。\n\nマイページ: ${input.pageUrl}`,
  });
}

export async function sendPurchaseConfirmationEmail(input: {
  email: string;
  name: string;
}) {
  await sendEmail({
    to: input.email,
    subject: "夢重力マクラがあなたのものになりました",
    text: `${input.name} 様\n\n30日試眠の決済が完了しました。夢重力マクラはこれからもあなたのものです。`,
  });
}
