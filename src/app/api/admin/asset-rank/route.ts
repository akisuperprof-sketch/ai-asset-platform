import { verifyAdminRequest } from '@/lib/server/cron-auth';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const strategyKey = cookieStore.get("D_STRATEGY_KEY")?.value;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    if (!checkRateLimit(`admin:${ip}`, 30, 60 * 1000)) {
      return NextResponse.json({ success: false, error: "Too many admin requests" }, { status: 429 });
    }

    if (!strategyKey || strategyKey !== process.env.D_STRATEGY_KEY) {
      return NextResponse.json({ success: false, error: "Unauthorized QA Access" }, { status: 401 });
    }

    const { assetId, rank } = await req.json();

    if (!assetId || !rank) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (!adminClient) {
      return NextResponse.json({ success: false, error: "Database client not configured" }, { status: 500 });
    }

    const { error } = await adminClient
      .from("assets")
      .update({ quality_rank: rank })
      .eq("id", assetId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Error] asset-rank:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
