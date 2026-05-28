-- 003_generation_jobs.sql

CREATE TYPE generation_status AS ENUM (
  'queued',
  'generating',
  'generated',
  'qa_passed',
  'qa_failed',
  'failed',
  'imported'
);

CREATE TABLE IF NOT EXISTS public.generation_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword text NOT NULL,
  category text NOT NULL,
  prompt text,
  negative_prompt text,
  provider text NOT NULL DEFAULT 'DRY_RUN',
  status generation_status NOT NULL DEFAULT 'queued',
  asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  image_url text,
  qa_score numeric,
  qa_result jsonb,
  error_message text,
  retry_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.generation_jobs FOR SELECT USING (true);
CREATE POLICY "Enable all access for service role" ON public.generation_jobs FOR ALL USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER handle_generation_jobs_updated_at
  BEFORE UPDATE ON public.generation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime (updated_at);
