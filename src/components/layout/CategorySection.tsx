"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Tag, Bookmark, Pizza, Coffee, User, HeartPulse, Dog, TreePine, Car, PenTool, Zap } from "lucide-react";

const categoryIcons: Record<string, any> = {
  "日本の食": Pizza,
  "和風・和柄": Bookmark,
  "桜・祭り": Zap,
  "神社・鳥居": Bookmark,
  "富士山・自然": TreePine,
  "医療・ヘルスケア": HeartPulse,
  "ビジネス": User,
};

const categoryImages: Record<string, string> = {
  "日本の食": "https://images.unsplash.com/photo-1582450871972-ab5ca641643d?auto=format&fit=crop&q=80&w=300",
  "和風・和柄": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=300",
  "桜・祭り": "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&q=80&w=300",
  "神社・鳥居": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=300",
  "富士山・自然": "https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&q=80&w=300",
  "ビジネス": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300",
  "医療・ヘルスケア": "https://images.unsplash.com/photo-1505751172107-573225a91703?auto=format&fit=crop&q=80&w=300",
};

interface CategorySectionProps {
  categories?: { id: string; name: string; slug: string; count: number }[];
  popularTags?: string[];
}

export function CategorySection({ categories = [], popularTags = [] }: CategorySectionProps) {
  // Only display categories that actually contain assets to comply with "No empty section" rule
  const activeCategories = categories.filter(c => c.count > 0);

  if (activeCategories.length === 0) {
    return null; // Gracefully hide the entire section if no data is present
  }

  return (
    <section id="categories" className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-ai-purple shadow-[0_0_8px_rgba(124,58,237,0.6)]" />
            <span className="text-[10px] font-black text-ai-purple uppercase tracking-[0.3em]">
              Explore by Domain
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">カテゴリから探す</h2>
        </div>
        <Link href="/?cat=すべて" className="group flex items-center gap-2 text-xs font-black text-white uppercase tracking-widest hover:text-ai-cyan transition-colors">
          すべてのカテゴリを見る <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* High-End Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activeCategories.map((category, idx) => {
          const Icon = categoryIcons[category.name] || Tag;
          const bgImg = categoryImages[category.name] || "";
          
          return (
            <Link 
              key={category.id}
              href={`/?cat=${encodeURIComponent(category.name)}`}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
                whileHover={{ y: -5 }}
                className="glass-card relative overflow-hidden group h-full border-white/5 hover:border-amber-500/25"
              >
                <div className="relative p-6 flex items-center gap-5 z-20">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/20 transition-all flex-shrink-0">
                    {bgImg ? (
                      <img src={bgImg} alt={category.name} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-white font-black text-[15px] group-hover:text-amber-400 transition-colors">{category.name}</h3>
                    <p className="text-[10px] text-secondary font-black tracking-widest uppercase mt-1">
                      {category.count} 素材
                    </p>
                  </div>
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-ai-gradient opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500" />
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <div className="mt-16 pt-10 border-t border-white/5">
          <p className="text-[9px] font-black text-secondary uppercase tracking-[0.25em] mb-6 text-center">Popular Search Tags</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {popularTags.map(tag => (
              <Link 
                key={tag} 
                href={`/?q=${encodeURIComponent(tag)}`}
                className="glass px-6 py-2.5 rounded-full text-[10px] font-black text-white/70 uppercase tracking-widest hover:bg-white hover:text-black hover:scale-103 hover:border-white/20 active:scale-97 transition-all"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
