import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CLASS_END, CLASS_START, SESSIONS, formatDateKo, monthKey, seoulToday } from "@/data/schedule";
import { PageHeader, StatusBadge } from "@/components/lms";
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
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => {
          const state = s.date === today ? "today" : s.date < today ? "done" : "upcoming";
          return (
            <li key={s.id}>
              <Link to="/sessions/$id" params={{ id: s.id }} className="block h-full rounded-xl border border-border bg-card p-4 shadow-soft hover:border-primary">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{s.number}회차</span>
                  {state === "today" ? <StatusBadge tone="info">오늘</StatusBadge> : state === "done" ? <StatusBadge>지난 수업</StatusBadge> : <StatusBadge tone="neutral">예정</StatusBadge>}
                </div>
                <p className="mt-2 text-sm">{formatDateKo(s.date)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.title}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
