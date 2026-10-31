import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PublishedContentProvider, usePublishedContent } from "@/lib/published-content";
import { StudentSubmissions } from "@/components/instructor/StudentSubmissions";
import { ReviewWorkspace } from "@/components/instructor/ReviewWorkspace";
import { GLOSSARY } from "@/data/glossary";
import { requestEditorExit } from "@/lib/editor-exit-guard";
import type {
  Assignment,
  AssignmentTarget,
  ContentPublication,
  Enrollment,
  ReviewFields,
  ReviewPublication,
  Submission,
} from "@/lib/instructor-api";

const state = vi.hoisted(() => ({
  auth: { status: "student", user: { id: "student-a" } },
  listContentPublications: vi.fn(),
  saveSubmissionDraft: vi.fn(),
  submitAssignment: vi.fn(),
  listSubmissionDrafts: vi.fn(),
  markFeedbackRead: vi.fn(),
  saveReviewDraft: vi.fn(),
  publishReview: vi.fn(),
  loadWorkspaceAssets: vi.fn(),
  useBlocker: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ useAuth: () => state.auth }));
vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return { ...actual, useBlocker: state.useBlocker };
});
vi.mock("@/lib/instructor-api", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/instructor-api")>("@/lib/instructor-api");
  return {
    ...actual,
    listContentPublications: state.listContentPublications,
    saveSubmissionDraft: state.saveSubmissionDraft,
    submitAssignment: state.submitAssignment,
    listSubmissionDrafts: state.listSubmissionDrafts,
    markFeedbackRead: state.markFeedbackRead,
    saveReviewDraft: state.saveReviewDraft,
    publishReview: state.publishReview,
  };
});
vi.mock("@/components/instructor/workspace-utils", async () => {
  const actual = await vi.importActual<typeof import("@/components/instructor/workspace-utils")>(
    "@/components/instructor/workspace-utils",
  );
  return { ...actual, loadWorkspaceAssets: state.loadWorkspaceAssets };
});
vi.mock("@/components/FeedbackWorkspace", () => ({
  FeedbackWorkspace: () => <p>자료 업로드 영역</p>,
}));
vi.mock("@/components/instructor/AssetViewer", () => ({
  AssetViewer: ({ asset }: { asset: { title: string } }) => (
    <p aria-label="자료 미리보기">{asset.title}</p>
  ),
}));

