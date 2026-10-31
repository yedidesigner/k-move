# Feedback submissions

The default feedback tab follows the most recent scheduled class date in `src/data/schedule.ts`, using Asia/Seoul. Before the course it selects 01; after the last class it selects 24. Class numbers remain the stored feedback identifiers, including dates with two classes in a calendar week. On 2026-11-01 the default is WEEK 02. The date is displayed beside the week. Opening the page recalculates the default; an already open workspace is not switched at midnight while someone is writing. The current-week shortcut refreshes on focus and once per minute.

## Submission types

Use **과제 업로드** to select images and other files together in a single multiple-file picker. The separate image-upload and file-attachment buttons have been replaced by this one action; **링크 추가** remains alongside it. Every selected file is validated before the first upload starts. Images automatically appear in the image preview/pin area; other files appear as downloadable submissions. Successfully saved items are refreshed even when a later upload fails.

| Type | Accepted formats | Limit | Feedback |
| --- | --- | --- | --- |
| Image | JPG, JPEG, PNG, WebP | 10 MB per image | Existing image preview and position pins |
| File | PDF, ZIP, TXT, DOCX, PPTX, XLSX, PSD, AI, FIG | 50 MB per file | Download and per-file instructor comments |
| Link | HTTP/HTTPS web links, including Figma and Drive | 2,048 URL characters | Open original service and per-link instructor comments |

The original external service still controls a link's sharing permissions. Adding a Figma or Drive link does not grant access there. Large source files and videos can be submitted by link. Archives are downloaded, not extracted; design source files are not rendered in the browser.

## Storage and access

Existing `kmove_feedback_images`, `kmove_feedback_pins`, and the private screenshot bucket remain intact. The additive `docs/feedback-attachments.sql` migration creates a separate private `kmove-feedback-files` bucket, attachment records, and instructor comments. Files use random object names under the selected student's UUID and two-digit class number. Download URLs expire after 60 seconds and are generated only when requested by an authorized user.

Students read only their own submissions and associated comments. Students submit and delete their own attachments. Instructors can read and submit for each student and create/edit/delete comments. Students cannot write instructor comments. RLS applies to records and storage independently. File records require an uploaded object owned by the submitting account, preventing references to someone else's object. Signed links should not be shared beyond authorized recipients.

An attachment's delete confirmation includes its comments. A failed record insertion attempts to clean up its newly uploaded file. A storage cleanup failure after a record deletion is surfaced to the user for operator attention. No public bucket, automatic archive extraction, or external-link embedding is used.

## Validation

Run the application tests for date boundaries, manual tab selection, attachment upload/link/comment flows, and file/link validation. Run `docs/feedback-attachments-check.sql` through an operator connection to exercise authenticated student/instructor and anonymous RLS using rollback-only test records. Existing screenshot and pin counts must remain unchanged.
