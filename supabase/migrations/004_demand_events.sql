-- Create demand_events table for Demand Loop Engine
CREATE TABLE IF NOT EXISTS public.demand_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (event_type IN ('search', 'zero_result', 'asset_click', 'download', 'detail_view', 'dwell_time')),
    query TEXT,
    normalized_query TEXT,
    asset_id TEXT,
    category TEXT,
    session_hash TEXT,
    source_page TEXT,
    referrer TEXT,
    user_agent_hash TEXT,
    country TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for fast analytics queries
CREATE INDEX IF NOT EXISTS idx_demand_events_event_type ON public.demand_events (event_type);
CREATE INDEX IF NOT EXISTS idx_demand_events_normalized_query ON public.demand_events (normalized_query);
CREATE INDEX IF NOT EXISTS idx_demand_events_asset_id ON public.demand_events (asset_id);
CREATE INDEX IF NOT EXISTS idx_demand_events_created_at ON public.demand_events (created_at DESC);

-- Enable RLS
ALTER TABLE public.demand_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (users interacting with the site)
CREATE POLICY "Allow public insert to demand_events" ON public.demand_events
    FOR INSERT 
    TO public
    WITH CHECK (true);
