create table if not exists public.analytics_sessions (
  id uuid primary key,
  visitor_hash text not null check (char_length(visitor_hash) = 64),
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  landing_path text not null default '/',
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  device_type text not null default 'desktop' check (device_type in ('mobile', 'tablet', 'desktop'))
);

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.analytics_sessions(id) on delete cascade,
  event_name text not null check (event_name in (
    'page_view',
    'compatibility_started',
    'compatibility_step_completed',
    'compatibility_completed',
    'invitation_started',
    'invitation_step_completed',
    'invitation_media_ready',
    'invitation_submitted',
    'video_call_started'
  )),
  path text not null default '/',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_sessions_started_idx on public.analytics_sessions (started_at desc);
create index if not exists analytics_sessions_source_idx on public.analytics_sessions (utm_source, started_at desc);
create index if not exists analytics_sessions_visitor_idx on public.analytics_sessions (visitor_hash, started_at desc);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_name_created_idx on public.analytics_events (event_name, created_at desc);
create index if not exists analytics_events_session_created_idx on public.analytics_events (session_id, created_at desc);

alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;

revoke all on public.analytics_sessions, public.analytics_events from anon, authenticated;
revoke all on sequence public.analytics_events_id_seq from anon, authenticated;
grant select, insert, update, delete on public.analytics_sessions, public.analytics_events to service_role;
grant usage, select on sequence public.analytics_events_id_seq to service_role;

comment on table public.analytics_sessions is 'Consented, pseudonymous first-party analytics sessions.';
comment on table public.analytics_events is 'Allowlisted product-funnel events without personal form data.';
