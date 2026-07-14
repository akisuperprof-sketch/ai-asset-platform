import { verifyAdminRequest } from '@/lib/server/cron-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const serverKey = process.env.D_STRATEGY_KEY;
  
  return NextResponse.json({
    hasDStrategyKey: !!serverKey,
    keyLength: serverKey ? serverKey.length : 0,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || 'unknown'
  });
}
