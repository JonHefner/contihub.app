-- ContiHub Change Order log. Apply in the Supabase SQL editor AFTER
--   20260909060000_conti_suite.sql
--   20260909160000_contifield_daily_log.sql
--   20260909180000_projects.sql
-- or with the Supabase CLI (`supabase db push`).
-- Adds change_orders (RLS like other suite tables, project_id FK) and seeds
-- a fictional Midwest Regional Stadium Renovation demo project + sample COs.
-- Do not use United CLE or live lead names.

create table if not exists public.change_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  number text not null,
  title text not null,
  description text not null default '',
  type text not null default 'Owner' check (type in ('Owner', 'Unforeseen', 'Deduct', 'Allowance', 'Other')),
  amount numeric(14, 2) not null default 0,
  status text not null default 'Proposed' check (status in ('Proposed', 'Pricing', 'Approved', 'Rejected')),
  submitted_date date,
  decided_date date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists change_orders_user_id_idx
  on public.change_orders (user_id, created_at desc);
create index if not exists change_orders_project_id_idx
  on public.change_orders (project_id, number);

drop trigger if exists change_orders_set_updated_at on public.change_orders;
create trigger change_orders_set_updated_at
before update on public.change_orders
for each row execute function public.set_updated_at();

alter table public.change_orders enable row level security;

drop policy if exists change_orders_select_own on public.change_orders;
create policy change_orders_select_own on public.change_orders
for select using (auth.uid() = user_id);

drop policy if exists change_orders_insert_own on public.change_orders;
create policy change_orders_insert_own on public.change_orders
for insert with check (auth.uid() = user_id);

drop policy if exists change_orders_update_own on public.change_orders;
create policy change_orders_update_own on public.change_orders
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists change_orders_delete_own on public.change_orders;
create policy change_orders_delete_own on public.change_orders
for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.change_orders to authenticated;

-- Seed one Midwest Regional Stadium Renovation project per existing auth user
-- and attach the sample CO breakdown when that project has no COs yet.
-- Sample totals: pending $393,650 · approved $282,900 · net owner exposure $676,550.
do $$
declare
  uid uuid;
  pid uuid;
  existing integer;
begin
  for uid in
    select id from auth.users
  loop
    select id into pid
    from public.projects
    where user_id = uid
      and lower(name) = 'midwest regional stadium renovation'
    limit 1;

    if pid is null then
      insert into public.projects (user_id, created_by, name, job_number, address, status)
      values (
        uid,
        uid,
        'Midwest Regional Stadium Renovation',
        'MRS-26-014',
        '1400 Stadium Drive, Columbus, OH',
        'Active'
      )
      returning id into pid;
    end if;

    select count(*) into existing
    from public.change_orders
    where user_id = uid
      and project_id = pid;

    if existing = 0 then
      insert into public.change_orders (
        user_id,
        project_id,
        number,
        title,
        description,
        type,
        amount,
        status,
        submitted_date,
        decided_date,
        notes
      )
      values
        (
          uid, pid, 'CO-001',
          'Additional suite-level millwork',
          'Owner-directed upgrade to club-level suite casework and reception desks.',
          'Owner', 185000, 'Proposed', '2026-03-04', null,
          'Awaiting owner review of finish package B.'
        ),
        (
          uid, pid, 'CO-002',
          'Existing concourse slab replacement',
          'Unforeseen failed slab at the lower concourse pour-back after demo.',
          'Unforeseen', 92400, 'Pricing', '2026-03-18', null,
          'GC pricing rebar and overnight pour window.'
        ),
        (
          uid, pid, 'CO-003',
          'Video board structural steel add',
          'Owner added a larger center-hung board; extra steel and catwalk.',
          'Owner', 246800, 'Approved', '2026-02-20', '2026-03-11',
          'Executed. Shop drawings released.'
        ),
        (
          uid, pid, 'CO-004',
          'Delete unused ticket booth build-out',
          'Deduct unused south-gate booth that the owner dropped from the program.',
          'Deduct', -18500, 'Approved', '2026-03-01', '2026-03-15',
          'Credit issued against the original ticket-booth allowance.'
        ),
        (
          uid, pid, 'CO-005',
          'Premium seating finish allowance',
          'Allowance draw for club-seat upholstery and aisle lighting extras.',
          'Allowance', 75000, 'Pricing', '2026-04-02', null,
          'Vendor quotes in; owner to pick fabric.'
        ),
        (
          uid, pid, 'CO-006',
          'Temporary winter enclosure at north bowl',
          'Weather protection so structural steel can continue through January.',
          'Other', 41250, 'Proposed', '2026-04-08', null,
          'Shared cost discussion with the CM still open.'
        ),
        (
          uid, pid, 'CO-007',
          'Hidden utility relocation at press box',
          'Unforeseen duct bank found in the press-box slab edge.',
          'Unforeseen', 28900, 'Rejected', '2026-03-22', '2026-04-01',
          'Owner rejected — treat as base-contract unforeseen, not a CO.'
        ),
        (
          uid, pid, 'CO-008',
          'ADA ramp realignment at Gate C',
          'Owner-directed ramp geometry change after accessibility review.',
          'Owner', 54600, 'Approved', '2026-02-12', '2026-02-28',
          'In the executed change package.'
        );
    end if;
  end loop;
end
$$;
