insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('receipt-photos', 'receipt-photos', false, 10485760, array['image/jpeg','image/png','image/webp','image/heic']),
  ('signatures', 'signatures', false, 2097152, array['image/png','image/jpeg']);

-- RLS on storage.objects: users can only touch files under a path they own within their own group.
-- Convention: receipt-photos/{group_id}/{receipt_id}.ext, signatures/{group_id}/{note_id}-{1|2}.ext
create policy receipt_photos_select on storage.objects for select
  using (
    bucket_id = 'receipt-photos'
    and (
      (select public.is_admin())
      or (select public.is_treasurer_of((split_part(name,'/',1))::uuid))
      or exists (
        select 1 from public.receipts r
        where r.photo_path = storage.objects.name and r.submitted_by = (select auth.uid())
      )
    )
  );
create policy receipt_photos_insert on storage.objects for insert
  with check (bucket_id = 'receipt-photos' and (select public.is_member_of((split_part(name,'/',1))::uuid)));

create policy signatures_select on storage.objects for select
  using (
    bucket_id = 'signatures'
    and (
      (select public.is_admin())
      or (select public.is_treasurer_of((split_part(name,'/',1))::uuid))
      or exists (
        select 1 from public.no_receipt_notes n
        where (n.signer1_signature_path = storage.objects.name or n.signer2_signature_path = storage.objects.name)
        and n.submitted_by = (select auth.uid())
      )
    )
  );
create policy signatures_insert on storage.objects for insert
  with check (bucket_id = 'signatures' and (select public.is_member_of((split_part(name,'/',1))::uuid)));
