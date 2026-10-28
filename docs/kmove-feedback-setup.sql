-- K-Move Feedback / one-time setup
-- Run in the Supabase SQL Editor of the project used by VITE_SUPABASE_URL.
-- Existing kmove_profiles and its instructor role must already exist.
begin;

create schema if not exists private;
create or replace function private.is_kmove_instructor()
returns boolean language sql stable security definer set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1 from public.kmove_profiles
    where id = (select auth.uid()) and role = 'instructor'
  );
$$;
revoke all on function private.is_kmove_instructor() from public, anon;
grant execute on function private.is_kmove_instructor() to authenticated;

create table if not exists public.kmove_feedback_students (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  major text not null default '',
  user_id uuid unique references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.kmove_feedback_images (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.kmove_feedback_students(id) on delete cascade,
  week smallint not null check (week between 1 and 24),
  object_path text not null unique,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  constraint feedback_path_matches_student check (
    split_part(object_path, '/', 1) = student_id::text
  )
);

create table if not exists public.kmove_feedback_pins (
  id uuid primary key default gen_random_uuid(),
  image_id uuid not null references public.kmove_feedback_images(id) on delete cascade,
  x numeric(6,3) not null check (x >= 0 and x <= 100),
  y numeric(6,3) not null check (y >= 0 and y <= 100),
  content text not null check (length(btrim(content)) between 1 and 3000),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists kmove_feedback_images_lookup
  on public.kmove_feedback_images (student_id, week, created_at);
create index if not exists kmove_feedback_pins_lookup
  on public.kmove_feedback_pins (image_id, created_at);

insert into public.kmove_feedback_students (name, major) values
('강민주','시각디자인학과'),
('강유민','의류산업학과'),
('김다혜','컴퓨터공학과'),
('김선미','시각디자인학전공'),
('김재은','시각커뮤니케이션디자인전공'),
('김화민','영상미디어콘텐츠과'),
('류영진','리빙디자인과'),
('오한별','영상미디어과'),
('이익제','시각디자인학과'),
('이주희','디지털콘텐츠디자인학전공'),
('이지원','산업디자인학전공'),
('임시윤','영상미디어과'),
('정여진','시각디자인학과'),
('최지인','영상미디어과'),
('최형주','시각디자인학과')
on conflict (name) do update set major=excluded.major;

alter table public.kmove_feedback_students enable row level security;
alter table public.kmove_feedback_images enable row level security;
alter table public.kmove_feedback_pins enable row level security;

revoke all on public.kmove_feedback_students, public.kmove_feedback_images,
  public.kmove_feedback_pins from anon;
grant select, update on public.kmove_feedback_students to authenticated;
grant select, insert, delete on public.kmove_feedback_images to authenticated;
grant select, insert, update, delete on public.kmove_feedback_pins to authenticated;

drop policy if exists "Feedback students access" on public.kmove_feedback_students;
create policy "Feedback students access"
on public.kmove_feedback_students for select to authenticated
using ((select private.is_kmove_instructor()) or user_id = (select auth.uid()));

drop policy if exists "Instructor maps feedback students" on public.kmove_feedback_students;
create policy "Instructor maps feedback students"
on public.kmove_feedback_students for update to authenticated
using ((select private.is_kmove_instructor()))
with check ((select private.is_kmove_instructor()));

drop policy if exists "Feedback images access" on public.kmove_feedback_images;
create policy "Feedback images access" on public.kmove_feedback_images
for select to authenticated using (
  (select private.is_kmove_instructor()) or exists (
    select 1 from public.kmove_feedback_students s
    where s.id = student_id and s.user_id = (select auth.uid())
  )
);

drop policy if exists "Feedback images upload" on public.kmove_feedback_images;
create policy "Feedback images upload" on public.kmove_feedback_images
for insert to authenticated with check (
  created_by = (select auth.uid()) and
  ((select private.is_kmove_instructor()) or exists (
    select 1 from public.kmove_feedback_students s
    where s.id = student_id and s.user_id = (select auth.uid())
  ))
);

drop policy if exists "Feedback images remove" on public.kmove_feedback_images;
create policy "Feedback images remove" on public.kmove_feedback_images
for delete to authenticated using ((select private.is_kmove_instructor()));

drop policy if exists "Feedback pins access" on public.kmove_feedback_pins;
create policy "Feedback pins access" on public.kmove_feedback_pins
for select to authenticated using (
  exists (select 1 from public.kmove_feedback_images i where i.id = image_id)
);

drop policy if exists "Instructor inserts feedback pins" on public.kmove_feedback_pins;
create policy "Instructor inserts feedback pins" on public.kmove_feedback_pins
for insert to authenticated with check (
  (select private.is_kmove_instructor()) and created_by = (select auth.uid())
);

drop policy if exists "Instructor edits feedback pins" on public.kmove_feedback_pins;
create policy "Instructor edits feedback pins" on public.kmove_feedback_pins
for update to authenticated using ((select private.is_kmove_instructor()))
with check ((select private.is_kmove_instructor()));

drop policy if exists "Instructor removes feedback pins" on public.kmove_feedback_pins;
create policy "Instructor removes feedback pins" on public.kmove_feedback_pins
for delete to authenticated using ((select private.is_kmove_instructor()));

-- Private bucket: never expose screenshots through a public URL.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kmove-feedback-screenshots', 'kmove-feedback-screenshots', false, 10485760,
  array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = false, file_size_limit = 10485760,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Feedback screenshot read" on storage.objects;
create policy "Feedback screenshot read" on storage.objects
for select to authenticated using (
  bucket_id = 'kmove-feedback-screenshots' and exists (
    select 1 from public.kmove_feedback_students s
    where s.id::text = split_part(storage.objects.name, '/', 1)
    and ((select private.is_kmove_instructor()) or s.user_id = (select auth.uid()))
  )
);

drop policy if exists "Feedback screenshot upload" on storage.objects;
create policy "Feedback screenshot upload" on storage.objects
for insert to authenticated with check (
  bucket_id = 'kmove-feedback-screenshots'
  and exists (
    select 1 from public.kmove_feedback_students s
    where s.id::text = split_part(storage.objects.name, '/', 1)
    and ((select private.is_kmove_instructor()) or s.user_id = (select auth.uid()))
  )
);

drop policy if exists "Feedback screenshot delete" on storage.objects;
create policy "Feedback screenshot delete" on storage.objects
for delete to authenticated using (
  bucket_id = 'kmove-feedback-screenshots'
  and (select private.is_kmove_instructor())
);

commit;

-- Verification queries:
-- select name, user_id from public.kmove_feedback_students order by name;
-- select id, public from storage.buckets where id = 'kmove-feedback-screenshots';
-- select tablename, rowsecurity from pg_tables where tablename like 'kmove_feedback_%';
