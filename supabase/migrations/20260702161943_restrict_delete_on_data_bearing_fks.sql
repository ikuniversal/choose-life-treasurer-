-- Roadmap #6 slice 4: guarded delete (operator decision: DB-level RESTRICT).
-- Data-bearing FKs flip CASCADE→RESTRICT: a group holding receipts/notes/tasks —
-- or a project holding groups — physically cannot be deleted.
-- user_roles + group_messages KEEP CASCADE (memberships/chat die with the group,
-- never block a delete).
alter table public.receipts drop constraint receipts_group_id_fkey,
  add constraint receipts_group_id_fkey foreign key (group_id)
  references public.groups(id) on delete restrict;
alter table public.no_receipt_notes drop constraint no_receipt_notes_group_id_fkey,
  add constraint no_receipt_notes_group_id_fkey foreign key (group_id)
  references public.groups(id) on delete restrict;
alter table public.tasks drop constraint tasks_group_id_fkey,
  add constraint tasks_group_id_fkey foreign key (group_id)
  references public.groups(id) on delete restrict;
alter table public.groups drop constraint groups_project_id_fkey,
  add constraint groups_project_id_fkey foreign key (project_id)
  references public.projects(id) on delete restrict;
