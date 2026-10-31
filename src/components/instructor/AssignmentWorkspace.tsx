import { useEditorExitGuard } from "@/lib/editor-exit-guard";
import { useBlocker } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { useFeedbackWeek } from "@/hooks/use-feedback-week";
import { usePublishedSessions } from "@/lib/published-content";
import { FeedbackWorkspace } from "@/components/FeedbackWorkspace";
import { StudentDriveFolders } from "@/components/StudentDriveFolders";
import {
  listAssignments,
  listAssignmentTargets,
  listEnrollments,
  listFeedbackReads,
  listReviewDrafts,
  listReviewPublications,
  listSubmissionAssets,
  listSubmissionDrafts,
  listSubmissions,
  saveAssignment,
  saveAssignmentTarget,
  type Assignment,
  type AssignmentInput,
  type AssignmentTarget,
  type Enrollment,
  type FeedbackRead,
  type ReviewDraft,
  type ReviewPublication,
  type Submission,
  type SubmissionAsset,
  type SubmissionDraft,
} from "@/lib/instructor-api";
import { summarizeInstructorWork } from "@/lib/instructor-dashboard";
import { ReviewWorkspace } from "./ReviewWorkspace";
import { StudentSubmissions } from "./StudentSubmissions";
import {
  errorMessage,
  formatWorkspaceDate,
  fromSeoulInput,
  loadWorkspaceAssets,
  toSeoulInput,
  type WorkspaceAsset,
} from "./workspace-utils";
import "./workspace.css";

type Data = {
  enrollments: Enrollment[];
  assignments: Assignment[];
  targets: AssignmentTarget[];
  submissions: Submission[];
  assetRefs: SubmissionAsset[];
  submissionDrafts: SubmissionDraft[];
  reviews: ReviewDraft[];
  publications: ReviewPublication[];
  reads: FeedbackRead[];
};
const EMPTY: Data = {
  enrollments: [],
  assignments: [],
  targets: [],
  submissions: [],
  assetRefs: [],
  submissionDrafts: [],
  reviews: [],
  publications: [],
  reads: [],
};
const FILTERS = [
  ["all", "전체 제출"],
  ["pending", "검토 대기"],
  ["draft", "작성 중 피드백"],
  ["missing", "마감 후 미제출"],
] as const;
type Filter = (typeof FILTERS)[number][0];
type LegacyStudent = Pick<Enrollment, "user_id" | "student_id" | "name">;
function params() {
  return typeof window === "undefined"
    ? new URLSearchParams()
    : new URLSearchParams(window.location.search);
}

export function AssignmentWorkspace() {
  const { user, status } = useAuth();
  if (!user || (status !== "instructor" && status !== "student"))
    return <p className="p-6 text-sm">로그인 정보를 확인하고 있습니다.</p>;
  return (
    <Workspace key={`${user.id}:${status}`} userId={user.id} instructor={status === "instructor"} />
  );
}

