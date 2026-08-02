-- House inventory schema: media, games, books tabs.
-- Run this in the Supabase SQL editor for your project.

create table if not exists media_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  media_type text check (media_type in ('movie', 'tv')),
  release_date date,
  age_rating text,
  category text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists game_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  age_rating text,
  instructions_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists book_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  category text,
  age_rating text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at current on every edit.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger media_items_set_updated_at
  before update on media_items
  for each row execute function set_updated_at();

create trigger game_items_set_updated_at
  before update on game_items
  for each row execute function set_updated_at();

create trigger book_items_set_updated_at
  before update on book_items
  for each row execute function set_updated_at();

-- Lock every table down to the single logged-in user.
alter table media_items enable row level security;
alter table game_items enable row level security;
alter table book_items enable row level security;

create policy "authenticated users can manage media_items"
  on media_items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated users can manage game_items"
  on game_items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated users can manage book_items"
  on book_items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
