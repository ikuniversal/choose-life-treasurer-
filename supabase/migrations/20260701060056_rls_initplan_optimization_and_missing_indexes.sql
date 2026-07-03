-- Missing FK indexes
create index groups_project_idx on public.groups(project_id);
create index receipts_currency_idx on public.receipts(currency);
create index notes_submitted_by_idx on public.no_receipt_notes(submitted_by);
create index tasks_created_by_idx on public.tasks(created_by);
create index comments_sender_idx on public.comments(sender_id);

-- Wrap auth.<fn>() calls in (select ...) so Postgres evaluates them once per query
-- instead of once per row (standard Supabase RLS performance pattern).
alter policy profiles_select_own_or_admin on public.profiles using (id = (select auth.uid()) or (select public.is_admin()));
alter policy profiles_update_own on public.profiles using (id = (select auth.uid()));
alter policy profiles_insert_own on public.profiles with check (id = (select auth.uid()));

alter policy projects_select on public.projects using (
  (select public.is_admin()) or exists (select 1 from public.groups g join public.user_roles ur on ur.group_id = g.id where g.project_id = projects.id and ur.user_id = (select auth.uid()))
);
alter policy projects_admin_write on public.projects using ((select public.is_admin())) with check ((select public.is_admin()));

alter policy groups_select on public.groups using ((select public.is_admin()) or (select public.is_member_of(id)));
alter policy groups_admin_write on public.groups using ((select public.is_admin())) with check ((select public.is_admin()));
alter policy groups_treasurer_update on public.groups using ((select public.is_treasurer_of(id))) with check ((select public.is_treasurer_of(id)));

alter policy user_roles_select on public.user_roles using ((select public.is_admin()) or user_id = (select auth.uid()) or (select public.is_treasurer_of(group_id)));
alter policy user_roles_admin_write on public.user_roles using ((select public.is_admin())) with check ((select public.is_admin()));

alter policy fx_rates_select on public.fx_rates using ((select auth.role()) = 'authenticated');
alter policy fx_rates_admin_write on public.fx_rates using ((select public.is_admin())) with check ((select public.is_admin()));

alter policy receipts_select on public.receipts using ((select public.is_admin()) or (select public.is_treasurer_of(group_id)) or submitted_by = (select auth.uid()));
alter policy receipts_insert on public.receipts with check (submitted_by = (select auth.uid()) and (select public.is_member_of(group_id)));
alter policy receipts_update_owner_pending on public.receipts using (submitted_by = (select auth.uid()) and status = 'pending') with check (submitted_by = (select auth.uid()));
alter policy receipts_update_treasurer_admin on public.receipts using ((select public.is_admin()) or (select public.is_treasurer_of(group_id))) with check ((select public.is_admin()) or (select public.is_treasurer_of(group_id)));

alter policy notes_select on public.no_receipt_notes using ((select public.is_admin()) or (select public.is_treasurer_of(group_id)) or submitted_by = (select auth.uid()));
alter policy notes_insert on public.no_receipt_notes with check (submitted_by = (select auth.uid()) and (select public.is_member_of(group_id)));
alter policy notes_update_owner_pending on public.no_receipt_notes using (submitted_by = (select auth.uid()) and status = 'pending') with check (submitted_by = (select auth.uid()));
alter policy notes_update_treasurer_admin on public.no_receipt_notes using ((select public.is_admin()) or (select public.is_treasurer_of(group_id))) with check ((select public.is_admin()) or (select public.is_treasurer_of(group_id)));

alter policy tasks_select on public.tasks using ((select public.is_admin()) or (select public.is_treasurer_of(group_id)) or assignee = (select auth.uid()));
alter policy tasks_insert_treasurer_admin on public.tasks with check ((select public.is_admin()) or (select public.is_treasurer_of(group_id)));
alter policy tasks_update_assignee on public.tasks using (assignee = (select auth.uid())) with check (assignee = (select auth.uid()));
alter policy tasks_update_treasurer_admin on public.tasks using ((select public.is_admin()) or (select public.is_treasurer_of(group_id))) with check ((select public.is_admin()) or (select public.is_treasurer_of(group_id)));

alter policy comments_select on public.comments using (
  (receipt_id is not null and exists (select 1 from public.receipts r where r.id = comments.receipt_id and ((select public.is_admin()) or (select public.is_treasurer_of(r.group_id)) or r.submitted_by = (select auth.uid()))))
  or (note_id is not null and exists (select 1 from public.no_receipt_notes n where n.id = comments.note_id and ((select public.is_admin()) or (select public.is_treasurer_of(n.group_id)) or n.submitted_by = (select auth.uid()))))
);
alter policy comments_insert on public.comments with check (
  sender_id = (select auth.uid()) and (
    (receipt_id is not null and exists (select 1 from public.receipts r where r.id = comments.receipt_id and ((select public.is_admin()) or (select public.is_treasurer_of(r.group_id)) or r.submitted_by = (select auth.uid()))))
    or (note_id is not null and exists (select 1 from public.no_receipt_notes n where n.id = comments.note_id and ((select public.is_admin()) or (select public.is_treasurer_of(n.group_id)) or n.submitted_by = (select auth.uid()))))
  )
);
