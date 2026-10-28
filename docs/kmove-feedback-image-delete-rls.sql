-- K-Move feedback: allow students to delete only their own uploaded images.
-- Instructors continue to be able to delete any feedback image.
-- Deleting an image row cascades to its location-based feedback pins.
-- Run on project wymhiilvllyfcmzfqlwr only.
begin;

alter policy "Feedback images remove"
on public.kmove_feedback_images
using (
  (select private.is_kmove_instructor())
  or (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.kmove_feedback_students s
      where s.id = student_id
        and s.user_id = (select auth.uid())
    )
  )
);

-- Storage deletion is evaluated after the image row is removed.
-- Therefore, authorize by the object's original owner and mapped folder,
-- not by an image-row lookup that might no longer exist.
alter policy "Feedback screenshot delete"
on storage.objects
using (
  bucket_id = 'kmove-feedback-screenshots'
  and (
    (select private.is_kmove_instructor())
    or (
      owner_id = (select auth.uid())::text
      and exists (
        select 1 from public.kmove_feedback_students s
        where s.id::text = split_part(storage.objects.name, '/', 1)
          and s.user_id = (select auth.uid())
      )
    )
  )
);

commit;
