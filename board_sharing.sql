-- Add sharing columns to boards
alter table boards 
add column share_id uuid default uuid_generate_v4() unique,
add column is_public boolean default false;

-- Policies for Public Access

-- Anyone can read public boards (using share_id or just ID check if public)
create policy "Public view of boards"
  on boards for select
  using ( is_public = true );

-- Anyone can read lists of public boards
create policy "Public view of lists"
  on lists for select
  using (
    exists (
      select 1 from boards
      where boards.id = lists.board_id
      and boards.is_public = true
    )
  );

-- Anyone can read cards of public boards (via lists)
create policy "Public view of cards"
  on cards for select
  using (
    exists (
      select 1 from lists
      join boards on boards.id = lists.board_id
      where lists.id = cards.list_id
      and boards.is_public = true
    )
  );
