import { verifyAdminRequest } from '@/lib/server/cron-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const geminiToken = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  
  return NextResponse.json({
    gemini: {
      configured: !!geminiToken,
    },
    replicate: {
      configured: !!replicateToken,
    },
    generationApi: {
      enabled: process.env.GENERATION_ENABLED === 'true',
    }
  });
}
