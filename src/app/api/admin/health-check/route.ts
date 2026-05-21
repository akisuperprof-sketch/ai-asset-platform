import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { checkFileExists } from "@/lib/r2";
import fs from "fs";
import path from "path";

// このルートはキャッシュせず動的に判定します
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  if (!adminClient) {
    return NextResponse.json(
      { success: false, error: "Database admin client not configured." },
      { status: 500 }
    );
  }

  try {
    // ----------------------------------------------------
    // 1. DB HEALTH AUDIT
    // ----------------------------------------------------
    // アセットテーブルから全アセット情報を取得 (監査のため全件スキャン)
    const { data: allAssets, error: dbError } = await adminClient
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;
    const assets = allAssets || [];

    const total = assets.length;
    let approved = 0;
    let pending = 0;
    let rejected = 0;
    let draft = 0;

    const nullImages: any[] = [];
    const missingCategories: any[] = [];
    const missingTags: any[] = [];

    // slugの一致重複を検知するためのマップ
    const slugMap: Record<string, number> = {};
    const duplicateSlugsList: { slug: string; count: number }[] = [];

    assets.forEach((asset) => {
      // 承認ステータス集計
      if (asset.review_status === "approved") approved++;
      else if (asset.review_status === "pending") pending++;
      else if (asset.review_status === "rejected") rejected++;
      else draft++;

      // 画像欠損チェック
      if (!asset.image_url && !asset.storage_key) {
        nullImages.push({ id: asset.id, title: asset.title });
      }

      // カテゴリ欠損チェック
      if (!asset.category) {
        missingCategories.push({ id: asset.id, title: asset.title });
      }

      // タグ欠損チェック
      if (!asset.tags || asset.tags.length === 0) {
        missingTags.push({ id: asset.id, title: asset.title });
      }

      // slug重複チェック
      slugMap[asset.slug] = (slugMap[asset.slug] || 0) + 1;
    });

    // 重複しているslugを抽出
    Object.entries(slugMap).forEach(([slug, count]) => {
      if (count > 1) {
        duplicateSlugsList.push({ slug, count });
      }
    });

    // ----------------------------------------------------
    // 2. STORAGE HEALTH AUDIT
    // ----------------------------------------------------
    // DB上のstorage_keyと実ファイルの実在整合性チェック (最大100件まで並列確認)
    const storageAuditTargets = assets.slice(0, 100);
    const storageChecks = await Promise.all(
      storageAuditTargets.map(async (asset) => {
        if (!asset.storage_key) return { id: asset.id, exists: false, key: "" };
        const exists = await checkFileExists(asset.storage_key);
        return { id: asset.id, exists, key: asset.storage_key };
      })
    );

    const existsInStorage = storageChecks.filter((c) => c.exists);
    const missingInStorageList = storageChecks.filter((c) => !c.exists && c.key);

    // ----------------------------------------------------
    // 3. BROKEN IMAGE (HTTP URL VALIDATION)
    // ----------------------------------------------------
    // 最新15件のアセットに対してHTTP接続チェックを行い、URLが404になっていないか確認
    const imageAuditTargets = assets.slice(0, 15);
    const brokenImageChecks = await Promise.all(
      imageAuditTargets.map(async (asset) => {
        if (!asset.image_url) return { id: asset.id, title: asset.title, broken: true, url: "" };
        try {
          // HEADリクエストで高速に確認。失敗したらGETで二重確認
          const res = await fetch(asset.image_url, { method: "HEAD", next: { revalidate: 0 } });
          if (res.status === 200 || res.status === 304) {
            return { id: asset.id, title: asset.title, broken: false, url: asset.image_url };
          }
          
          // HEADが失敗した場合はGETで確認
          const getRes = await fetch(asset.image_url, { method: "GET", next: { revalidate: 0 } });
          if (getRes.status === 200 || getRes.status === 304) {
            return { id: asset.id, title: asset.title, broken: false, url: asset.image_url };
          }

          return { id: asset.id, title: asset.title, broken: true, url: asset.image_url, status: getRes.status };
        } catch (err: any) {
          return { id: asset.id, title: asset.title, broken: true, url: asset.image_url, error: err.message };
        }
      })
    );

    const brokenImageList = brokenImageChecks.filter((c) => c.broken);

    // ----------------------------------------------------
    // 4. FAILED JOBS LOG AUDIT
    // ----------------------------------------------------
    let failedJobsCount = 0;
    let failedJobsList: any[] = [];
    const failedJobsPath = path.join(process.cwd(), "output", "failed_jobs.json");
    
    if (fs.existsSync(failedJobsPath)) {
      try {
        const fileContent = fs.readFileSync(failedJobsPath, "utf-8");
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed)) {
          failedJobsCount = parsed.length;
          failedJobsList = parsed.slice(-10); // 直近10件のみ表示
        }
      } catch (err) {
        console.error("Failed to read failed_jobs.json:", err);
      }
    }

    // ----------------------------------------------------
    // 5. CACHE STATUS
    // ----------------------------------------------------
    const cacheStatus = {
      isDynamic: true,
      lastAuditedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      db: {
        total,
        approved,
        pending,
        rejected,
        draft,
        duplicateSlugCount: duplicateSlugsList.length,
        duplicateSlugs: duplicateSlugsList,
        nullImageCount: nullImages.length,
        nullImages,
        missingCategoryCount: missingCategories.length,
        missingCategories,
        missingTagsCount: missingTags.length,
        missingTags,
      },
      storage: {
        totalScanned: storageAuditTargets.length,
        existsInStorageCount: existsInStorage.length,
        missingInStorageCount: missingInStorageList.length,
        missingInStorageList,
      },
      brokenImages: {
        totalScanned: imageAuditTargets.length,
        brokenCount: brokenImageList.length,
        brokenList: brokenImageList,
      },
      failedJobs: {
        count: failedJobsCount,
        list: failedJobsList,
      },
      cache: cacheStatus,
    });
  } catch (err: any) {
    console.error("Health check audit failed:", err);
    return NextResponse.json(
      { success: false, error: err.message || err },
      { status: 500 }
    );
  }
}
