-- Ensure need_asset column exists
ALTER TABLE public.search_demand_logs ADD COLUMN IF NOT EXISTS need_asset BOOLEAN DEFAULT false;

-- Drop existing overloaded functions to avoid confusion
DROP FUNCTION IF EXISTS public.upsert_search_demand_log(text, text, boolean, double precision, double precision);
DROP FUNCTION IF EXISTS public.upsert_search_demand_log(text, text, boolean);

-- Create new simplified function with 2 arguments
CREATE OR REPLACE FUNCTION public.upsert_search_demand_log(
    p_keyword TEXT,
    p_need_asset BOOLEAN
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_search_count INTEGER;
    v_priority_score FLOAT;
    v_last_seen_at TIMESTAMP WITH TIME ZONE;
    p_normalized_keyword TEXT;
    p_recency_bonus FLOAT := 10;
    p_no_asset_bonus FLOAT := 50;
BEGIN
    p_normalized_keyword := lower(trim(p_keyword));

    SELECT search_count, last_seen_at INTO v_search_count, v_last_seen_at
    FROM public.search_demand_logs
    WHERE normalized_keyword = p_normalized_keyword;

    IF FOUND THEN
        v_priority_score := ((v_search_count + 1) * 2) + p_recency_bonus + CASE WHEN p_need_asset THEN p_no_asset_bonus ELSE 0 END;

        UPDATE public.search_demand_logs
        SET search_count = search_count + 1,
            last_seen_at = now(),
            need_asset = CASE WHEN p_need_asset THEN true ELSE need_asset END,
            priority_score = v_priority_score
        WHERE normalized_keyword = p_normalized_keyword;
    ELSE
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

NOTIFY pgrst, 'reload schema';
