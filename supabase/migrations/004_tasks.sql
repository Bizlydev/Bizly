create table tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  title text not null,
  assigned_to uuid references profiles(id),
  is_recurring boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'done')),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  employee_id uuid references profiles(id),
  date date not null default current_date,
  completed_at timestamptz not null default now(),
  unique (task_id, employee_id, date)
);

alter table tasks enable row level security;
alter table task_completions enable row level security;

create policy "tasks_select_workspace"
on tasks for select
using (
  workspace_id = (select workspace_id from profiles where id = auth.uid())
);

create policy "tasks_manager_insert"
on tasks for insert
with check (
  workspace_id = (
    select workspace_id from profiles
    where id = auth.uid() and role = 'manager'
  )
);

create policy "tasks_manager_update"
on tasks for update
using (
  workspace_id = (
    select workspace_id from profiles
    where id = auth.uid() and role = 'manager'
  )
);

create policy "completions_select_workspace"
on task_completions for select
using (
  task_id in (
    select id from tasks
    where workspace_id = (select workspace_id from profiles where id = auth.uid())
  )
);

create policy "completions_own_insert"
on task_completions for insert
with check (employee_id = auth.uid());