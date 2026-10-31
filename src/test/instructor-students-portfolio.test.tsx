import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudentManager } from "@/components/instructor/StudentManager";
import { PortfolioManager } from "@/components/instructor/PortfolioManager";
import { normalizedVersionValues, safeExternalUrl } from "@/lib/student-operations";

const state = vi.hoisted(() => ({
  auth: { status: "instructor", user: { id: "teacher" } as { id: string } | null },
  listEnrollments: vi.fn(),
  listAssignments: vi.fn(),
  listSubmissions: vi.fn(),
  listReviewPublications: vi.fn(),
  listStudentNotes: vi.fn(),
  listOperationLog: vi.fn(),
  saveStudentNote: vi.fn(),
  saveEnrollment: vi.fn(),
  enrollStudent: vi.fn(),
  relinkStudentAccount: vi.fn(),
  listPortfolioVersions: vi.fn(),
  appendPortfolioVersion: vi.fn(),
  loadStudentFolders: vi.fn(),
  loadStudentProfiles: vi.fn(),
  useBlocker: vi.fn(),
}));
vi.mock("@tanstack/react-router", () => ({ useBlocker: state.useBlocker }));
vi.mock("@/lib/auth", () => ({ useAuth: () => state.auth }));
vi.mock("@/lib/instructor-api", () => ({
  listEnrollments: state.listEnrollments,
  listAssignments: state.listAssignments,
  listSubmissions: state.listSubmissions,
  listReviewPublications: state.listReviewPublications,
  listStudentNotes: state.listStudentNotes,
  listOperationLog: state.listOperationLog,
  saveStudentNote: state.saveStudentNote,
  saveEnrollment: state.saveEnrollment,
  enrollStudent: state.enrollStudent,
  relinkStudentAccount: state.relinkStudentAccount,
  listPortfolioVersions: state.listPortfolioVersions,
  appendPortfolioVersion: state.appendPortfolioVersion,
}));
vi.mock("@/lib/student-directory", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/student-directory")>("@/lib/student-directory");
  return {
    ...actual,
    loadStudentFolders: state.loadStudentFolders,
    loadStudentProfiles: state.loadStudentProfiles,
  };
});
vi.mock("@/components/StudentDriveFolders", () => ({
  StudentDriveFolders: () => <p>기존 개인 폴더</p>,
}));

