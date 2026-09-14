alter table services add column if not exists tasks text not null default '[]';

update services set tasks = '["ac"]' where id = 'svc-ac';
update services set tasks = '["moto"]' where id = 'svc-moto';
update services set tasks = '["garden"]' where id = 'svc-garden';
update services set tasks = '["tutoring"]' where id = 'svc-english';
update services set tasks = '["lifting","delivery"]' where id = 'svc-move';
update services set tasks = '["tutoring"]' where id = 'svc-thai';
update services set tasks = '["electric"]' where id = 'svc-electric';
update services set tasks = '["cleaning","garden"]' where id = 'svc-wanted-pool';
update services set tasks = '["paperwork"]' where id = 'help-paperwork';
update services set tasks = '["airport","delivery"]' where id = 'help-airport';
update services set tasks = '["pets"]' where id = 'help-pets';
update services set tasks = '["paperwork"]' where id = 'help-translate';
update services set tasks = '["lifting","day_labor"]' where id = 'help-move';
update services set tasks = '["childcare"]' where id = 'help-kids';
update services set tasks = '["housekeeping","cleaning"]' where id = 'job-house';
update services set tasks = '["tourism"]' where id = 'job-dive';
update services set tasks = '["moto","day_labor"]' where id = 'job-shop';
update services set tasks = '["hospitality"]' where id = 'job-bar';
update services set tasks = '["construction","day_labor","lifting"]' where id = 'job-build';
update services set tasks = '["hospitality"]' where id = 'job-wait';

update profiles set
  bio_th = 'รักสวน อ่าวนาง รับงานตัดหญ้า ดูแลต้นไม้',
  bio_en = 'Garden lover in Ao Nang. Lawn and plant care.'
where id = 'neighbor-malee';

update profiles set
  bio_th = 'รับงานก่อสร้างและแรงงานรายวัน คลองม่วง',
  bio_en = 'Site work and day labour around Klong Muang.'
where id = 'neighbor-niran';

update profiles set
  bio_th = 'สอนภาษาอังกฤษ และช่วยแปลที่คลินิก',
  bio_en = 'English tutor. Happy to translate at clinics.'
where id = 'neighbor-emma';

update profiles set
  bio_th = 'สอนภาษาไทย กระบี่น้อย ช่วยเรื่องเอกสารได้',
  bio_en = 'Thai teacher in Krabi Noi. Helps with paperwork.'
where id = 'neighbor-ploy';

update profiles set
  bio_th = 'อยู่วิลล่าเล็กที่อ่าวนาง ต้องการคนช่วยบ้าน',
  bio_en = 'Small villa in Ao Nang. Looking for household help.'
where id = 'neighbor-james';

insert into services (
  id, user_id, title_th, title_en, description_th, description_en,
  category, offer_type, pricing_type, rate_thb, location_radius, status,
  images, district, lat, lng, available_times, source_language, kind, tasks
) values
('job-errands', 'neighbor-niran',
 'รับงานจิปาถะและแรงงานรายวัน', 'Day labour and errands',
 'ยกของ ซื้อของ ล้างรถ งานสวน คลองม่วงถึงตัวเมือง มีรถเอง',
 'Lifting, shopping, bike wash, garden jobs. Klong Muang to town. Own transport.',
 'daylabor', 'wanted', 'daily', 550, 25, 'active',
 '["/listings/ladder.jpg"]', 'klong-muang', 8.091, 98.748, 'Anytime', 'th', 'job',
 '["day_labor","errands","shopping","lifting","wash","garden"]'),
('help-shop', 'neighbor-lukas',
 'ช่วยซื้อของและส่งของให้เพื่อนบ้าน', 'Neighbour shopping and drop-offs',
 'ไปตลาดได้อยู่แล้ว ฝากซื้อหรือส่งของในหนองทะเล-อ่าวนาง',
 'Already going to the market. Shopping or drop-offs Nong Thale to Ao Nang.',
 'daily', 'offer', 'swap', 0, 12, 'active',
 '["/listings/pickup.jpg"]', 'nong-thale', 8.068, 98.846, 'Mornings', 'en', 'help',
 '["shopping","errands","delivery"]')
on conflict (id) do nothing;
