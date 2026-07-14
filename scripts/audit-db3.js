const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.production.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function runAudit() {
  try {
    const { data: cols } = await supabase.rpc('get_generation_jobs_columns'); // might not exist
    
    // fetch a job to see fields
    const { data: sampleJob } = await supabase.from('generation_jobs').select('*').limit(1);
    
    // Check Storage in R2
    let storageCount = 0;
    let isTruncated = true;
    let continuationToken;
    while(isTruncated) {
      const command = new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        ContinuationToken: continuationToken,
      });
      const response = await s3.send(command);
      storageCount += (response.Contents ? response.Contents.length : 0);
      isTruncated = response.IsTruncated;
      continuationToken = response.NextContinuationToken;
    }
    
    console.log(JSON.stringify({
      sampleJob: sampleJob && sampleJob.length > 0 ? Object.keys(sampleJob[0]) : [],
      storageCount
    }, null, 2));
  } catch (err) {
    console.error(err);
  }
}
runAudit();
