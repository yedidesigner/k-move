-- Run once in the SQL Editor of the Supabase project configured in .env.local.
create schema if not exists private;

create table if not exists public.kmove_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  role text not null default 'student' check (role in ('student', 'instructor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kmove_portfolios (
  user_id uuid primary key references auth.users(id) on delete cascade,
  target_role text not null default '', title_ko text not null default '',
  title_en text not null default '', intro_ko text not null default '',
  intro_en text not null default '', projects text not null default '',
  web_url text not null default '', pdf_url text not null default '',
  progress text not null default 'not_started'
    check (progress in ('not_started', 'drafting', 'reviewing', 'done')),
  updated_at timestamptz not null default now()
);

alter table public.kmove_profiles enable row level security;
alter table public.kmove_portfolios enable row level security;
grant select on public.kmove_profiles to authenticated;
grant select, insert, update on public.kmove_portfolios to authenticated;

create or replace function private.is_kmove_instructor()
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.kmove_profiles where id = auth.uid() and role = 'instructor'
  );
$$;
revoke all on function private.is_kmove_instructor() from public, anon;
grant execute on function private.is_kmove_instructor() to authenticated;

create or replace function private.handle_kmove_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.kmove_profiles (id, username)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_kmove_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_kmove on auth.users;
create trigger on_auth_user_created_kmove after insert on auth.users
for each row execute function private.handle_kmove_user();

drop policy if exists "Users read own K-Move profile" on public.kmove_profiles;
create policy "Users read own K-Move profile" on public.kmove_profiles
for select to authenticated
using ((select auth.uid()) = id or (select private.is_kmove_instructor()));

drop policy if exists "Users read own K-Move portfolio" on public.kmove_portfolios;
create policy "Users read own K-Move portfolio" on public.kmove_portfolios
for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_kmove_instructor()));

drop policy if exists "Users create own K-Move portfolio" on public.kmove_portfolios;
create policy "Users create own K-Move portfolio" on public.kmove_portfolios
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users update own K-Move portfolio" on public.kmove_portfolios;
create policy "Users update own K-Move portfolio" on public.kmove_portfolios
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
