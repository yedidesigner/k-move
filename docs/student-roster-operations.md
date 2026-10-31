# K-Move student roster

Updated 2026-11-01 (Asia/Seoul).

## Current cohort

The 15-name instructor roster lives in `src/data/student-roster.ts`. Assignment folders, portfolio folders, and the instructor's feedback picker all use its order. Keep both Drive destinations with the corresponding name when adding a student.

Both existing Drive roots were inspected. The original 28 child folders were retained, and the two missing 김재은 folders were created and read back. Each root now contains 15 student folders. The links do not grant Drive permissions: the inspected roots and children are currently owner-only. Student Google account email addresses are required to share the appropriate folders privately. Do not enable public editing as a substitute.

## Accounts and feedback

The 15 cohort accounts were created through the Supabase Auth Admin API, with confirmed internal email identities and student profiles. All pre-existing accounts were the four excluded identities: 강예지, tomset, 홍길동, 홍길순. No duplicate cohort account required a password reset. Their Auth rows, profiles, and existing feedback mappings were compared before and after provisioning and remained unchanged.

The existing 15 feedback records were linked to the matching new account IDs without replacing record IDs or majors. The two legacy test feedback records, 11 existing images, and 9 existing pins remain in the database. The instructor's cohort picker shows only the current roster; legacy students can still view their own feedback. Database RLS, rather than the picker filter, controls access.

The public login page accepts a registered name and four-digit PIN. Self-registration UI and its client method were removed. This is not a claim that the Supabase project's public signup setting was changed. The existing normalization, internal email mapping, and provider password mapping are preserved for all accounts. The initial PIN is distributed separately, not displayed in the login UI.

The password page verifies the current PIN before updating the password, requires matching new values, rejects an unchanged PIN, and clears the fields after success. Desktop navigation and the mobile additional menu retain the password-change link.

The one-time provisioning Edge Function was replaced immediately after use with an HTTP 410 response and JWT verification enabled. Its active version contains no provisioning logic or service-key access.

## Adding one more student

1. Confirm the name and inspect existing folders/accounts for duplicates. A different person with the same name needs a distinct agreed login name; do not reset an account based on an ambiguous name.
2. Reuse existing matching Drive folders or create the missing assignment and portfolio folders under the established roots. Preserve sharing and existing work.
3. Add the verified name and two folder URLs to `student-roster.ts` in the intended order.
4. Create the confirmed account using the server-side Supabase Admin API. Use the same login normalization as `src/lib/auth.tsx`; never place privileged keys in browser code.
5. Link `kmove_feedback_students.user_id` to that account. Preserve an existing feedback row's ID and content. Protected accounts must remain untouched.
6. Verify name login, own-profile and own-feedback access, folder links, and password change. Share each student's folders with their verified Google account when supplied.

## Validation

- Full automated suite: 18 files, 135 tests passed.
- Tests cover the ordered 15-folder collections, 17 stored feedback rows becoming a 15-person instructor picker, legacy students retaining their own view, missing own-record handling, login compatibility, and password-change behavior.
- Protected account Auth/profile/feedback fingerprints matched before and after provisioning.
- No database schema, RLS policy, or student work content was changed.
