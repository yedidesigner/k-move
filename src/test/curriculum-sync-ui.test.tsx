import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CurriculumSyncRow, CurriculumSyncStatus } from "@/lib/curriculum-sync";

const mocks = vi.hoisted(() => ({
  auth: { status: "instructor", user: { id: "teacher-one" } },
  getStatus: vi.fn(),
  issueCode: vi.fn(),
  revoke: vi.fn(),
  retry: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ useAuth: () => mocks.auth }));
vi.mock("@/lib/curriculum-sync", () => ({
  getCurriculumSyncStatus: mocks.getStatus,
  issueCurriculumPairingCode: mocks.issueCode,
  revokeCurriculumSync: mocks.revoke,
  retryCurriculumSync: mocks.retry,
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    className,
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));
import {
  CurriculumSheetSyncPanel,
  CurriculumSheetSyncStatus,
  curriculumSyncRowLabel,
} from "@/components/instructor/CurriculumSheetSync";

const now = "2026-10-31T03:00:00.000Z";
const makeRow = (overrides: Partial<CurriculumSyncRow> = {}): CurriculumSyncRow => ({
  session_key: "S01",
  session_number: 1,
  source_version: 3,
  last_synced_version: 2,
  status: "pending",
  error_code: null,
  updated_at: now,
  last_synced_at: null,
  lease_expires_at: null,
  attempts: 0,
  conflict: null,
  ...overrides,
});
const makeStatus = (overrides: Partial<CurriculumSyncStatus> = {}): CurriculumSyncStatus => ({
  spreadsheet_id: "1Hv7dvSg_R98DM8_VlCCg7ckYRoopmSFlAQ8z_g5Cds0",
  sheet_id: 2001,
  configured: false,
  connected: false,
  last_seen_at: null,
  paired_at: null,
  pairing_expires_at: null,
  rows: [makeRow()],
  ...overrides,
});
const oneTimeCode = "a".repeat(64);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth = { status: "instructor", user: { id: "teacher-one" } };
  mocks.getStatus.mockResolvedValue(makeStatus());
  mocks.issueCode.mockResolvedValue({
    pairing_code: oneTimeCode,
    expires_at: new Date(Date.now() + 900_000).toISOString(),
    spreadsheet_id: "original-sheet",
    sheet_id: 2001,
  });
  mocks.retry.mockResolvedValue(undefined);
  mocks.revoke.mockResolvedValue(undefined);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("curriculum Sheet status", () => {
  it("does not load data or show controls to students", () => {
    mocks.auth.status = "student";
    const { container } = render(
      <>
        <CurriculumSheetSyncPanel />
        <CurriculumSheetSyncStatus sessionKey="S01" />
      </>,
    );
    expect(container).toBeEmptyDOMElement();
    expect(mocks.getStatus).not.toHaveBeenCalled();
  });
  it("distinguishes queued, working, synced, conflict and incomplete versions", () => {
    expect(curriculumSyncRowLabel(makeRow())).toBe("반영 대기");
    expect(
      curriculumSyncRowLabel(
        makeRow({ lease_expires_at: "2026-10-31T03:10:00Z" }),
        Date.parse(now),
      ),
    ).toBe("반영 중");
    expect(curriculumSyncRowLabel(makeRow({ status: "synced", last_synced_version: 3 }))).toBe(
      "반영 완료",
    );
    expect(curriculumSyncRowLabel(makeRow({ status: "synced", last_synced_version: 2 }))).toBe(
      "반영 대기",
    );
    expect(curriculumSyncRowLabel(makeRow({ status: "conflict" }))).toBe("충돌 · 확인 필요");
    expect(curriculumSyncRowLabel(makeRow({ status: "error" }))).toBe("반영 실패");
  });
  it("does not label a newly saved LMS revision as already synced", async () => {
    mocks.getStatus.mockResolvedValue(
      makeStatus({
        configured: true,
        connected: true,
        rows: [makeRow({ status: "synced", source_version: 2, last_synced_version: 2 })],
      }),
    );
    const { rerender } = render(<CurriculumSheetSyncStatus sessionKey="S01" revision={2} />);
    await screen.findByText("Google Sheet · 반영 완료");
    rerender(<CurriculumSheetSyncStatus sessionKey="S01" revision={3} />);
    await screen.findByText("Google Sheet · 반영 상태 갱신 대기");
    expect(screen.queryByText("Google Sheet · 반영 완료")).not.toBeInTheDocument();
  });
  it("refreshes every 20 seconds and on window focus, stopping on unmount", async () => {
    vi.useFakeTimers();
    const { unmount } = render(<CurriculumSheetSyncStatus sessionKey="S01" />);
    await act(async () => {});
    expect(mocks.getStatus).toHaveBeenCalledTimes(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20_000);
    });
    expect(mocks.getStatus).toHaveBeenCalledTimes(2);
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
    });
    expect(mocks.getStatus).toHaveBeenCalledTimes(3);
    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(40_000);
      window.dispatchEvent(new Event("focus"));
    });
    expect(mocks.getStatus).toHaveBeenCalledTimes(3);
  });
  it("reports lookup failure without exposing raw server messages", async () => {
    mocks.getStatus.mockRejectedValue(new Error("sensitive-worker-key-server-message"));
    render(<CurriculumSheetSyncPanel />);
    expect(await screen.findByRole("alert")).toHaveTextContent("LMS 저장 상태는 별도로 유지됩니다");
    expect(document.body).not.toHaveTextContent("sensitive-worker-key-server-message");
    expect(screen.queryByText("자동 반영 연결됨")).not.toBeInTheDocument();
  });
});

