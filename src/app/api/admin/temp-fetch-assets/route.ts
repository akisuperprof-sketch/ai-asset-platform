import { verifyAdminRequest } from '@/lib/server/cron-auth';
import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const authResult = verifyAdminRequest(request);
  if (!authResult.ok) return authResult.response;

  if (!adminClient) {
    return NextResponse.json({ success: false, error: 'NO_DB' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    env: {
      GENERATION_ENABLED: process.env.GENERATION_ENABLED,
      GENERATION_PROVIDER: process.env.GENERATION_PROVIDER,
      hasReplicateToken: !!process.env.REPLICATE_API_TOKEN,
      hasStabilityToken: !!process.env.STABILITY_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      supabaseStorage: !!process.env.NEXT_PUBLIC_SUPABASE_URL
    }
  });
}
