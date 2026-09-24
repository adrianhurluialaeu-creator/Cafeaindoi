create extension if not exists pgcrypto;

create table if not exists public.conversations (
  id uuid primary key,
  last_activity_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender text not null check (sender in ('adrian', 'ea')),
  body text not null check (char_length(body) between 1 and 2000),
  kind text not null default 'text' check (kind in ('text', 'sticker', 'question', 'declaration', 'challenge')),
  created_at timestamptz not null default now()
);

create index if not exists conversation_messages_order_idx on public.conversation_messages (conversation_id, created_at desc);

create table if not exists public.conversation_reactions (
  message_id uuid not null references public.conversation_messages(id) on delete cascade,
  sender text not null check (sender in ('adrian', 'ea')),
  emoji text not null check (emoji in ('❤️', '😂', '🥰', '👍', '😮', '😔')),
  created_at timestamptz not null default now(),
  primary key (message_id, sender)
);

create table if not exists public.coffee_meetings (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null unique references public.conversations(id) on delete cascade,
  proposer text not null check (proposer in ('adrian', 'ea')),
  starts_at timestamptz not null,
  planned_minutes integer not null check (planned_minutes in (15, 30, 60, 90)),
  status text not null default 'propusa' check (status in ('propusa', 'acceptata', 'refuzata', 'anulata')),
  room_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.conversation_reactions enable row level security;
alter table public.coffee_meetings enable row level security;
revoke all on public.conversations, public.conversation_messages, public.conversation_reactions, public.coffee_meetings from anon, authenticated;

create or replace function public.purge_expired_conversations()
returns integer language plpgsql security definer set search_path = public as $$
declare affected integer;
begin
  with expired as (
    select id from public.conversations where expires_at is not null and expires_at <= now() for update
  ), deleted as (
    delete from public.conversation_messages m using expired e where m.conversation_id = e.id returning m.id
  ) select count(*) into affected from deleted;
  update public.conversations set last_activity_at = null, expires_at = null, updated_at = now()
  where expires_at is not null and expires_at <= now();
  return affected;
end;
$$;
revoke all on function public.purge_expired_conversations() from public, anon, authenticated;
grant execute on function public.purge_expired_conversations() to service_role;
