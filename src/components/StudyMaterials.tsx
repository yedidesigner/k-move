import { lazy, Suspense, useId, useRef, useState, type MouseEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Check, ChevronDown, Layers, Route, Search, X } from "lucide-react";
import { DESIGN_SOURCES, LEVELS, STUDY_GUIDES, STUDY_PATHS, TOPICS } from "@/data/study-materials";
import { getGlossaryLearning } from "@/data/glossary-learning";
import "./study-materials.css";

const GlossaryExampleFigure = lazy(() =>
  import("./glossary/GlossaryExampleFigure").then((module) => ({
    default: module.GlossaryExampleFigure,
  })),
);

type StudyGuide = (typeof STUDY_GUIDES)[number];
type StudyView = "guides" | "paths" | "sources";
type OpenGuide = (guide: StudyGuide, event: MouseEvent<HTMLButtonElement>) => void;

const guidesById = new Map(STUDY_GUIDES.map((guide) => [guide.id, guide]));
const sectionViews = [
  { id: "guides", label: "학습 가이드", icon: BookOpen, count: STUDY_GUIDES.length },
  { id: "paths", label: "학습 경로", icon: Route, count: STUDY_PATHS.length },
  { id: "sources", label: "참고 자료", icon: Layers, count: DESIGN_SOURCES.length },
] as const;

