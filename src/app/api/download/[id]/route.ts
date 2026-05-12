import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase";
import { getDownloadUrl } from "@/lib/r2";
import crypto from "crypto";

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
  const { id } = await params;

  // 1. 管理用クライアントの確認
  if (!adminClient) {
    return NextResponse.json({ error: "Storage service unavailable" }, { status: 503 });
  }

  try {
    // 2. 素材情報の取得と公開条件のチェック
    const { data: asset, error } = await adminClient
      .from("assets")
      .select("id, storage_key, title, review_status, legal_status, published_at")
      .eq("id", id)
      .single();

    if (error || !asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // 公開条件チェック (approved, clean, published)
    const isPublic = 
      asset.review_status === 'approved' && 
      asset.legal_status === 'clean' && 
      asset.published_at !== null;

    if (!isPublic) {
      return NextResponse.json({ error: "Asset not available for download" }, { status: 403 });
    }

    if (!asset.storage_key) {
      return NextResponse.json({ error: "Source file not found in storage" }, { status: 404 });
    }

    // 3. ダウンロードログの記録 (非同期で実行)
    const ip = request.headers.get('x-forwarded-for') || '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || 'direct';

    // ログ記録とカウント加算を並列実行
    await Promise.all([
      adminClient.from('download_logs').insert({
        asset_id: id,
        ip_hash: hashIp(ip),
        user_agent: userAgent,
        referer: referer
      }),
      adminClient.rpc('increment_download_count', { asset_id_param: id }) // RPC側で引数名を合わせる
    ]).catch(err => console.error("Logging error:", err));

    // 4. R2署名付きURLの生成
    const downloadUrl = await getDownloadUrl(asset.storage_key);

    return NextResponse.json({ 
      url: downloadUrl,
      title: asset.title 
    });

  } catch (err) {
    console.error("Download API Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
