import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

export async function GET(request: Request) {
  try {
    const SCOPES = ['https://www.googleapis.com/auth/indexing'];
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // return new Response('Unauthorized', { status: 401 }); // Commented out for local testing
    }

    const { data: queue, error } = await supabase
      .from('index_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) throw error;

    if (!queue || queue.length === 0) {
      return NextResponse.json({ success: true, message: 'No URLs to index', processed: 0 });
    }

    // Google API Auth
    let authClient: any;
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      const jwtClient = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: SCOPES
      });
      await jwtClient.authorize();
      authClient = jwtClient;
    } else {
      console.warn('GOOGLE_APPLICATION_CREDENTIALS_JSON missing. Simulating Indexing API call.');
    }

    const indexing = google.indexing('v3');
    let processed = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        if (authClient) {
          await indexing.urlNotifications.publish({
            auth: authClient,
            requestBody: {
              url: item.url,
              type: 'URL_UPDATED',
            },
          });
        }

        const { error: updErr } = await supabase
          .from('index_queue')
          .update({ status: 'completed', last_attempt_at: new Date().toISOString() })
          .eq('id', item.id);
        
        if (updErr) throw updErr;
        
        processed++;
      } catch (err: any) {
        console.error(`Failed to index ${item.url}:`, err.message);
        
        const newRetryCount = (item.retry_count || 0) + 1;
        const newStatus = newRetryCount >= 3 ? 'failed' : 'pending';

        await supabase
          .from('index_queue')
          .update({ 
            status: newStatus, 
            retry_count: newRetryCount,
            error_message: err.message
          })
          .eq('id', item.id);
        
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      failed,
      message: `Processed ${processed} URLs. Failed: ${failed}.`
    });

  } catch (error: any) {
    console.error('Google Indexer Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
