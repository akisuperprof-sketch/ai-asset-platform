import { NextResponse } from "next/server";
import { adminClient as supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase client is not initialized" },
      { status: 500 }
    );
  }

  const client = supabase; // Capture non-null reference for closures

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Parallel exact count queries
    const [
      { count: totalAssets },
      { count: publishedAssets },
      { count: pendingAssets },
      { count: rejectedAssets },
      { count: draftAssets },
      { count: todayAdded },
      { count: weeklyAdded },
      { count: downloadCount }
    ] = await Promise.all([
      client.from("assets").select("id", { count: "exact", head: true }),
      client.from("assets").select("id", { count: "exact", head: true })
        .eq("review_status", "approved")
        .eq("legal_status", "clean")
        .not("published_at", "is", null)
        .not("image_url", "is", null),
      client.from("assets").select("id", { count: "exact", head: true })
        .eq("review_status", "pending"),
      client.from("assets").select("id", { count: "exact", head: true })
        .eq("review_status", "rejected"),
      client.from("assets").select("id", { count: "exact", head: true })
        .in("review_status", ["draft", null]),
      client.from("assets").select("id", { count: "exact", head: true })
        .gte("created_at", startOfToday),
      client.from("assets").select("id", { count: "exact", head: true })
        .gte("created_at", startOfWeek),
      client.from("download_logs").select("id", { count: "exact", head: true })
    ]);

    // 2. Category specific exact counts (using DB keys)
    const categoryKeys = ["food", "japan", "festival", "business", "medical", "object", "background", "stationery", "anime-style-safe"];
    const reverseCategoryMap: Record<string, string> = {
      "food": "日本の食",
      "japan": "和の伝統素材",
      "festival": "年中行事・祭り",
      "business": "ビジネス",
      "medical": "医療・ヘルスケア",
      "object": "日常小物・オブジェクト",
      "background": "背景・テクスチャ",
      "stationery": "事務用品・文具",
      "anime-style-safe": "アニメスタイル・セーフ"
    };

    const categoryPromises = categoryKeys.map(key => 
      client.from("assets").select("id", { count: "exact", head: true }).eq("category", key)
    );
    const categoryResults = await Promise.all(categoryPromises);
    
    const categoryCounts: Record<string, number> = {};
    categoryResults.forEach((result, index) => {
      const catKey = categoryKeys[index];
      const displayName = reverseCategoryMap[catKey] || catKey;
      if (result.count && result.count > 0) {
        categoryCounts[displayName] = result.count;
      }
    });

    // 3. Storage file count approximation using list
    let storageFileCount = 0;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "sukashi-assets";
    
    // For storage, we can only list per folder up to limits, so we'll do a simple check
    try {
      const storagePromises = categoryKeys.map(folder => 
        client.storage.from(bucketName).list(folder, { limit: 100 })
      );
      const storageResults = await Promise.all(storagePromises);
      storageResults.forEach(res => {
        if (res.data) storageFileCount += res.data.length;
      });
    } catch (e) {
      // Ignore storage errors
    }

    // 4. Last generated at
    const { data: lastGenData } = await supabase
      .from("assets")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1);

    const lastGeneratedAt = lastGenData && lastGenData.length > 0 ? lastGenData[0].created_at : null;

    return NextResponse.json({
      success: true,
      totalAssets: totalAssets || 0,
      publishedAssets: publishedAssets || 0,
      pendingAssets: pendingAssets || 0,
      rejectedAssets: rejectedAssets || 0,
      draftAssets: draftAssets || 0,
      todayAdded: todayAdded || 0,
      weeklyAdded: weeklyAdded || 0,
      categoryCounts,
      tagCounts: {}, // Exact tag counts require RPC. Returning empty to avoid JS memory exhaustion.
      storageFileCount,
      downloadCount: downloadCount || 0,
      lastGeneratedAt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || error },
      { status: 500 }
    );
  }
}
