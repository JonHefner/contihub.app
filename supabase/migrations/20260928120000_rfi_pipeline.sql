-- ContiHub RFI pipeline.
-- Roster seats are rows. Remove a person by setting active = false.
-- Design/document RFIs route to architect_liaison. Owner decisions route to owner_liaison.
-- ContiRFI agent handoff stays stubbed: staff paste citations. Hub does not invent sheet content.
-- Braden Farmer is the distributor seat (the six roster roles do not include a separate conti_staff value).
-- owner_liaison is intentionally unseeded until Conti adds that person.

create table if not exists public.rfi_roster (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  display_name text not null,
  email text not null default '',
  role text not null check (
    role in (
      'intake_reviewer',
      'architect_liaison',
      'owner_liaison',
      'superintendent',
      'distributor',
      'admin'
    )
  ),
  active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create unique index if not exists rfi_roster_org_seat
  on public.rfi_roster (org_id, lower(display_name), role)
  where project_id is null;

create index if not exists rfi_roster_org_idx on public.rfi_roster (org_id);

create table if not exists public.rfi_type_routes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs (id) on delete cascade,
  rfi_type text not null check (rfi_type in ('design_docs', 'owner_decision')),
  label text not null,
  target_role text not null check (target_role in ('architect_liaison', 'owner_liaison')),
  active boolean not null default true,
  unique (org_id, rfi_type)
);

create table if not exists public.rfi_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  number text not null,
  subject text not null,
  question text not null default '',
  improved_question text not null default '',
  citations text not null default '',
  doc_review_notes text not null default '',
  docs_already_answer boolean not null default false,
  urgency text not null default 'normal' check (urgency in ('low', 'normal', 'high', 'critical')),
  rfi_type text not null default 'design_docs' check (rfi_type in ('design_docs', 'owner_decision')),
  route_role text not null default '' check (
    route_role = ''
    or route_role in (
      'intake_reviewer',
      'architect_liaison',
      'owner_liaison',
      'superintendent',
      'distributor',
      'admin'
    )
  ),
  from_name text not null default '',
  to_name text not null default '',
  date_required date,
  cost_impact text not null default 'unknown' check (cost_impact in ('add', 'deduct', 'none', 'unknown')),
  schedule_impact text not null default 'unknown' check (schedule_impact in ('yes', 'no', 'unknown')),
  status text not null default 'draft' check (
    status in ('draft', 'doc_review', 'writing', 'outcomes', 'routed', 'waiting', 'closed', 'complete')
  ),
  official_response text not null default '',
  returned_at date,
  teams_docs_url text not null default '',
  cost_ping_note text not null default '',
  logged_at timestamptz,
  distributed_at timestamptz,
  selected_outcome text not null default '',
  field_rfi_id uuid,
  created_at timestamptz not null default now(),
  unique (project_id, number)
);

create index if not exists rfi_items_project_idx on public.rfi_items (project_id);

create table if not exists public.rfi_outcomes (
  id uuid primary key default gen_random_uuid(),
  rfi_id uuid not null references public.rfi_items (id) on delete cascade,
  label text not null,
  sort_order integer not null default 0,
  selected boolean not null default false
);

create table if not exists public.rfi_distributions (
  id uuid primary key default gen_random_uuid(),
  rfi_id uuid not null references public.rfi_items (id) on delete cascade,
  recipient_kind text not null check (recipient_kind in ('superintendent', 'subcontractor')),
  name text not null default '',
  email text not null default '',
  contractor_id uuid,
  roster_id uuid,
  draft_subject text not null default '',
  draft_body text not null default '',
  sent_at timestamptz
);

alter table public.rfi_roster enable row level security;
alter table public.rfi_type_routes enable row level security;
alter table public.rfi_items enable row level security;
alter table public.rfi_outcomes enable row level security;
alter table public.rfi_distributions enable row level security;

drop policy if exists rfi_roster_select on public.rfi_roster;
create policy rfi_roster_select on public.rfi_roster
for select using (public.is_staff_of(org_id));

drop policy if exists rfi_roster_insert on public.rfi_roster;
create policy rfi_roster_insert on public.rfi_roster
for insert with check (public.is_staff_of(org_id));

