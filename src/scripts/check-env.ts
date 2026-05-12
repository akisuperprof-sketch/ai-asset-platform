import fs from "fs";
import path from "path";

const requiredEnvs = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_ENDPOINT",
  "R2_PUBLIC_BASE_URL",
  "DOWNLOAD_URL_EXPIRES_IN"
];

const envLocalPath = path.join(process.cwd(), ".env.local");

console.log("🔍 SUKASHI 環境変数の存在チェックを開始します...");

if (!fs.existsSync(envLocalPath)) {
  console.log("\n❌ エラー: .env.local ファイルが見つかりません。");
  console.log(`📍 場所: ${envLocalPath}`);
  console.log("\n💡 解決策:");
  console.log("   1. cp .env.local.template .env.local を実行してください。");
  console.log("   2. .env.local に実際の値を入力してください。");
  process.exit(0); // 正常終了扱いで停止
}

console.log("(セキュリティのため、値の内容は表示しません)\n");

let missingCount = 0;

requiredEnvs.forEach(env => {
  const isPresent = !!process.env[env];
  if (isPresent) {
    console.log(`✅ OK      : ${env}`);
  } else {
    console.log(`❌ MISSING : ${env}`);
    missingCount++;
  }
});

if (missingCount === 0) {
  console.log("\n✨ すべての必須環境変数が設定されています。疎通確認(verify-sukashi.ts)に進んでください。");
} else {
  console.log(`\n⚠️  ${missingCount} 個の環境変数が不足しています。.env.local を作成して設定してください。`);
}
