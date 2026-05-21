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

// Chunk size for pagination
const CHUNK_SIZE = 2000;

export async function generateSitemaps() {
  if (!supabase) return [{ id: 0 }];

  try {
    // get total count of approved assets
    const { count, error } = await supabase
      .from('assets')
      .select('*', { count: 'exact', head: true })
      .eq('review_status', 'approved')
      .eq('legal_status', 'clean')
      .not('published_at', 'is', null);

    if (error) throw error;
    const total = count || 0;
    const numSitemaps = Math.ceil(total / CHUNK_SIZE) || 1;

    return Array.from({ length: numSitemaps }, (_, i) => ({ id: i }));
  } catch (err) {
    console.error("Error generating sitemaps list:", err);
    return [{ id: 0 }];
  }
}

export default async function sitemap({ id }: { id?: number }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://assetninja.jp';
  const currentId = typeof id === 'string' ? parseInt(id, 10) : (id ?? 0);

  let assets: any[] = [];
  let dynamicTags: string[] = [];

  if (supabase) {
    try {
      // 1. Fetch assets for the current chunk
      const start = currentId * CHUNK_SIZE;
      const end = start + CHUNK_SIZE - 1;

      const { data, error } = await supabase
        .from('assets')
        .select('id, image_url, storage_key, published_at')
        .eq('review_status', 'approved')
        .eq('legal_status', 'clean')
        .not('published_at', 'is', null)
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) throw error;
      assets = data || [];

      // 2. Fetch distinct tags from approved assets
      const { data: tagData, error: tagError } = await supabase
        .from('assets')
        .select('tags')
        .eq('review_status', 'approved');

      if (tagError) throw tagError;
      
      const tagSet = new Set<string>();
      tagData?.forEach((row: any) => {
        if (Array.isArray(row.tags)) {
          row.tags.forEach((tag: string) => {
            if (tag && tag.trim()) tagSet.add(tag.trim());
          });
        }
      });
      dynamicTags = Array.from(tagSet);

    } catch (err) {
      console.error("Error fetching sitemap data from Supabase:", err);
    }
  }

  // Use fallback if dynamic tags query failed or returned empty
  const tagsToUse = dynamicTags.length > 0 ? dynamicTags : FALLBACK_TAG_SLUGS;

  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'sukashi-assets';
  
  // Format asset URLs
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
    };
  });

  // Base pages (Only return for the first sitemap or when id is not supplied to prevent duplication)
  if (currentId === 0) {
    const categories = ['日本の食', '和の伝統素材', '年中行事・祭り', 'ビジネス', '医療・ヘルスケア', '事務用品・文具'];
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
    ];
  }

  // Segmented sitemap chunk returns only asset URLs
  return assetUrls;
}

