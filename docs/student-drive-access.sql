-- Apply to the K-Move project after docs/supabase-setup.sql.
-- The account/folder/email mapping is provisioned privately by the operator.
-- Do not commit student emails or seed these mappings from browser metadata.
create table public.kmove_student_drive_folders (
  user_id uuid primary key references public.kmove_profiles(id) on delete cascade,
  name text not null,
  google_email text not null check (google_email = lower(google_email)),
  assignment_folder_url text not null unique
    check (assignment_folder_url ~ '^https://drive[.]google[.]com/drive/folders/[A-Za-z0-9_-]+$'),
  portfolio_folder_url text not null unique
    check (portfolio_folder_url ~ '^https://drive[.]google[.]com/drive/folders/[A-Za-z0-9_-]+$'),
  sharing_ready boolean not null default false,
  sort_order integer not null check (sort_order > 0)
);

alter table public.kmove_student_drive_folders enable row level security;
revoke all on public.kmove_student_drive_folders from public, anon, authenticated;
grant select on public.kmove_student_drive_folders to authenticated;
grant all on public.kmove_student_drive_folders to service_role;

create policy "Students read own Drive folders; instructors read all"
on public.kmove_student_drive_folders for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_kmove_instructor()));

comment on table public.kmove_student_drive_folders is
  'Operator-managed LMS user_id to Google Drive folders. Read-only to browsers; Drive ACLs separately control Google file operations.';
