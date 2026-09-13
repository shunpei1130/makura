# 夢重力マクラ storefront

対象2商品は各13,480円（税込）。申込時0円でSquareへカードを保存し、返品が成立しない場合は30日後に1回自動決済します。返品送料はお客様が配送会社へ直接支払う元払い方式です。

## 開発

`npm install` 後、`.env.example` を基に `.env.local` を設定し `npm run dev`。
`npm run typecheck`、`npm test`、`npm run build` で検証します。
`npm run db:generate` / `npm run db:migrate` はDrizzleによるスキーマ管理です。マイグレーションは直接接続URL、実行時はプール接続URLを使用してください。

## 画面・API

- /checkout?type=vertical または horizontal: 商品1点の申込
- /return: 注文番号とメールによる専用リンク再送
- /return/{token}: 申込状況、返品申請、追跡番号登録
- /payment/update/{token}: 失敗した決済のカード更新
- /admin/trials: Google許可アカウント限定の出荷・返品・請求管理
- /api/webhooks/square: Square署名検証と決済結果照合
- /api/cron/charge-trials, return-deadlines, notifications: CRON_SECRETで保護
- /box-care-card.html: 印刷用の同梱カード

## 環境と停止

本番とPreviewのSquare・Neon・秘密値を分離。Previewは必ずSandboxを使用します。Google callbackは APP_URL + /api/auth/callback/google。認証対象は s.hasegawa1130@gmail.com の確認済みメールのみです。
Square通知URLに認証用クエリがある場合は、`SQUARE_WEBHOOK_URL` に完全なURLを機密値として設定します。未指定時は `APP_URL + /api/webhooks/square` を署名検証に使用します。
APP_SECRETは32文字以上の乱数。注文専用リンクと通知本文の保護に使うため、無計画に変更しないでください。
CHECKOUT_ENABLED=trueで新規受付。課金はAUTO_CHARGE_ENABLED=trueかつDBのsystem_controls.auto_charge_enabled=trueのときのみ有効です。どちらかがfalseなら決済を作成しません。管理画面で緊急停止できます。
テスト日付変更は `npm run sandbox:clock -- UUID ISO_DATE`。Sandbox環境とSANDBOX_DATABASE_HOSTの一致が必要で、本番では使用できません。

## 運用

毎日、出荷待ち・返品追跡・返品確認待ち・却下品再送待ち・決済失敗・通知失敗を管理画面で確認します。発送は枕・返品用箱・案内カードの3点チェックが必須です。
返品承認で商品代免除。未返送の最終通知が送信できない間は返品を失効させません。管理者の手動保留解除で返品保留を解除することはできません。
詳しい確定仕様・リリース条件・ロールバック・検証記録は [運用メモ](docs/implementation-notes.md) を参照してください。

実Neonでの検証は `RUN_DATABASE_INTEGRATION=true` を指定し、Nodeの `--env-file=.env.local` で `node_modules/vitest/vitest.mjs run` を実行します。別のランダムな試験用スキーマを作成して終了時に破棄し、通常の注文データを変更しません。
実Square SandboxのA〜Hはさらに `RUN_SQUARE_SANDBOX=true` と `-t 'A:|B:|C:|D:|E:|F:|G:|H:'` を指定します。本番では実行できません。
