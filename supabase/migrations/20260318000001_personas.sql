-- Persona templates for agent skill/role definitions
-- Standalone migration for Persona Builder

create table if not exists public.personas (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  role            text not null,
  system_prompt   text not null,
  capabilities    text[] not null default '{}',
  output_format   text,
  review_focus    text[] not null default '{}',
  scoring_weights jsonb,
  icon            text,
  created_by      uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Indexes
create index if not exists idx_personas_created_at on public.personas (created_at desc);
create index if not exists idx_personas_created_by on public.personas (created_by);

-- Auto-update updated_at
create or replace function public.update_personas_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger personas_updated_at
  before update on public.personas
  for each row execute function public.update_personas_updated_at();

-- RLS
alter table public.personas enable row level security;

-- All authenticated users can read all personas
create policy "personas_select_authenticated"
  on public.personas for select
  to authenticated
  using (true);

-- Users can insert their own personas
create policy "personas_insert_own"
  on public.personas for insert
  to authenticated
  with check (created_by = auth.uid());

-- Users can update their own personas
create policy "personas_update_own"
  on public.personas for update
  to authenticated
  using (created_by = auth.uid());

-- Users can delete their own personas
create policy "personas_delete_own"
  on public.personas for delete
  to authenticated
  using (created_by = auth.uid());
