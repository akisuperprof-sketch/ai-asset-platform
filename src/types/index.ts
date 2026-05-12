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
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
  icon?: string;
}
