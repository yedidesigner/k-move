import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AssignmentWorkspace } from "@/components/instructor/AssignmentWorkspace";
import type { Assignment, AssignmentTarget, Enrollment, Submission } from "@/lib/instructor-api";

const state = vi.hoisted(() => ({
  auth: { status: "instructor", user: { id: "teacher" } },
  assignments: [] as Assignment[],
  targets: [] as AssignmentTarget[],
  enrollments: [] as Enrollment[],
  submissions: [] as Submission[],
  leaveGuard: vi.fn<() => Promise<boolean>>(),
  sessions: [
    { id: "S01", number: 1, date: "2026-10-25" },
    { id: "S02", number: 2, date: "2026-11-01" },
    { id: "S03", number: 3, date: "2026-11-08" },
  ],
}));

vi.mock("@/lib/auth", () => ({ useAuth: () => state.auth }));
vi.mock("@tanstack/react-router", async (original) => ({
  ...(await original<typeof import("@tanstack/react-router")>()),
  useBlocker: vi.fn(),
}));
vi.mock("@/hooks/use-feedback-week", async () => {
  const { useCallback, useState } = await import("react");
  return {
    useFeedbackWeek: () => {
      const [week, setWeek] = useState(2);
      const goToCurrentWeek = useCallback(() => setWeek(2), []);
      return { week, setWeek, currentWeek: 2, goToCurrentWeek };
    },
  };
});
vi.mock("@/lib/published-content", () => ({
  usePublishedSessions: () => state.sessions,
}));
vi.mock("@/lib/instructor-api", () => ({
  listAssignments: async () => state.assignments,
  listAssignmentTargets: async () => state.targets,
  listEnrollments: async () => state.enrollments,
  listSubmissions: async () => state.submissions,
  listSubmissionAssets: async () => [],
  listSubmissionDrafts: async () => [],
  listReviewDrafts: async () => [],
  listReviewPublications: async () => [],
  listFeedbackReads: async () => [],
  saveAssignment: vi.fn(),
  saveAssignmentTarget: vi.fn(),
}));
vi.mock("@/components/FeedbackWorkspace", () => ({
  FeedbackWorkspace: ({
    week,
    onUploadBusyChange,
  }: {
    week: number;
    onUploadBusyChange?: (value: boolean) => void;
  }) => (
    <div data-testid="legacy-workspace" data-week={week}>
      기존 자료 보기
      <button onClick={() => onUploadBusyChange?.(true)}>자료 업로드</button>
      <button onClick={() => onUploadBusyChange?.(false)}>업로드 완료</button>
    </div>
  ),
}));
vi.mock("@/components/StudentDriveFolders", () => ({
  StudentDriveFolders: () => <div>본인 Drive 폴더</div>,
}));
vi.mock("@/components/instructor/workspace-utils", async (original) => ({
  ...(await original<typeof import("@/components/instructor/workspace-utils")>()),
  loadWorkspaceAssets: async () => [],
}));
vi.mock("@/components/instructor/StudentSubmissions", async () => {
  const { useEffect } = await import("react");
  return {
    StudentSubmissions: ({
      assignment,
      registerLeaveGuard,
    }: {
      assignment: Assignment;
      registerLeaveGuard: (guard: (() => Promise<boolean>) | null) => void;
    }) => {
      useEffect(() => {
        registerLeaveGuard(state.leaveGuard);
        return () => registerLeaveGuard(null);
      }, [registerLeaveGuard]);
      return (
        <div data-testid="student-editor" data-assignment={assignment.id}>
          {assignment.title}
        </div>
      );
    },
  };
});
vi.mock("@/components/instructor/ReviewWorkspace", async () => {
  const { useEffect } = await import("react");
  return {
    ReviewWorkspace: ({
      submission,
      registerLeaveGuard,
    }: {
      submission: Submission;
      registerLeaveGuard: (guard: (() => Promise<boolean>) | null) => void;
    }) => {
      useEffect(() => {
        registerLeaveGuard(state.leaveGuard);
        return () => registerLeaveGuard(null);
      }, [registerLeaveGuard]);
      return (
        <div data-testid="review-editor" data-submission={submission.id}>
          선택한 제출물
        </div>
      );
    },
  };
});

