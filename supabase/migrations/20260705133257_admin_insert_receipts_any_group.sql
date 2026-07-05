-- Operator decision 2026-07-05: ADMIN may file a receipt into ANY group
-- (group chosen at capture time). Members unchanged (own group only).
-- Additive policies; existing member policies untouched. submitted_by
-- stays self — admin files as themselves, auditable.
create policy receipts_insert_admin on receipts
  for insert
  with check (
    (submitted_by = (select auth.uid()))
    and (select is_admin())
  );

create policy receipt_photos_admin_insert on storage.objects
  for insert
  with check (
    bucket_id = 'receipt-photos'
    and (select is_admin())
  );
