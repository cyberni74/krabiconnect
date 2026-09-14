-- KrabiShare community schema
-- profiles maps 1:1 with Better Auth `user`.id (text). Neighbor seed rows
-- use synthetic ids that are not auth accounts.

create table if not exists profiles (
  id text primary key,
  name text not null,
  phone text,
  location text,
  avatar_url text,
  preferred_language text not null default 'en',
  is_verified boolean not null default false,
  bio_th text,
  bio_en text,
  created_at timestamptz not null default now()
);

create table if not exists items (
  id text primary key,
  user_id text not null,
  title_th text not null,
  title_en text not null,
  description_th text not null default '',
  description_en text not null default '',
  category text not null,
  type text not null,
  price_per_day integer,
  deposit integer,
  status text not null default 'available',
  images text not null default '[]',
  district text not null,
  lat double precision,
  lng double precision,
  condition text,
  source_language text not null default 'en',
  created_at timestamptz not null default now()
);

create table if not exists services (
  id text primary key,
  user_id text not null,
  title_th text not null,
  title_en text not null,
  description_th text not null default '',
  description_en text not null default '',
  category text not null,
  offer_type text not null default 'offer',
  pricing_type text not null,
  rate_thb integer,
  location_radius integer,
  status text not null default 'active',
  images text not null default '[]',
  district text not null,
  lat double precision,
  lng double precision,
  available_times text,
  source_language text not null default 'en',
  created_at timestamptz not null default now()
);

create table if not exists bookings_and_rentals (
  id text primary key,
  requester_id text not null,
  provider_id text not null,
  item_id text,
  service_id text,
  conversation_id text,
  start_date date,
  end_date date,
  status text not null default 'pending',
  total_price integer,
  created_at timestamptz not null default now()
);

create table if not exists conversations (
  id text primary key,
  requester_id text not null,
  provider_id text not null,
  item_id text,
  service_id text,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id text primary key,
  conversation_id text not null,
  booking_id text,
  sender_id text not null,
  text_original text not null,
  text_translated text,
  original_language text not null,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id text primary key,
  reviewer_id text not null,
  target_user_id text not null,
  rating integer not null,
  comment_th text,
  comment_en text,
  source_language text not null default 'en',
  created_at timestamptz not null default now()
);

create index if not exists items_user_id_idx on items (user_id);
create index if not exists items_district_idx on items (district);
create index if not exists items_category_idx on items (category);
create index if not exists services_user_id_idx on services (user_id);
create index if not exists services_district_idx on services (district);
create index if not exists conversations_requester_idx on conversations (requester_id);
create index if not exists conversations_provider_idx on conversations (provider_id);
create index if not exists messages_conversation_idx on messages (conversation_id);
create index if not exists reviews_target_idx on reviews (target_user_id);
create index if not exists bookings_requester_idx on bookings_and_rentals (requester_id);
create index if not exists bookings_provider_idx on bookings_and_rentals (provider_id);
