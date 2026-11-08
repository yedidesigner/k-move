import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  closePracticePoll, createPracticePoll, didVoteInPracticePoll, getPracticePollAdminResults,
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
  it("validates clean single-choice polls and blocks duplicate candidates", () => {
    expect(validateNewPoll("가장 좋은 시안은?",[" 시안 A ", "시안 B"])).toEqual({
      title: "가장 좋은 시안은?", choices: ["시안 A", "시안 B"],
    });
    expect(() => validateNewPoll("짧",["시안 A","시안 B"])).toThrow();
    expect(() => validateNewPoll("가장 좋은 시안은?",["시안 A","시안 a"])).toThrow();
    expect(() => validateNewPoll("가장 좋은 시안은?",["시안 A"])).toThrow();
    expect(() => validateNewPoll("가장 좋은 시안은?",["시안 A","시안 B",...Array(7).fill("항목")])).toThrow();
  });

  it("reads only public poll metadata for an enrolled class session", async () => {
    await getPracticePolls(3);
    expect(mocks.from).toHaveBeenCalledWith("kmove_practice_polls");
    expect(mocks.from).not.toHaveBeenCalledWith("kmove_practice_ballots");
  });

  it("issues one vote through a restricted RPC and handles duplicate vote response", async () => {
    expect(await voteInPracticePoll("poll-a",2)).toBe(true);
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_cast_vote", {
      p_poll:"poll-a", p_option:2,
    });
    mocks.rpc.mockResolvedValueOnce({ data:false,error:null });
    expect(await voteInPracticePoll("poll-a",2)).toBe(false);
    await expect(voteInPracticePoll("poll-a",0)).rejects.toThrow();
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
    await createPracticePoll(3,"어떤 시안이 좋을까요?",["A","B"]);
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_create_poll",{
      p_session:3,p_question:"어떤 시안이 좋을까요?",p_options:["A","B"],
    });
    await closePracticePoll("new-poll");
    await publishPracticePollWinner("new-poll",true);
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_close_poll",{p_poll:"new-poll"});
    expect(mocks.rpc).toHaveBeenCalledWith("kmove_practice_publish_winner",{
      p_poll:"new-poll",p_visible:true,
    });
  });
});