const timestamp = "2026-11-01T01:00:00Z";
function assignment(id: string, number: number): Assignment {
  return {
    id,
    session_number: number,
    title: `${number}회차 과제`,
    description: "",
    requirements: "",
    opens_at: null,
    due_at: null,
    status: "published",
    allow_resubmit: true,
    version: 1,
    created_at: timestamp,
    updated_at: timestamp,
  };
}
function submission(id: string, assignmentId: string): Submission {
  return {
    id,
    assignment_id: assignmentId,
    user_id: "student-a",
    student_id: "feedback-a",
    version: 1,
    note: "",
    submitted_at: timestamp,
    late: false,
  };
}
beforeEach(() => {
  vi.clearAllMocks();
  state.auth = { status: "instructor", user: { id: "teacher" } };
  state.assignments = [assignment("assignment-2", 2)];
  state.enrollments = [
    {
      user_id: "student-a",
      student_id: "feedback-a",
      name: "강민주",
      status: "active",
      joined_at: timestamp,
      updated_at: timestamp,
    },
  ];
  state.targets = [
    {
      assignment_id: "assignment-2",
      user_id: "student-a",
      exempt: false,
      due_at: null,
      created_at: timestamp,
    },
  ];
  state.submissions = [];
  state.leaveGuard.mockResolvedValue(true);
  window.history.replaceState({}, "", "/feedback");
});
afterEach(cleanup);

