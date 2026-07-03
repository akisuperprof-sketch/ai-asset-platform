-- Create Keyword Rankings Table
CREATE TABLE IF NOT EXISTS public.keyword_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword TEXT NOT NULL,
    position INTEGER,
    url TEXT,
    search_volume INTEGER DEFAULT 0,
    tracked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexes for quick retrieval and graphing
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_keyword ON public.keyword_rankings(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_tracked_at ON public.keyword_rankings(tracked_at);

-- Row Level Security (RLS)
ALTER TABLE public.keyword_rankings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read (if needed for dashboard)
CREATE POLICY "Allow public read access to keyword_rankings" 
ON public.keyword_rankings FOR SELECT 
TO authenticated, anon 
USING (true);

-- Allow service role to insert
CREATE POLICY "Allow service role insert to keyword_rankings" 
ON public.keyword_rankings FOR INSERT 
TO service_role 
WITH CHECK (true);
