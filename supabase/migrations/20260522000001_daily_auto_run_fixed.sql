-- 013_daily_auto_run_fixed.sql

-- 1. Create growth_engine_runs table safely
-- 変更点: uuid_generate_v4() ではなく組み込みの gen_random_uuid() を使用（拡張機能不要）
CREATE TABLE IF NOT EXISTS growth_engine_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null, -- 'running', 'success', 'failed'
  generated_count integer default 0,
  approved_count integer default 0,
  qa_failed_count integer default 0,
  pinterest_drafts_count integer default 0,
  index_queue_count integer default 0,
  revenue_analysis_created boolean default false,
  ceo_report_created boolean default false,
  errors jsonb,
  duration_seconds integer,
  target_date date default CURRENT_DATE
);

-- Enable RLS
ALTER TABLE growth_engine_runs ENABLE ROW LEVEL SECURITY;

-- Safely create policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'growth_engine_runs' AND policyname = 'Allow service role all access on growth_engine_runs'
    ) THEN
        CREATE POLICY "Allow service role all access on growth_engine_runs" ON growth_engine_runs USING (true) WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'growth_engine_runs' AND policyname = 'Allow public read access on growth_engine_runs'
    ) THEN
        CREATE POLICY "Allow public read access on growth_engine_runs" ON growth_engine_runs FOR SELECT USING (true);
    END IF;
END
$$;

-- 明示的な権限付与（APIエラー PGRST205 対策）
GRANT ALL ON TABLE growth_engine_runs TO service_role, authenticated, anon;

-- スキーマキャッシュの更新
NOTIFY pgrst, 'reload schema';

-- 2. Update auto_factory_settings initial target to 10
UPDATE auto_factory_settings SET daily_target = 10 WHERE id = 'default';
