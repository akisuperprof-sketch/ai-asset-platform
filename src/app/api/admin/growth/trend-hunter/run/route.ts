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
    const isValidToken = adminToken === process.env.AGENT_SECRET_TOKEN || adminToken === process.env.ADMIN_API_SECRET || '';
    if (!isValidToken && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // AI Growth Engine: Identify Trends using Gemini
    // We simulate fetching from Google Trends, X, Reddit by asking Gemini about current/upcoming events and seasonal trends
    const monthName = new Date().toLocaleString('default', { month: 'long' });
    const prompt = `You are a Trend Analysis AI for a free stock asset platform. 
Current month is ${monthName}. 
Generate a list of 10 trending search terms or topics for free PNG assets (e.g. seasonal events, upcoming holidays, trending internet culture, popular concepts).
Output strictly in JSON array format:
[
  { "keyword": "halloween pumpkin", "category": "events", "demand_score": 85, "source": "calendar_events" }
]
No markdown, just raw JSON array.`;

    // Using gemini-2.5-flash as the fallback 2.0 version is offline
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8 }
      })
    });

    if (!res.ok) {
      throw new Error('Failed to generate trends from AI');
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const trends: Array<{keyword: string, category: string, demand_score: number, source: string}> = JSON.parse(cleanText);

    const insertedTrends = [];

    for (const t of trends) {
      const { error } = await adminClient.from('trend_hunts').insert({
        source: t.source,
        keyword: t.keyword,
        category: t.category,
        demand_score: t.demand_score,
        is_processed: false
      });
      if (!error) {
        insertedTrends.push(t.keyword);
      }
    }

    await adminClient.from('factory_logs').insert({
      task: 'trend_hunter',
      status: 'success',
      details: { found_trends: insertedTrends.length, items: insertedTrends }
    });

    return NextResponse.json({
      success: true,
      message: `Trend Hunter found ${insertedTrends.length} new trends.`,
      trends: insertedTrends
    });

  } catch (error: any) {
    console.error('Trend Hunter Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
