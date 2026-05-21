import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load env
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || "sukashi-assets";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Supabase URL or Service Role Key is missing in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runAudit() {
  console.log("🔍 Starting Database & Storage Audit...");
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Bucket Name: ${supabaseBucket}`);

  const { data: assets, error } = await supabase
    .from("assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ DB Query Error:", error);
    process.exit(1);
  }

  const total = assets.length;
  console.log(`\n📊 DB Total Assets: ${total}`);

  let approved = 0;
  let pending = 0;
  let rejected = 0;
  let draft = 0;

  const nullImages: any[] = [];
  const missingCategories: any[] = [];
  const missingTags: any[] = [];
  const slugMap: Record<string, number> = {};
  const duplicateSlugsList: { slug: string; count: number }[] = [];

  assets.forEach((asset) => {
    // review_status
    if (asset.review_status === "approved") approved++;
    else if (asset.review_status === "pending") pending++;
    else if (asset.review_status === "rejected") rejected++;
    else draft++;

    // null image
    if (!asset.image_url && !asset.storage_key) {
      nullImages.push({ id: asset.id, title: asset.title });
    }

    // category
    if (!asset.category) {
      missingCategories.push({ id: asset.id, title: asset.title });
    }

    // tags
    if (!asset.tags || asset.tags.length === 0) {
      missingTags.push({ id: asset.id, title: asset.title });
    }

    // slug duplicate
    slugMap[asset.slug] = (slugMap[asset.slug] || 0) + 1;
  });

  Object.entries(slugMap).forEach(([slug, count]) => {
    if (count > 1) {
      duplicateSlugsList.push({ slug, count });
    }
  });

  console.log(`\nReview Status Breakdown:`);
  console.log(`  - Approved: ${approved}`);
  console.log(`  - Pending: ${pending}`);
  console.log(`  - Rejected: ${rejected}`);
  console.log(`  - Draft: ${draft}`);

  console.log(`\nValidation Anomalies:`);
  console.log(`  - Null image_url & storage_key: ${nullImages.length}`);
  console.log(`  - Missing category: ${missingCategories.length}`);
  console.log(`  - Missing tags: ${missingTags.length}`);
  console.log(`  - Duplicate slug: ${duplicateSlugsList.length}`);
  if (duplicateSlugsList.length > 0) {
    console.log("    Duplicates:", JSON.stringify(duplicateSlugsList));
  }

  // Check Storage Files
  console.log(`\n📦 Querying Storage File list from bucket '${supabaseBucket}'...`);
  const { data: files, error: storageError } = await supabase.storage
    .from(supabaseBucket)
    .list("", { limit: 100 });

  if (storageError) {
    console.warn("⚠️ Storage list error or empty:", storageError);
  } else {
    console.log(`  - Storage files in root folder: ${files?.length || 0}`);
    files?.slice(0, 5).forEach(f => console.log(`    - ${f.name} (size: ${f.metadata?.size || 'unknown'})`));
  }

  // Broken image checker (HTTP ping to first 10 assets)
  console.log("\n🌐 Performing Broken Image HTTP Ping on first 10 assets...");
  const pings = await Promise.all(
    assets.slice(0, 10).map(async (asset) => {
      if (!asset.image_url) return { title: asset.title, status: "null url" };
      try {
        const res = await fetch(asset.image_url, { method: "HEAD" });
        return { title: asset.title, status: res.status, url: asset.image_url };
      } catch (err: any) {
        return { title: asset.title, status: "ERROR", error: err.message };
      }
    })
  );
  pings.forEach(p => {
    console.log(`  - [Status ${p.status}] ${p.title} (${p.url || p.error || ''})`);
  });
}

runAudit();
