import { createFileRoute, Link } from "@tanstack/react-router";
import { CLASS_END, CLASS_START, COURSE_NAME, currentOrNextSession, formatDateKo } from "@/data/schedule";
import { EmptyState, PageHeader, Panel, StatusBadge } from "@/components/lms";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "홈 | K-Move 미국 디자인 실무 취업 연수과정" },
      { name: "description", content: "오늘의 수업, 공지, 수업자료와 과제를 확인하세요." },
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
      <PageHeader title="홈" description={COURSE_NAME} />
      <div className="grid gap-4 md:grid-cols-3">
        <Panel className="md:col-span-2">
          {cur ? (
            <>
              <StatusBadge tone={cur.isToday ? "info" : "neutral"}>{cur.isToday ? "오늘의 수업" : "다음 수업"}</StatusBadge>
              <p className="mt-3 text-2xl font-bold">{cur.session.number}회차</p>
              <p className="mt-1 text-lg">{formatDateKo(cur.session.date)}</p>
              <p className="text-muted-foreground">{CLASS_START} ~ {CLASS_END} (한국 시간)</p>
              <p className="mt-3 text-sm text-muted-foreground">{cur.session.title}</p>
              <Link to="/sessions/$id" params={{ id: cur.session.id }} className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                회차 보기
              </Link>
            </>
          ) : (
            <p>모든 회차가 종료되었습니다.</p>
          )}
        </Panel>
        <div className="grid gap-4">
          <Link to="/materials" className="rounded-xl border border-border bg-card p-5 font-semibold shadow-soft hover:border-primary">수업자료 바로가기 →</Link>
          <Link to="/assignments" className="rounded-xl border border-border bg-card p-5 font-semibold shadow-soft hover:border-primary">과제 바로가기 →</Link>
        </div>
      </div>
      <h2 className="mb-3 mt-8 text-lg font-bold">공지</h2>
      <EmptyState title="등록된 공지가 없습니다" reason="공지가 등록되면 이곳에 표시됩니다." />
    </>
  );
}
