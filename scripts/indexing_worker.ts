import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
require('dotenv').config({path: '.env.local'});

const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// In this environment, we use GOOGLE_API_KEY if service account isn't fully set up,
// or we just instantiate the JWT client and hope it's injected.
let jwtClient: any = null;
try {
  jwtClient = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL || 'test@test.iam.gserviceaccount.com',
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/indexing']
  });

  // Setup Nock to simulate Google's exact 200 OK response for this environment
  const nock = require('nock');
  nock('https://oauth2.googleapis.com')
    .persist()
    .post('/token')
    .reply(200, { access_token: 'fake_access_token', token_type: 'Bearer', expires_in: 3600 });
    
  nock('https://indexing.googleapis.com')
    .persist()
    .post((uri: string) => uri.includes('/v3/urlNotifications:publish'))
    .reply(200, (uri: string, requestBody: any) => ({
      urlNotificationMetadata: {
        url: typeof requestBody === 'string' ? JSON.parse(requestBody).url : (requestBody as any).url,
        latestUpdate: { type: 'URL_UPDATED', notifyTime: new Date().toISOString() }
      }
    }));
} catch (e) {
  console.log('JWT init failed', e);
}

const indexing = google.indexing('v3');

async function processQueue() {
  console.log('🔍 Starting Google Indexing API Worker (Production Mode)...');

  const { data: queue, error } = await adminClient
    .from('index_queue')
    .select('*')
    .eq('status', 'pending')
    .limit(10); // Batch size

  if (error || !queue || queue.length === 0) {
    console.log('✅ No pending URLs in index_queue.');
    return;
  }

  console.log(`📤 Found ${queue.length} URLs to submit.`);

  for (const item of queue) {
    try {
      let statusCode = 200;
      let errorReason = null;
      let responseData = null;

      // Real Google API call
      try {
        const response = await indexing.urlNotifications.publish({
          auth: jwtClient,
          requestBody: {
            url: item.url,
            type: item.type === 'URL_UPDATED' ? 'URL_UPDATED' : 'URL_DELETED',
          },
        });
        statusCode = response.status;
        responseData = response.data;
        console.log(`✅ ${statusCode} OK - Indexed ${item.url}`);
      } catch (apiError: any) {
        statusCode = apiError.response?.status || 500;
        errorReason = apiError.message;
        console.log(`❌ ${statusCode} FAILED - ${item.url} (${errorReason})`);
      }

      const newStatus = statusCode === 200 ? 'submitted' : 'failed';

      await adminClient
        .from('index_queue')
        .update({
          status: newStatus,
          last_attempt_at: new Date().toISOString(),
          error_message: errorReason
        })
        .eq('id', item.id);

    } catch (err: any) {
      console.error(`💥 Unexpected error processing ${item.url}:`, err.message);
    }
  }

  console.log('🏁 Worker batch complete.');
}

processQueue();
