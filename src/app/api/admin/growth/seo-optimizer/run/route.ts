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

    // Fetch assets that might need SEO improvement (e.g. low CTR or missing FAQ)
    // For now, we'll pick 3 assets that lack FAQ or internal links
    const { data: assets, error: fetchErr } = await adminClient
      .from('assets')
      .select('id, title, category, seo_title, seo_description, faq')
      .order('created_at', { ascending: false })
      .limit(3);

    if (fetchErr || !assets) {
      throw new Error(`Failed to fetch assets for SEO optimization: ${fetchErr?.message}`);
    }

    let optimizedCount = 0;

    for (const asset of assets) {
      // If it doesn't have an FAQ or the FAQ is empty, let's generate it
      if (!asset.faq || (Array.isArray(asset.faq) && asset.faq.length === 0)) {
        const prompt = `You are an SEO Optimizer AI. 
Generate a helpful FAQ section for a free transparent PNG asset titled "${asset.title}".
Output strictly in JSON array format:
[
  { "question": "Can I use this PNG for commercial purposes?", "answer": "Yes, it is free for commercial use." },
  { "question": "Is the background truly transparent?", "answer": "Yes, it is a high-quality transparent PNG." }
]
No markdown, just raw JSON array.`;

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
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
          const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          try {
            const faqJson = JSON.parse(cleanText);
            
            // Update the asset
            await adminClient.from('assets').update({
              faq: faqJson
            }).eq('id', asset.id);

            // Log SEO History
            await adminClient.from('seo_history').insert({
              asset_id: asset.id,
              action_taken: 'Added FAQ',
              details: { faq_added: faqJson.length }
            });

            optimizedCount++;
          } catch (parseErr) {
            console.error('Failed to parse FAQ JSON', parseErr);
          }
        }
      }
    }

    await adminClient.from('factory_logs').insert({
      task: 'seo_optimizer',
      status: 'success',
      details: { optimized_count: optimizedCount }
    });

    return NextResponse.json({
      success: true,
      message: `SEO Optimizer processed ${optimizedCount} assets.`
    });

  } catch (error: any) {
    console.error('SEO Optimizer Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
