import { lazy, Suspense, useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, Search, X } from "lucide-react";
import { STUDY_GUIDES, TOPICS, getGuidesForTerm, type StudyGuide } from "@/data/study-materials";
import { getGlossaryLearning } from "@/data/glossary-learning";
import { GlossaryTermLink } from "./glossary/GlossaryTermLink";
import "./study-materials.css";

const GlossaryExampleFigure = lazy(() =>
  import("./glossary/GlossaryExampleFigure").then((module) => ({
    default: module.GlossaryExampleFigure,
  })),
);
const READING_TABS = ["개념 이해", "설계 판단", "내 작업에 적용"];
const TOPIC_COPY: Record<string, string> = {
  foundations: "사용자 경험과 디자인의 기본 원리",
  research: "질문을 만들고, 관찰을 판단으로 연결하기",
  visual: "레이아웃·타이포그래피·색의 관계",
  interaction: "탐색과 입력, 상태와 전환 설계",
  systems: "일관된 규칙과 재사용 가능한 컴포넌트",
  accessibility: "다양한 조건에서 읽고 조작하는 경험",
  strategy: "문제와 목표, AI 결과의 검증",
  career: "설계의 근거를 기록하고 함께 전달하기",
  production: "색과 파일, 인쇄 결과를 연결하기",
  branding: "브랜드의 의미를 시각 언어로 표현하기",
};

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

