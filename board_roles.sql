-- Create Profiles table (publicly queryable for invites)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create Board Members table
create type board_role as enum ('OWNER', 'EDITOR', 'VIEWER');

create table board_members (
  id uuid default uuid_generate_v4() primary key,
  board_id uuid references boards(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role board_role not null default 'VIEWER',
  unique(board_id, user_id)
);

-- RLS: Profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

-- RLS: Board Members
alter table board_members enable row level security;

-- VIEW: Members can view members of boards they belong to
create policy "Members can view other members"
  on board_members for select
  using (
    exists (
      select 1 from board_members bm
      where bm.board_id = board_members.board_id
      and bm.user_id = auth.uid()
    )
  );

-- INSERT: Only Owners can add members
create policy "Owners can add members"
  on board_members for insert
  with check (
    exists (
      select 1 from board_members bm
      where bm.board_id = board_members.board_id
      and bm.user_id = auth.uid()
      and bm.role = 'OWNER'
    )
    -- Also allow self-insert for initial board creation if we change how boards are made, 
    -- but currently boards are made by direct insert. 
    -- We need a trigger on Board Creation to make the creator an OWNER.
  );
  
-- Trigger to make board creator OWNER
create or replace function public.handle_new_board()
returns trigger as $$
begin
  insert into public.board_members (board_id, user_id, role)
  values (new.id, new.user_id, 'OWNER');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_board_created
  after insert on boards
  for each row execute procedure public.handle_new_board();

-- UPDATE BOARDS RLS to use board_members
-- Drop old policies if they conflict or update logic
-- Ideally we replace "Users can see their own boards" with "Users can see boards where they are a member"

create policy "Users can view boards they are a member of"
  on boards for select
  using (
    exists (
        select 1 from board_members bm
        where bm.board_id = boards.id
        and bm.user_id = auth.uid()
    )
    OR is_public = true 
  );
  
-- Only Owners can update/delete boards
create policy "Owners can update boards"
  on boards for update
  using (
    exists (
      select 1 from board_members bm
      where bm.board_id = boards.id
      and bm.user_id = auth.uid()
      and bm.role = 'OWNER'
    )
  );
  
create policy "Owners can delete boards"
  on boards for delete
  using (
    exists (
      select 1 from board_members bm
      where bm.board_id = boards.id
      and bm.user_id = auth.uid()
      and bm.role = 'OWNER'
    )
  );

-- LISTS & CARDS: Update RLS to check for EDITOR/OWNER role for modifications
-- Create helper function to check role? Or just raw SQL.

create policy "Members can view lists"
  on lists for select
  using (
    exists (
      select 1 from board_members bm
      where bm.board_id = lists.board_id
      and bm.user_id = auth.uid()
    )
    OR exists (select 1 from boards where boards.id = lists.board_id and boards.is_public = true)
  );

create policy "Editors and Owners can edit lists"
  on lists for all
  using (
    exists (
      select 1 from board_members bm
      where bm.board_id = lists.board_id
      and bm.user_id = auth.uid()
      and bm.role in ('OWNER', 'EDITOR')
    )
  );

-- Repeat for Cards (similar logic)
create policy "Editors and Owners can edit cards"
  on cards for all
  using (
    exists (
      select 1 from lists l
      join board_members bm on bm.board_id = l.board_id
      where l.id = cards.list_id
      and bm.user_id = auth.uid()
      and bm.role in ('OWNER', 'EDITOR')
    )
  );
