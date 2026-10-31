-- Additive migration; existing screenshots and pins remain unchanged.
begin;
create table public.kmove_feedback_attachments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.kmove_feedback_students(id) on delete cascade,
  week smallint not null check (week between 1 and 24),
  kind text not null check (kind in ('file','link')),
  title text not null check (length(btrim(title)) between 1 and 240),
  object_path text unique,
  url text,
  mime_type text,
  file_size bigint,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  constraint attachment_shape check (
    (kind='link' and object_path is null and mime_type is null and file_size is null
      and url is not null and length(url) <= 4096
      and url ~ '^https?://[^/@[:space:]]+([/?#][^[:space:]]*)?$')
    or (kind='file' and url is null and object_path is not null and mime_type is not null
      and file_size is not null and file_size between 1 and 52428800
      and split_part(object_path,'/',1)=student_id::text
      and split_part(object_path,'/',2)=lpad(week::text,2,'0')
      and object_path ~ '^[a-f0-9-]+/(0[1-9]|1[0-9]|2[0-4])/[a-f0-9-]+[.](pdf|zip|txt|docx|pptx|xlsx|psd|ai|fig)$'
      and mime_type in ('application/pdf','application/zip','application/x-zip-compressed','application/octet-stream',
        'text/plain','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/vnd.adobe.photoshop','application/postscript')))
);
create index kmove_feedback_attachments_lookup on public.kmove_feedback_attachments(student_id,week,created_at);
create index kmove_feedback_attachments_creator on public.kmove_feedback_attachments(created_by);

create table public.kmove_feedback_attachment_comments (
  id uuid primary key default gen_random_uuid(),
  attachment_id uuid not null references public.kmove_feedback_attachments(id) on delete cascade,
  content text not null check (length(btrim(content)) between 1 and 3000),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create index kmove_feedback_attachment_comments_lookup on public.kmove_feedback_attachment_comments(attachment_id,created_at);
create index kmove_feedback_attachment_comments_creator on public.kmove_feedback_attachment_comments(created_by);
alter table public.kmove_feedback_attachments enable row level security;
alter table public.kmove_feedback_attachment_comments enable row level security;
revoke all on public.kmove_feedback_attachments,public.kmove_feedback_attachment_comments from public,anon,authenticated;
grant select,insert,delete on public.kmove_feedback_attachments to authenticated;
grant select,insert,delete on public.kmove_feedback_attachment_comments to authenticated;
grant update(content) on public.kmove_feedback_attachment_comments to authenticated;
grant all on public.kmove_feedback_attachments,public.kmove_feedback_attachment_comments to service_role;

create policy "Read own feedback attachments" on public.kmove_feedback_attachments
for select to authenticated using (
  (select private.is_kmove_instructor()) or exists (
    select 1 from public.kmove_feedback_students s where s.id=student_id and s.user_id=(select auth.uid()))
);
create policy "Submit own feedback attachments" on public.kmove_feedback_attachments
for insert to authenticated with check (
  created_by=(select auth.uid()) and ((select private.is_kmove_instructor()) or exists (
    select 1 from public.kmove_feedback_students s where s.id=student_id and s.user_id=(select auth.uid())))
  and (kind='link' or exists (select 1 from storage.objects o where o.bucket_id='kmove-feedback-files'
    and o.name=object_path and o.owner_id=(select auth.uid())::text))
);
create policy "Remove own feedback attachments" on public.kmove_feedback_attachments
for delete to authenticated using (
  (select private.is_kmove_instructor()) or (created_by=(select auth.uid()) and exists (
    select 1 from public.kmove_feedback_students s where s.id=student_id and s.user_id=(select auth.uid())))
);
create policy "Read comments on visible attachments" on public.kmove_feedback_attachment_comments
for select to authenticated using (exists(select 1 from public.kmove_feedback_attachments a where a.id=attachment_id));
create policy "Instructor creates attachment comments" on public.kmove_feedback_attachment_comments
for insert to authenticated with check ((select private.is_kmove_instructor()) and created_by=(select auth.uid()));
create policy "Instructor edits attachment comments" on public.kmove_feedback_attachment_comments
for update to authenticated using ((select private.is_kmove_instructor())) with check ((select private.is_kmove_instructor()));
create policy "Instructor deletes attachment comments" on public.kmove_feedback_attachment_comments
for delete to authenticated using ((select private.is_kmove_instructor()));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('kmove-feedback-files','kmove-feedback-files',false,52428800,array[
  'application/pdf','application/zip','application/x-zip-compressed','application/octet-stream','text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','image/vnd.adobe.photoshop','application/postscript']);

create policy "Feedback file read" on storage.objects for select to authenticated using (
  bucket_id='kmove-feedback-files' and exists(select 1 from public.kmove_feedback_students s
    where s.id::text=split_part(storage.objects.name,'/',1) and ((select private.is_kmove_instructor()) or s.user_id=(select auth.uid())))
);
create policy "Feedback file upload" on storage.objects for insert to authenticated with check (
  bucket_id='kmove-feedback-files' and owner_id=(select auth.uid())::text
  and name ~ '^[a-f0-9-]+/(0[1-9]|1[0-9]|2[0-4])/[a-f0-9-]+[.](pdf|zip|txt|docx|pptx|xlsx|psd|ai|fig)$'
  and exists(select 1 from public.kmove_feedback_students s where s.id::text=split_part(storage.objects.name,'/',1)
    and ((select private.is_kmove_instructor()) or s.user_id=(select auth.uid())))
);
create policy "Feedback file delete" on storage.objects for delete to authenticated using (
  bucket_id='kmove-feedback-files' and ((select private.is_kmove_instructor()) or (
    owner_id=(select auth.uid())::text and exists(select 1 from public.kmove_feedback_students s
      where s.id::text=split_part(storage.objects.name,'/',1) and s.user_id=(select auth.uid()))))
);
commit;
