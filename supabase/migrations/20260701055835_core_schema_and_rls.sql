-- Enums
create type public.app_role as enum ('admin', 'treasurer', 'member');
create type public.item_status as enum ('pending', 'reviewed', 'approved', 'rejected');
create type public.task_status as enum ('assigned', 'done', 'approved');
create type public.expense_category as enum ('groceries','fuel','meals','medical','transport','lodging','other');

-- profiles (app-level user data, 1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  contact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- groups
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  spending_limit numeric(12,2),
  submission_deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- user_roles (one person, many (group, role) pairs; admin rows are org-wide -> group_id null)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  constraint admin_no_group check (role <> 'admin' or group_id is null),
  constraint scoped_role_has_group check (role = 'admin' or group_id is not null),
  unique (user_id, group_id, role)
);
create index user_roles_user_idx on public.user_roles(user_id);
create index user_roles_group_idx on public.user_roles(group_id);

-- fx_rates (demo static seed from design handoff; swap for real FX feed later)
create table public.fx_rates (
  currency text primary key,
  rate_to_usd numeric(12,6) not null,
  updated_at timestamptz not null default now()
);

-- receipts
create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  submitted_by uuid not null references auth.users(id),
  vendor text not null,
  receipt_date date not null,
  category public.expense_category not null default 'other',
  amount numeric(12,2) not null,
  currency text not null references public.fx_rates(currency),
  usd_equivalent numeric(12,2),
  status public.item_status not null default 'pending',
  reject_reason text,
  is_duplicate boolean not null default false,
  photo_path text,
  additional_info text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index receipts_group_idx on public.receipts(group_id);
create index receipts_status_idx on public.receipts(status);
create index receipts_submitted_by_idx on public.receipts(submitted_by);

