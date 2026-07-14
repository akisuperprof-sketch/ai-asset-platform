import { verifyAdminRequest } from '@/lib/server/cron-auth';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase";
import { runVisionQA } from "@/lib/vision-qa";
import { checkRateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const authResult = verifyAdminRequest(req);
  if (!authResult.ok) return authResult.response;

  if (process.env.QA_AUDIT_ENABLED === 'false') {
    return NextResponse.json({ success: false, error: "QA Audit is disabled" }, { status: 503 });
  }

  try {
    // 1. Verify Authentication
    

    // 2. Rate Limit (Admin but costly) - 5 per minute
    // Must pass NextRequest or polyfill getIp logic. req is standard Request in Next 13 API.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    if (!checkRateLimit(`qa:${ip}`, 5, 60 * 1000)) {
      return NextResponse.json({ success: false, error: "Too many QA requests" }, { status: 429 });
    }

    // 3. Parse request payload
    const { assetId, dryRun = true, force = false } = await req.json();
    if (!assetId) {
      return NextResponse.json({ success: false, error: "Missing assetId" }, { status: 400 });
    }

    // 3. Fetch Asset from Supabase
    if (!adminClient) {
      return NextResponse.json({ success: false, error: "Database client not configured" }, { status: 500 });
    }

    const { data: asset, error: fetchError } = await adminClient
      .from("assets")
      .select("id, image_url, review_status, qa_checked_at")
      .eq("id", assetId)
      .single();

    if (fetchError || !asset || !asset.image_url) {
      return NextResponse.json({ success: false, error: "Asset not found or missing image URL" }, { status: 404 });
    }

    if (asset.qa_checked_at && !force) {
      return NextResponse.json({ success: false, error: "Asset already audited. Use force=true to re-audit." }, { status: 400 });
    }

    // 4. Run Vision Commercial QA
    const qaResult = await runVisionQA(asset.image_url);

    // 5. Determine Recommended Action & Potential Status Update
    let newStatus = asset.review_status;
    let autoPended = false;

    // Enforce stricter pending candidate logic:
    if (qaResult.commercialScore < 60 || qaResult.aiArtifactScore > 70) {
      qaResult.qaRecommendedAction = "pending";
    }

    // Determine QA status mapping
    let qaStatus = "passed";
    if (qaResult.qaRecommendedAction === "pending" || qaResult.qaRecommendedAction === "reject") {
      qaStatus = "failed";
    }

    // If NOT dryRun, actually change the status
    if (!dryRun) {
      if (qaResult.qaRecommendedAction === "pending" || qaResult.qaRecommendedAction === "reject") {
        if (newStatus !== "rejected") {
          newStatus = "pending";
          autoPended = true;
        }
      }
    }

    // 6. Save QA metrics back to Supabase
    const { error: updateError } = await adminClient
      .from("assets")
      .update({
        vision_score: qaResult.visionScore,
        commercial_score: qaResult.commercialScore,
        seo_score: qaResult.seoScore,
        transparency_score: qaResult.transparencyScore,
        subject_clarity_score: qaResult.subjectClarityScore,
        canva_score: qaResult.canvaScore,
        pinterest_score: qaResult.pinterestScore,
        ai_artifact_score: qaResult.aiArtifactScore,
        composition_score: qaResult.compositionScore,
        adobe_stock_score: qaResult.adobeStockScore,
        thumbnail_score: qaResult.thumbnailScore,
        risk_level: qaResult.riskLevel,
        qa_recommended_action: qaResult.qaRecommendedAction,
        qa_reasons: qaResult.qaReasons,
        qa_result: qaResult,
        qa_checked_at: new Date().toISOString(),
        qa_model: "gemini-2.5-flash",
        qa_mode: dryRun ? "dry-run" : "enforce",
        qa_status: qaStatus,
        review_status: newStatus
      })
      .eq("id", assetId);

    if (updateError) {
      console.error("[QA API] DB Update Error:", updateError);
      // Even if DB fails, return what we found, but as an error
      return NextResponse.json({ success: false, error: "Failed to save QA results", details: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      qaResult,
      dryRun,
      autoPended
    });

  } catch (error: any) {
    console.error("[QA API] Internal Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
