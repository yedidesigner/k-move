import { ArrowUpRight, ChevronRight } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CLASS_END,
  CLASS_START,
  COURSE_NAME,
  currentOrNextSession,
  formatDateKo,
} from "@/data/schedule";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "홈 | K-Move 미국 디자인 실무 취업 연수과정" },
      { name: "description", content: "오늘의 수업, 공지, 디자인 용어와 학습자료를 확인하세요." },
      { property: "og:title", content: "K-Move 미국 디자인 실무 취업 연수과정" },
      { property: "og:description", content: "Google AI를 활용한 포트폴리오 제작 수강생 포털" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const cur = currentOrNextSession();
  return (
    <>
      <header className="mb-6 flex items-baseline gap-4">
        <h1 className="shrink-0 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          HOME
        </h1>
        <p className="min-w-0 text-base text-muted-foreground">{COURSE_NAME}</p>
      </header>
      <section aria-labelledby="home-notice-title" className="mb-8">
        <h2 id="home-notice-title" className="mb-3 text-lg font-bold">
          공지
        </h2>
        <div className="border-y border-border bg-card px-5 py-4 sm:px-6">
          <p className="text-base font-semibold text-foreground">등록된 공지가 없습니다</p>
          <p className="mt-1 text-sm text-muted-foreground">공지가 등록되면 이곳에 표시됩니다.</p>
        </div>
      </section>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="@container border-y border-border bg-card px-6 py-7 text-foreground sm:px-8 sm:py-8">
          {cur ? (
            <>
              <p className="text-xs font-semibold tracking-wide">
                {cur.isToday ? "오늘의 수업" : "다음 수업"}
              </p>
              <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-4 @min-[28rem]:grid-cols-[auto_minmax(0,1fr)_auto] @min-[28rem]:gap-x-6">
                <span
                  aria-label={`${cur.session.number}회차`}
                  className="text-6xl font-semibold leading-none tracking-[-0.0325em] tabular-nums sm:text-7xl"
                >
                  {String(cur.session.number).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">{cur.session.title}</h2>
                  <div className="mt-2 text-sm">
                    <p>{formatDateKo(cur.session.date)}</p>
                    <p className="mt-1">
                      {CLASS_START} ~ {CLASS_END} (한국 시간)
                    </p>
                  </div>
                </div>
                <Link
                  to="/sessions/$id"
                  params={{ id: cur.session.id }}
                  className="relative -left-[6px] col-start-2 inline-flex min-h-11 w-fit items-center gap-8 whitespace-nowrap border border-foreground/50 px-4 text-sm font-semibold transition-colors hover:bg-foreground hover:text-card focus-visible:outline-foreground @min-[28rem]:col-start-auto"
                >
                  회차 보기 <ChevronRight aria-hidden className="size-4" />
                </Link>
              </div>
            </>
          ) : (
            <p>모든 회차가 종료되었습니다.</p>
          )}
        </section>
        <div className="grid divide-y divide-border border-y border-border bg-card">
          <Link
            to="/glossary"
            className="group flex min-h-28 items-center justify-between gap-4 px-6 py-6 transition-colors hover:bg-muted"
          >
            <span>
              <span className="block text-xs text-muted-foreground">개념·예시·실습</span>
              <span className="mt-2 block text-lg font-semibold">용어집</span>
            </span>
            <ArrowUpRight aria-hidden className="size-5 shrink-0" />
          </Link>
          <Link
            to="/materials"
            className="group flex min-h-28 items-center justify-between gap-4 px-6 py-6 transition-colors hover:bg-muted"
          >
            <span>
              <span className="block text-xs text-muted-foreground">주제별로 이어 배우기</span>
              <span className="mt-2 block text-lg font-semibold">학습자료</span>
            </span>
            <ArrowUpRight aria-hidden className="size-5 shrink-0" />
          </Link>
          <Link
            to="/assignments"
            className="group flex min-h-28 items-center justify-between gap-4 px-6 py-6 transition-colors hover:bg-muted"
          >
            <span>
              <span className="block text-xs text-muted-foreground">과제 바로가기</span>
              <span className="mt-2 block text-lg font-semibold">과제</span>
            </span>
            <ArrowUpRight aria-hidden className="size-5 shrink-0" />
          </Link>
        </div>
      </div>
    </>
  );
}
