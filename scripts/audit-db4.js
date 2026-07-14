const { createClient } = require('@supabase/supabase-js');
const dotenvx = require('@dotenvx/dotenvx');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const envLocal = dotenvx.config({ path: '.env.local' }).parsed || {};
const envProd = dotenvx.config({ path: '.env.production.local' }).parsed || {};
const env = { ...process.env, ...envLocal, ...envProd };

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const s3 = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

async function runAudit() {
  try {
    const { data: sampleJob } = await supabase.from('generation_jobs').select('*').limit(1);
    
    // Check Storage in R2
    let storageCount = 0;
    let isTruncated = true;
    let continuationToken;
    while(isTruncated) {
      const command = new ListObjectsV2Command({
        Bucket: env.R2_BUCKET_NAME,
        ContinuationToken: continuationToken,
      });
      const response = await s3.send(command);
      storageCount += (response.Contents ? response.Contents.length : 0);
      isTruncated = response.IsTruncated;
      continuationToken = response.NextContinuationToken;
    }
    
    // Job stats based on schema
    const keys = sampleJob && sampleJob.length > 0 ? Object.keys(sampleJob[0]) : [];
    
    let qaPassed = 0;
    let qaFailed = 0;
    
    if (keys.includes('qa_status')) {
        const { count: passed } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('qa_status', 'passed');
        const { count: failed } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('qa_status', 'failed');
        qaPassed = passed;
        qaFailed = failed;
    } else {
        const { count: passed } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'completed');
        const { count: failed } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'failed');
        qaPassed = passed;
        qaFailed = failed;
    }
    
    console.log(JSON.stringify({
      schemaKeys: keys,
      storageCount,
      qaPassed,
      qaFailed
    }, null, 2));
  } catch (err) {
    console.error(err);
  }
}
runAudit();