export function DesignGuideContent({
  guide,
  onGuideChange,
}: {
  guide: StudyGuide;
  onGuideChange?: (id: string) => void;
}) {
  const titleId = useId();
  const tabsId = useId();
  const [activeTab, setActiveTab] = useState(0);
  const [activeSection, setActiveSection] = useState<number | null>(0);
  const [hasOpenedVisual, setHasOpenedVisual] = useState(false);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const sectionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const visual = guide.visualTermId ? getGlossaryLearning(guide.visualTermId) : undefined;
  const topicGuides = STUDY_GUIDES.filter((item) => item.topic === guide.topic);
  const topicIndex = topicGuides.findIndex((item) => item.id === guide.id);
  const nextGuide = topicIndex >= 0 ? topicGuides[topicIndex + 1] : undefined;
  return (
    <article className="study-guide" aria-labelledby={titleId} data-guide-id={guide.id}>
      <header className="study-guide-header">
        <p className="study-kicker">
          {TOPICS.find((topic) => topic.id === guide.topic)?.label ?? guide.category}
        </p>
        <h2 id={titleId} className="study-guide-title">
          {guide.title}
        </h2>
        <p className="study-guide-summary">{guide.summary}</p>
      </header>
      <div className="study-reading-tabs" role="tablist" aria-label="가이드 학습 단계">
        {READING_TABS.map((label, index) => (
          <button
            key={label}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`${tabsId}-tab-${index}`}
            aria-controls={`${tabsId}-panel-${index}`}
            aria-selected={activeTab === index}
            tabIndex={activeTab === index ? 0 : -1}
            onClick={() => setActiveTab(index)}
            onKeyDown={(event) => {
              let next: number | undefined;
              if (event.key === "ArrowRight") next = (index + 1) % READING_TABS.length;
              if (event.key === "ArrowLeft")
                next = (index + READING_TABS.length - 1) % READING_TABS.length;
              if (event.key === "Home") next = 0;
              if (event.key === "End") next = READING_TABS.length - 1;
              if (next !== undefined) {
                event.preventDefault();
                setActiveTab(next);
                tabRefs.current[next]?.focus();
              }
            }}
          >
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            {label}
          </button>
        ))}
      </div>
      <div
        className="study-reading-panel"
        role="tabpanel"
        id={`${tabsId}-panel-0`}
        aria-labelledby={`${tabsId}-tab-0`}
        hidden={activeTab !== 0}
        tabIndex={0}
      >
        <p className="study-guide-intro">{guide.intro}</p>
        <details className="study-objectives">
          <summary>
            이 가이드에서 배울 것 <span>{guide.objectives.length}가지</span>
          </summary>
          <ul>
            {guide.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </details>
        <div className="study-guide-sections" aria-label="핵심 개념">
          {guide.sections.map((section, index) => (
            <section className="study-guide-section" key={`${guide.id}-${index}`}>
              <h3>
                <button
                  ref={(node) => {
                    sectionRefs.current[index] = node;
                  }}
                  type="button"
                  aria-expanded={activeSection === index}
                  aria-controls={`${tabsId}-section-${index}`}
                  id={`${tabsId}-section-title-${index}`}
                  onClick={() => setActiveSection(activeSection === index ? null : index)}
                >
                  <span className="study-section-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{section.title}</span>
                  <ChevronDown size={18} aria-hidden="true" />
                </button>
              </h3>
              <div
                className="study-section-body"
                id={`${tabsId}-section-${index}`}
                role="region"
                aria-labelledby={`${tabsId}-section-title-${index}`}
                hidden={activeSection !== index}
              >
                <p>{section.body}</p>
                {section.bullets && section.bullets.length > 0 && (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
                {index < guide.sections.length - 1 && (
                  <button
                    type="button"
                    className="study-next-section"
                    onClick={() => {
                      setActiveSection(index + 1);
                      sectionRefs.current[index + 1]?.focus();
                    }}
                  >
                    다음 개념 <ArrowRight size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
            </section>
          ))}
        </div>
        {visual && (
          <details
            className="study-visual-disclosure"
            onToggle={(event) => {
              if (event.target === event.currentTarget && event.currentTarget.open)
                setHasOpenedVisual(true);
            }}
          >
            <summary>
              <span>
                <strong>시각 예시로 연결하기</strong>
                <small>개념이 화면과 작업물에서 어떻게 보이는지 살펴보세요.</small>
              </span>
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            {hasOpenedVisual && (
              <div className="study-guide-visual gl-lesson gp-lesson">
                <Suspense fallback={<p role="status">시각 예시를 불러오고 있습니다.</p>}>
                  <GlossaryExampleFigure figure={visual.figure} termId={visual.id} />
                </Suspense>
              </div>
            )}
          </details>
        )}
      </div>
      <div
        className="study-reading-panel"
        role="tabpanel"
        id={`${tabsId}-panel-1`}
        aria-labelledby={`${tabsId}-tab-1`}
        hidden={activeTab !== 1}
        tabIndex={0}
      >
        {guide.decision && (
          <section className="study-decision" aria-label="디자인 판단 따라가기">
            <div className="study-module-heading">
              <h3>디자인 판단 따라가기</h3>
              <p>학습용 가상 사례 · 상황에서 선택과 확인 방법까지 이어집니다.</p>
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
        {guide.pitfalls && guide.pitfalls.length > 0 && (
          <details className="study-pitfalls">
            <summary>흔히 놓치는 점</summary>
            <ul>
              {guide.pitfalls.map((pitfall) => (
                <li key={pitfall}>{pitfall}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
      <div
        className="study-reading-panel"
        role="tabpanel"
        id={`${tabsId}-panel-2`}
        aria-labelledby={`${tabsId}-tab-2`}
        hidden={activeTab !== 2}
        tabIndex={0}
      >
        {guide.exercise ? (
          <section className="study-exercise" aria-label="내 작업에 적용하기">
            <div className="study-module-heading">
              <h3>내 작업에 적용하기</h3>
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
            <h3>{guide.application.title}</h3>
            <p>{guide.application.prompt}</p>
          </section>
        ) : null}
        {nextGuide && (
          <nav className="study-next-guide" aria-label="다음 가이드">
            <a
              href={`/materials?guide=${encodeURIComponent(nextGuide.id)}`}
              onClick={(event) => {
                if (
                  onGuideChange &&
                  event.button === 0 &&
                  !event.metaKey &&
                  !event.ctrlKey &&
                  !event.shiftKey &&
                  !event.altKey
                ) {
                  event.preventDefault();
                  onGuideChange(nextGuide.id);
                }
              }}
            >
              <span>
                <small>다음 가이드</small>
                <strong>{nextGuide.title}</strong>
              </span>
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </nav>
        )}
      </div>
      <details className="study-related">
        <summary>
          함께 볼 용어 <span>{guide.relatedTerms.length}개</span>
        </summary>
        <ul>
          {guide.relatedTerms.map((term) => (
            <li key={term.id}>
              <GlossaryTermLink termId={term.id}>
                <span>
                  <strong lang="en">{term.english}</strong>
                  <span lang="ko">{term.korean}</span>
                </span>
                <ArrowRight size={15} aria-hidden="true" />
              </GlossaryTermLink>
            </li>
          ))}
        </ul>
      </details>
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

export function RelatedDesignGuides({ termId }: { termId: string }) {
  const headingId = useId();
  const guides = getGuidesForTerm(termId);
  if (!guides.length) return null;
  return (
    <section className="study-shared study-related-guides" aria-labelledby={headingId}>
      <header className="study-inline-heading">
        <h3 id={headingId}>이어서 공부하기</h3>
        <p>학습자료에서 관련 이론과 적용 방법을 살펴보세요.</p>
      </header>
      <ul className="study-related-links">
        {guides.map((guide) => (
          <li key={guide.id}>
            <a href={`/materials?guide=${encodeURIComponent(guide.id)}`}>
              <span>{guide.title}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

type StudyMaterialsProps = {
  guideId?: string | undefined;
  onGuideChange?: (id: string | undefined) => void;
};
export function StudyMaterials({ guideId, onGuideChange }: StudyMaterialsProps = {}) {
  const [localGuideId, setLocalGuideId] = useState(guideId);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("browse");
  const inputRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const returnRef = useRef<string | undefined>(undefined);
  const guideLinks = useRef(new Map<string, HTMLAnchorElement>());
  const requestedId = onGuideChange ? guideId : localGuideId;
  const selectedGuide = STUDY_GUIDES.find((guide) => guide.id === requestedId);
  const searchId = useId();
  const topicId = useId();
  const titleId = useId();
  const showTopics = topic === "browse" && !query.trim();
  const results = STUDY_GUIDES.filter(
    (guide) =>
      (topic === "browse" || topic === "all" || guide.topic === topic) &&
      matchesGuide(guide, query),
  );
  const availableTopics = TOPICS.filter((item) =>
    STUDY_GUIDES.some((guide) => guide.topic === item.id),
  );
  const changeGuide = (id: string | undefined) => {
    if (id && !selectedGuide) returnRef.current = id;
    if (onGuideChange) onGuideChange(id);
    else setLocalGuideId(id);
  };
  useEffect(() => {
    if (selectedGuide) readerRef.current?.focus();
    else if (returnRef.current) guideLinks.current.get(returnRef.current)?.focus();
  }, [requestedId, selectedGuide]);

  return (
    <section className="study-shared study-page" aria-labelledby={titleId}>
      <header className={`study-page-header${selectedGuide ? " study-page-header-reading" : ""}`}>
        <p className="study-kicker">DESIGN / STUDY LIBRARY</p>
        <div className="study-page-title-row">
          <h1 id={titleId}>학습자료</h1>
          <span>
            {STUDY_GUIDES.length}
            <small>GUIDES</small>
          </span>
        </div>
        {!selectedGuide && (
          <p className="study-page-intro">
            하나의 주제를 골라 개념을 연결하고, 설계의 이유를 자신의 작업에 적용해 보세요.
          </p>
        )}
      </header>
      {selectedGuide ? (
        <div
          ref={readerRef}
          tabIndex={-1}
          className="study-reader"
          aria-label={`${selectedGuide.title} 읽기`}
        >
          <div className="study-reader-toolbar">
            <button type="button" onClick={() => changeGuide(undefined)}>
              <ArrowLeft size={16} aria-hidden="true" />
              학습자료 목록
            </button>
            <span>주제별로 이어 배우기</span>
          </div>
          <DesignGuideContent
            key={selectedGuide.id}
            guide={selectedGuide}
            onGuideChange={changeGuide}
          />
        </div>
      ) : (
        <>
          {requestedId && (
            <p className="study-missing" role="status">
              이 가이드를 찾을 수 없습니다. 아래에서 다른 주제를 선택해 주세요.
            </p>
          )}
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
                <option value="browse">주제로 찾아보기</option>
                <option value="all">전체 가이드</option>
                {availableTopics.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </div>
          </div>
          <section className="study-topic-section" aria-labelledby={`${titleId}-topics`}>
            <div className="study-section-heading">
              <div>
                <h2 id={`${titleId}-topics`}>주제별로 이어 배우기</h2>
                <p>
                  {showTopics
                    ? "공부할 주제를 선택해 주세요."
                    : (TOPICS.find((item) => item.id === topic)?.label ??
                      "주제와 연결된 가이드를 살펴보세요.")}
                </p>
              </div>
              {showTopics ? (
                <button
                  className="study-quiet-button"
                  type="button"
                  onClick={() => setTopic("all")}
                >
                  전체 가이드 <ArrowRight size={15} aria-hidden="true" />
                </button>
              ) : (
                <button
                  className="study-quiet-button"
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setTopic("browse");
                  }}
                >
                  주제 목록 <ArrowLeft size={15} aria-hidden="true" />
                </button>
              )}
            </div>
            {showTopics ? (
              <ul className="study-topic-grid">
                {availableTopics.map((item, index) => (
                  <li key={item.id}>
                    <button type="button" onClick={() => setTopic(item.id)}>
                      <span className="study-topic-card-meta">
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <span>
                          {STUDY_GUIDES.filter((guide) => guide.topic === item.id).length}개 가이드
                        </span>
                      </span>
                      <strong>{item.label}</strong>
                      <span className="study-topic-description">
                        {TOPIC_COPY[item.id] ?? "관련 개념을 연결하고 작업에 적용하기"}
                      </span>
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <div className="study-result-meta">
                  <p role="status" aria-live="polite">
                    {query ? "검색 결과" : "학습 가이드"} {results.length}개
                  </p>
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setTopic("all");
                        inputRef.current?.focus();
                      }}
                    >
                      가이드 필터 초기화 <X size={13} aria-hidden="true" />
                    </button>
                  )}
                </div>
                <ul className="study-catalog-list" aria-label="주제별 학습 가이드">
                  {results.map((guide, index) => (
                    <li key={guide.id}>
                      <a
                        href={`/materials?guide=${encodeURIComponent(guide.id)}`}
                        ref={(node) => {
                          if (node) guideLinks.current.set(guide.id, node);
                          else guideLinks.current.delete(guide.id);
                        }}
                        onClick={(event) => {
                          if (
                            event.button === 0 &&
                            !event.metaKey &&
                            !event.ctrlKey &&
                            !event.shiftKey &&
                            !event.altKey
                          ) {
                            event.preventDefault();
                            changeGuide(guide.id);
                          }
                        }}
                      >
                        <span className="study-guide-number" aria-hidden="true">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="study-catalog-copy">
                          <strong>{guide.title}</strong>
                          <span>{guide.summary}</span>
                        </span>
                        <ArrowRight size={18} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
                {!results.length && (
                  <div className="study-empty">
                    <BookOpen size={25} aria-hidden="true" />
                    <p>일치하는 가이드가 없습니다.</p>
                    <span>다른 검색어를 입력하거나 주제를 변경해 보세요.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setTopic("all");
                        inputRef.current?.focus();
                      }}
                    >
                      전체 가이드 보기
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
          <p className="study-page-note">
            용어의 뜻과 시각 예시가 필요하다면{" "}
            <a href="/glossary">
              용어집에서 찾아보세요 <ArrowRight size={14} aria-hidden="true" />
            </a>
          </p>
        </>
      )}
    </section>
  );
}

export function GlossaryGuideLibrary() {
  return (
    <div className="study-shared study-library-shortcut">
      <a href="/materials">
        <BookOpen size={18} aria-hidden="true" />
        <span>주제별로 이어 배우기</span>
        <ArrowRight size={16} aria-hidden="true" />
      </a>
    </div>
  );
}
