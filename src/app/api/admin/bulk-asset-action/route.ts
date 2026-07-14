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

    const { assetIds, action, value } = await req.json();

    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0 || !action) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (!adminClient) {
      return NextResponse.json({ success: false, error: "Database client not configured" }, { status: 500 });
    }

    let updateData: any = {};

    switch (action) {
      case "bulk-pending":
        updateData = { review_status: "pending" };
        break;
      case "bulk-approve":
        updateData = { review_status: "approved" };
        break;
      case "bulk-reject":
        updateData = { review_status: "rejected" };
        break;
      case "bulk-rank":
        if (!value) return NextResponse.json({ success: false, error: "Missing rank value" }, { status: 400 });
        updateData = { quality_rank: value };
        break;
      case "bulk-follow-qa":
        // This is complex as it requires checking each asset's recommendation.
        // For simplicity in the API, we fetch all first, then update individually.
        const { data: assets } = await adminClient.from("assets").select("id, qa_recommended_action").in("id", assetIds);
        if (assets) {
          for (const a of assets) {
            if (a.qa_recommended_action && ["approve", "pending", "reject"].includes(a.qa_recommended_action)) {
              let st = "pending";
              if (a.qa_recommended_action === "approve") st = "approved";
              if (a.qa_recommended_action === "reject") st = "rejected";
              await adminClient.from("assets").update({ review_status: st }).eq("id", a.id);
            }
          }
        }
        return NextResponse.json({ success: true, message: "Followed QA recommendations" });
      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    if (Object.keys(updateData).length > 0) {
      const { error } = await adminClient
        .from("assets")
        .update(updateData)
        .in("id", assetIds);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API Error] bulk-asset-action:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
