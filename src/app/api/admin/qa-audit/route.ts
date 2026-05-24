import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase";
import { runVisionQA } from "@/lib/vision-qa";

export async function POST(req: Request) {
  try {
    // 1. Verify Authentication
    const cookieStore = await cookies();
    const strategyKey = cookieStore.get("D_STRATEGY_KEY")?.value;

    if (!strategyKey || strategyKey !== process.env.D_STRATEGY_KEY) {
      return NextResponse.json({ success: false, error: "Unauthorized QA Access" }, { status: 401 });
    }

    // 2. Parse request payload
    const { assetId } = await req.json();
    if (!assetId) {
      return NextResponse.json({ success: false, error: "Missing assetId" }, { status: 400 });
    }

    // 3. Fetch Asset from Supabase
    if (!adminClient) {
      return NextResponse.json({ success: false, error: "Database client not configured" }, { status: 500 });
    }

    const { data: asset, error: fetchError } = await adminClient
      .from("assets")
      .select("id, image_url, review_status")
      .eq("id", assetId)
      .single();

    if (fetchError || !asset || !asset.image_url) {
      return NextResponse.json({ success: false, error: "Asset not found or missing image URL" }, { status: 404 });
    }

    // 4. Run Vision Commercial QA
    const qaResult = await runVisionQA(asset.image_url);

    // 5. Determine if status needs auto-adjustment (Auto Moderation)
    // As per user instructions: "score < 30 is pending candidate, score < 15 is reject candidate, but no auto-reject yet, only auto-pending"
    let newStatus = asset.review_status;
    if (qaResult.visionScore < 30 || qaResult.commercialScore < 30) {
      // If it's already rejected, leave it. Otherwise, force to pending.
      if (newStatus !== "rejected") {
        newStatus = "pending";
      }
    }

    // Determine QA status mapping
    let qaStatus = "passed";
    if (qaResult.visionScore < 30 || qaResult.commercialScore < 30) qaStatus = "failed";

    // 6. Save QA metrics back to Supabase
    const { error: updateError } = await adminClient!
      .from("assets")
      .update({
        vision_score: qaResult.visionScore,
        commercial_score: qaResult.commercialScore,
        seo_score: qaResult.seoScore,
        quality_flags: qaResult.qualityFlags,
        low_quality_reason: qaResult.lowQualityReason,
        vision_last_checked_at: new Date().toISOString(),
        vision_model: "gemini-2.5-flash+sharp",
        qa_status: qaStatus,
        review_status: newStatus
      })
      .eq("id", assetId);

    if (updateError) {
      console.error("[QA API] DB Update Error:", updateError);
      return NextResponse.json({ success: false, error: "Failed to save QA results" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      qaResult,
      autoPended: newStatus === "pending" && asset.review_status !== "pending"
    });

  } catch (error: any) {
    console.error("[QA API] Internal Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
