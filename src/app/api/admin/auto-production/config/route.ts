import { verifyAdminRequest } from '@/lib/server/cron-auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'data', 'local-auto-config.json');

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('D_STRATEGY_KEY');
    
    const envKey = process.env.D_STRATEGY_KEY;
    if (!envKey) {
      return NextResponse.json({ success: false, error: 'SERVER_MISCONFIGURED' }, { status: 500 });
    }

    if (adminSession?.value !== envKey) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    if (!fs.existsSync(configPath)) {
      // Create default
      const defaultConfig = {
        autoProductionEnabled: false,
        batchSize: 10,
        dailyLimit: 30,
        idleMinutes: 5,
        maxNetworkKBps: 200,
        cooldownMinutes: 180,
        todayGenerated: 0,
        lastRunDate: ""
      };
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
      return NextResponse.json({ success: true, data: defaultConfig });
    }

    const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Auto Production Config GET Error:", error);
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authResult = verifyAdminRequest(request);
  if (!authResult.ok) return authResult.response;

  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('D_STRATEGY_KEY');
    
    const envKey = process.env.D_STRATEGY_KEY;
    if (!envKey) {
      return NextResponse.json({ success: false, error: 'SERVER_MISCONFIGURED' }, { status: 500 });
    }

    if (adminSession?.value !== envKey) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await request.json();
    
    let currentConfig = {};
    if (fs.existsSync(configPath)) {
      currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    const newConfig = {
      ...currentConfig,
      ...body
    };

    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));

    return NextResponse.json({ success: true, data: newConfig });
  } catch (error: any) {
    console.error("Auto Production Config POST Error:", error);
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR', details: error.message }, { status: 500 });
  }
}
