"use client";

import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { dummyCategories, popularTags } from "@/lib/dummy-data";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";

export function CategorySection({ onTagClick }: { onTagClick: (tag: string) => void }) {
  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-12 gap-8">
        {/* Categories Grid */}
        <div className="col-span-12 lg:col-span-8">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold">カテゴリーから探す</h2>
            <Link href="/category" className="text-sm text-secondary hover:text-white flex items-center gap-1">
              すべて表示 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dummyCategories.map((cat, i) => (
              <Link key={cat.id} href={`/?category=${cat.name}`}>
                <GlassCard className="group h-24 flex items-center justify-between hover:border-ai-cyan/30 transition-all">
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-ai-cyan transition-colors">{cat.name}</h3>
                    <p className="text-xs text-secondary">{cat.count} アセット</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-ai-gradient transition-all">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Tags */}
        <div className="col-span-12 lg:col-span-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-8">人気のタグ</h2>
            <div className="glass p-6 rounded-apple border-white/5">
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button 
                    key={tag} 
                    onClick={() => onTagClick(tag)}
                    className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-ai-purple/20 hover:text-ai-purple border border-white/10 hover:border-ai-purple/30 px-4 py-2 rounded-full transition-all"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </button>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-ai-gradient/10 rounded-xl border border-ai-purple/20">
                <p className="text-[10px] text-ai-purple uppercase font-bold tracking-widest mb-1">Weekly Trends</p>
                <p className="text-xs text-white font-medium">現在「ラーメン」の検索が急増しています。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
