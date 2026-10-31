-- Execute only AFTER instructor-lms.sql. All fixtures roll back, including new versions.
-- No physical Storage file is uploaded or deleted. One synthetic metadata fixture is rolled back; retention uses policy candidates.
begin;
do $check$
declare
 teacher uuid; ua uuid; ub uuid; sa uuid; sb uuid; aid uuid; lid uuid; peer_lid uuid; img uuid;
 sid uuid; pubid uuid; cmsid uuid;result jsonb; draftv integer;path text;allowed boolean;policy record;
begin
 select id into teacher from public.kmove_profiles where role='instructor' order by id limit 1;
 select user_id,student_id into ua,sa from public.kmove_enrollments where status='active' order by name limit 1;
 select user_id,student_id into ub,sb from public.kmove_enrollments where status='active' and user_id<>ua order by name limit 1;
 if teacher is null or ua is null or ub is null then raise exception 'Need instructor and two active students';end if;
 if exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname in ('kmove_enrollments','kmove_assignments','kmove_assignment_targets','kmove_submission_drafts','kmove_submissions','kmove_submission_assets','kmove_review_drafts','kmove_review_publications','kmove_feedback_reads','kmove_content_drafts','kmove_content_publications','kmove_portfolio_versions','kmove_student_notes','kmove_operation_log') and not c.relrowsecurity) then raise exception 'RLS disabled';end if;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher,'role','authenticated')::text,true);perform set_config('role','authenticated',true);
 result:=public.kmove_save_assignment(jsonb_build_object('session_number',2,'title','Rollback test assignment','description','Test','requirements','One file','opens_at',now()-interval '1 day','due_at',now()+interval '1 day','status','published','allow_resubmit',true,'target_user_ids',jsonb_build_array(ua,ub)),0);
 aid:=(result->>'id')::uuid;
 if (select count(*) from public.kmove_assignment_targets where assignment_id=aid)<>2 then raise exception 'Assignment target count';end if;
 begin perform public.kmove_save_assignment(result||jsonb_build_object('target_user_ids',jsonb_build_array(ua,ub)),null);raise exception 'TEST_FAIL null revision accepted';exception when serialization_failure then null;end;
 begin
  perform public.kmove_save_assignment(result||jsonb_build_object('target_user_ids',jsonb_build_array(ua,ub)),0);
  raise exception 'TEST_FAIL stale assignment accepted';
 exception when serialization_failure then null;end;
 perform set_config('role','postgres',true);

 -- Synthetic image metadata for coordinate and stored policy evaluation, never a physical object.
 img:=gen_random_uuid();path:=sa::text||'/02/'||gen_random_uuid()::text||'.png';
 insert into public.kmove_feedback_images(id,student_id,week,object_path,created_by) values(img,sa,2,path,ua);
 insert into storage.objects(bucket_id,name,owner_id) values('kmove-feedback-screenshots',path,ua::text);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',ub,'role','authenticated')::text,true);perform set_config('role','authenticated',true);
 insert into public.kmove_feedback_attachments(student_id,week,kind,title,url,created_by) values(sb,2,'link','Peer fixture','https://example.com/peer',ub) returning id into peer_lid;
 perform set_config('role','postgres',true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',ua,'role','authenticated')::text,true);perform set_config('role','authenticated',true);
 insert into public.kmove_feedback_attachments(student_id,week,kind,title,url,created_by) values(sa,2,'link','Own fixture','https://example.com/own',ua) returning id into lid;
 begin
  perform public.kmove_save_assignment(jsonb_build_object('session_number',2,'title','Unauthorized','status','published','target_user_ids',jsonb_build_array(ua)),0);
  raise exception 'TEST_FAIL student authored assignment';
 exception when insufficient_privilege then null;end;
 begin
  perform public.kmove_save_submission_draft(aid,jsonb_build_object('note','Attempt foreign attachment','image_ids','[]'::jsonb,'attachment_ids',jsonb_build_array(peer_lid)),0);
  raise exception 'TEST_FAIL peer attachment selected';
 exception when others then if sqlerrm like 'TEST_FAIL%' then raise;end if;end;
 result:=public.kmove_save_submission_draft(aid,jsonb_build_object('note','Please review structure','image_ids',jsonb_build_array(img),'attachment_ids',jsonb_build_array(lid)),0);
 draftv:=(result->>'version')::integer;
 result:=public.kmove_submit_assignment(aid,draftv);sid:=(result->>'id')::uuid;
 if (result->>'version')::integer<>1 or (result->>'late')::boolean then raise exception 'Incorrect first submission state';end if;
 if (select count(*) from public.kmove_submission_assets where submission_id=sid)<>2 then raise exception 'Assets not snapshotted';end if;
 begin
  perform public.kmove_submit_assignment(aid,draftv);raise exception 'TEST_FAIL duplicate click submitted';
 exception when serialization_failure then null;end;
 begin perform public.kmove_submit_assignment(aid,null);raise exception 'TEST_FAIL null submission revision';exception when serialization_failure then null;end;
 begin
  delete from public.kmove_feedback_attachments where id=lid;raise exception 'TEST_FAIL submitted attachment deleted';
 exception when foreign_key_violation then null;end;
 begin
  delete from public.kmove_feedback_images where id=img;raise exception 'TEST_FAIL submitted image deleted';
 exception when foreign_key_violation then null;end;
 for policy in select policyname,qual,with_check from pg_policies where schemaname='storage' and policyname in ('Keep submitted feedback storage','Keep submitted feedback storage content') loop
  execute 'select '||policy.qual||' from (select $1::text as bucket_id,$2::text as name) objects' into allowed using 'kmove-feedback-screenshots',path;
  if allowed is distinct from false then raise exception 'Submitted Storage object mutable: %',policy.policyname;end if;
  execute 'select '||policy.qual||' from (select $1::text as bucket_id,$2::text as name) objects' into allowed using 'kmove-feedback-screenshots',replace(path,'.png','-new.png');
  if allowed is distinct from true then raise exception 'Unsubmitted candidate incorrectly locked';end if;
 end loop;
 perform set_config('role','postgres',true);

 perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher,'role','authenticated')::text,true);perform set_config('role','authenticated',true);
 result:=public.kmove_save_review_draft(sid,jsonb_build_object('strengths','Clear structure','improvements','Adjust spacing','next_steps','Submit revision','decision','changes_requested','private_note','PRIVATE_SENTINEL','pins',jsonb_build_array(jsonb_build_object('id','pin-1','image_id',img,'x',0.25,'y',0.5,'content','Spacing')),'asset_comments',jsonb_build_object(lid::text,'Check hierarchy')),0);
 if (result->>'version')::integer<>1 then raise exception 'Review draft revision';end if;
 -- A newly placed pin may be empty while autosaving, but cannot be published.
 -- Roll back this nested probe so later snapshot checks keep revision 1.
 begin
  result:=public.kmove_save_review_draft(sid,jsonb_build_object('strengths','Draft','pins',jsonb_build_array(jsonb_build_object('id','empty-pin','image_id',img,'x',0.2,'y',0.3,'content',''))),1);
  if (result->>'version')::integer<>2 then raise exception 'TEST_FAIL empty draft pin rejected';end if;
  begin perform public.kmove_publish_review(sid,2);raise exception 'TEST_FAIL empty pin published';exception when others then if sqlerrm like 'TEST_FAIL%' then raise;end if;end;
  raise exception 'ROLLBACK_PIN_PROBE' using errcode='P0002';
 exception when no_data_found then if sqlerrm<>'ROLLBACK_PIN_PROBE' then raise;end if;end;

 result:=public.kmove_save_content_draft('session','QA_ROLLBACK',jsonb_build_object('document',jsonb_build_object('title','Public session','instructorNotes','PRIVATE_CMS_SENTINEL'),'hidden',false),0);
 perform set_config('role','postgres',true);

 perform set_config('request.jwt.claims',jsonb_build_object('sub',ua,'role','authenticated')::text,true);perform set_config('role','authenticated',true);
 if exists(select 1 from public.kmove_review_drafts where submission_id=sid) or exists(select 1 from public.kmove_content_drafts where content_key='QA_ROLLBACK') or exists(select 1 from public.kmove_review_publications where submission_id=sid) then raise exception 'Private draft leaked';end if;
 begin perform public.kmove_publish_review(sid,1);raise exception 'TEST_FAIL student published review';exception when insufficient_privilege then null;end;
 perform set_config('role','postgres',true);

 perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher,'role','authenticated')::text,true);perform set_config('role','authenticated',true);
 result:=public.kmove_publish_review(sid,1);pubid:=(result->>'id')::uuid;
 if result::text like '%PRIVATE_SENTINEL%' or result ? 'private_note' then raise exception 'Private note published';end if;
 result:=public.kmove_publish_content('session','QA_ROLLBACK',1,null);cmsid:=(result->>'id')::uuid;
 if result::text like '%PRIVATE_CMS_SENTINEL%' or (result->'document') ? 'instructorNotes' then raise exception 'Instructor session notes published';end if;
 perform public.kmove_save_content_draft('announcement','QA_FUTURE',jsonb_build_object('document',jsonb_build_object('title','Not yet visible'),'hidden',false),0);
 result:=public.kmove_publish_content('announcement','QA_FUTURE',1,now()+interval '1 day');
 perform public.kmove_cancel_content_schedule((result->>'id')::uuid);
 if not exists(select 1 from public.kmove_content_publications where id=(result->>'id')::uuid and cancelled_at is not null) then raise exception 'Schedule cancellation missing';end if;
 perform public.kmove_save_student_note(ua,'Private student note',0);
 perform set_config('role','postgres',true);

 perform set_config('request.jwt.claims',jsonb_build_object('sub',ua,'role','authenticated')::text,true);perform set_config('role','authenticated',true);
 if not exists(select 1 from public.kmove_review_publications where id=pubid) or not exists(select 1 from public.kmove_content_publications where id=cmsid) then raise exception 'Published own data unreadable';end if;
 if exists(select 1 from public.kmove_content_publications where content_key='QA_FUTURE') or exists(select 1 from public.kmove_student_notes where user_id=ua) then raise exception 'Scheduled/private content visible';end if;
 perform public.kmove_mark_feedback_read(pubid);
 if not exists(select 1 from public.kmove_feedback_reads where publication_id=pubid and user_id=ua) then raise exception 'Read receipt missing';end if;
 result:=public.kmove_append_portfolio_version(jsonb_build_object('user_id',ua,'project_key','QA_PROJECT','title','Portfolio QA','target_role','Designer','next_goal','Improve case study','label','v1','stage','case-study','url','https://example.com/portfolio','notes','Original work'));
 if (result->>'version')::integer<>1 then raise exception 'Portfolio version numbering';end if;
 perform set_config('role','postgres',true);

 perform set_config('request.jwt.claims',jsonb_build_object('sub',ub,'role','authenticated')::text,true);perform set_config('role','authenticated',true);
 if exists(select 1 from public.kmove_submissions where id=sid) or exists(select 1 from public.kmove_submission_assets where submission_id=sid) or exists(select 1 from public.kmove_review_publications where id=pubid) or exists(select 1 from public.kmove_portfolio_versions where user_id=ua) then raise exception 'Peer records leaked';end if;
 begin perform public.kmove_mark_feedback_read(pubid);raise exception 'TEST_FAIL peer read receipt';exception when insufficient_privilege then null;end;
 begin perform public.kmove_append_portfolio_version(jsonb_build_object('user_id',ua));raise exception 'TEST_FAIL peer portfolio write';exception when insufficient_privilege then null;end;
 perform set_config('role','postgres',true);

 perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher,'role','authenticated')::text,true);perform set_config('role','authenticated',true);
 result:=public.kmove_save_review_draft(sid,jsonb_build_object('strengths','Updated draft','improvements','','next_steps','Next revision','decision','accepted','private_note','Still private','pins','[]'::jsonb,'asset_comments','{}'::jsonb),1);
 if not exists(select 1 from public.kmove_review_publications where id=pubid and strengths='Clear structure') then raise exception 'Published snapshot overwritten';end if;
 begin perform public.kmove_save_review_draft(sid,'{}'::jsonb,1);raise exception 'TEST_FAIL stale draft save';exception when serialization_failure then null;end;
 perform public.kmove_save_enrollment(ua,'completed');
 perform set_config('role','postgres',true);

 perform set_config('request.jwt.claims',jsonb_build_object('sub',ua,'role','authenticated')::text,true);perform set_config('role','authenticated',true);
 begin perform public.kmove_save_submission_draft(aid,'{}'::jsonb,2);raise exception 'TEST_FAIL inactive student submitted';exception when insufficient_privilege then null;end;
 perform set_config('role','postgres',true);
 perform set_config('request.jwt.claims','{}',true);perform set_config('role','anon',true);
 begin perform count(*) from public.kmove_submissions;raise exception 'TEST_FAIL anonymous read';exception when insufficient_privilege then null;end;
 begin perform public.kmove_save_assignment('{}',0);raise exception 'TEST_FAIL anonymous RPC';exception when insufficient_privilege then null;end;
 perform set_config('role','postgres',true);
end $check$;
rollback;
select 'PASS: instructor APIs, assignment targets, owner submission/version locking, draft privacy, published snapshots, read receipts, scheduled content, portfolio privacy, asset retention and anonymous denial. Fixtures rolled back.' as result;
