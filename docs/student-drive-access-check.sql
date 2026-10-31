-- Run as the database operator. The transaction is always rolled back.
-- Test all mapped students, the instructor, an unmapped student, and anon.
begin;
do $$
declare
  accounts jsonb;
  account jsonb;
  visible_count integer;
  expected_count integer;
  total_count integer;
begin
  select count(*) into total_count from public.kmove_student_drive_folders;
  if total_count <> 15 then raise exception 'Expected the current 15-person cohort'; end if;
  select jsonb_agg(jsonb_build_object('id', p.id, 'role', p.role,
    'mapped', exists(select 1 from public.kmove_student_drive_folders f where f.user_id=p.id)))
  into accounts from public.kmove_profiles p;

  for account in select value from jsonb_array_elements(accounts) loop
    perform set_config('request.jwt.claims', jsonb_build_object('sub',account->>'id','role','authenticated')::text, true);
    perform set_config('role', 'authenticated', true);
    expected_count := case when account->>'role'='instructor' then total_count
      when (account->>'mapped')::boolean then 1 else 0 end;
    select count(*) into visible_count from public.kmove_student_drive_folders;
    if visible_count <> expected_count then raise exception 'Wrong visible folder count for %',account->>'id'; end if;
    if account->>'role' <> 'instructor' and exists (
      select 1 from public.kmove_student_drive_folders where user_id <> (account->>'id')::uuid
    ) then raise exception 'Cross-student folder access'; end if;

    -- Even an authenticated instructor cannot rewrite server-owned mappings through the Data API.
    begin
      update public.kmove_student_drive_folders set sharing_ready=true where false;
      raise exception 'UPDATE privilege should be denied';
    exception when insufficient_privilege then null; end;
    begin
      delete from public.kmove_student_drive_folders where false;
      raise exception 'DELETE privilege should be denied';
    exception when insufficient_privilege then null; end;
    begin
      insert into public.kmove_student_drive_folders select * from public.kmove_student_drive_folders where false;
      raise exception 'INSERT privilege should be denied';
    exception when insufficient_privilege then null; end;
    perform set_config('role', 'postgres', true);
  end loop;

  perform set_config('request.jwt.claims', '{}', true);
  perform set_config('role', 'anon', true);
  begin
    perform count(*) from public.kmove_student_drive_folders;
    raise exception 'Anonymous read should be denied';
  exception when insufficient_privilege then null; end;
  perform set_config('role', 'postgres', true);
end $$;
rollback;
select 'PASS: all accounts isolated, instructor reads cohort, anonymous and mapping writes denied' as result;
