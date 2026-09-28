-- Confirmed ContiRFI roster emails.
-- Safe to run after 20260928120000, including when that file was applied with the
-- earlier placeholders (Anne Saccone, Mike, Mike Ryan Roberts, blank emails).

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

  update public.rfi_roster
  set display_name = 'Ann Saccone', email = 'ann.saccone@continentalcando.com'
  where org_id = oid and project_id is null and role in ('admin', 'intake_reviewer')
    and lower(display_name) in ('anne saccone', 'ann saccone');

  update public.rfi_roster
  set display_name = 'Michael Might',
      email = 'michael.might@continentalcando.com',
      notes = 'Conti Field superintendent seat.'
  where org_id = oid and project_id is null and role = 'superintendent'
    and (lower(display_name) = 'michael might' or (lower(display_name) = 'mike' and email = ''));

  update public.rfi_roster
  set display_name = 'Ryan Roberts',
      email = 'ryan.roberts@continentalcando.com',
      notes = 'Architect liaison for design and document RFIs.'
  where org_id = oid and project_id is null and role = 'architect_liaison'
    and lower(display_name) in ('mike ryan roberts', 'ryan roberts');

  insert into public.rfi_roster (org_id, user_id, display_name, email, role, notes)
  select oid, uid, v.display_name, v.email, v.role, v.notes
  from (
    values
      ('Ann Saccone', 'ann.saccone@continentalcando.com', 'admin', 'Admin seat. Add or remove people by setting the roster row inactive.'),
      ('Ann Saccone', 'ann.saccone@continentalcando.com', 'intake_reviewer', 'Intake reviewer.'),
      ('Michael Might', 'michael.might@continentalcando.com', 'superintendent', 'Conti Field superintendent seat.'),
      ('Ryan Roberts', 'ryan.roberts@continentalcando.com', 'architect_liaison', 'Architect liaison for design and document RFIs.'),
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

revoke all on function public.seed_rfi_roster(uuid, uuid) from public;

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

update public.rfi_items
set to_name = 'Ryan Roberts'
where to_name = 'Mike Ryan Roberts';
