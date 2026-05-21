import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "sukashi-assets";

async function cleanup() {
  console.log("🧼 Starting Salted Onigiri Cleanup...");

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const targetSlug = "onigiri-salted-rice-ball-001";
  const targetStorageKey = "food/onigiri-salted-rice-ball-001.png";

  // 1. Delete from DB
  console.log(`🗑️ Deleting from assets table where slug = "${targetSlug}"...`);
  const { data: dbData, error: dbError } = await supabase
    .from("assets")
    .delete()
    .eq("slug", targetSlug)
    .select();

  if (dbError) {
    console.error("❌ Failed to delete from assets table:", dbError.message);
  } else {
    console.log(`✅ DB rows deleted: ${dbData?.length || 0} row(s)`);
    if (dbData && dbData.length > 0) {
      console.log("   Deleted asset:", dbData[0].title);
    }
  }

  // 2. Delete from Storage
  console.log(`🗑️ Deleting from storage bucket "${bucketName}" with key = "${targetStorageKey}"...`);
  const { data: storageData, error: storageError } = await supabase.storage
    .from(bucketName)
    .remove([targetStorageKey]);

  if (storageError) {
    console.error("❌ Failed to delete from Storage:", storageError.message);
  } else {
    console.log(`✅ Storage file removed:`, storageData);
  }

  console.log("🧼 Cleanup process complete.");
}

cleanup().catch(console.error);
