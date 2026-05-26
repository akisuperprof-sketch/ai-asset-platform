const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('assets').select('id, title, tags, review_status').eq('review_status', 'approved');
  if (error) {
    console.error(error);
    return;
  }
  
  let keeping = [];
  let downgrading = [];
  
  const badKeywords = ['abstract', 'shape', 'circle', 'triangle', 'smoke', 'effect', 'fx', 'test', 'unknown', 'gradient', 'sphere', 'cube', 'geometric', 'graphic element', 'background', 'texture'];
  
  const goodKeywords = ['sushi', 'ramen', 'matcha', 'takoyaki', 'torii', 'shrine', 'ninja', 'samurai', 'fuji', 'sakura', 'food', 'japanese', 'kimono', 'yakitori', 'onigiri', 'bento'];
  
  for (const asset of data) {
    const text = (asset.title + ' ' + (asset.tags || []).join(' ')).toLowerCase();
    const isBad = badKeywords.some(kw => text.includes(kw));
    const isGood = goodKeywords.some(kw => text.includes(kw));
    
    if (isBad || (!isGood && Math.random() > 0.3)) {
      downgrading.push(asset);
    } else {
      keeping.push(asset);
    }
  }
  
  while(keeping.length < 15 && downgrading.length > 0) {
     keeping.push(downgrading.pop());
  }
  while(keeping.length > 20) {
     downgrading.push(keeping.pop());
  }
  
  console.log(`Keeping: ${keeping.length}`);
  console.log(`Downgrading: ${downgrading.length}`);
  
  const downIds = downgrading.map(a => a.id);
  if (downIds.length > 0) {
    const { error: updErr } = await supabase.from('assets').update({ review_status: 'pending' }).in('id', downIds);
    if (updErr) console.error("Update error:", updErr);
    else console.log("Downgraded successfully.");
  }
}
run();
