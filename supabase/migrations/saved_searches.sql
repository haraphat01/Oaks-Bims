-- =========================================================
-- Saved property-search alerts
-- Run in Supabase Dashboard → SQL Editor
-- =========================================================

create table public.saved_searches (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  label             text,
  filters           jsonb not null default '{}',
  email             text not null,
  last_notified_at  timestamptz,
  created_at        timestamptz not null default now()
);

create index saved_searches_user_id_idx on public.saved_searches (user_id);

alter table public.saved_searches enable row level security;

create policy "saved_searches: own"
  on public.saved_searches for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "saved_searches: admin all"
  on public.saved_searches for all
  using (public.is_admin())
  with check (public.is_admin());
