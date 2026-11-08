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

export async function voteInPracticePoll(pollId: string, selectedIndex: number): Promise<boolean> {
  if (!Number.isInteger(selectedIndex) || selectedIndex < 1 || selectedIndex > 100)
    throw new Error("올바른 항목을 선택해 주세요.");
  const { data, error } = await getSupabase().rpc("kmove_practice_cast_vote", {
    p_poll: pollId,
    p_option: selectedIndex,
  });
  if (error) throw problem(error, "투표를 완료하지 못했습니다.");
  return data === true;
}

/** Candidate names are always snapshotted by the server from enrolled students. */
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
