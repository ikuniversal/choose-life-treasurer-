-- Fix 1: set_updated_at had a mutable search_path (missed this one when pinning the others)
create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end $$;

-- Fix 2: is_admin/is_treasurer_of/is_member_of are flagged as callable by anon/authenticated via RPC.
-- These functions only ever report on the CALLING user's own auth.uid() -- they take no user
-- identity as an untrusted parameter and never expose another user's data, so direct RPC access
-- isn't a data leak. BUT anon has no legitimate reason to call them at all (there is no
-- unauthenticated flow in this app), and RLS policies genuinely require `authenticated` to retain
-- EXECUTE (policy evaluation runs as the querying role) -- so revoke the blanket PUBLIC grant and
-- re-grant explicitly to authenticated only. Revoking from authenticated entirely would break
-- every RLS policy that references these functions.
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

revoke execute on function public.is_treasurer_of(uuid) from public;
grant execute on function public.is_treasurer_of(uuid) to authenticated;

revoke execute on function public.is_member_of(uuid) from public;
grant execute on function public.is_member_of(uuid) to authenticated;
