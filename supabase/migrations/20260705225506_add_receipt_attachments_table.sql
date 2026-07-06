-- Operator request 2026-07-05: a receipt may carry MULTIPLE attachments.
-- v1 model: receipts.photo_path stays the PRIMARY file (OCR source, existing
-- UI untouched); additional files live here. Child table over array column:
-- per-file metadata, ordering, future per-file ops — no ceiling.
create table receipt_attachments (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references receipts(id) on delete cascade,
  path text not null,
  mime_type text,
  created_at timestamptz not null default now()
);
create index receipt_attachments_receipt_id_idx on receipt_attachments (receipt_id);
alter table receipt_attachments enable row level security;

-- visibility mirrors the parent receipt (admin / group treasurer / owner)
create policy receipt_attachments_select on receipt_attachments
  for select using (
    exists (
      select 1 from receipts r
      where r.id = receipt_attachments.receipt_id
        and ((select is_admin())
          or (select is_treasurer_of(r.group_id))
          or r.submitted_by = (select auth.uid()))
    )
  );

-- only the receipt's owner attaches, and only where they could file the
-- receipt itself (member of the group, or admin per migration #16)
create policy receipt_attachments_insert on receipt_attachments
  for insert with check (
    exists (
      select 1 from receipts r
      where r.id = receipt_attachments.receipt_id
        and r.submitted_by = (select auth.uid())
        and ((select is_member_of(r.group_id)) or (select is_admin()))
    )
  );

-- hard delete admin-only (rows also die with the receipt via CASCADE)
create policy receipt_attachments_delete_admin on receipt_attachments
  for delete using ((select is_admin()));
