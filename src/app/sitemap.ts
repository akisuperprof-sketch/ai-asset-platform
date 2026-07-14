import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const ITEMS_PER_SITEMAP = 5000;

// Fallback tag slugs
const FALLBACK_TAG_SLUGS = [
  "sushi", "ramen", "takoyaki", "tempura", "wagashi", "matcha", "bento", "gyoza", "misoshiru", "yakitori",
  "udon", "soba", "karaage", "curry", "sashimi", "taiyaki", "dango", "yakiniku", "sake", "fujisan",
  "sakura", "torii", "jinja", "katana", "wagasa", "chochin", "manekineko", "daruma", "tatami", "shuriken",
  "shinkansen", "tokyotower", "japanmap", "matsuri", "businessman", "businesswoman", "meeting", "ai",
  "cloud", "contract", "graph", "smartphone", "pc", "server", "analysis", "hospital", "doctor", "nurse",
  "karte", "medicine", "dentist", "mri", "ecg", "ambulance", "medical-icon", "japanese-pattern"
];

export async function generateSitemaps() {
  if (!supabase) return [{ id: 0 }];
  
  const { count } = await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true })
    .eq('review_status', 'approved')
    .eq('legal_status', 'clean')
    .not('published_at', 'is', null);

  const totalAssets = count || 0;
  const numPages = Math.ceil(totalAssets / ITEMS_PER_SITEMAP);
  
  // id: 0 is for static routes, id: 1, 2, ... for assets
  const sitemaps = [{ id: 0 }];
  for (let i = 0; i < numPages; i++) {
    sitemaps.push({ id: i + 1 });
  }
  return sitemaps;
}

export default async function sitemap(props: any): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://assetninja.jp';
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'sukashi-assets';
  
  // In Next.js 15+, route parameters (including `id` for sitemaps) are promises.
  const resolvedId = props.id instanceof Promise ? await props.id : props.id;
  const numericId = Number(resolvedId);
  console.log(`🗺️ [sitemap.ts] Generating sitemap chunk: ${numericId}`);

  // Static routes chunk
  if (numericId === 0) {
    const categories = ['日本の食', '和の伝統素材', '年中行事・祭り', 'ビジネス', '医療・ヘルスケア', '事務用品・文具', 'ramen', 'sushi', 'tempura', 'gyoza', 'mochi', 'bento', 'torii', 'sakura', 'matcha', 'japanese-pattern', 'onigiri', 'yakitori', 'takoyaki', 'dango'];
    const categoryUrls = categories.map((cat) => ({
      url: `${baseUrl}/category/${encodeURIComponent(cat)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));

    const tagUrls = FALLBACK_TAG_SLUGS.map((tag) => ({
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

    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/trending`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/new`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/popular`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
      { url: `${baseUrl}/searches`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/coming-soon`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
      ...categoryUrls,
      ...tagUrls,
      ...guideUrls,
      ...eventUrls,
    ];
  }

  // Assets chunks
  if (supabase) {
    const pageIndex = numericId - 1;
    const from = pageIndex * ITEMS_PER_SITEMAP;
    const to = from + ITEMS_PER_SITEMAP - 1;
    
    try {
      const { data: assets, error } = await supabase
        .from('assets')
        .select('id, slug, image_url, storage_key, published_at')
        .eq('review_status', 'approved')
        .eq('legal_status', 'clean')
        .not('published_at', 'is', null)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return (assets || [])
        .filter(asset => asset.slug) // safe check for null slug
        .map((asset) => {
        let imageUrl = asset.image_url;
        if (!imageUrl && asset.storage_key && supabaseUrl) {
          imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${asset.storage_key}`;
        }
        return {
          url: `${baseUrl}/items/${asset.slug}`,
          lastModified: new Date(asset.published_at || new Date()),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
          images: imageUrl ? [imageUrl] : undefined,
        };
      });
    } catch (err) {
      console.error("🗺️ [sitemap.ts] Error fetching paginated assets:", err);
      return [];
    }
  }

  return [];
}

