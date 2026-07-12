import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
require('@next/env').loadEnvConfig(process.cwd());

// Prevent leakage of keys
function isSet(val: string | undefined): string {
  return val && val.trim() !== '' ? 'SET' : 'NOT_SET';
}

async function runQa() {
  console.log('=====================================');
  console.log('GS-03 QA Audit Script');
  console.log('=====================================');

  // TASK 1: ENV VARS
  console.log('\n[TASK 1: Environment Variables]');
  console.log('GOOGLE_CLIENT_EMAIL:', isSet(process.env.GOOGLE_CLIENT_EMAIL));
  console.log('GOOGLE_PRIVATE_KEY:', isSet(process.env.GOOGLE_PRIVATE_KEY));
  console.log('GOOGLE_PROJECT_ID:', isSet(process.env.GOOGLE_PROJECT_ID));
  console.log('GOOGLE_SITE_URL:', isSet(process.env.GOOGLE_SITE_URL));

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const siteUrl = process.env.GOOGLE_SITE_URL || 'sc-domain:assetninja.jp';

  if (!clientEmail || !privateKey) {
    console.error('❌ Credentials missing. Aborting QA.');
    return;
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/webmasters.readonly',
        'https://www.googleapis.com/auth/webmasters'
      ]
    });

    const webmasters = google.webmasters('v3');
    const searchconsole = google.searchconsole('v1');

    // TASK 3: sites.list
    console.log('\n[TASK 3: sites.list]');
    const sitesRes = await webmasters.sites.list({ auth });
    const siteEntries = sitesRes.data.siteEntry || [];
    console.log('HTTP Status:', sitesRes.status);
    console.log('Available Properties:');
    let matchedSite = false;
    let actualPropertyUrl = '';

    for (const site of siteEntries) {
      console.log(` - URL: ${site.siteUrl}, Permission: ${site.permissionLevel}`);
      if (site.siteUrl === siteUrl || site.siteUrl === `sc-domain:${siteUrl.replace('sc-domain:', '')}`) {
        matchedSite = true;
        actualPropertyUrl = site.siteUrl;
      }
    }

    console.log(`GOOGLE_SITE_URL Match: ${matchedSite ? 'YES' : 'NO'}`);
    
    if (!matchedSite && siteEntries.length > 0) {
      actualPropertyUrl = siteEntries[0].siteUrl || '';
      console.log(`Using fallback property for tests: ${actualPropertyUrl}`);
    }

    if (!actualPropertyUrl) {
      console.error('❌ No property available. Aborting further GSC checks.');
      return;
    }

    // TASK 4: Search Analytics
    console.log('\n[TASK 4: Search Analytics (Last 7 Days)]');
    
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const endDate = today.toISOString().split('T')[0];
    const startDate = sevenDaysAgo.toISOString().split('T')[0];

    const analyticsRes = await webmasters.searchanalytics.query({
      siteUrl: actualPropertyUrl,
      auth,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query']
      }
    });

    const rows = analyticsRes.data.rows || [];
    let totalClicks = 0;
    let totalImpressions = 0;
    
    rows.forEach(r => {
      totalClicks += (r.clicks || 0);
      totalImpressions += (r.impressions || 0);
    });

    console.log('Total Clicks:', totalClicks);
    console.log('Total Impressions:', totalImpressions);
    console.log('Data Rows (Top Queries count):', rows.length);
    if (rows.length > 0) {
      console.log('Top Query Example:', rows[0].keys ? rows[0].keys[0] : 'N/A', `(Clicks: ${rows[0].clicks})`);
    } else {
      console.log('Real data returned 0 rows. (Valid state if new site)');
    }

    // TASK 5: Sitemap API
    console.log('\n[TASK 5: Sitemap API Check]');
    try {
      const sitemapRes = await webmasters.sitemaps.list({
        siteUrl: actualPropertyUrl,
        auth
      });
      const sitemaps = sitemapRes.data.sitemap || [];
      console.log(`Found ${sitemaps.length} sitemaps.`);
      for (const sm of sitemaps) {
        console.log(` - Path: ${sm.path}, isPending: ${sm.isPending}, warnings: ${sm.warnings}, errors: ${sm.errors}, lastDownloaded: ${sm.lastDownloaded}`);
      }
    } catch (e: any) {
      console.log('Sitemap API Error:', e.message);
    }

    // TASK 6: URL Inspection
    console.log('\n[TASK 6: URL Inspection]');
    const testUrls = [
      'https://assetninja.jp/',
      'https://assetninja.jp/new',
      'https://assetninja.jp/popular',
      'https://assetninja.jp/category/food',
      'https://assetninja.jp/items/food-gyudon-beef-bowl-001'
    ];

    for (const url of testUrls) {
      try {
        const inspectRes = await searchconsole.urlInspection.index.inspect({
          auth,
          requestBody: {
            inspectionUrl: url,
            siteUrl: actualPropertyUrl,
            languageCode: 'ja-JP'
          }
        });
        const ir = inspectRes.data.inspectionResult?.indexStatusResult;
        console.log(`[URL] ${url}`);
        console.log(`  Verdict: ${ir?.verdict}`);
        console.log(`  Coverage: ${ir?.coverageState}`);
        console.log(`  IndexingState: ${ir?.indexingState}`);
        console.log(`  LastCrawl: ${ir?.lastCrawlTime}`);
      } catch(e:any) {
        console.log(`[URL] ${url} - Error: ${e.message}`);
      }
    }

    console.log('\n=====================================');
    console.log('✅ QA Script Completed');
    console.log('=====================================');

  } catch(error: any) {
    console.error('\n❌ Fatal Error during QA:', error.message);
  }
}

runQa();
