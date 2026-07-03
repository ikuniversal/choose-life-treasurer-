create or replace function public.get_group_member_names(p_group_id uuid)
returns table (user_id uuid, full_name text)
language sql
security definer
set search_path = public
stable
as $$
  select distinct p.id as user_id, p.full_name
  from profiles p
  join user_roles ur on ur.user_id = p.id
  where ur.group_id = p_group_id
    and ( is_admin() or is_treasurer_of(p_group_id) or is_member_of(p_group_id) )
$$;

revoke execute on function public.get_group_member_names(uuid) from public;
revoke execute on function public.get_group_member_names(uuid) from anon;
grant execute on function public.get_group_member_names(uuid) to authenticated;
