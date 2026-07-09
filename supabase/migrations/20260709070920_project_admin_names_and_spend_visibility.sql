-- Closes the two gaps Cody flagged reviewing PR #64. Both are read-only
-- visibility fixes; neither changes who can review/approve/reject/delete
-- receipts — that stays admin/treasurer only, untouched.

-- (a) name resolution: project_admin can now resolve names for groups in
-- THEIR OWN project (same function, same signature, additive OR-branch).
CREATE OR REPLACE FUNCTION public.get_group_member_names(p_group_id uuid)
 RETURNS TABLE(user_id uuid, full_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select distinct p.id as user_id, p.full_name
  from profiles p
  join user_roles ur on ur.user_id = p.id
  where ur.group_id = p_group_id
    and (
      is_admin()
      or is_treasurer_of(p_group_id)
      or is_member_of(p_group_id)
      or exists (
        select 1 from groups g
        where g.id = p_group_id and is_project_admin_of(g.project_id)
      )
    )
$function$;

-- (b) spend + child-count visibility: SELECT-only, scoped to the
-- project_admin's own project. No UPDATE/DELETE grant here — review/
-- approve/reject/hard-delete stay admin/treasurer only (unchanged).
create policy receipts_select_project_admin on receipts
  for select using (
    exists (
      select 1 from groups g
      where g.id = receipts.group_id and (select is_project_admin_of(g.project_id))
    )
  );

create policy notes_select_project_admin on no_receipt_notes
  for select using (
    exists (
      select 1 from groups g
      where g.id = no_receipt_notes.group_id and (select is_project_admin_of(g.project_id))
    )
  );
