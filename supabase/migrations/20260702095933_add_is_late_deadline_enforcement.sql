-- Roadmap #6 slice 3: soft LATE flag, locked at submission (usd_equivalent precedent)
alter table public.receipts add column is_late boolean not null default false;
alter table public.no_receipt_notes add column is_late boolean not null default false;

-- Trigger fn: computes is_late from the group's submission_deadline at INSERT time.
-- SECURITY DEFINER + pinned search_path (banked helper-fn precedent); always OVERWRITES
-- the incoming value so it cannot be spoofed via direct API.
create or replace function public.set_is_late()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select (g.submission_deadline is not null and current_date > g.submission_deadline)
    into new.is_late
  from public.groups g where g.id = new.group_id;
  new.is_late := coalesce(new.is_late, false);
  return new;
end;
$$;

revoke execute on function public.set_is_late() from public;
revoke execute on function public.set_is_late() from anon;

create trigger receipts_set_is_late before insert on public.receipts
  for each row execute function public.set_is_late();
create trigger notes_set_is_late before insert on public.no_receipt_notes
  for each row execute function public.set_is_late();
