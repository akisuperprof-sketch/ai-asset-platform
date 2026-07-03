-- ============================================================================
-- Migration: 015_asset_intelligence.sql
-- Description: Tracking per-asset intelligence metrics (SEO, Revenue, CTR, etc)
-- Rule: Additive Only
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.asset_intelligence (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id text NOT NULL, -- references assets(id) but using text for flexibility
    asset_score integer DEFAULT 0,
    seo_score integer DEFAULT 0,
    revenue_score integer DEFAULT 0,
    download_score integer DEFAULT 0,
    ctr numeric(5,2) DEFAULT 0.00,
    pinterest_score integer DEFAULT 0,
    google_rank integer DEFAULT null,
    
    last_updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.asset_intelligence ENABLE ROW LEVEL SECURITY;

-- Add policies safely using IF NOT EXISTS logic
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'asset_intelligence' AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users"
            ON public.asset_intelligence FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'asset_intelligence' AND policyname = 'Enable insert access for all users'
    ) THEN
        CREATE POLICY "Enable insert access for all users"
            ON public.asset_intelligence FOR INSERT
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'asset_intelligence' AND policyname = 'Enable update access for all users'
    ) THEN
        CREATE POLICY "Enable update access for all users"
            ON public.asset_intelligence FOR UPDATE
            USING (true);
    END IF;
END $$;

-- PostgREST Schema Cache reload trigger trick
NOTIFY pgrst, 'reload schema';
