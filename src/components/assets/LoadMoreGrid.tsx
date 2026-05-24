"use client";

import { useState } from "react";
import { Asset } from "@/types";
import { AssetCard } from "./AssetCard";
import { ChevronRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";

export function LoadMoreGrid({ 
  initialOffset, 
  query = "", 
  category = "すべて", 
  tag = ""
}: { 
  initialOffset: number;
  query?: string;
  category?: string;
  tag?: string;
}) {
  const [loadedAssets, setLoadedAssets] = useState<Asset[]>([]);
  const [offset, setOffset] = useState(initialOffset);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = async () => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);
    try {
      const url = new URL("/api/assets", window.location.origin);
      url.searchParams.set("limit", "24");
      url.searchParams.set("offset", offset.toString());
      if (query) url.searchParams.set("query", query);
      if (category !== "すべて") url.searchParams.set("category", category);
      if (tag) url.searchParams.set("query", tag); // tag uses the same text search internally

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

  if (loadedAssets.length === 0 && !hasMore) return null;

  return (
    <>
      <div className="grid grid-cols-12 gap-6 mt-6">
        <AnimatePresence mode="popLayout">
          {loadedAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="mt-24 flex flex-col items-center w-full">
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
    </>
  );
}
