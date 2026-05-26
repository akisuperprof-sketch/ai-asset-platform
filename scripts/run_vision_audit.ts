import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

// Requires URL and ANON_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const args = process.argv.slice(2);
  const limit = args.includes("--limit") ? parseInt(args[args.indexOf("--limit") + 1]) : 10;
  // User asked for 10 limit test in Phase 3
  
  console.log(`[Batch Audit] Starting Vision QA Batch Audit... (Limit: ${limit})`);
  
  // Find assets to audit (where qa_checked_at is null, or we just take the first N)
  // For the test, we'll pick some pending/approved assets
  const { data: assets, error } = await supabase
    .from("assets")
    .select("id, title, image_url, review_status, qa_checked_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !assets) {
    console.error("Failed to fetch assets", error);
    process.exit(1);
  }

  console.log(`[Batch Audit] Found ${assets.length} assets to process.`);

  const strategyKey = process.env.D_STRATEGY_KEY;
  if (!strategyKey) {
    console.error("Missing D_STRATEGY_KEY in environment");
    process.exit(1);
  }

  for (const asset of assets) {
    console.log(`\n---------------------------------`);
    console.log(`Auditing Asset: ${asset.title} (${asset.id})`);
    console.log(`Current Status: ${asset.review_status}, QA Checked: ${asset.qa_checked_at ? 'Yes' : 'No'}`);

    // Call the API endpoint. In local script, we might not have the server running.
    // If the server is not running, we could call runVisionQA directly, but since we are asked to test the API,
    // we'll assume the API is accessible at some URL or we should just invoke the function.
    // Wait, the API requires cookies for authentication. In a script it's tricky to pass cookies.
    // So we just mock the request or hit a deployed URL.
    
    // Instead of HTTP fetch to API (which requires Next.js server to be running and cookie auth),
    // let's do a direct Supabase + Gemini call here for the batch script, OR
    // pass the cookie in headers if we point to localhost.
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    console.log(`Requesting QA API: ${baseUrl}/api/admin/qa-audit`);
    
    try {
      const res = await fetch(`${baseUrl}/api/admin/qa-audit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // The API expects cookie "D_STRATEGY_KEY"
          "Cookie": `D_STRATEGY_KEY=${strategyKey}`
        },
        body: JSON.stringify({
          assetId: asset.id,
          dryRun: true // DRY RUN MODE BY DEFAULT
        })
      });

      const json = await res.json() as any;
      
      if (json.success) {
        console.log(`[SUCCESS] Result for ${asset.title}:`);
        console.log(`  Vision Score:     ${json.qaResult.visionScore}`);
        console.log(`  Commercial Score: ${json.qaResult.commercialScore}`);
        console.log(`  Artifact Score:   ${json.qaResult.aiArtifactScore}`);
        console.log(`  Recommended Act:  ${json.qaResult.qaRecommendedAction}`);
        console.log(`  Reasons:          ${json.qaResult.qaReasons.join(", ")}`);
        if (json.autoPended) {
          console.log(`  -> ⚠️ AUTO PENDED (but wait, we are in dryRun, this should be false)`);
        }
      } else {
        console.error(`[FAILED] ${asset.title}:`, json.error);
      }
    } catch (err: any) {
      console.error(`[ERROR] API request failed:`, err.message);
    }
    
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log(`\n[Batch Audit] Completed.`);
}

main();
