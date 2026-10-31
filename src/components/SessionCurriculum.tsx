import type { CurriculumLesson } from "@/data/curriculum";

export function SessionCurriculum({ lesson }: { lesson: CurriculumLesson }) {
  return (
    <div className="mt-6 space-y-8">
      <section
        aria-labelledby="session-output-title"
        className="border-l-2 border-foreground bg-muted/40 px-5 py-5 sm:px-6"
      >
        <h2 id="session-output-title" className="text-sm font-bold">
          목표 산출물
        </h2>
        <p className="mt-2 whitespace-pre-line break-keep text-base font-medium leading-relaxed [overflow-wrap:anywhere] sm:text-lg">
          {lesson.goalOutput}
        </p>
      </section>

      <section aria-labelledby="session-topics-title">
        <h2 id="session-topics-title" className="border-b border-foreground pb-3 text-lg font-bold">
          주요 교육 내용
        </h2>
        <ol className="divide-y divide-border">
          {lesson.topics.map((topic, index) => (
            <li key={topic} className="flex items-start gap-4 py-4 sm:gap-5 sm:py-5">
              <span
                aria-hidden="true"
                className="pt-0.5 text-xs font-semibold tabular-nums text-muted-foreground"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="min-w-0 break-keep text-base leading-7 [overflow-wrap:anywhere]">
                {topic}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="session-terms-title">
        <h2 id="session-terms-title" className="border-b border-foreground pb-3 text-lg font-bold">
          핵심 개발 용어
        </h2>
        <dl className="divide-y divide-border">
          {lesson.terms.map(({ name, description }) => (
            <div key={name} className="py-5">
              <dt className="break-keep text-base font-semibold leading-relaxed [overflow-wrap:anywhere]">
                {name}
              </dt>
              <dd className="mt-2 break-keep text-base leading-7 text-muted-foreground [overflow-wrap:anywhere]">
                {description}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
