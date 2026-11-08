-- Additive setup for the existing K-Move Supabase project.
-- Target project: wymhiilvllyfcmzfqlwr. Apply once as the database owner.
-- Existing private submissions, profiles, enrollments and buckets are unchanged.
-- The repository keeps operator-run SQL in docs/; this is not a CLI migration.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- Invoker access is sufficient: both source tables allow reading one's own row.
-- Instructor authorization reuses the existing, protected role helper.
create or replace function private.is_kmove_practice_member()
returns boolean
language sql stable security invoker
set search_path = ''
as $$
  select auth.uid() is not null and (
    (select private.is_kmove_instructor())
    or (
      exists (select 1 from public.kmove_profiles p
        where p.id = (select auth.uid()) and p.role = 'student')
      and exists (select 1 from public.kmove_enrollments e
        where e.user_id = (select auth.uid()) and e.status in ('active', 'completed'))
    )
  );
$$;
revoke all on function private.is_kmove_practice_member() from public, anon, authenticated;
grant execute on function private.is_kmove_practice_member() to authenticated;

create table public.kmove_practice_messages (
  id uuid primary key default gen_random_uuid(),
  session_number smallint not null check (session_number between 1 and 24),
  author_id uuid not null references public.kmove_profiles(id),
  author_name text not null check (char_length(author_name) between 1 and 100),
  author_role text not null check (author_role in ('student', 'instructor')),
  body text not null default '' check (char_length(body) <= 20000),
  parent_id uuid,
  links jsonb not null default '[]'::jsonb,
  attachments jsonb not null default '[]'::jsonb,
  is_pinned boolean not null default false,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  deleted_at timestamptz,
  constraint kmove_practice_id_session unique (id, session_number),
  constraint kmove_practice_parent_session foreign key (parent_id, session_number)
    references public.kmove_practice_messages(id, session_number) on delete restrict,
  constraint kmove_practice_not_own_parent check (parent_id is distinct from id),
  constraint kmove_practice_pin_roots_only check (not is_pinned or parent_id is null),
  constraint kmove_practice_links_array check (
    case when jsonb_typeof(links) = 'array' then jsonb_array_length(links) <= 10 else false end),
  constraint kmove_practice_attachments_array check (
    case when jsonb_typeof(attachments) = 'array' then jsonb_array_length(attachments) <= 5 else false end),
  constraint kmove_practice_message_content check (
    (deleted_at is null and (body ~ '[^[:space:]]' or links <> '[]'::jsonb or attachments <> '[]'::jsonb))
    or (deleted_at is not null and body = '' and links = '[]'::jsonb
      and attachments = '[]'::jsonb and not is_pinned))
);

create index kmove_practice_session_order_idx
  on public.kmove_practice_messages (session_number, created_at, id);
create index kmove_practice_parent_order_idx
  on public.kmove_practice_messages (parent_id, created_at, id) where parent_id is not null;
create index kmove_practice_author_idx on public.kmove_practice_messages (author_id);
create index kmove_practice_pinned_idx
  on public.kmove_practice_messages (session_number, created_at) where is_pinned and deleted_at is null;
create index kmove_practice_attachment_paths_idx
  on public.kmove_practice_messages using gin (attachments jsonb_path_ops) where deleted_at is null;

alter table public.kmove_practice_messages enable row level security;
revoke all on public.kmove_practice_messages from public, anon, authenticated;
grant select, insert on public.kmove_practice_messages to authenticated;
grant update (body, links, attachments, is_pinned, deleted_at)
  on public.kmove_practice_messages to authenticated;

create policy "Practice members read shared messages"
on public.kmove_practice_messages for select to authenticated
using ((select private.is_kmove_practice_member()));

create policy "Practice members create own messages"
on public.kmove_practice_messages for insert to authenticated
with check ((select private.is_kmove_practice_member()) and author_id = (select auth.uid()));

create policy "Practice authors and instructors update messages"
on public.kmove_practice_messages for update to authenticated
using ((select private.is_kmove_practice_member())
  and (author_id = (select auth.uid()) or (select private.is_kmove_instructor())))
