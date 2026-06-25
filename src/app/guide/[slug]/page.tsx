import { Navbar } from "@/components/layout/Navbar";
import { ChevronLeft, Info, Download, ArrowRight, ShieldCheck, Paintbrush } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const rawCategoryName = decodeURIComponent(slug).replace(/-png$/, '');
  const categoryName = rawCategoryName.charAt(0).toUpperCase() + rawCategoryName.slice(1);

  const title = `The Ultimate Guide to ${categoryName} PNG: Usage & Commercial License | AssetNinja`;
  const description = `Learn everything about ${categoryName} PNG assets. High-quality, transparent backgrounds, how to use them in Canva and Photoshop, and 100% free commercial licensing details.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    alternates: {
      canonical: `https://assetninja.jp/guide/${encodeURIComponent(slug)}`,
    }
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rawCategoryName = decodeURIComponent(slug).replace(/-png$/, '');
  const categoryName = rawCategoryName.charAt(0).toUpperCase() + rawCategoryName.slice(1);

  const generateFaqs = (catName: string) => {
    const questions = [
      "What is a PNG with a transparent background?",
      `Are these ${catName} PNGs completely free?`,
      "Can I use them for commercial projects?",
      "Do I need to provide attribution or credit?",
      "What resolution are these images?",
      `How were these ${catName} assets created?`,
      "Can I use them in Canva?",
      "Can I use them in PowerPoint?",
      "Can I use them in Photoshop?",
      "Are they suitable for printing?",
      "Is the background really fully removed?",
      "Can I resell these images directly?",
      `How often are new ${catName} PNGs added?`,
      "Do I need an account to download?",
      "What is the file size typically?",
      "Can I use these for my client's website?",
      "Can I use these in YouTube thumbnails?",
      "Are there any usage limits?",
      "Can I use them for mobile apps?",
      "How do I search for specific assets?"
    ];

    const answers = [
      "A transparent PNG is an image file format that supports a clear (invisible) background, allowing you to place the image over any color or design seamlessly.",
      "Yes, absolutely. Every image on AssetNinja is 100% free to download.",
      "Yes, they are completely royalty-free and cleared for commercial use.",
      "No, attribution is not required, though we always appreciate a link back if you love our service!",
      "Most of our assets are high-resolution, typically upscaled to ensure crisp quality for web and print.",
      "Our assets are generated using state-of-the-art AI technology and then processed with advanced background-removal algorithms for a perfect cutout.",
      "Yes! Simply download the PNG and upload it to your Canva media library. You can drag and drop it directly onto your canvas.",
      "Yes, PowerPoint supports transparent PNGs. You can insert them as pictures and they will blend with your slide background.",
      "Yes, opening them in Photoshop will show the checkered background, indicating transparency. They are ready to be used in composites.",
      "Yes, the high resolution makes them suitable for standard print sizes, though they are primarily optimized for digital media.",
      "Yes, our advanced clipping AI ensures edge-to-edge background removal, even on complex borders.",
      "No, direct reselling or redistributing of our raw image files is prohibited. You must incorporate them into your own design or project.",
      "Our database is constantly growing as our AI generates new assets based on user search demand.",
      "No account is required to browse or download.",
      "File sizes vary but are typically optimized for web delivery (under 2MB).",
      "Yes, client work falls under our commercial use license.",
      "Absolutely. They are perfect for creating engaging YouTube thumbnails.",
      "There are no hard limits on downloads, but we ask users not to use automated bots to scrape our entire database.",
      "Yes, they can be bundled into mobile application assets.",
      "You can use our homepage search bar or browse through our category tags."
    ];

    return questions.map((q, i) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: answers[i]
      }
    }));
  };

  const faqItems = generateFaqs(categoryName);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `The Ultimate Guide to ${categoryName} PNG`,
    "description": `Learn everything about ${categoryName} PNG assets.`,
    "author": {
      "@type": "Organization",
      "name": "AssetNinja"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AssetNinja",
      "logo": {
        "@type": "ImageObject",
        "url": "https://assetninja.jp/favicon.ico"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://assetninja.jp/guide/${slug}`
    }
  };

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${categoryName} PNGs in your designs`,
    "description": `Step by step guide on how to integrate transparent ${categoryName} PNGs into Canva, Photoshop, and Presentations.`,
    "step": [
      {
        "@type": "HowToStep",
        "name": "Download the Asset",
        "text": `Find the perfect ${categoryName} PNG on AssetNinja and click the Download button. It will save as a transparent .png file.`
      },
      {
        "@type": "HowToStep",
        "name": "Import into your Software",
        "text": "Open Canva, Photoshop, or PowerPoint, and import/upload the downloaded PNG file."
      },
      {
        "@type": "HowToStep",
        "name": "Place and Scale",
        "text": "Drag the image onto your canvas. Because the background is transparent, you do not need to use a magic wand or background eraser tool."
      }
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems
  };

  return (
    <div className="min-h-screen bg-black">
      <PageViewTracker />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <Navbar />

      <main className="pt-32 pb-20 px-4 max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <header className="text-center space-y-6">
          <Link href={`/${slug}`} className="inline-flex items-center text-secondary hover:text-white transition-colors mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to {categoryName} Assets
          </Link>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            The Ultimate Guide to <span className="text-transparent bg-clip-text bg-gradient-to-r from-ai-cyan to-ai-purple">{categoryName} PNGs</span>
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            Everything you need to know about transparent {categoryName} assets, commercial licensing, and how to use them in your designs.
          </p>
        </header>

        {/* What is */}
        <section className="glass p-8 md:p-12 rounded-[32px] border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-8 h-8 text-ai-cyan" />
            <h2 className="text-3xl font-bold">What is a {categoryName} PNG?</h2>
          </div>
          <div className="space-y-4 text-secondary leading-relaxed text-lg">
            <p>
              A <strong>{categoryName} PNG</strong> is a digital image format that features a representation of {categoryName} with a fully transparent background. Unlike standard JPEGs which have solid white or colored backgrounds, our PNGs allow the {categoryName} subject to stand alone.
            </p>
            <p>
              At AssetNinja, we utilize advanced AI generation and high-precision background removal (clipping) algorithms. This means you get a perfect cutout, allowing you to place the {categoryName} seamlessly over any color, texture, or photograph in your design projects.
            </p>
          </div>
        </section>

        {/* How to use */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="glass p-8 rounded-3xl border border-white/5 space-y-4">
            <Paintbrush className="w-8 h-8 text-ai-purple" />
            <h3 className="text-2xl font-bold">Canva Integration</h3>
            <p className="text-secondary">
              Integrating our assets into Canva is incredibly easy. Download the PNG, drag it into your Canva uploads sidebar, and drop it onto your design. No need for Canva Pro background removers!
            </p>
          </div>
          
          <div className="glass p-8 rounded-3xl border border-white/5 space-y-4">
            <ShieldCheck className="w-8 h-8 text-green-400" />
            <h3 className="text-2xl font-bold">Commercial Use</h3>
            <p className="text-secondary">
              We provide a 100% Royalty-Free license. You can use these {categoryName} images for client websites, commercial YouTube channels, printed flyers, menus, and paid advertisements without any attribution.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/5 space-y-4">
            <ArrowRight className="w-8 h-8 text-blue-400" />
            <h3 className="text-2xl font-bold">Presentations (PPT / Keynote)</h3>
            <p className="text-secondary">
              Spice up your slide decks. Insert the downloaded PNG file directly into PowerPoint or Keynote. The transparent background ensures it blends beautifully with your slide theme.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/5 space-y-4">
            <Download className="w-8 h-8 text-pink-400" />
            <h3 className="text-2xl font-bold">High Quality</h3>
            <p className="text-secondary">
              All images are generated and processed to maintain high fidelity and sharpness, ensuring they look great on both mobile screens and large desktop displays.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-8">
          <h2 className="text-4xl font-black text-center mb-10">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {faqItems.map((faq, idx) => (
              <details key={idx} className="group glass p-6 rounded-2xl cursor-pointer border border-white/5 hover:bg-white/5 transition-colors">
                <summary className="font-bold list-none flex justify-between items-center text-sm md:text-base">
                  {faq.name}
                  <span className="text-ai-cyan group-open:rotate-45 transition-transform shrink-0 ml-4">+</span>
                </summary>
                <p className="mt-4 text-secondary leading-relaxed text-sm">
                  {faq.acceptedAnswer.text}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-black mb-6">Ready to create?</h2>
          <Link href={`/${slug}`} className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-zinc-200 transition-colors text-lg">
            <Download className="w-5 h-5" />
            Browse {categoryName} Assets
          </Link>
        </section>

      </main>
    </div>
  );
}
