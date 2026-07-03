-- Phase 13: Autonomous Company Edition Additions
-- Additive only. No drop/delete.

-- 1. search_console_metrics
CREATE TABLE IF NOT EXISTS search_console_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    indexed_count INTEGER DEFAULT 0,
    not_indexed_count INTEGER DEFAULT 0,
    crawled_count INTEGER DEFAULT 0,
    discovered_count INTEGER DEFAULT 0,
    avg_ctr FLOAT DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    avg_position FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. system_health_scores
CREATE TABLE IF NOT EXISTS system_health_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    overall FLOAT DEFAULT 100,
    database FLOAT DEFAULT 100,
    api FLOAT DEFAULT 100,
    cron FLOAT DEFAULT 100,
    gemini FLOAT DEFAULT 100,
    google FLOAT DEFAULT 100,
    pinterest FLOAT DEFAULT 100,
    revenue FLOAT DEFAULT 100,
    queue FLOAT DEFAULT 100,
    qa FLOAT DEFAULT 100,
    system FLOAT DEFAULT 100,
    ai FLOAT DEFAULT 100,
    alerts FLOAT DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. self_repair_logs
CREATE TABLE IF NOT EXISTS self_repair_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component TEXT NOT NULL,
    issue_detected TEXT,
    diagnosis TEXT,
    proposed_fix TEXT,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE search_console_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_repair_logs ENABLE ROW LEVEL SECURITY;

-- Add basic policies (allow service role full access)
CREATE POLICY "Allow service role full access on search_console_metrics" 
ON search_console_metrics FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on system_health_scores" 
ON system_health_scores FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on self_repair_logs" 
ON self_repair_logs FOR ALL USING (true) WITH CHECK (true);
