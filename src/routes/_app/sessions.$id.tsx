import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CLASS_END, CLASS_START, SESSIONS, formatDateKo } from "@/data/schedule";
import { EmptyState, PageHeader, Panel, StatusBadge } from "@/components/lms";

export const Route = createFileRoute("/_app/sessions/$id")({
  loader: ({ params }) => {
    const s = SESSIONS.find((x) => x.id === params.id);
    if (!s) throw notFound();
    return s;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.number}회차 | K-Move LMS` : "회차 | K-Move LMS" },
      { name: "description", content: "회차 상세 정보" },
      { property: "og:title", content: loaderData ? `${loaderData.number}회차` : "회차" },
      { property: "og:description", content: "회차 상세 정보" },
    ],
  }),
  component: Detail,
});

function Detail() {
  const s = Route.useLoaderData();
  return (
    <>
      <Link to="/sessions" className="mb-4 inline-block text-sm text-primary">
        ← 전체 수업
      </Link>
      <PageHeader title={s.number === 1 ? "1주차" : `${s.number}회차`} description={s.title} />
      <Panel>
        <p className="text-lg">{formatDateKo(s.date)}</p>
        <p className="text-muted-foreground">
          {CLASS_START} ~ {CLASS_END} (한국 시간)
        </p>
        <div className="mt-3">
          <StatusBadge tone="neutral">
            {s.number === 1 ? "오리엔테이션" : "세부 내용 비공개"}
          </StatusBadge>
        </div>
      </Panel>
      {s.number === 1 && (
        <section className="mt-6 border-y border-foreground bg-card p-6">
          <p className="text-xs text-muted-foreground">WEEK 01 · ORIENTATION</p>
          <h2 className="mt-3 text-xl font-semibold">설문조사</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            AI 경험과 디자인 프로그램 활용 수준, 이번 수업에서 배우고 싶은 내용을 알려 주세요.
          </p>
          <Link
            to="/survey"
            className="mt-5 inline-flex min-h-12 items-center bg-foreground px-5 text-sm font-semibold text-background"
          >
            설문 작성 · 내 응답 확인 →
          </Link>
        </section>
      )}
      <div className="mt-5">
        <EmptyState
          title="세부 커리큘럼과 자료가 아직 공개되지 않았습니다"
          reason="강사가 내용을 확정해 공개하면 이곳에 표시됩니다."
        />
      </div>
    </>
  );
}
