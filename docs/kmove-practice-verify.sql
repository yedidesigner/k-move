-- Run this COMPLETE file as database owner after kmove-practice-setup.sql.
-- Uses two already-enrolled students and one instructor internally; no account,
-- password, auth session, enrollment, or real file is created or changed.
-- New test messages are rolled back before they can become visible to Realtime.
-- Storage policies are evaluated against candidate rows; Storage metadata is
-- never inserted/deleted through SQL. A real upload should also be checked via
-- the Storage API before release. Do not run the final PASS SELECT by itself.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '45s';

do $$
declare
  admin_role text := current_user;
  student_a uuid;
  student_b uuid;
  teacher uuid;
  outsider uuid := gen_random_uuid();
  expected_name text;
  root_a uuid := gen_random_uuid();
  root_b uuid := gen_random_uuid();
  reply_b uuid := gen_random_uuid();
  teacher_message uuid := gen_random_uuid();
  file_id uuid := gen_random_uuid();
  unposted_id uuid := gen_random_uuid();
  own_path text;
  peer_path text;
  tombstone_path text;
  pending_peer_path text;
  storage_read_policy text;
  storage_delete_policy text;
  initial_row public.kmove_practice_messages;
  saved_row public.kmove_practice_messages;
  policy record;
  test_case record;
  blocked boolean;
  allowed boolean;
  affected integer;
  checks integer := 0;
  original_messages bigint;
  original_profiles bigint;
  original_enrollments bigint;
