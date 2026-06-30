import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "日々吉方エンジン",
  description: "星回りを知り、方位を選び、気を整える。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
