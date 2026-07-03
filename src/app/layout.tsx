import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { ComingSoonToast } from "@/components/ui/ComingSoonToast";
import { LivingBackground } from "@/components/layout/LivingBackground";
import { DESIGN_TOKENS } from "@/design/tokens";
import seoRules from "@/design/rules/seo-rules.json";
import "./globals.css";

const notoEmoji = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://assetninja.jp'),
  title: {
    default: "Premium Japanese Transparent PNG Assets | AssetNinja",
    template: "%s | AssetNinja"
  },
  description: "Download high-quality Japanese transparent PNG assets. Commercial-use ready premium PNGs including food, culture, business, and medical illustrations.",
  keywords: ["PNG", "背景透過", "素材", ...seoRules.mandatory_terms, "AssetNinja", "切り抜き画像", "Premium Japanese Assets"],
  openGraph: {
    title: "Premium Japanese Transparent PNG Assets | AssetNinja",
    description: "Download high-quality Japanese transparent PNG assets. Commercial-use ready premium PNGs.",
    url: 'https://assetninja.jp',
    siteName: 'AssetNinja',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Premium Japanese Transparent PNG Assets | AssetNinja",
    description: "Download high-quality Japanese transparent PNG assets. Commercial-use ready premium PNGs.",
  },
  alternates: {
    canonical: 'https://assetninja.jp',
  },
  icons: {
    icon: '/brand/ninja-char-7.png',
    apple: '/brand/ninja-char-7.png',
  },
  other: {
    "pinterest:card": "summary_large_image",
    "pinterest:title": "Premium Japanese Transparent PNG Assets | AssetNinja",
    "pinterest:description": "Download high-quality Japanese transparent PNG assets. Commercial-use ready premium PNGs.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoEmoji.variable}`}>
      <body className={`${DESIGN_TOKENS.colors.background} ${DESIGN_TOKENS.colors.textPrimary} ${DESIGN_TOKENS.typography.body} antialiased selection:bg-white/10`}>
        {/* Global JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://assetninja.jp/#organization",
                  "name": "AssetNinja",
                  "url": "https://assetninja.jp",
                  "logo": "https://assetninja.jp/brand/ninja-char-7.png",
                  "sameAs": [
                    "https://twitter.com/assetninja",
                    "https://www.pinterest.jp/assetninja/"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://assetninja.jp/#website",
                  "url": "https://assetninja.jp",
                  "name": "AssetNinja",
                  "description": "商用利用可能な日本発のプレミアム背景透過PNG素材サイト",
                  "publisher": {
                    "@id": "https://assetninja.jp/#organization"
                  },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://assetninja.jp/searches?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            })
          }}
        />
        <LivingBackground />
        <main className="relative min-height-screen">
          {children}
        </main>
        <ComingSoonToast />
      </body>
    </html>
  );
}
