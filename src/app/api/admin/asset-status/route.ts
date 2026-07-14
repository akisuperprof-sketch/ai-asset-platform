import { verifyAdminRequest } from '@/lib/server/cron-auth';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase";
import { checkRateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const authResult = verifyAdminRequest(req);
  if (!authResult.ok) return authResult.response;

  try {
    

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    if (!checkRateLimit(`admin:${ip}`, 30, 60 * 1000)) {
      return NextResponse.json({ success: false, error: "Too many admin requests" }, { status: 429 });
    }

    const { assetId, status } = await req.json();

    if (!assetId || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (!adminClient) {
      return NextResponse.json({ success: false, error: "Database client not configured" }, { status: 500 });
    }

    const { error } = await adminClient
      .from("assets")
      .update({ review_status: status })
      .eq("id", assetId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Error] asset-status:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
