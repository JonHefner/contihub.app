-- ContiHub Projects. Apply in the Supabase SQL editor AFTER
--   20260909060000_conti_suite.sql
--   20260909160000_contifield_daily_log.sql
-- or with the Supabase CLI (`supabase db push`).
-- Adds a projects table, nullable project_id on suite tables, and seeds a
-- "Data Center" project per user so existing sample rows attach to it.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  name text not null,
  job_number text not null default '',
  address text not null default '',
  status text not null default 'Active' check (status in ('Active', 'Bidding', 'On Hold', 'Closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id, created_at desc);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

drop policy if exists projects_select_own on public.projects;
create policy projects_select_own on public.projects
for select using (auth.uid() = user_id);

drop policy if exists projects_insert_own on public.projects;
create policy projects_insert_own on public.projects
for insert with check (auth.uid() = user_id and auth.uid() = created_by);

drop policy if exists projects_update_own on public.projects;
create policy projects_update_own on public.projects
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists projects_delete_own on public.projects;
create policy projects_delete_own on public.projects
for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.projects to authenticated;

alter table public.crm_leads
  add column if not exists project_id uuid references public.projects (id) on delete set null;
alter table public.field_reports
  add column if not exists project_id uuid references public.projects (id) on delete set null;
alter table public.field_jobs
  add column if not exists project_id uuid references public.projects (id) on delete set null;
alter table public.field_rfis
  add column if not exists project_id uuid references public.projects (id) on delete set null;
alter table public.cost_jobs
  add column if not exists project_id uuid references public.projects (id) on delete set null;
alter table public.safety_logs
  add column if not exists project_id uuid references public.projects (id) on delete set null;
alter table public.trak_milestones
  add column if not exists project_id uuid references public.projects (id) on delete set null;
alter table public.bid_chases
  add column if not exists project_id uuid references public.projects (id) on delete set null;

create index if not exists crm_leads_project_id_idx on public.crm_leads (project_id);
create index if not exists field_reports_project_id_idx on public.field_reports (project_id);
create index if not exists field_jobs_project_id_idx on public.field_jobs (project_id);
create index if not exists field_rfis_project_id_idx on public.field_rfis (project_id);
create index if not exists cost_jobs_project_id_idx on public.cost_jobs (project_id);
create index if not exists safety_logs_project_id_idx on public.safety_logs (project_id);
create index if not exists trak_milestones_project_id_idx on public.trak_milestones (project_id);
create index if not exists bid_chases_project_id_idx on public.bid_chases (project_id);

-- Seed one Data Center project per user who already has suite rows, then attach
-- unassigned rows (and any row whose text mentions "data center").
do $$
declare
  uid uuid;
  pid uuid;
begin
  for uid in
    select distinct user_id from (
      select user_id from public.crm_leads
      union select user_id from public.field_reports
      union select user_id from public.field_jobs
      union select user_id from public.field_rfis
      union select user_id from public.cost_jobs
      union select user_id from public.safety_logs
      union select user_id from public.trak_milestones
      union select user_id from public.bid_chases
    ) owners
  loop
    select id into pid
    from public.projects
    where user_id = uid and lower(name) = 'data center'
    limit 1;

    if pid is null then
      insert into public.projects (user_id, created_by, name, job_number, address, status)
      select
        uid,
        uid,
        'Data Center',
        coalesce((
          select job_number from public.field_jobs
          where user_id = uid
            and (job_title ilike '%data center%' or job_number <> '')
          order by updated_at desc
          limit 1
        ), ''),
        coalesce((
          select address from public.field_jobs
          where user_id = uid
            and (job_title ilike '%data center%' or address <> '')
          order by updated_at desc
          limit 1
        ), ''),
        'Active'
      returning id into pid;
    end if;

    update public.crm_leads
      set project_id = pid
      where user_id = uid
        and (
          project_id is null
          or name ilike '%data center%'
          or company ilike '%data center%'
          or notes ilike '%data center%'
        );

    update public.field_reports
      set project_id = pid
      where user_id = uid
        and (project_id is null or job_name ilike '%data center%');

    update public.field_jobs
      set project_id = pid
      where user_id = uid
        and (project_id is null or job_title ilike '%data center%');

    update public.field_rfis
      set project_id = pid
      where user_id = uid
        and (project_id is null or title ilike '%data center%' or description ilike '%data center%');

    update public.cost_jobs
      set project_id = pid
      where user_id = uid
        and (project_id is null or job ilike '%data center%');

    update public.safety_logs
      set project_id = pid
      where user_id = uid
        and (project_id is null or location ilike '%data center%' or notes ilike '%data center%');

    update public.trak_milestones
      set project_id = pid
      where user_id = uid
        and (project_id is null or activity ilike '%data center%');

    update public.bid_chases
      set project_id = pid
      where user_id = uid
        and (project_id is null or project ilike '%data center%');
  end loop;
end
$$;
