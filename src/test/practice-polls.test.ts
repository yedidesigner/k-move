import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  closePracticePoll, createPracticePoll, changePracticePollVote, didVoteInPracticePoll,
  getMyPracticePollVote, getPracticePollAdminResults, getMyPracticePollCandidateIndex,
  isPracticePollComplete,
  getPracticePollCandidates,
  getPracticePolls, getPracticePollWinnerList, publishPracticePollWinner,
  validateNewPoll, voteInPracticePoll,
} from "@/lib/practice-polls";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  read: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    from: (table: string) => {
      mocks.from(table);
      return {
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => mocks.read(),
            }),
          }),
        }),
      };
    },
    rpc: mocks.rpc,
  }),
}));

beforeEach(() => {
  mocks.rpc.mockReset().mockResolvedValue({ data: true, error: null });
  mocks.read.mockReset().mockResolvedValue({ data: [], error: null });
  mocks.from.mockClear();
});

describe("Practice polls member-safe API", () => {
  it("validates the question only; candidate names are not accepted from the browser", () => {
    expect(validateNewPoll(" 이번 회차에서 누구를 선택할까요? ")).toEqual({
      title: "이번 회차에서 누구를 선택할까요?",
    });
    expect(() => validateNewPoll("짧")).toThrow();
    expect(() => validateNewPoll("가".repeat(181))).toThrow();
  });

  it("loads the enrolled-candidate preview from an instructor-only server RPC", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: ["수강생가","수강생나","수강생다"], error: null });
    expect(await getPracticePollCandidates()).toEqual(["수강생가","수강생나","수강생다"]);
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_candidate_names");
    expect(mocks.from).not.toHaveBeenCalledWith("kmove_enrollments");
  });

  it("reads only public poll metadata for an enrolled class session", async () => {
    await getPracticePolls(3);
    expect(mocks.from).toHaveBeenCalledWith("kmove_practice_polls");
    expect(mocks.from).not.toHaveBeenCalledWith("kmove_practice_ballots");
  });

  it("issues one vote through a restricted RPC and handles duplicate vote response", async () => {
    expect(await voteInPracticePoll("poll-a",15)).toBe(true);
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_cast_vote", {
      p_poll:"poll-a", p_option:15,
    });
    mocks.rpc.mockResolvedValueOnce({ data:false,error:null });
    expect(await voteInPracticePoll("poll-a",2)).toBe(false);
    await expect(voteInPracticePoll("poll-a",0)).rejects.toThrow();
    await expect(voteInPracticePoll("poll-a",101)).rejects.toThrow();
  });


  it("loads only the current student's selected candidate, never other ballots", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: 14, error: null });
    expect(await getMyPracticePollVote("poll-a")).toBe(14);
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_my_vote", { p_poll: "poll-a" });
    mocks.rpc.mockResolvedValueOnce({ data: null, error: null });
    expect(await getMyPracticePollVote("poll-a")).toBeNull();
    expect(mocks.from).not.toHaveBeenCalledWith("kmove_practice_ballots");
  });

  it("replaces an existing vote with exactly one other candidate", async () => {
    expect(await changePracticePollVote("poll-a", 15, 2)).toBe(true);
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_change_vote", {
      p_poll: "poll-a", p_option: 15, p_previous: 2,
    });
    await expect(changePracticePollVote("poll-a", 2, 2)).rejects.toThrow(/다른 수강생/);
    await expect(changePracticePollVote("poll-a", 0, 1)).rejects.toThrow();
    await expect(changePracticePollVote("poll-a", 101, 1)).rejects.toThrow();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it("surfaces a closed poll or stale ballot instead of reporting a successful change", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: null, error: { message: "수업 시간이 종료되어 투표를 변경할 수 없습니다." } });
    await expect(changePracticePollVote("poll-a", 2, 1)).rejects.toThrow(/수업 시간이 종료/);
    mocks.rpc.mockResolvedValueOnce({ data: false, error: null });
    expect(await changePracticePollVote("poll-a", 3, 1)).toBe(false);
  });


  it("returns the signed-in student's own candidate position and rejects invalid positions", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: 7, error: null });
    expect(await getMyPracticePollCandidateIndex("poll-a")).toBe(7);
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_self_candidate_index", {
      p_poll: "poll-a",
    });
    mocks.rpc.mockResolvedValueOnce({ data: null, error: null });
    expect(await getMyPracticePollCandidateIndex("poll-a")).toBeNull();
    mocks.rpc.mockResolvedValueOnce({ data: -1, error: null });
    await expect(getMyPracticePollCandidateIndex("poll-a")).rejects.toThrow(/정보/);
  });

  it("returns a completion boolean only, with no counts or voter identifiers", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: false, error: null });
    expect(await isPracticePollComplete("poll-a")).toBe(false);
    mocks.rpc.mockResolvedValueOnce({ data: true, error: null });
    expect(await isPracticePollComplete("poll-a")).toBe(true);
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_poll_complete", {
      p_poll: "poll-a",
    });
    expect(mocks.from).not.toHaveBeenCalledWith("kmove_practice_ballots");
  });

  it("exposes only own participation status and published winner names to students", async () => {
    await didVoteInPracticePoll("poll-a");
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_has_voted",{ p_poll:"poll-a" });
    mocks.rpc.mockResolvedValueOnce({ data:[{
      poll_id:"poll-a", winners:["시안 A"], // No totalVotes or ballot records.
    }], error:null });
    expect(await getPracticePollWinnerList(3)).toEqual([{
      poll_id:"poll-a", winners:["시안 A"],
    }]);
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_published_winners",{ p_session:3 });
  });

  it("keeps vote counts and participant identities behind instructor-only RPC", async () => {
    mocks.rpc.mockResolvedValueOnce({ data:{
      totalVotes:2, options:[{ index:1,label:"시안 A",votes:2 }],
      participants:[{id:"uid",name:"학생",votedAt:"2026-11-08T06:00:00Z"}],
    },error:null });
    const stats=await getPracticePollAdminResults("poll-a");
    expect(stats.totalVotes).toBe(2);
    expect(stats.participants[0]?.name).toBe("학생");
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_admin_results",{p_poll:"poll-a"});
  });

  it("allows instructors to create, close and control winner publication with distinct operations", async () => {
    mocks.rpc.mockResolvedValueOnce({ data:"new-poll",error:null });
    await createPracticePoll(3,"어떤 수강생을 선택할까요?");
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_create_roster_poll",{
      p_session:3,p_question:"어떤 수강생을 선택할까요?",
    });
    await closePracticePoll("new-poll");
    await publishPracticePollWinner("new-poll",true);
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_close_poll",{p_poll:"new-poll"});
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_publish_winner",{
      p_poll:"new-poll",p_visible:true,
    });
  });
});
