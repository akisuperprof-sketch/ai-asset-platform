import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function listFiles() {
  const { adminClient } = await import("../lib/supabase");
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "sukashi-assets";

  if (!adminClient) {
    console.error("❌ adminClient is null");
    return;
  }

  console.log(`🔍 Listing files in bucket: ${bucketName}`);
  
  // Try to list folders
  const { data: rootFiles, error: rootError } = await adminClient.storage
    .from(bucketName)
    .list("");

  if (rootError) {
    console.error("❌ Root list error:", rootError.message);
  } else {
    console.log("📂 Root contents:", rootFiles.map(f => f.name));
  }

  // Try to list food folder
  const { data: foodFiles, error: foodError } = await adminClient.storage
    .from(bucketName)
    .list("food");

  if (foodError) {
    console.error("❌ 'food' folder list error:", foodError.message);
  } else {
    console.log("📂 'food' folder contents:", foodFiles.map(f => f.name));
  }
}

listFiles();
