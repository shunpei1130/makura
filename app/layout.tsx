import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "夢重力マクラ | 感動したら、返さないでください。",
  description:
    "夢重力マクラを、あなたの寝姿勢に合わせて選んで購入。TPEハニカム構造と高さ設計で、毎日の睡眠を支えます。",
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "感動したら、返さないでください。",
    description: "寝姿勢に合わせて選べる夢重力マクラ。Squareで13,480円（税込）の一回購入。",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
