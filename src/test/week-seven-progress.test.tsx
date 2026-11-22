import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWeekSevenProgress } from "@/hooks/use-week-seven-progress";
import {
  WEEK_SEVEN_CHECKLIST,
  WEEK_SEVEN_PREPARATION,
  WEEK_SEVEN_STEPS,
} from "@/data/week-seven-practice";

const key = (userId: string) => `kmove:s07-practice:v1:${userId}`;
const record = (activeStep: number, checks: Record<string, boolean>) =>
  JSON.stringify({ schemaVersion: 1, activeStep, checks });

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("session 07 personal practice progress", () => {
  it("loads existing progress without replacing it, and restores later changes after reopening", () => {
    const existing = record(3, { "prep-0": true, "step-2-1": true });
    window.localStorage.setItem(key("student-a"), existing);
    const write = vi.spyOn(Storage.prototype, "setItem");
    const first = renderHook(() => useWeekSevenProgress("student-a"));
    expect(first.result.current.activeStep).toBe(3);
    expect(first.result.current.checks).toEqual({ "prep-0": true, "step-2-1": true });
    expect(write).not.toHaveBeenCalled();

    act(() => {
      first.result.current.setCheck("step-2-1", false);
      first.result.current.setCheck("final-0", true);
      first.result.current.setActiveStep(6);
    });
    first.unmount();
    const reopened = renderHook(() => useWeekSevenProgress("student-a"));
    expect(reopened.result.current.activeStep).toBe(6);
    expect(reopened.result.current.checks).toEqual({
      "prep-0": true,
      "step-2-1": false,
      "final-0": true,
    });
    expect(reopened.result.current.storageState).toBe("saved");
  });

  it("isolates accounts immediately and ignores an event handler retained from the previous account", () => {
    const a = record(2, { "step-1-0": true });
    const b = record(4, { "step-3-0": true });
    window.localStorage.setItem(key("student-a"), a);
    window.localStorage.setItem(key("student-b"), b);
    const { result, rerender } = renderHook(({ userId }) => useWeekSevenProgress(userId), {
      initialProps: { userId: "student-a" as string | null },
    });
    const previousAccountSetter = result.current.setCheck;
    rerender({ userId: "student-b" });
    expect(result.current.activeStep).toBe(4);
    expect(result.current.checks).toEqual({ "step-3-0": true });
    act(() => previousAccountSetter("prep-1", true));
    expect(result.current.checks).toEqual({ "step-3-0": true });
    expect(window.localStorage.getItem(key("student-a"))).toBe(a);
    expect(window.localStorage.getItem(key("student-b"))).toBe(b);

    act(() => result.current.setCheck("step-3-0", false));
    expect(window.localStorage.getItem(key("student-a"))).toBe(a);
    rerender({ userId: "student-a" });
    expect(result.current.activeStep).toBe(2);
    expect(result.current.checks).toEqual({ "step-1-0": true });
    rerender({ userId: null });
    expect(result.current.activeStep).toBe(0);
    expect(result.current.checks).toEqual({});
    expect(result.current.storageState).toBe("session");
  });

  it.each(["{invalid json", "null", "[]", '{"schemaVersion":2,"activeStep":5,"checks":{}}'])(
    "keeps malformed or unsupported records untouched until a user makes a change: %s",
    (raw) => {
      window.localStorage.setItem(key("student-a"), raw);
      const write = vi.spyOn(Storage.prototype, "setItem");
      const { result } = renderHook(() => useWeekSevenProgress("student-a"));
      expect(result.current.activeStep).toBe(0);
      expect(result.current.checks).toEqual({});
      expect(write).not.toHaveBeenCalled();
      expect(window.localStorage.getItem(key("student-a"))).toBe(raw);
      act(() => result.current.setActiveStep(1));
      expect(JSON.parse(window.localStorage.getItem(key("student-a"))!)).toEqual({
        schemaVersion: 1,
        activeStep: 1,
        checks: {},
      });
    },
  );

  it("validates stored values and accepts only check IDs derived from the actual lesson", () => {
    window.localStorage.setItem(
      key("student-a"),
      JSON.stringify({
        schemaVersion: 1,
        activeStep: 80,
        checks: { "prep-0": true, "final-0": "yes", "step-99-0": true, unrelated: true },
      }),
    );
    const { result } = renderHook(() => useWeekSevenProgress("student-a"));
    expect(result.current.activeStep).toBe(0);
    expect(result.current.checks).toEqual({ "prep-0": true });
    const validIds = [
      ...WEEK_SEVEN_PREPARATION.map((_, index) => `prep-${index}`),
      ...WEEK_SEVEN_STEPS.flatMap((step) =>
        step.checks.map((_, index) => `step-${step.number}-${index}`),
      ),
      ...WEEK_SEVEN_CHECKLIST.map((_, index) => `final-${index}`),
    ];
    act(() => {
      validIds.forEach((id) => result.current.setCheck(id, true));
      result.current.setCheck(`prep-${WEEK_SEVEN_PREPARATION.length}`, true);
      result.current.setCheck(`final-${WEEK_SEVEN_CHECKLIST.length}`, true);
      result.current.setCheck("__proto__", true);
    });
    expect(Object.keys(result.current.checks).sort()).toEqual(validIds.sort());
    expect(Object.values(result.current.checks).every(Boolean)).toBe(true);
    act(() => result.current.setActiveStep(90));
    expect(result.current.activeStep).toBe(6);
    act(() => result.current.setActiveStep(-3));
    expect(result.current.activeStep).toBe(0);
    act(() => result.current.setActiveStep(Number.NaN));
    expect(result.current.activeStep).toBe(0);
  });

  it("keeps current work usable and reports unavailable if saving fails", () => {
    const existing = record(1, { "prep-0": true });
    window.localStorage.setItem(key("student-a"), existing);
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage full", "QuotaExceededError");
    });
    const { result } = renderHook(() => useWeekSevenProgress("student-a"));
    act(() => {
      result.current.setCheck("prep-1", true);
      result.current.setActiveStep(2);
    });
    expect(result.current.storageState).toBe("unavailable");
    expect(result.current.activeStep).toBe(2);
    expect(result.current.checks).toEqual({ "prep-0": true, "prep-1": true });
    expect(window.localStorage.getItem(key("student-a"))).toBe(existing);
    write.mockRestore();
    act(() => result.current.setCheck("prep-2", true));
    expect(result.current.storageState).toBe("saved");
    expect(JSON.parse(window.localStorage.getItem(key("student-a"))!).activeStep).toBe(2);
  });

  it("does not overwrite an unreadable account record and still supports session changes", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage blocked", "SecurityError");
    });
    const write = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => useWeekSevenProgress("student-a"));
    expect(result.current.storageState).toBe("unavailable");
    act(() => {
      result.current.setActiveStep(3);
      result.current.setCheck("step-3-0", true);
    });
    expect(result.current.activeStep).toBe(3);
    expect(result.current.checks["step-3-0"]).toBe(true);
    expect(result.current.storageState).toBe("unavailable");
    expect(write).not.toHaveBeenCalled();
  });

  it("never reads or writes browser storage without a user ID", () => {
    const read = vi.spyOn(Storage.prototype, "getItem");
    const write = vi.spyOn(Storage.prototype, "setItem");
    const { result, unmount } = renderHook(() => useWeekSevenProgress(null));
    act(() => {
      result.current.setCheck("prep-0", true);
      result.current.setActiveStep(1);
    });
    expect(result.current.checks["prep-0"]).toBe(true);
    expect(result.current.storageState).toBe("session");
    expect(read).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
    unmount();
    const reopened = renderHook(() => useWeekSevenProgress(null));
    expect(reopened.result.current.activeStep).toBe(0);
    expect(reopened.result.current.checks).toEqual({});
  });
});
