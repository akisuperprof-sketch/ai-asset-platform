import { createClient } from "@supabase/supabase-js";
import { Asset } from "@/types";
import { dummyAssets, computeQualityGate } from "./dummy-data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fallback to dummy data if environment variables are missing
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// UI (Japanese) to DB (English) mapping
export const categoryMap: Record<string, string> = {
  "日本の食": "food",
  "和の伝統素材": "japan",
  "年中行事・祭り": "festival",
  "ビジネス": "business",
  "医療・ヘルスケア": "medical",
  "事務用品・文具": "stationery",
};

// DB (English) to UI (Japanese) mapping
export const reverseCategoryMap: Record<string, string> = {
  "food": "日本の食",
  "japan": "和の伝統素材",
  "festival": "年中行事・祭り",
  "business": "ビジネス",
  "medical": "医療・ヘルスケア",
  "stationery": "事務用品・文具",
};

/**
 * 公開条件（審査済み、クリーン、公開日時設定済み）を適用する共通クエリ
 */
const applyPublicFilters = (query: any) => {
  return query
    .eq('review_status', 'approved')
    .eq('legal_status', 'clean')
    .not('published_at', 'is', null);
};

/**
 * Supabase の snake_case データを Asset インターフェース（camelCase）に変換する
 */
function mapAsset(dbAsset: any): Asset {
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'sukashi-assets';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // image_url が空の場合は Supabase Storage のパブリック URL を生成
  let imageUrl = dbAsset.image_url;
  if (!imageUrl && dbAsset.storage_key && supabaseUrl) {
    imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${dbAsset.storage_key}`;
  }

  // thumbnail_url が空の場合は imageUrl を流用
  let thumbnailUrl = dbAsset.thumbnail_url;
  if (!thumbnailUrl) {
    thumbnailUrl = imageUrl;
  }

  const quality = computeQualityGate(dbAsset.id, dbAsset.title, dbAsset.category);

  return {
    id: dbAsset.id,
    title: dbAsset.title,
    category: reverseCategoryMap[dbAsset.category] || dbAsset.category,
    tags: dbAsset.tags || [],
    description: dbAsset.description,
    imageUrl: imageUrl || "",
    thumbnailUrl: thumbnailUrl || "",
    storageKey: dbAsset.storage_key,
    width: dbAsset.width || 0,
    height: dbAsset.height || 0,
    fileSize: dbAsset.file_size || "",
    isAiGenerated: dbAsset.is_ai_generated ?? true,
    isCommercialOk: dbAsset.legal_status === 'clean',
    licenseType: dbAsset.license_type || "free",
    reviewStatus: dbAsset.review_status || "approved",
    legalStatus: dbAsset.legal_status || "clean",
    publishedAt: dbAsset.published_at,
    compositionScore: dbAsset.composition_score || quality.compositionScore,
    centeringScore: dbAsset.centering_score || quality.centeringScore,
    marginScore: dbAsset.margin_score || quality.marginScore,
    whiteFringeScore: dbAsset.white_fringe_score || quality.whiteFringeScore,
    resolutionScore: dbAsset.resolution_score || quality.resolutionScore,
    aiDistortionScore: dbAsset.ai_distortion_score || quality.aiDistortionScore,
    subjectScore: dbAsset.subject_score || quality.subjectScore,
    pinterestScore: dbAsset.pinterest_score || quality.pinterestScore,
    canvaScore: dbAsset.canva_score || quality.canvaScore,
    luxuryScore: dbAsset.luxury_score || quality.luxuryScore,
    qualityRank: dbAsset.quality_rank || quality.qualityRank,
    rejectReason: dbAsset.reject_reason || quality.rejectReason,
    pinterestTitle: dbAsset.pinterest_title || quality.pinterestTitle,
    pinterestDescription: dbAsset.pinterest_description || quality.pinterestDescription,
    seoScore: dbAsset.seo_score || quality.seoScore,
  };
}

export async function getAssets(): Promise<Asset[]> {
  if (!supabase) return dummyAssets;

  try {
    const { data, error } = await applyPublicFilters(
      supabase.from('assets').select('*').order('published_at', { ascending: false })
    );

    if (error || !data) throw error;
    return data.map(mapAsset);
  } catch (error) {
    console.error("Supabase error (getAssets):", error);
    return dummyAssets;
  }
}

export async function getAssetById(id: string): Promise<Asset | null> {
  if (!supabase) return dummyAssets.find(a => a.id === id) || null;

  try {
    const { data, error } = await applyPublicFilters(
      supabase.from('assets').select('*').eq('id', id).single()
    );

    if (error) throw error;
    return mapAsset(data);
  } catch (error) {
    console.error("Supabase error (getAssetById):", error);
    return dummyAssets.find(a => a.id === id) || null;
  }
}

export async function searchAssets(query: string, category: string): Promise<Asset[]> {
  if (!supabase) {
    return dummyAssets.filter(asset => {
      const matchesSearch = !query || 
        asset.title.toLowerCase().includes(query.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      const matchesCategory = category === "すべて" || asset.category === category;
      return matchesSearch && matchesCategory;
    });
  }

  try {
    let supabaseQuery = supabase.from('assets').select('*');
    supabaseQuery = applyPublicFilters(supabaseQuery);

    if (category !== "すべて") {
      const dbCategory = categoryMap[category] || category;
      supabaseQuery = supabaseQuery.eq('category', dbCategory);
    }

    if (query) {
      // tags ARRAY への検索も含める
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);
    }

    const { data, error } = await supabaseQuery.order('published_at', { ascending: false });

    if (error || !data) throw error;
    return data.map(mapAsset);
  } catch (error) {
    console.error("Supabase error (searchAssets):", error);
    // Fallback search logic on dummy data
    return dummyAssets.filter(asset => {
      const matchesSearch = !query || asset.title.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "すべて" || asset.category === category;
      return matchesSearch && matchesCategory;
    });
  }
}
