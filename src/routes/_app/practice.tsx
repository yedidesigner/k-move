import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, MessageSquare } from "lucide-react";
import { PracticeRoom } from "@/components/PracticeRoom";
import { usePublishedContent } from "@/lib/published-content";
import { currentPublishedSession } from "@/lib/content-model";
import { formatDateKo, seoulToday } from "@/data/schedule";

export const Route = createFileRoute("/_app/practice")({
  validateSearch: (search: Record<string, unknown>): { session?: number } => {
    const session = Number(search["session"]);
    return Number.isInteger(session) && session >= 1 && session <= 24 ? { session } : {};
  },
  head: () => ({ meta: [{ title: "실습 공유 | K-Move LMS" }, { name: "robots", content: "noindex" }] }),
  component: PracticePage,
});

function PracticePage() {
  const { sessions } = usePublishedContent();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  // Keep the active room stable while the learner writes, including across midnight.
  const [defaultSession] = useState(() => currentPublishedSession(sessions, seoulToday()));
  const selected = sessions.find((item) => item.number === (search.session ?? defaultSession)) ?? sessions[0]!;
  const today = seoulToday();
  const current = currentPublishedSession(sessions, today);
  async function chooseSession(session: number) {
    if (session === selected.number) return;
    await navigate({ search: { session } });
  }
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
            <MessageSquare className="size-4" aria-hidden /> CLASSROOM
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">실습 공유</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">수업에서 만든 결과물과 질문을 나누고, 회차별로 다시 찾아보세요.</p>
        </div>
        <Link to="/sessions/$id" params={{ id: selected.id }} className="inline-flex min-h-11 items-center gap-2 border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50">
          {selected.number}회차 수업 보기 <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </header>
      <div className="mb-4 flex flex-wrap items-center gap-3 border-y border-neutral-200 py-4">
        <label htmlFor="practice-session" className="text-sm font-semibold">회차 선택</label>
        <select id="practice-session" value={selected.number} onChange={(event) => {
          const next = Number(event.target.value);
          // The room changes only after its draft guard allows navigation.
          event.target.value = String(selected.number);
          void chooseSession(next);
        }}
          className="min-h-11 min-w-0 max-w-full flex-1 border border-neutral-300 bg-white px-3 text-sm sm:max-w-md">
          {sessions.map((session) => <option key={session.id} value={session.number}>
            {String(session.number).padStart(2, "0")}회차 · {session.date.slice(5).replace("-", ".")} · {session.title}
          </option>)}
        </select>
        <button type="button" onClick={() => void chooseSession(current)} className="min-h-11 px-3 text-sm font-medium underline underline-offset-4">
          {sessions.find((session) => session.number === current)?.date === today ? "오늘 수업" : "최근 수업"}
        </button>
        <p className="w-full text-xs text-neutral-500 sm:ml-auto sm:w-auto">{formatDateKo(selected.date)}</p>
      </div>
      <PracticeRoom key={selected.id} sessionNumber={selected.number} />
    </div>
  );
}
