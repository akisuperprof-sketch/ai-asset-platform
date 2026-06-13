import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { execSync } from 'child_process';
import minimist from 'minimist';

console.log("🔒 Checking for .env.worker.local...");

if (fs.existsSync('.env.worker.local')) {
  console.log("📄 Found .env.worker.local. Loading local overrides (Skipping Vercel env pull)...");
  dotenv.config({ path: '.env.worker.local' });
} else {
  console.log("🔒 .env.worker.local not found. Pulling production secrets from Vercel...");
  try {
    execSync('npx vercel env pull .env.worker.temp --environment=production --yes', { stdio: 'ignore' });
    const vercelEnv = dotenv.parse(fs.readFileSync('.env.worker.temp'));
    for (const key in vercelEnv) {
      if (!process.env[key]) {
        process.env[key] = vercelEnv[key];
      }
    }
    fs.unlinkSync('.env.worker.temp');
    console.log("🧹 Secured: Temporary secret file removed from disk.");
  } catch (e: any) {
    console.error("⚠️ Failed to pull Vercel secrets. Make sure you are logged in via 'npx vercel login'.");
  }
}

console.log("🔍 Checking loaded secrets (boolean presence):");
const targetKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GOOGLE_API_KEY",
  "GEMINI_API_KEY",
  "GOOGLE_IMAGE_MODEL",
  "GENERATION_PROVIDER",
  "GENERATION_ENABLED",
  "SUPABASE_STORAGE_BUCKET"
];
for (const key of targetKeys) {
  const value = process.env[key];
  const hasValue = value !== undefined && value.trim() !== "";
  console.log(`   - ${key}: ${hasValue}`);
}
import { createClient } from '@supabase/supabase-js';
import { getGenerationProvider } from '../lib/generation/provider';
import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';
import { runVisionQA } from '../lib/vision-qa';


// Validate env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseKey);

