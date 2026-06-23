-- Create search_demand_logs table for Phase 3
CREATE TABLE IF NOT EXISTS public.search_demand_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword TEXT NOT NULL,
    normalized_keyword TEXT NOT NULL,
    search_count INTEGER DEFAULT 1,
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    need_asset BOOLEAN DEFAULT false,
    priority_score FLOAT DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.search_demand_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (if tracked from client directly) and updates
CREATE POLICY "Allow public insert to search_demand_logs" ON public.search_demand_logs
    FOR INSERT 
    TO public
    WITH CHECK (true);

CREATE POLICY "Allow public update to search_demand_logs" ON public.search_demand_logs
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to search_demand_logs" ON public.search_demand_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Indexes for fast radar queries
CREATE INDEX IF NOT EXISTS idx_search_demand_logs_normalized_keyword ON public.search_demand_logs (normalized_keyword);
CREATE INDEX IF NOT EXISTS idx_search_demand_logs_priority_score ON public.search_demand_logs (priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_search_demand_logs_need_asset ON public.search_demand_logs (need_asset) WHERE need_asset = true;

-- Drop the old RPC if it exists, or create a new one for Phase 3 tracking
CREATE OR REPLACE FUNCTION upsert_search_demand_log(
    p_keyword TEXT,
    p_normalized_keyword TEXT,
    p_need_asset BOOLEAN,
    p_recency_bonus FLOAT DEFAULT 10,
    p_no_asset_bonus FLOAT DEFAULT 50
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_search_count INTEGER;
    v_priority_score FLOAT;
    v_last_seen_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check if keyword exists
    SELECT search_count, last_seen_at INTO v_search_count, v_last_seen_at
    FROM public.search_demand_logs
    WHERE normalized_keyword = p_normalized_keyword;

    IF FOUND THEN
        -- Calculate new priority score
        -- (search_count * 2) + recency bonus + (need_asset ? no_asset_bonus : 0)
        v_priority_score := ((v_search_count + 1) * 2) + p_recency_bonus + CASE WHEN p_need_asset THEN p_no_asset_bonus ELSE 0 END;

        UPDATE public.search_demand_logs
        SET search_count = search_count + 1,
            last_seen_at = now(),
            need_asset = CASE WHEN p_need_asset THEN true ELSE need_asset END,
            priority_score = v_priority_score
        WHERE normalized_keyword = p_normalized_keyword;
    ELSE
        -- Insert new
        v_priority_score := (1 * 2) + p_recency_bonus + CASE WHEN p_need_asset THEN p_no_asset_bonus ELSE 0 END;
        
        INSERT INTO public.search_demand_logs (
            keyword,
            normalized_keyword,
            search_count,
            first_seen_at,
            last_seen_at,
            need_asset,
            priority_score
        ) VALUES (
            p_keyword,
            p_normalized_keyword,
            1,
            now(),
            now(),
            p_need_asset,
            v_priority_score
        );
    END IF;
END;
$$;
