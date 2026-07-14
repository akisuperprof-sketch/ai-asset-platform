import { verifyAdminRequest } from '@/lib/server/cron-auth';
import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const authResult = verifyAdminRequest(request);
  if (!authResult.ok) return authResult.response;

  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('d_strategy_session');
    
    // Auth check: either standard admin session OR secure agent token
    const envKey = process.env.D_STRATEGY_KEY;
    
    const isAdmin = envKey && adminSession && adminSession.value === envKey.trim();

    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    if (!adminClient) {
      return NextResponse.json({ success: false, error: 'NO_DB' }, { status: 500 });
    }

    // 1. Total count
    const { count: totalCount, error: err1 } = await adminClient
      .from('generation_jobs')
      .select('*', { count: 'exact', head: true });
    
    // 2. Fetch jobs
    const { data: catDomData, error: err2 } = await adminClient
      .from('generation_jobs')
      .select('id, category, status, metadata, keyword');
    
    if (err1 || err2) {
      return NextResponse.json({ success: false, error: 'DB_ERROR', details: { err1, err2 } }, { status: 500 });
    }

    // Check for Category Domination jobs
    const categoryDominationJobs = catDomData?.filter((job: any) => 
      job.metadata && job.metadata.categoryDomination
    ) || [];

    // 3. By Category
    const categoryCount: Record<string, number> = {};
    categoryDominationJobs.forEach(job => {
      categoryCount[job.category] = (categoryCount[job.category] || 0) + 1;
    });

    // 4. By Status
    const statusCount: Record<string, number> = {};
    categoryDominationJobs.forEach(job => {
      statusCount[job.status] = (statusCount[job.status] || 0) + 1;
    });

    // 5. Duplicates
    const keywordCount: Record<string, number> = {};
    let duplicates = 0;
    categoryDominationJobs.forEach(job => {
      if (keywordCount[job.keyword]) {
        duplicates++;
      }
      keywordCount[job.keyword] = (keywordCount[job.keyword] || 0) + 1;
    });

    // 6. Recent samples and failures
    const { data: samples } = await adminClient
      .from('generation_jobs')
      .select('id, category, keyword, metadata')
      .not('metadata->categoryDomination', 'is', null)
      .limit(3);

    const { data: failedSamples, error: failedError } = await adminClient
      .from('generation_jobs')
      .select('id, category, keyword, status')
      .eq('status', 'failed')
      .limit(5)
      .order('updated_at', { ascending: false });

    return NextResponse.json({
      success: true,
      data: {
        totalJobs: totalCount,
        categoryDominationCount: categoryDominationJobs.length,
        categoryCount,
        statusCount,
        duplicates,
        samples: samples?.map(s => ({
          id: s.id,
          category: s.category,
          keyword: s.keyword,
          seoSlug: s.metadata?.categoryDomination?.seoSlug,
          relatedGroupId: s.metadata?.categoryDomination?.relatedGroupId
        })),
        failedSamples,
        failedError,
        popAdsEnabled: process.env.NEXT_PUBLIC_POPADS_ENABLED
      }
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
