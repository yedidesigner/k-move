import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  closePracticePoll, createPracticePoll, changePracticePollVote, didVoteInPracticePoll,
  getMyPracticePollVote, getMyPracticePollReason, getPracticePollAdminResults,
  getPracticePollAdminReasons, getMyPracticePollCandidateIndex, validatePracticeVoteReason,
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
    expect(await voteInPracticePoll("poll-a",15,"발표가 명확하고 친절해요.")).toBe(true);
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_cast_vote_with_reason", {
      p_poll:"poll-a", p_option:15, p_reason:"발표가 명확하고 친절해요.",
    });
    mocks.rpc.mockResolvedValueOnce({ data:false,error:null });
    expect(await voteInPracticePoll("poll-a",2,"분석을 꼼꼼하게 했어요.")).toBe(false);
    await expect(voteInPracticePoll("poll-a",0,"좋아요.")).rejects.toThrow();
    await expect(voteInPracticePoll("poll-a",101,"좋아요.")).rejects.toThrow();
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
    expect(await changePracticePollVote("poll-a", 15, 2, "새로운 친구가 발표를 잘했어요.")).toBe(true);
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_change_vote_with_reason", {
      p_poll: "poll-a", p_option: 15, p_previous: 2, p_reason:"새로운 친구가 발표를 잘했어요.",
    });
    await expect(changePracticePollVote("poll-a", 2, 2, "좋아요.")).rejects.toThrow(/다른 수강생/);
    await expect(changePracticePollVote("poll-a", 0, 1,"좋아요.")).rejects.toThrow();
    await expect(changePracticePollVote("poll-a", 101, 1,"좋아요.")).rejects.toThrow();
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });

  it("surfaces a closed poll or stale ballot instead of reporting a successful change", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: null, error: { message: "수업 시간이 종료되어 투표를 변경할 수 없습니다." } });
    await expect(changePracticePollVote("poll-a", 2, 1, "발표가 인상적이에요.")).rejects.toThrow(/수업 시간이 종료/);
    mocks.rpc.mockResolvedValueOnce({ data: false, error: null });
    expect(await changePracticePollVote("poll-a", 3, 1,"분석을 잘했어요.")).toBe(false);
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


  it("requires 2–200 characters for a selection reason before making any RPC", async () => {
    expect(validatePracticeVoteReason("  친절하고 설명이 명확했어요.  ")).toBe("친절하고 설명이 명확했어요.");
    expect(() => validatePracticeVoteReason("")).toThrow(/선정 이유/);
    expect(() => validatePracticeVoteReason(" ")).toThrow(/선정 이유/);
    expect(() => validatePracticeVoteReason("가".repeat(201))).toThrow(/2~200자/);
    await expect(voteInPracticePoll("poll-a",2," ")).rejects.toThrow(/선정 이유/);
    await expect(changePracticePollVote("poll-a",3,2," ")).rejects.toThrow(/선정 이유/);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("returns the current student's saved reason without exposing other ballots", async () => {
    mocks.rpc.mockResolvedValueOnce({ data:"디자인 설명이 정교했어요.",error:null });
    expect(await getMyPracticePollReason("poll-a")).toBe("디자인 설명이 정교했어요.");
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_my_vote_reason",{p_poll:"poll-a"});
    mocks.rpc.mockResolvedValueOnce({ data:null,error:null });
    expect(await getMyPracticePollReason("poll-a")).toBeNull();
    expect(mocks.from).not.toHaveBeenCalledWith("kmove_practice_ballots");
  });

  it("fetches anonymous candidate-grouped reasons through an instructor-only endpoint", async () => {
    const example=[{label:"수강생나",reasons:["도움을 잘 주었어요.","발표가 명확했어요."]}];
    mocks.rpc.mockResolvedValueOnce({data:example,error:null});
    expect(await getPracticePollAdminReasons("poll-a")).toEqual(example);
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_admin_reasons",{p_poll:"poll-a"});
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
