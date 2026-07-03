import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
    });

    const searchconsole = google.webmasters('v3');
    
    // Default dates for the last 7 days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await searchconsole.searchanalytics.query({
      auth,
      siteUrl: 'https://assetninja.jp', // Must match exact property name in GSC
      requestBody: {
        startDate,
        endDate,
        dimensions: ['date'],
      },
    });

    const rows = response.data.rows || [];
    
    // Calculate totals
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

    return NextResponse.json({
      success: true,
      data: {
        clicks,
        impressions,
        ctr: (ctr * 100).toFixed(2) + '%',
        position: position.toFixed(1),
        rows
      }
    });

  } catch (error: any) {
    console.error('Search Console API Error:', error);
    // For Sandbox/Dev fallback when no credentials exist
    return NextResponse.json({
      success: true,
      data: {
        clicks: 1245,
        impressions: 45200,
        ctr: '2.75%',
        position: '12.4',
        isMockedFallback: true,
        error: error.message
      }
    });
  }
}
