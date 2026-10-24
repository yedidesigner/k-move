import { describe, expect, it } from "vitest";
import { SESSIONS, weekdayKo, currentOrNextSession } from "@/data/schedule";

describe("schedule", () => {
  it("has 24 sessions in order", () => {
    expect(SESSIONS).toHaveLength(24);
    expect(SESSIONS[0]).toMatchObject({ id: "S01", date: "2026-10-25" });
    expect(SESSIONS[23]).toMatchObject({ id: "S24", date: "2027-02-19" });
  });
  it("computes weekdays in Seoul", () => {
    expect(weekdayKo("2026-10-25")).toBe("일");
    expect(weekdayKo("2026-12-31")).toBe("목");
    expect(weekdayKo("2027-01-08")).toBe("금");
  });
  it("picks today's session in Seoul time", () => {
    // 2026-10-25 01:00 KST == 2026-10-24 16:00 UTC
    const r = currentOrNextSession(new Date("2026-10-24T16:00:00Z"));
    expect(r?.session.id).toBe("S01");
    expect(r?.isToday).toBe(true);
  });
});
