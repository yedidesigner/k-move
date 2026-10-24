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
      <Link to="/sessions" className="mb-4 inline-block text-sm text-primary">← 전체 수업</Link>
      <PageHeader title={`${s.number}회차`} description={s.title} />
      <Panel>
        <p className="text-lg">{formatDateKo(s.date)}</p>
        <p className="text-muted-foreground">{CLASS_START} ~ {CLASS_END} (한국 시간)</p>
        <div className="mt-3"><StatusBadge tone="neutral">세부 내용 비공개</StatusBadge></div>
      </Panel>
      <div className="mt-5">
        <EmptyState title="세부 커리큘럼과 자료가 아직 공개되지 않았습니다" reason="강사가 내용을 확정해 공개하면 이곳에 표시됩니다." />
      </div>
    </>
  );
}
