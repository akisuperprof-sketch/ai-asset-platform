const { NextResponse } = require('next/server');
try {
  const qaResult = {
    visionScore: 85,
    commercialScore: 85,
    background_removed: true,
    has_alpha: true,
    alpha_ratio: 0.5,
    cutout_quality_score: 95
  };
  const results = [];
  results.push({
    id: "uuid",
    keyword: "test",
    status: "qa_passed",
    imageUrl: "https://example.com/image.png",
    finalUpdateError: null,
    insertErrorMsg: null,
    reason: null,
    bgRemoved: qaResult.background_removed,
    hasAlpha: qaResult.has_alpha,
    alphaRatio: qaResult.alpha_ratio,
    cutoutScore: qaResult.cutout_quality_score
  });
  
  const res = NextResponse.json({ success: true, results });
  console.log("Success:", res.status);
} catch (err) {
  console.error("Error:", err);
}
