import { getSupabase } from "@/lib/supabase";

export type PracticePoll = {
  id: string;
  session_number: number;
  question: string;
  options: string[];
  status: "open" | "closed";
  winner_published: boolean;
  created_at: string;
};
export type PracticePollParticipant = {
  id: string;
  name: string;
  votedAt: string;
};
export type PracticePollTotal = {
  index: number;
  label: string;
  votes: number;
};
export type PracticePollAdminResults = {
  totalVotes: number;
  options: PracticePollTotal[];
  participants: PracticePollParticipant[];
};
export type PracticePollWinner = {
  poll_id: string;
  winners: string[];
};
export type PracticePollAnonymousReasons = { label: string; reasons: string[] };

export const PRACTICE_REASON_MAX_LENGTH = 200;

export function validatePracticeVoteReason(reason: string) {
  const value = reason.trim();
  if (value.length < 2 || value.length > PRACTICE_REASON_MAX_LENGTH)
    throw new Error("선정 이유를 2~200자로 작성해 주세요.");
  return value;
}

function problem(error: { message: string } | null, fallback: string): Error {
  return new Error(error?.message || fallback);
}

export function validateNewPoll(question: string) {
  const title = question.trim();
  if (title.length < 4 || title.length > 180)
    throw new Error("질문은 4~180자로 작성해 주세요.");
  return { title };
}

/** The instructor sees a roster-only preview, without student identifiers. */
export async function getPracticePollCandidates(): Promise<string[]> {
  const { data, error } = await getSupabase().rpc("kmove_practice_candidate_names");
  if (error) throw problem(error, "수강생 명단을 불러오지 못했습니다.");
  if (!Array.isArray(data)) throw new Error("수강생 명단 형식이 올바르지 않습니다.");
  return data as string[];
}

export async function getPracticePolls(session: number): Promise<PracticePoll[]> {
  const { data, error } = await getSupabase().from("kmove_practice_polls")
    .select("id,session_number,question,options,status,winner_published,created_at")
    .eq("session_number", session)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw problem(error, "투표를 불러오지 못했습니다.");
  return (data ?? []) as PracticePoll[];
}

export async function getPracticePollWinnerList(session: number): Promise<PracticePollWinner[]> {
  const { data, error } = await getSupabase().rpc("kmove_practice_published_winners", {
    p_session: session,
  });
  if (error) throw problem(error, "공개된 결과를 불러오지 못했습니다.");
  return (data ?? []) as PracticePollWinner[];
}

export async function didVoteInPracticePoll(pollId: string): Promise<boolean> {
  const { data, error } = await getSupabase().rpc("kmove_practice_has_voted", {
    p_poll: pollId,
  });
  if (error) throw problem(error, "투표 여부를 확인하지 못했습니다.");
  return data === true;
}

export async function voteInPracticePoll(pollId: string, selectedIndex: number, reason: string): Promise<boolean> {
  if (!Number.isInteger(selectedIndex) || selectedIndex < 1 || selectedIndex > 100)
    throw new Error("올바른 항목을 선택해 주세요.");
  const selectedReason = validatePracticeVoteReason(reason);
  const { data, error } = await getSupabase().rpc("kmove_practice_cast_vote_with_reason", {
    p_poll: pollId,
    p_option: selectedIndex,
    p_reason: selectedReason,
  });
  if (error) throw problem(error, "투표를 완료하지 못했습니다.");
  return data === true;
}

/** Returns the index of the current student's own name, never anyone else's vote. */
export async function getMyPracticePollCandidateIndex(pollId: string): Promise<number | null> {
  const { data, error } = await getSupabase().rpc("kmove_practice_self_candidate_index", {
    p_poll: pollId,
  });
  if (error) throw problem(error, "내 수강생 정보를 확인하지 못했습니다.");
  if (data === null) return null;
  if (!Number.isInteger(data) || data < 1 || data > 100)
    throw new Error("내 후보 정보가 올바르지 않습니다.");
  return data as number;
}

/** Returns only completion status; never retrieves ballot totals or voter identities. */
export async function isPracticePollComplete(pollId: string): Promise<boolean> {
  const { data, error } = await getSupabase().rpc("kmove_practice_poll_complete", {
    p_poll: pollId,
  });
  if (error) throw problem(error, "투표 완료 여부를 확인하지 못했습니다.");
  return data === true;
}

