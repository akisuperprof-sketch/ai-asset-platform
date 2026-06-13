"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AssetCard } from "./AssetCard";
import { Asset } from "@/types";
import { SearchX, Filter, Grid3X3, List, ChevronRight, Sparkles } from "lucide-react";
import { dummyCategories } from "@/lib/dummy-data";
import Link from "next/link";
import { NinjaEmptyState } from "@/components/brand/NinjaEmptyState";

export function AssetGrid({ 
  assets: initialAssets, 
  isLoading = false,
  searchQuery = "", 
  category = "すべて", 
  onCategoryChange = () => {},
  onSearchChange = () => {}
}: { 
  assets: Asset[];
  isLoading?: boolean;
  searchQuery?: string;
  category?: string;
  onCategoryChange?: (cat: string) => void;
  onSearchChange?: (query: string) => void;
}) {
  const [loadedAssets, setLoadedAssets] = useState<Asset[]>([]);
  const [offset, setOffset] = useState(initialAssets.length);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(initialAssets.length >= 24);

  // When props change (e.g., search/category change via URL), reset the state
  useEffect(() => {
    setLoadedAssets([]);
    setOffset(initialAssets.length);
    setHasMore(initialAssets.length >= 24);
  }, [initialAssets, searchQuery, category]);

  const displayAssets = [...initialAssets, ...loadedAssets];

  const handleLoadMore = async () => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);
    try {
      const url = new URL("/api/assets", window.location.origin);
      url.searchParams.set("limit", "24");
      url.searchParams.set("offset", offset.toString());
      if (searchQuery) url.searchParams.set("query", searchQuery);
      if (category !== "すべて") url.searchParams.set("category", category);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success && data.assets) {
        if (data.assets.length < 24) {
          setHasMore(false);
        }
        setLoadedAssets(prev => [...prev, ...data.assets]);
        setOffset(prev => prev + data.assets.length);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    // Zero Result Tracking Effect
    if (!isLoading && displayAssets.length === 0 && searchQuery) {
      fetch('/api/demand/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          event_type: 'zero_result',
          query: searchQuery,
          source_page: window.location.pathname
        })
      }).catch(e => console.error(e));
    }
  }, [isLoading, displayAssets.length, searchQuery]);

  return (
    <section id="assets" className="max-w-7xl mx-auto px-6 py-32">
      {/* Premium Filter Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-ai-purple" />
            <span className="text-[10px] font-black text-ai-purple uppercase tracking-[0.3em]">
              Asset Ninja Collection
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
            {searchQuery ? `"${searchQuery}" の結果` : category === "すべて" ? "LATEST ASSETS" : category}
            <span className="text-ai-cyan ml-4 text-xl">[{displayAssets.length}{hasMore ? '+' : ''}]</span>
          </h2>
        </div>

        {/* Bento-style Category Scroller */}
        <div className="w-full md:w-auto glass rounded-full p-2 flex items-center gap-1 border-white/5 overflow-x-auto no-scrollbar">
          {["すべて", ...dummyCategories.map(c => c.name)].map((cat) => (
            <Link
              key={cat}
              href={cat === "すべて" ? "/" : `/?cat=${encodeURIComponent(cat)}`}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                category === cat 
                  ? "bg-white text-black shadow-2xl" 
                  : "text-secondary hover:text-white hover:bg-white/5"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-12 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-4 h-[480px] glass rounded-ninja animate-pulse" />
          ))}
        </div>
      ) : displayAssets.length > 0 ? (
        <div className="grid grid-cols-12 gap-8">
          <AnimatePresence mode="popLayout">
            {displayAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card py-20 rounded-[40px] text-center max-w-2xl mx-auto"
        >
          <NinjaEmptyState message="This asset is coming soon." />
          <p className="text-secondary mt-4 text-sm font-bold text-ai-purple">
            あなたの検索をAIが検知しました。この素材はまもなく生成されます！<br/>
            (Priority Score +1)
          </p>
          <p className="text-zinc-500 mt-2 text-xs">
            1〜2日以内に追加される予定です。This asset has been queued for auto-generation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button 
              onClick={async () => {
                if (!searchQuery) return;
                try {
                  await fetch('/api/demand/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      event_type: 'search',
                      query: searchQuery,
                      source_page: window.location.pathname,
                      metadata: { userRequested: true }
                    })
                  });
                  alert('リクエストを送信しました！ / Request submitted!');
                } catch (e) {
                  console.error(e);
                }
              }}
              className="bg-ai-purple text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              <Sparkles className="w-4 h-4" />
              優先生成をリクエスト (Boost Priority)
            </button>
            <button 
              onClick={() => {
                if (onSearchChange) onSearchChange("");
                if (onCategoryChange) onCategoryChange("すべて");
              }}
              className="glass text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
            >
              Reset Search
            </button>
          </div>
        </motion.div>
      )}

      {/* Load More Area */}
      {displayAssets.length > 0 && hasMore && (
        <div className="mt-24 flex flex-col items-center">
          <button 
            onClick={handleLoadMore}
            disabled={isFetching}
            className="glass group px-12 py-5 rounded-full flex items-center gap-3 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all border-white/10 disabled:opacity-50"
          >
            {isFetching ? "Loading..." : "Load More Assets"}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-[9px] text-secondary font-bold tracking-[0.3em] uppercase mt-10 opacity-30">
            Crafted for speed • Powered by Ninja Engine
          </p>
        </div>
      )}
    </section>
  );
}