function Workspace({ userId, instructor }: { userId: string; instructor: boolean }) {
  const sessions = usePublishedSessions();
  const { week, setWeek, currentWeek } = useFeedbackWeek();
  const [data, setData] = useState<Data>(EMPTY),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [revision, setRevision] = useState(0),
    [tab, setTab] = useState<"review" | "manage" | "legacy">("review"),
    [sessionFilter, setSessionFilter] = useState(
      () =>
        params().get("session") ??
        (params().get("submission") || params().get("assignment") ? "all" : String(week)),
    ),
    [filter, setFilter] = useState<Filter>(() => {
      const f = params().get("filter");
      return FILTERS.some(([key]) => key === f) ? (f as Filter) : "all";
    }),
    [assignmentFilter, setAssignmentFilter] = useState(() => params().get("assignment") ?? "all"),
    [query, setQuery] = useState(""),
    [selectedSubmission, setSelectedSubmission] = useState(() => params().get("submission") ?? ""),
    [selectedAssignment, setSelectedAssignment] = useState(() => params().get("assignment") ?? ""),
    [editor, setEditor] = useState<Assignment | "new" | null>(null),
    [assets, setAssets] = useState<WorkspaceAsset[]>([]),
    [assetsLoading, setAssetsLoading] = useState(false),
    [legacyStudent, setLegacyStudent] = useState("");
  const [legacyOwn, setLegacyOwn] = useState<LegacyStudent | null>(null);
  const leaveGuard = useRef<(() => Promise<boolean>) | null>(null);
  const registerLeaveGuard = useCallback((fn: (() => Promise<boolean>) | null) => {
    leaveGuard.current = fn;
  }, []);
  const reload = useCallback(() => setRevision((v) => v + 1), []);
  const reviewSaved = useCallback(
    (draft: ReviewDraft) =>
      setData((previous) => ({
        ...previous,
        reviews: [
          ...previous.reviews.filter((row) => row.submission_id !== draft.submission_id),
          draft,
        ],
      })),
    [],
  );
  const submissionDraftSaved = useCallback(
    (draft: SubmissionDraft) =>
      setData((previous) => ({
        ...previous,
        submissionDrafts: [
          ...previous.submissionDrafts.filter(
            (row) => row.assignment_id !== draft.assignment_id || row.user_id !== draft.user_id,
          ),
          draft,
        ],
      })),
    [],
  );
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    void Promise.all([
      listEnrollments(),
      listAssignments(),
      listAssignmentTargets(),
      listSubmissions(),
      listSubmissionAssets(),
      listSubmissionDrafts(),
      instructor ? listReviewDrafts() : Promise.resolve([]),
      listReviewPublications(),
      listFeedbackReads(),
    ])
      .then(
        ([
          enrollments,
          assignments,
          targets,
          submissions,
          assetRefs,
          submissionDrafts,
          reviews,
          publications,
          reads,
        ]) => {
          if (alive)
            setData({
              enrollments,
              assignments,
              targets,
              submissions,
              assetRefs,
              submissionDrafts,
              reviews,
              publications,
              reads,
            });
        },
      )
      .catch((e) => {
        if (alive) setError("과제와 제출 현황을 불러오지 못했습니다. " + errorMessage(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [userId, instructor, revision]);
  const [clock, setClock] = useState(Date.now);
  useEffect(() => {
    const tick = () => setClock(Date.now());
    const timer = window.setInterval(tick, 60_000);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", tick);
    };
  }, []);
  const summary = useMemo(() => summarizeInstructorWork(data, new Date(clock)), [data, clock]);
  const submission = data.submissions.find((s) => s.id === selectedSubmission);
  const assignment = data.assignments.find((a) => a.id === submission?.assignment_id);
  const student = data.enrollments.find((s) => s.user_id === submission?.user_id);
  useEffect(() => {
    let active = true;
    setAssets([]);
    if (!student || !assignment) {
      setAssetsLoading(false);
      return;
    }
    setAssetsLoading(true);
    void loadWorkspaceAssets(student.student_id, assignment.session_number)
      .then((rows) => {
        if (active) setAssets(rows);
      })
      .catch((e) => {
        if (active) setError("제출 자료를 불러오지 못했습니다. " + errorMessage(e));
      })
      .finally(() => {
        if (active) setAssetsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [student?.student_id, assignment?.session_number, revision]);
  async function changeContext(action: () => void) {
    if (leaveGuard.current && !(await leaveGuard.current())) {
      setError(
        "작성 중인 내용을 저장하지 못해 화면 이동을 멈췄습니다. 현재 화면에서 저장을 다시 시도해 주세요.",
      );
      return;
    }
    leaveGuard.current = null;
    action();
    setNotice("");
  }
  function selectSubmission(id: string) {
    void changeContext(() => {
      setSelectedSubmission(id);
      setTab("review");
    });
  }
  const matches = (a: Assignment, e: Enrollment) =>
    (sessionFilter === "all" || String(a.session_number) === sessionFilter) &&
    (assignmentFilter === "all" || a.id === assignmentFilter) &&
    `${e.name} ${a.title}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  const historyLatest = new Map<string, Submission>();
  for (const row of data.submissions) {
    const key = `${row.assignment_id}:${row.user_id}`;
    if (row.version > (historyLatest.get(key)?.version ?? 0)) historyLatest.set(key, row);
  }
  const latestRows = [...historyLatest.values()]
    .flatMap((s) => {
      const a = data.assignments.find((a) => a.id === s.assignment_id),
        e = data.enrollments.find((e) => e.user_id === s.user_id);
      return a && e && matches(a, e) ? [{ submission: s, assignment: a, enrollment: e }] : [];
    })
    .sort((a, b) => b.submission.submitted_at.localeCompare(a.submission.submitted_at));
  const queueRows =
    filter === "all"
      ? latestRows
      : summary.queue.filter(
          (row) => row.kind === filter && matches(row.assignment, row.enrollment),
        );
  const missingRows = summary.missing.filter((row) => matches(row.assignment, row.enrollment));
  const activeEnrollments = data.enrollments.filter((e) => e.status === "active");
  const own = data.enrollments.find((e) => e.user_id === userId);
  const studentAssignments = data.assignments.filter((a) =>
    data.targets.some((t) => t.assignment_id === a.id && t.user_id === userId),
  );
  const ownAssignment =
    studentAssignments.find((a) => a.id === selectedAssignment) ??
    studentAssignments.find((a) => a.session_number === week) ??
    studentAssignments[0];
  useEffect(() => {
    // Freeze the initial selection once data is ready. A date/schedule refresh is
    // only a new recommendation, never permission to replace an active editor.
    if (
      !instructor &&
      !loading &&
      ownAssignment &&
      !studentAssignments.some((a) => a.id === selectedAssignment)
    ) {
      setSelectedAssignment(ownAssignment.id);
    }
  }, [instructor, loading, ownAssignment?.id, selectedAssignment, studentAssignments]);
  const target = ownAssignment
    ? data.targets.find((t) => t.assignment_id === ownAssignment.id && t.user_id === userId)
    : undefined;
  const versions = submission
    ? data.submissions
        .filter(
          (s) => s.assignment_id === submission.assignment_id && s.user_id === submission.user_id,
        )
        .sort((a, b) => b.version - a.version)
    : [];
  const previous = versions.find((s) => submission && s.version < submission.version);
  function submissionAssets(id: string) {
    const refs = data.assetRefs.filter((a) => a.submission_id === id);
    return assets.filter((a) => refs.some((r) => r.image_id === a.id || r.attachment_id === a.id));
  }
  useEffect(() => {
    let active = true;
    setLegacyOwn(null);
    if (instructor || loading || own) return;
    void getSupabase()
      .from("kmove_feedback_students")
      .select("id,name,user_id")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data: row, error: lookupError }) => {
        if (active && row && !lookupError && row.user_id === userId)
          setLegacyOwn({ student_id: row.id, user_id: row.user_id, name: row.name });
      });
    return () => {
      active = false;
    };
  }, [instructor, userId, loading, own?.user_id]);
  const currentLegacy = instructor
    ? (data.enrollments.find((e) => e.user_id === legacyStudent) ?? activeEnrollments[0])
    : (own ?? legacyOwn ?? undefined);
  function rowState(s: Submission) {
    const draft = data.reviews.find((d) => d.submission_id === s.id),
      pub = data.publications
        .filter((p) => p.submission_id === s.id)
        .sort((a, b) => b.version - a.version)[0];
    if (draft && draft.version > draft.published_version) return "작성 중";
    if (pub) return pub.decision === "changes_requested" ? "수정 요청" : "피드백 공개";
    return "검토 대기";
  }
  function nextSubmission() {
    const candidates = summary.queue.filter(
      (row) => row.submission.id !== submission?.id && matches(row.assignment, row.enrollment),
    );
    if (candidates[0]) setSelectedSubmission(candidates[0].submission.id);
    else setNotice("현재 조건에서 다음 검토 대기 제출물이 없습니다.");
  }
  const selectedPublication = data.publications
    .filter((p) => p.submission_id === submission?.id)
    .sort((a, b) => b.version - a.version)[0];
  const read = selectedPublication
    ? data.reads.find(
        (r) => r.publication_id === selectedPublication.id && r.user_id === submission?.user_id,
      )
    : undefined;
  return (
    <div className="instructor-workspace">
      <header>
        <p className="mb-2 text-xs font-semibold tracking-[.15em] text-neutral-500">
          {instructor ? "TEACHING WORKSPACE" : "ASSIGNMENTS & FEEDBACK"}
        </p>
        <h1 className="iw-heading">{instructor ? "과제·피드백" : "과제와 피드백"}</h1>
        <p className="iw-description">
          {instructor
            ? "제출물을 확인하고, 피드백을 작성해 학생에게 공개하세요."
            : "자료를 모아 제출하고, 강사의 피드백과 수정 이력을 확인하세요."}
        </p>
      </header>
      {error && (
        <div role="alert" className="iw-error">
          {error}
          <button className="ml-3 underline" onClick={reload}>
            다시 불러오기
          </button>
        </div>
      )}
      {notice && (
        <p role="status" className="iw-notice">
          {notice}
        </p>
      )}
      {instructor ? (
        <>
          <div className="iw-toolbar">
            <div className="iw-summary">
              <span>수강 중 {activeEnrollments.length}명</span>
              <span>검토 대기 {summary.pending.length}건</span>
              <span>작성 중 {summary.drafts.length}건</span>
            </div>
            <div className="flex gap-2">
              <button
                className="iw-button"
                disabled={loading}
                onClick={() => void changeContext(reload)}
              >
                <RefreshCw size={14} />
                새로고침
              </button>
              <button
                className="iw-button iw-primary"
                onClick={() =>
                  void changeContext(() => {
                    setEditor("new");
                    setTab("manage");
                  })
                }
              >
                <Plus size={14} />
                과제 만들기
              </button>
            </div>
          </div>
          <div role="tablist" aria-label="과제 관리 화면" className="iw-tabs">
            {(
              [
                ["review", "제출 검토"],
                ["manage", "과제 관리"],
                ["legacy", "기존 등록 자료"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => void changeContext(() => setTab(key))}
              >
                {label}
              </button>
            ))}
          </div>
          {tab === "manage" && (
            <>
              {editor && (
                <AssignmentEditor
                  key={editor === "new" ? "new" : editor.id}
                  initial={editor === "new" ? undefined : editor}
                  enrollments={data.enrollments}
                  targets={data.targets}
                  defaultSession={currentWeek}
                  registerLeaveGuard={registerLeaveGuard}
                  onCancel={() => setEditor(null)}
                  onSaved={() => {
                    setEditor(null);
                    setNotice("과제 설정을 저장했습니다.");
                    reload();
                  }}
                />
              )}
              {!loading && data.assignments.length === 0 && !editor && (
                <p className="iw-empty">
                  등록된 과제가 없습니다. ‘과제 만들기’에서 제출할 내용을 안내해 주세요.
                </p>
              )}
              <div className="space-y-4">
                {data.assignments.map((a) => (
                  <article key={a.id} className="border border-neutral-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="iw-muted">
                          {a.session_number}회차 ·{" "}
                          {a.status === "published"
                            ? "공개 중"
                            : a.status === "archived"
                              ? "보관됨"
                              : "작성 중"}
                        </p>
                        <h2 className="mt-1 text-base font-semibold">{a.title}</h2>
                        <p className="iw-muted mt-2">
                          마감 {formatWorkspaceDate(a.due_at)} · 배정{" "}
                          {data.targets.filter((t) => t.assignment_id === a.id && !t.exempt).length}
                          명
                        </p>
                      </div>
                      <button
                        className="iw-button"
                        onClick={() => void changeContext(() => setEditor(a))}
                      >
                        과제 수정
                      </button>
                    </div>
                    <details className="mt-4 border-t border-neutral-200 pt-3">
                      <summary className="cursor-pointer text-sm font-medium">
                        학생별 마감·면제 설정
                      </summary>
                      <div className="iw-table-wrap mt-3">
                        <table className="iw-table">
                          <thead>
                            <tr>
                              <th>학생</th>
                              <th>개별 마감 · 한국 시간</th>
                              <th>제출 면제</th>
                              <th>저장</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.targets
                              .filter((t) => t.assignment_id === a.id)
                              .map((t) => (
                                <TargetEditor
                                  key={`${a.id}:${t.user_id}:${t.due_at}:${t.exempt}`}
                                  target={t}
                                  name={
                                    data.enrollments.find((e) => e.user_id === t.user_id)?.name ??
                                    "수강생"
                                  }
                                  onSaved={reload}
                                />
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  </article>
                ))}
              </div>
            </>
          )}
          {tab === "review" && (
            <>
              <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className="iw-label">
                  회차
                  <select
                    className="iw-input"
                    value={sessionFilter}
                    onChange={(e) => setSessionFilter(e.target.value)}
                  >
                    <option value="all">전체 회차</option>
                    {sessions.map((s) => (
                      <option key={s.id} value={s.number}>
                        {String(s.number).padStart(2, "0")}회차 · {s.date}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="iw-label">
                  과제
                  <select
                    className="iw-input"
                    value={assignmentFilter}
                    onChange={(e) => setAssignmentFilter(e.target.value)}
                  >
                    <option value="all">전체 과제</option>
                    {data.assignments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="iw-label">
                  상태
                  <select
                    className="iw-input"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as Filter)}
                  >
                    {FILTERS.map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="iw-label">
                  학생·과제 검색
                  <input
                    className="iw-input"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="이름 또는 과제명"
                  />
                </label>
              </div>
              <div className="iw-review-workbench">
                <div className="iw-review-queue">
                  {!loading && (
                    <div className="iw-queue" aria-label="제출 검토 목록">
                      {filter === "missing" ? (
                        missingRows.length ? (
                          missingRows.map((row) => (
                            <div
                              key={`${row.assignment.id}:${row.enrollment.user_id}`}
                              className="iw-queue-row"
                            >
                              <div>
                                <strong>{row.enrollment.name}</strong>
                                <small>
                                  {row.assignment.session_number}회차 · {row.assignment.title}
                                </small>
                              </div>
                              <div className="text-right">
                                <span className="iw-badge" data-tone="attention">
                                  마감 후 미제출
                                </span>
                                <small>
                                  마감{" "}
                                  {formatWorkspaceDate(row.target.due_at ?? row.assignment.due_at)}
                                </small>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="iw-empty border-0">
                            현재 조건에서 마감 후 미제출 학생이 없습니다.
                          </p>
                        )
                      ) : queueRows.length ? (
                        queueRows.map((row) => (
                          <button
                            key={row.submission.id}
                            className="iw-queue-row"
                            aria-pressed={selectedSubmission === row.submission.id}
                            onClick={() => selectSubmission(row.submission.id)}
                          >
                            <div>
                              <strong>
                                {row.enrollment.name}{" "}
                                <span className="ml-2 font-normal text-neutral-500">
                                  v{row.submission.version}
                                </span>
                              </strong>
                              <small>
                                {row.assignment.session_number}회차 · {row.assignment.title}
                              </small>
                            </div>
                            <div className="text-right">
                              <span className="iw-badge">{rowState(row.submission)}</span>
                              {row.submission.late && (
                                <span className="iw-badge ml-1" data-tone="attention">
                                  지각
                                </span>
                              )}
                              <small>{formatWorkspaceDate(row.submission.submitted_at)}</small>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="iw-empty border-0">현재 조건에 맞는 제출물이 없습니다.</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="iw-review-selection">
                  {submission && assignment && student ? (
                    <>
                      <div className="iw-version-bar flex flex-wrap items-end gap-3">
                        <label className="iw-label">
                          제출 버전
                          <select
                            className="iw-input"
                            value={submission.id}
                            onChange={(e) => selectSubmission(e.target.value)}
                          >
                            {versions.map((s) => (
                              <option key={s.id} value={s.id}>
                                v{s.version} · {formatWorkspaceDate(s.submitted_at)}
                              </option>
                            ))}
                          </select>
                        </label>
                        {selectedPublication && (
                          <p className="iw-muted mb-3">
                            {read
                              ? `학생 확인 ${formatWorkspaceDate(read.read_at)}`
                              : "공개 피드백을 아직 확인하지 않았습니다."}
                          </p>
                        )}
                      </div>
                      {assetsLoading ? (
                        <p className="iw-empty mt-4">제출 자료를 불러오는 중…</p>
                      ) : (
                        <ReviewWorkspace
                          assignment={assignment}
                          student={student}
                          submission={submission}
                          assets={submissionAssets(submission.id)}
                          initialDraft={data.reviews.find((r) => r.submission_id === submission.id)}
                          publications={data.publications}
                          previous={
                            previous
                              ? { submission: previous, assets: submissionAssets(previous.id) }
                              : undefined
                          }
                          onChanged={() => {
                            setNotice("피드백을 학생에게 공개했습니다.");
                            reload();
                          }}
                          onDraftSaved={reviewSaved}
                          onNext={nextSubmission}
                          registerLeaveGuard={registerLeaveGuard}
                        />
                      )}
                    </>
                  ) : (
                    !loading &&
                    queueRows.length > 0 && (
                      <p className="iw-muted mt-4">
                        목록에서 학생을 선택하면 제출물과 피드백 작성 화면이 열립니다.
                      </p>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="iw-toolbar">
            <label className="iw-label min-w-0 flex-1">
              과제 선택
              <select
                className="iw-input"
                value={ownAssignment?.id ?? ""}
                onChange={(e) => void changeContext(() => setSelectedAssignment(e.target.value))}
              >
                <option value="" disabled>
                  과제를 선택하세요
                </option>
                {studentAssignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {String(a.session_number).padStart(2, "0")}회차 · {a.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="iw-button"
              onClick={() => void changeContext(reload)}
              disabled={loading}
            >
              <RefreshCw size={14} />
              새로고침
            </button>
          </div>
          {!loading && own && ownAssignment && target ? (
            <StudentSubmissions
              assignment={ownAssignment}
              student={own}
              target={target}
              initialDraft={data.submissionDrafts.find(
                (d) => d.assignment_id === ownAssignment.id && d.user_id === userId,
              )}
              submissions={data.submissions
                .filter((s) => s.assignment_id === ownAssignment.id && s.user_id === userId)
                .sort((a, b) => b.version - a.version)}
              allSubmissions={data.submissions}
              assetRefs={data.assetRefs}
              publications={data.publications}
              onChanged={() => {
                setNotice("과제 제출이 완료되었습니다. 제출 이력에서 확인할 수 있습니다.");
                reload();
              }}
              onDraftSaved={submissionDraftSaved}
              registerLeaveGuard={registerLeaveGuard}
            />
          ) : (
            !loading && (
              <p className="iw-empty">
                {own
                  ? "배정된 과제가 아직 없습니다. 강사가 과제를 공개하면 이곳에서 제출할 수 있습니다."
                  : "현재 과정에 연결된 수강 정보가 없습니다. 강사에게 문의해 주세요."}
              </p>
            )
          )}
          <details className="iw-section">
            <summary className="cursor-pointer text-sm font-semibold">
              내 Google Drive 과제 폴더
            </summary>
            <div className="mt-4">
              <StudentDriveFolders kind="assignment" />
            </div>
          </details>
          <details
            className="iw-section"
            onToggle={(event) => {
              if (event.currentTarget.open) setTab("legacy");
            }}
          >
            <summary className="cursor-pointer text-sm font-semibold">
              기존에 등록한 자료와 피드백
            </summary>
            {tab === "legacy" && (
              <LegacyWorkspace
                enrollment={currentLegacy}
                enrollments={data.enrollments}
                instructor={false}
                userId={userId}
                week={week}
                setWeek={setWeek}
                selectedStudent={legacyStudent}
                setStudent={setLegacyStudent}
              />
            )}
          </details>
        </>
      )}
      {loading && (
        <p role="status" className="iw-muted my-6">
          과제와 제출 현황을 확인하고 있습니다…
        </p>
      )}
      {instructor && tab === "legacy" && (
        <LegacyWorkspace
          enrollment={currentLegacy}
          enrollments={data.enrollments}
          instructor
          userId={userId}
          week={week}
          setWeek={setWeek}
          selectedStudent={legacyStudent}
          setStudent={setLegacyStudent}
        />
      )}
    </div>
  );
}

function LegacyWorkspace({
  enrollment,
  enrollments,
  instructor,
  userId,
  week,
  setWeek,
  selectedStudent,
  setStudent,
}: {
  enrollment?: LegacyStudent | undefined;
  enrollments: Enrollment[];
  instructor: boolean;
  userId: string;
  week: number;
  setWeek: (week: number) => void;
  selectedStudent: string;
  setStudent: (id: string) => void;
}) {
  const sessions = usePublishedSessions();
  return (
    <section className="mt-5">
      <p className="iw-notice">
        기존 등록 자료는 최종 제출 기록과 구분해 보존합니다.{" "}
        {instructor
          ? "새 과제의 피드백은 ‘제출 검토’에서 초안으로 작성해 공개해 주세요."
          : "새 과제에 제출하려면 과제를 선택하고 해당 자료를 포함해 ‘제출하기’를 눌러 주세요."}
      </p>
      <div className="my-4 grid gap-3 sm:grid-cols-2">
        {instructor && (
          <label className="iw-label">
            학생
            <select
              className="iw-input"
              value={selectedStudent || enrollment?.user_id || ""}
              onChange={(e) => setStudent(e.target.value)}
            >
              {enrollments.map((e) => (
                <option key={e.user_id} value={e.user_id}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="iw-label">
          회차
          <select
            className="iw-input"
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
          >
            {sessions.map((s) => (
              <option value={s.number} key={s.id}>
                {s.number}회차 · {s.date}
              </option>
            ))}
          </select>
        </label>
      </div>
      {enrollment ? (
        <FeedbackWorkspace
          key={`${enrollment.user_id}:${week}`}
          studentId={enrollment.student_id}
          studentName={enrollment.name}
          week={week}
          userId={userId}
          instructor={false}
          readOnly={instructor}
        />
      ) : (
        <p className="iw-empty">연결된 학생이 없습니다.</p>
      )}
    </section>
  );
}

function AssignmentEditor({
  initial,
  enrollments,
  targets,
  defaultSession,
  onCancel,
  onSaved,
  registerLeaveGuard,
}: {
  initial?: Assignment | undefined;
  enrollments: Enrollment[];
  targets: AssignmentTarget[];
  defaultSession: number;
  onCancel: () => void;
  onSaved: () => void;
  registerLeaveGuard?: (guard: (() => Promise<boolean>) | null) => void;
}) {
  const dirty = useRef(false);
  const busyRef = useRef(false);
  useEditorExitGuard(
    () =>
      !busyRef.current &&
      (!dirty.current || window.confirm("저장하지 않은 과제 설정을 버리고 나갈까요?")),
  );
  useEffect(() => {
    const guard = async () =>
      !busyRef.current &&
      (!dirty.current ||
        window.confirm("아직 저장하지 않은 과제 설정이 있습니다. 변경 내용을 버리고 이동할까요?"));
    registerLeaveGuard?.(guard);
    return () => registerLeaveGuard?.(null);
  }, [registerLeaveGuard]);
  useBlocker({
    shouldBlockFn: () =>
      busyRef.current ||
      (dirty.current && !window.confirm("저장하지 않은 과제 설정을 버리고 이동할까요?")),
    enableBeforeUnload: () => dirty.current || busyRef.current,
  });

  const sessions = usePublishedSessions();
  const [title, setTitle] = useState(initial?.title ?? ""),
    [description, setDescription] = useState(initial?.description ?? ""),
    [requirements, setRequirements] = useState(initial?.requirements ?? ""),
    [session, setSession] = useState(initial?.session_number ?? defaultSession),
    [opens, setOpens] = useState(toSeoulInput(initial?.opens_at)),
    [due, setDue] = useState(toSeoulInput(initial?.due_at)),
    [status, setStatus] = useState<AssignmentInput["status"]>(initial?.status ?? "draft"),
    [allow, setAllow] = useState(initial?.allow_resubmit ?? true),
    [selected, setSelected] = useState(
      initial
        ? targets.filter((t) => t.assignment_id === initial.id).map((t) => t.user_id)
        : enrollments.filter((e) => e.status === "active").map((e) => e.user_id),
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    busyRef.current = true;
    setError("");
    try {
      if (status === "published" && !selected.length)
        throw new Error("공개할 과제의 제출 대상을 선택해 주세요.");
      const opening = fromSeoulInput(opens),
        deadline = fromSeoulInput(due);
      if (opening && deadline && opening >= deadline)
        throw new Error("마감은 제출 시작보다 나중으로 설정해 주세요.");
      await saveAssignment(
        {
          ...(initial ? { id: initial.id } : {}),
          session_number: session,
          title: title.trim(),
          description: description.trim(),
          requirements: requirements.trim(),
          opens_at: opening,
          due_at: deadline,
          status,
          allow_resubmit: allow,
          target_user_ids: selected,
        },
        initial?.version ?? 0,
      );
      dirty.current = false;
      onSaved();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }
  return (
    <form
      onSubmit={(event) => void save(event)}
      onChange={() => {
        dirty.current = true;
      }}
      className="mb-6 border-2 border-neutral-900 p-4 sm:p-5"
    >
      <h2 className="iw-section-title">{initial ? "과제 수정" : "새 과제"}</h2>
      {error && (
        <p role="alert" className="iw-error">
          {error}
        </p>
      )}
      <div className="iw-grid">
        <div className="grid gap-3 sm:grid-cols-[minmax(150px,.6fr)_minmax(0,1.4fr)]">
          <label className="iw-label">
            회차
            <select
              className="iw-input"
              value={session}
              disabled={busy || Boolean(initial)}
              onChange={(e) => setSession(Number(e.target.value))}
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.number}>
                  {s.number}회차 · {s.date}
                </option>
              ))}
            </select>
          </label>
          <label className="iw-label">
            과제명
            <input
              className="iw-input"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy}
            />
          </label>
        </div>
        <label className="iw-label">
          학습 목표와 과제 설명
          <textarea
            className="iw-input"
            rows={3}
            maxLength={10000}
            value={description}
            disabled={busy}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="iw-label">
          제출할 산출물·평가 기준
          <textarea
            className="iw-input"
            rows={3}
            maxLength={8000}
            value={requirements}
            disabled={busy}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="예: 핵심 화면 3장, 프로토타입 링크, 설계 의도 / 정보 구조·시각적 위계·사용성"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="iw-label">
            제출 시작 · 한국 시간
            <input
              className="iw-input"
              type="datetime-local"
              value={opens}
              disabled={busy}
              onChange={(e) => setOpens(e.target.value)}
            />
            <small>비워두면 공개 즉시 제출할 수 있습니다.</small>
          </label>
          <label className="iw-label">
            마감 · 한국 시간
            <input
              className="iw-input"
              type="datetime-local"
              value={due}
              disabled={busy}
              onChange={(e) => setDue(e.target.value)}
            />
            <small>비워두면 지각·미제출을 계산하지 않습니다.</small>
          </label>
        </div>
        <fieldset className="iw-fieldset mb-0">
          <legend>제출 대상 · {selected.length}명</legend>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={busy}
              className="text-xs underline"
              onClick={() =>
                setSelected(
                  enrollments
                    .filter((e) => e.status === "active" || selected.includes(e.user_id))
                    .map((e) => e.user_id),
                )
              }
            >
              수강 중인 학생 전체 선택
            </button>
            <button
              type="button"
              disabled={busy}
              className="text-xs underline"
              onClick={() => setSelected([])}
            >
              선택 해제
            </button>
          </div>
          <div className="iw-check-grid">
            {enrollments
              .filter((e) => e.status === "active" || selected.includes(e.user_id))
              .map((e) => (
                <label key={e.user_id}>
                  <input
                    type="checkbox"
                    checked={selected.includes(e.user_id)}
                    disabled={busy}
                    onChange={(event) =>
                      setSelected(
                        event.target.checked
                          ? [...selected, e.user_id]
                          : selected.filter((id) => id !== e.user_id),
                      )
                    }
                  />
                  {e.name}
                  {e.status !== "active" ? " (수강 종료)" : ""}
                </label>
              ))}
          </div>
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="iw-label">
            공개 상태
            <select
              className="iw-input"
              value={status}
              disabled={busy}
              onChange={(e) => setStatus(e.target.value as AssignmentInput["status"])}
            >
              <option value="draft">작성 중 · 학생에게 숨김</option>
              <option value="published">공개 · 대상 학생에게 표시</option>
              {initial && <option value="archived">보관 · 새 제출 중지</option>}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allow}
              disabled={busy}
              onChange={(e) => setAllow(e.target.checked)}
            />
            수정본 재제출 허용
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="iw-button"
            type="button"
            disabled={busy}
            onClick={() => {
              if (!dirty.current || window.confirm("저장하지 않은 과제 설정을 버릴까요?"))
                onCancel();
            }}
          >
            취소
          </button>
          <button className="iw-button iw-primary" disabled={busy || !title.trim()}>
            {busy ? "저장 중…" : "과제 저장"}
          </button>
        </div>
      </div>
    </form>
  );
}

function TargetEditor({
  target,
  name,
  onSaved,
}: {
  target: AssignmentTarget;
  name: string;
  onSaved: () => void;
}) {
  const [due, setDue] = useState(toSeoulInput(target.due_at)),
    [exempt, setExempt] = useState(target.exempt),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function save() {
    setBusy(true);
    setError("");
    try {
      await saveAssignmentTarget(target.assignment_id, target.user_id, {
        exempt,
        due_at: fromSeoulInput(due),
      });
      onSaved();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <tr>
      <td>{name}</td>
      <td>
        <input
          aria-label={`${name} 개별 마감`}
          className="iw-input"
          type="datetime-local"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          disabled={busy}
        />
        <small className="iw-muted">비워두면 공통 마감 적용</small>
      </td>
      <td>
        <input
          aria-label={`${name} 제출 면제`}
          type="checkbox"
          checked={exempt}
          onChange={(e) => setExempt(e.target.checked)}
          disabled={busy}
        />
      </td>
      <td>
        <button className="iw-button" onClick={() => void save()} disabled={busy}>
          {busy ? "저장 중" : "저장"}
        </button>
        {error && (
          <p role="alert" className="iw-error">
            {error}
          </p>
        )}
      </td>
    </tr>
  );
}
