-- 019_asset_recovery_phase2.sql
-- DBガードレールおよび排他制御テーブルの追加 (DROP不使用, Additive Only)

-- 1. Slug更新許可フラグの追加 (既存に影響しない)
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS allow_slug_update BOOLEAN DEFAULT FALSE;

-- 2. 監査ログテーブルの作成
CREATE TABLE IF NOT EXISTS public.asset_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_slug VARCHAR(255),
    new_slug VARCHAR(255),
    old_seo_title VARCHAR(255),
    new_seo_title VARCHAR(255),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    changed_by VARCHAR(255) DEFAULT 'system'
);

-- 3. 排他制御用テーブルの作成
CREATE TABLE IF NOT EXISTS public.generation_run_locks (
    id INT PRIMARY KEY,
    is_locked BOOLEAN DEFAULT FALSE,
    locked_at TIMESTAMPTZ,
    locked_by VARCHAR(255)
);

-- ロック用初期データ (ID: 1のみ使用)
INSERT INTO public.generation_run_locks (id, is_locked)
VALUES (1, FALSE)
ON CONFLICT (id) DO NOTHING;

-- 4. トリガー関数: Slug保護とNull防止
CREATE OR REPLACE FUNCTION public.protect_approved_assets()
RETURNS trigger AS $$
BEGIN
    -- 監査ログの記録
    INSERT INTO public.asset_audit_logs (
        asset_id, action, old_slug, new_slug, old_seo_title, new_seo_title
    ) VALUES (
        OLD.id, 'UPDATE', OLD.slug, NEW.slug, OLD.seo_title, NEW.seo_title
    );

    -- Slugの保護 (approvedの場合、allow_slug_update=true以外はエラー)
    IF OLD.review_status = 'approved' AND OLD.slug IS DISTINCT FROM NEW.slug THEN
        IF NEW.allow_slug_update = TRUE THEN
            -- 許可された場合はフラグを落として通過
            NEW.allow_slug_update = FALSE;
        ELSE
            RAISE EXCEPTION 'Slug immutable error: Cannot modify slug of approved asset without allow_slug_update=true';
        END IF;
    END IF;

    -- SEOメタデータの保護 (既存がNullでないのに新しくNullにしようとした場合エラー)
    IF OLD.seo_title IS NOT NULL AND NEW.seo_title IS NULL THEN
        RAISE EXCEPTION 'SEO protection error: Cannot nullify existing seo_title';
    END IF;

    IF OLD.alt_text IS NOT NULL AND NEW.alt_text IS NULL THEN
        RAISE EXCEPTION 'SEO protection error: Cannot nullify existing alt_text';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. トリガーの安全な適用
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trg_protect_approved_assets'
    ) THEN
        CREATE TRIGGER trg_protect_approved_assets
        BEFORE UPDATE ON public.assets
        FOR EACH ROW
        EXECUTE FUNCTION public.protect_approved_assets();
    END IF;
END
$$;

-- 6. ロック獲得/解放用RPC
CREATE OR REPLACE FUNCTION acquire_generation_lock(p_locked_by VARCHAR DEFAULT 'worker') RETURNS BOOLEAN AS $$
DECLARE
    v_locked BOOLEAN;
BEGIN
    UPDATE public.generation_run_locks 
    SET is_locked = TRUE, locked_at = NOW(), locked_by = p_locked_by
    WHERE id = 1 
      AND (
          is_locked = FALSE 
          OR (is_locked = TRUE AND locked_at < NOW() - INTERVAL '10 minutes')
      )
    RETURNING TRUE INTO v_locked;
    
    RETURN COALESCE(v_locked, FALSE);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION release_generation_lock(p_locked_by VARCHAR DEFAULT 'worker') RETURNS VOID AS $$
BEGIN
    UPDATE public.generation_run_locks 
    SET is_locked = FALSE, locked_at = NULL, locked_by = NULL
    WHERE id = 1 AND is_locked = TRUE AND locked_by = p_locked_by;
END;
$$ LANGUAGE plpgsql;
