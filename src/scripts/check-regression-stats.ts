
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) as string;
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY) as string;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStats() {
  console.log('📊 統計情報を確認中...');

  const slug = 'onigiri-salted-rice-ball-001';

  // Check asset count
  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .select('id, title, download_count')
    .eq('slug', slug)
    .single();

  if (assetError) {
    console.error('❌ Asset error:', assetError);
  } else {
    console.log(`✅ Asset: ${asset.title}`);
    console.log(`✅ Current download_count: ${asset.download_count}`);
  }

  // Check recent logs
  const { data: logs, error: logsError } = await supabase
    .from('download_logs')
    .select('id, asset_id, downloaded_at')
    .order('downloaded_at', { ascending: false })
    .limit(5);

  if (logsError) {
    console.error('❌ Logs error:', logsError);
  } else {
    console.log('✅ Recent download_logs:');
    logs.forEach((log, i) => {
      console.log(`   ${i + 1}. ID: ${log.id}, Time: ${log.downloaded_at}`);
    });
  }
}

checkStats();
