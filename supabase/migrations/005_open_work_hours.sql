-- Allow an open work session to exist before the employee clocks out.
alter table public.work_hours alter column end_time drop not null;

-- Employees may close only their own work-hour records.
create policy "work_hours_update_own"
on public.work_hours for update
using (employee_id = auth.uid())
with check (employee_id = auth.uid());
