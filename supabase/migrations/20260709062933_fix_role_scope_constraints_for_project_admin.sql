-- The original 2-way invariant (role='admin' iff group_id is null) has no
-- room for a role scoped by project_id instead of group_id. Replacing with
-- the correct 3-way invariant. Admin and treasurer/member behavior is
-- UNCHANGED — this only adds the project_admin case.
alter table user_roles drop constraint admin_no_group;
alter table user_roles drop constraint scoped_role_has_group;

alter table user_roles add constraint role_scope_admin
  check (role <> 'admin' or (group_id is null and project_id is null));

alter table user_roles add constraint role_scope_project_admin
  check (role <> 'project_admin' or (group_id is null and project_id is not null));

alter table user_roles add constraint role_scope_group_roles
  check (role not in ('treasurer', 'member') or group_id is not null);