drop policy if exists rfi_roster_update on public.rfi_roster;
create policy rfi_roster_update on public.rfi_roster
for update using (public.is_staff_of(org_id)) with check (public.is_staff_of(org_id));

drop policy if exists rfi_roster_delete on public.rfi_roster;
create policy rfi_roster_delete on public.rfi_roster
for delete using (public.is_staff_of(org_id));

drop policy if exists rfi_type_routes_select on public.rfi_type_routes;
create policy rfi_type_routes_select on public.rfi_type_routes
for select using (public.is_staff_of(org_id));

drop policy if exists rfi_type_routes_insert on public.rfi_type_routes;
create policy rfi_type_routes_insert on public.rfi_type_routes
for insert with check (public.is_staff_of(org_id));

drop policy if exists rfi_type_routes_update on public.rfi_type_routes;
create policy rfi_type_routes_update on public.rfi_type_routes
for update using (public.is_staff_of(org_id)) with check (public.is_staff_of(org_id));

drop policy if exists rfi_items_select on public.rfi_items;
create policy rfi_items_select on public.rfi_items
for select using (public.can_staff_access_project(project_id) or public.is_staff_of(org_id));

drop policy if exists rfi_items_insert on public.rfi_items;
create policy rfi_items_insert on public.rfi_items
for insert with check (public.can_staff_access_project(project_id) or public.is_staff_of(org_id));

drop policy if exists rfi_items_update on public.rfi_items;
create policy rfi_items_update on public.rfi_items
for update using (public.can_staff_access_project(project_id) or public.is_staff_of(org_id))
with check (public.can_staff_access_project(project_id) or public.is_staff_of(org_id));

drop policy if exists rfi_items_delete on public.rfi_items;
create policy rfi_items_delete on public.rfi_items
for delete using (public.can_staff_access_project(project_id) or public.is_staff_of(org_id));

