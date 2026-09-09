-- Conti suite MVP tables. Apply in the Supabase SQL editor or with the Supabase CLI:
--   supabase db push
-- Each row is scoped to auth.users via RLS. No extra env vars are required.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  company text not null default '',
  stage text not null default 'Lead',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.field_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  report_date date not null,
  job_name text not null,
  weather text not null default '',
  notes text not null default '',
  crew_count integer not null default 0 check (crew_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cost_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job text not null,
  budget numeric(14, 2) not null default 0 check (budget >= 0),
  committed numeric(14, 2) not null default 0 check (committed >= 0),
  actual numeric(14, 2) not null default 0 check (actual >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.safety_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_type text not null,
  entry_date date not null,
  location text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trak_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  activity text not null,
  start_date date not null,
  finish_date date not null,
  percent_complete integer not null default 0 check (percent_complete >= 0 and percent_complete <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bid_chases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project text not null,
  due_date date not null,
  status text not null default 'Tracking',
  estimate_value numeric(14, 2) not null default 0 check (estimate_value >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_leads_user_id_idx on public.crm_leads (user_id, created_at desc);
create index if not exists field_reports_user_id_idx on public.field_reports (user_id, report_date desc);
create index if not exists cost_jobs_user_id_idx on public.cost_jobs (user_id, created_at desc);
create index if not exists safety_logs_user_id_idx on public.safety_logs (user_id, entry_date desc);
create index if not exists trak_milestones_user_id_idx on public.trak_milestones (user_id, start_date);
create index if not exists bid_chases_user_id_idx on public.bid_chases (user_id, due_date);

drop trigger if exists crm_leads_set_updated_at on public.crm_leads;
create trigger crm_leads_set_updated_at
before update on public.crm_leads
for each row execute function public.set_updated_at();

drop trigger if exists field_reports_set_updated_at on public.field_reports;
create trigger field_reports_set_updated_at
before update on public.field_reports
for each row execute function public.set_updated_at();

drop trigger if exists cost_jobs_set_updated_at on public.cost_jobs;
create trigger cost_jobs_set_updated_at
before update on public.cost_jobs
for each row execute function public.set_updated_at();

drop trigger if exists safety_logs_set_updated_at on public.safety_logs;
create trigger safety_logs_set_updated_at
before update on public.safety_logs
for each row execute function public.set_updated_at();

drop trigger if exists trak_milestones_set_updated_at on public.trak_milestones;
create trigger trak_milestones_set_updated_at
before update on public.trak_milestones
for each row execute function public.set_updated_at();

drop trigger if exists bid_chases_set_updated_at on public.bid_chases;
create trigger bid_chases_set_updated_at
before update on public.bid_chases
for each row execute function public.set_updated_at();

alter table public.crm_leads enable row level security;
alter table public.field_reports enable row level security;
alter table public.cost_jobs enable row level security;
alter table public.safety_logs enable row level security;
alter table public.trak_milestones enable row level security;
alter table public.bid_chases enable row level security;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'crm_leads',
    'field_reports',
    'cost_jobs',
    'safety_logs',
    'trak_milestones',
    'bid_chases'
  ]
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      tbl || '_select_own',
      tbl
    );
    execute format(
      'create policy %I on public.%I for select using (auth.uid() = user_id)',
      tbl || '_select_own',
      tbl
    );

    execute format(
      'drop policy if exists %I on public.%I',
      tbl || '_insert_own',
      tbl
    );
    execute format(
      'create policy %I on public.%I for insert with check (auth.uid() = user_id)',
      tbl || '_insert_own',
      tbl
    );

    execute format(
      'drop policy if exists %I on public.%I',
      tbl || '_update_own',
      tbl
    );
    execute format(
      'create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      tbl || '_update_own',
      tbl
    );

    execute format(
      'drop policy if exists %I on public.%I',
      tbl || '_delete_own',
      tbl
    );
    execute format(
      'create policy %I on public.%I for delete using (auth.uid() = user_id)',
      tbl || '_delete_own',
      tbl
    );
  end loop;
end
$$;

grant select, insert, update, delete on public.crm_leads to authenticated;
grant select, insert, update, delete on public.field_reports to authenticated;
grant select, insert, update, delete on public.cost_jobs to authenticated;
grant select, insert, update, delete on public.safety_logs to authenticated;
grant select, insert, update, delete on public.trak_milestones to authenticated;
grant select, insert, update, delete on public.bid_chases to authenticated;
