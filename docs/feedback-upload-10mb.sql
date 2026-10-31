-- Apply after feedback-attachments.sql. Existing submissions remain readable.
begin;
update storage.buckets set file_size_limit=10485760
where id in ('kmove-feedback-files','kmove-feedback-screenshots');

alter policy "Submit own feedback attachments" on public.kmove_feedback_attachments
with check (
  created_by=(select auth.uid()) and ((select private.is_kmove_instructor()) or exists (
    select 1 from public.kmove_feedback_students s where s.id=student_id and s.user_id=(select auth.uid())))
  and (kind='link' or (file_size<=10485760 and exists (
    select 1 from storage.objects o where o.bucket_id='kmove-feedback-files'
    and o.name=object_path and o.owner_id=(select auth.uid())::text)))
);
commit;
