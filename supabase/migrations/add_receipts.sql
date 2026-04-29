-- =========================================================
-- Receipts — payment acknowledgement documents
-- Run in Supabase Dashboard → SQL Editor
-- =========================================================

-- Auto-incrementing receipt number sequence
create sequence if not exists public.receipt_seq start 1;

create table public.receipts (
  id              uuid primary key default gen_random_uuid(),
  receipt_number  text unique not null
                  default ('OAB-' || lpad(nextval('public.receipt_seq')::text, 4, '0')),
  inquiry_id      uuid references public.inquiries(id) on delete set null,
  property_id     uuid references public.properties(id) on delete set null,
  user_id         uuid references public.profiles(id) on delete set null,
  buyer_name      text not null,
  buyer_email     text not null,
  buyer_phone     text,
  buyer_address   text,
  amount_ngn      numeric(14,2) not null check (amount_ngn > 0),
  payment_method  text not null default 'bank_transfer',
  payment_ref     text,
  notes           text,
  status          text not null default 'paid',
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index receipts_user_id_idx    on public.receipts (user_id);
create index receipts_inquiry_id_idx on public.receipts (inquiry_id);
create index receipts_property_id_idx on public.receipts (property_id);

create trigger receipts_set_updated_at
  before update on public.receipts
  for each row execute function public.set_updated_at();

-- RLS
alter table public.receipts enable row level security;

-- Customers can read their own receipts
create policy "receipts: own read"
  on public.receipts for select
  using ( user_id = auth.uid() );

-- Admins can do everything
create policy "receipts: admin all"
  on public.receipts for all
  using ( public.is_admin() )
  with check ( public.is_admin() );
