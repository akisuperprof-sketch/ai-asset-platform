export interface Asset {
  id: string;
  title: string;
  category: string;
  tags: string[];
  description?: string;
  imageUrl: string;    // 表示用（CDN/R2 URL or Fallback）
  thumbnailUrl?: string; // グリッド表示用
  storageKey: string;   // R2内での実パス（assets/xxx.png）
  width: number;
  height: number;
  fileSize: string;
  isAiGenerated: boolean;
  isCommercialOk: boolean;
  licenseType: "free" | "pro" | "cc0";
  reviewStatus: "pending" | "approved" | "rejected";
  legalStatus: "checked" | "risky" | "clean";
  publishedAt?: string;

  // Quality Gate Scores (0-100)
  compositionScore?: number;
  centeringScore?: number;
  marginScore?: number;
  whiteFringeScore?: number;
  resolutionScore?: number;
  aiDistortionScore?: number;
  subjectScore?: number;
  pinterestScore?: number;
  canvaScore?: number;
  luxuryScore?: number;
  
  // Quality Rank
  qualityRank?: "S" | "A" | "B" | "C";
  
  // Reject reason if B or C
  rejectReason?: string;

  // Rich Pinterest Metadata
  pinterestTitle?: string;
  pinterestDescription?: string;

  // SEO Score (0-100)
  seoScore?: number;

  // Vision Commercial QA OS
  visionScore?: number;
  commercialScore?: number;
  qualityFlags?: string[];
  lowQualityReason?: string;
  visionLastCheckedAt?: string;
  visionModel?: string;
  qaStatus?: "pending" | "passed" | "failed";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
  icon?: string;
}
