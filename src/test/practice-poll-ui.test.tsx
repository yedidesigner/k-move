import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PracticePolls } from "@/components/PracticePolls";

const mocks = vi.hoisted(() => ({
  auth: { status: "student", user: { id: "student-a" } },
  polls: vi.fn(),
  winners: vi.fn(),
  myVote: vi.fn(),
  myCandidate: vi.fn(),
  complete: vi.fn(),
  change: vi.fn(),
  vote: vi.fn(),
  candidates: vi.fn(),
  admin: vi.fn(),
  create: vi.fn(),
  close: vi.fn(),
  publish: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ useAuth: () => mocks.auth }));
vi.mock("@/lib/practice-polls", () => ({
  getPracticePolls: mocks.polls,
  getPracticePollWinnerList: mocks.winners,
  getMyPracticePollVote: mocks.myVote,
  getMyPracticePollCandidateIndex: mocks.myCandidate,
  isPracticePollComplete: mocks.complete,
  changePracticePollVote: mocks.change,
  voteInPracticePoll: mocks.vote,
  getPracticePollCandidates: mocks.candidates,
  getPracticePollAdminResults: mocks.admin,
  createPracticePoll: mocks.create,
  closePracticePoll: mocks.close,
  publishPracticePollWinner: mocks.publish,
  validateNewPoll: (question: string) => ({ title: question.trim() }),
}));

const poll = {
  id: "poll-a",
  session_number: 24,
  question: "24회차 실습 친구 투표",
  options: ["수강생가", "수강생나", "수강생다"],
  status: "open",
  winner_published: false,
  created_at: "2026-11-08T03:00:00Z",
};

beforeEach(() => {
  mocks.auth.status = "student";
  mocks.polls.mockReset().mockResolvedValue([poll]);
  mocks.winners.mockReset().mockResolvedValue([]);
  mocks.myVote.mockReset().mockResolvedValue(null);
  mocks.myCandidate.mockReset().mockResolvedValue(1);
  mocks.complete.mockReset().mockResolvedValue(false);
  mocks.vote.mockReset().mockResolvedValue(true);
  mocks.change.mockReset().mockResolvedValue(true);
  mocks.candidates.mockReset().mockResolvedValue([]);
  mocks.admin.mockReset();
  mocks.create.mockReset();
  mocks.close.mockReset();
  mocks.publish.mockReset();
  vi.spyOn(window, "alert").mockImplementation(() => {});
  vi.spyOn(window, "confirm").mockReturnValue(true);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Practice poll self-vote and completion interface", () => {
  it("shows a heart popup for self-vote and only permits another student's radio selection", async () => {
    render(<PracticePolls sessionNumber={24} />);
    const self = await screen.findByRole("radio", { name: "수강생가" });
    fireEvent.click(self);
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("자신을 사랑하는 당신! 칭찬합니다!"),
    );
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("❤️"));
    expect(self).not.toBeChecked();
    const friend = screen.getByRole("radio", { name: "수강생나" });
    fireEvent.click(friend);
    expect(friend).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "선택한 1명에게 투표" }));
    await waitFor(() => expect(mocks.vote).toHaveBeenCalledWith("poll-a", 2));
  });

  it("confirms a changed vote and does nothing when the user cancels the dialog", async () => {
    mocks.myVote.mockResolvedValue(2);
    render(<PracticePolls sessionNumber={24} />);
    const edit = await screen.findByRole("button", { name: "투표 변경" });
    fireEvent.click(edit);
    const self = screen.getByRole("radio", { name: "수강생가" });
    fireEvent.click(self);
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("다른 친구에게 해주세요"));
    const friend = screen.getByRole("radio", { name: "수강생다" });
    fireEvent.click(friend);
    vi.mocked(window.confirm).mockReturnValueOnce(false).mockReturnValueOnce(true);
    const save = screen.getByRole("button", { name: "선택한 1명으로 변경" });
    fireEvent.click(save);
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("투표 1명을 변경하시겠습니까?"));
    expect(mocks.change).not.toHaveBeenCalled();
    fireEvent.click(save);
    await waitFor(() => expect(mocks.change).toHaveBeenCalledWith("poll-a", 3, 2));
  });

  it("shows only '투표 완료' when all eligible students have voted", async () => {
    mocks.complete.mockResolvedValue(true);
    render(<PracticePolls sessionNumber={24} />);
    expect(await screen.findByText("투표 완료")).toBeInTheDocument();
    expect(screen.getByText(/수강생 전원이 참여했습니다/)).toBeInTheDocument();
    expect(screen.queryByText("15표")).toBeNull();
    expect(screen.queryByText(/참여자 목록/)).toBeNull();
  });

  it("does not expose voting controls to a noncandidate sample account", async () => {
    mocks.myCandidate.mockResolvedValue(null);
    render(<PracticePolls sessionNumber={24} />);
    expect(await screen.findByText(/후보 명단에 포함된 실제 수강생만 참여/)).toBeInTheDocument();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.queryByRole("button", { name: "선택한 1명에게 투표" })).toBeNull();
  });
});
