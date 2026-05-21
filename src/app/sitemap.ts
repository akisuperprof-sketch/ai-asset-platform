import { MetadataRoute } from 'next'
import { getAssets } from '@/lib/assets'

// All tag slugs for dynamic programmatic SEO sitemap generation
const tagSlugs = [
  "sushi", "ramen", "takoyaki", "tempura", "wagashi", "matcha", "bento", "gyoza", "misoshiru", "yakitori",
  "udon", "soba", "karaage", "curry", "sashimi", "taiyaki", "dango", "yakiniku", "sake", "fujisan",
  "sakura", "torii", "jinja", "katana", "wagasa", "chochin", "manekineko", "daruma", "tatami", "shuriken",
  "shinkansen", "tokyotower", "japanmap", "matsuri", "businessman", "businesswoman", "meeting", "ai",
  "cloud", "contract", "graph", "smartphone", "pc", "server", "analysis", "hospital", "doctor", "nurse",
  "karte", "medicine", "dentist", "mri", "ecg", "ambulance", "medical-icon", "japanese-pattern"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://assetninja.jp'
  
  // 1. All assets dynamic routes
  const assets = await getAssets()
  const assetUrls = assets.map((asset) => ({
    url: `${baseUrl}/items/${asset.id}`,
    lastModified: new Date(asset.publishedAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    images: [asset.imageUrl]
  }))

  // 2. All category routes
  const categories = ['日本の食', '和の伝統素材', '年中行事・祭り', 'ビジネス', '医療・ヘルスケア', '事務用品・文具'];
  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/category/${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // 3. All programmatic tag routes for Google crawlers
  const tagUrls = tagSlugs.map((tag) => ({
    url: `${baseUrl}/tag/${tag}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...categoryUrls,
    ...tagUrls,
    {
      url: `${baseUrl}/coming-soon`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...assetUrls,
  ]
}