async function main() {
  const args = minimist(process.argv.slice(2));
  const limit = parseInt(args.limit || '1', 10);
  
  console.log(`🚀 Starting External Generation Worker (limit: ${limit})`);
  
  const { data: jobs, error: fetchError } = await adminClient
    .from('generation_jobs')
    .select('*')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (fetchError) {
    console.error("❌ Error fetching jobs:", fetchError);
    process.exit(1);
  }

  if (!jobs || jobs.length === 0) {
    console.log("✅ No queued jobs found.");
    process.exit(0);
  }

  const provider = getGenerationProvider();
  console.log(`🤖 Using Provider: ${provider.name}`);

  for (const job of jobs) {
    console.log(`\n======================================`);
    console.log(`⚙️ Processing Job: ${job.id} | Keyword: ${job.keyword}`);

    try {
      // 1. Mark as processing
      await adminClient.from('generation_jobs').update({ status: 'generating' }).eq('id', job.id);

      // 2. Generate Image
      console.log(`🎨 Generating image...`);
      const genResult = await provider.generate({
        prompt: job.prompt || `transparent png of ${job.keyword}, isolated on a clean white background, high quality commercial asset`,
        negativePrompt: job.negative_prompt || "noisy, blurry, messy edges"
      });

      if (!genResult.success || !genResult.imageUrls || genResult.imageUrls.length === 0) {
        throw new Error(genResult.error || "Generation failed");
      }

      const generatedImageUrl = genResult.imageUrls[0];
      if (generatedImageUrl.startsWith('data:')) {
        console.log(`✅ Generated: [Base64 Data URI omitted, length: ${generatedImageUrl.length}]`);
      } else {
        console.log(`✅ Generated: ${generatedImageUrl}`);
      }

      // 3. Download / Extract generated image
      console.log(`📥 Downloading/Extracting generated image...`);
      let imageBuffer: Buffer;
      if (generatedImageUrl.startsWith('data:')) {
        const base64Data = generatedImageUrl.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        const imageRes = await fetch(generatedImageUrl);
        if (!imageRes.ok) throw new Error("Failed to fetch generated image from provider");
        imageBuffer = Buffer.from(await imageRes.arrayBuffer());
      }

      // Detect Magic Bytes
      const magic = imageBuffer.subarray(0, 4).toString('hex').toUpperCase();
      let ext = 'png';
      if (magic === '89504E47') {
        ext = 'png';
      } else if (magic.startsWith('FFD8FF')) {
        ext = 'jpg';
      }
      console.log(`   - Detected format: ${ext} (Magic: ${magic})`);
      console.log(`   - Buffer size: ${imageBuffer.length} bytes`);

      // Save to tmp file
      const tmpDir = './tmp';
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
      const originalPath = `${tmpDir}/original.${ext}`;
      fs.writeFileSync(originalPath, imageBuffer);

      // 4. Background Removal
      console.log(`✂️ Removing background using @imgly/background-removal-node...`);
      // Use absolute file:// URL to pass to @imgly
      const absolutePath = `file://${process.cwd()}/${originalPath}`;
      const blob = await removeBackground(absolutePath);
      const rembgArrayBuffer = await blob.arrayBuffer();
      const rembgBuffer = Buffer.from(rembgArrayBuffer);
      
      const removedPath = `${tmpDir}/removed.png`;
      fs.writeFileSync(removedPath, rembgBuffer);
      console.log(`✅ Background removed. Saved temp: ${removedPath}`);

      // 5. Alpha & White Background Check via sharp
      console.log(`🔍 Verifying transparency with sharp...`);
      const stats = await sharp(rembgBuffer).stats();
      const metadata = await sharp(rembgBuffer).metadata();
      
      let hasAlpha = metadata.hasAlpha || false;
      let alphaMean = stats.channels.length > 3 ? stats.channels[3].mean : 255;
      const isSolidOpaque = !hasAlpha || alphaMean === 255;

      console.log(`   - hasAlpha: ${hasAlpha}`);
      console.log(`   - alphaMean: ${alphaMean}`);
      console.log(`   - isSolidOpaque: ${isSolidOpaque}`);

      if (isSolidOpaque) {
         throw new Error("Transparency verification failed: Result is solid opaque or lacks alpha channel.");
      }

      // 6. Upload to Supabase Storage
      const titleSlug = (job.metadata?.categoryDomination?.seoSlug || job.keyword)
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const category = job.category || 'uncategorized';
      const timestamp = Date.now();
      const storageKey = `real/${category}/${timestamp}-${titleSlug}.png`;
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "sukashi-assets";

      console.log(`☁️ Uploading to Storage: ${bucketName}/${storageKey}`);
      const { data: uploadData, error: uploadError } = await adminClient
        .storage
        .from(bucketName)
        .upload(storageKey, rembgBuffer, {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = adminClient.storage.from(bucketName).getPublicUrl(storageKey);
      const finalImageUrl = publicUrlData.publicUrl;
      console.log(`✅ Uploaded. Public URL: ${finalImageUrl}`);

      // 7. Run Vision QA
      console.log(`👁️ Running Vision QA...`);
      const qaResult = await runVisionQA(finalImageUrl);
      
      console.log(`   - Recommended Action: ${qaResult.qaRecommendedAction}`);
      console.log(`   - Vision Score: ${qaResult.visionScore}`);
      console.log(`   - Reasons: ${qaResult.qaReasons.join(', ')}`);

      let finalStatus = 'completed';
      let errorMsg = null;

      if (qaResult.qaRecommendedAction === 'reject') {
        finalStatus = 'qa_failed';
        errorMsg = qaResult.qaReasons.join(', ');
        console.log(`⚠️ QA Rejected. Skipping asset insertion.`);
      } else {
        // 8. Save to assets as pending (for both 'approve' and 'pending' qa results)
        console.log(`💾 Saving to assets table with review_status=pending...`);
        const { error: insertError } = await adminClient
          .from('assets')
          .insert({
            title: job.metadata?.categoryDomination?.seoSlug || job.keyword,
            slug: titleSlug,
            storage_key: storageKey,
            category: job.category || 'uncategorized_demand',
            tags: [job.keyword, "transparent png", "isolated", ...(job.metadata?.categoryDomination?.tags || [])],
            image_url: finalImageUrl,
            review_status: 'pending',
            vision_score: qaResult.visionScore,
            commercial_score: qaResult.commercialScore,
            seo_score: qaResult.seoScore,
            transparency_score: qaResult.transparencyScore,
            ai_artifact_score: qaResult.aiArtifactScore,
            pinterest_score: qaResult.pinterestScore,
            adobe_stock_score: qaResult.adobeStockScore,
            quality_rank: 
              (qaResult.visionScore >= 90 && qaResult.aiArtifactScore <= 10) ? 'S' :
              (qaResult.visionScore >= 80 && qaResult.aiArtifactScore <= 20) ? 'A' :
              (qaResult.visionScore >= 70 && qaResult.aiArtifactScore <= 30) ? 'B' :
              (qaResult.visionScore >= 50) ? 'C' : 'D',
            qa_recommended_action: qaResult.qaRecommendedAction,
            qa_reasons: qaResult.qaReasons,
            qa_checked_at: new Date().toISOString(),
            qa_result: qaResult,
            is_ai_generated: true,
            categoryDomination: job.metadata?.categoryDomination || undefined,
          });

        if (insertError) {
          throw new Error(`Failed to insert asset: ${insertError.message}`);
        }
      }

      // 9. Update Job
      console.log(`📝 Updating job status to ${finalStatus}`);
      await adminClient.from('generation_jobs').update({
        status: finalStatus as any,
        image_url: finalImageUrl,
        qa_score: qaResult.visionScore,
        error_message: errorMsg
      }).eq('id', job.id);

      console.log(`🎉 Job ${job.id} completed successfully.`);

    } catch (err: any) {
      console.error(`❌ Job ${job.id} failed:`, err.message);
      await adminClient.from('generation_jobs').update({ 
        status: 'failed', 
        error_message: err.message,
        retry_count: job.retry_count + 1
      }).eq('id', job.id);
    }
  }

  console.log(`\n✨ Worker process finished.`);
}

main().catch(console.error);
