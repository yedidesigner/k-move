import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CLASS_END, CLASS_START, SESSIONS, formatDateKo } from "@/data/schedule";
import { EmptyState, PageHeader, Panel, StatusBadge } from "@/components/lms";
import { SessionCurriculum } from "@/components/SessionCurriculum";

export const Route = createFileRoute("/_app/sessions/$id")({
  loader: ({ params }) => {
    const s = SESSIONS.find((x) => x.id === params.id);
    if (!s) throw notFound();
    return s;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.number}회차 · ${loaderData.title} | K-Move LMS`
          : "회차 | K-Move LMS",
      },
      {
        name: "description",
        content: loaderData?.curriculum?.topics.join(" · ") ?? "회차 상세 정보",
      },
      {
        property: "og:title",
        content: loaderData ? `${loaderData.number}회차 · ${loaderData.title}` : "회차",
      },
      {
        property: "og:description",
        content: loaderData?.curriculum?.goalOutput ?? "회차 상세 정보",
      },
    ],
  }),
  component: Detail,
});

function Detail() {
  const s = Route.useLoaderData();
  const lesson = s.detailsPublished ? s.curriculum : null;
  const previous = SESSIONS.find((session) => session.number === s.number - 1);
  const next = SESSIONS.find((session) => session.number === s.number + 1);
  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/sessions" className="mb-4 inline-block text-sm text-primary">
        ← 전체 수업
      </Link>
      {lesson ? (
        <header className="mb-6">
          <p className="text-xs font-semibold leading-relaxed text-muted-foreground">
            {s.number}회차 · {lesson.cycle}
          </p>
          <h1 className="mt-2 break-keep text-2xl font-bold leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-3xl">
            {lesson.project}
          </h1>
          {lesson.stage && (
            <p className="mt-3 break-keep text-lg font-medium leading-relaxed [overflow-wrap:anywhere]">
              {lesson.stage}
            </p>
          )}
        </header>
      ) : (
        <PageHeader title={`${s.number}회차`} description={s.title} />
      )}
      <Panel className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-lg">{formatDateKo(s.date)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {CLASS_START} ~ {CLASS_END} (한국 시간)
          </p>
        </div>
        <StatusBadge tone="neutral">{lesson ? "커리큘럼 공개" : "준비 중"}</StatusBadge>
      </Panel>
      {lesson ? (
        <SessionCurriculum lesson={lesson} />
      ) : (
        <div className="mt-5">
          <EmptyState
            title="세부 커리큘럼과 자료가 아직 공개되지 않았습니다"
            reason="강사가 내용을 확정해 공개하면 이곳에 표시됩니다."
          />
        </div>
      )}
      <nav
        aria-label="수업 회차 이동"
        className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-5"
      >
        {previous ? (
          <Link
            to="/sessions/$id"
            params={{ id: previous.id }}
            className="min-w-0 py-2 text-sm leading-relaxed hover:underline"
          >
            <span className="block text-xs text-muted-foreground">← 이전 회차</span>
            <span className="mt-1 block font-medium">
              {previous.number}회차 · {previous.curriculum?.project ?? previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            to="/sessions/$id"
            params={{ id: next.id }}
            className="min-w-0 py-2 text-right text-sm leading-relaxed hover:underline"
          >
            <span className="block text-xs text-muted-foreground">다음 회차 →</span>
            <span className="mt-1 block font-medium">
              {next.number}회차 · {next.curriculum?.project ?? next.title}
            </span>
          </Link>
        )}
      </nav>
    </div>
  );
}
