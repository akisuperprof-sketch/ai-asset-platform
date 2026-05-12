-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets Table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- Simplified for direct retrieval as per dummy-data
    tags TEXT[] DEFAULT '{}',
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    storage_key TEXT NOT NULL, -- Path in Cloudflare R2
    file_size TEXT,
    width INTEGER,
    height INTEGER,
    license_type TEXT DEFAULT 'free', -- free, pro, cc0
    is_ai_generated BOOLEAN DEFAULT TRUE,
    legal_status TEXT DEFAULT 'pending', -- pending, checked, risky, clean
    review_status TEXT DEFAULT 'pending', -- pending, approved, rejected
    has_logo_risk BOOLEAN DEFAULT FALSE,
    has_face_risk BOOLEAN DEFAULT FALSE,
    has_landmark_risk BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Download Logs Table
CREATE TABLE download_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    ip_hash TEXT, -- Security: Hash IP for privacy
    user_agent TEXT,
    referer TEXT,
    downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_published_at ON assets(published_at);
CREATE INDEX idx_assets_status ON assets(review_status, legal_status);

-- RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access to categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to published assets" ON assets
    FOR SELECT USING (
        review_status = 'approved' AND 
        legal_status = 'clean' AND 
        published_at IS NOT NULL
    );

-- Logs are only accessible by admin via service role
CREATE POLICY "Admin only access to logs" ON download_logs
    FOR ALL USING (false);

-- RPC Functions
CREATE OR REPLACE FUNCTION increment_download_count(asset_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE assets
    SET download_count = download_count + 1
    WHERE id = asset_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