/** Only the signed-in student can read their own saved reason. */
export async function getMyPracticePollReason(pollId: string): Promise<string | null> {
  const { data, error } = await getSupabase().rpc("kmove_practice_my_vote_reason", {
    p_poll: pollId,
  });
  if (error) throw problem(error, "내 선정 이유를 불러오지 못했습니다.");
  if (data === null) return null;
  if (typeof data !== "string") throw new Error("선정 이유의 형식이 올바르지 않습니다.");
  return data;
}

/** Instructor-only anonymous reasons by candidate, after the poll is closed. */
export async function getPracticePollAdminReasons(pollId: string): Promise<PracticePollAnonymousReasons[]> {
  const { data, error } = await getSupabase().rpc("kmove_practice_admin_reasons", {
    p_poll: pollId,
  });
  if (error) throw problem(error, "강사용 선정 이유를 불러오지 못했습니다.");
  if (!Array.isArray(data)) throw new Error("강사용 선정 이유 형식이 올바르지 않습니다.");
  return data as PracticePollAnonymousReasons[];
}

/** Candidate names are always snapshotted by the server from enrolled students. */

/** Returns only the signed-in student's own selection. Never lists other voters. */
export async function getMyPracticePollVote(pollId: string): Promise<number | null> {
  const { data, error } = await getSupabase().rpc("kmove_practice_my_vote", {
    p_poll: pollId,
  });
  if (error) throw problem(error, "내 투표를 확인하지 못했습니다.");
  if (data === null) return null;
  if (!Number.isInteger(data) || data < 1 || data > 100) {
    throw new Error("내 투표 정보가 올바르지 않습니다.");
  }
  return data as number;
}

/** Replace an existing ballot without adding a second vote; only before close. */
export async function changePracticePollVote(
  pollId: string, selectedIndex: number, previousIndex: number, reason: string,
): Promise<boolean> {
  if (!Number.isInteger(selectedIndex) || !Number.isInteger(previousIndex)
      || selectedIndex < 1 || selectedIndex > 100
      || previousIndex < 1 || previousIndex > 100) {
    throw new Error("투표할 수강생 한 명을 선택해 주세요.");
  }
  if (selectedIndex === previousIndex) {
    throw new Error("기존과 다른 수강생을 선택해 주세요.");
  }
  const selectedReason = validatePracticeVoteReason(reason);
  const { data, error } = await getSupabase().rpc("kmove_practice_change_vote_with_reason", {
    p_poll: pollId, p_option: selectedIndex, p_previous: previousIndex, p_reason: selectedReason,
  });
  if (error) throw problem(error, "투표를 변경하지 못했습니다.");
  return data === true;
}

export async function createPracticePoll(
  session: number, question: string,
): Promise<string> {
  const { title } = validateNewPoll(question);
  const { data, error } = await getSupabase().rpc("kmove_practice_create_roster_poll", {
    p_session: session,
    p_question: title,
  });
  if (error || !data) throw problem(error, "수강생 투표를 만들지 못했습니다.");
  return data as string;
}

export async function closePracticePoll(pollId: string): Promise<void> {
  const { data, error } = await getSupabase().rpc("kmove_practice_close_poll", {
    p_poll: pollId,
  });
  if (error || data !== true) throw problem(error, "투표를 마감하지 못했습니다.");
}

export async function publishPracticePollWinner(
  pollId: string, visible: boolean,
): Promise<void> {
  const { data, error } = await getSupabase().rpc("kmove_practice_publish_winner", {
    p_poll: pollId,
    p_visible: visible,
  });
  if (error || data !== true) throw problem(error, "결과 공개 설정에 실패했습니다.");
}

export async function getPracticePollAdminResults(
  pollId: string,
): Promise<PracticePollAdminResults> {
  const { data, error } = await getSupabase().rpc("kmove_practice_admin_results", {
    p_poll: pollId,
  });
  if (error || !data) throw problem(error, "강사용 집계 결과를 불러오지 못했습니다.");
  return data as PracticePollAdminResults;
}
