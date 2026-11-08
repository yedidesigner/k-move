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

export function validateNewPoll(question: string, options: string[]) {
  const title = question.trim();
  const choices = options.map(item => item.trim());
  if (title.length < 4 || title.length > 180)
    throw new Error("질문은 4~180자로 작성해 주세요.");
  if (choices.length < 2 || choices.length > 8)
    throw new Error("투표 항목은 2~8개 작성해 주세요.");
  if (choices.some(choice => !choice || choice.length > 120))
    throw new Error("각 항목은 1~120자로 작성해 주세요.");
  if (new Set(choices.map(choice => choice.toLocaleLowerCase("ko-KR"))).size !== choices.length)
    throw new Error("같은 항목은 두 번 넣을 수 없습니다.");
  return { title, choices };
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
  if (!Number.isInteger(selectedIndex) || selectedIndex < 1 || selectedIndex > 8)
    throw new Error("올바른 항목을 선택해 주세요.");
  const { data, error } = await getSupabase().rpc("kmove_practice_cast_vote", {
    p_poll: pollId,
    p_option: selectedIndex,
  });
  if (error) throw problem(error, "투표를 완료하지 못했습니다.");
  return data === true;
}

export async function createPracticePoll(
  session: number, question: string, options: string[],
): Promise<string> {
  const { title, choices } = validateNewPoll(question, options);
  const { data, error } = await getSupabase().rpc("kmove_practice_create_poll", {
    p_session: session,
    p_question: title,
    p_options: choices,
  });
  if (error || !data) throw problem(error, "투표를 만들지 못했습니다.");
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
