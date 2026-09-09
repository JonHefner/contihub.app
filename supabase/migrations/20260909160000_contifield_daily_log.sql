-- ContiField daily construction log. Apply in the Supabase SQL editor AFTER
-- 20260909060000_conti_suite.sql, or with the Supabase CLI:
--   supabase db push
-- Extends field_reports and adds field_jobs + field_rfis. Same RLS pattern.

alter table public.field_reports
  add column if not exists weather_pm text not null default '',
  add column if not exists temp_low text not null default '',
  add column if not exists temp_high text not null default '',
  add column if not exists precip text not null default '',
  add column if not exists wind text not null default '',
  add column if not exists ground text not null default 'Dry',
  add column if not exists man_hours numeric(10, 1) not null default 0,
  add column if not exists work_performed text not null default '',
  add column if not exists delays text not null default '',
  add column if not exists materials text not null default '',
  add column if not exists visitors text not null default '',
  add column if not exists prepared_by text not null default '',
  add column if not exists prepared_title text not null default '',
  add column if not exists shift_start text not null default '',
  add column if not exists shift_end text not null default '',
  add column if not exists status text not null default 'draft';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'field_reports_status_check'
  ) then
    alter table public.field_reports
      add constraint field_reports_status_check
      check (status in ('draft', 'final'));
  end if;
end
$$;

create table if not exists public.field_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_name text not null default 'Continental Construction of Ohio',
  job_title text not null default '',
  job_number text not null default '',
  address text not null default '',
  client text not null default '',
  superintendent text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.field_rfis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  number text not null,
  title text not null,
  description text not null default '',
  status text not null default 'open' check (status in ('open', 'closed')),
  due_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists field_jobs_user_id_idx on public.field_jobs (user_id, updated_at desc);
create index if not exists field_rfis_user_id_idx on public.field_rfis (user_id, due_date);

drop trigger if exists field_jobs_set_updated_at on public.field_jobs;
create trigger field_jobs_set_updated_at
before update on public.field_jobs
for each row execute function public.set_updated_at();

drop trigger if exists field_rfis_set_updated_at on public.field_rfis;
create trigger field_rfis_set_updated_at
before update on public.field_rfis
for each row execute function public.set_updated_at();

alter table public.field_jobs enable row level security;
alter table public.field_rfis enable row level security;

do $$
declare
  tbl text;
begin
  foreach tbl in array array['field_jobs', 'field_rfis']
  loop
    execute format('drop policy if exists %I on public.%I', tbl || '_select_own', tbl);
    execute format(
      'create policy %I on public.%I for select using (auth.uid() = user_id)',
      tbl || '_select_own',
      tbl
    );

    execute format('drop policy if exists %I on public.%I', tbl || '_insert_own', tbl);
    execute format(
      'create policy %I on public.%I for insert with check (auth.uid() = user_id)',
      tbl || '_insert_own',
      tbl
    );

    execute format('drop policy if exists %I on public.%I', tbl || '_update_own', tbl);
    execute format(
      'create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      tbl || '_update_own',
      tbl
    );

    execute format('drop policy if exists %I on public.%I', tbl || '_delete_own', tbl);
    execute format(
      'create policy %I on public.%I for delete using (auth.uid() = user_id)',
      tbl || '_delete_own',
      tbl
    );
  end loop;
end
$$;

grant select, insert, update, delete on public.field_jobs to authenticated;
grant select, insert, update, delete on public.field_rfis to authenticated;
