-- Soft/hard delete support for receipts + no_receipt_notes.
-- Soft delete = UPDATE deleted_at (covered by existing owner-pending +
-- treasurer/admin UPDATE policies, no column-level restriction present).
-- Hard delete = DELETE, admin-only (new).
alter table receipts add column deleted_at timestamptz;
alter table no_receipt_notes add column deleted_at timestamptz;

create policy receipts_delete_admin on receipts
  for delete
  using (is_admin());

create policy notes_delete_admin on no_receipt_notes
  for delete
  using (is_admin());
