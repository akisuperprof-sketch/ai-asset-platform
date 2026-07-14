import { verifyAdminRequest } from '@/lib/server/cron-auth';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const authResult = verifyAdminRequest(request);
  if (!authResult.ok) return authResult.response;

  try {
    const adminToken = request.headers.get('x-agent-token');
    const isValidToken = adminToken === process.env.AGENT_SECRET_TOKEN || adminToken === process.env.ADMIN_API_SECRET;
    if (!isValidToken && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const todayDateStr = new Date().toISOString().split('T')[0];

    // 1. Gather Analytics
    // Fetch stats from search_demand_logs or revenue tracking
    // For simplicity, we just aggregate high-level metrics here or fetch from existing `daily_analytics`
    const { count: pvCount } = await adminClient.from('search_demand_logs').select('*', { count: 'exact', head: true });
    
    // Upsert today's analytics
    await adminClient.from('daily_analytics').upsert({
      date: todayDateStr,
      total_pv: pvCount || 0,
      total_dl: 0, // Should query downloads
      revenue: 0 // Should query revenue_events
    });

    // 2. Fetch processed Trend Hunts
    const { data: trends } = await adminClient
      .from('trend_hunts')
      .select('keyword, category')
      .eq('is_processed', false)
      .limit(5);

    // 3. System Context for Auto Scaling (Phase 13-C)
    const { count: qaFailCount } = await adminClient.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'qa_failed');
    const { count: queueCount } = await adminClient.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'queued');
    
    // 4. Tomorrow's Plan (AI)
    const prompt = `You are the Factory AI Planner / CEO Execution Engine (Phase 13-C).
Today's Date: ${todayDateStr}.
System Context:
- Current Queue: ${queueCount || 0} jobs pending
- QA Failures: ${qaFailCount || 0} recent failures
- Recent Trends: ${JSON.stringify(trends)}

TASK: Plan categories and generation strategy for tomorrow.
Determine Auto Scaling \`target_generation_count\`.
Scaling rules: Select from [3, 5, 10, 20, 30, 50, 100, 300, 1000].
If QA failures are high (>20) or Queue is high (>100), scale down to 5 or 10.
If system is healthy, scale up cautiously.

Output strictly in JSON format:
{
  "planned_categories": ["seasonal", "business", "food"],
  "target_generation_count": 30,
  "ai_reasoning": "System is healthy. Scaling up to 30 based on..."
}
No markdown, just raw JSON object.`;

    // Using gemini-2.5-flash as the fallback 2.0 version is offline
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const plan = JSON.parse(cleanText);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      await adminClient.from('daily_ai_plans').upsert({
        date: tomorrowStr,
        planned_categories: plan.planned_categories,
        target_generation_count: plan.target_generation_count,
        ai_reasoning: plan.ai_reasoning,
        is_executed: false
      });

      // Mark trends as processed
      if (trends && trends.length > 0) {
        const trendKeywords = trends.map(t => t.keyword);
        await adminClient.from('trend_hunts')
          .update({ is_processed: true })
          .in('keyword', trendKeywords);
          
        // Push these trends to the Bulk Planner Queue dynamically!
        // In a real flow, Bulk Planner runs based on these
        for(const t of trends) {
          fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/bulk-planner/run`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-agent-token': process.env.ADMIN_API_SECRET
            },
            body: JSON.stringify({ theme: t.keyword, limit: 10 })
          }).catch(console.error);
        }
      }

      await adminClient.from('factory_logs').insert({
        task: 'tomorrow_planner',
        status: 'success',
        details: { plan_created_for: tomorrowStr, plan }
      });

      return NextResponse.json({
        success: true,
        message: 'Daily Analytics and Tomorrow Plan successfully generated.'
      });
    }

    throw new Error('Failed to fetch from Gemini');

  } catch (error: any) {
    console.error('Growth Planner Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