describe("feedback paper presentation", () => {
  it("keeps the ordinary assignment workspace presentation unchanged", async () => {
    render(<AssignmentWorkspace />);
    expect(await screen.findByRole("heading", { name: "과제·피드백" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "과제&피드백" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "2주차 피드백 보기" })).not.toBeInTheDocument();
  });

  it("shows the feedback identity and current week navigation without removing management controls", async () => {
    render(<AssignmentWorkspace presentation="feedback" />);
    expect(await screen.findByRole("heading", { name: "과제&피드백" })).toBeVisible();
    expect(screen.getByText("WEEK 02", { exact: true })).toBeVisible();
    expect(screen.getByRole("button", { name: "2주차 피드백 보기" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "3주차 피드백 보기" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("tab", { name: "과제 관리" })).toBeVisible();
    expect(screen.getByRole("button", { name: "과제 만들기" })).toBeVisible();
  });

  it("does not display another week's assignment when a student selects a week with no task", async () => {
    state.auth = { status: "student", user: { id: "student-a" } };
    render(<AssignmentWorkspace presentation="feedback" />);
    expect(await screen.findByTestId("student-editor")).toHaveAttribute(
      "data-assignment",
      "assignment-2",
    );
    fireEvent.click(screen.getByRole("button", { name: "1주차 피드백 보기" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "1주차 피드백 보기" })).toHaveAttribute(
        "aria-pressed",
        "true",
      ),
    );
    expect(screen.queryByTestId("student-editor")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("수강생 변경", { exact: true })).not.toBeInTheDocument();
  });

  it("opens a linked submission on its actual week instead of the current-date default", async () => {
    state.assignments.push(assignment("assignment-3", 3));
    state.submissions = [submission("submission-3", "assignment-3")];
    window.history.replaceState({}, "", "/feedback?submission=submission-3");
    render(<AssignmentWorkspace presentation="feedback" />);
    expect(await screen.findByTestId("review-editor")).toHaveAttribute(
      "data-submission",
      "submission-3",
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "3주차 피드백 보기" })).toHaveAttribute(
        "aria-pressed",
        "true",
      ),
    );
    expect(screen.getByText("WEEK 03", { exact: true })).toBeVisible();
  });

  it("shows a student's legacy materials on the same week as their linked assignment", async () => {
    state.auth = { status: "student", user: { id: "student-a" } };
    state.assignments.push(assignment("assignment-3", 3));
    state.targets.push({ ...state.targets[0]!, assignment_id: "assignment-3" });
    window.history.replaceState({}, "", "/feedback?assignment=assignment-3");
    render(<AssignmentWorkspace presentation="feedback" />);
    expect(await screen.findByTestId("student-editor")).toHaveAttribute(
      "data-assignment",
      "assignment-3",
    );
    expect(await screen.findByTestId("legacy-workspace")).toHaveAttribute("data-week", "3");
    expect(screen.queryByRole("combobox", { name: "회차" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3주차 피드백 보기" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("shows one permanent shared upload area with Drive and no assignment selector", async () => {
    state.auth = { status: "student", user: { id: "student-a" } };
    render(<AssignmentWorkspace presentation="feedback" />);
    await screen.findByTestId("student-editor");
    const region = screen.getByRole("region", { name: "과제와 피드백 자료 업로드" });
    expect(within(region).getByText("본인 Drive 폴더")).toBeVisible();
    expect(within(region).getByRole("button", { name: "자료 업로드" })).toBeVisible();
    expect(screen.getAllByTestId("legacy-workspace")).toHaveLength(1);
    expect(screen.queryByRole("combobox", { name: "과제 선택" })).not.toBeInTheDocument();
    expect(screen.queryByText("과제를 선택하세요")).not.toBeInTheDocument();
    expect(region.querySelector("details")).toBeNull();
  });

  it("keeps every assigned task in the selected week accessible and checks all drafts before switching", async () => {
    state.auth = { status: "student", user: { id: "student-a" } };
    state.assignments.push(assignment("assignment-2b", 2));
    state.assignments.push(assignment("assignment-3", 3));
    state.targets.push({ ...state.targets[0]!, assignment_id: "assignment-2b" });
    state.targets.push({ ...state.targets[0]!, assignment_id: "assignment-3" });
    render(<AssignmentWorkspace presentation="feedback" />);
    await waitFor(() => expect(screen.getAllByTestId("student-editor")).toHaveLength(2));
    expect(
      screen.getAllByTestId("student-editor").map((node) => node.getAttribute("data-assignment")),
    ).toEqual(["assignment-2", "assignment-2b"]);
    state.leaveGuard.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    fireEvent.click(screen.getByRole("button", { name: "3주차 피드백 보기" }));
    await waitFor(() => expect(state.leaveGuard).toHaveBeenCalledTimes(2));
    expect(screen.getByRole("button", { name: "2주차 피드백 보기" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getAllByTestId("student-editor")).toHaveLength(2);
    state.leaveGuard.mockResolvedValue(true);
    fireEvent.click(screen.getByRole("button", { name: "3주차 피드백 보기" }));
    await waitFor(() =>
      expect(screen.getByTestId("student-editor")).toHaveAttribute(
        "data-assignment",
        "assignment-3",
      ),
    );
    expect(screen.getByTestId("legacy-workspace")).toHaveAttribute("data-week", "3");
  });

  it("keeps the upload week fixed until a shared upload finishes", async () => {
    state.auth = { status: "student", user: { id: "student-a" } };
    render(<AssignmentWorkspace presentation="feedback" />);
    await screen.findByTestId("student-editor");
    fireEvent.click(screen.getByRole("button", { name: "자료 업로드" }));
    fireEvent.click(screen.getByRole("button", { name: "1주차 피드백 보기" }));
    expect(screen.getByRole("alert")).toHaveTextContent("자료 업로드가 완료된 뒤 이동해 주세요.");
    expect(screen.getByTestId("legacy-workspace")).toHaveAttribute("data-week", "2");
    fireEvent.click(screen.getByRole("button", { name: "업로드 완료" }));
    fireEvent.click(screen.getByRole("button", { name: "1주차 피드백 보기" }));
    await waitFor(() =>
      expect(screen.getByTestId("legacy-workspace")).toHaveAttribute("data-week", "1"),
    );
  });

  it("preserves the current student editor and week when its draft cannot be saved", async () => {
    state.auth = { status: "student", user: { id: "student-a" } };
    state.leaveGuard.mockResolvedValue(false);
    render(<AssignmentWorkspace presentation="feedback" />);
    await screen.findByTestId("student-editor");
    fireEvent.click(screen.getByRole("button", { name: "1주차 피드백 보기" }));
    await waitFor(() => expect(state.leaveGuard).toHaveBeenCalledOnce());
    expect(screen.getByRole("button", { name: "2주차 피드백 보기" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByTestId("student-editor")).toHaveAttribute("data-assignment", "assignment-2");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "작성 중인 내용을 저장하지 못해 화면 이동을 멈췄습니다",
    );
  });

  it("keeps an instructor's selected submission when changing students cannot save the review", async () => {
    state.enrollments.push({
      ...state.enrollments[0]!,
      user_id: "student-b",
      student_id: "feedback-b",
      name: "강유민",
    });
    state.submissions = [submission("submission-2", "assignment-2")];
    state.leaveGuard.mockResolvedValue(false);
    window.history.replaceState({}, "", "/feedback?submission=submission-2");
    render(<AssignmentWorkspace presentation="feedback" />);
    await screen.findByTestId("review-editor");
    fireEvent.change(screen.getByRole("combobox", { name: "수강생 변경" }), {
      target: { value: "student-b" },
    });
    await waitFor(() => expect(state.leaveGuard).toHaveBeenCalledOnce());
    expect(screen.getByTestId("review-editor")).toHaveAttribute("data-submission", "submission-2");
    expect(screen.getByRole("heading", { name: "강민주" })).toBeVisible();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "작성 중인 내용을 저장하지 못해 화면 이동을 멈췄습니다",
    );
  });

  it("stays on a linked submission's week when the next student has no submission for that week", async () => {
    state.enrollments.push({
      ...state.enrollments[0]!,
      user_id: "student-b",
      student_id: "feedback-b",
      name: "강유민",
    });
    state.assignments.push(assignment("assignment-3", 3));
    state.submissions = [submission("submission-3", "assignment-3")];
    window.history.replaceState({}, "", "/feedback?submission=submission-3");
    render(<AssignmentWorkspace presentation="feedback" />);
    await screen.findByTestId("review-editor");
    fireEvent.change(screen.getByRole("combobox", { name: "수강생 변경" }), {
      target: { value: "student-b" },
    });
    await waitFor(() => expect(screen.queryByTestId("review-editor")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "3주차 피드백 보기" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("heading", { name: "강유민" })).toBeVisible();
  });
});
