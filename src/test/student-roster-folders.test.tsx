import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudentDriveFolders } from "@/components/StudentDriveFolders";
import {
  STUDENT_NAMES,
  ASSIGNMENT_ROOT_FOLDER_URL,
  PORTFOLIO_ROOT_FOLDER_URL,
} from "@/data/student-roster";

type Row = {
  user_id: string;
  name: string;
  google_email: string;
  assignment_folder_url: string;
  portfolio_folder_url: string;
  sharing_ready: boolean;
  sort_order: number;
};
type Result = { data: Row[] | null; error: unknown };
const state = vi.hoisted(() => ({
  auth: {
    status: "student",
    user: { id: "student-a", user_metadata: { username: "강유민" } } as {
      id: string;
      user_metadata: { username: string };
    } | null,
  },
  from: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  select: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ useAuth: () => state.auth }));
vi.mock("@/lib/supabase", () => ({ getSupabase: () => ({ from: state.from }) }));
const rows: Row[] = ["강민주", "강유민"].map((name, i) => ({
  user_id: `student-${i === 0 ? "a" : "b"}`,
  name,
  google_email: `student${i}@example.com`,
  assignment_folder_url: `https://drive.google.com/drive/folders/assignment-${i}`,
  portfolio_folder_url: `https://drive.google.com/drive/folders/portfolio-${i}`,
  sharing_ready: true,
  sort_order: i,
}));

beforeEach(() => {
  vi.resetAllMocks();
  state.auth = {
    status: "student",
    user: { id: "student-a", user_metadata: { username: "강유민" } },
  };
  const query = { select: state.select, eq: state.eq, order: state.order };
  state.from.mockReturnValue(query);
  state.select.mockReturnValue(query);
  state.eq.mockReturnValue(query);
  // Return an unexpected peer row too to exercise the UI's defensive check.
  state.order.mockResolvedValue({ data: rows, error: null });
});
afterEach(cleanup);

function deferred() {
  let resolve!: (value: Result) => void;
  const promise = new Promise<Result>((finish) => {
    resolve = finish;
  });
  return { promise, resolve };
}

