import { useCallback, useEffect, useState } from "react";
import {
  WEEK_SEVEN_CHECKLIST,
  WEEK_SEVEN_PREPARATION,
  WEEK_SEVEN_STEPS,
} from "@/data/week-seven-practice";

export type WeekSevenStorageState = "saved" | "session" | "unavailable";

interface ProgressState {
  key: string | null;
  activeStep: number;
  checks: Record<string, boolean>;
  storageState: WeekSevenStorageState;
  dirty: boolean;
  readable: boolean;
}

const allowedCheckIds = new Set([
  ...WEEK_SEVEN_PREPARATION.map((_, index) => `prep-${index}`),
  ...WEEK_SEVEN_STEPS.flatMap((step) =>
    step.checks.map((_, index) => `step-${step.number}-${index}`),
  ),
  ...WEEK_SEVEN_CHECKLIST.map((_, index) => `final-${index}`),
]);

function emptyState(key: string | null): ProgressState {
  return {
    key,
    activeStep: 0,
    checks: {},
    storageState: key ? "saved" : "session",
    dirty: false,
    readable: true,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readProgress(key: string | null): ProgressState {
  const fallback = emptyState(key);
  if (!key) return fallback;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return { ...fallback, storageState: "unavailable", readable: false };
  }
  if (!raw) return fallback;

  // Invalid or future records are not overwritten just by opening the lesson.
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value["schemaVersion"] !== 1) return fallback;
    const activeStep = value["activeStep"];
    const checks: Record<string, boolean> = {};
    if (isRecord(value["checks"])) {
      for (const [id, checked] of Object.entries(value["checks"])) {
        if (allowedCheckIds.has(id) && typeof checked === "boolean") checks[id] = checked;
      }
    }
    return {
      ...fallback,
      activeStep:
        typeof activeStep === "number" &&
        Number.isInteger(activeStep) &&
        activeStep >= 0 &&
        activeStep <= 6
          ? activeStep
          : 0,
      checks,
    };
  } catch {
    return fallback;
  }
}

function boundedStep(step: number): number {
  return Number.isFinite(step) ? Math.max(0, Math.min(6, Math.trunc(step))) : 0;
}

export function useWeekSevenProgress(userId: string | null) {
  const key = userId ? `kmove:s07-practice:v1:${userId}` : null;
  const [state, setState] = useState<ProgressState>(() => readProgress(key));

  // Reset during render, before children receive another account's progress.
  // The caller also keys the workbook by user ID; this guards direct hook reuse.
  const current = state.key === key ? state : readProgress(key);
  if (state.key !== key) setState(current);

  useEffect(() => {
    if (!state.dirty || state.key !== key) return;
    let storageState: WeekSevenStorageState = key ? "unavailable" : "session";
    if (key && state.readable) {
      try {
        window.localStorage.setItem(
          key,
          JSON.stringify({ schemaVersion: 1, activeStep: state.activeStep, checks: state.checks }),
        );
        storageState = "saved";
      } catch {
        // Keep current work in memory when quota or browser policy prevents saving.
      }
    }
    setState((latest) => (latest === state ? { ...latest, dirty: false, storageState } : latest));
  }, [key, state]);

  const setActiveStep = useCallback(
    (step: number) => {
      const activeStep = boundedStep(step);
      setState((latest) =>
        latest.key !== key || latest.activeStep === activeStep
          ? latest
          : { ...latest, activeStep, dirty: true },
      );
    },
    [key],
  );

  const setCheck = useCallback(
    (id: string, checked: boolean) => {
      if (!allowedCheckIds.has(id) || typeof checked !== "boolean") return;
      setState((latest) =>
        latest.key !== key || latest.checks[id] === checked
          ? latest
          : { ...latest, checks: { ...latest.checks, [id]: checked }, dirty: true },
      );
    },
    [key],
  );

  return {
    activeStep: current.activeStep,
    checks: current.checks,
    setActiveStep,
    setCheck,
    storageState: current.storageState,
  };
}
