delete from messages;
delete from bookings_and_rentals;
delete from conversations;
delete from reviews;
delete from items;
delete from services;
delete from profiles where id like 'neighbor-%';

alter table profiles add column if not exists is_admin boolean not null default false;