-- no_receipt_notes
create table public.no_receipt_notes (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  submitted_by uuid not null references auth.users(id),
  note_date date not null default current_date,
  description text not null,
  signer1_name text not null,
  signer1_signature_path text,
  signer1_signed_at timestamptz,
  signer2_name text,
  signer2_signature_path text,
  signer2_signed_at timestamptz,
  status public.item_status not null default 'pending',
  reject_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index notes_group_idx on public.no_receipt_notes(group_id);
create index notes_status_idx on public.no_receipt_notes(status);

-- tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  assignee uuid not null references auth.users(id),
  due_date date,
  status public.task_status not null default 'assigned',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_group_idx on public.tasks(group_id);
create index tasks_assignee_idx on public.tasks(assignee);

-- comments (per receipt or per note, exactly one parent)
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid references public.receipts(id) on delete cascade,
  note_id uuid references public.no_receipt_notes(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  body text not null,
  created_at timestamptz not null default now(),
  constraint exactly_one_parent check (
    (receipt_id is not null and note_id is null) or
    (receipt_id is null and note_id is not null)
  )
);
create index comments_receipt_idx on public.comments(receipt_id);
create index comments_note_idx on public.comments(note_id);

-- updated_at helper + triggers
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

create trigger groups_set_updated_at before update on public.groups for each row execute function public.set_updated_at();
create trigger receipts_set_updated_at before update on public.receipts for each row execute function public.set_updated_at();
create trigger notes_set_updated_at before update on public.no_receipt_notes for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

-- role-check helpers (security definer, used inside RLS policies)
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_treasurer_of(p_group_id uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'treasurer' and group_id = p_group_id);
$$;

create or replace function public.is_member_of(p_group_id uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and group_id = p_group_id);
$$;

-- enable RLS everywhere
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.groups enable row level security;
alter table public.user_roles enable row level security;
alter table public.fx_rates enable row level security;
alter table public.receipts enable row level security;
alter table public.no_receipt_notes enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;

-- profiles
create policy profiles_select_own_or_admin on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles for update using (id = auth.uid());
create policy profiles_insert_own on public.profiles for insert with check (id = auth.uid());

-- projects
create policy projects_select on public.projects for select using (
  public.is_admin() or exists (select 1 from public.groups g join public.user_roles ur on ur.group_id = g.id where g.project_id = projects.id and ur.user_id = auth.uid())
);
create policy projects_admin_write on public.projects for all using (public.is_admin()) with check (public.is_admin());

-- groups
create policy groups_select on public.groups for select using (public.is_admin() or public.is_member_of(id));
create policy groups_admin_write on public.groups for all using (public.is_admin()) with check (public.is_admin());
create policy groups_treasurer_update on public.groups for update using (public.is_treasurer_of(id)) with check (public.is_treasurer_of(id));

-- user_roles
create policy user_roles_select on public.user_roles for select using (public.is_admin() or user_id = auth.uid() or public.is_treasurer_of(group_id));
create policy user_roles_admin_write on public.user_roles for all using (public.is_admin()) with check (public.is_admin());

-- fx_rates
create policy fx_rates_select on public.fx_rates for select using (auth.role() = 'authenticated');
create policy fx_rates_admin_write on public.fx_rates for all using (public.is_admin()) with check (public.is_admin());

-- receipts
create policy receipts_select on public.receipts for select using (public.is_admin() or public.is_treasurer_of(group_id) or submitted_by = auth.uid());
create policy receipts_insert on public.receipts for insert with check (submitted_by = auth.uid() and public.is_member_of(group_id));
create policy receipts_update_owner_pending on public.receipts for update using (submitted_by = auth.uid() and status = 'pending') with check (submitted_by = auth.uid());
create policy receipts_update_treasurer_admin on public.receipts for update using (public.is_admin() or public.is_treasurer_of(group_id)) with check (public.is_admin() or public.is_treasurer_of(group_id));

-- no_receipt_notes
create policy notes_select on public.no_receipt_notes for select using (public.is_admin() or public.is_treasurer_of(group_id) or submitted_by = auth.uid());
create policy notes_insert on public.no_receipt_notes for insert with check (submitted_by = auth.uid() and public.is_member_of(group_id));
create policy notes_update_owner_pending on public.no_receipt_notes for update using (submitted_by = auth.uid() and status = 'pending') with check (submitted_by = auth.uid());
create policy notes_update_treasurer_admin on public.no_receipt_notes for update using (public.is_admin() or public.is_treasurer_of(group_id)) with check (public.is_admin() or public.is_treasurer_of(group_id));

-- tasks
create policy tasks_select on public.tasks for select using (public.is_admin() or public.is_treasurer_of(group_id) or assignee = auth.uid());
create policy tasks_insert_treasurer_admin on public.tasks for insert with check (public.is_admin() or public.is_treasurer_of(group_id));
create policy tasks_update_assignee on public.tasks for update using (assignee = auth.uid()) with check (assignee = auth.uid());
create policy tasks_update_treasurer_admin on public.tasks for update using (public.is_admin() or public.is_treasurer_of(group_id)) with check (public.is_admin() or public.is_treasurer_of(group_id));

-- comments
create policy comments_select on public.comments for select using (
  (receipt_id is not null and exists (select 1 from public.receipts r where r.id = comments.receipt_id and (public.is_admin() or public.is_treasurer_of(r.group_id) or r.submitted_by = auth.uid())))
  or (note_id is not null and exists (select 1 from public.no_receipt_notes n where n.id = comments.note_id and (public.is_admin() or public.is_treasurer_of(n.group_id) or n.submitted_by = auth.uid())))
);
create policy comments_insert on public.comments for insert with check (
  sender_id = auth.uid() and (
    (receipt_id is not null and exists (select 1 from public.receipts r where r.id = comments.receipt_id and (public.is_admin() or public.is_treasurer_of(r.group_id) or r.submitted_by = auth.uid())))
    or (note_id is not null and exists (select 1 from public.no_receipt_notes n where n.id = comments.note_id and (public.is_admin() or public.is_treasurer_of(n.group_id) or n.submitted_by = auth.uid())))
  )
);

-- seed FX rates (demo values, matches design handoff exactly)
insert into public.fx_rates (currency, rate_to_usd) values
  ('USD', 1), ('EUR', 1.08), ('MDL', 0.057), ('KES', 0.0078), ('MXN', 0.054), ('PLN', 0.25);
