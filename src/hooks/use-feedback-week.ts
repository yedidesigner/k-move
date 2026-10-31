import { useEffect, useRef, useState } from "react";
import { currentFeedbackWeek } from "@/lib/feedback-week";
import { currentPublishedSession } from "@/lib/content-model";
import { usePublishedSessions } from "@/lib/published-content";
import { seoulToday } from "@/data/schedule";

export function useFeedbackWeek() {
  const sessions = usePublishedSessions();
  const [week, setSelectedWeek] = useState(() => currentPublishedSession(sessions, seoulToday()));
  const [currentWeek, setCurrentWeek] = useState(() =>
    currentPublishedSession(sessions, seoulToday()),
  );
  const chosen = useRef(false);
  const hydrated = useRef(false);
  function setWeek(value: number) {
    chosen.current = true;
    setSelectedWeek(value);
  }

  useEffect(() => {
    const refreshCurrent = () => setCurrentWeek(currentPublishedSession(sessions, seoulToday()));
    refreshCurrent();
    if (!hydrated.current && !chosen.current) {
      hydrated.current = true;
      setSelectedWeek(currentPublishedSession(sessions, seoulToday()));
    }
    const timer = window.setInterval(refreshCurrent, 60_000);
    window.addEventListener("focus", refreshCurrent);
    document.addEventListener("visibilitychange", refreshCurrent);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshCurrent);
      document.removeEventListener("visibilitychange", refreshCurrent);
    };
  }, [sessions]);

  function goToCurrentWeek() {
    const current = currentPublishedSession(sessions, seoulToday());
    setCurrentWeek(current);
    setWeek(current);
  }

  // Date refreshes update the recommendation, never unmount an in-progress submission.
  return { week, setWeek, currentWeek, goToCurrentWeek };
}
