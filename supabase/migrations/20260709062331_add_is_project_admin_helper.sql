-- Dedicated helper, kept SEPARATE from is_admin() by design — is_admin()
-- means org-wide admin everywhere it's already used (dozens of policies);
-- redefining it would silently grant org-wide power to project admins.
-- This function only ever answers "is this user the project_admin of
-- THIS specific project" and nothing else.
create or replace function public.is_project_admin_of(p_project_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from user_roles
    where user_id = (select auth.uid())
      and role = 'project_admin'
      and project_id = p_project_id
  );
$$;

revoke execute on function public.is_project_admin_of(uuid) from public;
revoke execute on function public.is_project_admin_of(uuid) from anon;
grant execute on function public.is_project_admin_of(uuid) to authenticated;
