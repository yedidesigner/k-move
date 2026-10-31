import type { ComponentType } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route } from "@/routes/_app/feedback";

type Student = { id: string; name: string; major: string; user_id: string | null };
type Profile = { id: string; username: string; role: string };
const state = vi.hoisted(() => ({
  auth: { status: "instructor", user: { id: "instructor-id" } },
  students: [] as Student[],
  profiles: [] as Profile[],
}));

vi.mock("@/lib/auth", () => ({ useAuth: () => state.auth }));
vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    from: (table: string) => {
      const query = {
        select: () => query,
        eq: () => query,
        order: async () => ({
          data: table === "kmove_feedback_students" ? state.students : state.profiles,
          error: null,
        }),
      };
      return query;
    },
  }),
}));
vi.mock("@/components/FeedbackWorkspace", () => ({
  FeedbackWorkspace: ({ studentId, studentName }: { studentId: string; studentName: string }) => (
    <div data-testid="feedback-workspace" data-student-id={studentId}>{studentName}의 피드백 자료</div>
  ),
}));

const FeedbackPage = Route.options.component as ComponentType;
const cohort = [
  "강민주", "강유민", "김다혜", "김선미", "김재은", "김화민", "류영진", "오한별",
  "이익제", "이주희", "이지원", "임시윤", "정여진", "최지인", "최형주",
];

beforeEach(() => {
  state.auth.status = "instructor";
  state.auth.user = { id: "instructor-id" };
  // Deliberately return legacy students first and the course in reverse order.
  // The interface must use the requested roster, not the database response order.
  state.students = ["홍길동", "홍길순", ...[...cohort].reverse()].map(name => ({
    id: `feedback-${name}`, name, major: "", user_id: `user-${name}`,
  }));
  state.profiles = ["tomset", "홍길동", "홍길순", ...cohort].map(username => ({
    id: `user-${username}`, username, role: "student",
  }));
});
afterEach(cleanup);

describe("Feedback course roster", () => {
  it("shows exactly the 15 requested students in order while retaining legacy rows", async () => {
    render(<FeedbackPage />);
    await screen.findByTestId("feedback-workspace");
    expect(screen.getByText("수강생 15명")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "수강생 변경" }));
    const picker = screen.getByRole("menu", { name: "학생 이름 목록" });
    const options = within(picker).getAllByRole("menuitemradio");
    expect(options).toHaveLength(15);
    expect(options.map(option => option.textContent)).toEqual(cohort);
    expect(within(picker).queryByText("홍길동")).not.toBeInTheDocument();
    expect(within(picker).queryByText("홍길순")).not.toBeInTheDocument();
    expect(state.students).toHaveLength(17);
  });

  it("switches to the selected student's workspace and restores focus to the picker", async () => {
    render(<FeedbackPage />);
    await screen.findByTestId("feedback-workspace");
    const trigger = screen.getByRole("button", { name: "수강생 변경" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("menuitemradio", { name: "김재은" }));
    expect(screen.getByTestId("feedback-workspace")).toHaveAttribute("data-student-id", "feedback-김재은");
    expect(screen.getByRole("heading", { name: "김재은" })).toBeVisible();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    fireEvent.click(trigger);
    expect(screen.getByRole("menuitemradio", { name: "김재은" })).toHaveAttribute("aria-checked", "true");
  });

  it("limits account mapping options to course profiles", async () => {
    render(<FeedbackPage />);
    const mapping = await screen.findByRole("combobox", { name: "수강생 계정 연결" });
    await waitFor(() => expect(within(mapping).getAllByRole("option")).toHaveLength(16));
    expect(within(mapping).getAllByRole("option").map(option => option.textContent)).toEqual(["미연결", ...cohort]);
    for (const name of ["tomset", "강예지", "홍길동", "홍길순"]) {
      expect(within(mapping).queryByRole("option", { name })).not.toBeInTheDocument();
    }
  });

  it.each(["홍길동", "홍길순"])("preserves %s's access to their own feedback", async name => {
    state.auth.status = "student";
    state.auth.user = { id: `user-${name}` };
    render(<FeedbackPage />);
    expect(await screen.findByTestId("feedback-workspace")).toHaveAttribute("data-student-id", `feedback-${name}`);
    expect(screen.queryByRole("button", { name: "수강생 변경" })).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "수강생 계정 연결" })).not.toBeInTheDocument();
    expect(screen.queryByText("수강생 15명")).not.toBeInTheDocument();
  });

  it("never substitutes another student's first record when the user's row is absent", async () => {
    state.auth.status = "student";
    state.auth.user = { id: "unmapped-user" };
    render(<FeedbackPage />);
    expect(await screen.findByText("담당 강사의 계정 연결 후 본인 피드백을 확인할 수 있습니다.")).toBeVisible();
    expect(screen.queryByTestId("feedback-workspace")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "피드백" })).toBeVisible();
  });
});
