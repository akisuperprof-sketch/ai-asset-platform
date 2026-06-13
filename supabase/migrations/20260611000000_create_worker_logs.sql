create table if not exists public.worker_logs (
    id uuid primary key default gen_random_uuid(),
    run_id text not null,
    started_at timestamptz,
    finished_at timestamptz,
    status text,
    target_count int,
    batch_size int,
    sleep_seconds int,
    processed_count int,
    approved_count int,
    rejected_count int,
    retry_pending_count int,
    rate_limit_count int,
    timeout_count int,
    real_assets_total int,
    approved_assets_total int,
    duration_seconds int,
    error_summary jsonb,
    approved_slugs jsonb,
    rejected_slugs jsonb,
    raw_log jsonb,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.worker_logs enable row level security;

-- Only service_role can perform actions on this table
create policy "Allow service_role full access" on public.worker_logs
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');
