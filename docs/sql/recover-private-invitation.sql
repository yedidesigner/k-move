-- Auth admin.createUser may attach app_metadata after the INSERT trigger runs.
-- Complete or repair enrollment after Auth returns, in one locked transaction.
-- Authorization is based on the signed-in instructor and server-owned invitation metadata.
create or replace function private.kmove_ensure_private_invitation(p_name text,p_email text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  u auth.users;
  s public.kmove_feedback_students;
  e public.kmove_enrollments;
  n text := btrim(p_name);
  m text := lower(btrim(p_email));
begin
  perform private.kmove_assert_instructor();
  if n is null or char_length(n) not between 2 and 30
    or n in ('강예지','tomset','홍길동','홍길순')
    or m is null or char_length(m)>254 or m !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    or m like '%@login.kmove.local' then
    raise exception '이름과 실제 이메일을 확인해 주세요.' using errcode='23514';
  end if;
  select * into u from auth.users where lower(email)=m for update;
  if u.id is null then return jsonb_build_object('found',false); end if;
  if coalesce(u.raw_app_meta_data->>'kmove_external_type','') not in ('private','guest')
    or not exists (select 1 from public.kmove_profiles p
      where p.id::text=u.raw_app_meta_data->>'kmove_invited_by' and p.role='instructor')
    or not exists(select 1 from public.kmove_profiles p where p.id=u.id and p.role='student' and p.username=n)
    then raise exception '기존 계정과 초대 정보가 일치하지 않습니다. 이름과 이메일을 확인해 주세요.' using errcode='23514';
  end if;
  select * into e from public.kmove_enrollments where user_id=u.id;
  if e.user_id is not null and (e.student_type<>'private' or e.name<>n) then
    raise exception '기존 수강 정보가 일치하지 않습니다.' using errcode='42501';
  end if;
  select * into s from public.kmove_feedback_students where user_id=u.id;
  if s.id is not null and s.name<>n then raise exception '기존 학생 정보가 일치하지 않습니다.' using errcode='23514'; end if;
  if e.user_id is not null and (s.id is null or e.student_id<>s.id) then
    raise exception '기존 수강 연결이 일치하지 않습니다.' using errcode='23514';
  end if;
  if s.id is null then
    if exists(select 1 from public.kmove_feedback_students f where f.name=n) then
      raise exception '동일한 이름의 학생이 이미 있습니다. 구분 가능한 이름을 입력해 주세요.' using errcode='23514';
    end if;
    insert into public.kmove_feedback_students(name,user_id) values(n,u.id) returning * into s;
  end if;
  if e.user_id is null then
    insert into public.kmove_enrollments(user_id,student_id,name,student_type)
      values(u.id,s.id,n,'private') returning * into e;
    insert into public.kmove_operation_log(actor_id,action,target_id,details)
      values(auth.uid(),'enrollment.invited',u.id::text,jsonb_build_object('student_type','private'));
  end if;
  return jsonb_build_object('found',true,'user_id',u.id,
    'can_deliver_initial_link',u.email_confirmed_at is null and u.last_sign_in_at is null and e.status='active');
end $$;
revoke all on function private.kmove_ensure_private_invitation(text,text) from public,anon,authenticated;
grant execute on function private.kmove_ensure_private_invitation(text,text) to authenticated;
create or replace function public.kmove_ensure_private_invitation(p_name text,p_email text)
returns jsonb language sql security invoker set search_path='' as $$
  select private.kmove_ensure_private_invitation(p_name,p_email);
$$;
revoke all on function public.kmove_ensure_private_invitation(text,text) from public,anon,authenticated;
grant execute on function public.kmove_ensure_private_invitation(text,text) to authenticated;