const students = [
  {
    user_id: "student-a",
    student_id: "feedback-a",
    name: "강민주",
    status: "active",
    joined_at: "2026-10-31T00:00:00Z",
    updated_at: "2026-10-31T00:00:00Z",
  },
  {
    user_id: "student-b",
    student_id: "feedback-b",
    name: "강유민",
    status: "active",
    joined_at: "2026-10-31T00:00:00Z",
    updated_at: "2026-10-31T00:00:00Z",
  },
];
const folders = students.map((student) => ({
  user_id: student.user_id,
  name: student.name,
  google_email: `${student.user_id}@example.com`,
  assignment_folder_url: `https://drive.google.com/drive/folders/assignment-${student.user_id}`,
  portfolio_folder_url: `https://drive.google.com/drive/folders/portfolio-${student.user_id}`,
  sharing_ready: true,
}));
function version(overrides: Record<string, unknown> = {}) {
  return {
    id: "v-a-1",
    user_id: "student-a",
    project_key: "project-a",
    title: "학생 A 프로젝트",
    target_role: "UX 디자이너",
    next_goal: "정보 구조 검토",
    label: "첫 번째 시안",
    stage: "structure",
    url: "https://example.com/a-v1",
    notes: "초기 구조",
    version: 1,
    created_at: "2026-11-01T01:00:00Z",
    created_by: "student-a",
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  state.auth = { status: "instructor", user: { id: "teacher" } };
  state.listEnrollments.mockResolvedValue(students);
  state.listAssignments.mockResolvedValue([]);
  state.listSubmissions.mockResolvedValue([]);
  state.listReviewPublications.mockResolvedValue([]);
  state.listStudentNotes.mockResolvedValue([]);
  state.listOperationLog.mockResolvedValue([]);
  state.loadStudentFolders.mockResolvedValue(folders);
  state.loadStudentProfiles.mockResolvedValue([
    ...students.map((student) => ({
      id: student.user_id,
      username: student.name,
      role: "student",
    })),
    { id: "legacy", username: "홍길순", role: "student" },
  ]);
  state.listPortfolioVersions.mockResolvedValue([
    version(),
    version({
      id: "v-b-1",
      user_id: "student-b",
      project_key: "project-b",
      title: "학생 B 비공개 프로젝트",
      url: "https://example.com/b-v1",
    }),
  ]);
  vi.spyOn(window, "confirm").mockReturnValue(true);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("instructor student management", () => {
  it("does not fetch or show student records to a student", () => {
    state.auth = { status: "student", user: { id: "student-a" } };
    render(<StudentManager />);
    expect(screen.getByRole("alert")).toHaveTextContent("강사 계정");
    expect(state.listEnrollments).not.toHaveBeenCalled();
  });

  it("shows the enrolled cohort only, rather than every legacy account", async () => {
    render(<StudentManager />);
    await screen.findByRole("heading", { name: "강민주" });
    expect(screen.getByText("2명")).toBeVisible();
    expect(screen.queryByText("홍길순")).not.toBeInTheDocument();
    expect(screen.getByText("확정한 제출 기록이 없습니다.")).toBeVisible();
    const list = screen.getByRole("region", { name: "수강생 목록" });
    fireEvent.change(screen.getByRole("textbox", { name: "학생 이름 검색" }), {
      target: { value: "강유민" },
    });
    expect(within(list).queryByRole("button", { name: /강민주/ })).not.toBeInTheDocument();
    expect(within(list).getByRole("button", { name: /강유민/ })).toBeVisible();
  });

  it("saves private notes with their expected revision and leaves failed edits intact", async () => {
    state.listStudentNotes.mockResolvedValue([
      {
        user_id: "student-a",
        content: "기존 메모",
        version: 4,
        updated_at: "2026-11-01T00:00:00Z",
      },
    ]);
    state.saveStudentNote.mockRejectedValueOnce(new Error("network failure"));
    render(<StudentManager />);
    const input = await screen.findByRole("textbox", { name: "강민주 강사 메모" });
    fireEvent.change(input, { target: { value: "다음 상담 내용" } });
    fireEvent.click(screen.getByRole("button", { name: "메모 저장" }));
    await screen.findByRole("alert");
    expect(state.saveStudentNote).toHaveBeenCalledWith("student-a", "다음 상담 내용", 4);
    expect(input).toHaveValue("다음 상담 내용");
    expect(screen.getByText("저장하지 않은 변경 사항")).toBeVisible();
  });

  it("links a submission history row to its exact version", async () => {
    state.listAssignments.mockResolvedValue([
      { id: "assignment-a", session_number: 2, title: "구조 설계" },
    ]);
    state.listSubmissions.mockResolvedValue([
      {
        id: "submission-a",
        assignment_id: "assignment-a",
        user_id: "student-a",
        version: 2,
        submitted_at: "2026-11-01T02:00:00Z",
        late: true,
      },
    ]);
    render(<StudentManager />);
    const link = await screen.findByRole("link", { name: /구조 설계/ });
    expect(link).toHaveAttribute("href", "/feedback?submission=submission-a");
    expect(link).toHaveTextContent("v2");
    expect(link).toHaveTextContent("지각 제출");
    expect(link).toHaveTextContent("공개 피드백 없음");
  });

  it("does not switch away from unsaved private notes when discard is rejected", async () => {
    vi.mocked(window.confirm).mockReturnValue(false);
    render(<StudentManager />);
    const input = await screen.findByRole("textbox", { name: "강민주 강사 메모" });
    fireEvent.change(input, { target: { value: "저장 전 내용" } });
    fireEvent.click(screen.getByRole("button", { name: /강유민.*제출 기록 없음/ }));
    expect(screen.getByRole("heading", { name: "강민주" })).toBeVisible();
    expect(input).toHaveValue("저장 전 내용");
  });
});

describe("portfolio versions and private identity", () => {
  it("filters unexpected peer data and shows only the student's folder and project", async () => {
    state.auth = { status: "student", user: { id: "student-a" } };
    render(<PortfolioManager />);
    await screen.findByRole("heading", { name: "학생 A 프로젝트" });
    expect(screen.queryByText("학생 B 비공개 프로젝트")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("포트폴리오 학생 선택")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "개인 Drive 폴더" })).toHaveAttribute(
      "href",
      folders[0]!.portfolio_folder_url,
    );
    expect(state.loadStudentFolders).toHaveBeenCalledWith("student-a");
  });

  it("keeps the prior version when adding a new version and compares their recorded details", async () => {
    state.auth = { status: "student", user: { id: "student-a" } };
    state.appendPortfolioVersion.mockImplementation(async (payload) =>
      version({ ...payload, id: "v-a-2", version: 2, created_at: "2026-11-02T01:00:00Z" }),
    );
    render(<PortfolioManager />);
    await screen.findByRole("heading", { name: "학생 A 프로젝트" });
    fireEvent.click(screen.getByRole("button", { name: "수정본 기록" }));
    fireEvent.change(screen.getByRole("textbox", { name: "버전 이름" }), {
      target: { value: "내비게이션 수정" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /작업 링크/ }), {
      target: { value: "https://example.com/a-v2" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "이번 버전에서 달라진 점" }), {
      target: { value: "하위 메뉴 구조 정리" },
    });
    fireEvent.click(screen.getByRole("button", { name: "새 버전 저장" }));
    await screen.findByRole("status");
    expect(state.appendPortfolioVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "student-a",
        project_key: "project-a",
        label: "내비게이션 수정",
        url: "https://example.com/a-v2",
        notes: "하위 메뉴 구조 정리",
        target_role: "UX 디자이너",
      }),
    );
    const select = screen.getByRole("combobox", { name: "확인할 버전" });
    expect(within(select).getAllByRole("option")).toHaveLength(2);
    fireEvent.change(select, { target: { value: "v-a-2" } });
    fireEvent.change(screen.getByRole("combobox", { name: "비교할 버전" }), {
      target: { value: "v-a-1" },
    });
    expect(screen.getByRole("article", { name: "선택한 버전 v2" })).toHaveTextContent(
      "하위 메뉴 구조 정리",
    );
    expect(screen.getByRole("article", { name: "비교 버전 v1" })).toHaveTextContent("초기 구조");
  });

  it("fails closed for an unconfirmed Drive mapping", async () => {
    state.auth = { status: "student", user: { id: "student-a" } };
    state.loadStudentFolders.mockResolvedValue([{ ...folders[0], sharing_ready: false }]);
    render(<PortfolioManager />);
    await screen.findByRole("heading", { name: "학생 A 프로젝트" });
    expect(screen.queryByRole("link", { name: "개인 Drive 폴더" })).not.toBeInTheDocument();
    expect(screen.getByText(/개인 Drive 공유 권한 확인이 필요/)).toBeVisible();
  });

  it("unmounts previous account information immediately on logout", async () => {
    state.auth = { status: "student", user: { id: "student-a" } };
    const { rerender } = render(<PortfolioManager />);
    await screen.findByRole("heading", { name: "학생 A 프로젝트" });
    state.auth = { status: "signedOut", user: null };
    rerender(<PortfolioManager />);
    expect(screen.queryByText("학생 A 프로젝트")).not.toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("ignores a response for the previous account after an identity change", async () => {
    let resolveOld!: (value: ReturnType<typeof version>[]) => void;
    state.listPortfolioVersions.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveOld = resolve;
      }),
    );
    state.auth = { status: "student", user: { id: "student-a" } };
    const { rerender } = render(<PortfolioManager />);
    state.auth = { status: "student", user: { id: "student-b" } };
    rerender(<PortfolioManager />);
    await screen.findByRole("heading", { name: "학생 B 비공개 프로젝트" });
    await act(async () => resolveOld([version()]));
    expect(screen.queryByText("학생 A 프로젝트")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "학생 B 비공개 프로젝트" })).toBeVisible();
  });
});

describe("portfolio external links", () => {
  it.each([
    "javascript:alert(1)",
    "data:text/html,example",
    "https://user:secret@example.com",
    "//example.com",
    "not a url",
  ])("rejects %s", (url) => {
    expect(safeExternalUrl(url)).toBeNull();
    expect(() => normalizedVersionValues({ label: "시안", url, notes: "" })).toThrow();
  });
  it("keeps a valid HTTPS version link with its hash", () => {
    expect(safeExternalUrl("https://example.com/design#v2")).toBe("https://example.com/design#v2");
  });
});
