import { createClient } from "@supabase/supabase-js";
import { PromptEngine } from "../src/lib/prompt-engine";
import { getGenerationProvider } from "../src/lib/generation/provider";
import { loadEnv } from "../src/lib/env";

loadEnv(false);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runDailyGeneration() {
  console.log("🚀 Starting Daily Premium Generation Pipeline...");

  if (process.env.GENERATION_ENABLED === "false") {
    console.log("🛑 GENERATION_ENABLED is false. Stopping immediately.");
    return;
  }

  const TARGET_COUNT = 100;
  
  // 1. Generate Prompts
  console.log(`\n🧠 Generating ${TARGET_COUNT} premium prompts via Gemini...`);
  const engine = new PromptEngine();
  const prompts = await engine.generatePrompts(TARGET_COUNT);
  
  console.log(`✅ Generated ${prompts.length} prompts successfully.`);

  // 2. Queue Jobs
  console.log("\n📥 Queuing jobs in DB...");
  const provider = getGenerationProvider();
  
  const jobsToInsert = prompts.map(p => ({
    keyword: p.keyword,
    category: p.category,
    prompt: p.prompt,
    negative_prompt: p.negativePrompt,
    provider: provider.name,
    status: 'queued'
  }));

  const { data: insertedJobs, error: insertError } = await supabase
    .from('generation_jobs')
    .insert(jobsToInsert)
    .select();

  if (insertError) {
    console.error("❌ Failed to queue jobs:", insertError.message);
    return;
  }

  console.log(`✅ Queued ${insertedJobs?.length || 0} jobs.`);

  // 3. Process Generation Queue (Dry Run / Mock)
  // For actual production, this might be a separate worker, but for the daily script we process it here.
  console.log("\n⚙️ Processing Generation Queue...");
  
  const { data: pendingJobs } = await supabase
    .from('generation_jobs')
    .select('*')
    .eq('status', 'queued')
    .limit(20); // Process in batches of 20 as an example hour limit

  if (!pendingJobs || pendingJobs.length === 0) {
    console.log("ℹ️ No pending jobs to process.");
    return;
  }

  for (const job of pendingJobs) {
    console.log(`  🎨 Generating asset for: [${job.category}] ${job.keyword}`);
    
    // Update to generating
    await supabase.from('generation_jobs').update({ status: 'generating' }).eq('id', job.id);
    
    const result = await provider.generate({
      prompt: job.prompt,
      negativePrompt: job.negative_prompt
    });

    if (result.success && result.imageUrls && result.imageUrls.length > 0) {
      // Success
      await supabase.from('generation_jobs').update({
        status: 'generated',
        image_url: result.imageUrls[0]
      }).eq('id', job.id);
      console.log(`    ✅ Generated (Mock).`);
    } else {
      // Failed
      const retryCount = (job.retry_count || 0) + 1;
      const status = retryCount >= 3 ? 'failed' : 'queued';
      await supabase.from('generation_jobs').update({
        status: status,
        error_message: result.error || "Unknown error",
        retry_count: retryCount
      }).eq('id', job.id);
      console.log(`    ❌ Failed: ${result.error}`);
    }
  }

  // 4. Mock QA Step
  console.log("\n🧪 Running Mock QA Audit on generated jobs...");
  const { data: generatedJobs } = await supabase
    .from('generation_jobs')
    .select('*')
    .eq('status', 'generated');

  if (generatedJobs) {
    for (const job of generatedJobs) {
      // In a real scenario, this would call VisionQA on job.image_url
      // Here we mock a random score to simulate QA gating
      const mockScore = Math.floor(Math.random() * 40) + 60; // 60 to 100
      const isPassed = mockScore >= 80;
      
      const qaResult = {
        commercial_score: mockScore,
        ai_artifact_score: Math.floor(Math.random() * 30),
        reasoning: "Mock QA evaluation completed"
      };

      await supabase.from('generation_jobs').update({
        status: isPassed ? 'qa_passed' : 'qa_failed',
        qa_score: mockScore,
        qa_result: qaResult
      }).eq('id', job.id);
      
      console.log(`  🔬 QA for ${job.keyword}: Score ${mockScore} -> ${isPassed ? 'PASSED' : 'FAILED'}`);
    }
  }

  console.log("\n✨ Daily Premium Generation Pipeline completed.");
  console.log("ℹ️ Note: This is currently running in DRY_RUN / Mock mode.");
  console.log("ℹ️ Jobs are saved to `generation_jobs`. None are imported into `assets` yet to prevent pollution.");
}

runDailyGeneration().catch(e => {
  console.error("Fatal error in generation pipeline:", e);
});
