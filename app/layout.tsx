import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./commerce.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "夢重力マクラ | 30日、0円で試してください。",
  description:
    "本日0円・カード登録。返品しなければ30日後13,480円（税込）を1回自動請求。返品は期限内申請・枕と箱の返送・受領承認で商品代免除。返品送料はお客様負担。",
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "30日、0円で試してください。",
    description:
      "寝姿勢に合わせて選べる夢重力マクラ。本日0円・カード登録。返さなければ30日後13,480円（税込）。返品承認で商品代免除、返品送料はお客様負担。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
