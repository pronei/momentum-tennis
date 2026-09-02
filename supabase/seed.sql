-- Reference data — applied after migrations in every environment (supabase db reset / seed).
-- Products, courts, availability and terms are Artur's data and are NOT seeded here.

insert into skill_levels (key, label, rank) values
  ('orange','Orange ball',1),
  ('green_beginner','Green ball · beginner',2), ('green_intermediate','Green ball · intermediate',3), ('green_advanced','Green ball · advanced',4),
  ('yellow_intermediate','Yellow ball · intermediate',5), ('yellow_advanced','Yellow ball · advanced',6);
insert into locations (name) values ('De Anza College'), ('Murdock Park');
insert into rating_dimensions (key, label, scale_max, sort) values ('court_placement','Court placement',5,0);
insert into waiver_documents (slug, title) values ('liability','Participation waiver');   -- F: one document; text FROM LEGAL
