-- Preserve the existing K-MOVE roster, including two test accounts.
-- All new enrollments default to private; legacy guest invitations are normalized.
update public.kmove_enrollments set student_type='private', updated_at=now() where student_type='guest';
alter table public.kmove_enrollments alter column student_type set default 'private';
alter table public.kmove_enrollments drop constraint kmove_enrollments_student_type_check;
alter table public.kmove_enrollments add constraint kmove_enrollments_student_type_check check (student_type in ('regular','private'));

CREATE OR REPLACE FUNCTION private.handle_kmove_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.kmove_profiles (id, username)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  if new.raw_app_meta_data ->> 'kmove_external_type' in ('guest','private') then
    if not exists (select 1 from public.kmove_profiles p where p.id::text = new.raw_app_meta_data ->> 'kmove_invited_by' and p.role='instructor') then
      raise exception '강사 초대가 필요합니다.' using errcode='42501';
    end if;
    if char_length(btrim(coalesce(new.raw_user_meta_data ->> 'username',''))) not between 2 and 30
       or btrim(new.raw_user_meta_data ->> 'username') in ('강예지','tomset','홍길동','홍길순') then
      raise exception '학생 이름을 확인해 주세요.' using errcode='23514';
    end if;
    with s as (
      insert into public.kmove_feedback_students(name,user_id)
      values(btrim(new.raw_user_meta_data ->> 'username'),new.id)
      returning id,name
    )
    insert into public.kmove_enrollments(user_id,student_id,name,student_type)
    select new.id,s.id,s.name,'private' from s;
    insert into public.kmove_operation_log(actor_id,action,target_id,details)
    values((new.raw_app_meta_data ->> 'kmove_invited_by')::uuid,'enrollment.invited',new.id::text,
           jsonb_build_object('student_type','private'));
  end if;
  return new;
end;
$function$;

-- An account relink is not a new student; preserve its existing group.
CREATE OR REPLACE FUNCTION private.kmove_relink_student_account(p_student_id uuid, p_new_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare s public.kmove_feedback_students;e public.kmove_enrollments;old_id uuid;old_type text;
begin
 perform private.kmove_assert_instructor();
 select * into s from public.kmove_feedback_students where id=p_student_id for update;old_id:=s.user_id;
 if s.id is null or s.name in ('강예지','tomset','홍길동','홍길순') then raise exception '이 계정 연결은 변경할 수 없습니다.';end if;
 if s.user_id=p_new_user_id then select * into e from public.kmove_enrollments where user_id=p_new_user_id;return to_jsonb(e);end if;
 if not exists(select 1 from public.kmove_profiles p join public.kmove_student_drive_folders d on d.user_id=p.id where p.id=p_new_user_id and p.role='student' and p.username=s.name and d.name=s.name) then raise exception '같은 본명의 개인 Drive 연결 계정만 선택할 수 있습니다.';end if;
 if exists(select 1 from public.kmove_feedback_students where user_id=p_new_user_id) or exists(select 1 from public.kmove_enrollments where user_id=p_new_user_id) then raise exception '이미 다른 학생에게 연결된 계정입니다.';end if;
 if exists(select 1 from public.kmove_feedback_images where student_id=p_student_id) or exists(select 1 from public.kmove_feedback_attachments where student_id=p_student_id) or exists(select 1 from public.kmove_submissions where student_id=p_student_id) or exists(select 1 from public.kmove_portfolio_versions where user_id=old_id) or exists(select 1 from public.kmove_portfolios where user_id=old_id) or exists(select 1 from public.kmove_assignment_targets where user_id=old_id) or exists(select 1 from public.kmove_student_notes where user_id=old_id) then raise exception '자료 또는 배정 이력이 있는 계정은 자동 재연결할 수 없습니다. 기존 기록을 먼저 검토해 주세요.';end if;
 select student_type into old_type from public.kmove_enrollments where user_id=old_id;
 delete from public.kmove_enrollments where user_id=old_id;
 update public.kmove_feedback_students set user_id=p_new_user_id where id=p_student_id;
 insert into public.kmove_enrollments(user_id,student_id,name,student_type) values(p_new_user_id,p_student_id,s.name,coalesce(old_type,'private')) returning * into e;
 insert into public.kmove_operation_log(actor_id,action,target_id,details) values(auth.uid(),'student.relinked',p_student_id::text,jsonb_build_object('old_user_id',old_id,'new_user_id',p_new_user_id));return to_jsonb(e);
end $function$;

-- Retain legacy RPC compatibility without permitting guest classification or
-- promotion to K-MOVE regular membership.
CREATE OR REPLACE FUNCTION private.kmove_set_external_student_type(p_user_id uuid, p_student_type text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  perform private.kmove_assert_instructor();
  if p_student_type is null or p_student_type not in ('guest','private') then
    raise exception '개인 과외생만 지정할 수 있습니다.' using errcode='23514';
  end if;
  update public.kmove_enrollments set student_type='private',updated_at=now()
    where user_id=p_user_id and student_type in ('guest','private');
  if not found then raise exception '외부 학생만 유형을 변경할 수 있습니다.' using errcode='42501'; end if;
  insert into public.kmove_operation_log(actor_id,action,target_id,details)
  values(auth.uid(),'enrollment.type',p_user_id::text,jsonb_build_object('student_type','private'));
end $function$;
