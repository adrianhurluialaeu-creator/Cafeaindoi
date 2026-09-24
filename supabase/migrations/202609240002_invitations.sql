create table if not exists public.invitations (
  id uuid primary key,
  record jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invitations_created_at_idx on public.invitations (created_at desc);

create table if not exists public.portal_accounts (
  invitation_id uuid primary key references public.invitations(id) on delete cascade,
  email text not null,
  activation_hash text,
  activation_expires_at timestamptz,
  password_salt text,
  password_hash text,
  status text not null check (status in ('invited', 'active', 'disabled')),
  created_at timestamptz not null default now(),
  activated_at timestamptz
);

alter table public.invitations enable row level security;
alter table public.portal_accounts enable row level security;
revoke all on public.invitations, public.portal_accounts from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invitation-photos',
  'invitation-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'video/webm', 'video/mp4']
)
on conflict (id) do nothing;