describe("private student folders", () => {
  it("embeds only the authenticated student's direct Drive link without a page header or folder grid", async () => {
    const { container } = render(<StudentDriveFolders kind="assignment" embedded />);
    const folder = await screen.findByRole("link", { name: /내 Google Drive 폴더/ });
    expect(folder).toHaveAttribute("href", rows[0]!.assignment_folder_url);
    expect(folder).toHaveAttribute("target", "_blank");
    expect(folder).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(container.querySelector('svg[viewBox="0 0 200 168"]')).not.toBeInTheDocument();
    expect(state.eq).toHaveBeenCalledWith("user_id", "student-a");
    expect(screen.getByText("student0@example.com")).toBeVisible();
    expect(screen.queryByText("student1@example.com")).not.toBeInTheDocument();
    expect(screen.getByText(/LMS 로그인과 Google 로그인은 별도로/)).toBeVisible();
    expect(screen.queryByRole("link", { name: /전체 폴더/ })).not.toBeInTheDocument();
  });

  it("clears an embedded folder link while the next authenticated account loads", async () => {
    const { rerender } = render(<StudentDriveFolders kind="assignment" embedded />);
    expect(await screen.findByRole("link", { name: /내 Google Drive 폴더/ })).toHaveAttribute(
      "href",
      rows[0]!.assignment_folder_url,
    );
    const pending = deferred();
    state.order.mockReturnValueOnce(pending.promise);
    state.auth.user = { id: "student-b", user_metadata: { username: "강유민" } };
    rerender(<StudentDriveFolders kind="assignment" embedded />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    await act(async () => pending.resolve({ data: rows, error: null }));
    expect(await screen.findByRole("link", { name: /내 Google Drive 폴더/ })).toHaveAttribute(
      "href",
      rows[1]!.assignment_folder_url,
    );
    expect(screen.queryByText("student0@example.com")).not.toBeInTheDocument();
  });

  it.each(["sharing", "error", "unmapped"])(
    "keeps embedded folder access closed for %s",
    async (mode) => {
      if (mode === "sharing")
        state.order.mockResolvedValue({
          data: [{ ...rows[0], sharing_ready: false }],
          error: null,
        });
      if (mode === "error")
        state.order.mockResolvedValue({ data: null, error: new Error("denied") });
      if (mode === "unmapped") state.auth.user!.id = "unmapped-student";
      render(<StudentDriveFolders kind="assignment" embedded />);
      await screen.findByText(
        mode === "sharing"
          ? "Google Drive 공유 권한 확인 중"
          : mode === "error"
            ? "폴더 정보를 불러오지 못했습니다."
            : "이 계정에 연결된 폴더가 없습니다. 강사에게 문의해 주세요.",
      );
      expect(screen.queryAllByRole("link")).toHaveLength(0);
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    },
  );

  it.each([
    { kind: "assignment" as const, label: "내 과제 폴더", url: rows[0]!.assignment_folder_url },
    { kind: "portfolio" as const, label: "내 포트폴리오 폴더", url: rows[0]!.portfolio_folder_url },
  ])(
    "uses authenticated identity for $kind and hides peers and the root",
    async ({ kind, label, url }) => {
      render(<StudentDriveFolders kind={kind} />);
      const list = await screen.findByRole("list", { name: label });
      const links = within(list).getAllByRole("link");
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute("href", url);
      expect(links[0]).toHaveTextContent("강민주");
      expect(state.eq).toHaveBeenCalledWith("user_id", "student-a");
      expect(state.from).toHaveBeenCalledWith("kmove_student_drive_folders");
      expect(screen.queryByText("강유민")).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /전체 폴더/ })).not.toBeInTheDocument();
      expect(screen.getByText("student0@example.com")).toBeVisible();
      expect(screen.queryByText("student1@example.com")).not.toBeInTheDocument();
      expect(screen.getByText(/LMS 로그인과 Google 로그인은 별도로/)).toBeVisible();
    },
  );

  it.each([
    { kind: "assignment" as const, root: ASSIGNMENT_ROOT_FOLDER_URL },
    { kind: "portfolio" as const, root: PORTFOLIO_ROOT_FOLDER_URL },
  ])("allows the instructor all 15 $kind folders and the root", async ({ kind, root }) => {
    state.auth.status = "instructor";
    const cohort = STUDENT_NAMES.map((name, i) => ({
      ...rows[0],
      user_id: `cohort-${i}`,
      name,
      assignment_folder_url: `https://drive.google.com/drive/folders/a-${i}`,
      portfolio_folder_url: `https://drive.google.com/drive/folders/p-${i}`,
      sort_order: i,
    }));
    state.order.mockResolvedValue({ data: cohort, error: null });
    render(<StudentDriveFolders kind={kind} />);
    const list = await screen.findByRole("list");
    expect(within(list).getAllByRole("link")).toHaveLength(15);
    expect(
      within(list)
        .getAllByRole("link")
        .map((link) => link.textContent?.replace("Google Drive 폴더 (새 탭에서 열기)", "")),
    ).toEqual(STUDENT_NAMES);
    expect(screen.getByRole("link", { name: /전체 폴더/ })).toHaveAttribute("href", root);
    expect(state.eq).not.toHaveBeenCalled();
  });

  it("fails closed on query errors and allows a retry", async () => {
    state.order.mockResolvedValueOnce({ data: null, error: new Error("denied") });
    render(<StudentDriveFolders kind="assignment" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("불러오지 못했습니다");
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    await screen.findByRole("list");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("does not fall back to the first student's folder for an unmapped legacy account", async () => {
    state.auth.user!.id = "legacy-user";
    render(<StudentDriveFolders kind="portfolio" />);
    await screen.findByText(/이 계정에 연결된 폴더가 없습니다/);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("keeps a folder with unconfirmed Google sharing disabled for students", async () => {
    state.order.mockResolvedValue({ data: [{ ...rows[0], sharing_ready: false }], error: null });
    render(<StudentDriveFolders kind="assignment" />);
    await screen.findByText("Google Drive 공유 권한 확인 중");
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("clears previous account links immediately on switching accounts", async () => {
    const { rerender } = render(<StudentDriveFolders kind="assignment" />);
    await screen.findByRole("link", { name: /강민주/ });
    const pending = deferred();
    state.order.mockReturnValueOnce(pending.promise);
    state.auth.user = { id: "student-b", user_metadata: { username: "강유민" } };
    rerender(<StudentDriveFolders kind="assignment" />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    await act(async () => pending.resolve({ data: rows, error: null }));
    await screen.findByRole("link", { name: /강유민/ });
    expect(screen.queryByRole("link", { name: /강민주/ })).not.toBeInTheDocument();
  });

  it("ignores late responses belonging to the previous account", async () => {
    const old = deferred();
    state.order.mockReturnValueOnce(old.promise);
    const { rerender } = render(<StudentDriveFolders kind="portfolio" />);
    state.auth.user = { id: "student-b", user_metadata: { username: "강유민" } };
    rerender(<StudentDriveFolders kind="portfolio" />);
    await screen.findByRole("link", { name: /강유민/ });
    await act(async () => old.resolve({ data: [rows[0]!], error: null }));
    expect(screen.queryByRole("link", { name: /강민주/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /강유민/ })).toBeVisible();
  });

  it("removes all links on logout and makes no request while signed out", async () => {
    const { rerender } = render(<StudentDriveFolders kind="assignment" />);
    await screen.findByRole("list");
    state.auth.user = null;
    state.auth.status = "signedOut";
    state.from.mockClear();
    rerender(<StudentDriveFolders kind="assignment" />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    await waitFor(() => expect(state.from).not.toHaveBeenCalled());
  });
});
