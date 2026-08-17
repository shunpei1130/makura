import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "夢重力マクラ | 感動したら、返さないでください。",
  description:
    "夢重力マクラを30日間、あなたのベッドでお試しください。今日のお支払いは0円。気に入らなければ箱に戻して返すだけです。",
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "感動したら、返さないでください。",
    description: "30日間、あなたのベッドで試せる夢重力マクラ。",
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
