import type { ManagedTerm } from "@/lib/content-model";
export function hasManagedExample(term: ManagedTerm) {
  return !!(
    term.structure ||
    term.context ||
    term.imageUrl ||
    term.misconception ||
    term.referenceUrl
  );
}
export function ManagedTermExample({ term }: { term: ManagedTerm }) {
  if (!hasManagedExample(term)) return null;
  return (
    <article className="space-y-7 border-b border-neutral-200 bg-white px-6 py-8 sm:px-10">
      <header>
        <h2 className="text-3xl font-bold">{term.english}</h2>
        <p className="mt-2 text-sm text-neutral-600">
          [{term.pronunciation}] / {term.korean}
        </p>
      </header>
      <p className="whitespace-pre-wrap text-base leading-8">{term.description}</p>
      {term.structure && (
        <section>
          <h3 className="mb-3 text-lg font-semibold">핵심 구조</h3>
          <p className="whitespace-pre-wrap text-sm leading-7">{term.structure}</p>
        </section>
      )}
      {term.imageUrl && (
        <figure className="border border-neutral-200 p-4">
          <img
            src={term.imageUrl}
            alt={term.imageAlt || `${term.english} 예시`}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="max-h-[600px] w-full object-contain"
          />
          <figcaption className="mt-4 text-sm leading-6 text-neutral-600">
            {term.imageAlt}
          </figcaption>
        </figure>
      )}
      <section>
        <h3 className="mb-3 text-lg font-semibold">맥락에서 보기</h3>
        <p className="whitespace-pre-wrap text-sm leading-7">{term.example}</p>
        {term.context && (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-600">
            {term.context}
          </p>
        )}
      </section>
      {term.misconception && (
        <section>
          <h3 className="mb-3 text-lg font-semibold">기억할 점</h3>
          <p className="whitespace-pre-wrap text-sm leading-7">{term.misconception}</p>
        </section>
      )}
      {(term.imageBasis || term.referenceUrl) && (
        <details className="border-t border-neutral-200 pt-4 text-xs text-neutral-600">
          <summary className="cursor-pointer py-2">출처·제작 정보</summary>
          {term.imageBasis && <p className="mt-2 leading-6">{term.imageBasis}</p>}
          {term.referenceUrl && (
            <a
              href={term.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block py-2 underline"
            >
              참고 자료 보기 ↗
            </a>
          )}
        </details>
      )}
    </article>
  );
}
