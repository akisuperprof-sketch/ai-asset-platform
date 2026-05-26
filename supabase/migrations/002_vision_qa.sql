-- Add QA specific columns for Vision Commercial QA OS
ALTER TABLE public.assets
ADD COLUMN IF NOT EXISTS vision_score INTEGER,
ADD COLUMN IF NOT EXISTS commercial_score INTEGER,
ADD COLUMN IF NOT EXISTS seo_score INTEGER,
ADD COLUMN IF NOT EXISTS transparency_score INTEGER,
ADD COLUMN IF NOT EXISTS subject_clarity_score INTEGER,
ADD COLUMN IF NOT EXISTS canva_score INTEGER,
ADD COLUMN IF NOT EXISTS pinterest_score INTEGER,
ADD COLUMN IF NOT EXISTS ai_artifact_score INTEGER,
ADD COLUMN IF NOT EXISTS composition_score INTEGER,
ADD COLUMN IF NOT EXISTS adobe_stock_score INTEGER,
ADD COLUMN IF NOT EXISTS thumbnail_score INTEGER,
ADD COLUMN IF NOT EXISTS risk_level TEXT,
ADD COLUMN IF NOT EXISTS qa_recommended_action TEXT,
ADD COLUMN IF NOT EXISTS qa_reasons TEXT[],
ADD COLUMN IF NOT EXISTS qa_result JSONB,
ADD COLUMN IF NOT EXISTS qa_checked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS qa_model TEXT,
ADD COLUMN IF NOT EXISTS qa_mode TEXT,
ADD COLUMN IF NOT EXISTS quality_flags TEXT[],
ADD COLUMN IF NOT EXISTS low_quality_reason TEXT,
ADD COLUMN IF NOT EXISTS vision_last_checked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS vision_model TEXT,
ADD COLUMN IF NOT EXISTS qa_status TEXT DEFAULT 'pending';

-- Add index for QA status querying
CREATE INDEX IF NOT EXISTS idx_assets_qa_status ON public.assets(qa_status);
CREATE INDEX IF NOT EXISTS idx_assets_qa_recommended_action ON public.assets(qa_recommended_action);
