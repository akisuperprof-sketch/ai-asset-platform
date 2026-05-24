-- Create search_queries table to track user search demand
CREATE TABLE IF NOT EXISTS public.search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    normalized_query TEXT NOT NULL,
    language_guess TEXT,
    matched_asset_count INTEGER DEFAULT 0,
    has_results BOOLEAN DEFAULT false,
    user_agent_hash TEXT,
    source_page TEXT,
    suggested_category TEXT,
    priority_score INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (users making searches)
CREATE POLICY "Allow public insert to search_queries" ON public.search_queries
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Allow admins to view search_queries
-- Assuming we don't have a specific admin role in Supabase auth yet since we use D_STRATEGY_KEY,
-- we can let the service_role key bypass RLS, or we can explicitly allow service role.
-- Note: Supabase service_role key automatically bypasses RLS.

-- Index for fast lookup by normalized_query to update priority_score
CREATE INDEX IF NOT EXISTS idx_search_queries_normalized_query 
    ON public.search_queries (normalized_query);

-- Create a function to increment priority score or insert if not exists
-- This helps avoid duplicates and race conditions
CREATE OR REPLACE FUNCTION upsert_search_query(
    p_query TEXT,
    p_normalized_query TEXT,
    p_language_guess TEXT,
    p_matched_asset_count INTEGER,
    p_has_results BOOLEAN,
    p_user_agent_hash TEXT,
    p_source_page TEXT,
    p_suggested_category TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
AS $$
BEGIN
    -- Try to find an existing query today from the same IP/UserAgent hash to prevent spam,
    -- or just bump the priority of the normalized query.
    -- To keep it simple and demand-driven:
    
    UPDATE public.search_queries
    SET priority_score = priority_score + 1,
        updated_at = now()
    WHERE normalized_query = p_normalized_query
      AND created_at >= now() - INTERVAL '30 days';

    IF NOT FOUND THEN
        INSERT INTO public.search_queries (
            query, 
            normalized_query, 
            language_guess, 
            matched_asset_count, 
            has_results, 
            user_agent_hash, 
            source_page, 
            suggested_category
        ) VALUES (
            p_query,
            p_normalized_query,
            p_language_guess,
            p_matched_asset_count,
            p_has_results,
            p_user_agent_hash,
            p_source_page,
            p_suggested_category
        );
    END IF;
END;
$$;
