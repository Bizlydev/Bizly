alter table profiles
  add column status text not null default 'pending'
  check (status in ('pending', 'approved', 'rejected'));

-- مدیر باید بتونه پروفایل کارمندهای در انتظار تأیید workspace خودش رو ببینه
create policy "profiles_manager_view_pending"
on profiles for select
using (
  workspace_id = (
    select workspace_id from profiles
    where id = auth.uid() and role = 'manager'
  )
);

-- فقط مدیر می‌تونه وضعیت تأیید کارمند رو تغییر بده
create policy "profiles_manager_update_status"
on profiles for update
using (
  workspace_id = (
    select workspace_id from profiles
    where id = auth.uid() and role = 'manager'
  )
);