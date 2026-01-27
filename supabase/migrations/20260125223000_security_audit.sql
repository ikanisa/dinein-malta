-- Create security audit log table
create table if not exists public.security_audit_log (
    id uuid not null default gen_random_uuid(),
    event_type text not null, -- 'create_order', 'ring_bell'
    session_hash text not null, -- Anonymized session ID
    venue_id uuid not null references public.venues(id),
    status text not null, -- 'SUCCESS', 'BLOCKED', 'INVALID'
    reason text,
    ip_address text,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default now(),
    constraint security_audit_log_pkey primary key (id)
);

-- Protect audit log: Only service role can insert (via Edge Functions), nobody can update/delete
alter table public.security_audit_log enable row level security;

create policy "Service role can insert audit logs"
    on public.security_audit_log
    for insert
    to service_role
    with check (true);

create policy "Admins can view audit logs"
    on public.security_audit_log
    for select
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

-- Create simple rate limit table (if Redis is not available)
create table if not exists public.rate_limits (
    key text not null,
    points int not null default 1,
    expire_at timestamptz not null,
    constraint rate_limits_pkey primary key (key)
);

-- Allow service role to manage rate limits
alter table public.rate_limits enable row level security;

create policy "Service role manages rate limits"
    on public.rate_limits
    for all
    to service_role
    using (true)
    with check (true);

-- Index for cleanup
create index if not exists idx_rate_limits_expire_at on public.rate_limits(expire_at);
