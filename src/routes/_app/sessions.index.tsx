import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import {
  CLASS_END,
  CLASS_START,
  SESSIONS,
  TIME_ZONE,
  seoulToday,
  weekdayKo,
} from "@/data/schedule";
import { PageHeader } from "@/components/lms";
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
  const [year, month, day] = date.split("-");
  const weekday = weekdayEn.format(new Date(`${date}T12:00:00+09:00`));
  return `${year.slice(2)}년 ${Number(month)}월 ${day} ${weekday}(${weekdayKo(date)})`;
}

function Sessions() {
  const today = seoulToday();
  return (
    <>
      <PageHeader
        title="CURRICULUM"
        description={`총 ${SESSIONS.length}회차 · 매회 ${CLASS_START}~${CLASS_END} (한국 시간)`}
      />
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
    </>
  );
}
