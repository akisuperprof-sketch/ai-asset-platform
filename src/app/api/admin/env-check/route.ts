import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return NextResponse.json({
    GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_CLIENT_EMAIL.trim() !== '' ? 'SET' : 'NOT_SET',
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_PRIVATE_KEY.trim() !== '' ? 'SET' : 'NOT_SET',
    GOOGLE_PROJECT_ID: process.env.GOOGLE_PROJECT_ID && process.env.GOOGLE_PROJECT_ID.trim() !== '' ? 'SET' : 'NOT_SET',
    GOOGLE_SITE_URL: process.env.GOOGLE_SITE_URL && process.env.GOOGLE_SITE_URL.trim() !== '' ? 'SET' : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV || 'local'
  });
}
