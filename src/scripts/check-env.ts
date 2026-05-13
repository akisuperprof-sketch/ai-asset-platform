import fs from "fs";
import path from "path";

const requiredEnvs = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
  "DOWNLOAD_URL_EXPIRES_IN"
];

const optionalR2Envs = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_ENDPOINT",
  "R2_PUBLIC_BASE_URL"
];

const envLocalPath = path.join(process.cwd(), ".env.local");

console.log("🔍 SUKASHI 環境変数のファイル確認を開始します (Supabase Storage版)...");

if (!fs.existsSync(envLocalPath)) {
  console.log("\n❌ エラー: .env.local ファイルが見つかりません。");
  console.log(`📍 場所: ${envLocalPath}`);
  console.log("\n💡 解決策:");
  console.log("   1. cp .env.local.template .env.local を実行してください。");
  console.log("   2. .env.local に実際の値を入力してください。");
  process.exit(0);
}

const content = fs.readFileSync(envLocalPath, "utf-8");
const envMap: Record<string, string> = {};

content.split("\n").forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
    const [key, ...valueParts] = trimmed.split("=");
    envMap[key.trim()] = valueParts.join("=").trim();
  }
});

let missingCount = 0;

console.log("\n--- 必須項目 (Supabase) ---");
requiredEnvs.forEach(env => {
  const val = envMap[env];
  const isSet = val && !val.includes("your-") && val.length > 0;
  
  if (isSet) {
    console.log(`✅ SET      : ${env}`);
  } else {
    console.log(`❌ MISSING  : ${env}`);
    missingCount++;
  }
});

console.log("\n--- オプション項目 (Cloudflare R2 - 将来用) ---");
optionalR2Envs.forEach(env => {
  const val = envMap[env];
  const isSet = val && !val.includes("your-") && val.length > 0;
  console.log(`${isSet ? "✅" : "⚪️"} OPTIONAL : ${env}`);
});

if (missingCount === 0) {
  console.log("\n✨ 必須項目がすべて設定されています！");
  console.log("npx -y tsx src/scripts/verify-sukashi.ts で実疎通を確認してください。");
} else {
  console.log(`\n⚠️  ${missingCount} 個の必須項目が未設定です。`);
}
