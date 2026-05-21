import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { ComingSoonToast } from "@/components/ui/ComingSoonToast";
import "./globals.css";

const notoEmoji = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://assetninja.jp'),
  title: {
    default: "Free Japanese PNG Assets for Commercial Use | AssetNinja",
    template: "%s | AssetNinja"
  },
  description: "Download high-quality Japanese transparent PNG assets. Commercial-use ready AI-generated PNGs including food, culture, business, and medical illustrations.",
  keywords: ["PNG", "背景透過", "素材", "AI素材", "フリー素材", "商用利用", "日本素材", "AssetNinja", "切り抜き画像", "Transparent PNG", "Free PNG", "Japanese Assets"],
  openGraph: {
    title: "Free Japanese PNG Assets for Commercial Use | AssetNinja",
    description: "Download high-quality Japanese transparent PNG assets. Commercial-use ready AI-generated PNGs.",
    url: 'https://assetninja.jp',
    siteName: 'AssetNinja',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Free Japanese PNG Assets for Commercial Use | AssetNinja",
    description: "Download high-quality Japanese transparent PNG assets. Commercial-use ready AI-generated PNGs.",
  },
  alternates: {
    canonical: 'https://assetninja.jp',
  },
  icons: {
    icon: '/brand/ninja-char-7.png',
    apple: '/brand/ninja-char-7.png',
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
        <ComingSoonToast />
      </body>
    </html>
  );
}
