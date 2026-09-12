# 30日0円トライアル 実装・運用メモ

## 確定した仕様

- 2026-09-10〜11のユーザー回答を添付v1.1より優先。返品は元払い実費を配送会社へ直接支払い、返品送料のカード課金・送料用設定値は不要。
- 返品不成立が早期に確定しても、当初の請求日より前に商品代を請求しない。
- 配送遅延の延長は課金日と返品申請期限の両方に適用。
- 返送の追跡は管理者が確認。配達済みでも実物の受領・承認までは免除未確定。
- 却下品は販売者負担で再送。旧注文の移行は今回の対象外。
- 管理者は s.hasegawa1130@gmail.com のGoogleログインのみ。
- 販売者情報はSquareおよびユーザー指定。通常の返送先は公表住所。往路送料0円・原則7営業日以内の発送を通常条件とする。

## 決済の整合性

注文行をロックして課金対象を再確認し、決済要求のキー・使用カード・試行番号をDBへ確定保存してからSquareを呼ぶ。決済結果を記録する間も注文行をロックする。通信切断時はUNKNOWNとして同一キー・同一カード・同一金額で照合を繰り返す。確定失敗のみ別の試行を作成可能。キーはAPIの45文字制限以内のUUID。

期限は timestamptz で保存し日本時間表示。30日は720時間、返送は168時間。期限ちょうどの返品は受け付け、課金は期限を厳密に過ぎてから。手動保留と返品保留は独立しており、手動解除で返品保留を解除できない。

通知はDB outboxで永続化、注文トークンを含む本文はAPP_SECRETで暗号化。返品最終通知の送信成功時から24時間の猶予を計算する。送信失敗のまま返品を失効させない。商品代免除と返品レビュー状態は決済状態とは別に保持する。

## 安全なリリース

1. Sandbox DBでマイグレーション・テストを完了し、PreviewにはSandboxのSquare・DBのみを設定する。
2. Square公式Web Payments SDKのSTORE intentでカードを登録し、本人認証をSDKに任せる。日本向けの実際の3DS挙動をSandboxと本番設定で確認する。
3. 本番のSquare ID・店舗・通貨・Webhook署名・送信ドメイン・Google OAuth callbackを確認する。
4. 最初はCHECKOUT_ENABLED=false、AUTO_CHARGE_ENABLED=false、DBスイッチfalseでデプロイする。
5. UIと保存・通知の確認後、新規受付を有効化。Sandbox A-H成功および本番設定の確認を記録してから課金の環境変数・DBスイッチを両方有効化する。
6. 本番で実カードを使う検証は利用者本人が入力。試験注文は直後にキャンセルし将来課金を防止する。

## 元の本番

- commit: 0006bfe610451045592e323254666963813ae017
- deployment: https://makura-gk0orgw6p-shunpei1130s-projects.vercel.app
- domain: https://zero-g-makura.com/
- project: https://vercel.com/shunpei1130s-projects/makura
- DB: Neon makura-trials / old-unit-87148908 / aws-ap-southeast-1
- production branch: br-small-shadow-az1bdvdz
- sandbox branch: br-bitter-glade-azgiixlc

障害時はまず管理画面でDB側課金スイッチを停止する。環境変数もfalseとして再デプロイする。既存の決済結果のWebhook照合は継続する。Vercelの旧バージョンへ戻す場合も先にスイッチ停止し、DBは削除しない。ロールバック後は新規注文・返品受付の可用性も確認し、受付障害でユーザーの期限が失われないよう延長・個別対応する。

## 確認した公式資料

- https://developer.squareup.com/docs/web-payments/charge-and-store-cards
- https://developer.squareup.com/reference/square/payments-api/create-payment (API 2026-08-19)
- https://developer.squareup.com/docs/webhooks/step3validate
- https://developer.squareup.com/docs/web-payments/content-security-policy
- https://www.no-trouble.caa.go.jp/what/mailorder/
- https://vercel.com/docs/cron-jobs/manage-cron-jobs
- https://github.com/panva/openid-client

## 検証記録

2026-09-12:

- PGliteによる自動テスト22件成功。301件の注文でも先頭300件に処理が停滞せず、残りの通知を次の実行で処理するケースを含む。
- 同日の改修前21件は実Neon Sandbox PostgreSQLでも全件成功。同時実行による決済の排他も確認。追加した301注文の通知テストも実Neonで成功（139.52秒）。
- 実Square Sandboxと実NeonでケースA〜Hの8件成功。カード保存、13,480円の実Sandbox決済、確定失敗の再試行、同時実行、期限境界を確認。メール送信はこのテストでは模擬送信。
- ChromeからSquare公式JCB試験カードを使い、3Dセキュア認証→0円カード保存→申込完了→返品申請→追跡登録を確認。注文 `MG-90B56F07180A` は返送中・請求保留・未課金をDBで確認後、キャンセル済み。未送信の試験メールも停止済み。
- マイグレーション0000・0001をSandboxとProductionに適用。Productionは注文0件、DB課金スイッチfalseで初期化。
- `npm run typecheck`、`npm run build` 成功。`npm audit --omit=dev` は脆弱性0件。
- Vercel Preview `dpl_Fo5uBSayhVEQhRyqsEfGiMB78m5i` がREADY。確認先: https://makura-trial-preview-shunpei1130s-projects.vercel.app 。本番への切替前に後続の変更も再デプロイする。
- Square本番店舗 `LVC43F4M8J9XV`（夢重力マクラ）、Sandbox店舗 `L4V5KQZXMZGH5` のJP・JPY・カード処理対応を実APIで確認。
- Squareのpayment.created/payment.updated通知先を本番とSandboxに作成。Sandboxは有効化し、両イベントの実通知でHTTP 200とフィルター通過を確認。本番は公開確認前のため無効。
- Google Cloud専用プロジェクト `makura-trials` に `Makura Admin Web` を作成。ユーザー承認を得てポリシー同意済み。管理者だけをテストユーザーに登録し、プレビューでGoogleログイン→注文一覧表示に成功。権限はopenid/emailのみ。
- Resend通知用ドメインを作成。[必要なDNS設定](email-dns.md)の反映、送信キー、メール到達は未完了。

本番公開、実メール到達、Googleログイン、本番の主要画面確認が完了するまでは実装全体の完了とはしない。本番受付・課金の環境変数はfalseで保持。

## 接続制限と通知URL

カード登録画面のみ、本人認証先の銀行が任意のHTTPSドメインを利用できるようframe-srcとform-actionを設定。その他の画面では広げない。Sandboxの3DS先 `api.squareupsandbox.com` も許可し、Chromeで認証完了まで確認済み。

PreviewのVercel認証は維持し、Squareの試験通知に専用の自動処理用秘密値を付ける。`SQUARE_WEBHOOK_URL` にはクエリも含めた正確な通知URLを機密値として保存し、そのURLと未加工本文でSquare署名を検証する。秘密値・URLをGit・文書・画面ログへ記載しない。

申込・返品・カード更新・管理画面はAPP_URLのホストへ統一し、wwwや別のデプロイURLから開いてもCookieと送信元の検証が一致するようにする。

GitHubの作業ブランチは `feat/zero-yen-30day-trial`、レビューは https://github.com/shunpei1130/makura/pull/1 （本番接続確認が残るためDraft）。
