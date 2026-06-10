import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    template: "%s | BodyLog",
    default: "BodyLog — 体組成トラッカー",
  },
  description:
    "体組成計の写真を撮るだけで自動記録。体重・体脂肪率・筋肉量の変化をグラフで可視化するパーソナルトラッカーです。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        {/* MANDATORY: FOUCを防ぐためのcolor-scheme宣言 */}
        <meta name="color-scheme" content="light dark" />
      </head>
      <body>
        <Providers>
          <NavBar />
          <main id="main-content">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
