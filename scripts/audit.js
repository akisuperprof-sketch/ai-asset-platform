const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log("Starting Audit...");
  
  // 1. Check counts by review_status
  const { data: approved, error: err1 } = await supabase.from('assets').select('id', { count: 'exact', head: true }).eq('review_status', 'approved');
  const { data: pending, error: err2 } = await supabase.from('assets').select('id', { count: 'exact', head: true }).eq('review_status', 'pending');
  const { data: rejected, error: err3 } = await supabase.from('assets').select('id', { count: 'exact', head: true }).eq('review_status', 'rejected');
  
  console.log(`Approved: ${approved?.length || 0}`);
  
  // Actually count properly
  const countApproved = await supabase.from('assets').select('id', { count: 'exact', head: true }).eq('review_status', 'approved');
  const countPending = await supabase.from('assets').select('id', { count: 'exact', head: true }).eq('review_status', 'pending');
  const countRejected = await supabase.from('assets').select('id', { count: 'exact', head: true }).eq('review_status', 'rejected');
  
  console.log(`Supabase Counts -> Approved: ${countApproved.count}, Pending: ${countPending.count}, Rejected: ${countRejected.count}`);
  
  // 2. Fetch all approved to check image urls
  const { data: allApproved } = await supabase.from('assets').select('id, title, image_url, storage_key, category, tags').eq('review_status', 'approved');
  console.log(`Fetched ${allApproved.length} approved assets for integrity check.`);
  
  // Check duplicate IDs/slugs (here slug is ID usually, or title)
  const ids = new Set();
  let duplicates = 0;
  for (const a of allApproved) {
    if (ids.has(a.id)) duplicates++;
    ids.add(a.id);
  }
  console.log(`Duplicate IDs: ${duplicates}`);
  
  // Check URLs
  let brokenImages = 0;
  for (const a of allApproved) {
    let url = a.image_url;
    if (!url && a.storage_key) {
       url = `${supabaseUrl}/storage/v1/object/public/sukashi-assets/${a.storage_key}`;
    }
    if (!url) {
      brokenImages++;
    }
  }
  console.log(`Missing Image URLs/Keys: ${brokenImages}`);
  
  // 3. Categories and Tags distribution
  const catCount = {};
  const tagCount = {};
  allApproved.forEach(a => {
    catCount[a.category] = (catCount[a.category] || 0) + 1;
    (a.tags || []).forEach(t => {
      tagCount[t] = (tagCount[t] || 0) + 1;
    });
  });
  console.log("Categories:", Object.keys(catCount).length);
  console.log("Tags:", Object.keys(tagCount).length);
  
}
runAudit().catch(console.error);
