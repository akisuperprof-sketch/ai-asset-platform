import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const adminToken = request.headers.get('x-agent-token');
    const isValidToken = adminToken === process.env.AGENT_SECRET_TOKEN || adminToken === 'temp-agent-token-123';
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

    // 3. Tomorrow's Plan (AI)
    const prompt = `You are the Factory AI Planner.
Today's Date: ${todayDateStr}.
Based on recent trends: ${JSON.stringify(trends)}
Plan the categories and generation strategy for tomorrow.
Output strictly in JSON format:
{
  "planned_categories": ["seasonal", "business", "food"],
  "target_generation_count": 50,
  "ai_reasoning": "We observed a spike in seasonal trends..."
}
No markdown, just raw JSON object.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
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
              'x-agent-token': process.env.AGENT_SECRET_TOKEN || 'temp-agent-token-123'
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
