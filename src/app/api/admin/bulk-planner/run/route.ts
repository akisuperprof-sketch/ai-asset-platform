import { verifyAdminRequest } from '@/lib/server/cron-auth';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const authResult = verifyAdminRequest(request);
  if (!authResult.ok) return authResult.response;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const adminClient = createClient(supabaseUrl, supabaseKey);

  try {
    const authHeader = request.headers.get('x-agent-token');
    const localToken = process.env.ADMIN_API_SECRET;
    
    // In admin routes, either valid admin session or valid service token is required
    // For simplicity of auto-factory, we accept the token
    if (authHeader !== localToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      // Depending on how auth is handled in other admin APIs, we'll keep it permissive with token for now.
    }

    const { theme } = await request.json();
    if (!theme) {
      return NextResponse.json({ success: false, error: 'theme is required' }, { status: 400 });
    }

    // Call Gemini API to expand the theme into 20-50 variations
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const prompt = `You are a PNG asset generation planner. Expand the theme "${theme}" into a list of 20 to 50 specific variations suitable for transparent PNG assets. 
Return ONLY a JSON array of strings. Each string should be a search query, ending with "png".
Example: ["dog png", "cute dog png", "dog sitting png", "dog running png", "dog silhouette png", "dog icon png"]
No markdown formatting, just the raw JSON array.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    if (!res.ok) {
      throw new Error('Failed to fetch from Gemini API');
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    
    // Clean up potential markdown blocks
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let variations: string[] = [];
    try {
      variations = JSON.parse(cleanText);
    } catch (e) {
      console.error('Failed to parse Gemini response:', text);
      return NextResponse.json({ success: false, error: 'Failed to parse variations' }, { status: 500 });
    }

    if (!Array.isArray(variations)) {
      variations = [variations];
    }

    // 1. Fetch Banned Keywords
    const { data: bannedData } = await adminClient.from('banned_keywords').select('keyword');
    const bannedKeywords = (bannedData || []).map(b => b.keyword.toLowerCase());

    // Filter banned
    let validVariations = variations.filter(v => {
      const lower = v.toLowerCase();
      return !bannedKeywords.some(b => lower.includes(b));
    });

    // 2. Fetch existing assets to avoid duplicates
    const { data: existingAssets } = await adminClient.from('assets').select('tags, slug');
    const existingKeywords = new Set<string>();
    existingAssets?.forEach(a => {
      existingKeywords.add(a.slug.replace(/-/g, ' '));
      a.tags?.forEach((t: string) => existingKeywords.add(t.toLowerCase()));
    });

    // 3. Fetch existing queued generation_jobs
    const { data: existingJobs } = await adminClient
      .from('generation_jobs')
      .select('keyword')
      .in('status', ['queued', 'processing', 'completed', 'qa_passed', 'approved']);
      
    existingJobs?.forEach(j => {
      existingKeywords.add(j.keyword.toLowerCase());
    });

    const toInsert = validVariations.filter(v => !existingKeywords.has(v.toLowerCase()));

    if (toInsert.length === 0) {
      return NextResponse.json({ success: true, added: 0, message: 'All variations already exist or were banned.' });
    }

    // Insert into generation_jobs
    const jobsToInsert = toInsert.map(k => ({
      keyword: k,
      status: 'queued',
      provider: process.env.GENERATION_PROVIDER || 'GOOGLE_NANO_BANANA',
      category: 'bulk_factory',
      metadata: {
        source: 'bulk_factory',
        theme: theme,
        variation_type: 'bulk_expansion',
        priority: 'phase9_1000_assets'
      }
    }));

    const { error: insertError } = await adminClient
      .from('generation_jobs')
      .insert(jobsToInsert);

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      added: jobsToInsert.length,
      variations: jobsToInsert.map(j => j.keyword)
    });

  } catch (error: any) {
    console.error('Bulk Planner Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
