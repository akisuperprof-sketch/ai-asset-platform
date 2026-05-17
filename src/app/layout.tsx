import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoEmoji = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ai-asset-platform.vercel.app'),
  title: {
    default: "AssetNinja - 日本発 高品質AI透過PNG素材",
    template: "%s | AssetNinja"
  },
  description: "商用利用可能な高品質AI透過PNG素材サイト。背景切り抜き済みの日本素材（食、医療、小物など）が無料でダウンロード可能。Webデザインや資料作成の効率を劇的に向上させます。",
  keywords: ["PNG", "背景透過", "素材", "AI素材", "フリー素材", "商用利用", "日本素材", "AssetNinja", "切り抜き画像"],
  openGraph: {
    title: "AssetNinja - 日本発 高品質AI透過PNG素材",
    description: "商用利用可能な日本特化の高品質AI生成透過PNG素材ライブラリ。",
    url: 'https://ai-asset-platform.vercel.app',
    siteName: 'AssetNinja',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "AssetNinja - 日本発 高品質AI透過PNG素材",
    description: "高品質な日本特化のAI生成透過PNG素材ライブラリ。",
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoEmoji.variable}`}>
      <body className="bg-black text-foreground antialiased selection:bg-ai-purple/30">
        <main className="relative min-height-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