const timestamp = "2026-11-01T01:00:00Z";
const assignment: Assignment = {
  id: "assignment-a",
  session_number: 2,
  title: "정보 구조 설계",
  description: "작업 설명",
  requirements: "파일 또는 링크",
  opens_at: null,
  due_at: null,
  status: "published",
  allow_resubmit: true,
  version: 1,
  created_at: timestamp,
  updated_at: timestamp,
};
const student: Enrollment = {
  user_id: "student-a",
  student_id: "feedback-a",
  name: "강민주",
  status: "active",
  joined_at: timestamp,
  updated_at: timestamp,
};
const target: AssignmentTarget = {
  assignment_id: assignment.id,
  user_id: student.user_id,
  exempt: false,
  due_at: null,
  created_at: timestamp,
};
const submission: Submission = {
  id: "submission-a",
  assignment_id: assignment.id,
  user_id: student.user_id,
  student_id: student.student_id,
  version: 1,
  note: "확인받고 싶은 점",
  submitted_at: timestamp,
  late: false,
};
const asset = {
  id: "image-a",
  kind: "image" as const,
  title: "작업 이미지",
  object_path: "private/image-a.png",
  url: null,
  created_at: timestamp,
};
const emptyFields: ReviewFields = {
  strengths: "",
  improvements: "",
  next_steps: "",
  decision: "accepted",
  pins: [],
  asset_comments: {},
  private_note: "",
};
function publication(overrides: Partial<ContentPublication> = {}): ContentPublication {
  return {
    id: "content-a",
    kind: "glossary",
    content_key: "cms-term",
    document: { english: "CMS published term", korean: "공개 용어", description: "공개 정의" },
    hidden: false,
    version: 1,
    published_at: "2020-01-01T00:00:00Z",
    created_at: timestamp,
    created_by: "teacher",
    cancelled_at: null,
    ...overrides,
  };
}
function Probe() {
  const { glossary } = usePublishedContent();
  return (
    <div data-testid="published-probe">
      <span>{glossary.find((term) => term.id === "cms-term")?.english ?? "no-custom-term"}</span>
      <span>
        {glossary.some((term) => term.id === GLOSSARY[0]!.id)
          ? "baseline-visible"
          : "baseline-hidden"}
      </span>
    </div>
  );
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.resetAllMocks();
  state.auth = { status: "student", user: { id: "student-a" } };
  state.listContentPublications.mockResolvedValue([]);
  state.loadWorkspaceAssets.mockResolvedValue([asset]);
  state.saveSubmissionDraft.mockImplementation(async (id, fields, version) => ({
    assignment_id: id,
    user_id: student.user_id,
    ...fields,
    version: version + 1,
    updated_at: timestamp,
  }));
  state.submitAssignment.mockResolvedValue(submission);
  state.listSubmissionDrafts.mockResolvedValue([
    {
      assignment_id: assignment.id,
      user_id: student.user_id,
      note: "",
      image_ids: [asset.id],
      attachment_ids: [],
      version: 3,
      updated_at: timestamp,
    },
  ]);
  state.saveReviewDraft.mockImplementation(async (id, fields, version) => ({
    submission_id: id,
    ...fields,
    version: version + 1,
    published_version: 0,
    updated_at: timestamp,
    updated_by: "teacher",
  }));
  state.publishReview.mockImplementation(async (id, version) => ({
    id: "review-publication",
    submission_id: id,
    ...emptyFields,
    strengths: "계층이 명확합니다.",
    version,
    published_at: timestamp,
    published_by: "teacher",
  }));
  vi.spyOn(window, "confirm").mockReturnValue(false);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("published content delivery", () => {
  it("does not flash baseline content before a hidden publication is loaded", async () => {
    const request = deferred<ContentPublication[]>();
    state.listContentPublications.mockReturnValue(request.promise);
    render(
      <PublishedContentProvider>
        <Probe />
      </PublishedContentProvider>,
    );
    expect(screen.queryByTestId("published-probe")).not.toBeInTheDocument();
    await act(async () =>
      request.resolve([publication({ content_key: GLOSSARY[0]!.id, hidden: true })]),
    );
    expect(screen.getByText("baseline-hidden")).toBeVisible();
    expect(screen.queryByText("baseline-visible")).not.toBeInTheDocument();
  });

  it("fails closed on initial publication lookup failure, with a working retry", async () => {
    state.listContentPublications
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce([publication()]);
    render(
      <PublishedContentProvider>
        <Probe />
      </PublishedContentProvider>,
    );
    await screen.findByRole("alert");
    expect(screen.queryByTestId("published-probe")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(await screen.findByText("CMS published term")).toBeVisible();
  });

  it("ignores a previous account's late response after the authenticated layout key changes", async () => {
    const first = deferred<ContentPublication[]>(),
      second = deferred<ContentPublication[]>();
    state.listContentPublications
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const view = render(
      <PublishedContentProvider key="student-a:student">
        <Probe />
      </PublishedContentProvider>,
    );
    state.auth = { status: "student", user: { id: "student-b" } };
    view.rerender(
      <PublishedContentProvider key="student-b:student">
        <Probe />
      </PublishedContentProvider>,
    );
    await act(async () =>
      second.resolve([publication({ document: { english: "현재 계정 공개 용어" } })]),
    );
    await act(async () =>
      first.resolve([publication({ document: { english: "이전 계정 늦은 응답" } })]),
    );
    expect(screen.getByText("현재 계정 공개 용어")).toBeVisible();
    expect(screen.queryByText("이전 계정 늦은 응답")).not.toBeInTheDocument();
  });
});

describe("explicit student submission", () => {
  it("saves selected uploads as a draft and submits only after the submit button", async () => {
    const changed = vi.fn();
    render(
      <StudentSubmissions
        assignment={assignment}
        student={student}
        target={target}
        submissions={[]}
        allSubmissions={[]}
        assetRefs={[]}
        publications={[]}
        onChanged={changed}
      />,
    );
    fireEvent.click(await screen.findByRole("checkbox", { name: /작업 이미지/ }));
    fireEvent.change(screen.getByRole("textbox", { name: /제출 설명/ }), {
      target: { value: "정보 구조를 확인해 주세요." },
    });
    fireEvent.click(screen.getByRole("button", { name: "초안 저장" }));
    await waitFor(() => expect(state.saveSubmissionDraft).toHaveBeenCalledTimes(1));
    expect(state.saveSubmissionDraft).toHaveBeenLastCalledWith(
      assignment.id,
      { note: "정보 구조를 확인해 주세요.", image_ids: [asset.id], attachment_ids: [] },
      0,
    );
    expect(state.submitAssignment).not.toHaveBeenCalled();
    expect(screen.getByText("아직 최종 제출한 기록이 없습니다.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "제출하기" }));
    await waitFor(() => expect(state.submitAssignment).toHaveBeenCalledWith(assignment.id, 2));
    await waitFor(() => expect(changed).toHaveBeenCalledOnce());
  });

  it("keeps failed draft text intact and does not call final submission", async () => {
    state.saveSubmissionDraft.mockRejectedValue(new Error("저장 충돌"));
    render(
      <StudentSubmissions
        assignment={assignment}
        student={student}
        target={target}
        submissions={[]}
        allSubmissions={[]}
        assetRefs={[]}
        publications={[]}
        onChanged={vi.fn()}
      />,
    );
    fireEvent.click(await screen.findByRole("checkbox", { name: /작업 이미지/ }));
    const text = screen.getByRole("textbox", { name: /제출 설명/ });
    fireEvent.change(text, { target: { value: "저장 실패해도 남아야 할 설명" } });
    fireEvent.click(screen.getByRole("button", { name: "제출하기" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("저장 충돌");
    expect(text).toHaveValue("저장 실패해도 남아야 할 설명");
    expect(state.submitAssignment).not.toHaveBeenCalled();
  });

  it("blocks logout while a student draft cannot be saved, then permits route navigation after recovery", async () => {
    state.saveSubmissionDraft.mockRejectedValueOnce(new Error("일시적인 저장 오류"));
    render(
      <StudentSubmissions
        assignment={assignment}
        student={student}
        target={target}
        submissions={[]}
        allSubmissions={[]}
        assetRefs={[]}
        publications={[]}
        onChanged={vi.fn()}
      />,
    );
    await screen.findByRole("checkbox", { name: /작업 이미지/ });
    fireEvent.change(screen.getByRole("textbox", { name: /제출 설명/ }), {
      target: { value: "이동 전에 저장할 내용" },
    });
    const blocker = state.useBlocker.mock.lastCall?.[0];
    expect(blocker.enableBeforeUnload()).toBe(true);
    await act(async () => expect(await requestEditorExit()).toBe(false));
    expect(screen.getByRole("textbox", { name: /제출 설명/ })).toHaveValue("이동 전에 저장할 내용");
    await act(async () =>
      expect(await state.useBlocker.mock.lastCall?.[0].shouldBlockFn()).toBe(false),
    );
    expect(state.useBlocker.mock.lastCall?.[0].enableBeforeUnload()).toBe(false);
    expect(state.submitAssignment).not.toHaveBeenCalled();
  });

  it("saves a dirty submission before logout without prompting or submitting it", async () => {
    render(
      <StudentSubmissions
        assignment={assignment}
        student={student}
        target={target}
        submissions={[]}
        allSubmissions={[]}
        assetRefs={[]}
        publications={[]}
        onChanged={vi.fn()}
      />,
    );
    await screen.findByRole("checkbox", { name: /작업 이미지/ });
    fireEvent.change(screen.getByRole("textbox", { name: /제출 설명/ }), {
      target: { value: "로그아웃 전에 보존할 초안" },
    });
    await act(async () => expect(await requestEditorExit()).toBe(true));
    expect(state.saveSubmissionDraft).toHaveBeenCalledWith(
      assignment.id,
      { note: "로그아웃 전에 보존할 초안", image_ids: [], attachment_ids: [] },
      0,
    );
    expect(state.submitAssignment).not.toHaveBeenCalled();
    expect(window.confirm).not.toHaveBeenCalled();
  });
});

describe("private review and explicit publication", () => {
  it("autosaves private draft without publishing, then publishes the exact saved revision", async () => {
    vi.useFakeTimers();
    const changed = vi.fn();
    render(
      <ReviewWorkspace
        assignment={assignment}
        student={student}
        submission={submission}
        assets={[asset]}
        publications={[]}
        onChanged={changed}
      />,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "좋았던 점" }), {
      target: { value: "계층이 명확합니다." },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100);
    });
    expect(state.saveReviewDraft).toHaveBeenCalledOnce();
    expect(state.publishReview).not.toHaveBeenCalled();
    expect(screen.queryByText("공개 피드백")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "피드백 공개" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(state.publishReview).toHaveBeenCalledWith(submission.id, 1);
    expect(changed).toHaveBeenCalledOnce();
  });

  it("does not publish private-note-only drafts or mutate previous public feedback", async () => {
    const prior: ReviewPublication = {
      id: "public-1",
      submission_id: submission.id,
      strengths: "학생이 볼 수 있는 기존 피드백",
      improvements: "",
      next_steps: "",
      decision: "accepted",
      pins: [],
      asset_comments: {},
      version: 1,
      published_at: timestamp,
      published_by: "teacher",
    };
    render(
      <ReviewWorkspace
        assignment={assignment}
        student={student}
        submission={submission}
        assets={[asset]}
        publications={[prior]}
        initialDraft={{
          submission_id: submission.id,
          ...emptyFields,
          private_note: "강사만 보는 상담 내용",
          version: 2,
          published_version: 1,
          updated_at: timestamp,
          updated_by: "teacher",
        }}
        onChanged={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "피드백 공개" })).toBeDisabled();
    expect(state.publishReview).not.toHaveBeenCalled();
    expect(screen.getByText("학생이 볼 수 있는 기존 피드백")).toBeInTheDocument();
    expect(screen.getByDisplayValue("강사만 보는 상담 내용")).toBeInTheDocument();
  });

  it("waits for newer edits made during an in-flight save before publishing", async () => {
    vi.useFakeTimers();
    const firstSave = deferred<unknown>();
    state.saveReviewDraft.mockReturnValueOnce(firstSave.promise);
    render(
      <ReviewWorkspace
        assignment={assignment}
        student={student}
        submission={submission}
        assets={[asset]}
        publications={[]}
        onChanged={vi.fn()}
      />,
    );
    const text = screen.getByRole("textbox", { name: "좋았던 점" });
    fireEvent.change(text, { target: { value: "첫 번째 내용" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100);
    });
    fireEvent.change(text, { target: { value: "저장 중 추가한 최종 내용" } });
    fireEvent.click(screen.getByRole("button", { name: "피드백 공개" }));
    expect(state.publishReview).not.toHaveBeenCalled();
    await act(async () =>
      firstSave.resolve({
        submission_id: submission.id,
        ...emptyFields,
        strengths: "첫 번째 내용",
        version: 1,
        published_version: 0,
        updated_at: timestamp,
        updated_by: "teacher",
      }),
    );
    expect(state.saveReviewDraft).toHaveBeenCalledTimes(2);
    expect(state.saveReviewDraft).toHaveBeenLastCalledWith(
      submission.id,
      expect.objectContaining({ strengths: "저장 중 추가한 최종 내용" }),
      1,
    );
    expect(state.publishReview).toHaveBeenCalledWith(submission.id, 2);
  });

  it("keeps a failed private review editable and blocks publication and next-item navigation", async () => {
    state.saveReviewDraft.mockRejectedValue(new Error("저장 충돌"));
    const next = vi.fn();
    render(
      <ReviewWorkspace
        assignment={assignment}
        student={student}
        submission={submission}
        assets={[asset]}
        publications={[]}
        onChanged={vi.fn()}
        onNext={next}
      />,
    );
    const text = screen.getByRole("textbox", { name: "개선할 점" });
    fireEvent.change(text, { target: { value: "사라지면 안 되는 피드백" } });
    fireEvent.click(screen.getByRole("button", { name: "피드백 공개" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("저장 충돌");
    expect(state.publishReview).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /다음 검토 대상/ }));
    await waitFor(() => expect(state.saveReviewDraft).toHaveBeenCalledTimes(2));
    expect(next).not.toHaveBeenCalled();
    expect(text).toHaveValue("사라지면 안 되는 피드백");
    expect(text).not.toBeDisabled();
  });
});
