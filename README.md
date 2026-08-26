# 夢重力マクラ storefront

夢重力マクラの購入サイトです。仰向け中心の縦向きタイプと、横向き中心の横向きタイプを選び、Squareの商品ページで13,480円（税込）の一回購入へ進めます。

## ローカル起動

~~~powershell
npm install
npm run dev
~~~

本番ビルドの確認:

~~~powershell
npm run typecheck
npm run build
~~~

## 購入リンク

購入リンクは lib/constants.ts にまとめています。

- 縦向きタイプ: https://square.link/u/GW58fL76
- 横向きタイプ: https://square.link/u/nKfRlpkh

睡眠診断 (public/16.html とルートの 16.html) の結果画面も同じ商品ページへリンクします。

## デプロイ

GitHub の main ブランチを Vercel プロジェクトへ接続し、production deployment を有効にしてください。
独自ドメインを接続する場合は、Vercel が表示するDNSレコードを現在のDNS管理画面へ追加します。
