import { lazy, Suspense, useId, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Search, X } from "lucide-react";
import { STUDY_GUIDES } from "@/data/study-materials";
import { getGlossaryLearning } from "@/data/glossary-learning";
import "./study-materials.css";

const GlossaryExampleFigure = lazy(() =>
  import("./glossary/GlossaryExampleFigure").then((module) => ({
    default: module.GlossaryExampleFigure,
  })),
);

type StudyGuide = (typeof STUDY_GUIDES)[number];

function matchesGuide(guide: StudyGuide, query: string) {
  const words = query.trim().normalize("NFKC").toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const text = [
    guide.title,
    guide.category,
    guide.summary,
    ...guide.keywords,
    ...guide.relatedTerms.flatMap((term) => [term.english, term.korean]),
  ]
    .join(" ")
    .normalize("NFKC")
    .toLocaleLowerCase();
  return words.every((word) => text.includes(word));
}

function GuideContent({ guide }: { guide: StudyGuide }) {
  const objectivesId = useId();
  const visual = guide.visualTermId ? getGlossaryLearning(guide.visualTermId) : undefined;
  return (
    <article className="study-guide">
      <header className="study-guide-header">
        <p className="study-eyebrow">{guide.category}</p>
        <Dialog.Title className="study-guide-title">{guide.title}</Dialog.Title>
        <Dialog.Description className="study-guide-intro">{guide.intro}</Dialog.Description>
      </header>
      <section className="study-objectives" aria-labelledby={objectivesId}>
        <h3 id={objectivesId}>이 가이드에서 배울 것</h3>
        <ul>
          {guide.objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </section>
      {visual && (
        <section className="study-guide-visual" aria-label="실제 예시로 이해하기">
          <h3>실제 예시로 이해하기</h3>
          <div className="gl-lesson gp-lesson">
            <Suspense fallback={<p role="status">시각 예시를 불러오고 있습니다.</p>}>
              <GlossaryExampleFigure figure={visual.figure} termId={visual.id} />
            </Suspense>
          </div>
        </section>
      )}
      <div className="study-guide-sections">
        {guide.sections.map((section, index) => (
          <section className="study-guide-section" key={`${guide.id}-${index}`}>
            <h3>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {section.title}
            </h3>
            <p>{section.body}</p>
            {section.bullets && section.bullets.length > 0 && (
              <ul>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      {guide.application && (
        <section className="study-application" aria-label="내 작업에 적용하기">
          <span className="study-small-label">내 작업에 적용하기</span>
          <h3>{guide.application.title}</h3>
          <p>{guide.application.prompt}</p>
        </section>
      )}
      <section className="study-related" aria-label="함께 볼 용어">
        <h3>함께 볼 용어</h3>
        <p>용어를 선택하면 단어장에서 정의와 시각 예시를 확인할 수 있습니다.</p>
        <ul>
          {guide.relatedTerms.map((term) => (
            <li key={term.id}>
              <Link to="/glossary" search={{ term: term.english }}>
                <span>
                  <strong lang="en">{term.english}</strong>
                  <span lang="ko">{term.korean}</span>
                </span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="study-references" aria-label="참고한 자료">
        <h3>참고한 자료</h3>
        <p>아래 자료의 개념을 바탕으로 K-Move 학습용 설명과 적용 질문을 정리했습니다.</p>
        <ul>
          {guide.references.map((reference, index) => (
            <li key={`${guide.id}-reference-${index}`}>
              <strong>{reference.title}</strong>
              <span>{reference.location}</span>
              {reference.note && <p>{reference.note}</p>}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

export function StudyMaterials() {
  const [query, setQuery] = useState("");
  const [activeGuide, setActiveGuide] = useState<StudyGuide | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchId = useId();
  const results = STUDY_GUIDES.filter((guide) => matchesGuide(guide, query));
  function clearQuery() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <section className="study-materials" aria-labelledby="study-materials-title">
      <header className="study-materials-header">
        <p className="study-eyebrow">DESIGN / STUDY GUIDES</p>
        <div className="study-materials-title-row">
          <h1 id="study-materials-title">디자인 학습 자료</h1>
          <p className="study-guide-count">
            <strong>{STUDY_GUIDES.length}</strong> GUIDES
          </p>
        </div>
        <p className="study-materials-description">
          용어를 하나씩 익혔다면, 이제 실제 디자인 과정에서 어떻게 연결되는지 살펴보세요.
        </p>
      </header>
      <div className="study-search-wrap">
        <label className="study-sr-only" htmlFor={searchId}>
          학습 자료 검색
        </label>
        <Search size={18} aria-hidden="true" />
        <input
          ref={inputRef}
          id={searchId}
          type="search"
          autoComplete="off"
          placeholder="주제 · 디자인 용어로 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {query && (
          <button
            type="button"
            className="study-clear"
            onClick={clearQuery}
            aria-label="검색어 지우기"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="study-list-heading">
        <h2>주제별 가이드</h2>
        <p role="status" aria-live="polite">
          {query.trim() ? "검색 결과" : "전체"} {results.length}개
        </p>
      </div>
      {results.length > 0 ? (
        <ul className="study-card-grid" aria-label="디자인 학습 가이드">
          {results.map((guide) => (
            <li key={guide.id}>
              <button
                type="button"
                className="study-card"
                aria-label={`${guide.title} 가이드 읽기`}
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setActiveGuide(guide);
                }}
              >
                <span className="study-card-top">
                  <span className="study-card-number">
                    {String(STUDY_GUIDES.indexOf(guide) + 1).padStart(2, "0")}
                  </span>
                  <span className="study-card-category">{guide.category}</span>
                </span>
                <span className="study-card-title">{guide.title}</span>
                <span className="study-card-summary">{guide.summary}</span>
                <span className="study-card-keywords" aria-hidden="true">
                  {guide.keywords.slice(0, 3).map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </span>
                <span className="study-card-action">
                  <span>
                    <BookOpen size={16} aria-hidden="true" />
                    가이드 읽기
                  </span>
                  <ArrowRight size={18} aria-hidden="true" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="study-empty">
          <h3>검색 결과가 없습니다</h3>
          <p>다른 주제나 영어·한국어 용어로 검색해 보세요.</p>
          <button type="button" onClick={clearQuery}>
            전체 가이드 보기
          </button>
        </div>
      )}
      <aside className="study-glossary-prompt">
        <div>
          <h2>모르는 용어는 단어장에서</h2>
          <p>영어 원어와 자연스러운 한국어 설명, 시각 예시를 함께 확인하세요.</p>
        </div>
        <Link to="/glossary" search={{}}>
          용어집 열기 <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </aside>
      <Dialog.Root
        open={activeGuide !== null}
        onOpenChange={(open) => {
          if (!open) setActiveGuide(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="study-dialog-overlay" />
          <Dialog.Content
            className="study-dialog"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              triggerRef.current?.focus();
            }}
          >
            <div className="study-dialog-toolbar">
              <span>
                K-MOVE <span aria-hidden="true">/</span> STUDY GUIDE
              </span>
              <Dialog.Close className="study-dialog-close" aria-label="학습 가이드 닫기">
                <X size={20} aria-hidden="true" />
                <span>닫기</span>
              </Dialog.Close>
            </div>
            {activeGuide && <GuideContent guide={activeGuide} />}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
