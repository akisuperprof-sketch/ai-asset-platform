import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const isSet = (val: string | undefined) => val && val.trim() !== '' ? 'SET' : 'NOT_SET';

    // TASK 1: ENV VARS
    const envStatus = {
      GOOGLE_CLIENT_EMAIL: isSet(process.env.GOOGLE_CLIENT_EMAIL),
      GOOGLE_PRIVATE_KEY: isSet(process.env.GOOGLE_PRIVATE_KEY),
      GOOGLE_PROJECT_ID: isSet(process.env.GOOGLE_PROJECT_ID),
      GOOGLE_SITE_URL: isSet(process.env.GOOGLE_SITE_URL),
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV || 'local'
    };

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    const siteUrl = process.env.GOOGLE_SITE_URL || 'sc-domain:assetninja.jp';

    if (!clientEmail || !privateKey) {
      return NextResponse.json({ envStatus, error: 'Credentials missing' }, { status: 400 });
    }

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
    const sitesRes = await webmasters.sites.list({ auth });
    const siteEntries = sitesRes.data.siteEntry || [];
    let matchedSite = false;
    let actualPropertyUrl = '';
    
    const availableProperties = siteEntries.map(s => {
      if (s.siteUrl === siteUrl || s.siteUrl === `sc-domain:${siteUrl.replace('sc-domain:', '')}`) {
        matchedSite = true;
        actualPropertyUrl = s.siteUrl;
      }
      return { url: s.siteUrl, permissionLevel: s.permissionLevel };
    });

    if (!matchedSite && siteEntries.length > 0) {
      actualPropertyUrl = siteEntries[0].siteUrl || '';
    }

    // TASK 4: Search Analytics
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const analyticsRes = await webmasters.searchanalytics.query({
      siteUrl: actualPropertyUrl,
      auth,
      requestBody: {
        startDate: sevenDaysAgo.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
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

    // TASK 5: Sitemap API
    const sitemapRes = await webmasters.sitemaps.list({ siteUrl: actualPropertyUrl, auth });
    const sitemaps = sitemapRes.data.sitemap || [];

    // TASK 6: URL Inspection
    const testUrls = [
      'https://assetninja.jp/',
      'https://assetninja.jp/new',
      'https://assetninja.jp/popular',
      'https://assetninja.jp/category/food',
      'https://assetninja.jp/items/food-gyudon-beef-bowl-001'
    ];

    const inspectionResults = await Promise.all(testUrls.map(async (url) => {
      try {
        const inspectRes = await searchconsole.urlInspection.index.inspect({
          auth,
          requestBody: {
            inspectionUrl: url,
            siteUrl: actualPropertyUrl,
            languageCode: 'ja-JP'
          }
        });
        return { url, result: inspectRes.data.inspectionResult?.indexStatusResult };
      } catch (e: any) {
        return { url, error: e.message };
      }
    }));

    return NextResponse.json({
      envStatus,
      sites: {
        httpStatus: sitesRes.status,
        availableProperties,
        matchedSite,
        actualPropertyUrl
      },
      analytics: {
        totalClicks,
        totalImpressions,
        rowCount: rows.length,
        topQuery: rows.length > 0 ? rows[0] : null
      },
      sitemaps,
      inspectionResults
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
