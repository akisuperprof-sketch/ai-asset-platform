import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.vercel' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const assetId = "9163f1a1-8762-4983-9c75-f29a4ccd1ee4";
  
  // 1. Update asset review_status to 'rejected'
  const { error: err1 } = await supabase
    .from('assets')
    .update({ review_status: 'rejected' })
    .eq('id', assetId);
    
  if (err1) console.error("Asset update error:", err1);
  else console.log("Asset updated to rejected");

  // 2. Update generation_job status to 'qa_failed'
  const { error: err2 } = await supabase
    .from('generation_jobs')
    .update({ status: 'qa_failed', error_message: 'White background bypass rejected' })
    .eq('id', assetId);
    
  if (err2) console.error("Job update error:", err2);
  else console.log("Job updated to qa_failed");
}
main();
