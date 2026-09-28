-- ContiHub full court press. Apply in the Supabase SQL editor AFTER:
--   20260909060000_conti_suite.sql
--   20260909160000_contifield_daily_log.sql
--   20260909180000_projects.sql
--   20260914120000_change_orders.sql   (Change Orders — PR #8; safe to run this file if that one is already applied)
--
-- Adds the Conti organization, staff vs bidder roles, the Conti Bid contractor
-- directory, bid packages, magic-link invitees, richer SAMPLE rows, and
-- field-photo storage. Building Connected is a checklist flag only.
--
-- Live Outlook GAL sync is not in this migration. Conti does not have Microsoft
-- Graph org-directory scopes in the app yet. Import a GAL export or the Conti
-- bidder CSV from Conti Bid → Contractor directory.

create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Continental Construction of Ohio',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  email text not null default '',
  role text not null check (role in ('conti_staff', 'bidder')),
  created_at timestamptz not null default now()
);

create unique index if not exists org_members_org_email_idx
  on public.org_members (org_id, lower(email));
create unique index if not exists org_members_org_user_idx
  on public.org_members (org_id, user_id)
  where user_id is not null;

alter table public.projects
  add column if not exists org_id uuid references public.orgs (id) on delete set null;

create index if not exists projects_org_id_idx on public.projects (org_id);

