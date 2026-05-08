-- TrackFlow TMS — Supabase Schema
-- Run in: Supabase Dashboard → SQL Editor → New Query

create extension if not exists "pgcrypto";

-- Companies
create table if not exists public.companies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  type       text not null check (type in ('broker','carrier','shipper')),
  mc_number  text,
  dot_number text,
  phone      text,
  email      text,
  city       text,
  state      text,
  created_at timestamptz default now()
);

-- User profiles
create table if not exists public.user_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id),
  role       text not null default 'dispatcher'
               check (role in ('admin','dispatcher','carrier','driver','customer')),
  full_name  text,
  phone      text,
  is_active  boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Customers
create table if not exists public.customers (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id),
  name       text not null,
  contact    text,
  email      text,
  phone      text,
  city       text,
  state      text,
  created_at timestamptz default now()
);

-- Carriers
create table if not exists public.carriers (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid references public.companies(id),
  name           text not null,
  mc_number      text,
  dot_number     text,
  contact        text,
  email          text,
  phone          text,
  insurance_exp  date,
  is_active      boolean default true,
  created_at     timestamptz default now()
);

-- Drivers
create table if not exists public.drivers (
  id             uuid primary key default gen_random_uuid(),
  carrier_id     uuid references public.carriers(id),
  full_name      text not null,
  phone          text,
  email          text,
  license_number text,
  is_active      boolean default true,
  created_at     timestamptz default now()
);

-- Loads
create table if not exists public.loads (
  id                   uuid primary key default gen_random_uuid(),
  load_number          text unique not null,
  company_id           uuid references public.companies(id),
  customer_id          uuid references public.customers(id),
  carrier_id           uuid references public.carriers(id),
  driver_id            uuid references public.drivers(id),
  dispatcher_id        uuid references public.user_profiles(id),
  pickup_name          text,
  pickup_address       text,
  pickup_city          text not null,
  pickup_state         text not null,
  pickup_zip           text,
  pickup_lat           double precision,
  pickup_lng           double precision,
  pickup_scheduled     timestamptz,
  pickup_actual        timestamptz,
  delivery_name        text,
  delivery_address     text,
  delivery_city        text not null,
  delivery_state       text not null,
  delivery_zip         text,
  delivery_lat         double precision,
  delivery_lng         double precision,
  delivery_scheduled   timestamptz,
  delivery_actual      timestamptz,
  commodity            text,
  weight_lbs           integer,
  pieces               integer,
  trailer_type         text,
  temperature          text,
  rate_usd             numeric(10,2),
  carrier_pay_usd      numeric(10,2),
  status               text not null default 'booked'
                         check (status in ('booked','dispatched','at_pickup','loaded',
                           'in_transit','at_delivery','delivered',
                           'pod_uploaded','completed','cancelled','exception')),
  tracking_token       uuid unique default gen_random_uuid(),
  eta                  timestamptz,
  risk_level           text default 'on_time'
                         check (risk_level in ('on_time','at_risk','late')),
  special_instructions text,
  dispatcher_notes     text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- Tracking sessions
create table if not exists public.tracking_sessions (
  id          uuid primary key default gen_random_uuid(),
  load_id     uuid references public.loads(id) on delete cascade,
  driver_id   uuid references public.drivers(id),
  consent_at  timestamptz,
  consent_ip  text,
  status      text not null default 'pending'
                check (status in ('pending','active','stopped','expired')),
  stopped_at  timestamptz,
  created_at  timestamptz default now()
);

-- Location pings
create table if not exists public.location_pings (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references public.tracking_sessions(id) on delete cascade,
  load_id     uuid references public.loads(id) on delete cascade,
  lat         double precision not null,
  lng         double precision not null,
  speed_mph   numeric(6,2),
  heading     integer,
  accuracy_m  numeric(8,2),
  city        text,
  state       text,
  created_at  timestamptz default now()
);

-- Load events
create table if not exists public.load_events (
  id         uuid primary key default gen_random_uuid(),
  load_id    uuid references public.loads(id) on delete cascade,
  event_type text not null,
  old_status text,
  new_status text,
  notes      text,
  actor_id   uuid references public.user_profiles(id),
  created_at timestamptz default now()
);

-- Documents
create table if not exists public.documents (
  id           uuid primary key default gen_random_uuid(),
  load_id      uuid references public.loads(id) on delete cascade,
  doc_type     text not null
                 check (doc_type in ('bol','pod','lumper','scale_ticket','photo','other')),
  file_name    text not null,
  file_url     text not null,
  file_size_kb integer,
  uploaded_by  uuid references public.user_profiles(id),
  created_at   timestamptz default now()
);

-- Notifications
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.user_profiles(id) on delete cascade,
  type       text not null check (type in (
               'load_status','tracking_accepted','tracking_lost',
               'geofence_entered','geofence_exited','pod_uploaded',
               'late_risk','exception','system')),
  title      text not null,
  message    text,
  load_id    uuid references public.loads(id),
  is_read    boolean default false,
  created_at timestamptz default now()
);

