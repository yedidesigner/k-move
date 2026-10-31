-- K-Move instructor workspace. Additive, authenticated APIs, no account/password changes.
-- Browser mutations use public INVOKER wrappers; private functions enforce identity,
-- ownership and optimistic revisions atomically. No new table permits direct DML.
begin;

create table public.kmove_enrollments (
  user_id uuid primary key references public.kmove_profiles(id),
  student_id uuid not null unique references public.kmove_feedback_students(id),
  name text not null check(length(name) between 1 and 100),
  status text not null default 'active' check(status in ('active','completed')),
  joined_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
insert into public.kmove_enrollments(user_id,student_id,name)
select d.user_id,s.id,d.name from public.kmove_student_drive_folders d
join public.kmove_feedback_students s on s.user_id=d.user_id
join public.kmove_profiles p on p.id=d.user_id and p.role='student';

create table public.kmove_assignments (
 id uuid primary key default gen_random_uuid(), session_number smallint not null check(session_number between 1 and 24),
 title text not null check(length(btrim(title)) between 1 and 240), description text not null default '' check(length(description)<=16000),
 requirements text not null default '' check(length(requirements)<=8000), opens_at timestamptz, due_at timestamptz,
 status text not null default 'draft' check(status in ('draft','published','archived')), allow_resubmit boolean not null default true,
 version integer not null default 1 check(version>0), created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check(opens_at is null or due_at is null or opens_at<=due_at)
);
create table public.kmove_assignment_targets (
 assignment_id uuid not null references public.kmove_assignments(id), user_id uuid not null references public.kmove_enrollments(user_id),
 exempt boolean not null default false, due_at timestamptz,created_at timestamptz not null default now(),primary key(assignment_id,user_id)
);
create index kmove_assignment_targets_user on public.kmove_assignment_targets(user_id);
create table public.kmove_submission_drafts (
 assignment_id uuid not null references public.kmove_assignments(id),user_id uuid not null references public.kmove_enrollments(user_id),
 note text not null default '' check(length(note)<=16000), image_ids uuid[] not null default '{}',attachment_ids uuid[] not null default '{}',
 version integer not null default 1 check(version>0),updated_at timestamptz not null default now(),primary key(assignment_id,user_id),
 check(cardinality(image_ids)+cardinality(attachment_ids)<=100)
);
create index kmove_submission_drafts_user on public.kmove_submission_drafts(user_id);
create table public.kmove_submissions (
 id uuid primary key default gen_random_uuid(),assignment_id uuid not null references public.kmove_assignments(id),
 user_id uuid not null references public.kmove_enrollments(user_id),student_id uuid not null references public.kmove_feedback_students(id),
 version integer not null check(version>0), note text not null default '',submitted_at timestamptz not null default now(),late boolean not null,
 unique(assignment_id,user_id,version)
);
create index kmove_submissions_user on public.kmove_submissions(user_id);
create index kmove_submissions_student on public.kmove_submissions(student_id);
create table public.kmove_submission_assets (
 id uuid primary key default gen_random_uuid(),submission_id uuid not null references public.kmove_submissions(id),
 image_id uuid references public.kmove_feedback_images(id) on delete restrict,
 attachment_id uuid references public.kmove_feedback_attachments(id) on delete restrict,
 check(num_nonnulls(image_id,attachment_id)=1),unique(submission_id,image_id),unique(submission_id,attachment_id)
);
create index kmove_submission_assets_image on public.kmove_submission_assets(image_id) where image_id is not null;
create index kmove_submission_assets_attachment on public.kmove_submission_assets(attachment_id) where attachment_id is not null;
create table public.kmove_review_drafts (
 submission_id uuid primary key references public.kmove_submissions(id),strengths text not null default '',improvements text not null default '',next_steps text not null default '',
 decision text not null default 'changes_requested' check(decision in ('changes_requested','accepted')),
 pins jsonb not null default '[]',asset_comments jsonb not null default '{}',private_note text not null default '',
 version integer not null default 1 check(version>0),published_version integer not null default 0,updated_at timestamptz not null default now(),updated_by uuid not null references auth.users(id),
 check(length(strengths)+length(improvements)+length(next_steps)+length(private_note)<=50000),check(jsonb_typeof(pins)='array'),check(jsonb_typeof(asset_comments)='object')
);
create index kmove_review_drafts_author on public.kmove_review_drafts(updated_by);
create table public.kmove_review_publications (
 id uuid primary key default gen_random_uuid(),submission_id uuid not null references public.kmove_submissions(id),
 strengths text not null,improvements text not null,next_steps text not null,decision text not null check(decision in ('changes_requested','accepted')),
 pins jsonb not null,asset_comments jsonb not null,version integer not null,published_at timestamptz not null default now(),published_by uuid not null references auth.users(id),unique(submission_id,version)
);
create index kmove_review_publications_author on public.kmove_review_publications(published_by);
create table public.kmove_feedback_reads (
 publication_id uuid not null references public.kmove_review_publications(id),user_id uuid not null references public.kmove_enrollments(user_id),
 read_at timestamptz not null default now(),primary key(publication_id,user_id)
);
create index kmove_feedback_reads_user on public.kmove_feedback_reads(user_id);
create table public.kmove_content_drafts (
 kind text not null check(kind in ('session','announcement','glossary','guide','path')),
 content_key text not null check(length(content_key) between 1 and 180),document jsonb not null check(jsonb_typeof(document)='object' and octet_length(document::text)<=250000),
 hidden boolean not null default false,version integer not null default 1 check(version>0),published_version integer not null default 0,
 updated_at timestamptz not null default now(),updated_by uuid not null references auth.users(id),primary key(kind,content_key)
);
create index kmove_content_drafts_author on public.kmove_content_drafts(updated_by);
create table public.kmove_content_publications (
 id uuid primary key default gen_random_uuid(),kind text not null,content_key text not null,document jsonb not null,hidden boolean not null,
 version integer not null,published_at timestamptz not null default now(),created_at timestamptz not null default now(),created_by uuid not null references auth.users(id),cancelled_at timestamptz,
 foreign key(kind,content_key) references public.kmove_content_drafts(kind,content_key),unique(kind,content_key,version)
);
create index kmove_content_publications_effective on public.kmove_content_publications(kind,content_key,published_at desc);
create index kmove_content_publications_author on public.kmove_content_publications(created_by);
create table public.kmove_portfolio_versions (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references public.kmove_enrollments(user_id),
 project_key text not null check(length(project_key) between 1 and 180),title text not null check(length(btrim(title)) between 1 and 240),
 target_role text not null default '' check(length(target_role)<=240),next_goal text not null default '' check(length(next_goal)<=4000),label text not null default '' check(length(label)<=240),
 stage text not null check(stage in ('planning','structure','visual','prototype','case-study','ready')),
 url text not null check(length(url)<=4096 and url ~ '^https?://[^/@[:space:]]+([/?#][^[:space:]]*)?$'),
 notes text not null default '' check(length(notes)<=16000),version integer not null,created_at timestamptz not null default now(),created_by uuid not null references auth.users(id),unique(user_id,project_key,version)
);
create index kmove_portfolio_versions_author on public.kmove_portfolio_versions(created_by);
create table public.kmove_student_notes (
 user_id uuid primary key references public.kmove_enrollments(user_id),content text not null check(length(content)<=16000),
 version integer not null default 1,updated_at timestamptz not null default now(),updated_by uuid not null references auth.users(id)
);
create index kmove_student_notes_author on public.kmove_student_notes(updated_by);
create table public.kmove_operation_log (
 id uuid primary key default gen_random_uuid(),actor_id uuid not null references auth.users(id),action text not null,target_id text not null,
 details jsonb not null default '{}',created_at timestamptz not null default now()
);
create index kmove_operation_log_actor on public.kmove_operation_log(actor_id);

do $policies$
declare t text;
begin
 foreach t in array array['kmove_enrollments','kmove_assignments','kmove_assignment_targets','kmove_submission_drafts','kmove_submissions','kmove_submission_assets','kmove_review_drafts','kmove_review_publications','kmove_feedback_reads','kmove_content_drafts','kmove_content_publications','kmove_portfolio_versions','kmove_student_notes','kmove_operation_log'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from public, anon, authenticated',t);
  execute format('grant select on public.%I to authenticated',t);
  execute format('grant all on public.%I to service_role',t);
 end loop;
end $policies$;
create policy "Enrollment read" on public.kmove_enrollments for select to authenticated using(user_id=(select auth.uid()) or (select private.is_kmove_instructor()));
create policy "Assignment read" on public.kmove_assignments for select to authenticated using((select private.is_kmove_instructor()) or (status in ('published','archived') and exists(select 1 from public.kmove_assignment_targets t where t.assignment_id=id and t.user_id=(select auth.uid()))));
create policy "Target read" on public.kmove_assignment_targets for select to authenticated using(user_id=(select auth.uid()) or (select private.is_kmove_instructor()));
create policy "Submission draft read" on public.kmove_submission_drafts for select to authenticated using(user_id=(select auth.uid()) or (select private.is_kmove_instructor()));
create policy "Submission read" on public.kmove_submissions for select to authenticated using(user_id=(select auth.uid()) or (select private.is_kmove_instructor()));
create policy "Submission assets read" on public.kmove_submission_assets for select to authenticated using(exists(select 1 from public.kmove_submissions s where s.id=submission_id));
create policy "Review draft private" on public.kmove_review_drafts for select to authenticated using((select private.is_kmove_instructor()));
create policy "Published review read" on public.kmove_review_publications for select to authenticated using(exists(select 1 from public.kmove_submissions s where s.id=submission_id));
create policy "Feedback receipt read" on public.kmove_feedback_reads for select to authenticated using(user_id=(select auth.uid()) or (select private.is_kmove_instructor()));
create policy "Content drafts private" on public.kmove_content_drafts for select to authenticated using((select private.is_kmove_instructor()));
create policy "Published content read" on public.kmove_content_publications for select to authenticated using((select private.is_kmove_instructor()) or (cancelled_at is null and published_at<=now() and exists(select 1 from public.kmove_profiles p where p.id=(select auth.uid()))));
create policy "Portfolio version read" on public.kmove_portfolio_versions for select to authenticated using(user_id=(select auth.uid()) or (select private.is_kmove_instructor()));
create policy "Student notes private" on public.kmove_student_notes for select to authenticated using((select private.is_kmove_instructor()));
create policy "Operations private" on public.kmove_operation_log for select to authenticated using((select private.is_kmove_instructor()));

create function private.kmove_assert_instructor() returns void language plpgsql security invoker set search_path='' as $$
begin if auth.uid() is null or not private.is_kmove_instructor() then raise exception '강사 권한이 필요합니다.' using errcode='42501';end if;end $$;
revoke all on function private.kmove_assert_instructor() from public,anon,authenticated;

create function private.kmove_save_assignment(p_payload jsonb,p_expected_version integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.kmove_assignments; aid uuid; targets uuid[]; target uuid;
begin
 perform private.kmove_assert_instructor();
 aid:=coalesce(nullif(p_payload->>'id','')::uuid,gen_random_uuid());
 perform pg_advisory_xact_lock(hashtextextended(aid::text,0));
 select * into a from public.kmove_assignments where id=aid for update;
 if coalesce(a.version,0) is distinct from p_expected_version then raise exception '다른 창에서 과제가 변경되었습니다. 새로고침 후 다시 저장하세요.' using errcode='40001';end if;
 select coalesce(array_agg(distinct x::uuid),'{}') into targets from jsonb_array_elements_text(coalesce(p_payload->'target_user_ids','[]')) x;
 if cardinality(targets)>500 then raise exception '제출 대상이 너무 많습니다.';end if;
 if exists(select 1 from unnest(targets) u where not exists(select 1 from public.kmove_enrollments e where e.user_id=u and e.status='active')) then raise exception '활성 수강생만 배정할 수 있습니다.';end if;
 if a.id is not null and (a.session_number<>(p_payload->>'session_number')::smallint or p_payload->>'status'='draft') and exists(select 1 from public.kmove_submissions s where s.assignment_id=aid) then raise exception '제출물이 있는 과제의 회차를 변경하거나 비공개 초안으로 되돌릴 수 없습니다.';end if;
 if exists(select 1 from public.kmove_submissions s where s.assignment_id=aid and not(s.user_id=any(targets))) then raise exception '제출 이력이 있는 학생은 대상에서 제거할 수 없습니다. 면제 또는 개별 마감을 사용하세요.';end if;
 insert into public.kmove_assignments(id,session_number,title,description,requirements,opens_at,due_at,status,allow_resubmit,version)
 values(aid,(p_payload->>'session_number')::smallint,btrim(p_payload->>'title'),coalesce(p_payload->>'description',''),coalesce(p_payload->>'requirements',''),nullif(p_payload->>'opens_at','')::timestamptz,nullif(p_payload->>'due_at','')::timestamptz,p_payload->>'status',coalesce((p_payload->>'allow_resubmit')::boolean,true),1)
 on conflict(id) do update set session_number=excluded.session_number,title=excluded.title,description=excluded.description,requirements=excluded.requirements,opens_at=excluded.opens_at,due_at=excluded.due_at,status=excluded.status,allow_resubmit=excluded.allow_resubmit,version=public.kmove_assignments.version+1,updated_at=now() returning * into a;
 delete from public.kmove_assignment_targets where assignment_id=aid and not(user_id=any(targets));
 foreach target in array targets loop insert into public.kmove_assignment_targets(assignment_id,user_id) values(aid,target) on conflict do nothing;end loop;
 insert into public.kmove_operation_log(actor_id,action,target_id,details) values(auth.uid(),'assignment.saved',aid::text,jsonb_build_object('version',a.version,'target_count',cardinality(targets)));
 return to_jsonb(a);
end $$;

create function private.kmove_save_assignment_target(p_assignment_id uuid,p_user_id uuid,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare t public.kmove_assignment_targets;
begin
 perform private.kmove_assert_instructor();
 update public.kmove_assignment_targets set exempt=coalesce((p_payload->>'exempt')::boolean,false),due_at=nullif(p_payload->>'due_at','')::timestamptz where assignment_id=p_assignment_id and user_id=p_user_id returning * into t;
 if t.assignment_id is null then raise exception '과제 대상 학생을 찾을 수 없습니다.';end if;
 insert into public.kmove_operation_log(actor_id,action,target_id,details) values(auth.uid(),'assignment.target_changed',p_assignment_id::text,jsonb_build_object('user_id',p_user_id,'exempt',t.exempt,'due_at',t.due_at));
 return to_jsonb(t);
end $$;

-- Asset validation runs under the guarded submitter identity and row locks.
create function private.kmove_validate_assets(p_assignment_id uuid,p_user_id uuid,p_image_ids uuid[],p_attachment_ids uuid[]) returns void language plpgsql security invoker set search_path='' as $$
declare a public.kmove_assignments; e public.kmove_enrollments; n integer; asset uuid;
begin
 for asset in select distinct x from unnest(p_image_ids||p_attachment_ids) x order by x loop perform pg_advisory_xact_lock(hashtextextended(asset::text,5));end loop;
 select * into a from public.kmove_assignments where id=p_assignment_id;
 select * into e from public.kmove_enrollments where user_id=p_user_id;
 if e.user_id is null or a.id is null then raise exception '과제 또는 수강생 정보가 없습니다.';end if;
 if cardinality(p_image_ids)+cardinality(p_attachment_ids)>100 then raise exception '자료는 최대 100개까지 선택할 수 있습니다.';end if;
 perform 1 from public.kmove_feedback_images i where i.id=any(p_image_ids) and i.student_id=e.student_id and i.week=a.session_number for key share;
 select count(*) into n from public.kmove_feedback_images i where i.id=any(p_image_ids) and i.student_id=e.student_id and i.week=a.session_number and exists(select 1 from storage.objects o where o.bucket_id='kmove-feedback-screenshots' and o.name=i.object_path);
 if n<>cardinality(p_image_ids) then raise exception '본인 회차의 이미지인지 확인해 주세요.';end if;
 perform 1 from public.kmove_feedback_attachments f where f.id=any(p_attachment_ids) and f.student_id=e.student_id and f.week=a.session_number for key share;
 select count(*) into n from public.kmove_feedback_attachments f where f.id=any(p_attachment_ids) and f.student_id=e.student_id and f.week=a.session_number and (f.kind='link' or exists(select 1 from storage.objects o where o.bucket_id='kmove-feedback-files' and o.name=f.object_path));
 if n<>cardinality(p_attachment_ids) then raise exception '본인 회차의 파일 또는 링크인지 확인해 주세요.';end if;
 if exists(select 1 from public.kmove_submission_assets x join public.kmove_submissions s on s.id=x.submission_id where s.assignment_id<>p_assignment_id and (x.image_id=any(p_image_ids) or x.attachment_id=any(p_attachment_ids))) then raise exception '다른 과제에 제출된 자료입니다. 새 자료를 등록해 주세요.';end if;
end $$;
revoke all on function private.kmove_validate_assets(uuid,uuid,uuid[],uuid[]) from public,anon,authenticated;

create function private.kmove_save_submission_draft(p_assignment_id uuid,p_payload jsonb,p_expected_version integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.kmove_submission_drafts; imgs uuid[]; files uuid[]; uid uuid:=auth.uid();
begin
 if uid is null then raise exception '로그인이 필요합니다.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_assignment_id::text||uid::text,0));
 if not exists(select 1 from public.kmove_assignment_targets t join public.kmove_assignments a on a.id=t.assignment_id join public.kmove_enrollments e on e.user_id=t.user_id where t.assignment_id=p_assignment_id and t.user_id=uid and not t.exempt and a.status='published' and e.status='active' and (a.opens_at is null or a.opens_at<=now())) then raise exception '현재 제출할 수 있는 과제가 아닙니다.' using errcode='42501';end if;
 select * into d from public.kmove_submission_drafts where assignment_id=p_assignment_id and user_id=uid for update;
 if coalesce(d.version,0) is distinct from p_expected_version then raise exception '다른 창에서 제출 자료가 변경되었습니다. 새로고침해 주세요.' using errcode='40001';end if;
 select coalesce(array_agg(distinct x::uuid),'{}') into imgs from jsonb_array_elements_text(coalesce(p_payload->'image_ids','[]')) x;
 select coalesce(array_agg(distinct x::uuid),'{}') into files from jsonb_array_elements_text(coalesce(p_payload->'attachment_ids','[]')) x;
 perform private.kmove_validate_assets(p_assignment_id,uid,imgs,files);
 insert into public.kmove_submission_drafts(assignment_id,user_id,note,image_ids,attachment_ids) values(p_assignment_id,uid,coalesce(p_payload->>'note',''),imgs,files)
 on conflict(assignment_id,user_id) do update set note=excluded.note,image_ids=excluded.image_ids,attachment_ids=excluded.attachment_ids,version=public.kmove_submission_drafts.version+1,updated_at=now() returning * into d;
 return to_jsonb(d);
end $$;

create function private.kmove_submit_assignment(p_assignment_id uuid,p_expected_version integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.kmove_submission_drafts;a public.kmove_assignments;t public.kmove_assignment_targets;e public.kmove_enrollments;s public.kmove_submissions;uid uuid:=auth.uid();v integer;last_id uuid;
begin
 if uid is null then raise exception '로그인이 필요합니다.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_assignment_id::text||uid::text,0));
 select * into a from public.kmove_assignments where id=p_assignment_id for share;
 select * into t from public.kmove_assignment_targets where assignment_id=p_assignment_id and user_id=uid for share;
 select * into e from public.kmove_enrollments where user_id=uid for share;
 if a.id is null or a.status<>'published' or t.user_id is null or t.exempt or e.status<>'active' or (a.opens_at is not null and a.opens_at>now()) then raise exception '현재 제출할 수 있는 과제가 아닙니다.' using errcode='42501';end if;
 select * into d from public.kmove_submission_drafts where assignment_id=p_assignment_id and user_id=uid for update;
 if d.assignment_id is null or d.version is distinct from p_expected_version then raise exception '먼저 최신 자료를 저장한 뒤 제출해 주세요.' using errcode='40001';end if;
 if cardinality(d.image_ids)+cardinality(d.attachment_ids)=0 then raise exception '파일 또는 링크를 하나 이상 선택해 주세요.';end if;
 perform private.kmove_validate_assets(p_assignment_id,uid,d.image_ids,d.attachment_ids);
 select coalesce(max(version),0)+1 into v from public.kmove_submissions where assignment_id=p_assignment_id and user_id=uid;
 if v>1 and not a.allow_resubmit then raise exception '이 과제는 재제출이 허용되지 않습니다.';end if;
 -- Consuming a draft revision prevents accidental double-click duplicate submissions.
 insert into public.kmove_submissions(assignment_id,user_id,student_id,version,note,late)
 values(p_assignment_id,uid,e.student_id,v,d.note,coalesce(now()>coalesce(t.due_at,a.due_at),false)) returning * into s;
 insert into public.kmove_submission_assets(submission_id,image_id) select s.id,unnest(d.image_ids);
 insert into public.kmove_submission_assets(submission_id,attachment_id) select s.id,unnest(d.attachment_ids);
 update public.kmove_submission_drafts set version=version+1,updated_at=now() where assignment_id=p_assignment_id and user_id=uid;
 insert into public.kmove_operation_log(actor_id,action,target_id,details) values(uid,'submission.created',s.id::text,jsonb_build_object('assignment_id',p_assignment_id,'version',v));
 return to_jsonb(s);
end $$;

create function private.kmove_save_review_draft(p_submission_id uuid,p_payload jsonb,p_expected_version integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.kmove_review_drafts;pin jsonb;k text;v jsonb;pins jsonb:=coalesce(p_payload->'pins','[]');comments jsonb:=coalesce(p_payload->'asset_comments','{}');
begin
 perform private.kmove_assert_instructor();
 perform pg_advisory_xact_lock(hashtextextended(p_submission_id::text,1));
 if not exists(select 1 from public.kmove_submissions where id=p_submission_id) then raise exception '제출물을 찾을 수 없습니다.';end if;
 select * into d from public.kmove_review_drafts where submission_id=p_submission_id for update;
 if coalesce(d.version,0) is distinct from p_expected_version then raise exception '다른 창에서 피드백이 변경되었습니다. 최신 내용을 다시 불러오세요.' using errcode='40001';end if;
 if jsonb_typeof(pins)<>'array' or jsonb_array_length(pins)>200 or octet_length(pins::text)>150000 or jsonb_typeof(comments)<>'object' or octet_length(comments::text)>150000 then raise exception '피드백 자료 형식 또는 크기를 확인해 주세요.';end if;
 for pin in select value from jsonb_array_elements(pins) loop
  if not exists(select 1 from public.kmove_submission_assets x where x.submission_id=p_submission_id and x.image_id=(pin->>'image_id')::uuid) or (pin->>'x')::numeric not between 0 and 1 or (pin->>'y')::numeric not between 0 and 1 or jsonb_typeof(pin->'content') is distinct from 'string' or length(pin->>'content')>5000 or pin->>'x' is null or pin->>'y' is null then raise exception '핀 위치와 제출 이미지를 확인해 주세요.';end if;
 end loop;
 for k,v in select * from jsonb_each(comments) loop
  if jsonb_typeof(v)<>'string' or length(v#>>'{}')>5000 or not exists(select 1 from public.kmove_submission_assets x where x.submission_id=p_submission_id and (x.image_id=k::uuid or x.attachment_id=k::uuid)) then raise exception '첨부물 피드백 대상을 확인해 주세요.';end if;
 end loop;
 insert into public.kmove_review_drafts(submission_id,strengths,improvements,next_steps,decision,pins,asset_comments,private_note,updated_by)
 values(p_submission_id,coalesce(p_payload->>'strengths',''),coalesce(p_payload->>'improvements',''),coalesce(p_payload->>'next_steps',''),coalesce(p_payload->>'decision','changes_requested'),pins,comments,coalesce(p_payload->>'private_note',''),auth.uid())
 on conflict(submission_id) do update set strengths=excluded.strengths,improvements=excluded.improvements,next_steps=excluded.next_steps,decision=excluded.decision,pins=excluded.pins,asset_comments=excluded.asset_comments,private_note=excluded.private_note,version=public.kmove_review_drafts.version+1,updated_at=now(),updated_by=auth.uid() returning * into d;
 return to_jsonb(d);
end $$;

create function private.kmove_publish_review(p_submission_id uuid,p_expected_version integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.kmove_review_drafts;p public.kmove_review_publications;
begin
 perform private.kmove_assert_instructor();
 select * into d from public.kmove_review_drafts where submission_id=p_submission_id for update;
 if d.submission_id is null or d.version is distinct from p_expected_version then raise exception '최신 피드백을 저장한 뒤 공개해 주세요.' using errcode='40001';end if;
 if d.version=d.published_version then select * into p from public.kmove_review_publications where submission_id=p_submission_id and version=d.version;return to_jsonb(p);end if;
 if exists(select 1 from jsonb_array_elements(d.pins) pin where length(regexp_replace(coalesce(pin->>'content',''),'[[:space:]]','','g'))=0) then raise exception '내용이 비어 있는 위치 메모를 작성하거나 삭제해 주세요.';end if;
 if length(regexp_replace(d.strengths||d.improvements||d.next_steps,'[[:space:]]','','g'))=0 and jsonb_array_length(d.pins)=0 and not exists(select 1 from jsonb_each_text(d.asset_comments) c where length(regexp_replace(c.value,'[[:space:]]','','g'))>0) then raise exception '학생에게 전달할 피드백을 작성해 주세요.';end if;
 insert into public.kmove_review_publications(submission_id,strengths,improvements,next_steps,decision,pins,asset_comments,version,published_by)
 values(d.submission_id,d.strengths,d.improvements,d.next_steps,d.decision,d.pins,d.asset_comments,d.version,auth.uid()) returning * into p;
 update public.kmove_review_drafts set published_version=version where submission_id=p_submission_id;
 insert into public.kmove_operation_log(actor_id,action,target_id,details) values(auth.uid(),'feedback.published',p.id::text,jsonb_build_object('submission_id',p_submission_id,'version',d.version));
 return to_jsonb(p);
end $$;

create function private.kmove_mark_feedback_read(p_publication_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.kmove_review_publications p join public.kmove_submissions s on s.id=p.submission_id where p.id=p_publication_id and s.user_id=auth.uid()) then raise exception '본인 피드백만 확인할 수 있습니다.' using errcode='42501';end if;
 insert into public.kmove_feedback_reads(publication_id,user_id) values(p_publication_id,auth.uid()) on conflict do nothing;
 return jsonb_build_object('ok',true);
end $$;

create function private.kmove_save_content_draft(p_kind text,p_key text,p_payload jsonb,p_expected_version integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.kmove_content_drafts;
begin
 perform private.kmove_assert_instructor();
 perform pg_advisory_xact_lock(hashtextextended(p_kind||':'||p_key,2));
 select * into d from public.kmove_content_drafts where kind=p_kind and content_key=p_key for update;
 if coalesce(d.version,0) is distinct from p_expected_version then raise exception '다른 창에서 콘텐츠가 변경되었습니다. 최신 내용을 다시 불러오세요.' using errcode='40001';end if;
 insert into public.kmove_content_drafts(kind,content_key,document,hidden,updated_by) values(p_kind,p_key,p_payload->'document',coalesce((p_payload->>'hidden')::boolean,false),auth.uid())
 on conflict(kind,content_key) do update set document=excluded.document,hidden=excluded.hidden,version=public.kmove_content_drafts.version+1,updated_at=now(),updated_by=auth.uid() returning * into d;
 return to_jsonb(d);
end $$;

create function private.kmove_publish_content(p_kind text,p_key text,p_expected_version integer,p_publish_at timestamptz default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.kmove_content_drafts;p public.kmove_content_publications;doc jsonb;
begin
 perform private.kmove_assert_instructor();
 select * into d from public.kmove_content_drafts where kind=p_kind and content_key=p_key for update;
 if d.content_key is null or d.version is distinct from p_expected_version then raise exception '최신 콘텐츠를 저장한 뒤 공개해 주세요.' using errcode='40001';end if;
 if d.version=d.published_version then select * into p from public.kmove_content_publications where kind=p_kind and content_key=p_key and version=d.version;return to_jsonb(p);end if;
 doc:=d.document;
 if p_kind='session' then doc:=doc-'instructorNotes';end if;
 insert into public.kmove_content_publications(kind,content_key,document,hidden,version,published_at,created_by)
 values(p_kind,p_key,doc,d.hidden,d.version,coalesce(p_publish_at,now()),auth.uid()) returning * into p;
 update public.kmove_content_drafts set published_version=version where kind=p_kind and content_key=p_key;
 insert into public.kmove_operation_log(actor_id,action,target_id,details) values(auth.uid(),'content.published',p_kind||':'||p_key,jsonb_build_object('version',d.version,'published_at',p.published_at,'hidden',d.hidden));
 return to_jsonb(p);
end $$;

create function private.kmove_cancel_content_schedule(p_publication_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare p public.kmove_content_publications;
begin
 perform private.kmove_assert_instructor();
 select * into p from public.kmove_content_publications where id=p_publication_id for update;
 if p.id is null or p.published_at<=now() or p.cancelled_at is not null then raise exception '아직 공개되지 않은 예약만 취소할 수 있습니다.';end if;
 update public.kmove_content_publications set cancelled_at=now() where id=p_publication_id;
 update public.kmove_content_drafts set version=version+1,published_version=coalesce((select max(version) from public.kmove_content_publications where kind=p.kind and content_key=p.content_key and cancelled_at is null),0),updated_at=now(),updated_by=auth.uid() where kind=p.kind and content_key=p.content_key;
 insert into public.kmove_operation_log(actor_id,action,target_id,details) values(auth.uid(),'content.schedule_cancelled',p.id::text,jsonb_build_object('kind',p.kind,'key',p.content_key));
 return jsonb_build_object('ok',true);
end $$;

create function private.kmove_save_enrollment(p_user_id uuid,p_status text) returns jsonb language plpgsql security definer set search_path='' as $$
declare e public.kmove_enrollments;
begin
 perform private.kmove_assert_instructor();
 update public.kmove_enrollments set status=p_status,updated_at=now() where user_id=p_user_id returning * into e;
 if e.user_id is null then raise exception '등록된 수강생이 아닙니다.';end if;
 insert into public.kmove_operation_log(actor_id,action,target_id,details) values(auth.uid(),'enrollment.status',p_user_id::text,jsonb_build_object('status',p_status));return to_jsonb(e);
end $$;

create function private.kmove_enroll_student(p_user_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare e public.kmove_enrollments;s public.kmove_feedback_students;
begin
 perform private.kmove_assert_instructor();
 select s0.* into s from public.kmove_feedback_students s0 join public.kmove_profiles p on p.id=s0.user_id and p.role='student' join public.kmove_student_drive_folders d on d.user_id=s0.user_id and d.name=s0.name where s0.user_id=p_user_id;
 if s.id is null or s.name in ('강예지','tomset','홍길동','홍길순') then raise exception '본명 계정과 개인 Drive 폴더 연결을 먼저 확인해 주세요.';end if;
 insert into public.kmove_enrollments(user_id,student_id,name) values(p_user_id,s.id,s.name) on conflict(user_id) do update set status='active',updated_at=now() returning * into e;
 insert into public.kmove_operation_log(actor_id,action,target_id,details) values(auth.uid(),'enrollment.added',p_user_id::text,'{}');return to_jsonb(e);
end $$;

create function private.kmove_save_student_note(p_user_id uuid,p_content text,p_expected_version integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare n public.kmove_student_notes;
begin
 perform private.kmove_assert_instructor();perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,3));
 select * into n from public.kmove_student_notes where user_id=p_user_id for update;
 if coalesce(n.version,0) is distinct from p_expected_version then raise exception '학생 메모가 다른 창에서 변경되었습니다.' using errcode='40001';end if;
 insert into public.kmove_student_notes(user_id,content,updated_by) values(p_user_id,p_content,auth.uid()) on conflict(user_id) do update set content=excluded.content,version=public.kmove_student_notes.version+1,updated_at=now(),updated_by=auth.uid() returning * into n;
 return to_jsonb(n);
end $$;

create function private.kmove_append_portfolio_version(p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare p public.kmove_portfolio_versions;uid uuid:=(p_payload->>'user_id')::uuid;key text:=p_payload->>'project_key';v integer;
begin
 if auth.uid() is null or (auth.uid()<>uid and not private.is_kmove_instructor()) then raise exception '본인 포트폴리오만 등록할 수 있습니다.' using errcode='42501';end if;
 if not exists(select 1 from public.kmove_enrollments where user_id=uid and (status='active' or private.is_kmove_instructor())) then raise exception '활성 수강생 계정을 확인해 주세요.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text||':'||key,4));
 select coalesce(max(version),0)+1 into v from public.kmove_portfolio_versions where user_id=uid and project_key=key;
 insert into public.kmove_portfolio_versions(user_id,project_key,title,target_role,next_goal,label,stage,url,notes,version,created_by)
 values(uid,key,btrim(p_payload->>'title'),coalesce(p_payload->>'target_role',''),coalesce(p_payload->>'next_goal',''),coalesce(p_payload->>'label',''),p_payload->>'stage',p_payload->>'url',coalesce(p_payload->>'notes',''),v,auth.uid()) returning * into p;
 insert into public.kmove_operation_log(actor_id,action,target_id,details) values(auth.uid(),'portfolio.version',p.id::text,jsonb_build_object('user_id',uid,'project_key',key,'version',v));return to_jsonb(p);
end $$;

create function private.kmove_relink_student_account(p_student_id uuid,p_new_user_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare s public.kmove_feedback_students;e public.kmove_enrollments;old_id uuid;
begin
 perform private.kmove_assert_instructor();
 select * into s from public.kmove_feedback_students where id=p_student_id for update;old_id:=s.user_id;
 if s.id is null or s.name in ('강예지','tomset','홍길동','홍길순') then raise exception '이 계정 연결은 변경할 수 없습니다.';end if;
 if s.user_id=p_new_user_id then select * into e from public.kmove_enrollments where user_id=p_new_user_id;return to_jsonb(e);end if;
 if not exists(select 1 from public.kmove_profiles p join public.kmove_student_drive_folders d on d.user_id=p.id where p.id=p_new_user_id and p.role='student' and p.username=s.name and d.name=s.name) then raise exception '같은 본명의 개인 Drive 연결 계정만 선택할 수 있습니다.';end if;
 if exists(select 1 from public.kmove_feedback_students where user_id=p_new_user_id) or exists(select 1 from public.kmove_enrollments where user_id=p_new_user_id) then raise exception '이미 다른 학생에게 연결된 계정입니다.';end if;
 if exists(select 1 from public.kmove_feedback_images where student_id=p_student_id) or exists(select 1 from public.kmove_feedback_attachments where student_id=p_student_id) or exists(select 1 from public.kmove_submissions where student_id=p_student_id) or exists(select 1 from public.kmove_portfolio_versions where user_id=old_id) or exists(select 1 from public.kmove_portfolios where user_id=old_id) or exists(select 1 from public.kmove_assignment_targets where user_id=old_id) or exists(select 1 from public.kmove_student_notes where user_id=old_id) then raise exception '자료 또는 배정 이력이 있는 계정은 자동 재연결할 수 없습니다. 기존 기록을 먼저 검토해 주세요.';end if;
 delete from public.kmove_enrollments where user_id=old_id;
 update public.kmove_feedback_students set user_id=p_new_user_id where id=p_student_id;
 insert into public.kmove_enrollments(user_id,student_id,name) values(p_new_user_id,p_student_id,s.name) returning * into e;
 insert into public.kmove_operation_log(actor_id,action,target_id,details) values(auth.uid(),'student.relinked',p_student_id::text,jsonb_build_object('old_user_id',old_id,'new_user_id',p_new_user_id));return to_jsonb(e);
end $$;
-- Remove the old unrestricted browser mapping write path; all changes now use the guarded RPC.
revoke update on public.kmove_feedback_students from authenticated;

-- Submitted files are immutable. Existing delete permissions still apply to unsubmitted files.
create function private.kmove_storage_is_submitted(p_bucket text,p_path text) returns boolean language plpgsql volatile security invoker set search_path='' as $$
declare asset uuid;
begin
 if p_bucket='kmove-feedback-screenshots' then
  select id into asset from public.kmove_feedback_images where object_path=p_path;
 elsif p_bucket='kmove-feedback-files' then
  select id into asset from public.kmove_feedback_attachments where object_path=p_path;
 else return false;end if;
 if asset is null then return false;end if;
 -- Same lock as submit validation: whichever commits first wins, never a stale
 -- deletion decision made before a concurrent submission became immutable.
 perform pg_advisory_xact_lock(hashtextextended(asset::text,5));
 return exists(select 1 from public.kmove_submission_assets a where a.image_id=asset or a.attachment_id=asset);
end $$;
revoke all on function private.kmove_storage_is_submitted(text,text) from public,anon;
grant execute on function private.kmove_storage_is_submitted(text,text) to authenticated;
create policy "Keep submitted feedback storage" on storage.objects as restrictive for delete to authenticated
using(not private.kmove_storage_is_submitted(bucket_id,name));
create policy "Keep submitted feedback storage content" on storage.objects as restrictive for update to authenticated
using(not private.kmove_storage_is_submitted(bucket_id,name)) with check(not private.kmove_storage_is_submitted(bucket_id,name));
create policy "Keep submitted image metadata" on public.kmove_feedback_images as restrictive for update to authenticated
using(not exists(select 1 from public.kmove_submission_assets a where a.image_id=kmove_feedback_images.id))
with check(not exists(select 1 from public.kmove_submission_assets a where a.image_id=kmove_feedback_images.id));
create policy "Keep submitted attachment metadata" on public.kmove_feedback_attachments as restrictive for update to authenticated
using(not exists(select 1 from public.kmove_submission_assets a where a.attachment_id=kmove_feedback_attachments.id))
with check(not exists(select 1 from public.kmove_submission_assets a where a.attachment_id=kmove_feedback_attachments.id));

-- Public functions are small INVOKER wrappers; only guarded private functions elevate.
-- USAGE permits these explicit calls, not writes to the private schema or tables.
grant usage on schema private to authenticated;
do $rpc$
declare r record;args text;
begin
 for r in select p.oid,p.proname,pg_get_function_identity_arguments(p.oid) identity_args,pg_get_function_arguments(p.oid) all_args,p.proargnames
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='private' and p.proname in (
 'kmove_cancel_content_schedule','kmove_save_assignment','kmove_save_assignment_target','kmove_save_submission_draft','kmove_submit_assignment','kmove_save_review_draft','kmove_publish_review','kmove_mark_feedback_read','kmove_save_content_draft','kmove_publish_content','kmove_save_enrollment','kmove_enroll_student','kmove_save_student_note','kmove_append_portfolio_version','kmove_relink_student_account') loop
  select string_agg(quote_ident(x),',' order by ord) into args from unnest(r.proargnames) with ordinality as names(x,ord);
  execute format('revoke all on function private.%I(%s) from public,anon,authenticated',r.proname,r.identity_args);
  execute format('grant execute on function private.%I(%s) to authenticated',r.proname,r.identity_args);
  execute format('create function public.%I(%s) returns jsonb language sql security invoker set search_path='''' as %L',r.proname,r.all_args,'select private.'||quote_ident(r.proname)||'('||args||');');
  execute format('revoke all on function public.%I(%s) from public,anon,authenticated',r.proname,r.identity_args);
  execute format('grant execute on function public.%I(%s) to authenticated',r.proname,r.identity_args);
 end loop;
end $rpc$;
notify pgrst,'reload schema';
commit;
