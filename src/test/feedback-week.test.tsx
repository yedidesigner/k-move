import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { currentFeedbackWeek } from "@/lib/feedback-week";
import { useFeedbackWeek } from "@/hooks/use-feedback-week";

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("scheduled feedback week", () => {
  it.each([
    ["2026-10-01T12:00:00+09:00", 1],
    ["2026-10-25T00:00:00+09:00", 1],
    ["2026-10-31T14:59:59Z", 1],
    ["2026-10-31T15:00:00Z", 2],
    ["2026-11-01T03:00:00+09:00", 2],
    ["2026-11-07T23:59:59+09:00", 2],
    ["2026-11-08T00:00:00+09:00", 3],
    ["2026-12-30T12:00:00+09:00", 9],
    ["2026-12-31T00:00:00+09:00", 10],
    ["2027-01-07T12:00:00+09:00", 11],
    ["2027-01-08T00:00:00+09:00", 12],
    ["2027-03-01T12:00:00+09:00", 24],
  ])("%s selects scheduled class %s", (date, expected) => {
    expect(currentFeedbackWeek(new Date(date))).toBe(expected);
  });

  it("opens on the current class and preserves a manually selected earlier class", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T12:00:00+09:00"));
    const { result } = renderHook(useFeedbackWeek);
    expect(result.current.week).toBe(2);
    act(() => result.current.setWeek(1));
    act(() => {
      vi.setSystemTime(new Date("2026-11-08T12:00:00+09:00"));
      window.dispatchEvent(new Event("focus"));
    });
    expect(result.current.currentWeek).toBe(3);
    expect(result.current.week).toBe(1);
    act(() => result.current.goToCurrentWeek());
    expect(result.current.week).toBe(3);
  });

  it("refreshes the current-date shortcut without discarding a mounted workspace at midnight", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-07T23:59:30+09:00"));
    const { result } = renderHook(useFeedbackWeek);
    expect(result.current.week).toBe(2);
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.currentWeek).toBe(3);
    expect(result.current.week).toBe(2);
    act(() => result.current.goToCurrentWeek());
    expect(result.current.week).toBe(3);
  });
});
