-- K-MOVE: External student invitation and role-based voting access.
-- Apply in a single migration before deploying the edge function or the UI.
-- Existing enrollments and historical ballots are preserved.
alter table public.kmove_enrollments add column student_type text not null default 'regular'
  check (student_type in ('regular','guest','private'));

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
    select new.id,s.id,s.name,new.raw_app_meta_data ->> 'kmove_external_type' from s;
    insert into public.kmove_operation_log(actor_id,action,target_id,details)
    values((new.raw_app_meta_data ->> 'kmove_invited_by')::uuid,'enrollment.invited',new.id::text,
           jsonb_build_object('student_type',new.raw_app_meta_data ->> 'kmove_external_type'));
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION private.kmove_practice_roster_names()
 RETURNS text[]
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  roster text[];
  active_count integer;
  distinct_count integer;
begin
  -- Name snapshots use the actual enrolled students, excluding the two
  -- explicitly excluded test names. The helper is in an unexposed schema.
  with eligible as (
    select btrim(e.name) as name
    from public.kmove_enrollments e
    join public.kmove_profiles p on p.id=e.user_id
    where p.role='student' and e.status in ('active','completed') and e.student_type='regular'
      and e.name is not null and btrim(e.name) not in ('','홍길동','홍길순')
  )
  select array_agg(name order by name), count(*), count(distinct lower(name))
  into roster,active_count,distinct_count
  from eligible;
  if active_count not between 2 and 100 then
    raise exception '투표 후보는 실제 등록된 수강생 2~100명이어야 합니다.' using errcode='23514';
  end if;
  if active_count <> distinct_count then
    raise exception '수강생 이름이 중복되어 후보 명단을 만들 수 없습니다. 강사에게 문의해 주세요.'
      using errcode='23514';
  end if;
  if exists(select 1 from unnest(roster) as n(value) where char_length(n.value)>120) then
    raise exception '수강생 이름이 120자를 초과합니다.' using errcode='23514';
  end if;
  return roster;
