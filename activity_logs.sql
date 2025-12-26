-- Create activity_logs table
create table activity_logs (
  id uuid default uuid_generate_v4() primary key,
  board_id uuid references boards(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  action text not null,
  entity_type text not null, -- 'board', 'list', 'card'
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table activity_logs enable row level security;

-- Policies

-- Users can read logs for boards they own
create policy "Users can view logs of their boards"
  on activity_logs for select
  using (
    auth.uid() in (
      select user_id from boards where id = activity_logs.board_id
    )
  );

-- Users can insert logs for actions they perform (implicitly on boards they have access to via app logic)
-- A stricter check would be to ensure they own the board, but for now we trust the app logic + board ownership check on read.
create policy "Users can insert their own activity"
  on activity_logs for insert
  with check (
    auth.uid() = user_id
  );
