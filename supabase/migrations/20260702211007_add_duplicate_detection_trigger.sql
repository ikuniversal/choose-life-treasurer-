-- Roadmap #6: duplicate detection. Soft flag at INSERT (is_late pattern):
-- same group + amount + currency + receipt_date as an existing NON-REJECTED receipt
-- → is_duplicate = true. Trigger-owned, tamper-proof (overwrites client value).
create or replace function public.set_is_duplicate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.is_duplicate := exists (
    select 1 from public.receipts r
    where r.group_id = new.group_id
      and r.amount = new.amount
      and r.currency = new.currency
      and r.receipt_date = new.receipt_date
      and r.status <> 'rejected'
  );
  return new;
end;
$$;

revoke execute on function public.set_is_duplicate() from public;
revoke execute on function public.set_is_duplicate() from anon;
revoke execute on function public.set_is_duplicate() from authenticated;

create trigger receipts_set_is_duplicate before insert on public.receipts
  for each row execute function public.set_is_duplicate();

-- supporting index for the duplicate probe
create index if not exists receipts_dup_probe_idx
  on public.receipts (group_id, amount, currency, receipt_date);
