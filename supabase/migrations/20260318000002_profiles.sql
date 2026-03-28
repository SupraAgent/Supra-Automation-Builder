-- Profiles table for user data synced from auth provider
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  github_username text,
  display_name    text,
  avatar_url      text,
  role            text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Index
create index if not exists idx_profiles_role on public.profiles (role);

-- Auto-update updated_at
create or replace function public.update_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_profiles_updated_at();

-- RLS
alter table public.profiles enable row level security;

-- All authenticated users can read all profiles
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- Users can update their own profile (except role)
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Users can insert their own profile
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- Promote the first user to owner automatically
create or replace function public.auto_assign_owner()
returns trigger as $$
begin
  if (select count(*) from public.profiles) = 0 then
    new.role := 'owner';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger profiles_auto_owner
  before insert on public.profiles
  for each row execute function public.auto_assign_owner();
