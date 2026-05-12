import { createClient } from "@supabase/supabase-js";
import { Asset } from "@/types";
import { dummyAssets } from "./dummy-data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fallback to dummy data if environment variables are missing
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * 公開条件（審査済み、クリーン、公開日時設定済み）を適用する共通クエリ
 */
const applyPublicFilters = (query: any) => {
  return query
    .eq('review_status', 'approved')
    .eq('legal_status', 'clean')
    .not('published_at', 'is', null);
};

export async function getAssets(): Promise<Asset[]> {
  if (!supabase) return dummyAssets;

  try {
    const { data, error } = await applyPublicFilters(
      supabase.from('assets').select('*').order('published_at', { ascending: false })
    );

    if (error || !data) throw error;
    return data as Asset[];
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
    return data as Asset;
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
      supabaseQuery = supabaseQuery.eq('category', category);
    }

    if (query) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);
    }

    const { data, error } = await supabaseQuery.order('published_at', { ascending: false });

    if (error || !data) throw error;
    return data as Asset[];
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
