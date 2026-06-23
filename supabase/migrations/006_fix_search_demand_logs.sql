-- 1. need_asset カラムの追加 (既存の generated カラムは残すか不要なら削除)
ALTER TABLE public.search_demand_logs ADD COLUMN IF NOT EXISTS need_asset BOOLEAN DEFAULT false;

-- 2. Phase 3 向けの RPC を再作成
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

-- 3. PostgREST のスキーマキャッシュを強制リロード
NOTIFY pgrst, 'reload schema';
