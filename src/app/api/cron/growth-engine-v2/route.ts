import { NextResponse } from 'next/server';

export const maxDuration = 60; // 1 minute max for Pro, 10s for Hobby
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Fire & Forget background tasks (Orchestration V2)
    const trigger = (path: string) => {
      fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: { 'x-agent-token': process.env.AGENT_SECRET_TOKEN || 'temp-agent-token-123' }
      }).catch(err => console.error(`Failed to trigger ${path}:`, err));
    };

    // --- PHASE 11: Growth Engine V2 (Self Growing AI Company) ---

    // 1. Demand & Trends
    trigger('/api/admin/growth/trend-hunter/run');

    // 2. Generation & QA & Publish & Sitemap (Auto Factory Core)
    // Note: Demand fetching is part of the factory / bulk planner.
    trigger('/api/cron/auto-factory');
    
    // 3. SEO & Internal Links & Asset Value
    trigger('/api/admin/growth/seo-optimizer/run');
    trigger('/api/admin/growth/internal-link/run');
    trigger('/api/admin/growth/asset-value/run');

    // 4. Indexing & Social
    trigger('/api/admin/growth/index-manager/run');
    trigger('/api/admin/growth/pinterest-engine/run');

    // 5. Revenue & Analytics & Planning
    trigger('/api/admin/growth/revenue-ai/run');
    trigger('/api/admin/growth/planner/run');

    // 6. Final CEO Report
    trigger('/api/admin/growth/ceo-report/run');

    return NextResponse.json({
      success: true,
      message: 'Growth Engine V2 cycle initiated successfully'
    });

  } catch (error: any) {
    console.error('Growth Engine Orchestrator Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
