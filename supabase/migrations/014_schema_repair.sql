-- 014_schema_repair.sql
-- Additive Only, No DROP, Safe retryable schema repair

-- ==========================================
-- 1. Tables (CREATE TABLE IF NOT EXISTS)
-- ==========================================

CREATE TABLE IF NOT EXISTS trend_hunts (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  keyword text not null,
  category text,
  demand_score integer default 0,
  is_processed boolean default false,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS seo_history (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references assets(id),
  previous_ctr numeric(5,2),
  new_ctr numeric(5,2),
  action_taken text not null,
  details jsonb,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS daily_analytics (
  date date primary key,
  total_pv integer default 0,
  total_dl integer default 0,
  avg_ctr numeric(5,2) default 0,
  revenue numeric(10,2) default 0,
  rpm numeric(10,2) default 0,
  popular_assets jsonb default '[]'::jsonb,
  popular_searches jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS daily_ai_plans (
  date date primary key,
  planned_categories jsonb default '[]'::jsonb,
  target_generation_count integer default 0,
  ai_reasoning text,
  is_executed boolean default false,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS ceo_reports (
  date date primary key,
  metrics jsonb default '{}'::jsonb,
  analysis jsonb default '{}'::jsonb,
  revenue_forecast numeric(10,2) default 0,
  proposals text,
  todos jsonb default '[]'::jsonb,
  tomorrow_plan jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS index_queue (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  type text not null default 'URL_UPDATED',
  status text not null default 'pending',
  last_attempt_at timestamptz,
  error_message text,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS revenue_analysis (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  ad_metrics jsonb default '{}'::jsonb,
  ai_proposals jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS growth_engine_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null,
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

-- ==========================================
-- 2. Columns (ALTER TABLE ... ADD COLUMN IF NOT EXISTS)
-- ==========================================

ALTER TABLE auto_factory_settings 
  ADD COLUMN IF NOT EXISTS target_assets_total integer default 1000,
  ADD COLUMN IF NOT EXISTS cron_frequency text default 'daily',
  ADD COLUMN IF NOT EXISTS worker_batch_size integer default 5;

ALTER TABLE assets ADD COLUMN IF NOT EXISTS internal_links jsonb default '[]'::jsonb;

-- ==========================================
-- 3. RLS Enable
-- ==========================================

ALTER TABLE trend_hunts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_ai_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceo_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE index_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_engine_runs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. Policies (Safely create with DO block)
-- ==========================================

DO $$
BEGIN
    -- trend_hunts
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trend_hunts' AND policyname = 'Allow service role all access on trend_hunts') THEN
        CREATE POLICY "Allow service role all access on trend_hunts" ON trend_hunts USING (true) WITH CHECK (true);
    END IF;

    -- seo_history
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seo_history' AND policyname = 'Allow service role all access on seo_history') THEN
        CREATE POLICY "Allow service role all access on seo_history" ON seo_history USING (true) WITH CHECK (true);
    END IF;

    -- daily_analytics
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_analytics' AND policyname = 'Allow service role all access on daily_analytics') THEN
        CREATE POLICY "Allow service role all access on daily_analytics" ON daily_analytics USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_analytics' AND policyname = 'Allow public read access on daily_analytics') THEN
        CREATE POLICY "Allow public read access on daily_analytics" ON daily_analytics FOR SELECT USING (true);
    END IF;

    -- daily_ai_plans
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_ai_plans' AND policyname = 'Allow service role all access on daily_ai_plans') THEN
        CREATE POLICY "Allow service role all access on daily_ai_plans" ON daily_ai_plans USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_ai_plans' AND policyname = 'Allow public read access on daily_ai_plans') THEN
        CREATE POLICY "Allow public read access on daily_ai_plans" ON daily_ai_plans FOR SELECT USING (true);
    END IF;

    -- ceo_reports
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ceo_reports' AND policyname = 'Allow service role all access on ceo_reports') THEN
        CREATE POLICY "Allow service role all access on ceo_reports" ON ceo_reports USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ceo_reports' AND policyname = 'Allow public read access on ceo_reports') THEN
        CREATE POLICY "Allow public read access on ceo_reports" ON ceo_reports FOR SELECT USING (true);
    END IF;

    -- index_queue
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'index_queue' AND policyname = 'Allow service role all access on index_queue') THEN
        CREATE POLICY "Allow service role all access on index_queue" ON index_queue USING (true) WITH CHECK (true);
    END IF;

    -- revenue_analysis
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'revenue_analysis' AND policyname = 'Allow service role all access on revenue_analysis') THEN
        CREATE POLICY "Allow service role all access on revenue_analysis" ON revenue_analysis USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'revenue_analysis' AND policyname = 'Allow public read access on revenue_analysis') THEN
        CREATE POLICY "Allow public read access on revenue_analysis" ON revenue_analysis FOR SELECT USING (true);
    END IF;

    -- growth_engine_runs
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'growth_engine_runs' AND policyname = 'Allow service role all access on growth_engine_runs') THEN
        CREATE POLICY "Allow service role all access on growth_engine_runs" ON growth_engine_runs USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'growth_engine_runs' AND policyname = 'Allow public read access on growth_engine_runs') THEN
        CREATE POLICY "Allow public read access on growth_engine_runs" ON growth_engine_runs FOR SELECT USING (true);
    END IF;
END
$$;

-- ==========================================
-- 5. Indexes (CREATE INDEX IF NOT EXISTS)
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_trend_hunts_keyword ON trend_hunts(keyword);
CREATE INDEX IF NOT EXISTS idx_trend_hunts_processed ON trend_hunts(is_processed);
CREATE INDEX IF NOT EXISTS idx_seo_history_asset_id ON seo_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_index_queue_status ON index_queue(status);
CREATE INDEX IF NOT EXISTS idx_revenue_analysis_date ON revenue_analysis(date);

-- ==========================================
-- 6. Grants
-- ==========================================

GRANT ALL ON TABLE trend_hunts TO service_role, authenticated, anon;
GRANT ALL ON TABLE seo_history TO service_role, authenticated, anon;
GRANT ALL ON TABLE daily_analytics TO service_role, authenticated, anon;
GRANT ALL ON TABLE daily_ai_plans TO service_role, authenticated, anon;
GRANT ALL ON TABLE ceo_reports TO service_role, authenticated, anon;
GRANT ALL ON TABLE index_queue TO service_role, authenticated, anon;
GRANT ALL ON TABLE revenue_analysis TO service_role, authenticated, anon;
GRANT ALL ON TABLE growth_engine_runs TO service_role, authenticated, anon;

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';

-- ==========================================
-- 7. growth_scores (Requested by User)
-- ==========================================

CREATE TABLE IF NOT EXISTS growth_scores (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references assets(id),
  date date not null default CURRENT_DATE,
  score numeric(5,2) default 0,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

ALTER TABLE growth_scores ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'growth_scores' AND policyname = 'Allow service role all access on growth_scores') THEN
        CREATE POLICY "Allow service role all access on growth_scores" ON growth_scores USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'growth_scores' AND policyname = 'Allow public read access on growth_scores') THEN
        CREATE POLICY "Allow public read access on growth_scores" ON growth_scores FOR SELECT USING (true);
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_growth_scores_asset_id ON growth_scores(asset_id);
CREATE INDEX IF NOT EXISTS idx_growth_scores_date ON growth_scores(date);

GRANT ALL ON TABLE growth_scores TO service_role, authenticated, anon;

NOTIFY pgrst, 'reload schema';
