import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('d_strategy_session');
    
    const envKey = process.env.D_STRATEGY_KEY;
    if (!envKey || !adminSession || adminSession.value !== envKey.trim()) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    let rawEvents: any[] = [];
    
    if (adminClient) {
      const { data, error } = await adminClient
        .from('demand_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000);
      if (!error && data) {
        rawEvents = data;
      }
    }

    // Include fallback local events
    try {
      const fallbackPath = path.join(process.cwd(), 'data', 'demand-events-fallback.jsonl');
      if (fs.existsSync(fallbackPath)) {
        const lines = fs.readFileSync(fallbackPath, 'utf8').split('\n').filter(Boolean);
        const fallbackEvents = lines.map(l => JSON.parse(l));
        rawEvents = [...rawEvents, ...fallbackEvents];
      }
    } catch (e) {}

    // Compute Stats
    const metricsMap = new Map<string, any>();
    
    for (const ev of rawEvents) {
      if (!ev.normalized_query && !ev.category) continue;
      const key = ev.normalized_query || ev.category;
      
      if (!metricsMap.has(key)) {
        metricsMap.set(key, {
          keyword: key,
          searchCount: 0,
          zeroResultCount: 0,
          clickCount: 0,
          downloadCount: 0,
          detailViewCount: 0,
          dwellTimeTotal: 0,
          dwellTimeEntries: 0
        });
      }
      
      const m = metricsMap.get(key);
      if (ev.event_type === 'search') m.searchCount++;
      if (ev.event_type === 'zero_result') m.zeroResultCount++;
      if (ev.event_type === 'asset_click') m.clickCount++;
      if (ev.event_type === 'download') m.downloadCount++;
      if (ev.event_type === 'detail_view') m.detailViewCount++;
      if (ev.event_type === 'dwell_time' && ev.metadata?.duration) {
        m.dwellTimeTotal += ev.metadata.duration;
        m.dwellTimeEntries++;
      }
    }

    // Transform to array and calculate Priority Score
    const metrics = Array.from(metricsMap.values()).map(m => {
      // Estimated CTR & DL Rate
      const estimatedCtr = m.searchCount > 0 ? (m.clickCount / m.searchCount) : (m.zeroResultCount > 0 ? 0.05 : 0);
      const estimatedDlRate = m.clickCount > 0 ? (m.downloadCount / m.clickCount) : 0;
      const avgDwellTime = m.dwellTimeEntries > 0 ? (m.dwellTimeTotal / m.dwellTimeEntries) : 0;

      // Priority Formula: 
      // (SearchCount * 2) + (ZeroResultCount * 5) + (CTR * 10) + (DLRate * 20)
      let priorityScore = (m.searchCount * 2) 
                        + (m.zeroResultCount * 5) 
                        + (estimatedCtr * 100) 
                        + (estimatedDlRate * 200)
                        + (avgDwellTime / 10);
      
      // If we don't have enough events yet (mock mode), boost zero results heavily
      if (m.zeroResultCount > 0 && m.searchCount === 0) {
        priorityScore += 50; 
      }

      const revenueEst = m.downloadCount * 15; // mock ¥15 per DL

      return {
        ...m,
        estimatedCtr: Math.round(estimatedCtr * 100),
        estimatedDlRate: Math.round(estimatedDlRate * 100),
        avgDwellTime: Math.round(avgDwellTime),
        priorityScore: Math.round(priorityScore),
        estimatedRevenue: revenueEst
      };
    });

    metrics.sort((a, b) => b.priorityScore - a.priorityScore);

    return NextResponse.json({ success: true, data: metrics });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
