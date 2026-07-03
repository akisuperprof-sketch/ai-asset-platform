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
  centeringScore?: number;
  marginScore?: number;
  whiteFringeScore?: number;
  resolutionScore?: number;
  aiDistortionScore?: number;
  subjectScore?: number;
  luxuryScore?: number;
  
  // Quality Rank
  qualityRank?: "S" | "A" | "B" | "C" | "D";
  
  // Reject reason if B or C
  rejectReason?: string;

  // Rich Pinterest Metadata
  pinterestTitle?: string;
  pinterestDescription?: string;

  // Vision Commercial QA OS
  visionScore?: number;
  commercialScore?: number;
  seoScore?: number;
  transparencyScore?: number;
  subjectClarityScore?: number;
  canvaScore?: number;
  pinterestScore?: number;
  aiArtifactScore?: number;
  compositionScore?: number;
  adobeStockScore?: number;
  thumbnailScore?: number;
  riskLevel?: string;
  qaRecommendedAction?: "approve" | "pending" | "reject";
  qaReasons?: string[];
  qaResult?: any;
  qaCheckedAt?: string;
  qaModel?: string;
  qaMode?: string;
  qualityFlags?: string[];
  lowQualityReason?: string;
  visionLastCheckedAt?: string;
  visionModel?: string;
  qaStatus?: "pending" | "passed" | "failed";

  // Category Domination Metadata
  categoryDomination?: {
    baseAssetId?: string;
    variationType?: string;
    angle?: string;
    lighting?: string;
    composition?: string;
    style?: string;
    parentCategory?: string;
    seoSlug?: string;
    relatedGroupId?: string;
  };

  // SEO & Extended Metadata
  seoTitle?: string;
  seoDescription?: string;
  altText?: string;
  usageExamples?: any;
  faq?: any;
  internalLinks?: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
  icon?: string;
}

export interface DemandEvent {
  id?: string;
  event_type: "search" | "zero_result" | "asset_click" | "download" | "detail_view" | "dwell_time";
  query?: string;
  normalized_query?: string;
  asset_id?: string;
  category?: string;
  session_hash?: string;
  source_page?: string;
  referrer?: string;
  user_agent_hash?: string;
  country?: string;
  metadata?: any;
  created_at?: string;
}
