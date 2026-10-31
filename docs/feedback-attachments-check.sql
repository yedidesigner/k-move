-- Operator-run regression check. All fixtures are rolled back; no real files are uploaded/deleted.
-- Storage policy expressions are evaluated against synthetic candidate rows, not storage metadata writes.
begin;
-- Stored RLS policies already bind their private helper. The synthetic SQL below
-- must resolve that helper again while parsing as authenticated, so grant schema
-- lookup only within this rollback-only test transaction. No persistent grant.
grant usage on schema private to authenticated;
do $$
declare
  student_a uuid;
  student_b uuid;
  user_a uuid;
  user_b uuid;
  teacher uuid;
  attachment uuid;
  comment_id uuid;
  count_before_images bigint;
  count_before_pins bigint;
  affected integer;
  allowed boolean;
  policy record;
  own_path text;
  peer_path text;
begin
  select id,user_id into student_a,user_a from public.kmove_feedback_students
    where user_id is not null order by name limit 1;
  select id,user_id into student_b,user_b from public.kmove_feedback_students
    where user_id is not null and user_id<>user_a order by name limit 1;
  select id into teacher from public.kmove_profiles where role='instructor' order by id limit 1;
  if user_a is null or user_b is null or teacher is null then raise exception 'Need two students and an instructor'; end if;
  select count(*) into count_before_images from public.kmove_feedback_images;
  select count(*) into count_before_pins from public.kmove_feedback_pins;
  own_path := student_a::text||'/02/'||gen_random_uuid()::text||'.zip';
  peer_path := student_b::text||'/02/'||gen_random_uuid()::text||'.zip';

  if not exists(select 1 from storage.buckets where id='kmove-feedback-files'
    and public=false and file_size_limit=52428800 and 'application/zip'=any(allowed_mime_types)) then
    raise exception 'Expected private 50 MB file bucket';
  end if;
  if (select count(*) from pg_policies where schemaname='storage' and
    policyname in ('Feedback file read','Feedback file upload','Feedback file delete'))<>3 then
    raise exception 'Missing storage policies';
  end if;

  -- Evaluate the real stored SQL with candidate object values. This catches inner name shadowing.
  for policy in select policyname,cmd,coalesce(qual,with_check) as expression
    from pg_policies where schemaname='storage' and
      policyname in ('Feedback file read','Feedback file upload','Feedback file delete') loop
    perform set_config('request.jwt.claims',jsonb_build_object('sub',user_a,'role','authenticated')::text,true);
    perform set_config('role','authenticated',true);
    execute 'select '||policy.expression||' from (select $1::text as bucket_id,$2::text as name,$3::text as owner_id) objects'
      into allowed using 'kmove-feedback-files',own_path,user_a::text;
    if allowed is distinct from true then raise exception 'Own storage access failed: %',policy.policyname; end if;
    execute 'select '||policy.expression||' from (select $1::text as bucket_id,$2::text as name,$3::text as owner_id) objects'
      into allowed using 'kmove-feedback-files',peer_path,user_a::text;
    if allowed is distinct from false then raise exception 'Peer storage access allowed: %',policy.policyname; end if;
    execute 'select '||policy.expression||' from (select $1::text as bucket_id,$2::text as name,$3::text as owner_id) objects'
      into allowed using 'unrelated-bucket',own_path,user_a::text;
    if allowed is distinct from false then raise exception 'Wrong bucket allowed: %',policy.policyname; end if;
    if policy.cmd='INSERT' then
      execute 'select '||policy.expression||' from (select $1::text as bucket_id,$2::text as name,$3::text as owner_id) objects'
        into allowed using 'kmove-feedback-files',replace(own_path,'.zip','.exe'),user_a::text;
      if allowed is distinct from false then raise exception 'Executable path allowed'; end if;
      execute 'select '||policy.expression||' from (select $1::text as bucket_id,$2::text as name,$3::text as owner_id) objects'
        into allowed using 'kmove-feedback-files',own_path,user_b::text;
      if allowed is distinct from false then raise exception 'Forged upload owner allowed'; end if;
    end if;
    perform set_config('role','postgres',true);
  end loop;

  perform set_config('request.jwt.claims',jsonb_build_object('sub',user_a,'role','authenticated')::text,true);
  perform set_config('role','authenticated',true);
  insert into public.kmove_feedback_attachments(student_id,week,kind,title,url,created_by)
    values(student_a,2,'link','Rollback test','https://example.com/portfolio',user_a) returning id into attachment;
  if not exists(select 1 from public.kmove_feedback_attachments where id=attachment) then raise exception 'Own link not readable'; end if;
  begin
    insert into public.kmove_feedback_attachments(student_id,week,kind,title,url,created_by)
      values(student_b,2,'link','Denied peer test','https://example.com/',user_a);
    raise exception 'Peer submission was accepted';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.kmove_feedback_attachments(student_id,week,kind,title,url,created_by)
      values(student_a,2,'link','Denied creator test','https://example.com/',user_b);
    raise exception 'Forged creator was accepted';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.kmove_feedback_attachments(student_id,week,kind,title,url,created_by)
      values(student_a,2,'link','Invalid URL','javascript:alert(1)',user_a);
    raise exception 'Unsafe URL accepted';
  exception when check_violation then null; end;
  begin
    insert into public.kmove_feedback_attachments(student_id,week,kind,title,object_path,mime_type,file_size,created_by)
      values(student_a,2,'file','Missing physical file',own_path,'application/zip',10,user_a);
    raise exception 'Nonexistent file metadata accepted';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.kmove_feedback_attachment_comments(attachment_id,content,created_by)
      values(attachment,'Student must not impersonate instructor feedback',user_a);
    raise exception 'Student comment insert accepted';
  exception when insufficient_privilege then null; end;
  perform set_config('role','postgres',true);

  -- The other student's direct ID request, reads, and deletion cannot reach the fixture.
  perform set_config('request.jwt.claims',jsonb_build_object('sub',user_b,'role','authenticated')::text,true);
  perform set_config('role','authenticated',true);
  if exists(select 1 from public.kmove_feedback_attachments where id=attachment) then raise exception 'Peer link visible'; end if;
  delete from public.kmove_feedback_attachments where id=attachment;
  get diagnostics affected=row_count;
  if affected<>0 then raise exception 'Peer deletion succeeded'; end if;
  perform set_config('role','postgres',true);

  perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher,'role','authenticated')::text,true);
  perform set_config('role','authenticated',true);
  if not exists(select 1 from public.kmove_feedback_attachments where id=attachment) then raise exception 'Instructor cannot read'; end if;
  insert into public.kmove_feedback_attachment_comments(attachment_id,content,created_by)
    values(attachment,'Instructor fixture feedback',teacher) returning id into comment_id;
  update public.kmove_feedback_attachment_comments set content='Instructor edited feedback' where id=comment_id;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'Instructor comment update failed'; end if;
  perform set_config('role','postgres',true);

  perform set_config('request.jwt.claims',jsonb_build_object('sub',user_a,'role','authenticated')::text,true);
  perform set_config('role','authenticated',true);
  if not exists(select 1 from public.kmove_feedback_attachment_comments where id=comment_id) then raise exception 'Own feedback invisible'; end if;
  update public.kmove_feedback_attachment_comments set content='Forbidden edit' where id=comment_id;
  get diagnostics affected=row_count;
  if affected<>0 then raise exception 'Student comment edit succeeded'; end if;
  delete from public.kmove_feedback_attachment_comments where id=comment_id;
  get diagnostics affected=row_count;
  if affected<>0 then raise exception 'Student comment removal succeeded'; end if;
  perform set_config('role','postgres',true);

  perform set_config('request.jwt.claims',jsonb_build_object('sub',user_b,'role','authenticated')::text,true);
  perform set_config('role','authenticated',true);
  if exists(select 1 from public.kmove_feedback_attachment_comments where id=comment_id) then raise exception 'Peer feedback visible'; end if;
  perform set_config('role','postgres',true);

  perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher,'role','authenticated')::text,true);
  perform set_config('role','authenticated',true);
  delete from public.kmove_feedback_attachment_comments where id=comment_id;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'Instructor comment removal failed'; end if;
  perform set_config('role','postgres',true);

  perform set_config('request.jwt.claims',jsonb_build_object('sub',user_a,'role','authenticated')::text,true);
  perform set_config('role','authenticated',true);
  delete from public.kmove_feedback_attachments where id=attachment;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'Own attachment removal failed'; end if;
  perform set_config('role','postgres',true);

  -- Schema constraints are independent of API policies and reject forged path/size values.
  begin
    insert into public.kmove_feedback_attachments(student_id,week,kind,title,object_path,mime_type,file_size,created_by)
      values(student_a,2,'file','Wrong student path',peer_path,'application/zip',10,user_a);
    raise exception 'Wrong student path accepted';
  exception when check_violation then null; end;
  begin
    insert into public.kmove_feedback_attachments(student_id,week,kind,title,object_path,mime_type,file_size,created_by)
      values(student_a,1,'file','Wrong week path',own_path,'application/zip',10,user_a);
    raise exception 'Wrong week path accepted';
  exception when check_violation then null; end;
  begin
    insert into public.kmove_feedback_attachments(student_id,week,kind,title,object_path,mime_type,file_size,created_by)
      values(student_a,2,'file','Oversized',own_path,'application/zip',52428801,user_a);
    raise exception 'Oversized file metadata accepted';
  exception when check_violation then null; end;

  perform set_config('request.jwt.claims','{}',true);
  perform set_config('role','anon',true);
  begin
    perform count(*) from public.kmove_feedback_attachments;
    raise exception 'Anonymous attachment access accepted';
  exception when insufficient_privilege then null; end;
  begin
    perform count(*) from public.kmove_feedback_attachment_comments;
    raise exception 'Anonymous comments access accepted';
  exception when insufficient_privilege then null; end;
  perform set_config('role','postgres',true);
  if (select count(*) from public.kmove_feedback_images)<>count_before_images
    or (select count(*) from public.kmove_feedback_pins)<>count_before_pins then
    raise exception 'Existing image or pin records changed';
  end if;
end $$;
rollback;
select 'PASS: attachment/comment ownership, instructor actions, private storage policy candidates, constraints, anonymous denial, and unchanged image/pin counts' as result;
