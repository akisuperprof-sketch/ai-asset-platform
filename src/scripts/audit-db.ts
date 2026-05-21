import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Environment variables are not set in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runAudit() {
  console.log("==========================================");
  console.log("🔍 ASSETNINJA LIVE DB & STORAGE AUDIT START");
  console.log("==========================================");

  // 1. Get Assets statistics
  const { data: assets, error: assetsError } = await supabase
    .from("assets")
    .select("*");

  if (assetsError) {
    console.error("❌ Error fetching assets:", assetsError);
    return;
  }

  const total = assets.length;
  console.log(`\n📊 [assets table]`);
  console.log(`- Total Assets: ${total}`);

  // review_status counts
  const statusCounts: Record<string, number> = {};
  assets.forEach(a => {
    const status = a.review_status || "null/draft";
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  console.log(`- Review Status Counts:`, statusCounts);

  // legal_status counts
  const legalCounts: Record<string, number> = {};
  assets.forEach(a => {
    const status = a.legal_status || "null";
    legalCounts[status] = (legalCounts[status] || 0) + 1;
  });
  console.log(`- Legal Status Counts:`, legalCounts);

  // published count (status = approved, legal = clean, published_at is not null, has image)
  const publishedCount = assets.filter(
    (a) =>
      a.review_status === "approved" &&
      a.legal_status === "clean" &&
      a.published_at !== null &&
      (a.image_url || a.storage_key)
  ).length;
  console.log(`- Published (Live) Assets: ${publishedCount}`);

  // category counts
  const categoryCounts: Record<string, number> = {};
  assets.forEach(a => {
    const cat = a.category || "null";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  console.log(`- Raw Category Counts:`, categoryCounts);

  // tags count
  const tagCounts: Record<string, number> = {};
  assets.forEach(a => {
    if (Array.isArray(a.tags)) {
      a.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  console.log(`- Unique Tags Count: ${Object.keys(tagCounts).length}`);
  console.log(`- Top 15 Tags:`, Object.entries(tagCounts).sort((a,b) => b[1] - a[1]).slice(0, 15));

  // Today & Weekly additions
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const todayAdded = assets.filter(a => new Date(a.created_at) >= startOfToday).length;
  const weeklyAdded = assets.filter(a => new Date(a.created_at) >= startOfWeek).length;
  console.log(`- Added Today (created_at >= today): ${todayAdded}`);
  console.log(`- Added This Week (created_at >= 7d ago): ${weeklyAdded}`);

  // Has image URLs
  const hasImageUrl = assets.filter(a => a.image_url).length;
  const hasStorageKey = assets.filter(a => a.storage_key).length;
  const hasBoth = assets.filter(a => a.image_url && a.storage_key).length;
  console.log(`- Has image_url: ${hasImageUrl}`);
  console.log(`- Has storage_key: ${hasStorageKey}`);
  console.log(`- Has both: ${hasBoth}`);

  // 2. Fetch download_logs
  const { count: dlCount, error: dlError } = await supabase
    .from("download_logs")
    .select("id", { count: "exact", head: true });
  
  if (dlError) {
    console.error("❌ Error fetching download_logs count:", dlError);
  } else {
    console.log(`\n📊 [download_logs table]`);
    console.log(`- Total Download Logs: ${dlCount}`);
  }

  // 3. Storage inspection
  console.log(`\n📊 [Supabase Storage]`);
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "sukashi-assets";
  const folders = ["food", "japan", "festival", "business", "medical"];
  let totalStorageFiles = 0;
  const storageFilesList: string[] = [];

  for (const folder of folders) {
    try {
      const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list(folder, { limit: 100 });
      
      if (error) {
        console.error(`- Error listing folder ${folder}:`, error.message);
        continue;
      }
      
      const fileCount = files ? files.length : 0;
      console.log(`- Folder '${folder}': ${fileCount} files`);
      totalStorageFiles += fileCount;
      if (files) {
        files.forEach(f => {
          if (f.name !== ".emptyFolderPlaceholder") {
            storageFilesList.push(`${folder}/${f.name}`);
          }
        });
      }
    } catch (e: any) {
      console.error(`- Exception listing folder ${folder}:`, e.message || e);
    }
  }
  console.log(`- Total files found in Storage list: ${totalStorageFiles}`);

  // 4. Integrity check: Database vs Storage
  console.log(`\n🔍 [Integrity Validation]`);
  let dbMissingStorage = 0;
  let dbMissingStorageList: string[] = [];
  
  assets.forEach(a => {
    if (a.storage_key) {
      const match = storageFilesList.some(f => f.toLowerCase() === a.storage_key.toLowerCase());
      if (!match) {
        dbMissingStorage++;
        dbMissingStorageList.push(`Asset ID: ${a.id} | title: ${a.title} | key: ${a.storage_key}`);
      }
    }
  });

  if (dbMissingStorage > 0) {
    console.warn(`⚠️  WARNING: ${dbMissingStorage} database records reference storage_keys that are not listed in Storage:`);
    dbMissingStorageList.forEach(item => console.warn(`  - ${item}`));
  } else {
    console.log(`✅ All database storage_keys match physical files in Storage.`);
  }

  console.log("\n==========================================");
  console.log("🔍 AUDIT COMPLETE");
  console.log("==========================================");
}

runAudit();
