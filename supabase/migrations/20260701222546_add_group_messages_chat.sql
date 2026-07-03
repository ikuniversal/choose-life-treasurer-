create table public.group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  body text not null check (length(btrim(body)) > 0),
  created_at timestamptz not null default now()
);

create index group_messages_group_created_idx on public.group_messages (group_id, created_at);

alter table public.group_messages enable row level security;

create policy group_messages_insert on public.group_messages
  for insert with check (
    sender_id = (select auth.uid())
    and ((select is_member_of(group_messages.group_id)) or (select is_admin()))
  );

create policy group_messages_select on public.group_messages
  for select using (
    (select is_member_of(group_messages.group_id)) or (select is_admin())
  );
