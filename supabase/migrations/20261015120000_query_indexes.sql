-- Read-path indexes only. No table changes, no policy changes, no drops.
-- Apply after 20260928140000_contireview_naming.sql.

-- Session lookup: claim_my_access and the signed-in membership check filter
-- by user id or email, not by organization first.
create index if not exists org_members_user_id_idx
  on public.org_members (user_id);

create index if not exists org_members_email_lower_idx
  on public.org_members (lower(email));

-- Project boards filter on project_id and sort on the same column the app orders by.
create index if not exists crm_leads_project_created_idx
  on public.crm_leads (project_id, created_at desc);

create index if not exists field_reports_project_date_idx
  on public.field_reports (project_id, report_date desc);

create index if not exists field_jobs_project_updated_idx
  on public.field_jobs (project_id, updated_at desc);

create index if not exists field_rfis_project_due_idx
  on public.field_rfis (project_id, due_date);

create index if not exists cost_jobs_project_created_idx
  on public.cost_jobs (project_id, created_at desc);

create index if not exists safety_logs_project_created_idx
  on public.safety_logs (project_id, created_at desc);

create index if not exists trak_milestones_project_created_idx
  on public.trak_milestones (project_id, created_at desc);

create index if not exists bid_chases_project_created_idx
  on public.bid_chases (project_id, created_at desc);

create index if not exists change_orders_project_number_idx
  on public.change_orders (project_id, number);

-- Hub pulse lists every package by due date, not by project.
create index if not exists bid_packages_due_at_idx
  on public.bid_packages (due_at);

-- ContiReview outcomes and distributions are always loaded by RFI.
create index if not exists rfi_outcomes_rfi_sort_idx
  on public.rfi_outcomes (rfi_id, sort_order);

create index if not exists rfi_distributions_rfi_idx
  on public.rfi_distributions (rfi_id);

create index if not exists rfi_items_number_idx
  on public.rfi_items (number);
