import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoEmoji = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "SUKASHI - AI Transparent PNG Assets from Japan",
  description: "日本発の次世代AI背景透過アセットプラットフォーム。高品質なPNG素材を無料で提供。SUKASHI is a platform providing high-quality AI-generated transparent PNG assets from Japan.",
  keywords: ["PNG", "背景透過", "素材", "AI素材", "フリー素材", "SUKASHI", "Nippon Assets"],
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
