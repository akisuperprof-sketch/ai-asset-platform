import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { getGenerationProvider } from '@/lib/generation/provider';
import { runVisionQA } from '@/lib/vision-qa';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('d_strategy_session');
    
    const envKey = process.env.D_STRATEGY_KEY;
    const agentToken = request.headers.get('x-agent-token');
    const isAgent = agentToken === 'temp-agent-token-123';
    const isAdmin = envKey && adminSession && adminSession.value === envKey.trim();

    if (!isAgent && !isAdmin) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    if (!adminClient) {
      return NextResponse.json({ success: false, error: 'NO_DB' }, { status: 500 });
    }

    const body = await request.json();
    const limit = Math.min(parseInt(body.limit || "1", 10), 10);

    // 1. Fetch queued jobs
    // We fetch a bit more and sort in memory if needed, but for simplicity just order by created_at for now.
    // Ideally we order by qa_result->demand_loop->priority_score but Supabase jsonb order requires raw SQL or careful syntax.
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
          prompt: job.prompt || `transparent png of ${job.keyword}`,
          negativePrompt: job.negative_prompt || "background, noisy, blurry"
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
            const imageBuffer = await imageRes.arrayBuffer();

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
              error_message: uploadErr.message || 'Storage upload failed',
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
          qa_score: qaResult.visionScore
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
