-- 012_growth_engine_v2.sql

-- 1. Create ceo_reports table
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

-- 2. Create index_queue table
CREATE TABLE IF NOT EXISTS index_queue (
  id uuid primary key default uuid_generate_v4(),
  url text not null,
  type text not null default 'URL_UPDATED',
  status text not null default 'pending', -- pending, success, failed
  last_attempt_at timestamptz,
  error_message text,
  created_at timestamptz default now()
);

-- 3. Create revenue_analysis table
CREATE TABLE IF NOT EXISTS revenue_analysis (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  ad_metrics jsonb default '{}'::jsonb,
  ai_proposals jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 4. Alter assets to add internal_links
ALTER TABLE assets ADD COLUMN IF NOT EXISTS internal_links jsonb default '[]'::jsonb;

-- Enable RLS and setup policies
ALTER TABLE ceo_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE index_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role all access on ceo_reports" ON ceo_reports USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role all access on index_queue" ON index_queue USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role all access on revenue_analysis" ON revenue_analysis USING (true) WITH CHECK (true);

-- Allow public read access to ceo_reports if needed for dashboard client
CREATE POLICY "Allow public read access on ceo_reports" ON ceo_reports FOR SELECT USING (true);
CREATE POLICY "Allow public read access on revenue_analysis" ON revenue_analysis FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_index_queue_status ON index_queue(status);
CREATE INDEX IF NOT EXISTS idx_revenue_analysis_date ON revenue_analysis(date);