with check ((select private.is_kmove_practice_member())
  and (author_id = (select auth.uid()) or (select private.is_kmove_instructor())));

-- A message and all attachment/link metadata are committed in one row.
-- Files must already exist in private Storage under the same author/message path.
-- The trigger runs with the caller's privileges, including Storage RLS.
create or replace function private.guard_kmove_practice_message()
returns trigger
language plpgsql security invoker
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  teacher boolean;
  display_name text;
  display_role text;
  parent_row public.kmove_practice_messages;
  item jsonb;
  file_path text;
  file_extension text;
  file_mime text;
  file_size bigint;
  seen_paths text[] := array[]::text[];
begin
  if actor is null or not private.is_kmove_practice_member() then
    raise exception '이 과정의 수강생과 강사만 실습 공유를 이용할 수 있습니다.' using errcode = '42501';
  end if;
  teacher := private.is_kmove_instructor();

  if TG_OP = 'INSERT' then
    if new.author_id is distinct from actor then
      raise exception '다른 사람의 이름으로 공유할 수 없습니다.' using errcode = '42501';
    end if;
    if new.deleted_at is not null then
      raise exception '삭제된 상태로 글을 만들 수 없습니다.' using errcode = '23514';
    end if;
    select left(coalesce(nullif(btrim(e.name), ''), nullif(btrim(p.username), ''), '수강생'), 100), p.role
      into display_name, display_role
    from public.kmove_profiles p
    left join public.kmove_enrollments e on e.user_id = p.id
    where p.id = actor;
    new.author_name := display_name;
    new.author_role := display_role;
    new.created_at := statement_timestamp();

    if new.parent_id is not null then
      select * into parent_row from public.kmove_practice_messages
        where id = new.parent_id;
      if parent_row.id is null or parent_row.session_number <> new.session_number
        or parent_row.parent_id is not null or parent_row.deleted_at is not null then
        raise exception '같은 회차의 삭제되지 않은 원글에만 답글을 남길 수 있습니다.' using errcode = '23514';
      end if;
    end if;
  else
    if new.id is distinct from old.id or new.session_number is distinct from old.session_number
      or new.author_id is distinct from old.author_id or new.author_name is distinct from old.author_name
      or new.author_role is distinct from old.author_role or new.parent_id is distinct from old.parent_id
      or new.created_at is distinct from old.created_at then
      raise exception '작성자, 회차와 원글 정보는 변경할 수 없습니다.' using errcode = '42501';
    end if;
    if old.deleted_at is not null then
      raise exception '삭제된 글은 다시 수정하거나 복원할 수 없습니다.' using errcode = '42501';
    end if;
    if old.author_id <> actor and not teacher then
      raise exception '본인이 작성한 글만 수정할 수 있습니다.' using errcode = '42501';
    end if;

    -- Deletion preserves the row and its replies, removing visible shared content.
    if new.deleted_at is not null then
      new.body := '';
      new.links := '[]'::jsonb;
      new.attachments := '[]'::jsonb;
      new.is_pinned := false;
      new.deleted_at := statement_timestamp();
      new.updated_at := statement_timestamp();
      return new;
    end if;
    if old.author_id <> actor and (
      new.body is distinct from old.body or new.links is distinct from old.links
      or new.attachments is distinct from old.attachments) then
      raise exception '강사는 다른 사람의 글을 고정하거나 삭제할 수 있지만 내용을 바꿀 수 없습니다.' using errcode = '42501';
    end if;
  end if;

  if not teacher and ((TG_OP = 'INSERT' and new.is_pinned)
    or (TG_OP = 'UPDATE' and new.is_pinned is distinct from old.is_pinned)) then
    raise exception '강사만 글을 상단에 고정할 수 있습니다.' using errcode = '42501';
  end if;
  if new.is_pinned and new.parent_id is not null then
    raise exception '원글만 상단에 고정할 수 있습니다.' using errcode = '23514';
  end if;
  if new.session_number is null or new.session_number not between 1 and 24 then
    raise exception '유효한 수업 회차를 선택해 주세요.' using errcode = '23514';
  end if;
  if new.body is null or char_length(new.body) > 20000 then
    raise exception '내용은 20,000자 이내로 입력해 주세요.' using errcode = '23514';
  end if;
  if jsonb_typeof(new.links) is distinct from 'array' then
    raise exception '링크 형식이 올바르지 않습니다.' using errcode = '23514';
  end if;
  if jsonb_typeof(new.attachments) is distinct from 'array' then
    raise exception '첨부파일 형식이 올바르지 않습니다.' using errcode = '23514';
  end if;
  if jsonb_array_length(new.links) > 10 or jsonb_array_length(new.attachments) > 5 then
    raise exception '한 글에 링크 10개, 파일 5개까지 공유할 수 있습니다.' using errcode = '23514';
  end if;

  for item in select value from jsonb_array_elements(new.links) loop
    if jsonb_typeof(item) is distinct from 'object'
      or not (item ? 'url') or item - array['url', 'title'] <> '{}'::jsonb
      or jsonb_typeof(item -> 'url') is distinct from 'string'
      or (item ? 'title' and (jsonb_typeof(item -> 'title') is distinct from 'string'
        or char_length(item ->> 'title') > 240))
      or char_length(item ->> 'url') > 4096
      or (item ->> 'url') !~ '^https?://[^/@[:space:]]+([/?#][^[:space:]]*)?$' then
      raise exception 'http 또는 https로 시작하는 올바른 링크를 입력해 주세요.' using errcode = '23514';
    end if;
  end loop;

  -- Unchanged attachments are not revalidated during a teacher pin action.
  if TG_OP = 'INSERT' or new.attachments is distinct from old.attachments then
    for item in select value from jsonb_array_elements(new.attachments) loop
      if jsonb_typeof(item) is distinct from 'object'
        or not (item ?& array['id', 'path', 'name', 'size', 'mime', 'kind'])
        or item - array['id', 'path', 'name', 'size', 'mime', 'kind'] <> '{}'::jsonb
        or jsonb_typeof(item -> 'id') is distinct from 'string'
        or jsonb_typeof(item -> 'path') is distinct from 'string'
        or jsonb_typeof(item -> 'name') is distinct from 'string'
        or jsonb_typeof(item -> 'mime') is distinct from 'string'
        or jsonb_typeof(item -> 'kind') is distinct from 'string'
        or jsonb_typeof(item -> 'size') is distinct from 'number'
        or (item ->> 'id') !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        or char_length(item ->> 'name') not between 1 and 240
        or (item ->> 'name') ~ '[[:cntrl:]]'
        or (item ->> 'size') !~ '^[0-9]{1,8}$' then
        raise exception '첨부파일 정보가 올바르지 않습니다.' using errcode = '23514';
      end if;
      file_path := item ->> 'path';
      file_extension := substring(file_path from '[.]([a-z0-9]+)$');
      file_mime := item ->> 'mime';
      file_size := (item ->> 'size')::bigint;
      if file_extension is null or file_extension not in
        ('jpg', 'jpeg', 'png', 'webp', 'pdf', 'zip', 'txt', 'docx', 'pptx', 'xlsx', 'psd', 'ai', 'fig')
        or file_path <> new.author_id::text || '/' || new.session_number::text || '/'
          || new.id::text || '/' || (item ->> 'id') || '.' || file_extension
        or file_path = any(seen_paths) or file_size not between 1 and 10485760 then
        raise exception '첨부파일의 경로 또는 용량이 올바르지 않습니다. 파일당 최대 10MB입니다.' using errcode = '23514';
      end if;
      seen_paths := array_append(seen_paths, file_path);

      if not (case file_extension
        when 'jpg' then file_mime = 'image/jpeg'
        when 'jpeg' then file_mime = 'image/jpeg'
        when 'png' then file_mime = 'image/png'
        when 'webp' then file_mime = 'image/webp'
        when 'pdf' then file_mime = 'application/pdf'
        when 'zip' then file_mime in ('application/zip', 'application/x-zip-compressed', 'application/octet-stream')
        when 'txt' then file_mime = 'text/plain'
        when 'docx' then file_mime in ('application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream')
        when 'pptx' then file_mime in ('application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/octet-stream')
        when 'xlsx' then file_mime in ('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream')
        when 'psd' then file_mime in ('image/vnd.adobe.photoshop', 'application/octet-stream')
        when 'ai' then file_mime in ('application/postscript', 'application/pdf', 'application/octet-stream')
        when 'fig' then file_mime = 'application/octet-stream'
        else false end)
        or (item ->> 'kind') <> (case when file_extension in ('jpg', 'jpeg', 'png', 'webp') then 'image' else 'file' end) then
        raise exception '첨부파일의 형식이 올바르지 않습니다.' using errcode = '23514';
      end if;

      if not exists (select 1 from storage.objects o
        where o.bucket_id = 'kmove-practice-files' and o.name = file_path
          and o.owner_id = new.author_id::text
          and (o.metadata ->> 'size')::numeric = file_size
          and lower(o.metadata ->> 'mimetype') = lower(file_mime)) then
        raise exception '파일 업로드를 완료한 뒤 다시 공유해 주세요.' using errcode = '23514';
      end if;
    end loop;
  end if;

  new.updated_at := statement_timestamp();
  return new;
