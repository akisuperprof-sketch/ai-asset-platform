import { verifyCronRequest } from '@/lib/server/cron-auth';
import { NextResponse } from 'next/server';

export const maxDuration = 60; // 1 minute max for Pro, 10s for Hobby
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authResult = verifyCronRequest(request);
  if (!authResult.ok) return authResult.response;

  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Fire & Forget background tasks to avoid hitting serverless timeout
    // In a real robust system, use Upstash QStash or Vercel Queue
    const trigger = (path: string) => {
      fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: { 'x-agent-token': process.env.ADMIN_API_SECRET || '' }
      }).catch(err => console.error(`Failed to trigger ${path}:`, err));
    };

    // 1. Hunt Trends
    trigger('/api/admin/growth/trend-hunter/run');

    // 2. Plan Tomorrow
    trigger('/api/admin/growth/planner/run');

    // 3. SEO Optimizer
    trigger('/api/admin/growth/seo-optimizer/run');

    // 4. Pinterest Draft Engine
    trigger('/api/admin/growth/pinterest-engine/run');

    // 5. The actual generation factory is already handled by /api/cron/auto-factory
    // We can also trigger it here just in case:
    trigger('/api/cron/auto-factory');

    return NextResponse.json({
      success: true,
      message: 'Growth Engine cycle initiated'
    });

  } catch (error: any) {
    console.error('Growth Engine Orchestrator Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
