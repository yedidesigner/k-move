-- Applied to the owner's K-Move Supabase project as create_kmove_promises.
-- Each authenticated account owns exactly one private tenth promise.
-- Existing student accounts, passwords, profiles, and coursework are untouched.

create table public.kmove_promises (
  user_id uuid primary key references auth.users(id) on delete cascade,
  content text not null
    constraint kmove_promises_content_length check (char_length(content) between 1 and 500)
    constraint kmove_promises_content_not_blank check (content ~ '[^[:space:]]'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.kmove_promises enable row level security;

-- Explicit grants avoid inheriting permissive default privileges.
revoke all on table public.kmove_promises from public, anon, authenticated;
grant select, insert, update on table public.kmove_promises to authenticated;

create policy "Users read own K-Move promise"
on public.kmove_promises for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users create own K-Move promise"
on public.kmove_promises for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users update own K-Move promise"
on public.kmove_promises for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Timestamps come from the database, including when a client uses upsert.
create or replace function private.set_kmove_promise_timestamps()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if TG_OP = 'INSERT' then
    new.created_at := statement_timestamp();
  else
    new.created_at := old.created_at;
  end if;
  new.updated_at := statement_timestamp();
  return new;
end;
$$;

revoke all on function private.set_kmove_promise_timestamps() from public, anon, authenticated;

create trigger set_kmove_promise_timestamps
before insert or update on public.kmove_promises
for each row execute function private.set_kmove_promise_timestamps();
