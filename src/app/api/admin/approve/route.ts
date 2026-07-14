import { verifyAdminRequest } from '@/lib/server/cron-auth';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// 商標ブラックリスト (簡易チェック用)
const TRADEMARK_BLACKLIST = [
  "canva",
  "adobe",
  "shutterstock",
  "getty",
  "pixta",
  "apple",
  "google",
  "toyota",
  "sony",
  "microsoft",
  "amazon",
  "facebook",
  "instagram",
  "disney"
];

// 不適切ワードリスト (NSFW)
const NSFW_BLACKLIST = [
  "nsfw",
  "nude",
  "sexy",
  "hentai",
  "porn",
  "adult",
  "goregous", // 誤判定しやすいが簡易一致
  "erotic",
  "violence"
];

// アセット単位の安全監査関数
async function auditAssetBeforeApproval(asset: any): Promise<{ safe: boolean; reason?: string }> {
  // 1. null image チェック
  if (!asset.image_url && !asset.storage_key) {
    return { safe: false, reason: "画像URLまたはStorage Keyがありません (Broken Image)" };
  }

  // 2. category 欠損
  if (!asset.category) {
    return { safe: false, reason: "カテゴリが欠損しています" };
  }

  // 3. tags 欠損
  if (!asset.tags || asset.tags.length === 0) {
    return { safe: false, reason: "タグが設定されていません" };
  }

  // 4. 商標ブラックリストチェック (title, tags, description)
  const searchText = `${asset.title} ${asset.tags.join(" ")} ${asset.description || ""}`.toLowerCase();
  for (const brand of TRADEMARK_BLACKLIST) {
    if (searchText.includes(brand)) {
      return { safe: false, reason: `商標ブラックリストワード '${brand}' が含まれています` };
    }
  }

  // 5. NSFW ブラックリストチェック
  for (const nsfw of NSFW_BLACKLIST) {
    if (searchText.includes(nsfw)) {
      return { safe: false, reason: `NSFW/不適切ワード '${nsfw}' が含まれています` };
    }
  }

  // 6. 画像のHTTP疎通チェック (Broken Image 監査)
  if (asset.image_url) {
    try {
      const res = await fetch(asset.image_url, { method: "HEAD" });
      if (res.status !== 200 && res.status !== 304) {
        // GETで再確認
        const getRes = await fetch(asset.image_url, { method: "GET" });
        if (getRes.status !== 200 && getRes.status !== 304) {
          return { safe: false, reason: `画像URLが404/破損しています (HTTPステータス: ${getRes.status})` };
        }
      }
    } catch (err: any) {
      return { safe: false, reason: `画像の疎通確認に失敗しました: ${err.message}` };
    }
  }

  return { safe: true };
}

export async function POST(request: Request) {
  const authResult = verifyAdminRequest(request);
  if (!authResult.ok) return authResult.response;

  try {
    const cookieStore = await cookies();
    const strategyKey = cookieStore.get("D_STRATEGY_KEY")?.value;

    if (!strategyKey || strategyKey !== process.env.D_STRATEGY_KEY) {
      return NextResponse.json({ success: false, error: "Unauthorized QA Access" }, { status: 401 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    if (!checkRateLimit(`admin:${ip}`, 30, 60 * 1000)) {
      return NextResponse.json({ success: false, error: "Too many admin requests" }, { status: 429 });
    }

    if (!adminClient) {
      return NextResponse.json(
        { success: false, error: "Database admin client not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { assetId, action, ids, confirm } = body;

    // 5. 自動approve禁止: confirm gate
    if (action === "bulk_approve" || action === "approve_single") {
      if (confirm !== true) {
        return NextResponse.json({ success: false, error: "Manual confirmation gate: 'confirm: true' is required." }, { status: 403 });
      }
    }


    if (action === "bulk_approve") {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ success: false, error: "ids array is required." }, { status: 400 });
      }

      // 1. Fetch requested pending assets
      const { data: pendingAssets, error: fetchError } = await adminClient
        .from("assets")
        .select("*")
        .in("id", ids)
        .eq("review_status", "pending");

      if (fetchError) throw fetchError;
      if (!pendingAssets || pendingAssets.length === 0) {
        return NextResponse.json({
          success: true,
          message: "承認待ちのアセットは見つかりませんでした。",
          approvedCount: 0,
          skippedCount: 0,
          details: []
        });
      }

      const approvedIds: string[] = [];
      const skippedDetails: { id: string; title: string; reason: string }[] = [];

      // 2. Audit each asset
      for (const asset of pendingAssets) {
        const auditResult = await auditAssetBeforeApproval(asset);
        if (auditResult.safe) {
          approvedIds.push(asset.id);
        } else {
          skippedDetails.push({
            id: asset.id,
            title: asset.title,
            reason: auditResult.reason || "未知の理由"
          });
        }
      }

      if (approvedIds.length > 0) {
        const { error: updateError } = await adminClient
          .from("assets")
          .update({
            review_status: "approved",
            published_at: new Date().toISOString()
          })
          .in("id", approvedIds);

        if (updateError) throw updateError;
      }

      return NextResponse.json({
        success: true,
        message: `${approvedIds.length} 件のアセットを一括承認しました。`,
        approvedCount: approvedIds.length,
        skippedCount: skippedDetails.length,
        skippedDetails
      });

    } else if (action === "bulk_reject") {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ success: false, error: "ids array is required." }, { status: 400 });
      }

      const { error: updateError } = await adminClient
        .from("assets")
        .update({ review_status: "rejected" })
        .in("id", ids);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        message: `${ids.length} 件のアセットを一括却下しました。`
      });

    } else if (action === "approve_single") {
      if (!assetId) {
        return NextResponse.json({ success: false, error: "assetId is required for single approval." }, { status: 400 });
      }

      // 個別承認の実行
      // 1. 対象アセットの取得
      const { data: asset, error: fetchError } = await adminClient
        .from("assets")
        .select("*")
        .eq("id", assetId)
        .single();

      if (fetchError) throw fetchError;
      if (!asset) {
        return NextResponse.json({ success: false, error: "Asset not found." }, { status: 404 });
      }

      // 2. 安全監査
      const auditResult = await auditAssetBeforeApproval(asset);
      if (!auditResult.safe) {
        return NextResponse.json({
          success: false,
          error: `監査を通過できませんでした: ${auditResult.reason}`
        }, { status: 400 });
      }

      // 3. ステータス更新
      const { error: updateError } = await adminClient
        .from("assets")
        .update({
          review_status: "approved",
          published_at: new Date().toISOString()
        })
        .eq("id", assetId);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        message: `アセット '${asset.title}' を承認しました。`
      });

    } else if (action === "reject_single") {
      if (!assetId) {
        return NextResponse.json({ success: false, error: "assetId is required." }, { status: 400 });
      }

      // 却下処理 (安全対策として却下ステータスへの遷移)
      const { error: updateError } = await adminClient
        .from("assets")
        .update({
          review_status: "rejected"
        })
        .eq("id", assetId);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        message: "アセットを却下（不採用）にしました。"
      });

    } else {
      return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Approval error:", err);
    return NextResponse.json({ success: false, error: err.message || err }, { status: 500 });
  }
}
