import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PracticePolls } from "@/components/PracticePolls";

const mocks = vi.hoisted(() => ({
  auth: { status: "student", user: { id: "student-a" } },
  polls: vi.fn(),
  winners: vi.fn(),
  myVote: vi.fn(),
  myReason: vi.fn(),
  adminReasons: vi.fn(),
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
  getMyPracticePollReason: mocks.myReason,
  getPracticePollAdminReasons: mocks.adminReasons,
  PRACTICE_REASON_MAX_LENGTH: 200,
  validatePracticeVoteReason: (reason: string) => {
    const trimmed = reason.trim();
    if (trimmed.length < 2 || trimmed.length > 200) throw new Error("선정 이유를 2~200자로 작성해 주세요.");
    return trimmed;
  },
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
  mocks.myReason.mockReset().mockResolvedValue(null);
  mocks.adminReasons.mockReset().mockResolvedValue([]);
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
    const submit = screen.getByRole("button", { name: "선택한 1명에게 투표" });
    expect(screen.getByRole("textbox", { name:/선정 이유/ })).toBeInTheDocument();
    expect(submit).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox", { name:/선정 이유/ }), {
      target:{value:"설명을 친절하고 명확하게 해주었어요."},
    });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    await waitFor(() => expect(mocks.vote).toHaveBeenCalledWith("poll-a", 2,"설명을 친절하고 명확하게 해주었어요."));
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
    const reasonInput=screen.getByRole("textbox", { name:/선정 이유/ });
    fireEvent.change(reasonInput, {target:{value:"브랜드 분석을 세밀하게 해주었어요."}});
    vi.mocked(window.confirm).mockReturnValueOnce(false).mockReturnValueOnce(true);
    const save = screen.getByRole("button", { name: "선택한 1명으로 변경" });
    fireEvent.click(save);
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("투표 1명을 변경하시겠습니까?"));
    expect(mocks.change).not.toHaveBeenCalled();
    fireEvent.click(save);
    await waitFor(() => expect(mocks.change).toHaveBeenCalledWith("poll-a", 3, 2, "브랜드 분석을 세밀하게 해주었어요."));
  });


  it("shows only the current student's saved selection reason after voting", async () => {
    mocks.myVote.mockResolvedValue(2);
    mocks.myReason.mockResolvedValue("발표의 구성이 명확하고 공감이 갔어요.");
    render(<PracticePolls sessionNumber={24} />);
    expect(await screen.findByText("발표의 구성이 명확하고 공감이 갔어요.")).toBeInTheDocument();
    expect(screen.getByText("내 선정 이유")).toBeInTheDocument();
    expect(mocks.adminReasons).not.toHaveBeenCalled();
  });

  it("shows anonymous reasons to instructors only after a poll is closed", async () => {
    mocks.auth.status="instructor";
    mocks.polls.mockResolvedValueOnce([{...poll,status:"closed"}]);
    mocks.candidates.mockResolvedValue(["수강생가","수강생나"]);
    mocks.admin.mockResolvedValue({
      totalVotes:1,
      options:[{index:1,label:"수강생가",votes:1}],
      participants:[{id:"student-a",name:"수강생가",votedAt:"2026-11-08T07:00:00Z"}],
    });
    mocks.adminReasons.mockResolvedValue([{label:"수강생나",reasons:["친구들을 많이 도와줬어요."]}]);
    render(<PracticePolls sessionNumber={24} />);
    expect(await screen.findByText(/선정 이유 확인/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/선정 이유 확인/));
    expect(screen.getByText("친구들을 많이 도와줬어요.")).toBeInTheDocument();
    expect(mocks.myReason).not.toHaveBeenCalled();
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
