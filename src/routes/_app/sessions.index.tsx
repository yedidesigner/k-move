import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { CLASS_END, CLASS_START, SESSIONS, monthKey, seoulToday, weekdayKo } from "@/data/schedule";
import { PageHeader } from "@/components/lms";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/sessions/")({
  head: () => ({
    meta: [
      { title: "전체 수업 | K-Move 미국 디자인 실무 취업 연수과정" },
      { name: "description", content: "24회차 수업 일정" },
      { property: "og:title", content: "전체 수업" },
      { property: "og:description", content: "24회차 수업 일정" },
    ],
  }),
  component: Sessions,
});

const MONTHS = Array.from(new Set(SESSIONS.map((s) => monthKey(s.date))));

function formatDateCompact(date: string) {
  const [year, month, day] = date.split("-");
  return `${year.slice(2)}.${month}.${day} ${weekdayKo(date)}`;
}

function Sessions() {
  const [month, setMonth] = useState<string | null>(null);
  const today = seoulToday();
  const list = month ? SESSIONS.filter((s) => monthKey(s.date) === month) : SESSIONS;
  const chip = (on: boolean) =>
    cn("min-h-10 rounded-full border px-4 text-sm font-medium", on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted");
  return (
    <>
      <PageHeader title="전체 수업" description={`총 24회차 · 매회 ${CLASS_START}~${CLASS_END} (한국 시간)`} />
      <div role="group" aria-label="월별 필터" className="mb-5 flex flex-wrap gap-2">
        <button className={chip(!month)} aria-pressed={!month} onClick={() => setMonth(null)}>전체</button>
        {MONTHS.map((m) => (
          <button key={m} className={chip(month === m)} aria-pressed={month === m} onClick={() => setMonth(m)}>
            {m.slice(0, 4)}년 {Number(m.slice(5))}월
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {list.map((s) => {
          const state = s.date === today ? "today" : s.date < today ? "done" : "upcoming";
          return (
            <li key={s.id}>
              <Link
                to="/sessions/$id"
                params={{ id: s.id }}
                className={cn(
                  "group grid min-h-24 grid-cols-[2.75rem_1fr_auto] items-center gap-x-4 rounded-2xl border bg-card px-4 py-5 transition-colors hover:border-foreground/40 sm:grid-cols-[4rem_1fr_auto_1.5rem] sm:px-7",
                  state === "today" ? "border-2 border-foreground" : "border-border",
                )}
              >
                <span className="self-start pt-0.5 text-sm font-medium tabular-nums text-muted-foreground sm:self-auto sm:text-base">
                  {String(s.number).padStart(2, "0")}
                </span>
                <div className="min-w-0 sm:flex sm:items-baseline sm:gap-4">
                  <p className="truncate text-base font-bold text-foreground sm:text-xl">
                    {s.number}회차 · {s.title}
                  </p>
                  <p className="mt-1 shrink-0 text-sm tabular-nums text-muted-foreground sm:mt-0 sm:text-lg">
                    {formatDateCompact(s.date)}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-medium sm:text-sm",
                    state === "today" ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                  )}
                >
                  {state === "today" ? "오늘" : state === "done" ? "수업 완료" : "준비중"}
                </span>
                <ChevronRight aria-hidden className="hidden h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:block" />
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
