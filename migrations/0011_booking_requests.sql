-- Krabi Secret Islands: booking requests submitted from the booking wizard.
create table if not exists booking_requests (
  id text primary key,
  ref text not null unique,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lang text not null,
  channel text not null,
  tour_id text,
  tour_title text not null,
  tour_date text,
  slot text,
  guests integer not null,
  kids integer not null default 0,
  total_thb integer not null,
  name text not null,
  email text,
  phone text,
  hotel text,
  occasion text,
  wishes text,
  draft jsonb not null,
  message text not null,
  ip_hash text,
  admin_note text
);

create index if not exists booking_requests_created_idx on booking_requests (created_at desc);
create index if not exists booking_requests_ip_idx on booking_requests (ip_hash, created_at desc);
