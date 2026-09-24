create table if not exists public.content_records (
  kind text not null,
  id text not null,
  status text not null,
  slug text,
  record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (kind, id)
);
create index if not exists content_records_listing_idx on public.content_records (kind, status, updated_at desc);
create unique index if not exists content_records_slug_idx on public.content_records (kind, slug) where slug is not null and status <> 'removed';

create table if not exists public.declaration_likes (
  slug text not null,
  visitor_id text not null,
  created_at timestamptz not null default now(),
  primary key (slug, visitor_id)
);
create table if not exists public.push_subscriptions (
  endpoint_hash text primary key,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists public.rate_limits (
  scope text not null,
  key_hash text not null,
  count integer not null,
  started_at bigint not null,
  primary key (scope, key_hash)
);
alter table public.content_records enable row level security;
alter table public.declaration_likes enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.rate_limits enable row level security;
revoke all on public.content_records, public.declaration_likes, public.push_subscriptions, public.rate_limits from anon, authenticated;

create or replace function public.consume_rate_limit(p_scope text, p_key_hash text, p_max integer, p_window_ms bigint, p_now bigint)
returns table(allowed boolean, retry_after integer)
language plpgsql security definer set search_path = public as $$
declare current_count integer; current_started bigint;
begin
  insert into public.rate_limits(scope,key_hash,count,started_at)
  values(p_scope,p_key_hash,1,p_now)
  on conflict(scope,key_hash) do update set
    count=case when p_now-public.rate_limits.started_at>=p_window_ms then 1 else public.rate_limits.count+1 end,
    started_at=case when p_now-public.rate_limits.started_at>=p_window_ms then p_now else public.rate_limits.started_at end
  returning count,started_at into current_count,current_started;
  allowed := current_count <= p_max;
  retry_after := case when allowed then 0 else greatest(1,ceil((current_started+p_window_ms-p_now)/1000.0)::integer) end;
  return next;
end; $$;
revoke all on function public.consume_rate_limit(text,text,integer,bigint,bigint) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text,text,integer,bigint,bigint) to service_role;
