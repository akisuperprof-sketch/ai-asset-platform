import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

// Requires URL and ANON_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const args = process.argv.slice(2);
  
  // Parsed arguments
  const limit = args.includes("--limit") ? parseInt(args[args.indexOf("--limit") + 1]) : 10;
  const statusArg = args.includes("--status") ? args[args.indexOf("--status") + 1] : "all";
  const force = args.includes("--force");
  
  // By default, dryRun is true. It can only be turned off by explicitly setting --dry-run false
  let dryRun = true;
  if (args.includes("--dry-run")) {
    const drValue = args[args.indexOf("--dry-run") + 1];
    if (drValue === "false") dryRun = false;
  }
  
  console.log(`\n======================================================`);
  console.log(`[Batch Audit] Starting Vision Commercial QA Batch Audit`);
  console.log(`======================================================`);
  console.log(`- Limit:       ${limit}`);
  console.log(`- Status:      ${statusArg}`);
  console.log(`- Dry-Run:     ${dryRun}`);
  console.log(`- Force:       ${force}`);
  console.log(`------------------------------------------------------`);
  
  let query = supabase.from("assets").select("id, title, image_url, review_status, qa_checked_at").order("created_at", { ascending: false });

  if (statusArg !== "all") {
    query = query.eq("review_status", statusArg);
  }

  // Unless force is provided, skip already audited assets
  if (!force) {
    query = query.is("qa_checked_at", null);
  }
  
  query = query.limit(limit);

  const { data: assets, error } = await query;

  if (error || !assets) {
    console.error("Failed to fetch assets", error);
    process.exit(1);
  }

  if (assets.length === 0) {
    console.log(`[Batch Audit] No assets found matching criteria. Exiting.`);
    process.exit(0);
  }

  console.log(`[Batch Audit] Found ${assets.length} assets to process.`);

  const strategyKey = process.env.D_STRATEGY_KEY;
  if (!strategyKey) {
    console.error("Missing D_STRATEGY_KEY in environment");
    process.exit(1);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    console.log(`\n[${i+1}/${assets.length}] Auditing Asset: ${asset.title} (${asset.id})`);
    console.log(`Current Status: ${asset.review_status}, QA Checked: ${asset.qa_checked_at ? 'Yes' : 'No'}`);
    
    try {
      const res = await fetch(`${baseUrl}/api/admin/qa-audit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": `D_STRATEGY_KEY=${strategyKey}`
        },
        body: JSON.stringify({
          assetId: asset.id,
          dryRun: dryRun
        })
      });

      const json = await res.json() as any;
      
      if (json.success) {
        console.log(`  [SUCCESS]`);
        console.log(`    Vision Score:     ${json.qaResult.visionScore}`);
        console.log(`    Commercial Score: ${json.qaResult.commercialScore}`);
        console.log(`    Canva Score:      ${json.qaResult.canvaScore}`);
        console.log(`    Pinterest Score:  ${json.qaResult.pinterestScore}`);
        console.log(`    AI Artifacts:     ${json.qaResult.aiArtifactScore}`);
        console.log(`    Recommended Act:  ${json.qaResult.qaRecommendedAction}`);
        console.log(`    Reasons:          ${json.qaResult.qaReasons.join(", ")}`);
        if (json.autoPended) {
          console.log(`    -> ⚠️ AUTO PENDED (Status changed to pending)`);
        }
        successCount++;
      } else {
        console.error(`  [FAILED]:`, json.error || json.details);
        errorCount++;
      }
    } catch (err: any) {
      console.error(`  [ERROR] API request failed:`, err.message);
      errorCount++;
    }
    
    // Rate limit mitigation: 2 seconds delay between API calls to Gemini
    if (i < assets.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  console.log(`\n======================================================`);
  console.log(`[Batch Audit] Completed.`);
  console.log(`- Success: ${successCount}`);
  console.log(`- Failed:  ${errorCount}`);
  console.log(`======================================================\n`);
}

main();
