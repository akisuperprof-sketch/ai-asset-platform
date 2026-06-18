import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';
import { getGenerationProvider } from '@/lib/generation/provider';
import { runVisionQA } from '@/lib/vision-qa';
import { removeBackgroundBiRefNet } from '@/lib/generation/birefnet';

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
    const { data: jobsRaw, error: fetchError } = await adminClient
      .from('generation_jobs')
      .select('*')
      .in('status', ['queued', 'retry_pending'])
      .neq('provider', 'DRY_RUN')
      .neq('provider', 'dry_run')
      .order('created_at', { ascending: true })
      .limit(100); // Fetch up to 100 to sort by priority locally

    if (fetchError || !jobsRaw || jobsRaw.length === 0) {
      return NextResponse.json({ success: true, results: [], message: 'No queued jobs found' });
    }

    // Determine priority
    // S tier = 1
    // A tier = 2
    // Others = 3
    const sTier = ['ramen', 'sushi', 'onigiri', 'tempura', 'yakitori', 'matcha'];
    const aTier = ['daruma', 'torii', 'fuji', 'japanese pattern', 'maneki neko'];
    
    const jobsWithPriority = jobsRaw.map(job => {
      let priority = 3;
      const lowerCat = (job.category || '').toLowerCase();
      const lowerKey = (job.keyword || '').toLowerCase();
      if (sTier.some(t => lowerCat.includes(t) || lowerKey.includes(t))) priority = 1;
      else if (aTier.some(t => lowerCat.includes(t) || lowerKey.includes(t))) priority = 2;
      return { ...job, priority };
    });

    jobsWithPriority.sort((a, b) => a.priority - b.priority || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const jobs = jobsWithPriority.slice(0, limit);

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
          await adminClient.from('generation_jobs').update({ status: 'failed' }).eq('id', job.id);
          results.push({ id: job.id, keyword: job.keyword, status: 'duplicate_skipped' });
          continue;
        }

        // Generate image
        const genResult = await provider.generate({
          prompt: job.prompt || `transparent png of ${job.keyword}, isolated on a clean white background, high quality commercial asset`,
          negativePrompt: job.negative_prompt || "noisy, blurry, messy edges"
        });

        if (!genResult.success || !genResult.imageUrls || genResult.imageUrls.length === 0) {
          const is429 = (genResult.error || "").toLowerCase().includes("429") || (genResult.error || "").toLowerCase().includes("exhausted");
          if (is429) {
            // Revert back to retry_pending
            await adminClient.from('generation_jobs').update({ 
              status: 'retry_pending'
            }).eq('id', job.id);
            return NextResponse.json({ success: false, error: 'RATE_LIMIT_WAIT', results });
          }

          await adminClient.from('generation_jobs').update({ 
            status: 'failed'
          }).eq('id', job.id);
          results.push({ id: job.id, keyword: job.keyword, status: 'failed', reason: 'generation_failed' });
          continue;
        }

        let finalImageUrl = genResult.imageUrls[0];
        let storageKey = null;
        let bgRemoved = false;

        // If real provider, download buffer and upload to Supabase Storage
        if (provider.name !== "DRY_RUN") {
          try {
            const imageRes = await fetch(finalImageUrl);
            if (!imageRes.ok) throw new Error("Failed to fetch generated image from provider");
            let imageBuffer = Buffer.from(await imageRes.arrayBuffer());
            
            // Stage 3: BiRefNet Background Removal
            try {
              const bgResult = await removeBackgroundBiRefNet(imageBuffer);
              imageBuffer = bgResult.buffer as any;
              bgRemoved = true;
            } catch (bgErr: any) {
              console.warn(`[BiRefNet Pipeline] Background removal skipped or failed: ${bgErr.message}`);
              // Fallback to original imageBuffer
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
              status: 'failed'
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

        // QA pipeline
        const isPattern = (job.category || "").toLowerCase().includes("pattern") || (job.keyword || "").toLowerCase().includes("pattern");
        const qaResult = await runVisionQA(finalImageUrl, isPattern);
        qaResult.background_removed = bgRemoved;

        let finalStatus = 'qa_passed';
        let errorMsg = null;
        let newAssetId = null;
        let insertErrorMsg = null;

        // Apply Strict Auto-publish rules
        const isStrictQaPassed = qaResult.commercialScore >= 80 && qaResult.aiArtifactScore <= 20;

        if (qaResult.qaRecommendedAction === 'reject' || !isStrictQaPassed) {
          finalStatus = 'qa_failed';
          errorMsg = qaResult.qaReasons.join(', ') || 'Failed strict QA threshold';
        } else {
          // Strict QA Passed -> Insert into assets table as approved and published
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
              review_status: 'approved',
              legal_status: 'clean',
              published_at: new Date().toISOString(),
              vision_score: qaResult.visionScore,
              commercial_score: qaResult.commercialScore,
              seo_score: qaResult.seoScore,
              transparency_score: qaResult.transparencyScore,
              ai_artifact_score: qaResult.aiArtifactScore,
              qa_recommended_action: 'approve',
              qa_reasons: qaResult.qaReasons,
              qa_checked_at: new Date().toISOString(),
              qa_result: qaResult,
              is_ai_generated: true,
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
        // metadata列にQA結果やエラーメッセージを保存する
        const { error: finalUpdateError } = await adminClient.from('generation_jobs').update({
          status: finalStatus as any,
          image_url: finalImageUrl,
          qa_score: qaResult.visionScore,
          commercial_score: qaResult.commercialScore,
          ai_artifact_score: qaResult.aiArtifactScore,
          metadata: {
            ...job.metadata,
            qa_reasons: errorMsg,
            qa_result: qaResult
          }
        }).eq('id', job.id);

        results.push({ 
          id: job.id, 
          keyword: job.keyword, 
          status: finalStatus, 
          imageUrl: finalImageUrl, 
          finalUpdateError, 
          insertErrorMsg, 
          reason: errorMsg,
          bgRemoved: qaResult.background_removed,
          hasAlpha: qaResult.has_alpha,
          alphaRatio: qaResult.alpha_ratio,
          cutoutScore: qaResult.cutout_quality_score
        });
      } catch (err: any) {
        // General Failure for this job
        const is429 = (err.message || "").toLowerCase().includes("429") || (err.message || "").toLowerCase().includes("exhausted");
        if (is429) {
          await adminClient.from('generation_jobs').update({ 
            status: 'retry_pending'
          }).eq('id', job.id);
          return NextResponse.json({ success: false, error: 'RATE_LIMIT_WAIT', results });
        }

        await adminClient.from('generation_jobs').update({ 
          status: 'failed'
        }).eq('id', job.id);
        results.push({ id: job.id, keyword: job.keyword, status: 'failed', reason: err.message });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("Worker API Error:", err);
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR', message: err.message, stack: err.stack }, { status: 500 });
  }
}

