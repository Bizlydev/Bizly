-- پروفایل: هر کاربر فقط پروفایل خودش و همکارانش تو همون workspace رو ببینه
create policy "profiles_select_same_workspace"
on profiles for select
using (workspace_id = (select workspace_id from profiles where id = auth.uid()));

create policy "profiles_update_own"
on profiles for update
using (id = auth.uid());

-- فروش: کارمند فقط فروش خودش رو ببینه و بسازه، مدیر همه فروش‌های workspace رو ببینه
create policy "sales_select_own_or_manager"
on sales for select
using (
  employee_id = auth.uid()
  or workspace_id = (
    select workspace_id from profiles
    where id = auth.uid() and role = 'manager'
  )
);

create policy "sales_insert_own"
on sales for insert
with check (employee_id = auth.uid());

-- ساعت کاری: مشابه فروش
create policy "work_hours_select_own_or_manager"
on work_hours for select
using (
  employee_id = auth.uid()
  or workspace_id = (
    select workspace_id from profiles
    where id = auth.uid() and role = 'manager'
  )
);

create policy "work_hours_insert_own"
on work_hours for insert
with check (employee_id = auth.uid());

-- مشتری و بدهی: فقط اعضای همون workspace ببینن
create policy "customers_select_same_workspace"
on customers for select
using (
  workspace_id = (select workspace_id from profiles where id = auth.uid())
);

create policy "debt_select_same_workspace"
on debt_transactions for select
using (
  workspace_id = (select workspace_id from profiles where id = auth.uid())
);

-- workspace: فقط عضوهای همون workspace ببینن
create policy "workspaces_select_member"
on workspaces for select
using (
  id = (select workspace_id from profiles where id = auth.uid())
);