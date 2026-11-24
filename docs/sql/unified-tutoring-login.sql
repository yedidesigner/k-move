-- Server-only tutoring name resolution. Never expose private email addresses
-- to unauthenticated browser clients. Keep the original Auth account and ID.
create table private.kmove_tutoring_login_attempts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  attempts integer not null check (attempts between 1 and 8)
);
alter table private.kmove_tutoring_login_attempts enable row level security;
revoke all on private.kmove_tutoring_login_attempts from public,anon,authenticated;
create or replace function private.kmove_tutoring_login_target(p_name text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  n text := lower(normalize(btrim(p_name),NFKC));
  target_id uuid;
  target_email text;
  attempt_count integer;
begin
  if n is null or char_length(n) not between 2 and 30 then
    return jsonb_build_object('status','invalid');
  end if;
  -- Fail closed on ambiguous names rather than selecting a different account.
  if (select count(*) from public.kmove_profiles p where lower(normalize(btrim(p.username),NFKC))=n) <> 1 then
    return jsonb_build_object('status','invalid');
  end if;
  select u.id,u.email into target_id,target_email
    from public.kmove_profiles p
    join public.kmove_enrollments e on e.user_id=p.id and e.student_type='private'
    join auth.users u on u.id=p.id
    where p.role='student' and lower(normalize(btrim(p.username),NFKC))=n
      and lower(normalize(btrim(e.name),NFKC))=n
      and e.status in ('active','completed')
      and u.email_confirmed_at is not null
      and nullif(u.encrypted_password,'') is not null
      and u.raw_app_meta_data->>'kmove_external_type' in ('guest','private');
  if target_id is null or target_email is null then
    return jsonb_build_object('status','invalid');
  end if;
  -- Atomic, per-account cap independent of the Edge Function instance.
  insert into private.kmove_tutoring_login_attempts as a(user_id,window_started_at,attempts)
    values(target_id,clock_timestamp(),1)
    on conflict(user_id) do update set
      window_started_at=case when a.window_started_at <= clock_timestamp()-interval '15 minutes' then clock_timestamp() else a.window_started_at end,
      attempts=case when a.window_started_at <= clock_timestamp()-interval '15 minutes' then 1 else a.attempts+1 end
    where a.window_started_at <= clock_timestamp()-interval '15 minutes' or a.attempts<8
    returning attempts into attempt_count;
  if attempt_count is null then return jsonb_build_object('status','limited'); end if;
  return jsonb_build_object('status','ok','email',target_email,'user_id',target_id);
end $$;
revoke all on function private.kmove_tutoring_login_target(text) from public,anon,authenticated;
grant usage on schema private to service_role;
grant execute on function private.kmove_tutoring_login_target(text) to service_role;
create or replace function public.kmove_tutoring_login_target(p_name text)
returns jsonb language sql security invoker set search_path='' as $$
  select private.kmove_tutoring_login_target(p_name);
$$;
revoke all on function public.kmove_tutoring_login_target(text) from public,anon,authenticated;
grant execute on function public.kmove_tutoring_login_target(text) to service_role;

-- The current authenticated student can check only whether their own
-- password is configured; never return a password or hash.
create or replace function private.kmove_tutoring_needs_pin()
returns boolean language sql stable security definer set search_path='' as $$
  select exists(
    select 1 from auth.users u join public.kmove_enrollments e on e.user_id=u.id
    where u.id=auth.uid() and e.student_type='private' and nullif(u.encrypted_password,'') is null
  );
$$;
revoke all on function private.kmove_tutoring_needs_pin() from public,anon,authenticated;
grant execute on function private.kmove_tutoring_needs_pin() to authenticated;
create or replace function public.kmove_tutoring_needs_pin()
returns boolean language sql stable security invoker set search_path='' as $$
  select private.kmove_tutoring_needs_pin();
$$;
revoke all on function public.kmove_tutoring_needs_pin() from public,anon,authenticated;
grant execute on function public.kmove_tutoring_needs_pin() to authenticated;
