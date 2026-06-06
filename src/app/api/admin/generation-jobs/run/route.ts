import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';
import { getGenerationProvider } from '@/lib/generation/provider';
import { runVisionQA } from '@/lib/vision-qa';
import { processRembg } from '@/lib/generation/rembg';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const agentToken = request.headers.get('x-agent-token');
    const isAgent = agentToken === 'temp-agent-token-123';

    // We do not require D_STRATEGY_KEY if an agent token is provided.
    // If no agent token, we require D_STRATEGY_KEY cookie.
    let isAuthorized = isAgent;
    if (!isAuthorized) {
      // In Next 13+ App router, cookies() is read-only but can be accessed synchronously or asynchronously depending on Next.js version.
      // We will parse the cookie header from request.
      const cookieHeader = request.headers.get('cookie') || '';
      const cookiesArr = cookieHeader.split(';').map(c => c.trim());
      const dStrategyCookie = cookiesArr.find(c => c.startsWith('D_STRATEGY_KEY='));
      const dStrategyVal = dStrategyCookie ? dStrategyCookie.split('=')[1] : null;

      if (dStrategyVal === process.env.D_STRATEGY_KEY) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    if (!adminClient) {
      return NextResponse.json({ success: false, error: 'NO_DB' }, { status: 500 });
    }

    const body = await request.json();
    const limit = Math.min(parseInt(body.limit || "1", 10), 10);

    // 1. Fetch queued jobs
    const { data: jobs, error: fetchError } = await adminClient
      .from('generation_jobs')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (fetchError || !jobs || jobs.length === 0) {
      return NextResponse.json({ success: true, results: [], message: 'No queued jobs found' });
    }

    const results = [];
    const provider = getGenerationProvider();

    // 2. Mark as processing
    const jobIds = jobs.map(j => j.id);
    await adminClient.from('generation_jobs').update({ status: 'generating' }).in('id', jobIds);

    // 3. Process each job sequentially to avoid rate limits
    for (const job of jobs) {
      try {
        // Double check for duplicate in assets
        const { data: duplicateCheck } = await adminClient
          .from('assets')
          .select('id')
          .ilike('title', `%${job.keyword}%`)
          .limit(1);

        if (duplicateCheck && duplicateCheck.length > 0) {
          await adminClient.from('generation_jobs').update({ status: 'failed', error_message: 'duplicate_skipped' }).eq('id', job.id);
          results.push({ id: job.id, keyword: job.keyword, status: 'duplicate_skipped' });
          continue;
        }

        // Generate image
        const genResult = await provider.generate({
          prompt: job.prompt || `transparent png of ${job.keyword}, isolated on a clean white background, high quality commercial asset`,
          negativePrompt: job.negative_prompt || "noisy, blurry, messy edges"
        });

        if (!genResult.success || !genResult.imageUrls || genResult.imageUrls.length === 0) {
          await adminClient.from('generation_jobs').update({ 
            status: 'failed', 
            error_message: genResult.error || 'Generation failed',
            retry_count: job.retry_count + 1
          }).eq('id', job.id);
          results.push({ id: job.id, keyword: job.keyword, status: 'failed', reason: 'generation_failed' });
          continue;
        }

        let finalImageUrl = genResult.imageUrls[0];
        let storageKey = null;

        // If real provider, download buffer and upload to Supabase Storage
        if (provider.name !== "DRY_RUN") {
          try {
            const imageRes = await fetch(finalImageUrl);
            if (!imageRes.ok) throw new Error("Failed to fetch generated image from provider");
            let imageBuffer = Buffer.from(await imageRes.arrayBuffer());

            // --- Background Removal Pipeline ---
            console.log(`[Job ${job.id}] Running processRembg on downloaded image...`);
            try {
              imageBuffer = await processRembg(imageBuffer);
              console.log(`[Job ${job.id}] processRembg successful.`);
            } catch (rembgErr: any) {
              console.error(`[Job ${job.id}] processRembg failed:`, rembgErr);
              throw new Error(`Background removal failed: ${rembgErr.message}`);
            }

            const titleSlug = (job.metadata?.categoryDomination?.seoSlug || job.keyword)
              .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const category = job.category || 'uncategorized';
            const timestamp = Date.now();
            storageKey = `real/${category}/${timestamp}-${titleSlug}.png`;

            // Note: process.env.SUPABASE_STORAGE_BUCKET is generally used, default 'assets' or 'sukashi-assets'
            const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "sukashi-assets";

            const { data: uploadData, error: uploadError } = await adminClient
              .storage
              .from(bucketName)
              .upload(storageKey, imageBuffer, {
                contentType: 'image/png',
                upsert: false
              });

            if (uploadError) {
              throw new Error(`Storage upload failed: ${uploadError.message}`);
            }

            // Get public URL for vision QA and db storage
            const { data: publicUrlData } = adminClient.storage.from(bucketName).getPublicUrl(storageKey);
            if (publicUrlData && publicUrlData.publicUrl) {
              finalImageUrl = publicUrlData.publicUrl;
            }
          } catch (uploadErr: any) {
            await adminClient.from('generation_jobs').update({ 
              status: 'failed', 
              error_message: uploadErr.message || 'Processing/Storage upload failed',
              retry_count: job.retry_count + 1
            }).eq('id', job.id);
            results.push({ id: job.id, keyword: job.keyword, status: 'failed', reason: 'storage_upload_failed' });
            continue;
          }
        } else {
          // DRY_RUN fallback
          const titleSlug = (job.metadata?.categoryDomination?.seoSlug || job.keyword)
            .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          storageKey = 'mock/' + titleSlug + '.png';
        }

        // QA pipeline (alpha check, white bg check, fake transparency)
        // runVisionQA handles some of this.
        const qaResult = await runVisionQA(finalImageUrl);

        let finalStatus = 'qa_passed';
        let errorMsg = null;
        let newAssetId = null;
        let insertErrorMsg = null;

        if (qaResult.qaRecommendedAction === 'reject' || qaResult.qaRecommendedAction === 'pending') {
          finalStatus = 'qa_failed';
          errorMsg = qaResult.qaReasons.join(', ');
        } else {
          // QA Passed -> Insert into assets table as pending
          const title = job.metadata?.categoryDomination?.seoSlug || job.keyword;
          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const { data: insertedAsset, error: insertError } = await adminClient
            .from('assets')
            .insert({
              title: title,
              slug: slug,
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
              qa_recommended_action: qaResult.qaRecommendedAction,
              qa_reasons: qaResult.qaReasons,
              qa_checked_at: new Date().toISOString(),
              qa_result: qaResult,
              is_ai_generated: true,
              categoryDomination: job.metadata?.categoryDomination || undefined,
            })
            .select('id')
            .single();

          if (insertError) {
            finalStatus = 'failed';
            errorMsg = `Failed to insert asset: ${insertError.message}`;
            insertErrorMsg = insertError.message;
          } else if (insertedAsset) {
            newAssetId = insertedAsset.id;
          }
        }

        // Update Job
        const { error: finalUpdateError } = await adminClient.from('generation_jobs').update({
          status: finalStatus as any,
          image_url: finalImageUrl,
          qa_score: qaResult.visionScore,
          error_message: errorMsg
        }).eq('id', job.id);

        results.push({ id: job.id, keyword: job.keyword, status: finalStatus, imageUrl: finalImageUrl, finalUpdateError, insertErrorMsg });
      } catch (err: any) {
        // General Failure for this job
        await adminClient.from('generation_jobs').update({ 
          status: 'failed', 
          error_message: err.message || 'Unknown error',
          retry_count: job.retry_count + 1
        }).eq('id', job.id);
        results.push({ id: job.id, keyword: job.keyword, status: 'failed', reason: err.message });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("Worker API Error:", err);
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
