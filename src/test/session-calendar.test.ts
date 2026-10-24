import { describe, expect, it } from "vitest";
import { SESSIONS } from "@/data/schedule";
import { calendarWeeks, defaultCalendarMonth, SESSION_MONTHS } from "@/lib/session-calendar";

describe("session calendar", () => {
  it("places every existing class on its correct Sunday-first weekday", () => {
    const displayedDates = SESSION_MONTHS.flatMap((month) => {
      const weeks = calendarWeeks(month);
      expect(weeks.every((week) => week.length === 7)).toBe(true);
      return weeks
        .flat()
        .filter((day) => day !== null)
        .map((day) => day.date);
    });
    for (const session of SESSIONS) {
      expect(displayedDates.filter((date) => date === session.date)).toHaveLength(1);
      const weeks = calendarWeeks(session.date.slice(0, 7));
      const weekday = weeks
        .find((week) => week.some((day) => day?.date === session.date))
        ?.findIndex((day) => day?.date === session.date);
      expect(weekday).toBe(new Date(`${session.date}T12:00:00+09:00`).getUTCDay());
    }
  });

  it("aligns the first class and the Thursday/Friday classes without date shifts", () => {
    expect(calendarWeeks("2026-10")[4]?.[0]?.date).toBe("2026-10-25");
    expect(calendarWeeks("2026-12")[4]?.[4]?.date).toBe("2026-12-31");
    expect(calendarWeeks("2027-01")[1]?.[4]?.date).toBe("2027-01-07");
    expect(calendarWeeks("2027-01")[1]?.[5]?.date).toBe("2027-01-08");
    expect(calendarWeeks("2027-02")[2]?.[5]?.date).toBe("2027-02-19");
  });

  it("handles six-week months, leap years, and empty cells at month edges", () => {
    expect(calendarWeeks("2027-01")).toHaveLength(6);
    expect(calendarWeeks("2026-10")[0]?.slice(0, 4)).toEqual([null, null, null, null]);
    expect(calendarWeeks("2026-10").flat().filter(Boolean)).toHaveLength(31);
    expect(calendarWeeks("2028-02").flat().filter(Boolean)).toHaveLength(29);
    expect(calendarWeeks("2027-02").flat().filter(Boolean)).toHaveLength(28);
  });

  it("opens the relevant course month before, during, and after the course", () => {
    expect(defaultCalendarMonth("2026-09-01")).toBe("2026-10");
    expect(defaultCalendarMonth("2026-11-20")).toBe("2026-11");
    expect(defaultCalendarMonth("2027-01-01")).toBe("2027-01");
    expect(defaultCalendarMonth("2027-08-01")).toBe("2027-02");
  });

  it("rejects invalid month keys", () => {
    expect(() => calendarWeeks("2026-13")).toThrow(RangeError);
    expect(() => calendarWeeks("2026-2")).toThrow(RangeError);
  });
});