function levelLabel(level: string) {
  return LEVELS.find((item) => item.id === level)?.label ?? level;
}

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
  const decisionId = useId();
  const exerciseId = useId();
  const pitfallsId = useId();
  const visual = guide.visualTermId ? getGlossaryLearning(guide.visualTermId) : undefined;
  return (
    <article className="study-guide">
      <header className="study-guide-header">
        <div className="study-guide-meta">
          <p className="study-eyebrow">{guide.category}</p>
          <span className="study-level-badge">{levelLabel(guide.level)}</span>
        </div>
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
      {guide.decision && (
        <section className="study-decision" aria-labelledby={decisionId}>
          <div className="study-module-heading">
            <span className="study-small-label">DESIGN DECISION</span>
            <h3 id={decisionId}>디자인 판단 따라가기</h3>
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
            <span className="study-small-label">APPLY TO YOUR WORK</span>
            <h3 id={exerciseId}>내 작업에 적용하기</h3>
            <p>{guide.exercise.brief}</p>
          </div>
          <div className="study-deliverable">
            <span>만들어 볼 결과물</span>
            <p>{guide.exercise.deliverable}</p>
          </div>
          <div className="study-quality-criteria">
            <h4>결과물 점검 기준</h4>
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
          <h3>{guide.application.title}</h3>
          <p>{guide.application.prompt}</p>
        </section>
      ) : null}
      {guide.pitfalls && guide.pitfalls.length > 0 && (
        <section className="study-pitfalls" aria-labelledby={pitfallsId}>
          <h3 id={pitfallsId}>흔히 놓치는 점</h3>
          <ul>
            {guide.pitfalls.map((pitfall) => (
              <li key={pitfall}>{pitfall}</li>
            ))}
          </ul>
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
        <p>
          확인한 자료의 개념을 바탕으로 학습용 설명과 적용 과제를 작성했습니다. 페이지는 제공된 PDF
          파일의 순서이며, 책에 인쇄된 쪽수와 다를 수 있습니다.
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
              {reference.note && <p>{reference.note}</p>}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function GuideCard({ guide, onOpen }: { guide: StudyGuide; onOpen: OpenGuide }) {
  return (
    <li>
      <button
        type="button"
        className="study-card"
        aria-label={`${guide.title} 가이드 읽기`}
        onClick={(event) => onOpen(guide, event)}
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
          <span className="study-card-level">{levelLabel(guide.level)}</span>
          <ArrowRight size={18} aria-hidden="true" />
        </span>
      </button>
    </li>
  );
}

function LearningPaths({ onOpen }: { onOpen: OpenGuide }) {
  return (
    <section className="study-paths" aria-labelledby="study-paths-title">
      <div className="study-section-intro">
        <div>
          <p className="study-eyebrow">LEARNING PATHS</p>
          <h2 id="study-paths-title">지금 필요한 순서로 읽기</h2>
        </div>
        <p>경험과 목표에 맞는 경로를 골라 보세요. 각 가이드는 따로 읽을 수도 있습니다.</p>
      </div>
      <div className="study-path-grid">
        {STUDY_PATHS.map((path, pathIndex) => {
          const guides = path.guideIds
            .map((id) => guidesById.get(id))
            .filter((guide): guide is StudyGuide => Boolean(guide));
          return (
            <article className="study-path-card" key={path.id}>
              <header>
                <div className="study-path-kicker">
                  <span>PATH {String(pathIndex + 1).padStart(2, "0")}</span>
                  <span>{guides.length}개 가이드</span>
                </div>
                <h3>{path.title}</h3>
                <span className="study-path-audience">{path.audience}</span>
                <p>{path.description}</p>
              </header>
              <ol aria-label={`${path.title} 학습 순서`}>
                {guides.map((guide, guideIndex) => (
                  <li key={guide.id}>
                    <span className="study-path-step" aria-hidden="true">
                      {String(guideIndex + 1).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={(event) => onOpen(guide, event)}
                      aria-label={`${guide.title} 가이드 읽기`}
                    >
                      <span>
                        <small>{guide.category}</small>
                        <strong>{guide.title}</strong>
                      </span>
                      <ArrowRight size={17} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ol>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SourceNotes({ value }: { value: string | string[] | undefined }) {
  if (!value) return null;
  if (Array.isArray(value))
    return (
      <ul>
        {value.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    );
  return <p>{value}</p>;
}

function SourceCatalog() {
  return (
    <section className="study-sources" aria-labelledby="study-sources-title">
      <div className="study-section-intro">
        <div>
          <p className="study-eyebrow">READING SOURCES</p>
          <h2 id="study-sources-title">학습 자료의 바탕이 된 문헌</h2>
        </div>
        <p>
          자료마다 확인한 범위와 한계를 표시했습니다. 가이드 하단에서는 사용한 PDF 페이지와 개념을
          함께 확인할 수 있습니다.
        </p>
      </div>
      <ul className="study-source-grid" aria-label="디자인 참고 자료">
        {DESIGN_SOURCES.map((source, index) => (
          <li key={source.id}>
            <article className="study-source-card">
              <div className="study-source-heading">
                <span className="study-source-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{source.title}</h3>
                  {source.author && <p>{source.author}</p>}
                </div>
              </div>
              <div className="study-source-metadata">
                {source.edition && <span>{source.edition}</span>}
                <span>제공 파일 {source.pageCount}쪽</span>
              </div>
              <div className="study-source-notes">
                <h4>확인한 범위</h4>
                <SourceNotes value={source.coverage} />
              </div>
              <div className="study-source-limits">
                <h4>읽을 때 고려할 점</h4>
                <SourceNotes value={source.limitations} />
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StudyMaterials() {
  const [view, setView] = useState<StudyView>("guides");
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  const [level, setLevel] = useState("all");
  const [activeGuide, setActiveGuide] = useState<StudyGuide | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchId = useId();
  const topicId = useId();
  const levelId = useId();
  const hasFilters = Boolean(query.trim()) || topic !== "all" || level !== "all";
  const results = STUDY_GUIDES.filter(
    (guide) =>
      (topic === "all" || guide.topic === topic) &&
      (level === "all" || guide.level === level) &&
      matchesGuide(guide, query),
  );

  function clearQuery() {
    setQuery("");
    inputRef.current?.focus();
  }

  function resetFilters() {
    setQuery("");
    setTopic("all");
    setLevel("all");
    inputRef.current?.focus();
  }

  function openGuide(guide: StudyGuide, event: MouseEvent<HTMLButtonElement>) {
    triggerRef.current = event.currentTarget;
    setActiveGuide(guide);
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
          개념을 이해하고, 디자인 판단을 살펴보고, 자신의 작업에 적용해 보세요.
        </p>
      </header>
      <nav className="study-section-switcher" aria-label="자료실 보기">
        {sectionViews.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-pressed={view === id}
            onClick={() => setView(id)}
          >
            <Icon size={17} aria-hidden="true" />
            <span>{label}</span>
            <small aria-hidden="true">{count}</small>
          </button>
        ))}
      </nav>
      {view === "guides" && (
        <div id="study-view-guides">
          <div className="study-filter-bar">
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
            <div className="study-filter-selects">
              <div className="study-select-wrap">
                <label htmlFor={topicId}>주제</label>
                <div>
                  <select
                    id={topicId}
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                  >
                    <option value="all">전체 주제</option>
                    {TOPICS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} aria-hidden="true" />
                </div>
              </div>
              <div className="study-select-wrap">
                <label htmlFor={levelId}>학습 수준</label>
                <div>
                  <select
                    id={levelId}
                    value={level}
                    onChange={(event) => setLevel(event.target.value)}
                  >
                    <option value="all">전체 수준</option>
                    {LEVELS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
          <div className="study-list-heading">
            <h2>주제별 가이드</h2>
            <div className="study-result-meta">
              <p role="status" aria-live="polite">
                {hasFilters ? "검색 결과" : "전체"} {results.length}개
              </p>
              {hasFilters && (
                <button type="button" onClick={resetFilters}>
                  필터 초기화 <X size={13} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          {results.length > 0 ? (
            <ul className="study-card-grid" aria-label="디자인 학습 가이드">
              {results.map((guide) => (
                <GuideCard key={guide.id} guide={guide} onOpen={openGuide} />
              ))}
            </ul>
          ) : (
            <div className="study-empty">
              <h3>검색 결과가 없습니다</h3>
              <p>다른 주제나 영어·한국어 용어로 검색해 보세요.</p>
              <button type="button" onClick={resetFilters}>
                전체 가이드 보기
              </button>
            </div>
          )}
        </div>
      )}
      {view === "paths" && (
        <div id="study-view-paths">
          <LearningPaths onOpen={openGuide} />
        </div>
      )}
      {view === "sources" && (
        <div id="study-view-sources">
          <SourceCatalog />
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
