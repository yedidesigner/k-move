import type {
  Assignment,
  AssignmentTarget,
  Enrollment,
  ReviewDraft,
  ReviewPublication,
  Submission,
} from "./instructor-api";

export interface InstructorWorkData {
  enrollments: Enrollment[];
  assignments: Assignment[];
  targets: AssignmentTarget[];
  submissions: Submission[];
  reviews: ReviewDraft[];
  publications: ReviewPublication[];
}

export function summarizeInstructorWork(data: InstructorWorkData, now = new Date()) {
  const students = new Map(
    data.enrollments.filter((row) => row.status === "active").map((row) => [row.user_id, row]),
  );
  const assignments = new Map(
    data.assignments.filter((row) => row.status === "published").map((row) => [row.id, row]),
  );
  const targets = new Map(
    data.targets
      .filter(
        (row) => !row.exempt && students.has(row.user_id) && assignments.has(row.assignment_id),
      )
      .map((row) => [`${row.assignment_id}:${row.user_id}`, row]),
  );
  const latestMap = new Map<string, Submission>();
  for (const row of data.submissions) {
    const key = `${row.assignment_id}:${row.user_id}`;
    if (!targets.has(key)) continue;
    const previous = latestMap.get(key);
    if (!previous || row.version > previous.version) latestMap.set(key, row);
  }
  const reviews = new Map(data.reviews.map((row) => [row.submission_id, row]));
  const published = new Map<string, ReviewPublication>();
  for (const row of data.publications) {
    const previous = published.get(row.submission_id);
    if (!previous || row.version > previous.version) published.set(row.submission_id, row);
  }
  const latest = [...latestMap.values()];
  const queue = latest
    .flatMap((submission) => {
      const draft = reviews.get(submission.id);
      const publication = published.get(submission.id);
      const kind =
        draft && draft.version > draft.published_version
          ? ("draft" as const)
          : !publication
            ? ("pending" as const)
            : null;
      if (!kind) return [];
      return [
        {
          submission,
          assignment: assignments.get(submission.assignment_id)!,
          enrollment: students.get(submission.user_id)!,
          draft,
          publication,
          kind,
        },
      ];
    })
    .sort((a, b) =>
      a.kind === b.kind
        ? a.submission.submitted_at.localeCompare(b.submission.submitted_at)
        : a.kind === "draft"
          ? -1
          : 1,
    );
  const missing = [...targets.values()].flatMap((target) => {
    const assignment = assignments.get(target.assignment_id)!;
    const deadline = target.due_at ?? assignment.due_at;
    if (
      !deadline ||
      new Date(deadline).getTime() >= now.getTime() ||
      latestMap.has(`${target.assignment_id}:${target.user_id}`)
    )
      return [];
    return [{ target, assignment, enrollment: students.get(target.user_id)! }];
  });
  return {
    latest,
    queue,
    missing,
    missingStudentCount: new Set(missing.map((row) => row.enrollment.user_id)).size,
    pending: queue.filter((row) => row.kind === "pending"),
    drafts: queue.filter((row) => row.kind === "draft"),
  };
}
