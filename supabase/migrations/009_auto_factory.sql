-- 009_auto_factory.sql

-- 1. Add metadata to assets table
ALTER TABLE assets ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Create banned_keywords table
CREATE TABLE IF NOT EXISTS banned_keywords (
  id uuid primary key default uuid_generate_v4(),
  keyword text unique not null,
  reason text,
  created_at timestamptz default now()
);

-- Seed some banned keywords
INSERT INTO banned_keywords (keyword, reason) VALUES
('disney', 'copyright risk'),
('pokemon', 'copyright risk'),
('starbucks', 'trademark risk'),
('nike', 'trademark risk'),
('apple logo', 'trademark risk'),
('google logo', 'trademark risk'),
('instagram logo', 'trademark risk'),
('marvel', 'copyright risk'),
('nintendo', 'copyright risk')
ON CONFLICT (keyword) DO NOTHING;

-- 3. Create pinterest_posts table
CREATE TABLE IF NOT EXISTS pinterest_posts (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid references assets(id),
  title text,
  description text,
  board_name text,
  pin_url text,
  status text default 'draft', -- draft, scheduled, posted, failed, skipped
  error_message text,
  scheduled_at timestamptz,
  posted_at timestamptz,
  created_at timestamptz default now()
);

-- 4. Create social_posts table
CREATE TABLE IF NOT EXISTS social_posts (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid references assets(id),
  platform text, -- pinterest, x, threads, facebook, bluesky
  title text,
  body text,
  image_url text,
  status text default 'draft',
  scheduled_at timestamptz,
  posted_at timestamptz,
  created_at timestamptz default now()
);

-- 5. Create auto_factory_settings table
CREATE TABLE IF NOT EXISTS auto_factory_settings (
  id text primary key,
  is_enabled boolean default false,
  daily_target integer default 30,
  updated_at timestamptz default now()
);

-- Insert default settings
INSERT INTO auto_factory_settings (id, is_enabled, daily_target)
VALUES ('default', false, 30)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for all new tables
ALTER TABLE banned_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE pinterest_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_factory_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for banned_keywords (allow read to all, write only to service role)
CREATE POLICY "Allow public read access on banned_keywords" ON banned_keywords FOR SELECT USING (true);
CREATE POLICY "Allow service role all access on banned_keywords" ON banned_keywords USING (true) WITH CHECK (true);

-- Create policies for pinterest_posts
CREATE POLICY "Allow service role all access on pinterest_posts" ON pinterest_posts USING (true) WITH CHECK (true);

-- Create policies for social_posts
CREATE POLICY "Allow service role all access on social_posts" ON social_posts USING (true) WITH CHECK (true);

-- Create policies for auto_factory_settings
CREATE POLICY "Allow public read access on auto_factory_settings" ON auto_factory_settings FOR SELECT USING (true);
CREATE POLICY "Allow service role all access on auto_factory_settings" ON auto_factory_settings USING (true) WITH CHECK (true);

-- Add some indexes for performance
CREATE INDEX IF NOT EXISTS idx_pinterest_posts_asset_id ON pinterest_posts(asset_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_asset_id ON social_posts(asset_id);
CREATE INDEX IF NOT EXISTS idx_pinterest_posts_status ON pinterest_posts(status);
