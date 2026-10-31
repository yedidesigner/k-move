# K-Move student roster

Updated 2026-11-01 (Asia/Seoul).

## Current cohort

The 15-name instructor roster lives in `src/data/student-roster.ts` for the feedback picker. Private assignment/portfolio URLs and Google email addresses live only in `public.kmove_student_drive_folders`, keyed to the provisioned Supabase user ID. Never use a browser-supplied name or user metadata to authorize folder access.

Both existing Drive roots were inspected. The original 28 child folders were retained, and the two missing 김재은 folders were created and read back. Each root now contains 15 student folders. A subsequent ACL audit confirmed 26 folders shared with only the designated student's Google account as writer plus the owner; 김재은 and 최형주's four folders remain owner-only because the supplied emails were not recognized as Google accounts. No anyone, domain, group, or cross-student grants were found. Both roots and their K-Move parent remain owner-only.

The LMS now fetches folders using the authenticated account ID. Students receive only their own row through database RLS and see one folder per page, without the root link. The instructor can read all 15 rows and open the roots. Unmapped accounts fail closed. Pending Google sharing shows a status message instead of a student folder link. The Data API cannot insert, update, or delete mappings; only the operator provisions them.

Google Drive independently checks the Google account currently signed in. Logging into the LMS as a student does not switch Google accounts or reduce the Drive owner's privileges. The student page shows the assigned Google email and explains this separation. Validate actual file editing in a separate browser profile signed in as that student's Google account, not the instructor's account. No Google OAuth linking is implied by the name/PIN login.

## Accounts and feedback

The 15 cohort accounts were created through the Supabase Auth Admin API, with confirmed internal email identities and student profiles. All pre-existing accounts were the four excluded identities: 강예지, tomset, 홍길동, 홍길순. No duplicate cohort account required a password reset. Their Auth rows, profiles, and existing feedback mappings were compared before and after provisioning and remained unchanged.

The existing 15 feedback records were linked to the matching new account IDs without replacing record IDs or majors. The two legacy test feedback records, 11 existing images, and 9 existing pins remain in the database. The instructor's cohort picker shows only the current roster; legacy students can still view their own feedback. Database RLS, rather than the picker filter, controls access.

The public login page accepts a registered name and four-digit PIN. Self-registration UI and its client method were removed. This is not a claim that the Supabase project's public signup setting was changed. The existing normalization, internal email mapping, and provider password mapping are preserved for all accounts. The initial PIN is distributed separately, not displayed in the login UI.

The password page verifies the current PIN before updating the password, requires matching new values, rejects an unchanged PIN, and clears the fields after success. Desktop navigation and the mobile additional menu retain the password-change link.

The one-time provisioning Edge Function was replaced immediately after use with an HTTP 410 response and JWT verification enabled. Its active version contains no provisioning logic or service-key access.

## Adding one more student

1. Confirm the name and inspect existing folders/accounts for duplicates. A different person with the same name needs a distinct agreed login name; do not reset an account based on an ambiguous name.
2. Reuse existing matching Drive folders or create the missing assignment and portfolio folders under the established roots. Preserve sharing and existing work.
3. Add the verified name to `student-roster.ts` in the intended order. Keep private links and emails out of the client bundle.
4. Create the confirmed account using the server-side Supabase Admin API. Use the same login normalization as `src/lib/auth.tsx`; never place privileged keys in browser code.
5. Link `kmove_feedback_students.user_id` to that account. Preserve an existing feedback row's ID and content. Protected accounts must remain untouched.
6. Provision a `kmove_student_drive_folders` row for the verified account ID, with the name, two URLs, Google email, and sort order. Keep `sharing_ready=false` until both Drive folders' ACLs confirm that Google email. Never make roots or folders publicly editable.
7. Verify name login, own-profile, own-feedback, own-folder access, denied peer-folder reads, and password change. Confirm Google permissions separately. Existing protected accounts and files must remain unchanged.

## Validation

- UI tests cover student-only links, instructor lists, no student root link, untrusted display names, missing mapping, pending sharing, request failure, logout, and late responses after account switching.
- `docs/student-drive-access-check.sql` checks all existing accounts under the actual `authenticated`/`anon` database roles. The instructor sees the cohort; mapped students see one row; unmapped accounts see zero; anonymous reads and all browser mapping writes are denied.
- Protected account Auth/profile/feedback fingerprints matched before and after provisioning.
- The access correction adds only the folder mapping table and its read-only RLS policy (`docs/student-drive-access.sql`). It does not modify existing account credentials, feedback, or student work.
