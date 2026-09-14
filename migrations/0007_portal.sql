update services set kind = 'service' where kind = 'help' or kind is null or kind = '';

alter table services drop constraint if exists services_kind_check;
alter table services add constraint services_kind_check
  check (kind in ('service', 'job', 'market'));
