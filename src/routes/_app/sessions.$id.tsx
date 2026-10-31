import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CLASS_END, CLASS_START, SESSIONS, formatDateKo } from "@/data/schedule";
import { EmptyState, PageHeader, Panel, StatusBadge } from "@/components/lms";
import { SessionCurriculum } from "@/components/SessionCurriculum";
import { usePublishedContent, PublishedAnnouncements } from "@/lib/published-content";

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
  const base = Route.useLoaderData();
  const { sessions, guides, glossary } = usePublishedContent();
  const s = sessions.find((session) => session.id === base.id)!;
  const lesson = s.detailsPublished ? s.curriculum : null;
  const previous = sessions.find((session) => session.number === s.number - 1);
  const next = sessions.find((session) => session.number === s.number + 1);
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
            {s.managed ? s.title : lesson.project}
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
            {s.startTime} ~ {s.endTime} (한국 시간)
          </p>
        </div>
        <StatusBadge tone="neutral">
          {s.progress === "completed"
            ? "진행 완료"
            : s.detailsPublished
              ? "수업 내용 공개"
              : "준비 중"}
        </StatusBadge>
      </Panel>
      <div className="mt-5">
        <PublishedAnnouncements sessionNumber={s.number} />
      </div>
      {s.body && (
        <section className="mt-6 border-y border-neutral-200 py-6">
          <h2 className="mb-3 text-lg font-semibold">수업 안내</h2>
          <p className="whitespace-pre-wrap text-sm leading-8">{s.body}</p>
        </section>
      )}
      {!!s.objectives?.length && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">오늘의 학습 목표</h2>
          <ul className="list-inside list-disc space-y-2 text-sm leading-7">
            {s.objectives.map((goal, index) => (
              <li key={index}>{goal}</li>
            ))}
          </ul>
        </section>
      )}
      {!!s.guideIds?.length && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">연결 학습자료</h2>
          <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
            {s.guideIds.flatMap((id) => {
              const guide = guides.find((item) => item.id === id);
              return guide
                ? [
                    <li key={id}>
                      <a
                        href={`/materials?guide=${encodeURIComponent(id)}`}
                        className="block py-4 text-sm hover:underline"
                      >
                        {guide.title} →
                      </a>
                    </li>,
                  ]
                : [];
            })}
          </ul>
        </section>
      )}
      {!!s.termIds?.length && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">함께 볼 용어</h2>
          <div className="flex flex-wrap gap-2">
            {s.termIds.flatMap((id) => {
              const term = glossary.find((item) => item.id === id);
              return term
                ? [
                    <a
                      key={id}
                      href={`/glossary?term=${encodeURIComponent(term.english)}`}
                      className="border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
                    >
                      {term.english}
                    </a>,
                  ]
                : [];
            })}
          </div>
        </section>
      )}
      {lesson ? (
        <SessionCurriculum lesson={lesson} />
      ) : !s.detailsPublished ? (
        <div className="mt-5">
          <EmptyState
            title="세부 커리큘럼과 자료가 아직 공개되지 않았습니다"
            reason="강사가 내용을 확정해 공개하면 이곳에 표시됩니다."
          />
        </div>
      ) : null}
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
