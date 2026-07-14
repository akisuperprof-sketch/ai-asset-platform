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

    const todayDateStr = new Date().toISOString().split('T')[0];

    // Mocking Revenue metrics (In a real system, aggregate from 'revenue_events')
    const adMetrics = {
      impressions: 12500,
      clicks: 450,
      dl_rate: 15.2,
      revenue_usd: 12.50
    };

    // Have AI analyze the revenue metrics and suggest Ad placements
    const prompt = `You are a Revenue AI Analyst.
Today's metrics: ${JSON.stringify(adMetrics)}
Propose changes to maximize revenue. Suggest if "AdMax" or "PopAds" is better suited based on the high DL rate.
Output strictly in JSON format:
{
  "proposals": [
    "Move AdMax banner above the fold.",
    "Enable PopAds for downloading users since DL rate is > 10%."
  ]
}
No markdown, just raw JSON.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    let aiProposals = [];
    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanText);
      if (parsed.proposals) {
        aiProposals = parsed.proposals;
      }
    }

    await adminClient.from('revenue_analysis').insert({
      date: todayDateStr,
      ad_metrics: adMetrics,
      ai_proposals: aiProposals
    });

    await adminClient.from('factory_logs').insert({
      task: 'revenue_ai',
      status: 'success',
      details: { proposals_count: aiProposals.length }
    });

    return NextResponse.json({
      success: true,
      message: 'Revenue AI analysis completed.'
    });

  } catch (error: any) {
    console.error('Revenue AI Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
