-- DATA TABLES
create table users (
  id uuid primary key references auth.users on delete cascade,
  email text,
  created_at timestamp default now()
);

create table boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  created_at timestamp default now()
);

create table lists (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade,
  title text not null,
  position int not null,
  created_at timestamp default now()
);

create table cards (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references lists(id) on delete cascade,
  title text not null,
  description text,
  position int not null,
  created_at timestamp default now()
);

-- ROW LEVEL SECURITY
alter table users enable row level security;
alter table boards enable row level security;
alter table lists enable row level security;
alter table cards enable row level security;

-- POLICIES
create policy "Users manage own profile"
on users for all
using (auth.uid() = id);

create policy "Users manage own boards"
on boards for all
using (auth.uid() = user_id);

create policy "Users manage lists via boards"
on lists for all
using (
  exists (
    select 1 from boards
    where boards.id = lists.board_id
    and boards.user_id = auth.uid()
  )
);

create policy "Users manage cards via lists"
on cards for all
using (
  exists (
    select 1 from lists
    join boards on boards.id = lists.board_id
    where lists.id = cards.list_id
    and boards.user_id = auth.uid()
  )
);

-- REALTIME
-- Note: Enable Realtime for boards, lists, cards in Supabase Dashboard -> Database -> Replication
