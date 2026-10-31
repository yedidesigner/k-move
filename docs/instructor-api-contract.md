# Instructor LMS API contract

All helpers exported from `src/lib/instructor-api.ts`; async, throw Error on backend rejection. UUID strings. Dates are ISO strings; display Asia/Seoul. Authentication uses existing getSupabase. Read functions obey RLS. Do not assume uploads are submissions. Protected assets remain readable but cannot be deleted after final submission.

## Tables / type names

- `kmove_enrollments` / Enrollment: user_id, student_id (feedback_students ID), name, status ('active'|'completed'), joined_at, updated_at.
- `kmove_assignments` / Assignment: id, session_number (1..24), title, description, requirements, opens_at nullable, due_at nullable, status ('draft'|'published'|'archived'), allow_resubmit boolean, version number, created_at, updated_at.
- `kmove_assignment_targets` / AssignmentTarget: assignment_id,user_id,exempt boolean,due_at nullable (override),created_at.
- `kmove_submission_drafts` / SubmissionDraft: assignment_id,user_id,note,image_ids uuid[],attachment_ids uuid[],version,updated_at. Student owner or instructor may read. Only owner may save/submit.
- `kmove_submissions` / Submission: id,assignment_id,user_id,student_id,version,note,submitted_at,late boolean.
- `kmove_submission_assets` / SubmissionAsset: id,submission_id,image_id nullable,attachment_id nullable. Exactly one; references existing tables.
- `kmove_review_drafts` / ReviewDraft: submission_id,strengths,improvements,next_steps,decision ('changes_requested'|'accepted'),pins ReviewPin[],asset_comments Record<string,string>,private_note,version,published_version (0 initially),updated_at,updated_by. Instructor-only rows.
- `kmove_review_publications` / ReviewPublication: id,submission_id,strengths,improvements,next_steps,decision,pins,asset_comments,version,published_at,published_by. Immutable snapshots. NO private_note.
- `kmove_feedback_reads` / FeedbackRead: publication_id,user_id,read_at. Owner student only records.
- `kmove_content_drafts` / ContentDraft: kind ('session'|'announcement'|'glossary'|'guide'|'path'),content_key,document JSON object,hidden boolean,version,published_version,updated_at,updated_by. Instructor-only.
- `kmove_content_publications` / ContentPublication: id,kind,content_key,document,hidden,version,published_at (effective time),created_at,created_by,cancelled_at nullable. History with future-only schedule cancellation. Students SELECT only published_at<=now(); hidden tombstones remain readable. Resolve latest effective publication per kind/key. Instructors can read scheduled rows.
- `kmove_portfolio_versions` / PortfolioVersion: id,user_id,project_key,title,target_role,next_goal,label,stage,url,notes,version,created_at,created_by. Immutable snapshots, owner+instructor read, owner+instructor append. stage: planning|structure|visual|prototype|case-study|ready.
- `kmove_student_notes` / StudentNote: user_id,content,version,updated_at,updated_by. Instructor-only, optimistic save.
- `kmove_operation_log`: instructor-only audit records.

ReviewPin: {id:string,image_id:string,x:number,y:number,content:string}; x,y normalized 0..1. Must reference an image in that submission.

## Read helpers

`listEnrollments()`, `listAssignments()`, `listAssignmentTargets()`, `listSubmissionDrafts()`, `listSubmissions()`, `listSubmissionAssets()`, `listReviewDrafts()` (instructor only), `listReviewPublications()`, `listFeedbackReads()`, `listContentDrafts()`, `listContentPublications(kind?)`, `listPortfolioVersions()`, `listStudentNotes()`.

`latestPublications(rows, now?)`: pure helper deduplicates content by kind/key, excludes scheduled future rows, highest version among effective non-cancelled rows wins (a newer immediate correction supersedes an older schedule). Tombstone retained.

## Mutations (exact JS signatures)

- `saveAssignment(input: {id?:string; session_number:number; title:string; description:string; requirements:string; opens_at:string|null; due_at:string|null; status:AssignmentStatus; allow_resubmit:boolean; target_user_ids:string[]}, expectedVersion=0): Promise<Assignment>`
- `saveAssignmentTarget(assignmentId,userId,{exempt:boolean,due_at:string|null}): Promise<AssignmentTarget>`
- `saveSubmissionDraft(assignmentId,{note:string,image_ids:string[],attachment_ids:string[]},expectedVersion:number): Promise<SubmissionDraft>`
- `submitAssignment(assignmentId,expectedDraftVersion:number): Promise<Submission>`
- `saveReviewDraft(submissionId,{strengths:string,improvements:string,next_steps:string,decision:ReviewDecision,pins:ReviewPin[],asset_comments:Record<string,string>,private_note:string},expectedVersion:number): Promise<ReviewDraft>`
- `publishReview(submissionId,expectedVersion:number): Promise<ReviewPublication>`
- `markFeedbackRead(publicationId): Promise<void>`
- `saveContentDraft(kind,key,{document:Record<string,unknown>,hidden:boolean},expectedVersion:number): Promise<ContentDraft>`
- `publishContent(kind,key,expectedVersion:number,publishAt:string|null=null): Promise<ContentPublication>`
- `saveEnrollment(userId,{status:'active'|'completed'}): Promise<Enrollment>` (existing enrollment only; additional enrollment uses enrollStudent)
- `enrollStudent(userId): Promise<Enrollment>` (existing student profile with feedback + Drive mapping only; no password/account creation)
- `saveStudentNote(userId,content,expectedVersion): Promise<StudentNote>`
- `appendPortfolioVersion({user_id:string;project_key:string;title:string;target_role:string;next_goal:string;label:string;stage:PortfolioStage;url:string;notes:string}): Promise<PortfolioVersion>`

RPC names all `kmove_<snake_case_helper>`; params `p_assignment_id`, `p_payload`, `p_expected_version`, etc. Source helpers are authoritative. These are authenticated-only public INVOKER wrappers around private guarded atomic functions, never service-role calls from browser. Student roles cannot save assignments/CMS/reviews. Read receipts only for own visible publication.

Submission assets may be reused for a new version of the SAME assignment, not silently attached to another assignment. Student uploads continue using existing feedback tables and 10MB Drive guidance. Draft files exist independently; submit validates matching student and assignment session. Submission asset FK + Storage deletion policy prevent submitted originals being removed. Direct UPDATE/DELETE of immutable versions and published feedback/content are unavailable.

CMS published documents must be original field schemas understood by the UI. Session content_key is session ID (S01 etc). Other keys preserve current static IDs. Hidden publication suppresses corresponding baseline. Scheduling does not require cron because effective-time SELECT policy controls release.

## Additional locked details

- `cancelContentSchedule(publicationId):Promise<void>` cancels only future publications and bumps the corresponding draft revision; reload drafts/publications after cancellation.
- `listOperationLog()` returns instructor-only operations (id,actor_id,action,target_id,details,created_at).
- `relinkStudentAccount(studentId,newUserId)` accepts same-name verified mapped accounts only before any materials, submissions, assignments, notes or portfolio records exist. Protected legacy names cannot be changed.
- Reads paginate in stable 500-row batches; no implicit 1000-row truncation.
- Every optimistic mutation rejects null expectedVersion as well as stale versions.
- Submit increments the retained draft revision (content/assets remain); reload after submit.
- Image/file metadata must refer to an existing Storage object at submit time; links are exempt. Storage delete/overwrite and submit share an asset lock; referenced originals are retained.
