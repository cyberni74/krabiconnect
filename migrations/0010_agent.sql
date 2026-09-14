alter table services add column if not exists source_url text;

create table if not exists agent_tokens (
  id text primary key,
  token_hash text not null unique,
  label text not null default 'Grok agent',
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create unique index if not exists services_source_url_idx
  on services (source_url)
  where source_url is not null;
