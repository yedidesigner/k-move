import { SESSIONS } from "@/data/schedule";

export const SESSION_MONTHS = [
  ...new Set(SESSIONS.map((session) => session.date.slice(0, 7))),
].sort();

export interface CalendarDay {
  date: string;
  number: number;
}

export function defaultCalendarMonth(today: string): string {
  const month = today.slice(0, 7);
  return SESSION_MONTHS.find((candidate) => candidate >= month) ?? SESSION_MONTHS.at(-1) ?? month;
}

/** Sunday-first Gregorian weeks. UTC arithmetic avoids browser-time-zone shifts. */
export function calendarWeeks(month: string): (CalendarDay | null)[][] {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new RangeError("Expected a month in YYYY-MM format");
  }
  const [year, monthNumber] = month.split("-").map(Number) as [number, number];
  const offset = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return Array.from({ length: Math.ceil((offset + days) / 7) }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const number = week * 7 + weekday - offset + 1;
      return number < 1 || number > days
        ? null
        : { date: `${month}-${String(number).padStart(2, "0")}`, number };
    }),
  );
}
