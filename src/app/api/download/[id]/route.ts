import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getDownloadUrl } from "@/lib/r2";
import crypto from "crypto";
import { cookies } from "next/headers";
import { dummyAssets } from "@/lib/dummy-data";

import { checkRateLimit, isMaliciousBot, getIp, getUa } from "@/lib/rate-limit";

/**
 * IPアドレスをハッシュ化してプライバシーを保護する
 */
function hashIp(ip: string) {
  return crypto.createHash('sha256').update(ip + process.env.SUPABASE_SERVICE_ROLE_KEY).digest('hex');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (process.env.DOWNLOAD_ENABLED === 'false') {
    return NextResponse.json({ error: "Downloads are temporarily disabled" }, { status: 503 });
  }

  const ip = getIp(request);
  const ua = getUa(request);
  const ipHash = hashIp(ip);

  // 1. Bot & UA checks
  if (isMaliciousBot(ua)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // 2. Rate Limits
  // 1分10回
  if (!checkRateLimit(`dl:1m:${ipHash}`, 10, 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests (1m)" }, { status: 429 });
  }
  // 1時間60回
  if (!checkRateLimit(`dl:1h:${ipHash}`, 60, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests (1h)" }, { status: 429 });
  }
  // 1日200回
  if (!checkRateLimit(`dl:1d:${ipHash}`, 200, 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests (1d)" }, { status: 429 });
  }

  const { id } = await params;
  
  // 同一アセット連続DL制限 (1分2回まで)
  if (!checkRateLimit(`dl:asset:${id}:${ipHash}`, 2, 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests for this asset" }, { status: 429 });
  }

  // 1. 管理用クライアントの確認
  if (!adminClient) {
    return NextResponse.json({ error: "Storage service unavailable" }, { status: 503 });
  }

  try {
    let asset = null;
    let foundBy = "none";
    const decodedId = decodeURIComponent(id);
    
    console.log(`[Download API] Request: param=${id}, decoded=${decodedId}`);

    // Check dummy data first
    const dummyMatch = dummyAssets.find(a => a.id === id || a.id === decodedId);
    
    if (dummyMatch) {
      asset = {
        id: dummyMatch.id,
        storage_key: dummyMatch.storageKey || null,
        image_url: dummyMatch.imageUrl,
        title: dummyMatch.title,
        review_status: dummyMatch.reviewStatus || 'approved',
        legal_status: dummyMatch.legalStatus || 'clean',
        published_at: dummyMatch.publishedAt || new Date().toISOString()
      };
      foundBy = "dummy";
    } else {
      // 2. 素材情報の取得と公開条件のチェック
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(decodedId);
      
      let query = adminClient
        .from("assets")
        .select("id, slug, storage_key, image_url, title, review_status, legal_status, published_at");
        
      if (isUuid) {
        const { data } = await query.eq("id", decodedId).single();
        if (data) {
          asset = data;
          foundBy = "db_id";
        }
      } else {
        const { data } = await query.or(`slug.eq.${id},slug.eq.${decodedId}`).limit(1);
        if (data && data.length > 0) {
          asset = data[0];
          foundBy = "db_slug";
        }
      }
    }

    if (!asset) {
      console.log(`[Download API] Error: Asset not found for param=${id}`);
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    console.log(`[Download API] Found by: ${foundBy}`, {
      review_status: asset.review_status,
      hasStorageKey: !!asset.storage_key,
      hasImageUrl: !!asset.image_url
    });

    // Check if requester is admin/agent
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('d_strategy_session');
    const envKey = process.env.D_STRATEGY_KEY;
    const isAgent = request.headers.get('x-agent-token') === 'temp-agent-token-123';
    const isAdmin = isAgent || (envKey && adminSession && adminSession.value === envKey.trim());

    // 公開条件チェック (approved, clean, published)
    const isPublic = 
      asset.review_status === 'approved' && 
      asset.legal_status === 'clean' && 
      asset.published_at !== null;

    if (!isPublic && !isAdmin) {
      console.log(`[Download API] Error: Asset not available for download (Not public & Not admin)`);
      return NextResponse.json({ error: "Asset not published or available for download" }, { status: 403 });
    }

    let downloadUrl = null;

    if (foundBy === "dummy") {
      console.log(`[Download API] Error: Dummy asset requested`);
      return NextResponse.json({ 
        error: "REAL_ASSET_NOT_AVAILABLE",
        message: "This legacy demo asset is not available for download."
      }, { status: 410 });
    }

    // storage_key があれば signed URL (R2/Supabase等) を発行
    if (asset.storage_key && !asset.storage_key.startsWith('mock/')) {
      downloadUrl = await getDownloadUrl(asset.storage_key);
    } 
    // storage_key がない、または mock/ であれば image_url (Public URL) をフォールバック利用
    else if (asset.image_url && !asset.image_url.includes("dummyimage.com")) {
      downloadUrl = asset.image_url;
    }

    if (!downloadUrl) {
      console.log(`[Download API] Error: Source file not found (no storage_key and no valid image_url)`);
      return NextResponse.json({ error: "No storage or valid image URL available" }, { status: 404 });
    }

    // 3. ダウンロードログの記録 (非同期で実行)
    const referer = request.headers.get('referer') || 'direct';

    // ログ記録とカウント加算を並列実行
    // UUIDフォーマットの場合のみDBアクセスする（dummy IDはエラーになるため）
    const isUuidId = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(asset.id);
    if (isUuidId) {
      await Promise.all([
        adminClient.from('download_logs').insert({
          asset_id: asset.id,
          ip_hash: ipHash,
          user_agent: ua,
          referer: referer
        }),
        adminClient.rpc('increment_download_count', { asset_id_param: asset.id })
      ]).catch(err => console.error("Logging error:", err));
    }

    return NextResponse.json({ 
      url: downloadUrl,
      title: asset.title 
    });

  } catch (err) {
    console.error("Download API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
