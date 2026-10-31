import { CURRICULUM_LESSONS, type CurriculumLesson } from "./curriculum";

export const SITE_NAME = "K-Move 미국 디자인 실무 취업 연수과정";
export const COURSE_NAME = "Google AI를 활용한 포트폴리오 제작";
export const COURSE_ID = "kmove-us-design-2026";
export const TIME_ZONE = "Asia/Seoul";
export const CLASS_START = "10:00";
export const CLASS_END = "18:30";

export interface Session {
  id: string;
  number: number;
  date: string; // YYYY-MM-DD, Asia/Seoul
  title: string;
  detailsPublished: boolean;
  curriculum: CurriculumLesson | null;
}

const DATES = [
  "2026-10-25",
  "2026-11-01",
  "2026-11-08",
  "2026-11-15",
  "2026-11-22",
  "2026-11-29",
  "2026-12-06",
  "2026-12-13",
  "2026-12-20",
  "2026-12-31",
  "2027-01-07",
  "2027-01-08",
  "2027-01-14",
  "2027-01-15",
  "2027-01-21",
  "2027-01-22",
  "2027-01-28",
  "2027-01-29",
  "2027-02-04",
  "2027-02-05",
  "2027-02-11",
  "2027-02-12",
  "2027-02-18",
  "2027-02-19",
];

// The source describes 19 curriculum sessions, but does not specify dates.
// Attach them by session number and keep all 24 existing dates and IDs intact.
const curriculumByNumber = new Map(CURRICULUM_LESSONS.map((lesson) => [lesson.number, lesson]));

export const SESSIONS: Session[] = DATES.map((date, i) => {
  const curriculum = curriculumByNumber.get(i + 1) ?? null;
  return {
    id: `S${String(i + 1).padStart(2, "0")}`,
    number: i + 1,
    date,
    title: curriculum?.title ?? "수업 주제 준비 중",
    detailsPublished: curriculum !== null,
    curriculum,
  };
});

export function sessionStatusLabel(session: Session, today: string): string {
  if (session.date === today) return "오늘";
  if (session.date < today) return "수업 완료";
  return session.detailsPublished ? "수업 예정" : "준비중";
}

/** Weekday (ko, short) computed in Asia/Seoul from the date string. */
export function weekdayKo(date: string): string {
  return new Intl.DateTimeFormat("ko-KR", { weekday: "short", timeZone: TIME_ZONE }).format(
    new Date(`${date}T12:00:00+09:00`),
  );
}

export function formatDateKo(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일 (${weekdayKo(date)})`;
}

export function seoulToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

/** Today's session if any, else the next upcoming one, else null. */
export function currentOrNextSession(now: Date = new Date()) {
  const today = seoulToday(now);
  const s = SESSIONS.find((x) => x.date >= today) ?? null;
  return s ? { session: s, isToday: s.date === today } : null;
}

export function monthKey(date: string) {
  return date.slice(0, 7);
}
