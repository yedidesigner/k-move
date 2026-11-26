import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, List } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { usePublishedSessions } from "@/lib/published-content";
import { SessionManager } from "@/components/instructor/SessionManager";
import { seoulToday, sessionStatusLabel, weekdayKo } from "@/data/schedule";
import type { ManagedSession } from "@/lib/content-model";
import { PageTitle } from "@/components/lms";
import { SessionCalendar } from "@/components/SessionCalendar";
import { defaultCalendarMonth } from "@/lib/session-calendar";
import { cn } from "@/lib/utils";
import "@/components/session-list.css";

export const Route = createFileRoute("/_app/sessions/")({
  head: () => ({
    meta: [
      { title: "CLASSES | K-Move 미국 디자인 실무 취업 연수과정" },
      { name: "description", content: "Gemini 바이브코딩 24회차 커리큘럼과 전체 수업 일정" },
      { property: "og:title", content: "CLASSES" },
      {
        property: "og:description",
        content: "Gemini 바이브코딩 24회차 커리큘럼과 전체 수업 일정",
      },
    ],
  }),
  component: Sessions,
});

function formatDateCompact(date: string) {
  const [year, month, day] = date.split("-") as [string, string, string];
  return `${year.slice(2)}년 ${Number(month)}월 ${Number(day)}일 (${weekdayKo(date)})`;
}

type ScheduleView = "list" | "calendar";
const VIEW_STORAGE_KEY = "kmove.sessions.view.v1";

function initialView(): ScheduleView {
  try {
    return typeof window !== "undefined" &&
      window.localStorage.getItem(VIEW_STORAGE_KEY) === "calendar"
      ? "calendar"
      : "list";
  } catch {
    return "list";
  }
}

function Sessions() {
  const { status } = useAuth();
  return status === "instructor" ? <SessionManager /> : <StudentSessionSchedule />;
}

export function StudentSessionSchedule() {
  const sessions = usePublishedSessions();
  const today = seoulToday();
  const [view, setView] = useState<ScheduleView>(initialView);
  const [month, setMonth] = useState(() => defaultCalendarMonth(today));
  useEffect(() => {
    const months = [...new Set(sessions.map((session) => session.date.slice(0, 7)))].sort();
    if (!months.includes(month))
      setMonth(
        months.find((item) => item >= today.slice(0, 7)) ?? months.at(-1) ?? today.slice(0, 7),
      );
  }, [sessions, month, today]);

  const changeView = (next: ScheduleView) => {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // The view still works when the browser disables local storage.
    }
  };

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <PageTitle
          title="CLASSES"
          description={`전체 수업 일정과 총 ${sessions.length}회차의 커리큘럼을 확인합니다. 시간은 한국 시간을 기준으로 합니다.`}
        />
        <div
          role="group"
          aria-label="수업 보기 방식"
          className="ml-auto inline-flex shrink-0 border border-border"
        >
          {(
            [
              { value: "list", label: "목록", icon: List },
              { value: "calendar", label: "캘린더", icon: CalendarDays },
            ] as const
          ).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              onClick={() => changeView(value)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 px-4 text-sm transition-colors",
                view === value
                  ? "bg-black text-white"
                  : "bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </header>
      {view === "calendar" ? (
        <SessionCalendar month={month} today={today} onMonthChange={setMonth} sessions={sessions} />
      ) : (
        <SessionList sessions={sessions} today={today} />
      )}
    </>
  );
}

function SessionList({ sessions, today }: { sessions: ManagedSession[]; today: string }) {
  return (
    <ul className="classes-list divide-y divide-border border-y border-border">
      {sessions.map((s) => {
        const isToday = s.date === today;
        const subtitle = s.curriculum?.stage || s.curriculum?.cycle;
        const secondary = isToday ? "text-white/80" : "text-muted-foreground";
        const status = s.progress === "completed" ? "수업 완료" : sessionStatusLabel(s, today);
        return (
          <li key={s.id}>
            <Link
              to="/sessions/$id"
              params={{ id: s.id }}
              className={cn(
                "classes-row group transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
                isToday
                  ? "bg-black text-white hover:bg-neutral-900"
                  : "bg-card text-foreground hover:bg-muted",
              )}
            >
              <span
                aria-label={`${s.number}회차`}
                className="classes-row-number font-semibold leading-none tracking-[-0.035em] tabular-nums"
              >
                {String(s.number).padStart(2, "0")}
              </span>
              <div className="classes-row-title min-w-0">
                <p className="break-keep text-base font-bold leading-snug [overflow-wrap:anywhere]">
                  {s.managed ? s.title : (s.curriculum?.project ?? s.title)}
                </p>
                {subtitle && (
                  <p
                    className={cn(
                      "mt-0.5 break-keep text-xs leading-snug [overflow-wrap:anywhere]",
                      secondary,
                    )}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
              <time
                dateTime={s.date}
                className={cn(
                  "classes-row-date whitespace-nowrap text-xs leading-5 tabular-nums",
                  secondary,
                )}
              >
                {formatDateCompact(s.date)}
              </time>
              <span
                className={cn(
                  "classes-row-status whitespace-nowrap text-right text-xs font-medium",
                  secondary,
                )}
              >
                {status}
              </span>
              <ChevronRight
                aria-hidden="true"
                className="classes-row-chevron justify-self-end transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
