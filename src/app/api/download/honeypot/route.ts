import { NextRequest, NextResponse } from "next/server";
import { flagHighRiskIp, getIp } from "@/lib/rate-limit";
import crypto from "crypto";

function hashIp(ip: string) {
  return crypto.createHash('sha256').update(ip + process.env.SUPABASE_SERVICE_ROLE_KEY).digest('hex');
}

export async function GET(request: NextRequest) {
  const ip = getIp(request);
  const ipHash = hashIp(ip);

  // Honeypot hit - flag IP
  flagHighRiskIp(ipHash);
  console.warn(`[SECURITY] Honeypot hit by IP hash: ${ipHash}`);

  // Return a generic 403 or dummy content to keep bots engaged but blocked elsewhere
  return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
}
