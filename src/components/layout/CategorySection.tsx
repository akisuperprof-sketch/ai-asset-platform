"use client";

import { motion } from "framer-motion";
import { dummyCategories, popularTags } from "@/lib/dummy-data";
import Link from "next/link";
import { ArrowRight, Tag, Bookmark } from "lucide-react";

export function CategorySection({ onTagClick }: { onTagClick: (tag: string) => void }) {
  return (
    <section className="py-32 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-12 gap-12">
        {/* Categories Grid */}
        <div className="col-span-12 lg:col-span-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">カテゴリーから探す</h2>
              <p className="text-secondary text-sm">目的のジャンルをクイックに選択</p>
            </div>
            <Link href="/category" className="text-sm text-ai-cyan hover:underline flex items-center gap-1 font-bold">
              すべて表示 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {dummyCategories.map((cat, i) => (
              <Link key={cat.id} href={`/?category=${cat.name}`}>
                <div className="glass-card p-6 group h-32 flex items-center justify-between rounded-apple cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/5 group-hover:bg-ai-gradient group-hover:border-transparent transition-all duration-500">
                      <Bookmark className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl group-hover:text-white transition-colors">{cat.name}</h3>
                      <p className="text-xs text-secondary mt-1">{cat.count} アセット</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all duration-500">
                    <ArrowRight className="w-5 h-5 text-secondary group-hover:text-black" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Tags */}
        <div className="col-span-12 lg:col-span-4">
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-10">人気のタグ</h2>
            <div className="glass-card p-8 rounded-[32px]">
              <div className="flex flex-wrap gap-3">
                {popularTags.map((tag) => (
                  <button 
                    key={tag} 
                    onClick={() => onTagClick(tag)}
                    className="flex items-center gap-2 text-sm bg-white/[0.03] hover:bg-white text-secondary hover:text-black border border-white/5 px-5 py-2.5 rounded-full transition-all active:scale-95 font-medium"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    {tag}
                  </button>
                ))}
              </div>
              
              <div className="mt-10 p-6 bg-ai-gradient/5 rounded-[22px] border border-ai-purple/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-20">
                  <Tag className="w-12 h-12 text-ai-purple rotate-12" />
                </div>
                <p className="text-[10px] text-ai-purple uppercase font-bold tracking-[0.2em] mb-2">Weekly Trends</p>
                <p className="text-sm text-white font-bold leading-relaxed">
                  現在「<span className="text-ai-cyan underline">ラーメン</span>」の検索が<br />急上昇しています。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
