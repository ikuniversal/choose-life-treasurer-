-- A soft-deleted receipt shouldn't count toward the duplicate comparison
-- (gap surfaced by Cody reviewing PR #49). Narrows matches only — no
-- behavior change for any non-deleted row.
CREATE OR REPLACE FUNCTION public.set_is_duplicate()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  new.is_duplicate := exists (
    select 1 from public.receipts r
    where r.group_id = new.group_id
      and r.amount = new.amount
      and r.currency = new.currency
      and r.receipt_date = new.receipt_date
      and r.status <> 'rejected'
      and r.deleted_at is null
  );
  return new;
end;
$function$