describe("pairing code lifecycle", () => {
  it("shows a code only after explicit issue and never persists it in browser storage", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const { rerender } = render(<CurriculumSheetSyncPanel />);
    await screen.findByText("자동 반영 연결 필요");
    expect(screen.queryByLabelText("일회용 연결 코드")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "연결 코드 발급" }));
    expect(await screen.findByLabelText("일회용 연결 코드")).toHaveValue(oneTimeCode);
    expect(setItem).not.toHaveBeenCalled();
    expect(window.location.href).not.toContain(oneTimeCode);
    mocks.auth = { status: "instructor", user: { id: "teacher-two" } };
    rerender(<CurriculumSheetSyncPanel />);
    expect(screen.queryByLabelText("일회용 연결 코드")).not.toBeInTheDocument();
  });
  it("discards an in-flight code when the account changes", async () => {
    let resolvePair!: (value: unknown) => void;
    mocks.issueCode.mockReturnValue(
      new Promise((resolve) => {
        resolvePair = resolve;
      }),
    );
    const { rerender } = render(<CurriculumSheetSyncPanel />);
    await screen.findByText("자동 반영 연결 필요");
    fireEvent.click(screen.getByRole("button", { name: "연결 코드 발급" }));
    mocks.auth = { status: "instructor", user: { id: "teacher-two" } };
    rerender(<CurriculumSheetSyncPanel />);
    await act(async () => {
      resolvePair({
        pairing_code: oneTimeCode,
        expires_at: new Date(Date.now() + 900_000).toISOString(),
      });
    });
    expect(screen.queryByLabelText("일회용 연결 코드")).not.toBeInTheDocument();
  });
  it("clears an expired pairing code", async () => {
    vi.useFakeTimers();
    mocks.issueCode.mockResolvedValue({
      pairing_code: oneTimeCode,
      expires_at: new Date(Date.now() + 1000).toISOString(),
    });
    render(<CurriculumSheetSyncPanel />);
    await act(async () => {});
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "연결 코드 발급" }));
    });
    expect(screen.getByLabelText("일회용 연결 코드")).toHaveValue(oneTimeCode);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1001);
    });
    expect(screen.queryByLabelText("일회용 연결 코드")).not.toBeInTheDocument();
    expect(screen.getByText(/연결 코드가 만료되었습니다/)).toBeInTheDocument();
  });
  it("clears the code after pairing is confirmed by the server", async () => {
    render(<CurriculumSheetSyncPanel />);
    await screen.findByText("자동 반영 연결 필요");
    fireEvent.click(screen.getByRole("button", { name: "연결 코드 발급" }));
    await screen.findByLabelText("일회용 연결 코드");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "상태 새로고침" })).not.toBeDisabled(),
    );
    mocks.getStatus.mockResolvedValue(
      makeStatus({ configured: true, connected: true, paired_at: new Date().toISOString() }),
    );
    fireEvent.click(screen.getByRole("button", { name: "상태 새로고침" }));
    await waitFor(() =>
      expect(screen.queryByLabelText("일회용 연결 코드")).not.toBeInTheDocument(),
    );
  });
  it("sanitizes failed pairing responses", async () => {
    mocks.issueCode.mockRejectedValue(new Error("secret-server-details"));
    render(<CurriculumSheetSyncPanel />);
    await screen.findByText("자동 반영 연결 필요");
    fireEvent.click(screen.getByRole("button", { name: "연결 코드 발급" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("기존 수업 내용은 유지됩니다");
    expect(document.body).not.toHaveTextContent("secret-server-details");
  });
});

describe("conflict and revocation", () => {
  const cells = [
    "사이클",
    "기존 제목",
    "주제",
    "용어",
    "도구",
    "과제",
    "2026-11-01",
    "10:00",
    "13:00",
  ];
  const conflict = makeRow({
    status: "conflict",
    error_code: "sheet_changed",
    conflict: {
      baseline_cells: cells,
      observed_cells: cells.map((v, i) => (i === 1 ? "시트에서 수정한 제목" : v)),
      desired_cells: cells.map((v, i) => (i === 1 ? "LMS 최신 제목" : v)),
    },
  });
  it("requires a concrete comparison and explicit confirmation before forced retry", async () => {
    mocks.getStatus.mockResolvedValue(
      makeStatus({ configured: true, connected: true, rows: [conflict] }),
    );
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<CurriculumSheetSyncPanel />);
    fireEvent.click(await screen.findByRole("button", { name: "충돌 내용 비교" }));
    expect(screen.getByText("시트에서 수정한 제목")).toBeInTheDocument();
    expect(screen.getByText("LMS 최신 제목")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "검토한 LMS 내용으로 반영…" }));
    expect(mocks.retry).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "검토한 LMS 내용으로 반영…" }));
    await waitFor(() =>
      expect(mocks.retry).toHaveBeenCalledWith("S01", true, {
        source_version: 3,
        observed_cells: conflict.conflict!.observed_cells,
      }),
    );
    expect(await screen.findByText(/반영 대기열에 넣었습니다/)).toBeInTheDocument();
  });
  it("offers no overwrite when the observed conflict snapshot is missing", async () => {
    mocks.getStatus.mockResolvedValue(
      makeStatus({ configured: true, rows: [makeRow({ status: "conflict" })] }),
    );
    render(<CurriculumSheetSyncPanel />);
    await screen.findByText("원본 시트 확인 필요");
    expect(screen.queryByRole("button", { name: "충돌 내용 비교" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "검토한 LMS 내용으로 반영…" }),
    ).not.toBeInTheDocument();
  });
  it("keeps the reviewed snapshot stable and asks for a fresh review after a stale-write rejection", async () => {
    mocks.getStatus.mockResolvedValue(
      makeStatus({ configured: true, connected: true, rows: [conflict] }),
    );
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<CurriculumSheetSyncPanel />);
    fireEvent.click(await screen.findByRole("button", { name: "충돌 내용 비교" }));
    const newerConflict = {
      ...conflict,
      source_version: 4,
      conflict: {
        ...conflict.conflict!,
        desired_cells: cells.map((v, i) => (i === 1 ? "더 최신 LMS 제목" : v)),
      },
    };
    mocks.getStatus.mockResolvedValue(
      makeStatus({ configured: true, connected: true, rows: [newerConflict] }),
    );
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
    });
    expect(screen.getByText("LMS 최신 제목")).toBeInTheDocument();
    expect(screen.queryByText("더 최신 LMS 제목")).not.toBeInTheDocument();
    mocks.retry.mockRejectedValue(new Error("stale-review-secret-internal-detail"));
    fireEvent.click(screen.getByRole("button", { name: "검토한 LMS 내용으로 반영…" }));
    await waitFor(() =>
      expect(mocks.retry).toHaveBeenCalledWith("S01", true, {
        source_version: 3,
        observed_cells: conflict.conflict!.observed_cells,
      }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("충돌 내용 비교를 다시 열어");
    expect(
      screen.queryByRole("button", { name: "검토한 LMS 내용으로 반영…" }),
    ).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("stale-review-secret-internal-detail");
    fireEvent.click(screen.getByRole("button", { name: "충돌 내용 비교" }));
    expect(screen.getByText("더 최신 LMS 제목")).toBeInTheDocument();
  });
  it("keeps ordinary retry separate from conflict overwrite", async () => {
    mocks.getStatus.mockResolvedValue(
      makeStatus({
        configured: true,
        rows: [makeRow({ status: "error", error_code: "transport_error" })],
      }),
    );
    render(<CurriculumSheetSyncPanel />);
    fireEvent.click(await screen.findByRole("button", { name: "다시 시도" }));
    await waitFor(() => expect(mocks.retry).toHaveBeenCalledWith("S01", false, undefined));
  });
  it("requires confirmation before revoking the connection", async () => {
    mocks.getStatus.mockResolvedValue(makeStatus({ configured: true, connected: true }));
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<CurriculumSheetSyncPanel />);
    fireEvent.click(await screen.findByRole("button", { name: "자동 반영 연결 해제" }));
    expect(mocks.revoke).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "자동 반영 연결 해제" }));
    await waitFor(() => expect(mocks.revoke).toHaveBeenCalledOnce());
  });
});
