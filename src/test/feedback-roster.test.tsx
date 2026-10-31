import type { ComponentType } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route } from "@/routes/_app/feedback";

const state = vi.hoisted(() => ({
  auth: { status: "instructor", user: { id: "instructor-id" } },
  enrollments: [] as {
    user_id: string;
    student_id: string;
    name: string;
    status: string;
    joined_at: string;
    updated_at: string;
  }[],
  legacy: [] as { id: string; user_id: string; name: string }[],
  queriedUsers: [] as string[],
}));
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useBlocker: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ useAuth: () => state.auth }));
vi.mock("@/hooks/use-feedback-week", () => ({
  useFeedbackWeek: () => ({ week: 2, setWeek: vi.fn(), currentWeek: 2 }),
}));
vi.mock("@/lib/published-content", () => ({
  usePublishedSessions: () => [
    { id: "S01", number: 1, date: "2026-10-25" },
    { id: "S02", number: 2, date: "2026-11-01" },
  ],
}));
vi.mock("@/lib/instructor-api", () => ({
  listEnrollments: async () => state.enrollments,
  listAssignments: async () => [],
  listAssignmentTargets: async () => [],
  listSubmissions: async () => [],
  listSubmissionAssets: async () => [],
  listSubmissionDrafts: async () => [],
  listReviewDrafts: async () => [],
  listReviewPublications: async () => [],
  listFeedbackReads: async () => [],
  saveAssignment: vi.fn(),
  saveAssignmentTarget: vi.fn(),
  saveReviewDraft: vi.fn(),
  publishReview: vi.fn(),
  saveSubmissionDraft: vi.fn(),
  submitAssignment: vi.fn(),
  markFeedbackRead: vi.fn(),
}));
vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    from: (table: string) => {
      if (table !== "kmove_feedback_students") throw new Error(`Unexpected table ${table}`);
      let user = "";
      const query = {
        select: () => query,
        eq: (key: string, value: string) => {
          expect(key).toBe("user_id");
          user = value;
          state.queriedUsers.push(value);
          return query;
        },
        maybeSingle: async () => ({
          data: state.legacy.find((row) => row.user_id === user) ?? null,
          error: null,
        }),
      };
      return query;
    },
  }),
}));
vi.mock("@/components/FeedbackWorkspace", () => ({
  FeedbackWorkspace: ({
    studentId,
    studentName,
    readOnly,
  }: {
    studentId: string;
    studentName: string;
    readOnly?: boolean;
  }) => (
    <div
      data-testid="feedback-workspace"
      data-student-id={studentId}
      data-readonly={String(Boolean(readOnly))}
    >
      {studentName}의 기존 피드백 자료
    </div>
  ),
}));
vi.mock("@/components/StudentDriveFolders", () => ({
  StudentDriveFolders: () => <div>내 개인 폴더</div>,
}));

const FeedbackPage = Route.options.component as ComponentType;
const cohort = [
  "강민주",
  "강유민",
  "김다혜",
  "김선미",
  "김재은",
  "김화민",
  "류영진",
  "오한별",
  "이익제",
  "이주희",
  "이지원",
  "임시윤",
  "정여진",
  "최지인",
  "최형주",
];
beforeEach(() => {
  state.auth = { status: "instructor", user: { id: "instructor-id" } };
  state.enrollments = cohort.map((name) => ({
    user_id: `user-${name}`,
    student_id: `feedback-${name}`,
    name,
    status: "active",
    joined_at: "2026-10-31",
    updated_at: "2026-10-31",
  }));
  state.legacy = ["홍길동", "홍길순"].map((name) => ({
    id: `feedback-${name}`,
    name,
    user_id: `user-${name}`,
  }));
  state.queriedUsers = [];
  window.history.replaceState({}, "", "/feedback");
});
afterEach(cleanup);
function openStudentLegacy() {
  const details = screen.getByText("기존에 등록한 자료와 피드백").closest("details")!;
  details.open = true;
  fireEvent(details, new Event("toggle"));
}

describe("Feedback course roster", () => {
  it("uses active enrollments rather than legacy account rows for the instructor roster", async () => {
    render(<FeedbackPage />);
    await screen.findByText("수강 중 15명");
    fireEvent.click(screen.getByRole("tab", { name: "기존 등록 자료" }));
    const picker = await screen.findByRole("combobox", { name: "학생" });
    const options = within(picker).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(cohort);
    expect(within(picker).queryByRole("option", { name: "홍길동" })).not.toBeInTheDocument();
    expect(state.legacy).toHaveLength(2);
    expect(screen.getByTestId("feedback-workspace")).toHaveAttribute("data-readonly", "true");
  });
  it("switches the legacy viewer to the chosen course student without account mapping controls", async () => {
    render(<FeedbackPage />);
    await screen.findByText("수강 중 15명");
    fireEvent.click(screen.getByRole("tab", { name: "기존 등록 자료" }));
    fireEvent.change(await screen.findByRole("combobox", { name: "학생" }), {
      target: { value: "user-김재은" },
    });
    expect(screen.getByTestId("feedback-workspace")).toHaveAttribute(
      "data-student-id",
      "feedback-김재은",
    );
    expect(screen.queryByRole("combobox", { name: "수강생 계정 연결" })).not.toBeInTheDocument();
  });
  it("accepts additional enrolled students without a hardcoded fifteen-person filter", async () => {
    state.enrollments.push({
      user_id: "added-user",
      student_id: "added-student",
      name: "추가학생",
      status: "active",
      joined_at: "2026-11-01",
      updated_at: "2026-11-01",
    });
    render(<FeedbackPage />);
    await screen.findByText("수강 중 16명");
    fireEvent.click(screen.getByRole("tab", { name: "기존 등록 자료" }));
    expect(
      within(await screen.findByRole("combobox", { name: "학생" })).getAllByRole("option"),
    ).toHaveLength(16);
  });
  it.each(["홍길동", "홍길순"])(
    "preserves %s's own legacy feedback without enrolling them in course statistics",
    async (name) => {
      state.auth = { status: "student", user: { id: `user-${name}` } };
      state.enrollments = [];
      render(<FeedbackPage />);
      await screen.findByText("현재 과정에 연결된 수강 정보가 없습니다. 강사에게 문의해 주세요.");
      openStudentLegacy();
      expect(await screen.findByTestId("feedback-workspace")).toHaveAttribute(
        "data-student-id",
        `feedback-${name}`,
      );
      expect(state.queriedUsers).toEqual([`user-${name}`]);
      expect(screen.queryByRole("combobox", { name: "학생" })).not.toBeInTheDocument();
    },
  );
  it("does not substitute a peer when no own enrollment or legacy mapping exists", async () => {
    state.auth = { status: "student", user: { id: "unmapped-user" } };
    state.enrollments = [];
    render(<FeedbackPage />);
    await screen.findByText("현재 과정에 연결된 수강 정보가 없습니다. 강사에게 문의해 주세요.");
    openStudentLegacy();
    await waitFor(() => expect(state.queriedUsers).toEqual(["unmapped-user"]));
    expect(screen.queryByTestId("feedback-workspace")).not.toBeInTheDocument();
    expect(screen.getByText("연결된 학생이 없습니다.")).toBeVisible();
  });
});
