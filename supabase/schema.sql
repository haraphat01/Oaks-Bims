-- =========================================================
-- Oaks & Bims Nigeria Limited — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor
-- =========================================================

-- ---------- enums ----------
create type listing_status   as enum ('draft', 'available', 'under_offer', 'sold', 'rented');
create type listing_purpose  as enum ('sale', 'rent', 'shortlet');
create type property_type    as enum (
  'detached_house', 'semi_detached', 'terraced', 'duplex',
  'bungalow', 'apartment', 'flat', 'penthouse', 'studio',
  'land', 'commercial', 'office', 'shop', 'warehouse', 'mixed_use'
);
create type user_role        as enum ('customer', 'admin');

-- ---------- profiles (one row per auth user) ----------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  phone         text,
  country       text,                -- NG, US, UK, CA, etc.
  role          user_role not null default 'customer',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- automatically create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- properties ----------
create table public.properties (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  description     text not null,
  price_ngn       numeric(14,2) not null check (price_ngn >= 0),
  purpose         listing_purpose not null default 'sale',
  status          listing_status  not null default 'available',
  property_type   property_type   not null,
  state           text not null,                  -- one of NIGERIA_STATES
  city            text not null,
  address         text,
  bedrooms        smallint default 0,
  bathrooms       smallint default 0,
  toilets         smallint default 0,
  area_sqm        numeric(10,2),                  -- floor area
  plot_size_sqm   numeric(10,2),                  -- land size
  parking_spaces  smallint default 0,
  year_built      smallint,
  features        text[] default '{}',            -- ["pool","cctv","fitted kitchen"]
  amenities       text[] default '{}',
  image_urls      text[] default '{}',            -- public URLs from Storage
  cover_image_url text,
  is_featured     boolean not null default false,
  views_count     integer not null default 0,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  published_at    timestamptz
);

create index properties_state_idx       on public.properties (state);
create index properties_status_idx      on public.properties (status);
create index properties_purpose_idx     on public.properties (purpose);
create index properties_property_type_idx on public.properties (property_type);
create index properties_price_idx       on public.properties (price_ngn);
create index properties_featured_idx    on public.properties (is_featured) where is_featured;
create index properties_search_idx      on public.properties
  using gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(city,'') || ' ' || coalesce(state,'')));

-- ---------- favorites ----------
create table public.favorites (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, property_id)
);

-- ---------- inquiries ----------
create table public.inquiries (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid references public.properties(id) on delete set null,
  user_id       uuid references public.profiles(id)   on delete set null,
  full_name     text not null,
  email         text not null,
  phone         text,
  country       text,
  message       text not null,
  is_handled    boolean not null default false,
  created_at    timestamptz not null default now()
);
create index inquiries_property_id_idx on public.inquiries (property_id);
create index inquiries_handled_idx     on public.inquiries (is_handled);

-- ---------- newsletter_subscribers ----------
create table public.newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  full_name     text,
  is_confirmed  boolean not null default false,
  confirm_token uuid not null default gen_random_uuid(),
  unsub_token   uuid not null default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  confirmed_at  timestamptz
);

-- ---------- updated_at trigger helper ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

-- =========================================================
-- Row-Level Security
-- =========================================================
alter table public.profiles               enable row level security;
alter table public.properties             enable row level security;
alter table public.favorites              enable row level security;
alter table public.inquiries              enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- ---------- profiles policies ----------
create policy "profiles: read own"
  on public.profiles for select
  using ( id = auth.uid() or public.is_admin() );

create policy "profiles: update own"
  on public.profiles for update
  using ( id = auth.uid() )
  with check ( id = auth.uid() and role = 'customer' );  -- prevent self-promotion

create policy "profiles: admin all"
  on public.profiles for all
  using ( public.is_admin() )
  with check ( public.is_admin() );

-- ---------- properties policies ----------
-- public can read available/under_offer/sold/rented (anything but draft)
create policy "properties: public read published"
  on public.properties for select
  using ( status <> 'draft' );

-- admins can do everything
create policy "properties: admin all"
  on public.properties for all
  using ( public.is_admin() )
  with check ( public.is_admin() );

-- ---------- favorites policies ----------
create policy "favorites: own"
  on public.favorites for all
  using ( user_id = auth.uid() )
  with check ( user_id = auth.uid() );

-- ---------- inquiries policies ----------
-- anyone (logged-in or not) can submit an inquiry
create policy "inquiries: anyone insert"
  on public.inquiries for insert
  with check ( true );

-- a logged-in user can read their own inquiries
create policy "inquiries: own read"
  on public.inquiries for select
  using ( user_id = auth.uid() );

-- admins can do everything
create policy "inquiries: admin all"
  on public.inquiries for all
  using ( public.is_admin() )
  with check ( public.is_admin() );

-- ---------- newsletter policies ----------
create policy "newsletter: anyone insert"
  on public.newsletter_subscribers for insert
  with check ( true );

create policy "newsletter: admin all"
  on public.newsletter_subscribers for all
  using ( public.is_admin() )
  with check ( public.is_admin() );

-- =========================================================
-- Storage bucket for property images (run after schema)
-- =========================================================
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- public read
create policy "property-images: public read"
  on storage.objects for select
  using ( bucket_id = 'property-images' );

-- only admins can write
create policy "property-images: admin write"
  on storage.objects for insert
  with check ( bucket_id = 'property-images' and public.is_admin() );

create policy "property-images: admin update"
  on storage.objects for update
  using ( bucket_id = 'property-images' and public.is_admin() );

create policy "property-images: admin delete"
  on storage.objects for delete
  using ( bucket_id = 'property-images' and public.is_admin() );
