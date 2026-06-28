-- 010_phase9_enhancements.sql

-- 1. Create factory_logs table
CREATE TABLE IF NOT EXISTS factory_logs (
  id uuid primary key default uuid_generate_v4(),
  task text,
  status text,
  details jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE factory_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role all access on factory_logs" ON factory_logs USING (true) WITH CHECK (true);

-- 2. Add explicit SEO/Metadata columns to assets table
ALTER TABLE assets 
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS alt_text text,
  ADD COLUMN IF NOT EXISTS usage_examples jsonb,
  ADD COLUMN IF NOT EXISTS faq jsonb,
  ADD COLUMN IF NOT EXISTS pinterest_description text,
  ADD COLUMN IF NOT EXISTS asset_value_score integer;