end;
$function$;
CREATE OR REPLACE FUNCTION public.kmove_practice_cast_vote(p_poll uuid, p_option integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_status text;
  v_count integer;
  v_session smallint;
  v_deadline timestamptz;
  v_options text[];
  v_name text;
  v_added integer;
begin
  select btrim(e.name) into v_name
  from public.kmove_profiles p join public.kmove_enrollments e on e.user_id=p.id
  where p.id=auth.uid() and p.role='student'
    and e.status in ('active','completed') and e.student_type='regular' limit 1;
  if v_name is null or v_name in ('','홍길동','홍길순') then
    raise exception '등록된 실제 수강생만 투표할 수 있습니다.' using errcode='42501';
  end if;
  select p.status,array_length(p.options,1),p.session_number,p.options
    into v_status,v_count,v_session,v_options
  from public.kmove_practice_polls p where p.id=p_poll for share;
  if v_status is null then
    raise exception '투표를 찾을 수 없습니다.' using errcode='23514';
  end if;
  select closes_at into v_deadline from private.kmove_practice_poll_deadlines
    where session_number=v_session;
  if v_status <> 'open' or v_deadline is null or clock_timestamp() >= v_deadline then
    raise exception '수업 시간이 종료되어 투표가 마감되었습니다.' using errcode='23514';
  end if;
  if not (v_name = any(v_options)) then
    raise exception '이 투표의 후보 명단에 포함된 수강생만 참여할 수 있습니다.' using errcode='42501';
  end if;
  if p_option is null or p_option not between 1 and v_count then
    raise exception '후보 한 명만 선택해 주세요.' using errcode='23514';
  end if;
  if v_options[p_option] = v_name then
    raise exception '자신을 사랑하는 당신! 칭찬합니다! 하지만 투표는 다른 친구에게 해주세요❤️' using errcode='23514';
  end if;
  insert into public.kmove_practice_ballots (poll_id,voter_id,option_index)
    values (p_poll,auth.uid(),p_option)
    on conflict (poll_id,voter_id) do nothing;
  get diagnostics v_added = row_count;
  return v_added=1;
end;
$function$;
CREATE OR REPLACE FUNCTION public.kmove_practice_change_vote(p_poll uuid, p_option integer, p_previous integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_status text;
  v_count integer;
  v_session smallint;
  v_deadline timestamptz;
  v_options text[];
  v_name text;
  v_updated integer;
begin
  select btrim(e.name) into v_name
  from public.kmove_profiles p join public.kmove_enrollments e on e.user_id=p.id
  where p.id=auth.uid() and p.role='student'
    and e.status in ('active','completed') and e.student_type='regular' limit 1;
  if v_name is null or v_name in ('','홍길동','홍길순') then
    raise exception '등록된 실제 수강생만 투표를 변경할 수 있습니다.' using errcode='42501';
  end if;
  select p.status,array_length(p.options,1),p.session_number,p.options
    into v_status,v_count,v_session,v_options
  from public.kmove_practice_polls p where p.id=p_poll for share;
  if v_status is null then
    raise exception '투표를 찾을 수 없습니다.' using errcode='23514';
  end if;
  select closes_at into v_deadline from private.kmove_practice_poll_deadlines
    where session_number=v_session;
  if v_status <> 'open' or v_deadline is null or clock_timestamp() >= v_deadline then
    raise exception '수업 시간이 종료되어 투표를 변경할 수 없습니다.' using errcode='23514';
  end if;
  if not (v_name = any(v_options)) then
    raise exception '이 투표의 후보 명단에 포함된 수강생만 참여할 수 있습니다.' using errcode='42501';
  end if;
  if p_option is null or p_previous is null
    or p_option not between 1 and v_count
    or p_previous not between 1 and v_count then
    raise exception '투표할 수강생 한 명을 선택해 주세요.' using errcode='23514';
  end if;
  if p_option = p_previous then
    raise exception '기존과 다른 수강생을 선택해 주세요.' using errcode='23514';
  end if;
  if v_options[p_option] = v_name then
    raise exception '자신을 사랑하는 당신! 칭찬합니다! 하지만 투표는 다른 친구에게 해주세요❤️' using errcode='23514';
  end if;
  update public.kmove_practice_ballots b
    set option_index=p_option
  where b.poll_id=p_poll and b.voter_id=auth.uid()
    and b.option_index=p_previous;
  get diagnostics v_updated=row_count;
  if v_updated<>1 then
    if not exists(select 1 from public.kmove_practice_ballots b
      where b.poll_id=p_poll and b.voter_id=auth.uid()) then
      raise exception '먼저 한 명에게 투표한 뒤 변경해 주세요.' using errcode='23514';
    end if;
    raise exception '다른 화면에서 선택이 변경되었습니다. 새로고침한 뒤 다시 시도해 주세요.'
      using errcode='23514';
  end if;
  return true;
end;
$function$;
CREATE OR REPLACE FUNCTION public.kmove_practice_self_candidate_index(p_poll uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_student_name text;
  v_options text[];
begin
  if exists(select 1 from public.kmove_enrollments e where e.user_id=auth.uid() and e.student_type in ('guest','private')) then return null; end if;
  if auth.uid() is null or not exists (
    select 1 from public.kmove_profiles p
      join public.kmove_enrollments e on e.user_id = p.id
    where p.id = auth.uid() and p.role = 'student' and e.status in ('active','completed') and e.student_type='regular'
  ) then
    raise exception '등록된 수강생만 확인할 수 있습니다.' using errcode = '42501';
  end if;
  select btrim(e.name) into v_student_name
  from public.kmove_enrollments e where e.user_id = auth.uid()
    and e.status in ('active','completed') and e.student_type='regular' limit 1;
  select options into v_options
    from public.kmove_practice_polls where id=p_poll;
  if v_options is null then
    raise exception '투표를 찾을 수 없습니다.' using errcode='23514';
  end if;
  if v_student_name in ('홍길동','홍길순') then return null; end if;
  return array_position(v_options, v_student_name);
end;
$function$;
CREATE OR REPLACE FUNCTION public.kmove_practice_winner_letters(p_poll uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_poll public.kmove_practice_polls;
  v_instructor boolean;
  v_my_name text;
  v_name_owners integer;
  v_winner_idxs integer[];
  v_result jsonb;
begin
  if auth.uid() is null or not private.is_kmove_practice_member() then
    raise exception '등록된 수강생과 강사만 편지함을 확인할 수 있습니다.' using errcode='42501';
  end if;

  select * into v_poll
  from public.kmove_practice_polls p
  where p.id = p_poll;
  if v_poll.id is null then
    raise exception '투표를 찾을 수 없습니다.' using errcode='23514';
  end if;

  if v_poll.status <> 'closed' then
    return '[]'::jsonb;
  end if;

  v_instructor := private.is_kmove_instructor();
  if not v_instructor then
    -- Students can read letters only while the winner result is published.
    -- Closing now publishes automatically, while the instructor can still hide it later.
    if not v_poll.winner_published then
      return '[]'::jsonb;
    end if;

    select btrim(e.name) into v_my_name
    from public.kmove_enrollments e
    join public.kmove_profiles p on p.id = e.user_id
    where e.user_id = auth.uid()
      and p.role = 'student'
      and e.status in ('active','completed') and e.student_type='regular'
      and btrim(coalesce(e.name,'')) not in ('','홍길동','홍길순')
    limit 1;
    if v_my_name is null then
      return '[]'::jsonb;
    end if;

    select count(distinct e.user_id) into v_name_owners
    from public.kmove_enrollments e
    join public.kmove_profiles p on p.id = e.user_id
    where p.role='student'
      and e.status in ('active','completed') and e.student_type='regular'
      and btrim(e.name)=v_my_name;
    if v_name_owners <> 1 then
      return '[]'::jsonb;
    end if;
  end if;

  select coalesce(array_agg(a.option_index order by a.option_index),array[]::integer[])
    into v_winner_idxs
  from (
    select b.option_index, count(*) as votes
    from public.kmove_practice_ballots b
    where b.poll_id = v_poll.id
    group by b.option_index
  ) a
  where a.votes > 0 and a.votes = (
    select max(v.vote_count) from (
      select count(*) as vote_count
      from public.kmove_practice_ballots
      where poll_id=v_poll.id
      group by option_index
    ) v
  );

  if cardinality(v_winner_idxs)=0 then
    return '[]'::jsonb;
  end if;

  select coalesce(jsonb_agg(
      jsonb_build_object(
        'recipient',v_poll.options[winner.idx],
        'letters',coalesce((
          select jsonb_agg(b.selection_reason order by md5(b.selection_reason),b.selection_reason)
          from public.kmove_practice_ballots b
          where b.poll_id=v_poll.id
            and b.option_index=winner.idx
            and char_length(btrim(coalesce(b.selection_reason,''))) between 2 and 200
        ),'[]'::jsonb)
      ) order by winner.idx
    ),'[]'::jsonb)
  into v_result
  from unnest(v_winner_idxs) as winner(idx)
  where v_instructor or v_poll.options[winner.idx] = v_my_name;

  return v_result;
end;
$function$;
CREATE OR REPLACE FUNCTION public.kmove_practice_poll_complete(p_poll uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  candidate_names text[];
  voted_count integer;
begin
  if not private.is_kmove_practice_member() then
    raise exception '등록된 수강생과 강사만 조회할 수 있습니다.' using errcode = '42501';
  end if;

  if not private.is_kmove_instructor() then
    -- Constant response: never disclose class-wide attendance to students.
    return false;
  end if;

  select options into candidate_names
  from public.kmove_practice_polls where id = p_poll;
  if candidate_names is null then
    raise exception '투표를 찾을 수 없습니다.' using errcode='23514';
  end if;

  select count(distinct b.voter_id) into voted_count
  from public.kmove_practice_ballots b
  join public.kmove_profiles p on p.id=b.voter_id
  join public.kmove_enrollments e on e.user_id=b.voter_id
  where b.poll_id=p_poll and p.role='student'
    and e.status in ('active','completed') and e.student_type='regular'
    and btrim(coalesce(e.name,'')) = any(candidate_names)
    and btrim(coalesce(e.name,'')) not in ('','홍길동','홍길순');

  return voted_count=cardinality(candidate_names);
end;
$function$;
CREATE OR REPLACE FUNCTION public.kmove_practice_create_poll(p_session smallint, p_question text, p_options text[])
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_question text := btrim(p_question);
  v_options text[];
  v_id uuid;
begin
  if not private.is_kmove_instructor() then
    raise exception '강사만 투표를 만들 수 있습니다.' using errcode='42501';
  end if;
  if p_session is null or p_session not between 1 and 24
     or v_question is null or char_length(v_question) not between 4 and 180 then
    raise exception '회차 또는 투표 제목을 확인해 주세요.' using errcode='23514';
  end if;
  if p_options is null or cardinality(p_options) not between 2 and 8 or array_ndims(p_options) <> 1 then
    raise exception '투표 항목은 2~8개 입력해 주세요.' using errcode='23514';
  end if;
  select array_agg(btrim(value) order by ord) into v_options
    from unnest(p_options) with ordinality as e(value,ord);
  if exists(select 1 from unnest(v_options) as o(value)
      where value is null or char_length(value) not between 1 and 120)
     or (select count(distinct lower(value)) from unnest(v_options) as o(value)) <> cardinality(v_options) then
    raise exception '항목은 빈칸과 중복 없이 120자 이내로 입력해 주세요.' using errcode='23514';
  end if;
  if exists(select 1 from public.kmove_enrollments e where e.student_type <> 'regular' and lower(btrim(e.name)) = any(select lower(v) from unnest(v_options) as o(v))) then
    raise exception '외부 학생은 투표 후보로 등록할 수 없습니다.' using errcode='42501';
  end if;
  insert into public.kmove_practice_polls(session_number,question,options,created_by)
    values (p_session,v_question,v_options,auth.uid()) returning id into v_id;
  return v_id;
end; $function$;

-- Defense in depth for every ballot write, including legacy RPCs.
create function private.kmove_guard_regular_ballot() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if not exists(select 1 from public.kmove_enrollments e join public.kmove_profiles p on p.id=e.user_id
      where e.user_id=new.voter_id and e.student_type='regular' and p.role='student' and e.status in ('active','completed')) then
    raise exception '정규 수강생만 투표할 수 있습니다.' using errcode='42501';
  end if;
  return new;
end $$;
revoke all on function private.kmove_guard_regular_ballot() from public,anon,authenticated;
create trigger kmove_guard_regular_ballot before insert or update on public.kmove_practice_ballots
  for each row execute function private.kmove_guard_regular_ballot();

-- An instructor can switch external student classifications without granting voting rights.
create function private.kmove_set_external_student_type(p_user_id uuid,p_student_type text) returns void
language plpgsql security definer set search_path='' as $$
begin
  perform private.kmove_assert_instructor();
  if p_student_type is null or p_student_type not in ('guest','private') then
    raise exception '외부 초대생 또는 개인 과외생을 선택해 주세요.' using errcode='23514';
  end if;
  update public.kmove_enrollments set student_type=p_student_type,updated_at=now()
    where user_id=p_user_id and student_type in ('guest','private');
  if not found then raise exception '외부 학생만 유형을 변경할 수 있습니다.' using errcode='42501'; end if;
  insert into public.kmove_operation_log(actor_id,action,target_id,details)
  values(auth.uid(),'enrollment.type',p_user_id::text,jsonb_build_object('student_type',p_student_type));
end $$;
revoke all on function private.kmove_set_external_student_type(uuid,text) from public,anon,authenticated;
grant execute on function private.kmove_set_external_student_type(uuid,text) to authenticated;
create function public.kmove_set_external_student_type(p_user_id uuid,p_student_type text) returns void
language sql security invoker set search_path='' as $$
  select private.kmove_set_external_student_type(p_user_id,p_student_type);
$$;
revoke all on function public.kmove_set_external_student_type(uuid,text) from public,anon,authenticated;
grant execute on function public.kmove_set_external_student_type(uuid,text) to authenticated;

-- Keep existing enrollment RLS and all non-voting course permissions unchanged.
-- Invite account provisioning uses ONLY server-owned app_metadata.