create or replace function public.staff_can_edit_rfi(rid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select rid is not null and exists (
    select 1
    from public.rfi_items i
    where i.id = rid
      and (public.can_staff_access_project(i.project_id) or public.is_staff_of(i.org_id))
  );
$$;

drop policy if exists rfi_outcomes_all on public.rfi_outcomes;
create policy rfi_outcomes_all on public.rfi_outcomes
for all using (public.staff_can_edit_rfi(rfi_id))
with check (public.staff_can_edit_rfi(rfi_id));

drop policy if exists rfi_distributions_all on public.rfi_distributions;
create policy rfi_distributions_all on public.rfi_distributions
for all using (public.staff_can_edit_rfi(rfi_id))
with check (public.staff_can_edit_rfi(rfi_id));

create or replace function public.seed_rfi_roster(oid uuid, uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if oid is null or uid is null then
    return;
  end if;

  insert into public.rfi_roster (org_id, user_id, display_name, email, role, notes)
  select oid, uid, v.display_name, v.email, v.role, v.notes
  from (
    values
      ('Anne Saccone', 'ann.saccone@continentalcando.com', 'admin', 'Admin seat. Add or remove people by setting the roster row inactive.'),
      ('Anne Saccone', 'ann.saccone@continentalcando.com', 'intake_reviewer', 'Intake reviewer.'),
      ('Mike', '', 'superintendent', 'Email TBD. Conti Field superintendent seat.'),
      ('Mike Ryan Roberts', '', 'architect_liaison', 'Email TBD. Architect liaison for design and document RFIs.'),
      ('Braden Farmer', 'Braden.Farmer@continentalcando.com', 'distributor', 'Distributor seat. Pushes the logged RFI to the field and affected subcontractors.')
  ) as v(display_name, email, role, notes)
  where not exists (
    select 1
    from public.rfi_roster r
    where r.org_id = oid
      and r.project_id is null
      and lower(r.display_name) = lower(v.display_name)
      and r.role = v.role
  );

  insert into public.rfi_type_routes (org_id, rfi_type, label, target_role)
  select oid, v.rfi_type, v.label, v.target_role
  from (
    values
      ('design_docs', 'Design / documents', 'architect_liaison'),
      ('owner_decision', 'Owner decision', 'owner_liaison')
  ) as v(rfi_type, label, target_role)
  where not exists (
    select 1 from public.rfi_type_routes t
    where t.org_id = oid and t.rfi_type = v.rfi_type
  );
end;
$$;

do $$
declare
  org record;
begin
  for org in select id, created_by from public.orgs where created_by is not null
  loop
    perform public.seed_rfi_roster(org.id, org.created_by);
  end loop;
end
$$;

-- SAMPLE pipeline RFI. Citations are explicitly not from a drawing set.
create or replace function public.seed_sample_rfi_pipeline_for(uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  oid uuid;
  pid uuid;
  rid uuid;
begin
  if uid is null then
    return;
  end if;

  select m.org_id into oid
  from public.org_members m
  where m.user_id = uid and m.role = 'conti_staff'
  limit 1;

  if oid is null then
    return;
  end if;

  perform public.seed_rfi_roster(oid, uid);

  select id into pid
  from public.projects
  where name = 'SAMPLE Data Center'
    and (user_id = uid or org_id = oid)
  limit 1;

  if pid is null then
    return;
  end if;

  if exists (select 1 from public.rfi_items where project_id = pid and number = 'RFI-P01') then
    return;
  end if;

  insert into public.rfi_items (
    org_id, project_id, user_id, number, subject, question, improved_question, citations, doc_review_notes,
    docs_already_answer, urgency, rfi_type, route_role, from_name, to_name, date_required,
    cost_impact, schedule_impact, status, teams_docs_url, cost_ping_note, selected_outcome
  )
  values (
    oid,
    pid,
    uid,
    'RFI-P01',
    'SAMPLE — Switchgear working clearance',
    'SAMPLE — What working clearance is required at the main switchgear?',
    'SAMPLE — Confirm the working clearance at the main switchgear and whether the equipment pad must move before the pour.',
    'SAMPLE only. Not from a drawing set. Do not treat these words as a sheet citation. Paste verbatim quotes and printed sheet labels from Teams before issuing a live RFI.',
    'ContiRFI agent handoff is stubbed. Paste citations from the Teams file set. Quote the printed sheet label and the words on the sheet. Hub does not invent an answer or a sheet number. If the documents already answer the question, close it with the drafter and do not issue.',
    false,
    'normal',
    'design_docs',
    'architect_liaison',
    'SAMPLE — Conti field',
    'Mike Ryan Roberts',
    current_date + 5,
    'unknown',
    'unknown',
    'outcomes',
    'https://teams.microsoft.com/l/channel/SAMPLE-data-center-drawings',
    'Cost ping: review with estimating before the official response changes the job. Do not commit money or sign a change order from this RFI.',
    'SAMPLE — Revise the clearance detail and confirm cost and schedule before work continues.'
  )
  returning id into rid;

  insert into public.rfi_outcomes (rfi_id, label, sort_order, selected)
  values
    (rid, 'SAMPLE — Proceed as drawn. No change to cost or schedule.', 0, false),
    (rid, 'SAMPLE — Revise the clearance detail and confirm cost and schedule before work continues.', 1, true),
    (rid, 'SAMPLE — Hold the affected work until the official response is logged.', 2, false);
end;
$$;

create or replace function public.seed_sample_rfi_pipeline()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in required';
  end if;
  perform public.seed_sample_rfi_pipeline_for(auth.uid());
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
  perform public.seed_sample_rfi_pipeline_for(auth.uid());
end;
$$;

revoke all on function public.seed_rfi_roster(uuid, uuid) from public;
revoke all on function public.seed_sample_rfi_pipeline_for(uuid) from public;
revoke all on function public.seed_sample_rfi_pipeline() from public;
revoke all on function public.seed_full_court_press_sample() from public;
grant execute on function public.seed_sample_rfi_pipeline() to authenticated;
grant execute on function public.seed_full_court_press_sample() to authenticated;

do $$
declare
  uid uuid;
begin
  for uid in select distinct user_id from public.projects
  loop
    perform public.seed_full_court_press_sample_for(uid);
    perform public.seed_sample_rfi_pipeline_for(uid);
  end loop;
end
$$;
