import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function checkLogs() {
  const { adminClient } = await import("../lib/supabase");
  const slug = "onigiri-salted-rice-ball-001";

  if (!adminClient) {
    console.error("❌ adminClient is null");
    return;
  }

  console.log("📊 SUKASHI ダウンロード記録の最終確認...");

  // 1. download_logs の確認
  const { data: logs, error: logsError } = await adminClient
    .from("download_logs")
    .select("*")
    .order("downloaded_at", { ascending: false })
    .limit(5);

  if (logsError) {
    console.error("❌ download_logs 取得失敗:", logsError.message);
  } else {
    console.log(`✅ 直近のログ (件数: ${logs.length}):`);
    logs.forEach((log, i) => {
      console.log(`  [${i+1}] IP(hash): ${log.ip_address_hash.substring(0, 10)}... | Time: ${log.downloaded_at}`);
    });
  }

  // 2. download_count の確認
  const { data: asset, error: assetError } = await adminClient
    .from("assets")
    .select("id, title, download_count")
    .eq("slug", slug)
    .single();

  if (assetError) {
    console.error("❌ アセット取得失敗:", assetError.message);
  } else {
    console.log(`✅ アセット状況: ${asset.title}`);
    console.log(`📈 ダウンロード数 (download_count): ${asset.download_count}`);
  }
}

checkLogs();