end;
$$;
revoke all on function private.guard_kmove_practice_message() from public, anon, authenticated;
create trigger guard_kmove_practice_message
before insert or update on public.kmove_practice_messages
for each row execute function private.guard_kmove_practice_message();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kmove-practice-files', 'kmove-practice-files', false, 10485760, array[
  'image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/zip',
  'application/x-zip-compressed', 'application/octet-stream', 'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/vnd.adobe.photoshop', 'application/postscript'
]);

-- Pending uploads are visible only to their uploader. Published attachments are
-- readable by course members; tombstones remove shared student access. Instructors
-- may still read files under an existing message path to clean up its tombstone.
create policy "Practice members read published files"
on storage.objects for select to authenticated using (
  bucket_id = 'kmove-practice-files' and (select private.is_kmove_practice_member())
  and (
    (owner_id = (select auth.uid())::text and split_part(name, '/', 1) = (select auth.uid())::text)
    or exists (select 1 from public.kmove_practice_messages m
      where m.deleted_at is null
        and m.attachments @> jsonb_build_array(jsonb_build_object('path', storage.objects.name)))
    or ((select private.is_kmove_instructor())
      and exists (select 1 from public.kmove_practice_messages m
        where m.deleted_at is not null
          and m.author_id::text = split_part(storage.objects.name, '/', 1)
          and m.session_number::text = split_part(storage.objects.name, '/', 2)
          and m.id::text = split_part(storage.objects.name, '/', 3)))
  )
);

