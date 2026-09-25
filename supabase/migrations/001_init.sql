create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_type text not null default 'other',
  address text,
  latitude double precision,
  longitude double precision,
  currency text not null default 'IRR',
  language text not null default 'fa',
  manager_id uuid,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete cascade,
  role text not null check (role in ('manager', 'employee')),
  first_name text not null,
  last_name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create table sales (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  employee_id uuid references profiles(id),
  product text not null,
  amount numeric not null,
  time time not null,
  date date not null default current_date
);

create table work_hours (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  employee_id uuid references profiles(id),
  date date not null default current_date,
  start_time time not null,
  end_time time not null,
  total_hours numeric
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text
);

create table debt_transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  product text not null,
  amount numeric not null,
  paid_amount numeric not null default 0,
  remaining numeric not null,
  due_date date,
  is_pinned boolean not null default false,
  date date not null default current_date,
  time time not null
);

alter table workspaces enable row level security;
alter table profiles enable row level security;
alter table sales enable row level security;
alter table work_hours enable row level security;
alter table customers enable row level security;
alter table debt_transactions enable row level security;