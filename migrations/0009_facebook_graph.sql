alter table services add column if not exists facebook_id text;
alter table services add column if not exists facebook_name text;
alter table services add column if not exists facebook_photo text;
alter table profiles add column if not exists facebook_id text;
alter table profiles add column if not exists facebook_name text;
alter table profiles add column if not exists facebook_photo text;