create policy "Practice members upload own files"
on storage.objects for insert to authenticated with check (
  bucket_id = 'kmove-practice-files' and (select private.is_kmove_practice_member())
  and owner_id = (select auth.uid())::text and split_part(name, '/', 1) = (select auth.uid())::text
  and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/([1-9]|1[0-9]|2[0-4])/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.](jpg|jpeg|png|webp|pdf|zip|txt|docx|pptx|xlsx|psd|ai|fig)$'
);

create policy "Practice authors and instructors delete files"
on storage.objects for delete to authenticated using (
  bucket_id = 'kmove-practice-files' and (select private.is_kmove_practice_member())
  and ((select private.is_kmove_instructor())
    or (owner_id = (select auth.uid())::text and split_part(name, '/', 1) = (select auth.uid())::text))
);
-- Deliberately no Storage UPDATE policy: uploads use new UUID paths and upsert:false.

-- A small, single-course room uses Postgres Changes and the table's SELECT RLS.
-- Durable history is always read from this table after reconnecting. The channel
-- filter only chooses a session; it is not an authorization boundary.
-- Tombstones are UPDATE events, avoiding the DELETE-event authorization limitation.
alter publication supabase_realtime add table public.kmove_practice_messages;

comment on table public.kmove_practice_messages is
  'Shared K-Move practice messages by static course session. RLS limits all access to enrolled members and instructors; messages remain stored until explicitly removed by an operator.';
notify pgrst, 'reload schema';
commit;
