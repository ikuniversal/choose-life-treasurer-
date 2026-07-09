-- Foundation for a project-scoped administrator (operator request
-- 2026-07-05): someone "responsible for a project" who can create groups
-- within it, without being an org-wide admin. New enum value + new scope
-- column only in this migration — kept in its own transaction because
-- ALTER TYPE ... ADD VALUE can't be used in the same transaction it's
-- added in. Helper function + grant policies follow in later migrations
-- once permission scope is confirmed.
alter type app_role add value 'project_admin';

alter table user_roles add column project_id uuid references projects(id);
