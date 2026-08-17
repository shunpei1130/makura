# 夢重力マクラ 30日試眠型

既存の静的サイトに、30日間の自宅試眠、Stripeの後日決済、返却申請、紹介コード、マイページを追加したNext.jsアプリです。

## ローカル起動

```powershell
Copy-Item .env.example .env.local
# .env.local に Neon / Stripe のテスト値を設定
npm install
npm run db:migrate
npm run dev
```

StripeのWebhookをローカルへ転送する場合は、Stripe CLIで次を実行します。

```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

表示された `whsec_...` を `STRIPE_WEBHOOK_SECRET` に設定してください。

## 必須環境変数

- `DATABASE_URL`: Neonのプール接続文字列
- `STRIPE_SECRET_KEY`: 開発中はテストキー。本番では可能な限り制限付きキーを使用
- `STRIPE_WEBHOOK_SECRET`: Stripe Webhook署名検証用
- `APP_URL`: リダイレクト・マイページ・紹介URLの基準URL
- `CRON_SECRET`: Vercel Cronの認証用
- `ADMIN_SECRET`: 管理画面APIの認証用

`RESEND_API_KEY` と `EMAIL_FROM` を設定すると、申込完了・決済成功・決済失敗の通知をResend互換APIから送信します。未設定時はサーバーログへ送信予定を出力します。

## 本番で設定するStripe Webhook

- `checkout.session.completed`
- `setup_intent.succeeded`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

カード情報はアプリやNeonへ保存せず、Stripe Customer / PaymentMethodのIDだけを保存します。期限到来時はVercel Cronが `/api/cron/charge-trials` を呼び、保存済みPaymentMethodを `off_session` で13,480円決済します。

## 注意

本番公開前に、特商法表記、利用規約、返品条件、返送料負担、配送・返却業務、決済失敗時の再試行方針、メール送信元ドメインを確定してください。`app/terms/page.tsx` は実装確認用の仮ページです。
