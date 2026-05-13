"use client";

import { motion, AnimatePresence } from "framer-motion";
import { dummyCategories } from "@/lib/dummy-data";
import { AssetCard } from "./AssetCard";
import { Asset } from "@/types";
import { SearchX, LayoutGrid } from "lucide-react";

export function AssetGrid({ 
  assets,
  isLoading,
  searchQuery, 
  category, 
  onCategoryChange,
  onSearchChange
}: { 
  assets: Asset[];
  isLoading: boolean;
  searchQuery: string; 
  category: string; 
  onCategoryChange: (cat: string) => void;
  onSearchChange: (query: string) => void;
}) {
  const categories = ["すべて", ...dummyCategories.map(c => c.name)];

  return (
    <section className="py-32 px-4 max-w-7xl mx-auto min-h-[800px]">
      <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-ai-cyan font-bold text-xs uppercase tracking-[0.2em] mb-4">
            <LayoutGrid className="w-4 h-4" />
            Collection
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            {searchQuery ? (
              <>「<span className="gradient-text">{searchQuery}</span>」の検索結果</>
            ) : (
              <>高品質な<span className="gradient-text">最新アセット</span></>
            )}
          </h2>
          <p className="text-secondary text-lg leading-relaxed">
            {isLoading ? "ライブラリをスキャン中..." : `${assets.length} 件のプレミアムアセットが見つかりました。`}
          </p>
        </div>

        {/* Category Filter Bar */}
        <div className="flex flex-wrap gap-3 justify-end">
          {categories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all border ${
                category === cat 
                  ? "bg-white text-black border-white shadow-xl scale-105" 
                  : "bg-white/5 text-secondary border-white/5 hover:border-white/20 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10 relative">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            // Skeleton Loader with premium feel
            [...Array(6)].map((_, i) => (
              <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-4 h-[450px] bg-white/[0.02] animate-pulse rounded-apple border border-white/5 shadow-inner" />
            ))
          ) : assets.length > 0 ? (
            assets.map((asset, index) => (
              <motion.div
                layout
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="col-span-12 sm:col-span-6 lg:col-span-4"
              >
                <AssetCard asset={asset} />
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-12 py-40 text-center glass rounded-apple border-dashed border-white/10"
            >
              <div className="w-24 h-24 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5">
                <SearchX className="w-10 h-10 text-secondary/40" />
              </div>
              <h3 className="text-2xl font-bold mb-4">対象のアセットが見つかりませんでした</h3>
              <p className="text-secondary text-base max-w-sm mx-auto leading-relaxed">
                検索キーワードを調整するか、他のカテゴリーを探索してみてください。
              </p>
              <button 
                onClick={() => { 
                  onCategoryChange("すべて"); 
                  onSearchChange("");
                }}
                className="mt-10 px-8 py-3 rounded-full border border-ai-purple/30 text-ai-purple hover:bg-ai-purple hover:text-white transition-all font-bold text-sm"
              >
                すべての条件をリセット
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
