import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { adminClient } from '@/lib/supabase';

export async function GET() {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
      throw new Error('Missing Google Credentials. Formal connection required (Mocks prohibited).');
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    });

    const searchconsole = google.webmasters('v3');
    
    // Resolve the proper siteUrl via sites.list
    const sitesRes = await searchconsole.sites.list({ auth });
    const siteEntries = sitesRes.data.siteEntry || [];
    let resolvedSiteUrl = process.env.GOOGLE_SITE_URL;
    
    if (!resolvedSiteUrl && siteEntries.length > 0) {
      resolvedSiteUrl = siteEntries[0].siteUrl || undefined;
    } else if (resolvedSiteUrl && siteEntries.length > 0) {
      // Ensure the GOOGLE_SITE_URL exactly matches one of the properties
      const match = siteEntries.find(s => s.siteUrl === resolvedSiteUrl || s.siteUrl === `sc-domain:${resolvedSiteUrl}`);
      if (match && match.siteUrl) resolvedSiteUrl = match.siteUrl;
    }

    if (!resolvedSiteUrl) {
      throw new Error('No verified property found in Search Console for this Service Account.');
    }

    // Default dates for the last 7 days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Fetch general stats (date)
    const response = await searchconsole.searchanalytics.query({
      auth,
      siteUrl: resolvedSiteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['date'],
      },
    });

    // Fetch top queries
    const queryResponse = await searchconsole.searchanalytics.query({
      auth,
      siteUrl: resolvedSiteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 10,
      },
    });

    // Fetch top pages
    const pageResponse = await searchconsole.searchanalytics.query({
      auth,
      siteUrl: resolvedSiteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 10,
      },
    });

    const rows = response.data.rows || [];
    
    let clicks = 0;
    let impressions = 0;
    let ctr = 0;
    let position = 0;

    if (rows.length > 0) {
      rows.forEach(row => {
        clicks += row.clicks || 0;
        impressions += row.impressions || 0;
        ctr += row.ctr || 0;
        position += row.position || 0;
      });
      ctr = ctr / rows.length;
      position = position / rows.length;
    }

    const topQueries = (queryResponse.data.rows || []).map(r => ({
      query: r.keys?.[0] || 'Unknown',
      clicks: r.clicks || 0
    }));

    const topPages = (pageResponse.data.rows || []).map(r => ({
      page: r.keys?.[0] || 'Unknown',
      clicks: r.clicks || 0
    }));

    // Fetch index queue stats using new status logic (no mocks)
    const { data: queueData } = await adminClient!.from('index_queue').select('status');
    const indexStats = {
      sitemap_pending: 0,
      sitemap_published: 0,
      inspection_pending: 0,
      inspection_checked: 0,
      indexed: 0,
      not_indexed: 0,
      error: 0
    };
    if (queueData) {
      queueData.forEach(item => {
        if (item.status === 'sitemap_pending') indexStats.sitemap_pending++;
        if (item.status === 'sitemap_published') indexStats.sitemap_published++;
        if (item.status === 'inspection_pending') indexStats.inspection_pending++;
        if (item.status === 'inspection_checked') indexStats.inspection_checked++;
        if (item.status === 'indexed') indexStats.indexed++;
        if (item.status === 'not_indexed') indexStats.not_indexed++;
        if (item.status === 'error' || item.status === 'failed') indexStats.error++;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        resolvedSiteUrl,
        clicks,
        impressions,
        ctr: (ctr * 100).toFixed(2) + '%',
        position: position.toFixed(1),
        rows,
        topQueries,
        topPages,
        indexStats
      }
    });

  } catch (error: any) {
    console.error('Search Console API Error:', error);
    
    // Fetch index queue stats even if GSC fails
    const { data: queueData } = await adminClient!.from('index_queue').select('status');
    const indexStats = {
      sitemap_pending: 0,
      sitemap_published: 0,
      inspection_pending: 0,
      inspection_checked: 0,
      indexed: 0,
      not_indexed: 0,
      error: 0
    };
    if (queueData) {
      queueData.forEach(item => {
        if (item.status === 'sitemap_pending') indexStats.sitemap_pending++;
        if (item.status === 'sitemap_published') indexStats.sitemap_published++;
        if (item.status === 'inspection_pending') indexStats.inspection_pending++;
        if (item.status === 'inspection_checked') indexStats.inspection_checked++;
        if (item.status === 'indexed') indexStats.indexed++;
        if (item.status === 'not_indexed') indexStats.not_indexed++;
        if (item.status === 'error' || item.status === 'failed') indexStats.error++;
      });
    }

    return NextResponse.json({
      success: false,
      data: {
        resolvedSiteUrl: null,
        clicks: 0,
        impressions: 0,
        ctr: '0%',
        position: '0',
        topQueries: [],
        topPages: [],
        indexStats,
        error: error.message
      }
    });
  }
}
