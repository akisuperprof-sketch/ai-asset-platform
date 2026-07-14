-- 019_asset_recovery_phase2_rollback.sql

-- 1. トリガーの削除
DROP TRIGGER IF EXISTS trg_protect_approved_assets ON public.assets;

-- 2. トリガー関数の削除
DROP FUNCTION IF EXISTS public.protect_approved_assets();

-- 3. RPC関数の削除
DROP FUNCTION IF EXISTS release_generation_lock(VARCHAR);
DROP FUNCTION IF EXISTS release_generation_lock();
DROP FUNCTION IF EXISTS acquire_generation_lock(VARCHAR);
DROP FUNCTION IF EXISTS acquire_generation_lock();

-- 4. 排他制御用テーブルの削除
DROP TABLE IF EXISTS public.generation_run_locks;

-- 5. 監査ログテーブルの削除
DROP TABLE IF EXISTS public.asset_audit_logs;

-- 6. 追加したカラムの削除 (assetsテーブルへの影響を考慮して注意深く実行)
ALTER TABLE public.assets DROP COLUMN IF EXISTS allow_slug_update;
