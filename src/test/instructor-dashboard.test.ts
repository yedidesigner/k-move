import { describe, expect, it } from "vitest";
import { summarizeInstructorWork, type InstructorWorkData } from "@/lib/instructor-dashboard";
import type {
  Assignment,
  Enrollment,
  Submission,
  ReviewDraft,
  ReviewPublication,
} from "@/lib/instructor-api";
const now = new Date("2026-11-01T03:00:00Z");
const student = (id: string, status: Enrollment["status"] = "active"): Enrollment => ({
  user_id: id,
  student_id: `s-${id}`,
  name: id,
  status,
  joined_at: "2026-10-25T00:00:00Z",
  updated_at: "2026-10-25T00:00:00Z",
});
const assignment = (id: string, due: string | null = "2026-11-01T02:00:00Z"): Assignment => ({
  id,
  session_number: 2,
  title: id,
  description: "",
  requirements: "",
  opens_at: null,
  due_at: due,
  status: "published",
  allow_resubmit: true,
  version: 1,
  created_at: "2026-10-25T00:00:00Z",
  updated_at: "2026-10-25T00:00:00Z",
});
const submission = (id: string, user = "a", version = 1, assignmentId = "task"): Submission => ({
  id,
  assignment_id: assignmentId,
  user_id: user,
  student_id: `s-${user}`,
  version,
  note: "",
  submitted_at: "2026-11-01T01:00:00Z",
  late: false,
});
const review = (id: string, version = 1, published = 0): ReviewDraft => ({
  submission_id: id,
  version,
  published_version: published,
  updated_at: "2026-11-01T01:30:00Z",
  updated_by: "teacher",
  strengths: "좋은 구조",
  improvements: "",
  next_steps: "",
  decision: "accepted",
  pins: [],
  asset_comments: {},
  private_note: "강사 메모",
});
const publication = (id: string, version = 1): ReviewPublication => ({
  id: `pub-${id}-${version}`,
  submission_id: id,
  version,
  published_at: "2026-11-01T01:45:00Z",
  published_by: "teacher",
  strengths: "좋은 구조",
  improvements: "",
  next_steps: "",
  decision: "accepted",
  pins: [],
  asset_comments: {},
});
const data = (): InstructorWorkData => ({
  enrollments: [student("a"), student("b")],
  assignments: [assignment("task")],
  targets: [
    {
      assignment_id: "task",
      user_id: "a",
      exempt: false,
      due_at: null,
      created_at: "2026-10-25T00:00:00Z",
    },
    {
      assignment_id: "task",
      user_id: "b",
      exempt: false,
      due_at: null,
      created_at: "2026-10-25T00:00:00Z",
    },
  ],
  submissions: [],
  reviews: [],
  publications: [],
});
describe("Instructor actionable counts", () => {
  it("does not count legacy accounts, completed students, exempt targets, or unpublished assignments", () => {
    const d = data();
    d.enrollments.push(student("former", "completed"));
    d.targets.push({
      assignment_id: "task",
      user_id: "former",
      exempt: false,
      due_at: null,
      created_at: "2026-10-25T00:00:00Z",
    });
    d.targets[1]!.exempt = true;
    d.submissions = [
      submission("legacy", "outside"),
      submission("former-sub", "former"),
      submission("exempt", "b"),
    ];
    const s = summarizeInstructorWork(d, now);
    expect(s.latest).toHaveLength(0);
    expect(s.pending).toHaveLength(0);
    expect(s.missingStudentCount).toBe(1);
    d.assignments[0]!.status = "draft";
    expect(summarizeInstructorWork(d, now).missing).toHaveLength(0);
  });
  it("counts people once across missed assignments and respects individual extensions and no deadline", () => {
    const d = data();
    d.assignments.push(assignment("task2"), assignment("open", null));
    d.targets.push(
      { ...d.targets[0]!, assignment_id: "task2" },
      { ...d.targets[0]!, assignment_id: "open" },
    );
    d.targets[1]!.due_at = "2026-11-02T00:00:00Z";
    const s = summarizeInstructorWork(d, now);
    expect(s.missing).toHaveLength(2);
    expect(s.missingStudentCount).toBe(1);
  });
  it("queues only latest revision and does not mistake an old published review for completion of a revision", () => {
    const d = data();
    d.submissions = [submission("v1"), submission("v2", "a", 2)];
    d.reviews = [review("v1", 1, 1)];
    d.publications = [publication("v1")];
    const s = summarizeInstructorWork(d, now);
    expect(s.pending.map((r) => r.submission.id)).toEqual(["v2"]);
    expect(s.missing.map((r) => r.enrollment.user_id)).toEqual(["b"]);
  });
  it("keeps unsent edits actionable and removes a fully published draft from the queue", () => {
    const d = data();
    d.submissions = [submission("first"), submission("second", "b")];
    d.reviews = [review("first", 2, 1)];
    d.publications = [publication("first")];
    const s = summarizeInstructorWork(d, now);
    expect(s.drafts).toHaveLength(1);
    expect(s.pending).toHaveLength(1);
    expect(s.queue[0]!.submission.id).toBe("first");
    d.reviews[0]!.published_version = 2;
    d.publications.push(publication("first", 2));
    expect(summarizeInstructorWork(d, now).queue.map((r) => r.submission.id)).toEqual(["second"]);
  });
});
