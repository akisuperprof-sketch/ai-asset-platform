import { createClient } from '@supabase/supabase-js';
require('dotenv').config({path: '.env.local'});
const { GoogleGenerativeAI } = require('@google/generative-ai');

const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function backfill() {
  console.log('--- Phase E: SEO & Index Backfill ---');
  const { data: jobs } = await adminClient.from('generation_jobs')
    .select('*')
    .eq('metadata->>source', 'operation_zero_50_run')
    .eq('status', 'qa_passed');

  const passedKeywords = jobs?.map(j => j.keyword) || [];
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data: assets } = await adminClient.from('assets')
    .select('id, title, category, image_url')
    .in('title', passedKeywords)
    .gt('created_at', twoHoursAgo);

  if (!assets) return;
  console.log(`Found ${assets.length} assets to backfill.`);

  for (const asset of assets) {
    console.log(`Processing: ${asset.title}`);
    try {
      const prompt = `Generate SEO metadata for a high-quality transparent PNG asset of "${asset.title}". Category: ${asset.category}.
Return ONLY valid JSON with no markdown formatting:
{
  "seo_title": "...", 
  "seo_description": "...", 
  "alt_text": "...", 
  "pinterest_description": "..."
}`;
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      });
      const responseText = result.response.text();
      const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const seoData = JSON.parse(cleanJson);

      await adminClient.from('assets').update({
        seo_title: seoData.seo_title,
        seo_description: seoData.seo_description,
        alt_text: seoData.alt_text,
        pinterest_description: seoData.pinterest_description,
        asset_value_score: 95
      }).eq('id', asset.id);

      // Add to index_queue
      await adminClient.from('index_queue').insert({
        url: `https://assetninja.jp/items/${asset.id}`,
        status: 'pending',
        type: 'URL_UPDATED'
      });

      // Add to pinterest_posts
      await adminClient.from('pinterest_posts').insert({
        asset_id: asset.id,
        title: seoData.seo_title,
        description: seoData.pinterest_description,
        board_name: asset.category,
        pin_url: asset.image_url,
        status: 'draft'
      });
      
      console.log(`  -> Success`);
    } catch (err: any) {
      console.log(`  -> Failed: ${err.message}`);
    }
    // wait slightly to avoid rate limit
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('Backfill complete!');
}

backfill();
