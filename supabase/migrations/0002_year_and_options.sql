-- Media date -> year only, managed dropdown options, cover photos.
-- Run this in the Supabase SQL editor after 0001_init.sql.
-- Before/after running this, also create a public Storage bucket named "covers"
-- via the dashboard (Storage -> New bucket -> public).

-- 1. Media date -> year only
alter table media_items add column release_year text;
update media_items set release_year = extract(year from release_date)::text where release_date is not null;
alter table media_items drop column release_date;

-- 2. Cover photos
alter table media_items add column cover_url text;
alter table game_items add column cover_url text;
alter table book_items add column cover_url text;

-- 3. Managed dropdown options (Category everywhere, Age Rating on Media)
create table if not exists field_options (
  id uuid primary key default gen_random_uuid(),
  tab text not null,
  field_key text not null,
  value text not null,
  created_at timestamptz not null default now(),
  unique (tab, field_key, value)
);

alter table field_options enable row level security;

create policy "authenticated users can manage field_options"
  on field_options for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

insert into field_options (tab, field_key, value) values
  ('media_items', 'category', 'Action'),
  ('media_items', 'category', 'Comedy'),
  ('media_items', 'category', 'Drama'),
  ('media_items', 'category', 'Horror'),
  ('media_items', 'category', 'Sci-Fi'),
  ('media_items', 'category', 'Documentary'),
  ('media_items', 'category', 'Kids/Family'),
  ('media_items', 'category', 'Thriller'),
  ('media_items', 'category', 'Animation'),
  ('media_items', 'category', 'Romance'),
  ('media_items', 'age_rating', 'G'),
  ('media_items', 'age_rating', 'PG'),
  ('media_items', 'age_rating', 'PG-13'),
  ('media_items', 'age_rating', 'R'),
  ('media_items', 'age_rating', 'NC-17'),
  ('media_items', 'age_rating', 'TV-Y'),
  ('media_items', 'age_rating', 'TV-Y7'),
  ('media_items', 'age_rating', 'TV-G'),
  ('media_items', 'age_rating', 'TV-PG'),
  ('media_items', 'age_rating', 'TV-14'),
  ('media_items', 'age_rating', 'TV-MA'),
  ('media_items', 'age_rating', 'Not Rated'),
  ('game_items', 'category', 'Action'),
  ('game_items', 'category', 'Adventure'),
  ('game_items', 'category', 'Puzzle'),
  ('game_items', 'category', 'Strategy'),
  ('game_items', 'category', 'Party'),
  ('game_items', 'category', 'Educational'),
  ('game_items', 'category', 'Sports'),
  ('game_items', 'category', 'RPG'),
  ('game_items', 'category', 'Board Game'),
  ('game_items', 'category', 'Card Game'),
  ('book_items', 'category', 'Fiction'),
  ('book_items', 'category', 'Non-Fiction'),
  ('book_items', 'category', 'Mystery'),
  ('book_items', 'category', 'Fantasy'),
  ('book_items', 'category', 'Biography'),
  ('book_items', 'category', 'Children''s'),
  ('book_items', 'category', 'Young Adult'),
  ('book_items', 'category', 'Poetry'),
  ('book_items', 'category', 'Reference')
on conflict (tab, field_key, value) do nothing;

-- 4. Storage policies for the "covers" bucket (create the bucket itself via the dashboard first)
create policy "anyone can view covers"
  on storage.objects for select
  using (bucket_id = 'covers');

create policy "authenticated users can upload covers"
  on storage.objects for insert
  with check (bucket_id = 'covers' and auth.role() = 'authenticated');

create policy "authenticated users can update covers"
  on storage.objects for update
  using (bucket_id = 'covers' and auth.role() = 'authenticated');

create policy "authenticated users can delete covers"
  on storage.objects for delete
  using (bucket_id = 'covers' and auth.role() = 'authenticated');
