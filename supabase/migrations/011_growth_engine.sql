-- 011_growth_engine.sql

-- 1. Create trend_hunts table
CREATE TABLE IF NOT EXISTS trend_hunts (
  id uuid primary key default uuid_generate_v4(),
  source text not null, -- 'google_trends', 'pinterest', 'x', 'calendar_events', 'internal_search'
  keyword text not null,
  category text,
  demand_score integer default 0,
  is_processed boolean default false,
  created_at timestamptz default now()
);

-- 2. Create seo_history table
CREATE TABLE IF NOT EXISTS seo_history (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid references assets(id),
  previous_ctr numeric(5,2),
  new_ctr numeric(5,2),
  action_taken text not null,
  details jsonb,
  created_at timestamptz default now()
);

-- 3. Create daily_analytics table
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

-- 4. Create daily_ai_plans table
CREATE TABLE IF NOT EXISTS daily_ai_plans (
  date date primary key,
  planned_categories jsonb default '[]'::jsonb,
  target_generation_count integer default 0,
  ai_reasoning text,
  is_executed boolean default false,
  created_at timestamptz default now()
);

-- 5. Extend auto_factory_settings (Additive Only)
ALTER TABLE auto_factory_settings 
  ADD COLUMN IF NOT EXISTS target_assets_total integer default 1000,
  ADD COLUMN IF NOT EXISTS cron_frequency text default 'daily',
  ADD COLUMN IF NOT EXISTS worker_batch_size integer default 5;

-- Enable RLS and setup policies
ALTER TABLE trend_hunts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_ai_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role all access on trend_hunts" ON trend_hunts USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role all access on seo_history" ON seo_history USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role all access on daily_analytics" ON daily_analytics USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role all access on daily_ai_plans" ON daily_ai_plans USING (true) WITH CHECK (true);

-- Allow public read access to analytics and plans if needed for dashboard client
CREATE POLICY "Allow public read access on daily_analytics" ON daily_analytics FOR SELECT USING (true);
CREATE POLICY "Allow public read access on daily_ai_plans" ON daily_ai_plans FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trend_hunts_keyword ON trend_hunts(keyword);
CREATE INDEX IF NOT EXISTS idx_trend_hunts_processed ON trend_hunts(is_processed);
CREATE INDEX IF NOT EXISTS idx_seo_history_asset_id ON seo_history(asset_id);
