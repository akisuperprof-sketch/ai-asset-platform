import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { adminClient } from '@/lib/supabase';

export async function POST() {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
      throw new Error('Missing Google Credentials. Formal connection required.');
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    });

    const webmasters = google.webmasters('v3');
    const searchconsole = google.searchconsole('v1');
    
    const sitesRes = await webmasters.sites.list({ auth });
    const siteEntries = sitesRes.data.siteEntry || [];
    let resolvedSiteUrl = process.env.GOOGLE_SITE_URL;
    
    if (!resolvedSiteUrl && siteEntries.length > 0) {
      resolvedSiteUrl = siteEntries[0].siteUrl || undefined;
    } else if (resolvedSiteUrl && siteEntries.length > 0) {
      const match = siteEntries.find(s => s.siteUrl === resolvedSiteUrl || s.siteUrl === `sc-domain:${resolvedSiteUrl}`);
      if (match && match.siteUrl) resolvedSiteUrl = match.siteUrl;
    }

    if (!resolvedSiteUrl) {
      throw new Error('No verified property found in Search Console for this Service Account.');
    }

    // Get up to 5 URLs from index_queue that are inspection_pending or sitemap_published
    const { data: queueData, error } = await adminClient!
      .from('index_queue')
      .select('*')
      .in('status', ['inspection_pending', 'sitemap_published', 'sitemap_pending'])
      .order('last_attempt_at', { ascending: true, nullsFirst: true })
      .limit(5);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!queueData || queueData.length === 0) {
      return NextResponse.json({ success: true, message: 'No URLs pending inspection', results: [] });
    }

    const results = [];

    for (const item of queueData) {
      try {
        const response = await searchconsole.urlInspection.index.inspect({
          auth,
          requestBody: {
            inspectionUrl: item.url,
            siteUrl: resolvedSiteUrl,
            languageCode: 'ja-JP'
          }
        });

        const inspectionResult = response.data.inspectionResult;
        const indexStatusResult = inspectionResult?.indexStatusResult;

        // Determine next status
        let nextStatus = 'inspection_checked';
        if (indexStatusResult?.verdict === 'PASS') {
          nextStatus = 'indexed';
        } else if (indexStatusResult?.verdict === 'FAIL' || indexStatusResult?.verdict === 'PARTIAL') {
          nextStatus = 'not_indexed';
        }

        // Save result
        await adminClient!
          .from('index_queue')
          .update({
            status: nextStatus,
            last_attempt_at: new Date().toISOString(),
            error_message: JSON.stringify({
              verdict: indexStatusResult?.verdict,
              coverageState: indexStatusResult?.coverageState,
              indexingState: indexStatusResult?.indexingState,
              robotsTxtState: indexStatusResult?.robotsTxtState,
              pageFetchState: indexStatusResult?.pageFetchState,
              googleCanonical: indexStatusResult?.googleCanonical,
              userCanonical: indexStatusResult?.userCanonical,
              lastCrawlTime: indexStatusResult?.lastCrawlTime,
              sitemap: indexStatusResult?.sitemap
            })
          })
          .eq('id', item.id);

        results.push({
          url: item.url,
          status: nextStatus,
          verdict: indexStatusResult?.verdict,
          coverageState: indexStatusResult?.coverageState
        });

        // Wait to avoid rate limits (Search Console API is very strict)
        await new Promise(r => setTimeout(r, 1000));

      } catch (apiError: any) {
        console.error(`URL Inspection API Error for ${item.url}:`, apiError.message);
        
        await adminClient!
          .from('index_queue')
          .update({
            status: 'error',
            last_attempt_at: new Date().toISOString(),
            error_message: apiError.message
          })
          .eq('id', item.id);

        results.push({
          url: item.url,
          status: 'error',
          error: apiError.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error: any) {
    console.error('URL Inspection Route Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
