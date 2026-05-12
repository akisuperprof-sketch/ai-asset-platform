"use client";

import { motion, AnimatePresence } from "framer-motion";
import { dummyAssets, dummyCategories } from "@/lib/dummy-data";
import { AssetCard } from "./AssetCard";
import { Asset } from "@/types";
import { Filter, SearchX } from "lucide-react";
import Link from "next/link";

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
    <section className="py-20 px-4 max-w-7xl mx-auto min-h-[600px]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            {searchQuery ? `「${searchQuery}」の検索結果` : "注目のアセット"}
          </h2>
          <p className="text-secondary text-sm">
            {isLoading ? "読み込み中..." : `${assets.length} 個のアセットが見つかりました`}
          </p>
        </div>

        {/* Category Filter Bar */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                category === cat 
                  ? "bg-ai-gradient text-white border-transparent shadow-lg shadow-ai-purple/20" 
                  : "bg-white/5 text-secondary border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 relative">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            // Skeleton Loader
            [...Array(6)].map((_, i) => (
              <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-4 h-[400px] bg-white/5 animate-pulse rounded-apple border border-white/5" />
            ))
          ) : assets.length > 0 ? (
            assets.map((asset) => (
              <motion.div
                layout
                key={asset.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="col-span-12 sm:col-span-6 lg:col-span-4"
              >
                <AssetCard asset={asset} />
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-12 py-32 text-center glass rounded-apple border-dashed border-white/10"
            >
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchX className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">アセットが見つかりませんでした</h3>
              <p className="text-secondary text-sm max-w-xs mx-auto">
                キーワードを変えて検索するか、カテゴリーを変更してみてください。
              </p>
              <button 
                onClick={() => { 
                  onCategoryChange("すべて"); 
                  onSearchChange("");
                }}
                className="mt-8 text-ai-blue hover:text-ai-cyan text-sm font-bold"
              >
                すべての検索条件をリセット
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
