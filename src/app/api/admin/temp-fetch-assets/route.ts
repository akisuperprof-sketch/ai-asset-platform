import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const agentToken = request.headers.get('x-agent-token');
  if (agentToken !== 'temp-agent-token-123') {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

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
