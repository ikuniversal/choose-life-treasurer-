-- Grant the scope operator confirmed: full group lifecycle + treasurer/member
-- role management, both bounded to the project_admin's OWN project only.
-- Deliberately does NOT touch is_admin()-gated policies anywhere.

-- Own project visibility (existing projects_select doesn't cover this —
-- it requires a GROUP-level role, which a project_admin doesn't have)
create policy projects_select_project_admin on projects
  for select using ((select is_project_admin_of(id)));

-- Full group lifecycle within own project (create/edit/delete + implicit
-- select via USING). Existing groups_admin_write (is_admin()) untouched.
create policy groups_project_admin_write on groups
  for all
  using ((select is_project_admin_of(project_id)))
  with check ((select is_project_admin_of(project_id)));

-- Roster visibility for groups within own project
create policy user_roles_select_project_admin on user_roles
  for select using (
    group_id is not null
    and exists (
      select 1 from groups g
      where g.id = user_roles.group_id
        and (select is_project_admin_of(g.project_id))
    )
  );

-- Assign / remove TREASURER or MEMBER only (never admin or project_admin —
-- that stays an org-wide-admin-only power, prevents self-escalation),
-- scoped to groups inside the project_admin's own project only.
create policy user_roles_project_admin_write on user_roles
  for insert
  with check (
    role in ('treasurer', 'member')
    and group_id is not null
    and exists (
      select 1 from groups g
      where g.id = group_id
        and (select is_project_admin_of(g.project_id))
    )
  );

create policy user_roles_project_admin_delete on user_roles
  for delete
  using (
    role in ('treasurer', 'member')
    and group_id is not null
    and exists (
      select 1 from groups g
      where g.id = user_roles.group_id
        and (select is_project_admin_of(g.project_id))
    )
  );
