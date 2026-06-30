-- 013_daily_auto_run.sql

-- 1. Create growth_engine_runs table
CREATE TABLE IF NOT EXISTS growth_engine_runs (
  id uuid primary key default uuid_generate_v4(),
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

-- Enable RLS and setup policies
ALTER TABLE growth_engine_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role all access on growth_engine_runs" ON growth_engine_runs USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access on growth_engine_runs" ON growth_engine_runs FOR SELECT USING (true);

-- 2. Update auto_factory_settings initial target to 10
UPDATE auto_factory_settings SET daily_target = 10 WHERE id = 'default';
