import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Fallback tag slugs in case DB query fails or has no tags yet
const FALLBACK_TAG_SLUGS = [
  "sushi", "ramen", "takoyaki", "tempura", "wagashi", "matcha", "bento", "gyoza", "misoshiru", "yakitori",
  "udon", "soba", "karaage", "curry", "sashimi", "taiyaki", "dango", "yakiniku", "sake", "fujisan",
  "sakura", "torii", "jinja", "katana", "wagasa", "chochin", "manekineko", "daruma", "tatami", "shuriken",
  "shinkansen", "tokyotower", "japanmap", "matsuri", "businessman", "businesswoman", "meeting", "ai",
  "cloud", "contract", "graph", "smartphone", "pc", "server", "analysis", "hospital", "doctor", "nurse",
  "karte", "medicine", "dentist", "mri", "ecg", "ambulance", "medical-icon", "japanese-pattern"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://assetninja.jp';
  
  console.log("🗺️ [sitemap.ts] Generating single sitemap.xml");

  let assets: any[] = [];
  let dynamicTags: string[] = [];

  if (supabase) {
    console.log("🗺️ [sitemap.ts] Supabase client is initialized. Fetching data...");
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('id, image_url, storage_key, published_at')
        .eq('review_status', 'approved')
        .eq('legal_status', 'clean')
        .not('published_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50000);

      if (error) throw error;
      assets = data || [];
      console.log(`🗺️ [sitemap.ts] Successfully fetched ${assets.length} assets.`);

      dynamicTags = FALLBACK_TAG_SLUGS;

    } catch (err) {
      console.error("🗺️ [sitemap.ts] Error fetching sitemap data from Supabase:", err);
    }
  } else {
    console.log("🗺️ [sitemap.ts] Supabase client is NOT initialized!");
  }

  const tagsToUse = dynamicTags.length > 0 ? dynamicTags : FALLBACK_TAG_SLUGS;
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'sukashi-assets';
  
  const assetUrls = assets.map((asset) => {
    let imageUrl = asset.image_url;
    if (!imageUrl && asset.storage_key && supabaseUrl) {
      imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${asset.storage_key}`;
    }
    return {
      url: `${baseUrl}/items/${asset.id}`,
      lastModified: new Date(asset.published_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      images: imageUrl ? [imageUrl] : undefined,
    };
  });

  const categories = ['日本の食', '和の伝統素材', '年中行事・祭り', 'ビジネス', '医療・ヘルスケア', '事務用品・文具', 'ramen', 'sushi', 'tempura', 'gyoza', 'mochi', 'bento', 'torii', 'sakura', 'matcha', 'japanese-pattern', 'onigiri', 'yakitori', 'takoyaki', 'dango'];
  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/category/${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  const tagUrls = tagsToUse.map((tag) => ({
    url: `${baseUrl}/tag/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }));

  const guideSlugs = ['ramen-png', 'sushi-png', 'tempura-png', 'gyoza-png', 'mochi-png', 'bento-png', 'torii-png', 'sakura-png', 'matcha-png', 'japanese-pattern-png', 'onigiri-png', 'yakitori-png', 'takoyaki-png', 'dango-png'];
  const guideUrls = guideSlugs.map(slug => ({
    url: `${baseUrl}/guide/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const eventSlugs = ['spring', 'summer', 'autumn', 'halloween', 'christmas', 'new-year', 'valentine'];
  const eventUrls = eventSlugs.map(slug => ({
    url: `${baseUrl}/events/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const finalSitemap: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/new`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/popular`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/searches`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...categoryUrls,
    ...tagUrls,
    ...guideUrls,
    ...eventUrls,
    {
      url: `${baseUrl}/coming-soon`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...assetUrls,
  ];
  
  console.log(`🗺️ [sitemap.ts] Returning ${finalSitemap.length} sitemap entries`);
  return finalSitemap;
}

