create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon, authenticated;

insert into public.app_settings (key, value)
values (
  'coffee_schedule',
  '{"enabled":false,"days":[1,2,3,4,5],"start":"18:00","end":"20:00","duration":30,"blockedDates":[]}'::jsonb
)
on conflict (key) do nothing;
