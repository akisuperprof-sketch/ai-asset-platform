-- Add clicks and category to search_demand_logs
ALTER TABLE public.search_demand_logs ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;
ALTER TABLE public.search_demand_logs ADD COLUMN IF NOT EXISTS category TEXT;

-- Drop the old RPC to redefine it with new parameters
DROP FUNCTION IF EXISTS upsert_search_demand_log(TEXT, TEXT, BOOLEAN, FLOAT, FLOAT);
DROP FUNCTION IF EXISTS upsert_search_demand_log(TEXT, TEXT, BOOLEAN, TEXT, BOOLEAN, FLOAT, FLOAT);

-- Create new RPC
CREATE OR REPLACE FUNCTION upsert_search_demand_log(
    p_keyword TEXT,
    p_normalized_keyword TEXT,
    p_need_asset BOOLEAN,
    p_category TEXT DEFAULT NULL,
    p_is_click BOOLEAN DEFAULT false,
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
    v_clicks INTEGER;
BEGIN
    -- Check if keyword exists
    SELECT search_count, clicks, last_seen_at INTO v_search_count, v_clicks, v_last_seen_at
    FROM public.search_demand_logs
    WHERE normalized_keyword = p_normalized_keyword;

    IF FOUND THEN
        -- Calculate new priority score
        -- If it's just a click, we might not increase search_count, but we will increase clicks.
        IF p_is_click THEN
            UPDATE public.search_demand_logs
            SET clicks = clicks + 1,
                last_seen_at = now()
            WHERE normalized_keyword = p_normalized_keyword;
        ELSE
            -- (search_count * 2) + recency bonus + (need_asset ? no_asset_bonus : 0)
            v_priority_score := ((v_search_count + 1) * 2) + p_recency_bonus + CASE WHEN p_need_asset THEN p_no_asset_bonus ELSE 0 END;

            UPDATE public.search_demand_logs
            SET search_count = search_count + 1,
                last_seen_at = now(),
                need_asset = CASE WHEN p_need_asset THEN true ELSE need_asset END,
                category = COALESCE(p_category, category),
                priority_score = v_priority_score
            WHERE normalized_keyword = p_normalized_keyword;
        END IF;
    ELSE
        -- Insert new
        IF p_is_click THEN
            v_priority_score := (1 * 2);
            INSERT INTO public.search_demand_logs (
                keyword,
                normalized_keyword,
                search_count,
                clicks,
                category,
                first_seen_at,
                last_seen_at,
                need_asset,
                priority_score
            ) VALUES (
                p_keyword,
                p_normalized_keyword,
                1,
                1,
                p_category,
                now(),
                now(),
                p_need_asset,
                v_priority_score
            );
        ELSE
            v_priority_score := (1 * 2) + p_recency_bonus + CASE WHEN p_need_asset THEN p_no_asset_bonus ELSE 0 END;
            
            INSERT INTO public.search_demand_logs (
                keyword,
                normalized_keyword,
                search_count,
                clicks,
                category,
                first_seen_at,
                last_seen_at,
                need_asset,
                priority_score
            ) VALUES (
                p_keyword,
                p_normalized_keyword,
                1,
                0,
                p_category,
                now(),
                now(),
                p_need_asset,
                v_priority_score
            );
        END IF;
    END IF;
END;
$$;
