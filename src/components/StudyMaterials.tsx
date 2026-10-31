import { lazy, Suspense, useId, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown, Search, X } from "lucide-react";
import { STUDY_GUIDES, TOPICS, getGuidesForTerm, type StudyGuide } from "@/data/study-materials";
import { getGlossaryLearning } from "@/data/glossary-learning";
import { GlossaryTermLink } from "./glossary/GlossaryTermLink";
import "./study-materials.css";

const GlossaryExampleFigure = lazy(() =>
  import("./glossary/GlossaryExampleFigure").then((module) => ({
    default: module.GlossaryExampleFigure,
  })),
);

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

export function DesignGuideContent({ guide }: { guide: StudyGuide }) {
  const titleId = useId();
  const objectivesId = useId();
  const decisionId = useId();
  const exerciseId = useId();
  const pitfallsId = useId();
  const visual = guide.visualTermId ? getGlossaryLearning(guide.visualTermId) : undefined;
  return (
    <article className="study-guide" aria-labelledby={titleId}>
      <header className="study-guide-header">
        <h4 id={titleId} className="study-guide-title">
          {guide.title}
        </h4>
        <p className="study-guide-intro">{guide.intro}</p>
      </header>
      <section className="study-objectives" aria-labelledby={objectivesId}>
        <h5 id={objectivesId}>이 가이드에서 배울 것</h5>
        <ul>
          {guide.objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </section>
      {visual && (
        <section className="study-guide-visual" aria-label="화면 예시로 이해하기">
          <h5>화면 예시로 이해하기</h5>
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
            <h5>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {section.title}
            </h5>
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
      {guide.decision && (
        <section className="study-decision" aria-labelledby={decisionId}>
          <div className="study-module-heading">
            <h5 id={decisionId}>디자인 판단 따라가기</h5>
            <p>
              학습용 가상 사례입니다. 상황과 선택을 연결하고, 다른 선택지와 검증 방법까지
              살펴보세요.
            </p>
          </div>
          <dl className="study-decision-steps">
            {[
              { label: "상황", value: guide.decision.context },
              { label: "선택", value: guide.decision.choice },
              { label: "선택 이유", value: guide.decision.why },
              { label: "다른 선택지", value: guide.decision.alternatives },
              { label: "확인 방법", value: guide.decision.validation },
            ].map((step, index) => (
              <div key={step.label}>
                <dt>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  {step.label}
                </dt>
                <dd>{step.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {guide.exercise ? (
        <section className="study-exercise" aria-labelledby={exerciseId}>
          <div className="study-module-heading">
            <h5 id={exerciseId}>내 작업에 적용하기</h5>
            <p>{guide.exercise.brief}</p>
          </div>
          <div className="study-deliverable">
            <span>만들어 볼 결과물</span>
            <p>{guide.exercise.deliverable}</p>
          </div>
          <div className="study-quality-criteria">
            <h6>결과물 점검 기준</h6>
            <p>아래 기준으로 자신의 결과물을 살펴보세요.</p>
            <ul>
              {guide.exercise.criteria.map((criterion) => (
                <li key={criterion}>
                  <Check size={16} aria-hidden="true" />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : guide.application ? (
        <section className="study-application" aria-label="내 작업에 적용하기">
          <span className="study-small-label">내 작업에 적용하기</span>
          <h5>{guide.application.title}</h5>
          <p>{guide.application.prompt}</p>
        </section>
      ) : null}
      {guide.pitfalls && guide.pitfalls.length > 0 && (
        <section className="study-pitfalls" aria-labelledby={pitfallsId}>
          <h5 id={pitfallsId}>흔히 놓치는 점</h5>
          <ul>
            {guide.pitfalls.map((pitfall) => (
              <li key={pitfall}>{pitfall}</li>
            ))}
          </ul>
        </section>
      )}
      <section className="study-related" aria-label="함께 볼 용어">
        <h5>함께 볼 용어</h5>
        <p>용어를 선택하면 단어장에서 정의와 시각 예시를 확인할 수 있습니다.</p>
        <ul>
          {guide.relatedTerms.map((term) => (
            <li key={term.id}>
              <GlossaryTermLink termId={term.id}>
                <span>
                  <strong lang="en">{term.english}</strong>
                  <span lang="ko">{term.korean}</span>
                </span>
                <ArrowRight size={16} aria-hidden="true" />
              </GlossaryTermLink>
            </li>
          ))}
        </ul>
      </section>
      <details className="study-references">
        <summary>출처·제작 정보</summary>
        <p>
          설명과 가상 사례는 K-Move에서 구성했습니다. PDF 쪽수는 제공 파일의 첫 페이지부터 센
          번호입니다.
        </p>
        <ul>
          {guide.references.map((reference, index) => (
            <li key={`${guide.id}-reference-${index}`}>
              <strong>
                {reference.url ? (
                  <a href={reference.url} target="_blank" rel="noopener noreferrer">
                    {reference.title} ↗<span className="study-sr-only"> (새 탭)</span>
                  </a>
                ) : (
                  reference.title
                )}
              </strong>
              <span>{reference.location}</span>
              {reference.note && <small>{reference.note}</small>}
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
}

function GuideDisclosure({ guide }: { guide: StudyGuide }) {
  const [hasOpened, setHasOpened] = useState(false);
  return (
    <details
      className="study-guide-disclosure"
      data-guide-id={guide.id}
      onToggle={(event) => {
        if (event.target === event.currentTarget && event.currentTarget.open) setHasOpened(true);
      }}
    >
      <summary aria-label={guide.title}>
        <span className="study-guide-summary-copy">
          <strong>{guide.title}</strong>
          <span>{guide.summary}</span>
        </span>
        <ChevronDown size={19} aria-hidden="true" />
      </summary>
      {hasOpened && <DesignGuideContent guide={guide} />}
    </details>
  );
}

export function RelatedDesignGuides({ termId }: { termId: string }) {
  const headingId = useId();
  const guides = getGuidesForTerm(termId);
  if (guides.length === 0) return null;
  return (
    <section className="study-shared study-related-guides" aria-labelledby={headingId}>
      <header className="study-inline-heading">
        <h3 id={headingId}>이 개념을 더 이해하기</h3>
        <p>이 용어와 연결된 설계 판단과 적용 과제를 살펴보세요.</p>
      </header>
      <ul className="study-guide-list">
        {guides.map((guide) => (
          <li key={guide.id}>
            <GuideDisclosure guide={guide} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function GuideLibraryContents() {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchId = useId();
  const topicId = useId();
  const headingId = useId();
  const hasFilters = Boolean(query.trim()) || topic !== "all";
  const results = STUDY_GUIDES.filter(
    (guide) => (topic === "all" || guide.topic === topic) && matchesGuide(guide, query),
  );
  const resultIds = new Set(results.map((guide) => guide.id));

  function resetFilters() {
    setQuery("");
    setTopic("all");
    inputRef.current?.focus();
  }

  return (
    <div className="study-library-content">
      <div className="study-filter-bar">
        <div className="study-search-wrap">
          <label className="study-sr-only" htmlFor={searchId}>
            학습 가이드 검색
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
              aria-label="가이드 검색어 지우기"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              <X size={17} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="study-select-wrap">
          <label className="study-sr-only" htmlFor={topicId}>
            가이드 주제
          </label>
          <select id={topicId} value={topic} onChange={(event) => setTopic(event.target.value)}>
            <option value="all">전체 주제</option>
            {TOPICS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
      </div>
      <div className="study-result-meta">
        <h3 id={headingId} className="study-sr-only">
          주제별 학습 가이드
        </h3>
        <p role="status" aria-live="polite">
          {hasFilters ? "검색 결과" : "전체 가이드"} {results.length}개
        </p>
        {hasFilters && (
          <button type="button" onClick={resetFilters}>
            가이드 필터 초기화 <X size={13} aria-hidden="true" />
          </button>
        )}
      </div>
      <ul className="study-guide-list" aria-labelledby={headingId} hidden={results.length === 0}>
        {STUDY_GUIDES.map((guide) => (
          <li key={guide.id} hidden={!resultIds.has(guide.id)}>
            <GuideDisclosure guide={guide} />
          </li>
        ))}
      </ul>
      {results.length === 0 && (
        <div className="study-empty">
          <p>일치하는 가이드가 없습니다.</p>
          <span>다른 검색어를 입력하거나 주제를 변경해 보세요.</span>
          <button type="button" onClick={resetFilters}>
            전체 가이드 보기
          </button>
        </div>
      )}
    </div>
  );
}

export function GlossaryGuideLibrary() {
  const [hasOpened, setHasOpened] = useState(false);
  return (
    <section className="study-shared study-guide-library" aria-label="주제별로 이어 배우기">
      <details
        className="study-library-disclosure"
        onToggle={(event) => {
          if (event.target === event.currentTarget && event.currentTarget.open) setHasOpened(true);
        }}
      >
        <summary aria-label="주제별로 이어 배우기">
          <span>
            <strong>주제별로 이어 배우기</strong>
            <span>여러 용어를 연결해 이해하고, 자신의 작업에 적용해 보세요.</span>
          </span>
          <ChevronDown size={21} aria-hidden="true" />
        </summary>
        {hasOpened && <GuideLibraryContents />}
      </details>
    </section>
  );
}
