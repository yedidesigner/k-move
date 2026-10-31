-- Run this COMPLETE file as the database owner after kmove-promises-setup.sql.
-- No DDL. All synthetic accounts, profiles and promises are rolled back.
-- Synthetic users have no email, phone, password, identity or login session.
-- Expected authorization/validation errors are caught; every other failure
-- aborts the transaction. Never run the final constant SELECT by itself.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';

do $$
declare
  admin_role text := current_user;
  owner_id uuid := gen_random_uuid();
  other_id uuid := gen_random_uuid();
  instructor_id uuid := gen_random_uuid();
  initial_row record;
  saved_row record;
  test_case record;
  blocked boolean;
  affected integer;
  checks integer := 0;
begin
  -- 01: RLS is enabled; only the intended authenticated table grants exist.
  if (select relrowsecurity from pg_class where oid = 'public.kmove_promises'::regclass) is not true
    or not has_table_privilege('authenticated', 'public.kmove_promises', 'SELECT')
    or not has_table_privilege('authenticated', 'public.kmove_promises', 'INSERT')
    or not has_table_privilege('authenticated', 'public.kmove_promises', 'UPDATE')
    or has_table_privilege('authenticated', 'public.kmove_promises', 'DELETE,TRUNCATE,REFERENCES,TRIGGER')
    or has_table_privilege('anon', 'public.kmove_promises', 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
  then raise exception 'Check 01 failed: RLS or table grants'; end if;
  checks := checks + 1;

  insert into auth.users (id, raw_user_meta_data, created_at, updated_at)
  select id, jsonb_build_object('username', 'kmove-promise-verification-' || id::text), now(), now()
  from unnest(array[owner_id, other_id, instructor_id]) as synthetic(id);
  update public.kmove_profiles set role = 'instructor' where id = instructor_id;
  if (select count(*) from public.kmove_profiles where id in (owner_id, other_id, instructor_id)) <> 3
  then raise exception 'Synthetic profile setup failed'; end if;

  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', owner_id::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', owner_id, 'role', 'authenticated')::text, true);

  -- 02: The owner can insert and read their own promise.
  insert into public.kmove_promises (user_id, content, created_at, updated_at)
  values (owner_id, '처음 작성한 약속', '1900-01-01'::timestamptz, '1901-01-01'::timestamptz)
  returning * into initial_row;
  if (select content from public.kmove_promises where user_id = owner_id) is distinct from '처음 작성한 약속'
  then raise exception 'Check 02 failed: owner insert/read'; end if;
  checks := checks + 1;

  -- 03: Client-supplied timestamps are replaced on insert.
  if initial_row.created_at is distinct from statement_timestamp()
    or initial_row.updated_at is distinct from statement_timestamp()
  then raise exception 'Check 03 failed: insert timestamps'; end if;
  checks := checks + 1;

  -- 04: The same API-style upsert edits exactly one existing row.
  insert into public.kmove_promises (user_id, content, created_at, updated_at)
  values (owner_id, '수정된 나의 약속', '1902-01-01'::timestamptz, '1903-01-01'::timestamptz)
  on conflict (user_id) do update
  set content = excluded.content, created_at = excluded.created_at, updated_at = excluded.updated_at
  returning * into saved_row;
  if saved_row.content is distinct from '수정된 나의 약속'
    or (select count(*) from public.kmove_promises) <> 1
  then raise exception 'Check 04 failed: owner upsert'; end if;
  checks := checks + 1;

  -- 05: Upserts and direct updates preserve creation time and use server time.
  if saved_row.created_at is distinct from initial_row.created_at
    or saved_row.updated_at is distinct from statement_timestamp()
  then raise exception 'Check 05 failed: upsert timestamps'; end if;
  update public.kmove_promises
  set created_at = '1904-01-01'::timestamptz, updated_at = '1905-01-01'::timestamptz
  where user_id = owner_id returning * into saved_row;
  if saved_row.created_at is distinct from initial_row.created_at
    or saved_row.updated_at is distinct from statement_timestamp()
  then raise exception 'Check 05 failed: direct-update timestamps'; end if;
  checks := checks + 1;

  -- 06: Even the owner cannot transfer ownership to another account.
  blocked := false;
  begin
    update public.kmove_promises set user_id = instructor_id where user_id = owner_id;
  exception when insufficient_privilege then blocked := true;
  end;
  if not blocked then raise exception 'Check 06 failed: ownership reassignment accepted'; end if;
  checks := checks + 1;

  -- 07: Empty, whitespace-only, null and overlong input are rejected by the DB.
  for test_case in
    select * from (values
      ('empty', ''::text, '23514'),
      ('whitespace', E' \t\n\r ', '23514'),
      ('null', null::text, '23502'),
      ('overlong', repeat('가', 501), '23514')
    ) as cases(label, content, expected_state)
  loop
    blocked := false;
    begin
      update public.kmove_promises set content = test_case.content where user_id = owner_id;
    exception when check_violation or not_null_violation then
      blocked := sqlstate = test_case.expected_state;
    end;
    if not blocked then raise exception 'Check 07 failed: % input validation', test_case.label; end if;
  end loop;
  checks := checks + 1;

  -- 08: Both supported length boundaries work, including Korean characters.
  update public.kmove_promises set content = repeat('가', 500) where user_id = owner_id returning * into saved_row;
  if char_length(saved_row.content) is distinct from 500 then raise exception 'Check 08 failed: maximum length'; end if;
  update public.kmove_promises set content = '가' where user_id = owner_id returning * into saved_row;
  if saved_row.content is distinct from '가' then raise exception 'Check 08 failed: minimum length'; end if;
  update public.kmove_promises set content = '수정된 나의 약속' where user_id = owner_id;
  checks := checks + 1;

  -- 09: Delete is not granted, even to the owner.
  blocked := false;
  begin
    delete from public.kmove_promises where user_id = owner_id;
  exception when insufficient_privilege then blocked := true;
  end;
  if not blocked then raise exception 'Check 09 failed: owner could delete'; end if;
  checks := checks + 1;

  perform set_config('request.jwt.claim.sub', other_id::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', other_id, 'role', 'authenticated')::text, true);

  -- 10: The second student has working permissions for their own row.
  insert into public.kmove_promises (user_id, content) values (other_id, '다른 수강생의 약속');
  if (select count(*) from public.kmove_promises) <> 1
    or (select content from public.kmove_promises where user_id = other_id) is distinct from '다른 수강생의 약속'
  then raise exception 'Check 10 failed: second-user own access'; end if;
  checks := checks + 1;

  -- 11: The second student cannot read the owner's promise.
  if exists (select 1 from public.kmove_promises where user_id = owner_id)
  then raise exception 'Check 11 failed: cross-user read'; end if;
  checks := checks + 1;

  -- 12: Cross-user INSERT is blocked; use an unused ID to avoid uniqueness errors.
  blocked := false;
  begin
    insert into public.kmove_promises (user_id, content) values (instructor_id, '금지된 작성');
  exception when insufficient_privilege then blocked := true;
  end;
  if not blocked then raise exception 'Check 12 failed: cross-user insert'; end if;
  checks := checks + 1;

  -- 13: Cross-user upsert cannot overwrite the existing owner row.
  blocked := false;
  begin
    insert into public.kmove_promises (user_id, content) values (owner_id, '금지된 수정')
    on conflict (user_id) do update set content = excluded.content;
  exception when insufficient_privilege then blocked := true;
  end;
  if not blocked then raise exception 'Check 13 failed: cross-user upsert'; end if;
  checks := checks + 1;

  -- 14: A direct cross-user UPDATE affects zero rows under RLS.
  update public.kmove_promises set content = '금지된 수정' where user_id = owner_id;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Check 14 failed: cross-user update'; end if;
  checks := checks + 1;

  perform set_config('request.jwt.claim.sub', instructor_id::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', instructor_id, 'role', 'authenticated')::text, true);

  -- 15: A real instructor profile gets neither read nor UPDATE access to others.
  if (select role from public.kmove_profiles where id = instructor_id) is distinct from 'instructor'
    or exists (select 1 from public.kmove_promises where user_id = owner_id)
  then raise exception 'Check 15 failed: instructor identity/read scope'; end if;
  update public.kmove_promises set content = '강사의 금지된 수정' where user_id = owner_id;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Check 15 failed: instructor update'; end if;
  checks := checks + 1;

  -- 16: The instructor cannot use upsert as an alternative editing path.
  blocked := false;
  begin
    insert into public.kmove_promises (user_id, content) values (owner_id, '강사의 금지된 수정')
    on conflict (user_id) do update set content = excluded.content;
  exception when insufficient_privilege then blocked := true;
  end;
  if not blocked then raise exception 'Check 16 failed: instructor upsert'; end if;
  checks := checks + 1;

  -- 17: The authenticated DB role alone is insufficient without a valid subject.
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '{"role":"authenticated"}', true);
  if auth.uid() is not null or exists (select 1 from public.kmove_promises)
  then raise exception 'Check 17 failed: missing-identity read'; end if;
  blocked := false;
  begin
    insert into public.kmove_promises (user_id, content) values (instructor_id, '신원 없는 작성');
  exception when insufficient_privilege then blocked := true;
  end;
  if not blocked then raise exception 'Check 17 failed: missing-identity insert'; end if;
  checks := checks + 1;

  -- 18: Anonymous SELECT/INSERT/UPDATE/DELETE are all denied by table grants.
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  for test_case in
    select * from (values
      ('select', 'select * from public.kmove_promises'),
      ('insert', format('insert into public.kmove_promises (user_id, content) values (%L::uuid, %L)', owner_id, '익명의 작성')),
      ('update', format('update public.kmove_promises set content = %L where user_id = %L::uuid', '익명의 수정', owner_id)),
      ('delete', format('delete from public.kmove_promises where user_id = %L::uuid', owner_id))
    ) as cases(label, statement)
  loop
    blocked := false;
    begin
      execute test_case.statement;
    exception when insufficient_privilege then blocked := true;
    end;
    if not blocked then raise exception 'Check 18 failed: anonymous %', test_case.label; end if;
  end loop;
  checks := checks + 1;

  -- 19: All attacks left the owner's data intact and created no extra promises.
  perform set_config('role', admin_role, true);
  if (select content from public.kmove_promises where user_id = owner_id) is distinct from '수정된 나의 약속'
    or (select count(*) from public.kmove_promises where user_id in (owner_id, other_id, instructor_id)) <> 2
    or exists (select 1 from public.kmove_promises where user_id = instructor_id)
    or (select count(*) from auth.users where id in (owner_id, other_id, instructor_id)
        and email is null and phone is null and encrypted_password is null) <> 3
  then raise exception 'Check 19 failed: final state or synthetic credentials'; end if;
  checks := checks + 1;

  if checks <> 19 then raise exception 'Incomplete verification: % / 19', checks; end if;
end;
$$;

rollback;
select 'PASS' as result, 19 as checks_passed,
  'All synthetic accounts, profiles and promises rolled back; no persistent test objects created.' as cleanup;
