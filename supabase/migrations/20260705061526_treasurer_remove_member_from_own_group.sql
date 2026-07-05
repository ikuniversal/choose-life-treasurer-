-- Operator decision 2026-07-05: treasurers may remove MEMBERS from their
-- OWN group(s). Member role rows only — never treasurer or admin rows,
-- never rows in other groups, never the auth account itself (accounts
-- stay admin-only, #50). Additive scoped DELETE policy; admin's existing
-- user_roles_admin_write (ALL) is untouched.
create policy user_roles_treasurer_delete_member on user_roles
  for delete
  using (
    role = 'member'
    and group_id is not null
    and (select is_treasurer_of(group_id))
  );
