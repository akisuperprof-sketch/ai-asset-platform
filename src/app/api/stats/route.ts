import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase client is not initialized" },
      { status: 500 }
    );
  }

  try {
    // 1. Get total and status counts
    const { data: allAssets, error: fetchError } = await supabase
      .from("assets")
      .select("category, tags, created_at, published_at, review_status, legal_status, image_url, storage_key");

    if (fetchError) throw fetchError;

    const assets = allAssets || [];

    const totalAssets = assets.length;
    
    // Published status: approved, clean, published_at is not null, and has valid image
    const publishedAssets = assets.filter(
      (a) =>
        a.review_status === "approved" &&
        a.legal_status === "clean" &&
        a.published_at !== null &&
        (a.image_url || a.storage_key)
    ).length;

    const pendingAssets = assets.filter((a) => a.review_status === "pending").length;
    const rejectedAssets = assets.filter((a) => a.review_status === "rejected").length;
    const draftAssets = assets.filter((a) => a.review_status === "draft" || !a.review_status).length;

    // 2. Daily & Weekly added metrics
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayAdded = assets.filter((a) => new Date(a.created_at) >= startOfToday).length;
    const weeklyAdded = assets.filter((a) => new Date(a.created_at) >= startOfWeek).length;

    // 3. Category distribution (UI Map names)
    const reverseCategoryMap: Record<string, string> = {
      "food": "日本の食",
      "japan": "和の伝統素材",
      "festival": "年中行事・祭り",
      "season": "年中行事・祭り",
      "business": "ビジネス",
      "medical": "医療・ヘルスケア",
      "stationery": "事務用品・文具",
    };

    const categoryCounts: Record<string, number> = {};
    assets.forEach((a) => {
      const mappedCategory = reverseCategoryMap[a.category] || a.category;
      categoryCounts[mappedCategory] = (categoryCounts[mappedCategory] || 0) + 1;
    });

    // 4. Tag distribution count
    const tagCounts: Record<string, number> = {};
    assets.forEach((a) => {
      if (Array.isArray(a.tags)) {
        a.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // 5. Query Download Count from download_logs
    const { count: downloadCount, error: logError } = await supabase
      .from("download_logs")
      .select("id", { count: "exact", head: true });

    // 6. Get storage counts dynamically (Folders: food, japan, festival, business, medical)
    let storageFileCount = 0;
    const folders = ["food", "japan", "festival", "business", "medical"];
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "sukashi-assets";

    for (const folder of folders) {
      try {
        const { data: files } = await supabase.storage
          .from(bucketName)
          .list(folder, { limit: 100 });
        if (files) {
          storageFileCount += files.length;
        }
      } catch (e) {
        // Fallback or ignore folder if it doesn't exist
      }
    }

    // 7. Last generation time
    let lastGeneratedAt = null;
    if (assets.length > 0) {
      const sortedByCreated = [...assets].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      lastGeneratedAt = sortedByCreated[0].created_at;
    }

    return NextResponse.json({
      success: true,
      totalAssets,
      publishedAssets,
      pendingAssets,
      rejectedAssets,
      draftAssets,
      todayAdded,
      weeklyAdded,
      categoryCounts,
      tagCounts,
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
