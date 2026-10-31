import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, List } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { usePublishedSessions } from "@/lib/published-content";
import { SessionManager } from "@/components/instructor/SessionManager";
import {
  CLASS_END,
  CLASS_START,
  SESSIONS,
  TIME_ZONE,
  seoulToday,
  sessionStatusLabel,
  weekdayKo,
} from "@/data/schedule";
import { CURRICULUM_OVERVIEW } from "@/data/curriculum";
import { SessionCalendar } from "@/components/SessionCalendar";
import { defaultCalendarMonth } from "@/lib/session-calendar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/sessions/")({
  head: () => ({
    meta: [
      { title: "CURRICULUM | K-Move 미국 디자인 실무 취업 연수과정" },
      { name: "description", content: "Gemini 바이브코딩 24회차 커리큘럼과 전체 수업 일정" },
      { property: "og:title", content: "CURRICULUM" },
      {
        property: "og:description",
        content: "Gemini 바이브코딩 24회차 커리큘럼과 전체 수업 일정",
      },
    ],
  }),
  component: Sessions,
});

const weekdayEn = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: TIME_ZONE });

function formatDateCompact(date: string) {
  const [year, month, day] = date.split("-") as [string, string, string];
  const weekday = weekdayEn.format(new Date(`${date}T12:00:00+09:00`));
  return `${year.slice(2)}년 ${Number(month)}월 ${day} ${weekday}(${weekdayKo(date)})`;
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            CURRICULUM
          </h1>
          <p className="mt-1.5 text-base text-muted-foreground">
            총 {sessions.length}회차 · 회차별 일정 확인 (한국 시간)
          </p>
        </div>
        <div role="group" aria-label="수업 보기 방식" className="inline-flex border border-border">
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
      <section
        aria-labelledby="curriculum-overview-title"
        className="mb-6 border border-border bg-card px-5 py-5 sm:px-6"
      >
        <p className="text-xs font-semibold text-muted-foreground">
          {SESSIONS.length}회차 과정 · 2주 = 1사이클 (생각하는 주 + 만드는 주)
        </p>
        <h2
          id="curriculum-overview-title"
          className="mt-2 text-lg font-bold tracking-tight sm:text-xl"
        >
          {CURRICULUM_OVERVIEW.title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {CURRICULUM_OVERVIEW.subtitle}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {CURRICULUM_OVERVIEW.phases.map((phase) => `${phase.range} ${phase.label}`).join(" · ")}
        </p>
      </section>
      {view === "calendar" ? (
        <SessionCalendar month={month} today={today} onMonthChange={setMonth} sessions={sessions} />
      ) : (
        <SessionList today={today} />
      )}
    </>
  );
}

function SessionList({ today }: { today: string }) {
  const sessions = usePublishedSessions();
  return (
    <ul className="divide-y divide-border border-y border-border">
      {sessions.map((s) => {
        const state = s.date === today ? "today" : s.date < today ? "done" : "upcoming";
        return (
          <li key={s.id}>
            <Link
              to="/sessions/$id"
              params={{ id: s.id }}
              className={cn(
                "group relative grid min-h-24 grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-3 px-3 py-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:grid-cols-[6rem_minmax(0,1fr)_auto_1.25rem] sm:gap-x-5 sm:px-7",
                state === "today"
                  ? "bg-black text-white hover:bg-neutral-900"
                  : "bg-card text-foreground hover:bg-muted",
              )}
            >
              <span className="text-[3.6288rem] font-semibold leading-none tracking-[-0.0325em] tabular-nums sm:text-[4.536rem]">
                {String(s.number).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <p className="break-keep text-base font-bold leading-snug [overflow-wrap:anywhere]">
                  {s.managed ? s.title : (s.curriculum?.project ?? s.title)}
                </p>
                {s.curriculum?.stage && (
                  <p
                    className={cn(
                      "mt-1 break-keep text-sm leading-relaxed [overflow-wrap:anywhere]",
                      state === "today" ? "text-white/90" : "text-foreground/80",
                    )}
                  >
                    {s.curriculum.stage}
                  </p>
                )}
                {s.curriculum && (
                  <p
                    className={cn(
                      "mt-1 text-xs leading-relaxed",
                      state === "today" ? "text-white/70" : "text-muted-foreground",
                    )}
                  >
                    {s.curriculum.cycle}
                  </p>
                )}
                <time
                  dateTime={s.date}
                  className={cn(
                    "mt-1 block text-[0.675rem] leading-relaxed tabular-nums",
                    state === "today" ? "text-white/80" : "text-muted-foreground",
                  )}
                >
                  {formatDateCompact(s.date)}
                </time>
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-xs font-medium sm:text-sm",
                  state === "today" ? "text-white" : "text-muted-foreground",
                )}
              >
                {s.progress === "completed"
                  ? "진행 완료"
                  : s.date < today
                    ? "일정 경과"
                    : sessionStatusLabel(s, today)}
              </span>
              <ChevronRight
                aria-hidden
                className="hidden h-5 w-5 transition-transform group-hover:translate-x-0.5 sm:block"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