-- Geofences
create table if not exists public.geofences (
  id            uuid primary key default gen_random_uuid(),
  load_id       uuid references public.loads(id) on delete cascade,
  type          text not null check (type in ('pickup','delivery')),
  lat           double precision not null,
  lng           double precision not null,
  radius_m      integer not null default 500,
  triggered     boolean default false,
  triggered_at  timestamptz,
  created_at    timestamptz default now()
);

-- Indexes
create index if not exists idx_loads_status         on public.loads(status);
create index if not exists idx_loads_carrier        on public.loads(carrier_id);
create index if not exists idx_loads_tracking_token on public.loads(tracking_token);
create index if not exists idx_location_pings_load  on public.location_pings(load_id);
create index if not exists idx_notifications_user   on public.notifications(user_id, is_read);

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create or replace trigger set_loads_updated_at
  before update on public.loads
  for each row execute function public.handle_updated_at();

create or replace trigger set_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, full_name, role)
  values (new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'dispatcher'));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.companies          enable row level security;
alter table public.user_profiles      enable row level security;
alter table public.customers          enable row level security;
alter table public.carriers           enable row level security;
alter table public.drivers            enable row level security;
alter table public.loads              enable row level security;
alter table public.tracking_sessions  enable row level security;
alter table public.location_pings     enable row level security;
alter table public.load_events        enable row level security;
alter table public.documents          enable row level security;
alter table public.notifications      enable row level security;
alter table public.geofences          enable row level security;

create or replace function public.my_role()
returns text language sql stable security definer as $$
  select role from public.user_profiles where id = auth.uid(); $$;

create policy "profiles: own" on public.user_profiles
  for select using (id = auth.uid() or public.my_role() = 'admin');
create policy "profiles: update own" on public.user_profiles
  for update using (id = auth.uid());

create policy "loads: dispatchers read" on public.loads
  for select using (public.my_role() in ('admin','dispatcher','carrier'));
create policy "loads: dispatchers write" on public.loads
  for all using (public.my_role() in ('admin','dispatcher'));

create policy "location_pings: read" on public.location_pings
  for select using (public.my_role() in ('admin','dispatcher','carrier'));
create policy "location_pings: insert" on public.location_pings
  for insert with check (true);

create policy "tracking_sessions: insert" on public.tracking_sessions
  for insert with check (true);
create policy "tracking_sessions: read" on public.tracking_sessions
  for select using (public.my_role() in ('admin','dispatcher','carrier'));

create policy "notifications: own" on public.notifications
  for all using (user_id = auth.uid());

create policy "documents: read" on public.documents
  for select using (auth.role() = 'authenticated');
create policy "documents: insert" on public.documents
  for insert with check (auth.role() = 'authenticated');

create policy "customers: dispatchers" on public.customers
  for all using (public.my_role() in ('admin','dispatcher'));
create policy "carriers: dispatchers" on public.carriers
  for all using (public.my_role() in ('admin','dispatcher','carrier'));
create policy "drivers: dispatchers" on public.drivers
  for all using (public.my_role() in ('admin','dispatcher','carrier'));
create policy "geofences: dispatchers" on public.geofences
  for all using (public.my_role() in ('admin','dispatcher'));

-- Enable Realtime
alter publication supabase_realtime add table public.location_pings;
alter publication supabase_realtime add table public.loads;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.tracking_sessions;
