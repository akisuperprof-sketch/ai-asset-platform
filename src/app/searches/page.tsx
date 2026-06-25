import { Navbar } from "@/components/layout/Navbar";
import { Search, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

export const metadata: Metadata = {
  title: "Top Searches & Requested PNG Assets | AssetNinja",
  description: "Explore the most searched and requested transparent PNG assets on AssetNinja. Help us decide what to generate next!",
  openGraph: {
    title: "Top Searches & Requested PNG Assets | AssetNinja",
    description: "Explore the most searched transparent PNG assets.",
    type: "website",
  },
  alternates: {
    canonical: "https://assetninja.jp/searches",
  }
};

// These would ideally come from the database (demand_radar)
const TOP_SEARCHES = [
  { keyword: 'dango', jp: '団子', status: 'coming-soon' },
  { keyword: 'taiyaki', jp: 'たい焼き', status: 'coming-soon' },
  { keyword: 'takoyaki', jp: 'たこ焼き', status: 'available', link: '/category/takoyaki' },
  { keyword: 'onigiri', jp: 'おにぎり', status: 'available', link: '/category/onigiri' },
  { keyword: 'ramen', jp: 'ラーメン', status: 'available', link: '/category/ramen' },
  { keyword: 'matcha', jp: '抹茶', status: 'available', link: '/category/matcha' },
  { keyword: 'yakiniku', jp: '焼肉', status: 'coming-soon' },
  { keyword: 'sashimi', jp: '刺身', status: 'coming-soon' },
  { keyword: 'curry', jp: 'カレー', status: 'coming-soon' },
  { keyword: 'karaage', jp: '唐揚げ', status: 'coming-soon' },
];

export default function SearchesPage() {
  return (
    <div className="min-h-screen bg-black">
      <PageViewTracker />
      <Navbar />

      <main className="pt-32 pb-20 px-4 max-w-5xl mx-auto space-y-12">
        <header className="text-center space-y-6">
          <TrendingUp className="w-16 h-16 text-ai-purple mx-auto mb-4" />
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            Top Searches
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            See what other creators are searching for. Our AI generates new assets based on popular demand.
          </p>
        </header>

        <div className="glass p-8 rounded-[32px] border border-white/5">
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
            <Search className="w-6 h-6 text-ai-cyan" />
            <h2 className="text-2xl font-bold">Trending Keywords</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {TOP_SEARCHES.map((item, idx) => (
              <div key={idx}>
                {item.status === 'available' && item.link ? (
                  <Link href={item.link} className="block group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-ai-cyan/30 p-4 rounded-2xl transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-white group-hover:text-ai-cyan transition-colors">{item.keyword} PNG</div>
                        <div className="text-xs text-secondary">{item.jp}</div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-ai-cyan/20 text-ai-cyan px-2 py-1 rounded">Available</span>
                    </div>
                  </Link>
                ) : (
                  <div className="block bg-white/5 border border-white/5 p-4 rounded-2xl opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-white">{item.keyword} PNG</div>
                        <div className="text-xs text-secondary">{item.jp}</div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 text-secondary px-2 py-1 rounded">Generating</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/demand-radar" className="inline-flex items-center gap-2 text-ai-purple hover:text-white transition-colors font-bold border border-ai-purple/30 hover:border-white px-6 py-3 rounded-full">
            Submit a Request →
          </Link>
        </div>
      </main>
    </div>
  );
}
