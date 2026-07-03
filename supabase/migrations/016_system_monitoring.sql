-- ============================================================================
-- Migration: 016_system_monitoring.sql
-- Description: System Alerts for AI Monitoring (Phase 12-D)
-- Rule: Additive Only
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.system_alerts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    component text NOT NULL, -- e.g., 'cron_growth_engine', 'qa_system', 'index_queue'
    message text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_resolved boolean DEFAULT false,
    
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

-- Add policies safely using IF NOT EXISTS logic
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'system_alerts' AND policyname = 'Enable all access for service role'
    ) THEN
        CREATE POLICY "Enable all access for service role"
            ON public.system_alerts FOR ALL
            USING (true) WITH CHECK (true);
    END IF;
END $$;

-- PostgREST Schema Cache reload trigger trick
NOTIFY pgrst, 'reload schema';
