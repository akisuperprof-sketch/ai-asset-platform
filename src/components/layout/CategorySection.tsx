"use client";

import { motion } from "framer-motion";
import { dummyCategories, popularTags } from "@/lib/dummy-data";
import Link from "next/link";
import { ArrowRight, Tag, Bookmark, Pizza, Coffee, User, HeartPulse, Dog, TreePine, Car, PenTool, Zap, Globe, MessageCircle } from "lucide-react";

const categoryIcons: Record<string, any> = {
  "食べ物": Pizza,
  "飲み物": Coffee,
  "人物": User,
  "医療・ヘルスケア": HeartPulse,
  "動物・ペット": Dog,
  "自然・風景": TreePine,
  "乗り物・交通": Car,
  "建物・施設": Bookmark,
  "事務用品": PenTool,
  "年中行事": Zap,
};

// Map categories to specific image concepts for visual richness
const categoryImages: Record<string, string> = {
  "食べ物": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=300",
  "飲み物": "https://images.unsplash.com/photo-1544787210-2827448b371c?auto=format&fit=crop&q=80&w=300",
  "人物": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
  "医療・ヘルスケア": "https://images.unsplash.com/photo-1505751172107-573225a91703?auto=format&fit=crop&q=80&w=300",
  "動物・ペット": "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=300",
  "自然・風景": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=300",
  "乗り物・交通": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=300",
  "建物・施設": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300",
  "事務用品": "https://images.unsplash.com/photo-1586075010633-24701bd6e8b4?auto=format&fit=crop&q=80&w=300",
  "年中行事": "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&q=80&w=300",
};

export function CategorySection() {
  return (
    <section id="categories" className="max-w-7xl mx-auto px-6 py-40">
      <div className="flex justify-between items-end mb-16">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-ai-purple" />
            <span className="text-[10px] font-black text-ai-purple uppercase tracking-[0.3em]">
              Explore by Domain
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">カテゴリから探す</h2>
        </div>
        <Link href="/#assets" className="group flex items-center gap-2 text-xs font-black text-white uppercase tracking-widest hover:text-ai-cyan transition-colors">
          すべてのカテゴリを見る <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* High-End Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dummyCategories.map((category, idx) => {
          const Icon = categoryIcons[category.name] || Tag;
          const bgImg = categoryImages[category.name] || "";
          
          return (
            <Link 
              key={category.id}
              href={`/category/${encodeURIComponent(category.name)}`}
              className={`block ${idx === 0 ? "lg:col-span-1 lg:row-span-1" : ""}`}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                className="glass-card relative overflow-hidden group h-full"
              >
                <div className="relative p-6 flex items-center gap-6 z-20">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/30 transition-all flex-shrink-0">
                  {bgImg ? (
                    <img src={bgImg} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-white font-bold text-lg group-hover:text-ai-cyan transition-colors">{category.name}</h3>
                  <p className="text-[10px] text-secondary font-black tracking-widest uppercase mt-1">
                    {Math.floor(Math.random() * 50) + 10} 素材
                  </p>
                </div>
              </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-ai-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Popular Tags */}
      <div className="mt-24 pt-12 border-t border-white/5">
        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] mb-10 text-center">Popular Search Tags</p>
        <div className="flex flex-wrap justify-center gap-3">
          {popularTags.map(tag => (
            <Link 
              key={tag} 
              href={`/?q=${encodeURIComponent(tag)}`}
              className="glass px-8 py-3 rounded-full text-[10px] font-black text-white uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
