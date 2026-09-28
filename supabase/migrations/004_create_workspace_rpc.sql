create or replace function public.create_workspace(p_name text)
returns table(workspace_id uuid, workspace_name text, member_role text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_workspace_id uuid;
  v_name text := trim(coalesce(p_name, ''));
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if length(v_name) < 2 or length(v_name) > 120 then
    raise exception 'Workspace name must be between 2 and 120 characters';
  end if;
  if exists (select 1 from public.profiles p where p.id = v_user_id and p.workspace_id is not null) then
    raise exception 'Your account already belongs to a workspace';
  end if;

  insert into public.workspaces (name, manager_id)
  values (v_name, v_user_id)
  returning id into v_workspace_id;

  insert into public.profiles (id, workspace_id, role, status, first_name, last_name, email)
  values (
    v_user_id,
    v_workspace_id,
    'manager',
    'approved',
    coalesce((select nullif(raw_user_meta_data->>'first_name', '') from auth.users where id = v_user_id), ''),
    coalesce((select nullif(raw_user_meta_data->>'last_name', '') from auth.users where id = v_user_id), ''),
    (select email from auth.users where id = v_user_id)
  )
  on conflict (id) do update
    set workspace_id = excluded.workspace_id,
        role = 'manager',
        status = 'approved';

  return query select v_workspace_id, v_name, 'manager'::text;
end;
$$;

revoke all on function public.create_workspace(text) from public;
grant execute on function public.create_workspace(text) to authenticated;
