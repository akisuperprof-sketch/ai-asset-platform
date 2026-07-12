import { createClient } from '@supabase/supabase-js';
require('dotenv').config({path: '.env.local'});

const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  console.log('🔍 Starting Sitemap & Index Queue Audit...');

  // Fetch all approved items
  const { data: approvedItems, error: itemsErr } = await adminClient
    .from('assets')
    .select('id, slug, review_status')
    .eq('review_status', 'approved');

  if (itemsErr) {
    console.error('Error fetching items:', itemsErr);
    return;
  }

  console.log(`Found ${approvedItems.length} approved PNG items.`);

  // Fetch current index_queue
  const { data: queueItems, error: queueErr } = await adminClient
    .from('index_queue')
    .select('url');

  if (queueErr) {
    console.error('Error fetching index_queue:', queueErr);
    return;
  }

  const existingUrls = new Set(queueItems.map(q => q.url));
  const baseUrl = 'https://assetninja.jp/items/';
  let added = 0;

  for (const item of approvedItems) {
    const url = `${baseUrl}${item.slug}`;
    if (!existingUrls.has(url)) {
      // Add to queue
      const { error: insertErr } = await adminClient
        .from('index_queue')
        .insert({
          url: url,
          type: 'URL_UPDATED',
          status: 'sitemap_pending'
        });
      
      if (insertErr) {
        console.error(`Failed to insert ${url}:`, insertErr.message);
      } else {
        console.log(`✅ Added to queue: ${url}`);
        added++;
        existingUrls.add(url);
      }
    }
  }

  console.log(`\n🎉 Audit complete. Added ${added} new URLs to index_queue.`);
}

run();
