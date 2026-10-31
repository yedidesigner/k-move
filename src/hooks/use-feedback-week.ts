import { useEffect, useState } from "react";
import { currentFeedbackWeek } from "@/lib/feedback-week";

export function useFeedbackWeek() {
  const [week, setWeek] = useState(currentFeedbackWeek);
  const [currentWeek, setCurrentWeek] = useState(currentFeedbackWeek);

  useEffect(() => {
    const refreshCurrent = () => setCurrentWeek(currentFeedbackWeek());
    const timer = window.setInterval(refreshCurrent, 60_000);
    window.addEventListener("focus", refreshCurrent);
    document.addEventListener("visibilitychange", refreshCurrent);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshCurrent);
      document.removeEventListener("visibilitychange", refreshCurrent);
    };
  }, []);

  function goToCurrentWeek() {
    const current = currentFeedbackWeek();
    setCurrentWeek(current);
    setWeek(current);
  }

  // Date refreshes update the recommendation, never unmount an in-progress submission.
  return { week, setWeek, currentWeek, goToCurrentWeek };
}
