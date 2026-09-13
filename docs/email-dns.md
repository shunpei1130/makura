# 通知メールのドメイン確認

送信元は `夢重力マクラ <orders@notify.zero-g-makura.com>`、返信先は `s.hasegawa1130@gmail.com`。受信メールの移行は行わない。

Resend に通知専用ドメイン `notify.zero-g-makura.com` を作成済み（Tokyo）。2026-09-12時点でDNS登録・確認待ち。
ドメインID: `990b2775-2148-4d9a-b808-eacc773886af`

`zero-g-makura.com` のDNS管理画面に、以下の3件を追加する。名前を完全なドメイン名で指定する画面では、末尾に `.zero-g-makura.com` を付ける。TTLは既定値。既存のA・MX・TXT・ネームサーバーは変更しない。

| 種類  | 名前                       | 内容                                                                                                                                                                                                                         |
| ----- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TXT   | `resend._domainkey.notify` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDl7ztOFqmOirEFayxDlZr9GfuJIpK1/2MAQ/4wioOw+XZoEB0X4wnxBk1BISP0yCskO0Pi/WMDMwL0ocBP2STi9VLgDhY5BMHPVJ1TL7yTr73NOzkLOdT3dJMCRVLZpadihcTj/I0lMjWeNu94s1BFB86JIfdkM8MuoL1EYz3sJQIDAQAB` |
| CNAME | `rsend.notify`             | `rsend-apne1.forge.rmta.net`                                                                                                                                                                                                 |
| CNAME | `send.notify`              | `send.forge.rmta.net`                                                                                                                                                                                                        |

このTXT値は公開用のDKIM鍵であり、API秘密鍵ではない。DNS反映後にResendの確認を実行し、`Verified` になってからこのドメインに限定した送信専用APIキーを作成する。
設定後は管理者宛てに試験通知を送り、Resendの到達状況とアプリの送信記録を確認する。
