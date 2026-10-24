import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, List } from "lucide-react";
import { useState } from "react";
import {
  CLASS_END,
  CLASS_START,
  SESSIONS,
  TIME_ZONE,
  seoulToday,
  weekdayKo,
} from "@/data/schedule";
import { SessionCalendar } from "@/components/SessionCalendar";
import { defaultCalendarMonth } from "@/lib/session-calendar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/sessions/")({
  head: () => ({
    meta: [
      { title: "CURRICULUM | K-Move 미국 디자인 실무 취업 연수과정" },
      { name: "description", content: "24회차 수업 일정" },
      { property: "og:title", content: "CURRICULUM" },
      { property: "og:description", content: "24회차 수업 일정" },
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
  const today = seoulToday();
  const [view, setView] = useState<ScheduleView>(initialView);
  const [month, setMonth] = useState(() => defaultCalendarMonth(today));

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
            총 {SESSIONS.length}회차 · 매회 {CLASS_START}~{CLASS_END} (한국 시간)
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
      {view === "calendar" ? (
        <SessionCalendar month={month} today={today} onMonthChange={setMonth} />
      ) : (
        <SessionList today={today} />
      )}
    </>
  );
}

function SessionList({ today }: { today: string }) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {SESSIONS.map((s) => {
        const state = s.date === today ? "today" : s.date < today ? "done" : "upcoming";
        return (
          <li key={s.id}>
            <Link
              to="/sessions/$id"
              params={{ id: s.id }}
              className={cn(
                "group relative grid min-h-24 grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-3 px-3 py-4 transition duration-200 ease-out hover:z-10 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary motion-safe:hover:scale-[1.015] motion-safe:focus-visible:scale-[1.015] motion-reduce:transition-none sm:grid-cols-[6rem_minmax(0,1fr)_auto_1.25rem] sm:gap-x-5 sm:px-7",
                state === "today"
                  ? "bg-black text-white hover:bg-neutral-900"
                  : "bg-card text-foreground hover:bg-muted",
              )}
            >
              <span className="text-[3.6288rem] font-semibold leading-none tracking-[-0.0325em] tabular-nums sm:text-[4.536rem]">
                {String(s.number).padStart(2, "0")}
              </span>
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-5 gap-y-1">
                <p className="text-base font-bold leading-snug">{s.title}</p>
                <time
                  dateTime={s.date}
                  className={cn(
                    "whitespace-nowrap text-[0.675rem] leading-relaxed tabular-nums",
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
                {state === "today" ? "오늘" : state === "done" ? "수업 완료" : "준비중"}
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
