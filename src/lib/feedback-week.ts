import { SESSIONS, seoulToday } from "@/data/schedule";

/** Feedback week IDs follow scheduled class numbers, including twice-weekly classes. */
export function currentFeedbackWeek(now: Date = new Date()): number {
  const today = seoulToday(now);
  return SESSIONS.reduce((current, session) => session.date <= today ? session.number : current,
    SESSIONS[0]?.number ?? 1);
}
