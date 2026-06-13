import { createClient } from "@supabase/supabase-js";
import { Asset } from "@/types";
import { dummyAssets, computeQualityGate } from "./dummy-data";
import { getSynonyms } from './search-normalizer';

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
  "season": "年中行事・祭り",
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
    categoryDomination: dbAsset.qa_result?.category_domination ? {
      baseAssetId: dbAsset.qa_result.category_domination.base_asset_id,
      variationType: dbAsset.qa_result.category_domination.variation_type,
      angle: dbAsset.qa_result.category_domination.angle,
      lighting: dbAsset.qa_result.category_domination.lighting,
      composition: dbAsset.qa_result.category_domination.composition,
      style: dbAsset.qa_result.category_domination.style,
      parentCategory: dbAsset.qa_result.category_domination.parent_category,
      seoSlug: dbAsset.qa_result.category_domination.seo_slug,
      relatedGroupId: dbAsset.qa_result.category_domination.related_group_id,
    } : undefined,
  };
}

export async function getAssets(limit: number = 100, offset: number = 0): Promise<Asset[]> {
  if (!supabase) {
    console.log("⚠️ [getAssets] Supabase client is not initialized. Returning dummyAssets.");
    return dummyAssets.slice(offset, offset + limit);
  }

  try {
    const { data, error } = await applyPublicFilters(
      supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
    );

    if (error) throw error;
    if (!data) return [];

    console.log(`📊 [getAssets] Supabase fetch success. Total rows fetched: ${data.length} (Offset: ${offset}, Limit: ${limit})`);
    
    // Filter assets with valid image URLs and log their metadata
    const validData = data.filter((d: any) => {
      const hasUrl = !!d.image_url || !!d.storage_key;
      if (!hasUrl) {
        console.log(`⚠️ [getAssets] Skipping asset because image_url / storage_key is missing: ID=${d.id}, Title=${d.title}`);
      }
      return hasUrl;
    });

    const mapped = validData.map((d: any) => {
      const asset = mapAsset(d);
      return asset;
    });

    if (offset === 0) {
      return [...dummyAssets, ...mapped].slice(0, limit);
    }
    return mapped;
  } catch (error: any) {
    console.error("❌ Supabase error (getAssets):", error.message || error);
    return [];
  }
}

export async function getAssetById(id: string): Promise<Asset | null> {
  const dummyMatch = dummyAssets.find(a => a.id === id);
  if (dummyMatch) return dummyMatch;

  if (!supabase) {
    console.log("⚠️ [getAssetById] Supabase client is not initialized. Returning null.");
    return null;
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    let query = supabase.from('assets').select('*');

    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data, error } = await applyPublicFilters(query.limit(1).maybeSingle());

    if (error) throw error;
    if (!data) {
      console.log(`[getAssetById] Not found for id/slug: ${id}. Maybe not approved/clean/published.`);
      return null;
    }
    
    console.log(`[getAssetById] Found asset by ${isUuid ? 'uuid' : 'slug'}: ${id}`);
    return mapAsset(data);
  } catch (error: any) {
    console.error(`❌ Supabase error (getAssetById for ${id}):`, error.message || error);
    return null;
  }
}

export async function searchAssets(query: string, category: string, limit: number = 100, offset: number = 0): Promise<Asset[]> {
  if (!supabase) {
    console.log("⚠️ [searchAssets] Supabase client is not initialized. Returning dummyAssets.");
    
    let filteredDummy = dummyAssets;
    if (category !== "すべて") {
      const dbCategory = categoryMap[category] || category;
      filteredDummy = filteredDummy.filter(a => a.category === dbCategory || a.category === category);
    }
    if (query) {
      const synonyms = getSynonyms(query).map(s => s.toLowerCase());
      filteredDummy = filteredDummy.filter(a => {
        const text = (a.title + " " + a.description + " " + (a.tags || []).join(" ")).toLowerCase();
        return synonyms.some(syn => text.includes(syn));
      });
    }
    return filteredDummy.slice(offset, offset + limit);
  }

  try {
    let supabaseQuery = supabase.from('assets').select('*');
    supabaseQuery = applyPublicFilters(supabaseQuery);

    if (category !== "すべて") {
      const dbCategory = categoryMap[category] || category;
      supabaseQuery = supabaseQuery.eq('category', dbCategory);
    }

    if (query) {
      const synonyms = getSynonyms(query);
      
      // We will build an OR query string that checks for each synonym
      // in title, description, or tags.
      // Supabase .or() syntax: 'title.ilike.%q1%,description.ilike.%q1%,tags.cs.{q1},title.ilike.%q2%,...'
      
      const orConditions = synonyms.map(syn => {
        // We use string replacement to safely escape single quotes if any
        const safeSyn = syn.replace(/'/g, "''");
        return `title.ilike.%${safeSyn}%,description.ilike.%${safeSyn}%,tags.cs.{${safeSyn}}`;
      });
      
      supabaseQuery = supabaseQuery.or(orConditions.join(','));
    }

    const { data, error } = await supabaseQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    if (!data) return [];

    console.log(`📊 [searchAssets] Query="${query}", Cat="${category}". Fetched: ${data.length}`);

    // Filter valid image URLs
    const validData = data.filter(d => !!d.image_url || !!d.storage_key);
    const dbResults = validData.map(mapAsset);

    let filteredDummy = dummyAssets;
    if (category !== "すべて") {
      const dbCategory = categoryMap[category] || category;
      filteredDummy = filteredDummy.filter(a => a.category === dbCategory || a.category === category);
    }
    if (query) {
      const synonyms = getSynonyms(query).map(s => s.toLowerCase());
      filteredDummy = filteredDummy.filter(a => {
        const text = (a.title + " " + a.description + " " + (a.tags || []).join(" ")).toLowerCase();
        return synonyms.some(syn => text.includes(syn));
      });
    }

    if (offset === 0) {
      return [...filteredDummy, ...dbResults].slice(0, limit);
    }
    return dbResults;
  } catch (error: any) {
    console.error("❌ Supabase error (searchAssets):", error.message || error);
    return [];
  }
}
