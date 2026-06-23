create table if not exists public.revenue_events (
    id uuid default gen_random_uuid() primary key,
    event_type text not null,
    asset_id uuid references public.assets(id) on delete set null,
    page_path text not null,
    ad_provider text,
    user_agent_hash text,
    ip_hash text,
    referrer text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for analytics
create index if not exists idx_revenue_events_type on public.revenue_events(event_type);
create index if not exists idx_revenue_events_created_at on public.revenue_events(created_at);
create index if not exists idx_revenue_events_asset on public.revenue_events(asset_id);

-- RLS
alter table public.revenue_events enable row level security;

-- Only service role can read/insert. No public access via PostgREST to prevent abuse.
-- We will use a trusted RPC function instead to insert events.
create policy "Allow service_role full access on revenue_events"
    on public.revenue_events
    for all
    using ( auth.role() = 'service_role' )
    with check ( auth.role() = 'service_role' );

-- RPC for inserting tracked events
create or replace function public.track_revenue_event(
    p_event_type text,
    p_asset_id uuid,
    p_page_path text,
    p_ad_provider text,
    p_user_agent_hash text,
    p_ip_hash text,
    p_referrer text
)
returns void as $$
begin
    insert into public.revenue_events (
        event_type,
        asset_id,
        page_path,
        ad_provider,
        user_agent_hash,
        ip_hash,
        referrer
    ) values (
        p_event_type,
        p_asset_id,
        p_page_path,
        p_ad_provider,
        p_user_agent_hash,
        p_ip_hash,
        p_referrer
    );
end;
$$ language plpgsql security definer;

-- RPC to get revenue stats
create or replace function public.get_revenue_stats_summary()
returns json as $$
declare
    today_start timestamp with time zone := date_trunc('day', timezone('Asia/Tokyo', now()) at time zone 'UTC');
    result json;
begin
    select json_build_object(
        'today_pv', count(*) filter (where event_type = 'page_view' and created_at >= today_start),
        'today_dl', count(*) filter (where event_type = 'download_complete' and created_at >= today_start),
        'today_ad_impression', count(*) filter (where event_type = 'ad_impression' and created_at >= today_start),
        'today_admax_render', count(*) filter (where event_type = 'admax_render' and created_at >= today_start),
        'today_popads_trigger', count(*) filter (where event_type = 'popads_trigger' and created_at >= today_start),
        'total_assets', (select count(*) from public.assets where review_status = 'approved')
    ) into result
    from public.revenue_events;
    
    return result;
end;
$$ language plpgsql security definer;
