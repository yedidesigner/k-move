-- Execute AFTER curriculum-sheet-sync.sql. Entire test transaction rolls back.
-- No Google request is made; no accounts, LMS drafts, or sync state persist.
begin;
do $check$
declare
 teacher uuid; student uuid; result jsonb; code text; worker text:=repeat('a',96);
 base jsonb:='["기초","초기 제목","주제","용어","도구","과제","2026-11-01","09:00","12:00"]';
 observed jsonb:='["시트 직접 수정","초기 제목","주제","용어","도구","과제","2026-11-01","09:00","12:00"]';
 doc jsonb; v integer; first_job jsonb; retry_job jsonb; latest_job jsonb; status jsonb;
begin
 select id into teacher from public.kmove_profiles where role='instructor' order by id limit 1;
 select id into student from public.kmove_profiles where role='student' order by id limit 1;
 if teacher is null or student is null then raise exception 'Need one instructor and one student';end if;
 -- Run once before initial baseline seeding. Never delete production queue rows.
 if exists(select 1 from private.kmove_sheet_outbox) then
  raise exception 'Run this rollback-only check before initial baseline seeding';
 end if;
 if exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='private' and c.relname in ('kmove_sheet_connector','kmove_sheet_outbox') and not c.relrowsecurity) then raise exception 'TEST_FAIL RLS disabled';end if;
 if exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'kmove_sheet_%' and p.prosecdef) then raise exception 'TEST_FAIL public security definer';end if;
 if has_table_privilege('anon','private.kmove_sheet_outbox','SELECT') or has_table_privilege('authenticated','private.kmove_sheet_outbox','INSERT') or has_table_privilege('authenticated','private.kmove_sheet_connector','SELECT') then raise exception 'TEST_FAIL direct private table grants';end if;
 if has_function_privilege('anon','private.kmove_sheet_cells(jsonb)','EXECUTE') or has_function_privilege('anon','public.kmove_sheet_setup()','EXECUTE') then raise exception 'TEST_FAIL helper/instructor grant';end if;
 if not private.kmove_sheet_hash_equal(extensions.digest('a','sha256'),extensions.digest('a','sha256')) or private.kmove_sheet_hash_equal(extensions.digest('a','sha256'),extensions.digest('b','sha256')) or private.kmove_sheet_hash_equal(null,extensions.digest('a','sha256')) then raise exception 'TEST_FAIL fixed-length comparator';end if;
 select coalesce(max(version),0) into v from public.kmove_content_drafts where kind='session' and content_key='S24';

 perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher,'role','authenticated')::text,true);perform set_config('role','authenticated',true);
 perform public.kmove_sheet_revoke();
 result:=public.kmove_sheet_setup();code:=result->>'pairing_code';
 if length(code)<>64 or (result->>'expires_at')::timestamptz<=now() then raise exception 'TEST_FAIL pairing code';end if;
 perform public.kmove_sheet_seed(jsonb_build_array(jsonb_build_object('session_key','S24','cells',base)));
 doc:=jsonb_build_object('title','수업 A','date','2026-11-01','startTime','09:00','endTime','12:00','instructorNotes','PRIVATE_CMS_SENTINEL','curriculum',jsonb_build_object('number',24,'cycle','실습','project','프로젝트','title','Nested stale title','goalOutput','결과물','topics',jsonb_build_array('주제 하나'),'terms',jsonb_build_array(jsonb_build_object('name','CTA','description','행동 유도 요소')),'tools',jsonb_build_array('Figma'),'homework','과제 A'));
 result:=public.kmove_save_content_draft('session','S24',jsonb_build_object('document',doc,'hidden',false),v);v:=(result->>'version')::integer;
 status:=public.kmove_sheet_status();
 if status::text like '%PRIVATE_CMS_SENTINEL%' or status::text like '%'||code||'%' or status->'rows'->0->>'status'<>'pending' then raise exception 'TEST_FAIL private content or pending status';end if;
 -- Initial seed never overwrites an already established baseline.
 perform public.kmove_sheet_seed(jsonb_build_array(jsonb_build_object('session_key','S24','cells',observed)));
 perform set_config('role','postgres',true);
 if (select baseline_cells from private.kmove_sheet_outbox where session_key='S24')<>base then raise exception 'TEST_FAIL baseline silently replaced';end if;

 perform set_config('request.jwt.claims',jsonb_build_object('sub',student,'role','authenticated','user_metadata',jsonb_build_object('role','instructor'))::text,true);perform set_config('role','authenticated',true);
 begin perform public.kmove_sheet_status();raise exception 'TEST_FAIL student status';exception when insufficient_privilege then null;end;
 begin perform public.kmove_sheet_setup();raise exception 'TEST_FAIL student pairing';exception when insufficient_privilege then null;end;
 begin perform public.kmove_sheet_revoke();raise exception 'TEST_FAIL student revoke';exception when insufficient_privilege then null;end;
 begin perform public.kmove_sheet_retry('S24',true);raise exception 'TEST_FAIL student retry';exception when insufficient_privilege then null;end;
 begin perform public.kmove_sheet_seed('[]');raise exception 'TEST_FAIL student seed';exception when insufficient_privilege then null;end;
 begin perform 1 from private.kmove_sheet_outbox;raise exception 'TEST_FAIL student private read';exception when insufficient_privilege then null;end;
 perform set_config('role','postgres',true);

 perform set_config('request.jwt.claims','{"role":"anon"}',true);perform set_config('role','anon',true);
 begin perform public.kmove_sheet_pull(worker);raise exception 'TEST_FAIL unpaired worker';exception when insufficient_privilege then null;end;
 begin perform public.kmove_sheet_pair(code,worker,'wrong-target',2001);raise exception 'TEST_FAIL wrong target paired';exception when insufficient_privilege then null;end;
 result:=public.kmove_sheet_pair(code,worker,'1Hv7dvSg_R98DM8_VlCCg7ckYRoopmSFlAQ8z_g5Cds0',2001);
 begin perform public.kmove_sheet_pair(code,worker,'1Hv7dvSg_R98DM8_VlCCg7ckYRoopmSFlAQ8z_g5Cds0',2001);raise exception 'TEST_FAIL pairing replay';exception when insufficient_privilege then null;end;
 begin perform public.kmove_sheet_pull(repeat('b',96));raise exception 'TEST_FAIL wrong worker';exception when insufficient_privilege then null;end;
 begin perform public.kmove_save_content_draft('session','S24',jsonb_build_object('document',doc),v);raise exception 'TEST_FAIL worker authored LMS';exception when insufficient_privilege then null;end;
 result:=public.kmove_sheet_pull(worker);first_job:=result->'jobs'->0;
 if jsonb_array_length(result->'jobs')<>1 or first_job->'baseline_cells'<>base or first_job->>'session_key'<>'S24' or first_job->'desired_cells'->>1<>E'수업 A\n\n결과물' or result::text like '%PRIVATE_CMS_SENTINEL%' or result::text like '%Nested stale title%' then raise exception 'TEST_FAIL job allowlist/baseline';end if;
 if not public.kmove_sheet_check_lease(worker,'S24',(first_job->>'lease_id')::uuid,v) then raise exception 'TEST_FAIL lease';end if;
 if jsonb_array_length(public.kmove_sheet_pull(worker)->'jobs')<>0 then raise exception 'TEST_FAIL active lease re-pulled';end if;
 perform set_config('role','postgres',true);

 -- A newer draft cannot overtake an unresolved write after a lost ACK.
 perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher,'role','authenticated')::text,true);perform set_config('role','authenticated',true);
 doc:=doc||jsonb_build_object('title','수업 B');
 result:=public.kmove_save_content_draft('session','S24',jsonb_build_object('document',doc,'hidden',false),v);v:=(result->>'version')::integer;
 -- Removing curriculum while an old valid snapshot is leased must pause that write.
 result:=public.kmove_save_content_draft('session','S24',jsonb_build_object('document',doc-'curriculum','hidden',false),v);v:=(result->>'version')::integer;
 status:=public.kmove_sheet_status();if status->'rows'->0->>'error_code'<>'invalid_curriculum' then raise exception 'TEST_FAIL removed queued curriculum';end if;
 perform set_config('role','postgres',true);
 perform set_config('request.jwt.claims','{"role":"anon"}',true);perform set_config('role','anon',true);
 if public.kmove_sheet_check_lease(worker,'S24',(first_job->>'lease_id')::uuid,(first_job->>'source_version')::integer) then raise exception 'TEST_FAIL invalidated draft left old write lease valid';end if;
 perform set_config('role','postgres',true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher,'role','authenticated')::text,true);perform set_config('role','authenticated',true);
 result:=public.kmove_save_content_draft('session','S24',jsonb_build_object('document',doc,'hidden',false),v);v:=(result->>'version')::integer;
 perform set_config('role','postgres',true);
 update private.kmove_sheet_outbox set lease_expires_at=now()-interval '1 second' where session_key='S24';
 perform set_config('request.jwt.claims','{"role":"anon"}',true);perform set_config('role','anon',true);
 retry_job:=public.kmove_sheet_pull(worker)->'jobs'->0;
 if retry_job->>'source_version'<>first_job->>'source_version' or retry_job->'desired_cells'<>first_job->'desired_cells' or retry_job->>'lease_id'=first_job->>'lease_id' then raise exception 'TEST_FAIL expired claim changed snapshot';end if;
 result:=public.kmove_sheet_ack(worker,'S24',(first_job->>'lease_id')::uuid,(first_job->>'source_version')::integer,'synced',first_job->'desired_cells',null);
 if (result->>'accepted')::boolean then raise exception 'TEST_FAIL stale ACK accepted';end if;
 result:=public.kmove_sheet_ack(worker,'S24',(retry_job->>'lease_id')::uuid,(retry_job->>'source_version')::integer,'synced',retry_job->'desired_cells',null);
 if not(result->>'accepted')::boolean or result->>'status'<>'pending' or (result->>'source_version')::integer<>v then raise exception 'TEST_FAIL latest draft dropped';end if;
 latest_job:=public.kmove_sheet_pull(worker)->'jobs'->0;
 if latest_job->'baseline_cells'<>retry_job->'desired_cells' or latest_job->'desired_cells'->>1<>E'수업 B\n\n결과물' then raise exception 'TEST_FAIL baseline did not advance';end if;
 result:=public.kmove_sheet_ack(worker,'S24',(latest_job->>'lease_id')::uuid,v,'conflict',observed,null);
 if result->>'status'<>'conflict' or jsonb_array_length(public.kmove_sheet_pull(worker)->'jobs')<>0 then raise exception 'TEST_FAIL conflict auto retried';end if;
 perform set_config('role','postgres',true);
 if (select baseline_cells from private.kmove_sheet_outbox where session_key='S24')<>retry_job->'desired_cells' then raise exception 'TEST_FAIL conflict changed baseline';end if;

 perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher,'role','authenticated')::text,true);perform set_config('role','authenticated',true);
 begin perform public.kmove_sheet_retry('S24',false);raise exception 'TEST_FAIL conflict bypassed';exception when others then if sqlerrm like 'TEST_FAIL%' then raise;end if;end;
 begin perform public.kmove_sheet_retry('S24',true,v-1,observed);raise exception 'TEST_FAIL stale conflict review';exception when serialization_failure then null;end;
 perform public.kmove_sheet_retry('S24',true,v,observed);
 perform set_config('role','postgres',true);
 perform set_config('request.jwt.claims','{"role":"anon"}',true);perform set_config('role','anon',true);
 latest_job:=public.kmove_sheet_pull(worker)->'jobs'->0;
 if latest_job->'baseline_cells'<>observed then raise exception 'TEST_FAIL explicit conflict resolution baseline';end if;
 begin perform public.kmove_sheet_ack(worker,'S24',(latest_job->>'lease_id')::uuid,v,'synced',base,null);raise exception 'TEST_FAIL unverified write ACK';exception when others then if sqlerrm like 'TEST_FAIL%' then raise;end if;end;
 result:=public.kmove_sheet_ack(worker,'S24',(latest_job->>'lease_id')::uuid,v,'error',null,'transport_error');
 if result->>'status'<>'error' then raise exception 'TEST_FAIL error state';end if;
 perform set_config('role','postgres',true);
 update private.kmove_sheet_outbox set retry_at=now()-interval '1 second' where session_key='S24';
 perform set_config('role','anon',true);
 retry_job:=public.kmove_sheet_pull(worker)->'jobs'->0;
 if retry_job->'desired_cells'<>latest_job->'desired_cells' then raise exception 'TEST_FAIL error changed claim';end if;
 result:=public.kmove_sheet_ack(worker,'S24',(retry_job->>'lease_id')::uuid,v,'synced',retry_job->'desired_cells',null);
 if result->>'status'<>'synced' or (result->>'last_synced_version')::integer<>v then raise exception 'TEST_FAIL successful sync';end if;
 perform set_config('role','postgres',true);

 -- Private notes update LMS revision without creating a needless Sheet write.
 perform set_config('request.jwt.claims',jsonb_build_object('sub',teacher,'role','authenticated')::text,true);perform set_config('role','authenticated',true);
 doc:=doc||jsonb_build_object('instructorNotes','ANOTHER_PRIVATE_SENTINEL');
 result:=public.kmove_save_content_draft('session','S24',jsonb_build_object('document',doc,'hidden',false),v);v:=(result->>'version')::integer;
 status:=public.kmove_sheet_status();
 if status->'rows'->0->>'status'<>'synced' or (status->'rows'->0->>'last_synced_version')::integer<>v or status::text like '%ANOTHER_PRIVATE_SENTINEL%' then raise exception 'TEST_FAIL private-only save sync';end if;
 -- Malformed curriculum saves remain recoverable in LMS, never sent as blanks.
 result:=public.kmove_save_content_draft('session','S24',jsonb_build_object('document',doc||jsonb_build_object('startTime','invalid'),'hidden',false),v);v:=(result->>'version')::integer;
 status:=public.kmove_sheet_status();if status->'rows'->0->>'error_code'<>'invalid_curriculum' then raise exception 'TEST_FAIL malformed curriculum';end if;
 result:=public.kmove_save_content_draft('session','S24',jsonb_build_object('document',doc-'curriculum','hidden',false),v);v:=(result->>'version')::integer;
 status:=public.kmove_sheet_status();if status->'rows'->0->>'error_code'<>'invalid_curriculum' then raise exception 'TEST_FAIL removed curriculum left stale queue';end if;
 result:=public.kmove_save_content_draft('session','S24',jsonb_build_object('document',doc,'hidden',false),v);
 perform public.kmove_sheet_revoke();
 perform set_config('role','postgres',true);
 perform set_config('request.jwt.claims','{"role":"anon"}',true);perform set_config('role','anon',true);
 begin perform public.kmove_sheet_pull(worker);raise exception 'TEST_FAIL revoked worker';exception when insufficient_privilege then null;end;
 perform set_config('role','postgres',true);
 raise notice 'PASS: instructor guards, hashed single-use pairing, target scope, private-field allowlist, CAS trigger, baseline immutability, lease snapshot recovery, stale ACK rejection, conflict confirmation, error recovery, and revocation';
end $check$;
rollback;
