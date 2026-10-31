import { useId } from "react";
import type { CurriculumLesson } from "@/data/curriculum";

export function SessionCurriculum({ lesson }: { lesson: CurriculumLesson }) {
  const id = useId();
  const topics = lesson.topics.filter((topic) => topic.trim());
  const terms = lesson.terms.filter(({ name, description }) => name.trim() || description.trim());
  const tools = (lesson.tools ?? []).filter((tool) => tool.trim());
  return (
    <div className="mt-6 space-y-8">
      <section
        aria-labelledby={`${id}-output`}
        className="border-l-2 border-foreground bg-muted/40 px-5 py-5 sm:px-6"
      >
        <h2 id={`${id}-output`} className="text-sm font-bold">
          목표 산출물
        </h2>
        <p className="mt-2 whitespace-pre-line break-keep text-base font-medium leading-relaxed [overflow-wrap:anywhere] sm:text-lg">
          {lesson.goalOutput}
        </p>
      </section>

      <section aria-labelledby={`${id}-topics`}>
        <h2 id={`${id}-topics`} className="border-b border-foreground pb-3 text-lg font-bold">
          주요 교육 내용
        </h2>
        <ol className="divide-y divide-border">
          {topics.map((topic, index) => (
            <li key={`${index}-${topic}`} className="flex items-start gap-4 py-4 sm:gap-5 sm:py-5">
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

      {terms.length > 0 && (
        <section aria-labelledby={`${id}-terms`}>
          <h2 id={`${id}-terms`} className="border-b border-foreground pb-3 text-lg font-bold">
            핵심 용어 (디자이너 해석)
          </h2>
          <dl className="divide-y divide-border">
            {terms.map(({ name, description }, index) => (
              <div key={`${index}-${name}`} className="py-5">
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
      )}

      {(tools.length > 0 || lesson.homework) && (
        <section
          aria-labelledby={tools.length ? `${id}-tools` : `${id}-homework`}
          className="grid gap-6 border-t border-border pt-6 sm:grid-cols-2"
        >
          {tools.length > 0 ? (
            <div>
              <h2 id={`${id}-tools`} className="text-sm font-bold">
                사용 도구
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {tools.map((tool, index) => (
                  <li
                    key={`${index}-${tool}`}
                    className="border border-border px-3 py-1.5 text-sm text-foreground/90"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {lesson.homework && (
            <div>
              <h2 id={`${id}-homework`} className="text-sm font-bold">
                과제
              </h2>
              <p className="mt-3 whitespace-pre-line break-keep text-base leading-7 text-muted-foreground [overflow-wrap:anywhere]">
                {lesson.homework}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
