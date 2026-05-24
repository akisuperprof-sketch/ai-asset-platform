-- Add QA specific columns for Vision Commercial QA OS
ALTER TABLE public.assets
ADD COLUMN IF NOT EXISTS vision_score INTEGER,
ADD COLUMN IF NOT EXISTS commercial_score INTEGER,
ADD COLUMN IF NOT EXISTS seo_score INTEGER,
ADD COLUMN IF NOT EXISTS quality_flags TEXT[],
ADD COLUMN IF NOT EXISTS low_quality_reason TEXT,
ADD COLUMN IF NOT EXISTS vision_last_checked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS vision_model TEXT,
ADD COLUMN IF NOT EXISTS qa_status TEXT DEFAULT 'pending';

-- Add index for QA status querying
CREATE INDEX IF NOT EXISTS idx_assets_qa_status ON public.assets(qa_status);