begin
  select p.id, left(coalesce(nullif(btrim(e.name), ''), nullif(btrim(p.username), ''), '수강생'), 100)
    into student_a, expected_name
  from public.kmove_profiles p join public.kmove_enrollments e on e.user_id = p.id
  where p.role = 'student' and e.status in ('active', 'completed') order by p.id limit 1;
  select p.id into student_b
  from public.kmove_profiles p join public.kmove_enrollments e on e.user_id = p.id
  where p.role = 'student' and e.status in ('active', 'completed') and p.id <> student_a order by p.id limit 1;
  select p.id into teacher from public.kmove_profiles p where p.role = 'instructor' order by p.id limit 1;
  if student_a is null or student_b is null or teacher is null then
    raise exception 'Verification requires two existing enrolled students and one instructor.';
  end if;
  if exists (select 1 from auth.users where id = outsider) then
    raise exception 'Generated nonmember identity unexpectedly exists; rerun verification.';
  end if;
  select count(*) into original_messages from public.kmove_practice_messages;
  select count(*) into original_profiles from public.kmove_profiles;
  select count(*) into original_enrollments from public.kmove_enrollments;

  -- 01. RLS and column privileges protect identity fields and hard deletion.
  if (select relrowsecurity from pg_class where oid = 'public.kmove_practice_messages'::regclass) is not true
    or not has_table_privilege('authenticated', 'public.kmove_practice_messages', 'SELECT')
    or not has_table_privilege('authenticated', 'public.kmove_practice_messages', 'INSERT')
    or not has_column_privilege('authenticated', 'public.kmove_practice_messages', 'body', 'UPDATE')
    or has_column_privilege('authenticated', 'public.kmove_practice_messages', 'author_id', 'UPDATE')
    or has_table_privilege('authenticated', 'public.kmove_practice_messages', 'DELETE,TRUNCATE,TRIGGER,REFERENCES')
    or has_table_privilege('anon', 'public.kmove_practice_messages', 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,TRIGGER,REFERENCES') then
    raise exception 'Check 01 failed: message privileges or RLS.';
  end if;
  checks := checks + 1;

  -- 02. Files have their own private 10 MiB bucket; no overwrite policy exists.
  if not exists (select 1 from storage.buckets where id = 'kmove-practice-files'
    and public = false and file_size_limit = 10485760
    and 'image/png' = any(allowed_mime_types) and 'application/zip' = any(allowed_mime_types))
    or (select count(*) from pg_policies where schemaname = 'storage' and policyname in (
      'Practice members read published files', 'Practice members upload own files',
      'Practice authors and instructors delete files')) <> 3
    or exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects'
      and permissive = 'PERMISSIVE' and cmd in ('ALL', 'UPDATE')) then
    raise exception 'Check 02 failed: private bucket or unexpected overwrite policy.';
  end if;
  select qual into storage_read_policy from pg_policies
    where schemaname = 'storage' and policyname = 'Practice members read published files';
  select qual into storage_delete_policy from pg_policies
    where schemaname = 'storage' and policyname = 'Practice authors and instructors delete files';
  checks := checks + 1;

  -- 03. Helpers stay invoker-only/private; durable messages are published.
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'private' and p.proname in ('is_kmove_practice_member', 'guard_kmove_practice_message') and p.prosecdef)
    or has_function_privilege('anon', 'private.is_kmove_practice_member()', 'EXECUTE')
    or not has_function_privilege('authenticated', 'private.is_kmove_practice_member()', 'EXECUTE')
    or not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'kmove_practice_messages') then
    raise exception 'Check 03 failed: helper privileges or Realtime publication.';
  end if;
  checks := checks + 1;

  perform set_config('request.jwt.claim.sub', student_a::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', student_a, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);

  -- 04. One atomic insert works with a title-less link. Snapshot spoofing is ignored.
  insert into public.kmove_practice_messages
    (id, session_number, author_id, author_name, author_role, body, links, created_at, updated_at)
  values (root_a, 3, student_a, 'forged instructor', 'instructor', '검증용 원글',
    '[{"url":"https://example.com/practice"}]', '1900-01-01', '1901-01-01')
  returning * into initial_row;
  if initial_row.author_name is distinct from expected_name or initial_row.author_role <> 'student'
    or initial_row.author_id <> student_a
    or not exists (select 1 from public.kmove_practice_messages where id = root_a
      and links -> 0 ->> 'url' = 'https://example.com/practice') then
    raise exception 'Check 04 failed: own insert, optional link title, or author snapshot.';
  end if;
  checks := checks + 1;

  -- 05. All persisted timestamps come from the database.
  if initial_row.created_at is distinct from statement_timestamp()
    or initial_row.updated_at is distinct from statement_timestamp() then
    raise exception 'Check 05 failed: timestamps.';
  end if;
  checks := checks + 1;

  -- 06. Retrying the same client message ID cannot duplicate a message.
  blocked := false;
  begin
    insert into public.kmove_practice_messages(id, session_number, author_id, body)
      values (root_a, 3, student_a, 'duplicate');
  exception when unique_violation then blocked := true;
  end;
  if not blocked then raise exception 'Check 06 failed: duplicate ID accepted.'; end if;
  checks := checks + 1;

  -- 07. Students cannot pin on INSERT or UPDATE.
  blocked := false;
  begin
    insert into public.kmove_practice_messages(session_number, author_id, body, is_pinned)
      values (3, student_a, 'forbidden pin', true);
  exception when insufficient_privilege then blocked := true;
  end;
  if not blocked then raise exception 'Check 07 failed: pinned student insert.'; end if;
  blocked := false;
  begin
    update public.kmove_practice_messages set is_pinned = true where id = root_a;
  exception when insufficient_privilege then blocked := true;
  end;
  if not blocked then raise exception 'Check 07 failed: student pin update.'; end if;
  checks := checks + 1;

  -- 08. Identity, parent, session and server timestamps cannot be reassigned.
  for test_case in select * from (values
    (format('author_id = %L::uuid', teacher)),
    ('author_name = ''forged name'''),
    ('author_role = ''instructor'''),
    ('session_number = 4'),
    (format('parent_id = %L::uuid', gen_random_uuid())),
    (format('id = %L::uuid', gen_random_uuid())),
    ('created_at = ''1900-01-01''::timestamptz'),
    ('updated_at = ''1900-01-01''::timestamptz')
  ) as cases(expression) loop
    blocked := false;
    begin
      execute 'update public.kmove_practice_messages set ' || test_case.expression || ' where id = $1' using root_a;
    exception when insufficient_privilege then blocked := true;
    end;
    if not blocked then raise exception 'Check 08 failed: protected field mutation.'; end if;
  end loop;
  checks := checks + 1;

  -- 09. Owners can edit their content while retaining session/author identity.
  update public.kmove_practice_messages set body = '수정한 검증용 원글',
    links = '[{"url":"https://example.com/edited","title":"수정한 링크"}]'
    where id = root_a returning * into saved_row;
  if saved_row.body <> '수정한 검증용 원글' or saved_row.author_name <> initial_row.author_name
    or saved_row.session_number <> 3 or saved_row.created_at <> initial_row.created_at then
    raise exception 'Check 09 failed: owner edit.';
  end if;
  checks := checks + 1;

  -- 10. Unsafe links, malformed JSON, overlong text and empty content are rejected.
  for test_case in select * from (values
    ('links = ''[{"url":"javascript:alert(1)"}]''::jsonb'),
    ('links = ''[{"url":"https://example.com/","title":3}]''::jsonb'),
    ('links = ''[{"url":"https://example.com/","extra":"hidden"}]''::jsonb'),
    ('links = ''{}''::jsonb'),
    ('attachments = ''{}''::jsonb'),
    ('body = repeat(''가'', 20001)'),
    ('body = E'' \n\t '', links = ''[]''::jsonb, attachments = ''[]''::jsonb'),
    ('links = (select jsonb_agg(jsonb_build_object(''url'', ''https://example.com/'')) from generate_series(1, 11))'),
    ('attachments = (select jsonb_agg(''{}''::jsonb) from generate_series(1, 6))')
  ) as cases(expression) loop
    blocked := false;
    begin
      execute 'update public.kmove_practice_messages set ' || test_case.expression || ' where id = $1' using root_a;
    exception when check_violation then blocked := true;
    end;
    if not blocked then raise exception 'Check 10 failed: invalid content accepted.'; end if;
  end loop;
  checks := checks + 1;

  perform set_config('request.jwt.claim.sub', student_b::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', student_b, 'role', 'authenticated')::text, true);

  -- 11. Peers see shared messages, but existing private profiles remain private.
  if not exists (select 1 from public.kmove_practice_messages where id = root_a and author_name = expected_name)
    or exists (select 1 from public.kmove_profiles where id = student_a) then
    raise exception 'Check 11 failed: shared read or existing profile privacy.';
  end if;
  checks := checks + 1;

  -- 12. Peer edits, pinning and deletion-by-tombstone affect no rows under RLS.
  for test_case in select * from (values
    ('body = ''peer edit'''), ('is_pinned = true'), ('deleted_at = now()')
  ) as cases(expression) loop
    execute 'update public.kmove_practice_messages set ' || test_case.expression || ' where id = $1' using root_a;
    get diagnostics affected = row_count;
    if affected <> 0 then raise exception 'Check 12 failed: peer update reached a row.'; end if;
  end loop;
  checks := checks + 1;

  -- 13. A peer cannot insert as the original author.
  blocked := false;
  begin
    insert into public.kmove_practice_messages(session_number, author_id, body)
      values (3, student_a, 'forged author');
  exception when insufficient_privilege then blocked := true;
  end;
  if not blocked then raise exception 'Check 13 failed: cross-user insert.'; end if;
  checks := checks + 1;

  -- 14. Peers can reply directly to a shared root; links may omit title.
  insert into public.kmove_practice_messages(id, session_number, author_id, body, parent_id, links)
    values (reply_b, 3, student_b, '동료의 답글', root_a, '[{"url":"https://example.com/reply"}]');
  if not exists (select 1 from public.kmove_practice_messages where id = reply_b and parent_id = root_a) then
    raise exception 'Check 14 failed: peer reply.';
  end if;
  checks := checks + 1;

  -- 15. Replies cannot cross sessions, reply to replies, or point to a missing row.
  for test_case in select * from (values
    (4::smallint, root_a), (3::smallint, reply_b), (3::smallint, gen_random_uuid())
  ) as cases(session_number, parent_id) loop
    blocked := false;
    begin
      insert into public.kmove_practice_messages(session_number, author_id, body, parent_id)
        values (test_case.session_number, student_b, 'invalid reply', test_case.parent_id);
    exception when check_violation then blocked := true;
    end;
    if not blocked then raise exception 'Check 15 failed: invalid parent accepted.'; end if;
  end loop;
  checks := checks + 1;

  -- 16. Course members can enter another session without mixing its saved rows.
  insert into public.kmove_practice_messages(id, session_number, author_id, body)
    values (root_b, 4, student_b, '4회차 검증용 원글');
  if (select count(*) from public.kmove_practice_messages
    where session_number = 3 and id in (root_a, root_b, reply_b)) <> 2
    or exists (select 1 from public.kmove_practice_messages where session_number = 3 and id = root_b) then
    raise exception 'Check 16 failed: session filtering.';
  end if;
  checks := checks + 1;

  -- 17. Attachment ownership, size, format and real object existence are enforced.
  own_path := student_b::text || '/4/' || root_b::text || '/' || file_id::text || '.png';
  for test_case in select * from (values
    (own_path, 512::bigint, 'image/png', 'image'),
    (student_a::text || '/4/' || root_b::text || '/' || file_id::text || '.png', 512::bigint, 'image/png', 'image'),
    (own_path, 10485761::bigint, 'image/png', 'image'),
    (own_path, 512::bigint, 'text/html', 'image'),
    (own_path, 512::bigint, 'image/png', 'file')
  ) as cases(path, size, mime, kind) loop
    blocked := false;
    begin
      update public.kmove_practice_messages set attachments = jsonb_build_array(jsonb_build_object(
        'id', file_id, 'path', test_case.path, 'name', '검증.png', 'size', test_case.size,
        'mime', test_case.mime, 'kind', test_case.kind)) where id = root_b;
    exception when check_violation then blocked := true;
    end;
    if not blocked then raise exception 'Check 17 failed: forged or nonexistent attachment accepted.'; end if;
  end loop;
  checks := checks + 1;

  -- 18. Evaluate real stored Storage policies with candidate pending-upload rows.
  perform set_config('role', admin_role, true);
  own_path := student_a::text || '/3/' || unposted_id::text || '/' || file_id::text || '.png';
  peer_path := student_b::text || '/4/' || unposted_id::text || '/' || file_id::text || '.png';
  for policy in select policyname, cmd, coalesce(qual, with_check) expression from pg_policies
    where schemaname = 'storage' and policyname in ('Practice members read published files',
      'Practice members upload own files', 'Practice authors and instructors delete files') loop
    perform set_config('request.jwt.claim.sub', student_a::text, true);
    perform set_config('request.jwt.claims', jsonb_build_object('sub', student_a, 'role', 'authenticated')::text, true);
    perform set_config('role', 'authenticated', true);
    execute 'select ' || policy.expression || ' from (select $1::text bucket_id, $2::text name, $3::text owner_id) objects'
      into allowed using 'kmove-practice-files', own_path, student_a::text;
    if allowed is distinct from true then raise exception 'Check 18 failed: own %.', policy.cmd; end if;
    execute 'select ' || policy.expression || ' from (select $1::text bucket_id, $2::text name, $3::text owner_id) objects'
      into allowed using 'kmove-practice-files', peer_path, student_b::text;
    if allowed is distinct from false then raise exception 'Check 18 failed: peer pending %.', policy.cmd; end if;
    execute 'select ' || policy.expression || ' from (select $1::text bucket_id, $2::text name, $3::text owner_id) objects'
      into allowed using 'different-bucket', own_path, student_a::text;
    if allowed is distinct from false then raise exception 'Check 18 failed: unrelated bucket.'; end if;
    if policy.cmd = 'INSERT' then
      execute 'select ' || policy.expression || ' from (select $1::text bucket_id, $2::text name, $3::text owner_id) objects'
        into allowed using 'kmove-practice-files', replace(own_path, '.png', '.html'), student_a::text;
      if allowed is distinct from false then raise exception 'Check 18 failed: executable upload.'; end if;
      execute 'select ' || policy.expression || ' from (select $1::text bucket_id, $2::text name, $3::text owner_id) objects'
        into allowed using 'kmove-practice-files', own_path, student_b::text;
      if allowed is distinct from false then raise exception 'Check 18 failed: forged storage owner.'; end if;
    end if;
    perform set_config('role', admin_role, true);
  end loop;
  checks := checks + 1;

  -- 19. An authenticated DB role without membership or a subject gets no access.
  perform set_config('role', 'authenticated', true);
  for test_case in select * from (values (outsider::text), (''::text)) as cases(subject) loop
    perform set_config('request.jwt.claim.sub', test_case.subject, true);
    perform set_config('request.jwt.claims', case when test_case.subject = '' then '{"role":"authenticated"}'
      else jsonb_build_object('sub', test_case.subject, 'role', 'authenticated')::text end, true);
    if exists (select 1 from public.kmove_practice_messages) then
      raise exception 'Check 19 failed: nonmember history visible.';
    end if;
    blocked := false;
    begin
      insert into public.kmove_practice_messages(session_number, author_id, body)
        values (3, outsider, 'nonmember');
    exception when insufficient_privilege then blocked := true;
    end;
    if not blocked then raise exception 'Check 19 failed: nonmember insert.'; end if;
    execute 'select ' || storage_read_policy || ' from (select $1::text bucket_id, $2::text name, $3::text owner_id) objects'
      into allowed using 'kmove-practice-files', own_path, student_a::text;
    if allowed is distinct from false then raise exception 'Check 19 failed: nonmember Storage read.'; end if;
  end loop;
  checks := checks + 1;

  -- 20. Anonymous CRUD is rejected by grants, before membership is considered.
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  perform set_config('role', 'anon', true);
  for test_case in select * from (values
    ('select * from public.kmove_practice_messages'),
    (format('insert into public.kmove_practice_messages(session_number,author_id,body) values(3,%L::uuid,''anon'')', student_a)),
    (format('update public.kmove_practice_messages set body=''anon'' where id=%L::uuid', root_a)),
    (format('delete from public.kmove_practice_messages where id=%L::uuid', root_a))
  ) as cases(statement) loop
    blocked := false;
    begin execute test_case.statement;
    exception when insufficient_privilege then blocked := true;
    end;
    if not blocked then raise exception 'Check 20 failed: anonymous CRUD.'; end if;
  end loop;
  checks := checks + 1;

  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', teacher::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', teacher, 'role', 'authenticated')::text, true);

  -- 21. An instructor can share without a student enrollment.
  insert into public.kmove_practice_messages(id, session_number, author_id, body, is_pinned)
    values (teacher_message, 3, teacher, '강사 검증용 안내', true) returning * into saved_row;
  if saved_row.author_role <> 'instructor' or not saved_row.is_pinned then
    raise exception 'Check 21 failed: instructor posting.';
  end if;
  checks := checks + 1;

  -- 22. Instructors can pin a student's root message.
  update public.kmove_practice_messages set is_pinned = true where id = root_b returning * into saved_row;
  if saved_row.id is distinct from root_b or not saved_row.is_pinned then
    raise exception 'Check 22 failed: instructor pin.';
  end if;
  checks := checks + 1;

  -- 23. Instructor moderation cannot silently rewrite another author's content.
  for test_case in select * from (values
    ('body = ''teacher rewrite'''),
    ('links = ''[{"url":"https://example.com/teacher-rewrite"}]''::jsonb'),
    ('attachments = ''[{}]''::jsonb')
  ) as cases(expression) loop
    blocked := false;
    begin
      execute 'update public.kmove_practice_messages set ' || test_case.expression || ' where id = $1' using root_b;
    exception when insufficient_privilege then blocked := true;
    end;
    if not blocked then raise exception 'Check 23 failed: instructor rewrote student content.'; end if;
  end loop;
  checks := checks + 1;

  -- 24. Moderation creates an empty, unpinned tombstone with a server timestamp.
  update public.kmove_practice_messages set deleted_at = '1900-01-01'
    where id = root_b returning * into saved_row;
  if saved_row.body <> '' or saved_row.links <> '[]'::jsonb or saved_row.attachments <> '[]'::jsonb
    or saved_row.is_pinned or saved_row.deleted_at is distinct from statement_timestamp() then
    raise exception 'Check 24 failed: instructor tombstone.';
  end if;
  checks := checks + 1;

  -- 25. Teacher cleanup retains SELECT+DELETE for files under that tombstone's
  -- message path, but cannot SELECT a peer's unrelated pending uploads.
  tombstone_path := student_b::text || '/4/' || root_b::text || '/' || file_id::text || '.png';
  pending_peer_path := student_b::text || '/4/' || unposted_id::text || '/' || file_id::text || '.png';
  execute 'select ' || storage_read_policy || ' from (select $1::text bucket_id, $2::text name, $3::text owner_id) objects'
    into allowed using 'kmove-practice-files', tombstone_path, student_b::text;
  if allowed is distinct from true then raise exception 'Check 25 failed: teacher tombstone file read.'; end if;
  execute 'select ' || storage_delete_policy || ' from (select $1::text bucket_id, $2::text name, $3::text owner_id) objects'
    into allowed using 'kmove-practice-files', tombstone_path, student_b::text;
  if allowed is distinct from true then raise exception 'Check 25 failed: teacher tombstone file delete.'; end if;
  execute 'select ' || storage_read_policy || ' from (select $1::text bucket_id, $2::text name, $3::text owner_id) objects'
    into allowed using 'kmove-practice-files', pending_peer_path, student_b::text;
  if allowed is distinct from false then raise exception 'Check 25 failed: teacher read unpublished upload.'; end if;
  checks := checks + 1;

  -- 26. Authors can delete their roots without losing a peer's reply; restoration fails.
  perform set_config('request.jwt.claim.sub', student_a::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', student_a, 'role', 'authenticated')::text, true);
  update public.kmove_practice_messages set deleted_at = now() where id = root_a returning * into saved_row;
  if saved_row.deleted_at is null or saved_row.body <> '' or saved_row.links <> '[]'::jsonb
    or not exists (select 1 from public.kmove_practice_messages where id = reply_b and parent_id = root_a and deleted_at is null) then
    raise exception 'Check 26 failed: author deletion or reply preservation.';
  end if;
  blocked := false;
  begin
    update public.kmove_practice_messages set deleted_at = null, body = 'restore' where id = root_a;
  exception when insufficient_privilege then blocked := true;
  end;
  if not blocked then raise exception 'Check 26 failed: tombstone restored.'; end if;
  checks := checks + 1;

  -- 27. Deleted-parent replies are rejected, and peer files lose shared access.
  execute 'select ' || storage_read_policy || ' from (select $1::text bucket_id, $2::text name, $3::text owner_id) objects'
    into allowed using 'kmove-practice-files', tombstone_path, student_b::text;
  if allowed is distinct from false then raise exception 'Check 27 failed: peer read tombstone files.'; end if;
  perform set_config('request.jwt.claim.sub', student_b::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', student_b, 'role', 'authenticated')::text, true);
  blocked := false;
  begin
    insert into public.kmove_practice_messages(session_number, author_id, body, parent_id)
      values (3, student_b, 'reply after deletion', root_a);
  exception when check_violation then blocked := true;
  end;
  if not blocked then raise exception 'Check 27 failed: reply to deleted parent.'; end if;
  if not exists (select 1 from public.kmove_practice_messages where id = root_a and deleted_at is not null)
    or not exists (select 1 from public.kmove_practice_messages where id = reply_b) then
    raise exception 'Check 27 failed: retained thread history.';
  end if;
  checks := checks + 1;

  -- 28. No account/enrollment edits or extra successful attack inserts occurred.
  perform set_config('role', admin_role, true);
  if (select count(*) from public.kmove_profiles) <> original_profiles
    or (select count(*) from public.kmove_enrollments) <> original_enrollments
    or (select count(*) from public.kmove_practice_messages) <> original_messages + 4
    or exists (select 1 from auth.users where id = outsider) then
    raise exception 'Check 28 failed: unexpected persistent-object changes.';
  end if;
  checks := checks + 1;
  if checks <> 28 then raise exception 'Incomplete verification: % / 28.', checks; end if;
end;
$$;

rollback;
select 'PASS' as result, 28 as checks_passed,
  'All message fixtures rolled back; existing accounts/enrollments and Storage objects unchanged.' as cleanup;