create or replace function public.is_staff_of(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_org is not null and exists (
    select 1
    from public.org_members m
    where m.org_id = target_org
      and m.role = 'conti_staff'
      and (
        m.user_id = auth.uid()
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

create or replace function public.can_staff_access_project(pid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select pid is not null and exists (
    select 1
    from public.projects p
    where p.id = pid
      and (
        p.user_id = auth.uid()
        or public.is_staff_of(p.org_id)
      )
  );
$$;

-- One company org per existing project owner. Do not turn every future bidder
-- into staff; this loop only covers users who already own a project.
do $$
declare
  uid uuid;
  oid uuid;
  em text;
begin
  for uid in select distinct user_id from public.projects
  loop
    select email into em from auth.users where id = uid;
    select m.org_id into oid
    from public.org_members m
    where m.user_id = uid and m.role = 'conti_staff'
    limit 1;

    if oid is null then
      insert into public.orgs (name, created_by)
      values ('Continental Construction of Ohio', uid)
      returning id into oid;

      insert into public.org_members (org_id, user_id, email, role)
      values (oid, uid, lower(coalesce(em, '')), 'conti_staff');
    end if;

    update public.projects
      set org_id = oid
      where user_id = uid and org_id is null;
  end loop;
end
$$;

create table if not exists public.bid_contractors (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.orgs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  name text not null default '',
  email text not null default '',
  company text not null default '',
  phone text not null default '',
  office text not null default '',
  cell text not null default '',
  street text not null default '',
  city text not null default '',
  state text not null default '',
  zip text not null default '',
  categories text not null default '',
  notes text not null default '',
  source text not null default 'manual' check (source in ('import', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bid_contractors_org_idx on public.bid_contractors (org_id, company);
create unique index if not exists bid_contractors_org_email_idx
  on public.bid_contractors (org_id, lower(email))
  where email <> '';

drop trigger if exists bid_contractors_set_updated_at on public.bid_contractors;
create trigger bid_contractors_set_updated_at
before update on public.bid_contractors
for each row execute function public.set_updated_at();

create table if not exists public.bid_packages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.orgs (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  project_name text not null default '',
  title text not null,
  due_at timestamptz,
  drawings_teams_url text not null default '',
  notes text not null default '',
  building_connected_sent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bid_packages_project_idx on public.bid_packages (project_id, due_at);

drop trigger if exists bid_packages_set_updated_at on public.bid_packages;
create trigger bid_packages_set_updated_at
before update on public.bid_packages
for each row execute function public.set_updated_at();

create table if not exists public.bid_invitees (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.bid_packages (id) on delete cascade,
  contractor_id uuid references public.bid_contractors (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  name text not null default '',
  company text not null default '',
  trade text not null default '',
  status text not null default 'draft' check (status in ('draft', 'invited', 'opened', 'declined')),
  invited_at timestamptz,
  magic_link_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bid_invitees_package_idx on public.bid_invitees (package_id);
create index if not exists bid_invitees_email_idx on public.bid_invitees (lower(email));

drop trigger if exists bid_invitees_set_updated_at on public.bid_invitees;
create trigger bid_invitees_set_updated_at
before update on public.bid_invitees
for each row execute function public.set_updated_at();

alter table public.crm_leads
  add column if not exists next_action text not null default '',
  add column if not exists opportunity_value numeric(14, 2) not null default 0;

alter table public.safety_logs
  add column if not exists what_happened text not null default '',
  add column if not exists who_involved text not null default '',
  add column if not exists corrective_action text not null default '',
  add column if not exists attendee_count integer not null default 0;

alter table public.trak_milestones
  add column if not exists milestone_status text not null default 'Not started',
  add column if not exists owner_name text not null default '';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'trak_milestones_status_check') then
    alter table public.trak_milestones
      add constraint trak_milestones_status_check
      check (milestone_status in ('Not started', 'In progress', 'Done'));
  end if;
end
$$;

create table if not exists public.field_report_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  report_id uuid references public.field_reports (id) on delete cascade,
  storage_path text not null,
  caption text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists field_report_photos_report_idx
  on public.field_report_photos (report_id, created_at);

insert into storage.buckets (id, name, public)
values ('field-photos', 'field-photos', false)
on conflict (id) do nothing;

alter table public.orgs enable row level security;
alter table public.org_members enable row level security;
alter table public.bid_contractors enable row level security;
alter table public.bid_packages enable row level security;
alter table public.bid_invitees enable row level security;
alter table public.field_report_photos enable row level security;

drop policy if exists orgs_select on public.orgs;
create policy orgs_select on public.orgs
for select using (created_by = auth.uid() or public.is_staff_of(id));

drop policy if exists orgs_insert on public.orgs;
create policy orgs_insert on public.orgs
for insert with check (created_by = auth.uid());

drop policy if exists orgs_update on public.orgs;
create policy orgs_update on public.orgs
for update using (public.is_staff_of(id)) with check (public.is_staff_of(id));

drop policy if exists org_members_select on public.org_members;
create policy org_members_select on public.org_members
for select using (
  user_id = auth.uid()
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or public.is_staff_of(org_id)
);

drop policy if exists org_members_insert on public.org_members;
create policy org_members_insert on public.org_members
for insert with check (
  public.is_staff_of(org_id)
  or (
    user_id = auth.uid()
    and role = 'conti_staff'
    and exists (
      select 1 from public.orgs o
      where o.id = org_id and o.created_by = auth.uid()
    )
  )
);

drop policy if exists org_members_update on public.org_members;
create policy org_members_update on public.org_members
for update using (public.is_staff_of(org_id))
with check (public.is_staff_of(org_id));

drop policy if exists projects_select_org on public.projects;
create policy projects_select_org on public.projects
for select using (public.can_staff_access_project(id));

drop policy if exists projects_update_org on public.projects;
create policy projects_update_org on public.projects
for update using (public.can_staff_access_project(id))
with check (public.can_staff_access_project(id) or public.is_staff_of(org_id));

drop policy if exists projects_delete_org on public.projects;
create policy projects_delete_org on public.projects
for delete using (public.can_staff_access_project(id));

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'crm_leads',
    'field_reports',
    'field_jobs',
    'field_rfis',
    'cost_jobs',
    'safety_logs',
    'trak_milestones',
    'bid_chases',
    'change_orders'
  ]
  loop
    if to_regclass('public.' || tbl) is null then
      continue;
    end if;

    execute format('drop policy if exists %I on public.%I', tbl || '_select_org', tbl);
    execute format(
      'create policy %I on public.%I for select using (public.can_staff_access_project(project_id))',
      tbl || '_select_org',
      tbl
    );
    execute format('drop policy if exists %I on public.%I', tbl || '_update_org', tbl);
    execute format(
      'create policy %I on public.%I for update using (public.can_staff_access_project(project_id)) with check (public.can_staff_access_project(project_id))',
      tbl || '_update_org',
      tbl
    );
    execute format('drop policy if exists %I on public.%I', tbl || '_delete_org', tbl);
    execute format(
      'create policy %I on public.%I for delete using (public.can_staff_access_project(project_id))',
      tbl || '_delete_org',
      tbl
    );
  end loop;
end
$$;

drop policy if exists bid_contractors_select on public.bid_contractors;
create policy bid_contractors_select on public.bid_contractors
for select using (user_id = auth.uid() or public.is_staff_of(org_id));

drop policy if exists bid_contractors_insert on public.bid_contractors;
create policy bid_contractors_insert on public.bid_contractors
for insert with check (user_id = auth.uid() and public.is_staff_of(org_id));

drop policy if exists bid_contractors_update on public.bid_contractors;
create policy bid_contractors_update on public.bid_contractors
for update using (public.is_staff_of(org_id)) with check (public.is_staff_of(org_id));

drop policy if exists bid_contractors_delete on public.bid_contractors;
create policy bid_contractors_delete on public.bid_contractors
for delete using (public.is_staff_of(org_id));

create or replace function public.is_invited_to_package(pkg uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select pkg is not null and exists (
    select 1
    from public.bid_invitees i
    where i.package_id = pkg
      and (
        i.user_id = auth.uid()
        or lower(i.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

create or replace function public.staff_can_see_package(pkg uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select pkg is not null and exists (
    select 1
    from public.bid_packages p
    where p.id = pkg
      and (public.can_staff_access_project(p.project_id) or public.is_staff_of(p.org_id))
  );
$$;

drop policy if exists bid_packages_select on public.bid_packages;
create policy bid_packages_select on public.bid_packages
for select using (
  public.can_staff_access_project(project_id)
  or public.is_staff_of(org_id)
  or public.is_invited_to_package(id)
);

drop policy if exists bid_packages_insert on public.bid_packages;
create policy bid_packages_insert on public.bid_packages
for insert with check (
  user_id = auth.uid()
  and (public.can_staff_access_project(project_id) or public.is_staff_of(org_id))
);

drop policy if exists bid_packages_update on public.bid_packages;
create policy bid_packages_update on public.bid_packages
for update using (public.can_staff_access_project(project_id) or public.is_staff_of(org_id))
with check (public.can_staff_access_project(project_id) or public.is_staff_of(org_id));

drop policy if exists bid_packages_delete on public.bid_packages;
create policy bid_packages_delete on public.bid_packages
for delete using (public.can_staff_access_project(project_id) or public.is_staff_of(org_id));

drop policy if exists bid_invitees_select on public.bid_invitees;
create policy bid_invitees_select on public.bid_invitees
for select using (
  user_id = auth.uid()
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or public.staff_can_see_package(package_id)
);

drop policy if exists bid_invitees_insert on public.bid_invitees;
create policy bid_invitees_insert on public.bid_invitees
for insert with check (public.staff_can_see_package(package_id));

drop policy if exists bid_invitees_update on public.bid_invitees;
create policy bid_invitees_update on public.bid_invitees
for update using (public.staff_can_see_package(package_id))
with check (public.staff_can_see_package(package_id));

drop policy if exists bid_invitees_delete on public.bid_invitees;
create policy bid_invitees_delete on public.bid_invitees
for delete using (public.staff_can_see_package(package_id));

drop policy if exists field_report_photos_select on public.field_report_photos;
create policy field_report_photos_select on public.field_report_photos
for select using (user_id = auth.uid() or public.can_staff_access_project(project_id));

drop policy if exists field_report_photos_insert on public.field_report_photos;
create policy field_report_photos_insert on public.field_report_photos
for insert with check (user_id = auth.uid() and public.can_staff_access_project(project_id));

drop policy if exists field_report_photos_delete on public.field_report_photos;
create policy field_report_photos_delete on public.field_report_photos
for delete using (user_id = auth.uid() or public.can_staff_access_project(project_id));

drop policy if exists field_photos_select on storage.objects;
create policy field_photos_select on storage.objects
for select to authenticated
using (
  bucket_id = 'field-photos'
  and public.can_staff_access_project(((storage.foldername(name))[1])::uuid)
);

drop policy if exists field_photos_insert on storage.objects;
create policy field_photos_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'field-photos'
  and public.can_staff_access_project(((storage.foldername(name))[1])::uuid)
);

drop policy if exists field_photos_delete on storage.objects;
create policy field_photos_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'field-photos'
  and public.can_staff_access_project(((storage.foldername(name))[1])::uuid)
);

grant select, insert, update, delete on public.orgs to authenticated;
grant select, insert, update, delete on public.org_members to authenticated;
grant select, insert, update, delete on public.bid_contractors to authenticated;
grant select, insert, update, delete on public.bid_packages to authenticated;
grant select, insert, update, delete on public.bid_invitees to authenticated;
grant select, insert, delete on public.field_report_photos to authenticated;

create or replace function public.claim_my_access()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  em text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  if uid is null or em = '' then
    return;
  end if;

  update public.org_members
    set user_id = uid
    where user_id is null and lower(email) = em;

  update public.bid_invitees
    set user_id = uid
    where user_id is null and lower(email) = em;
end;
$$;

create or replace function public.mark_my_invites_opened()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  em text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  if uid is null then
    return;
  end if;

  update public.bid_invitees
    set status = 'opened'
    where status = 'invited'
      and (user_id = uid or lower(email) = em);
end;
$$;

revoke all on function public.claim_my_access() from public;
revoke all on function public.mark_my_invites_opened() from public;
grant execute on function public.claim_my_access() to authenticated;
grant execute on function public.mark_my_invites_opened() to authenticated;

-- SAMPLE workspace for one user. Not granted to the browser role directly.
create or replace function public.seed_full_court_press_sample_for(uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  oid uuid;
  pid uuid;
  pkg uuid;
  em text;
begin
  if uid is null then
    return;
  end if;

  select email into em from auth.users where id = uid;

  select m.org_id into oid
  from public.org_members m
  where m.user_id = uid and m.role = 'conti_staff'
  limit 1;

  if oid is null then
    insert into public.orgs (name, created_by)
    values ('Continental Construction of Ohio', uid)
    returning id into oid;

    insert into public.org_members (org_id, user_id, email, role)
    values (oid, uid, lower(coalesce(em, '')), 'conti_staff');
  end if;

  update public.projects set org_id = oid where user_id = uid and org_id is null;

  select id into pid
  from public.projects
  where user_id = uid and name = 'SAMPLE Data Center'
  limit 1;

  if pid is null then
    insert into public.projects (user_id, created_by, org_id, name, job_number, address, status)
    values (
      uid, uid, oid, 'SAMPLE Data Center', 'DC-SAMPLE', 'SAMPLE — site address withheld', 'Bidding'
    )
    returning id into pid;
  end if;

  insert into public.bid_contractors (
    org_id, user_id, first_name, last_name, name, email, company, phone, office, cell,
    street, city, state, zip, categories, notes, source
  )
  select oid, uid, v.first_name, v.last_name, v.name, v.email, v.company, v.phone, v.office, v.cell,
    v.street, v.city, v.state, v.zip, v.categories, v.notes, 'import'
  from (
    values
      ('Joe', 'Bertolini', 'Joe Bertolini', 'jfb@raybertolini.com', 'Ray Bertolini Trucking Co.', '330-867-0666', '', '', '', 'Akron', 'OH', '44320', '31 20 00 - Earthwork; 33 00 00 - Site Utilities', 'SAMPLE — Bid packages: Excavation and site utilities'),
      ('Brian', 'Cavanaugh', 'Brian Cavanaugh', 'bids@cavanaughbuilding.com', 'Cavanaugh Building Corporation', '330-753-6658', '', '', '1744 Collier Road', 'Akron', 'OH', '44320', '31 20 00 - Earthwork; 32 12 16 - Asphalt Paving', 'SAMPLE — Bid packages: Asphalt; Excavation'),
      ('Kyle', 'Monda', 'Kyle Monda', 'kmonda@kenmorecompanies.com', 'Kenmore Construction Company', '330-762-9373', '', '', '700 Home Avenue', 'Akron', 'OH', '44310', '31 20 00 - Earthwork; 33 00 00 - Site Utilities', 'SAMPLE — Bid packages: Excavation and site utilities'),
      ('John', 'Mayer', 'John Mayer', 'jmayer@phoenixcementinc.com', 'Phoenix Cement Contracting, LLC', '440-243-5575', '440-243-5575', '', '55 Lou Groza Boulevard', 'Berea', 'OH', '44017', '03 30 00 - Cast in Place Concrete', 'SAMPLE — Bid packages: Concrete'),
      ('Sue', 'Toelle', 'Sue Toelle', 'stoelle@clevelandcement.com', 'Cleveland Cement Contractors, Inc.', '216-741-3954', '', '', '4823 Van Epps Road', 'Brooklyn Heights', 'OH', '44131', '03 30 00 - Cast in Place Concrete', 'SAMPLE — Bid packages: Concrete'),
      ('Steve', 'Givens', 'Steve Givens', 'steve@josephajeffries.com', 'Joseph A. Jeffries Co., Inc.', '330-454-6103', '', '', '5211 Louisville Street Northeast', 'Louisville', 'OH', '44641', '32 12 16 - Asphalt Paving', 'SAMPLE — Bid packages: Asphalt'),
      ('Mike', 'Fogg', 'Mike Fogg', 'mfogg@cunninghampaving.com', 'Cunningham Paving Inc.', '216-581-8600', '', '', '20814 Aurora Road', 'Bedford', 'OH', '44146', '32 12 16 - Asphalt Paving', 'SAMPLE — Bid packages: Asphalt; Paving'),
      ('Ed', 'Bell', 'Ed Bell', 'ed@tankproohio.com', 'Tank Pro, Inc.', '330-848-9166', '', '330-352-2254', '2099 Wadsworth Road', 'Norton', 'OH', '44203', '11 40 00 - Food Service & Kitchen Equipment', 'SAMPLE — Bid packages: Equipment')
  ) as v(first_name, last_name, name, email, company, phone, office, cell, street, city, state, zip, categories, notes)
  where not exists (
    select 1 from public.bid_contractors c
    where c.org_id = oid and lower(c.email) = lower(v.email)
  );

  if not exists (select 1 from public.field_reports where project_id = pid and notes ilike 'SAMPLE%') then
    insert into public.field_reports (
      user_id, project_id, report_date, job_name, weather, weather_pm, temp_low, temp_high, precip, wind, ground,
      notes, crew_count, man_hours, work_performed, delays, materials, visitors, prepared_by, prepared_title,
      shift_start, shift_end, status
    )
    values
      (uid, pid, current_date - 2, 'SAMPLE Data Center', 'Clear', 'Cloudy', '48', '67', '0', '8', 'Dry', 'SAMPLE daily log', 16, 140, 'SAMPLE — Mass excavation of the north yard and haul-off.', '', 'SAMPLE — Stone', 'SAMPLE — Owner walk', 'SAMPLE Super', 'Superintendent', '07:00', '15:30', 'final'),
      (uid, pid, current_date - 1, 'SAMPLE Data Center', 'Clear', 'Cloudy', '48', '67', '0', '8', 'Dry', 'SAMPLE daily log', 17, 148, 'SAMPLE — Underslab plumbing and vapor barrier at data hall A.', '', 'SAMPLE — Vapor barrier', '', 'SAMPLE Super', 'Superintendent', '07:00', '15:30', 'final'),
      (uid, pid, current_date, 'SAMPLE Data Center', 'Cloudy', 'Clear', '50', '70', '0', '6', 'Dry', 'SAMPLE daily log', 18, 150, 'SAMPLE — Form and pour equipment pads.', 'SAMPLE — Waiting on switchgear shop drawing.', 'SAMPLE — Rebar', 'SAMPLE — Owner''s rep', 'SAMPLE Super', 'Superintendent', '07:00', '15:30', 'draft');
  end if;

  if not exists (select 1 from public.field_rfis where project_id = pid and number like 'RFI-S%') then
    insert into public.field_rfis (user_id, project_id, number, title, description, status, due_date)
    values
      (uid, pid, 'RFI-S01', 'SAMPLE — Electrical gear clearance', 'Confirm working clearance at the main switchgear.', 'open', current_date + 5),
      (uid, pid, 'RFI-S02', 'SAMPLE — Roof screen steel', 'Confirm embed locations for the screen steel.', 'open', current_date + 12),
      (uid, pid, 'RFI-S03', 'SAMPLE — Fire pump room drain', 'Closed sample. Floor drain relocated.', 'closed', current_date - 3);
  end if;

  if not exists (select 1 from public.crm_leads where project_id = pid and notes ilike 'SAMPLE%') then
    insert into public.crm_leads (user_id, project_id, name, company, stage, next_action, opportunity_value, notes)
    values
      (uid, pid, 'Avery Holt', 'Northline Owners', 'Lead', 'Call the intro meeting', 0, 'SAMPLE Conti chase'),
      (uid, pid, 'Priya Shah', 'Studio North Architects', 'Chase', 'Send qualifications', 12500000, 'SAMPLE Conti chase'),
      (uid, pid, 'Chris Adelman', 'Data Hall Owner', 'Interview', 'Site walk with the short list', 42000000, 'SAMPLE Conti chase'),
      (uid, pid, 'SAMPLE Award', 'Data Hall Owner', 'Award', 'Kick off precon', 42000000, 'SAMPLE Conti chase'),
      (uid, pid, 'SAMPLE Method', 'Continental Construction', 'Method', 'Assign the project team', 42000000, 'SAMPLE Conti chase');
  end if;

  if not exists (select 1 from public.cost_jobs where project_id = pid and job ilike 'SAMPLE%') then
    insert into public.cost_jobs (user_id, project_id, job, budget, committed, actual)
    values
      (uid, pid, 'SAMPLE A10 Foundations', 2400000, 1800000, 900000),
      (uid, pid, 'SAMPLE B20 Exterior enclosure', 6100000, 4200000, 1100000),
      (uid, pid, 'SAMPLE D30 HVAC', 8900000, 2100000, 400000),
      (uid, pid, 'SAMPLE D50 Electrical', 7600000, 1500000, 250000);
  end if;

  if not exists (select 1 from public.safety_logs where project_id = pid and location ilike 'SAMPLE%') then
    insert into public.safety_logs (
      user_id, project_id, entry_type, entry_date, location, notes, what_happened, who_involved, corrective_action, attendee_count
    )
    values
      (uid, pid, 'Incident', current_date - 1, 'SAMPLE — data hall A', 'SAMPLE incident log', 'SAMPLE — Worker slipped on wet vapor barrier. No lost time.', 'SAMPLE — carpentry foreman', 'SAMPLE — Dry the area and review housekeeping at the next toolbox talk.', 0),
      (uid, pid, 'Toolbox Talk', current_date, 'SAMPLE — job trailer', 'SAMPLE — Housekeeping and wet surfaces', '', '', '', 16);
  end if;

  if not exists (select 1 from public.trak_milestones where project_id = pid and activity ilike 'SAMPLE%') then
    insert into public.trak_milestones (
      user_id, project_id, activity, start_date, finish_date, percent_complete, milestone_status, owner_name
    )
    values
      (uid, pid, 'SAMPLE — Sitework', current_date - 10, current_date + 20, 40, 'In progress', 'SAMPLE Super'),
      (uid, pid, 'SAMPLE — Foundations', current_date - 2, current_date + 30, 15, 'In progress', 'SAMPLE PM'),
      (uid, pid, 'SAMPLE — Electrical gear', current_date + 14, current_date + 60, 0, 'Not started', 'SAMPLE Estimator');
  end if;

  select id into pkg
  from public.bid_packages
  where project_id = pid and title = 'SAMPLE — Early site and concrete'
  limit 1;

  if pkg is null then
    insert into public.bid_packages (
      org_id, project_id, user_id, project_name, title, due_at, drawings_teams_url, notes, building_connected_sent
    )
    values (
      oid,
      pid,
      uid,
      'SAMPLE Data Center',
      'SAMPLE — Early site and concrete',
      (current_date + 14)::timestamptz + time '15:00',
      'https://teams.microsoft.com/l/channel/SAMPLE-data-center-drawings',
      'SAMPLE invite log only. No email was sent. Replace the Teams link with the live drawings channel. Building Connected stays a parallel send.',
      false
    )
    returning id into pkg;

    insert into public.bid_invitees (package_id, email, name, company, trade, status, invited_at)
    values
      (pkg, 'jfb@raybertolini.com', 'Joe Bertolini', 'Ray Bertolini Trucking Co.', 'Earthwork and concrete', 'invited', now()),
      (pkg, 'bids@cavanaughbuilding.com', 'Brian Cavanaugh', 'Cavanaugh Building Corporation', 'Earthwork and concrete', 'invited', now()),
      (pkg, 'kmonda@kenmorecompanies.com', 'Kyle Monda', 'Kenmore Construction Company', 'Earthwork and concrete', 'invited', now());
  end if;
end;
$$;

create or replace function public.seed_full_court_press_sample()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in required';
  end if;
  perform public.seed_full_court_press_sample_for(auth.uid());
end;
$$;

revoke all on function public.seed_full_court_press_sample_for(uuid) from public;
revoke all on function public.seed_full_court_press_sample() from public;
grant execute on function public.seed_full_court_press_sample() to authenticated;

do $$
declare
  uid uuid;
begin
  for uid in select distinct user_id from public.projects
  loop
    perform public.seed_full_court_press_sample_for(uid);
  end loop;
end
$$;
