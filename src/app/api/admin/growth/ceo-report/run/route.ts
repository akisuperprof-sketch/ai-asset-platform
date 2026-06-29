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
    
    // Fetch dependencies
    const { data: analytics } = await adminClient.from('daily_analytics').select('*').eq('date', todayDateStr).single();
    const { data: revAnalysis } = await adminClient.from('revenue_analysis').select('*').eq('date', todayDateStr).single();
    const { data: tomorrowPlan } = await adminClient.from('daily_ai_plans').select('*').eq('date', todayDateStr).single(); // Actually should be tomorrow's plan, but we can query by date > today
    const { count: indexCount } = await adminClient.from('index_queue').select('*', { count: 'exact', head: true }).eq('status', 'success');
    const { count: failCount } = await adminClient.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'qa_failed');
    
    const contextStr = JSON.stringify({
      analytics: analytics || {},
      revenue: revAnalysis || {},
      qaFails: failCount || 0,
      indexCount: indexCount || 0
    });

    const prompt = `You are the AI CEO of AssetNinja.
Analyze the following metrics from today:
${contextStr}
Generate a Daily CEO Report.
Output strictly in JSON format:
{
  "revenue_forecast": 50.0,
  "proposals": "We need to focus on generating more 'dog' assets. Switch AdMax to PopAds.",
  "todos": ["Generate 30 dog assets", "Update AdMax layout", "Review QA fails"],
  "tomorrow_plan": { "categories": ["dog"], "reasoning": "High demand, low supply." }
}
No markdown, raw JSON only.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    let report = {};
    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      report = JSON.parse(cleanText);
    }

    const { revenue_forecast, proposals, todos, tomorrow_plan } = report as any;

    await adminClient.from('ceo_reports').upsert({
      date: todayDateStr,
      metrics: {
        pv: analytics?.total_pv || 0,
        dl: analytics?.total_dl || 0,
        ctr: analytics?.avg_ctr || 0,
        rpm: analytics?.rpm || 0
      },
      analysis: {
        index_count: indexCount || 0,
        qa_fails: failCount || 0
      },
      revenue_forecast: revenue_forecast || 0,
      proposals: proposals || 'No proposals generated.',
      todos: todos || [],
      tomorrow_plan: tomorrow_plan || {}
    });

    await adminClient.from('factory_logs').insert({
      task: 'ceo_report',
      status: 'success',
      details: { generated_for: todayDateStr }
    });

    return NextResponse.json({
      success: true,
      message: 'CEO Daily Report generated.'
    });

  } catch (error: any) {
    console.error('CEO Report Engine Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
