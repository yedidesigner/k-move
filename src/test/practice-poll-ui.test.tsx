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
  winnerLetters: vi.fn(),
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
  getPracticeWinnerLetters: mocks.winnerLetters,
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
  mocks.winnerLetters.mockReset().mockResolvedValue([]);
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
    expect(screen.getByRole("button", { name: "선택한 1명으로 변경" })).toBeDisabled();
    expect(screen.queryByText("현재 내 선택")).toBeNull();
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
    const show = await screen.findByRole("button", { name:"내 투표 보기" });
    expect(show).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("발표의 구성이 명확하고 공감이 갔어요.")).toBeNull();
    expect(screen.queryByText("현재 내 선택")).toBeNull();
    fireEvent.click(show);
    expect(screen.getByText("발표의 구성이 명확하고 공감이 갔어요.")).toBeInTheDocument();
    expect(screen.getByText("내 선정 이유")).toBeInTheDocument();
    expect(screen.getByText("현재 내 선택")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name:"내 투표 숨기기"}));
    expect(screen.queryByText("발표의 구성이 명확하고 공감이 갔어요.")).toBeNull();
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

  it("does not reveal full-class completion or count to students, even if complete", async () => {
    mocks.complete.mockResolvedValue(true);
    render(<PracticePolls sessionNumber={24} />);
    await screen.findByRole("button", { name: "선택한 1명에게 투표" });
    expect(mocks.complete).not.toHaveBeenCalled();
    expect(screen.queryByText("투표 완료")).toBeNull();
    expect(screen.queryByText(/수강생 전원이 참여했습니다/)).toBeNull();
    expect(screen.queryByText("15표")).toBeNull();
    expect(screen.queryByText(/참여자 목록/)).toBeNull();
    expect(mocks.adminReasons).not.toHaveBeenCalled();
    expect(mocks.admin).not.toHaveBeenCalled();
  });

  it("shows only the instructor when everyone has participated", async () => {
    mocks.auth.status = "instructor";
    mocks.complete.mockResolvedValue(true);
    mocks.candidates.mockResolvedValue(["수강생가","수강생나"]);
    mocks.admin.mockResolvedValue({ totalVotes: 3, options: [], participants: [] });
    render(<PracticePolls sessionNumber={24} />);
    expect(await screen.findByText("투표 완료")).toBeInTheDocument();
    expect(screen.getByText(/수강생 전원이 참여했습니다/)).toBeInTheDocument();
    expect(mocks.complete).toHaveBeenCalledWith("poll-a");
  });


  it("never loads winner mailboxes while the vote is open", async () => {
    render(<PracticePolls sessionNumber={24} />);
    await screen.findByRole("button", { name: "선택한 1명에게 투표" });
    expect(mocks.winnerLetters).not.toHaveBeenCalled();
    expect(screen.queryByText("친구들이 남긴 한마디")).toBeNull();
  });

  it("does not request or show private winner notes before instructor publication", async () => {
    mocks.polls.mockResolvedValue([{ ...poll, status: "closed", winner_published: false }]);
    render(<PracticePolls sessionNumber={24} />);
    await screen.findByText("투표가 마감되었습니다.");
    expect(mocks.winnerLetters).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "편지 열기" })).toBeNull();
  });

  it("gives the published winner an envelope but keeps a non-winner's inbox empty", async () => {
    mocks.polls.mockResolvedValue([{ ...poll, status: "closed", winner_published: true }]);
    mocks.winnerLetters.mockResolvedValueOnce([{ recipient:"수강생가", letters:["친절하게 디자인을 설명해줬어요."] }]);
    const view=render(<PracticePolls sessionNumber={24} />);
    const open=await screen.findByRole("button", { name: "편지 열기" });
    expect(mocks.winnerLetters).toHaveBeenCalledWith("poll-a");
    fireEvent.click(open);
    expect(screen.getByText("친절하게 디자인을 설명해줬어요.")).toBeInTheDocument();
    view.unmount();

    mocks.winnerLetters.mockResolvedValue([]);
    render(<PracticePolls sessionNumber={24} />);
    await screen.findByText("투표가 마감되었습니다.");
    await waitFor(() => expect(mocks.winnerLetters).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole("button", { name: "편지 열기" })).toBeNull();
  });

  it("shows every co-winner's private letter inbox to an instructor after close, even before publication", async () => {
    mocks.auth.status="instructor";
    mocks.polls.mockResolvedValue([{ ...poll, status:"closed", winner_published:false }]);
    mocks.candidates.mockResolvedValue(["수강생가", "수강생나"]);
    mocks.admin.mockResolvedValue({ totalVotes:2, options:[], participants:[] });
    mocks.winnerLetters.mockResolvedValue([
      { recipient:"수강생가", letters:["첫 번째 공동 1등에게 쓰는 글."] },
      { recipient:"수강생나", letters:["두 번째 공동 1등에게 쓰는 글."] },
    ]);
    render(<PracticePolls sessionNumber={24} />);
    await screen.findByText("수강생가님에게 도착한 편지");
    expect(screen.getByText("수강생나님에게 도착한 편지")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "편지 열기" })).toHaveLength(2);
    expect(mocks.winnerLetters).toHaveBeenCalledWith("poll-a");
    expect(mocks.myReason).not.toHaveBeenCalled();
  });

  it("does not expose voting controls to a noncandidate sample account", async () => {
    mocks.myCandidate.mockResolvedValue(null);
    render(<PracticePolls sessionNumber={24} />);
    expect(await screen.findByText(/후보 명단에 포함된 실제 수강생만 참여/)).toBeInTheDocument();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.queryByRole("button", { name: "선택한 1명에게 투표" })).toBeNull();
  });
});
