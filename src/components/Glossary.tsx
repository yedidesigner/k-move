import { lazy, Suspense, useId, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  RotateCw,
  Search,
  X,
} from "lucide-react";
import {
  filterGlossary,
  GLOSSARY,
  GLOSSARY_SOURCE_URL,
  LEARNING_FILTERS,
  type GlossaryEntry,
  type GlossaryFilter,
} from "@/data/glossary";
import { VisualGlossaryLesson, VISUAL_LESSONS } from "./glossary/VisualGlossaryLesson";
import { getGlossaryPractice, hasGlossaryPractice } from "@/data/glossary-practice";
import { getGlossaryLearning, LEARNING_LABELS } from "@/data/glossary-learning";
import "./glossary.css";

const GlossaryLearningLesson = lazy(() =>
  import("./glossary/GlossaryLearningLesson").then((module) => ({
    default: module.GlossaryLearningLesson,
  })),
);

const PAGE_SIZE = 24;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const AVAILABLE_LETTERS = new Set(GLOSSARY.map((entry) => entry.letter));

function GlossaryCard({
  entry,
  onLearn,
}: {
  entry: GlossaryEntry;
  onLearn: (entry: GlossaryEntry, trigger: HTMLButtonElement) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const descriptionId = useId();
  const [description, note] = entry.description.split("[실무 참고]");
  const lessonId = entry.lessonId;
  const lesson = lessonId ? VISUAL_LESSONS[lessonId] : null;
  const english = lesson?.english ?? entry.english;
  const hasPractice = hasGlossaryPractice(entry);
  const learning = getGlossaryLearning(entry.id);

  return (
    <div
      className="glossary-card-shell"
      data-interactive={hasPractice}
      data-learning-mode={learning?.mode}
    >
      <button
        type="button"
        className="glossary-card"
        aria-label={`${english} — ${flipped ? "용어로 돌아가기" : "설명 보기"}`}
        aria-pressed={flipped}
        aria-describedby={flipped ? descriptionId : undefined}
        data-flipped={flipped}
        onClick={() => setFlipped((value) => !value)}
      >
        <span className="glossary-card-inner">
          <span className="glossary-card-face glossary-card-front" aria-hidden={flipped}>
            {learning && (
              <span className="glossary-interactive-badge">{LEARNING_LABELS[learning.mode]}</span>
            )}
            <span className="glossary-card-term">
              <span lang="en">{english}</span>
              <span lang="ko" className="glossary-card-pronunciation">
                [{entry.pronunciation}] / {entry.korean}
              </span>
            </span>
            <span className="glossary-card-action">
              <span>뒤집어 설명 보기</span>
              <RotateCw className="size-4" aria-hidden />
            </span>
          </span>
          <span className="glossary-card-face glossary-card-back" aria-hidden={!flipped}>
            <span id={descriptionId} className="glossary-card-explanation" lang="ko">
              <span className="glossary-card-back-term" lang="en">
                {english}
              </span>
              <span className="glossary-card-meaning">{entry.korean}</span>
              <span className="glossary-card-definition">{description}</span>
              <span className="glossary-card-example">
                <span className="glossary-card-example-label">예시</span>
                {entry.example}
              </span>
              {note && (
                <span className="mt-3 block border-t border-current/25 pt-3 text-xs leading-[1.8] opacity-75">
                  <span className="mr-1 font-semibold">실무 참고</span>
                  {note.trim()}
                </span>
              )}
            </span>
            <span className="glossary-card-action">
              <span>용어로 돌아가기</span>
              <RotateCcw className="size-4" aria-hidden />
            </span>
          </span>
        </span>
      </button>
      {learning && (
        <button
          type="button"
          className="glossary-learn-button"
          aria-label={`${english} ${hasPractice ? "예시와 직접 해보기" : "시각 예시 보기"}`}
          onClick={(event) => onLearn(entry, event.currentTarget)}
        >
          <span>{hasPractice ? "예시 · 직접 해보기" : "시각 예시 보기"}</span>
          <ArrowUpRight className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function Glossary({ initialQuery = "" }: { initialQuery?: string } = {}) {
  const [query, setQuery] = useState(initialQuery);
  const [letter, setLetter] = useState("ALL");
  const [filter, setFilter] = useState<GlossaryFilter>("all");
  const [page, setPage] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const [activeEntry, setActiveEntry] = useState<GlossaryEntry | null>(null);
  const lessonTriggerRef = useRef<HTMLButtonElement | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = filterGlossary(query, letter, filter);
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visibleEntries = results.slice(start, start + PAGE_SIZE);
  const activePractice = activeEntry ? getGlossaryPractice(activeEntry.id) : undefined;
  const activeLearning = activeEntry ? getGlossaryLearning(activeEntry.id) : undefined;

  function openLesson(entry: GlossaryEntry, trigger: HTMLButtonElement) {
    lessonTriggerRef.current = trigger;
    setActiveEntry(entry);
  }

  function changePage(next: number) {
    setPage(next);
    resultsRef.current?.focus({ preventScroll: true });
    resultsRef.current?.scrollIntoView({ block: "start" });
  }

  function clearFilters() {
    setQuery("");
    setLetter("ALL");
    setFilter("all");
    setPage(1);
    inputRef.current?.focus();
  }

  return (
    <section aria-labelledby="glossary-title">
      <header className="mb-7 border-b border-foreground pb-6">
        <p className="mb-3 text-[11px] font-medium tracking-[0.18em] text-muted-foreground">
          UX / UI GLOSSARY
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1 id="glossary-title" className="text-3xl font-bold tracking-tight md:text-4xl">
            용어집
          </h1>
          <span className="text-xs tracking-[0.1em] text-muted-foreground">
            <strong className="mr-1.5 text-xl font-medium tracking-tight text-foreground">
              {GLOSSARY.length}
            </strong>{" "}
            TERMS
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          카드를 뒤집어 뜻을 읽고, 시각 예시로 이해해 보세요. 조작이 도움이 되는 용어에는 실습이
          함께 있습니다.
        </p>
      </header>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="glossary-search" className="sr-only">
            용어 검색
          </label>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            ref={inputRef}
            id="glossary-search"
            type="search"
            autoComplete="off"
            placeholder="영어 · 한국어로 검색"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            className="glossary-search min-h-12 w-full border border-border bg-card py-3 pl-11 pr-12 text-sm placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              aria-label="검색어 지우기"
              onClick={() => {
                setQuery("");
                setPage(1);
                inputRef.current?.focus();
              }}
              className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setResetKey((value) => value + 1)}
          className="inline-flex min-h-12 items-center justify-center gap-2 border border-border bg-card px-4 text-xs font-medium transition-colors hover:bg-muted"
        >
          <RotateCcw className="size-3.5" aria-hidden /> 카드 초기화
        </button>
      </div>

      <div role="group" aria-label="학습 유형 필터" className="glossary-type-filters">
        {LEARNING_FILTERS.map(({ value, label, count }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => {
              setFilter(value);
              setPage(1);
            }}
          >
            {label} <span>{count}</span>
          </button>
        ))}
      </div>

      <div
        role="group"
        aria-label="알파벳 필터"
        className="flex gap-1.5 overflow-x-auto border-b border-border pb-5 sm:flex-wrap sm:overflow-visible"
      >
        {["ALL", ...ALPHABET].map((item) => (
          <button
            key={item}
            type="button"
            aria-label={item === "ALL" ? "전체 알파벳" : `${item}로 시작하는 용어`}
            aria-pressed={letter === item}
            disabled={item !== "ALL" && !AVAILABLE_LETTERS.has(item)}
            onClick={() => {
              setLetter(item);
              setPage(1);
            }}
            className={`flex min-h-11 min-w-11 shrink-0 items-center justify-center border px-2.5 text-xs font-medium transition-colors disabled:cursor-default disabled:opacity-25 ${letter === item ? "border-primary bg-primary text-primary-foreground" : "border-transparent hover:enabled:border-border hover:enabled:bg-card"}`}
          >
            {item === "ALL" ? "전체" : item}
          </button>
        ))}
      </div>

      <div ref={resultsRef} tabIndex={-1} aria-label="용어 검색 결과" className="scroll-mt-6">
        <div className="flex min-h-16 items-center justify-between gap-3 text-xs text-muted-foreground">
          <p role="status" aria-live="polite">
            {filter === "all"
              ? "전체 용어"
              : LEARNING_FILTERS.find((item) => item.value === filter)?.label}
            {letter !== "ALL" && ` · ${letter}`}{" "}
            <span className="ml-1 font-semibold text-foreground">{results.length}개</span>
            {query.trim() && <span> · 검색 결과</span>}
          </p>
          <span>A–Z</span>
        </div>

        {results.length > 0 ? (
          <ul
            key={`${query}-${letter}-${filter}-${page}-${resetKey}`}
            aria-label="용어 카드"
            className="glossary-card-grid"
          >
            {visibleEntries.map((entry) => (
              <li key={entry.id} className="min-w-0">
                <GlossaryCard entry={entry} onLearn={openLesson} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="border border-border bg-card px-5 py-14 text-center">
            <p className="font-semibold">일치하는 용어가 없습니다.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              다른 검색어를 입력하거나 학습 유형과 알파벳 필터를 변경해 보세요.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 min-h-11 border border-foreground px-5 text-sm font-medium hover:bg-muted"
            >
              전체 용어 보기
            </button>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <nav
          aria-label="용어집 페이지"
          className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs"
        >
          <p className="tabular-nums text-muted-foreground">
            {start + 1}–{Math.min(start + PAGE_SIZE, results.length)} / {results.length}
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="이전 페이지"
              disabled={page === 1}
              onClick={() => changePage(page - 1)}
              className="flex min-h-11 items-center gap-1.5 border border-border bg-card px-3 hover:enabled:bg-muted disabled:opacity-30"
            >
              <ChevronLeft className="size-4" aria-hidden /> 이전
            </button>
            <span aria-label={`${pageCount}페이지 중 ${page}페이지`} className="tabular-nums">
              {page} / {pageCount}
            </span>
            <button
              type="button"
              aria-label="다음 페이지"
              disabled={page === pageCount}
              onClick={() => changePage(page + 1)}
              className="flex min-h-11 items-center gap-1.5 border border-border bg-card px-3 hover:enabled:bg-muted disabled:opacity-30"
            >
              다음 <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </nav>
      )}

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 text-[11px] leading-relaxed text-muted-foreground">
        <p>
          용어 목록 원본: Google UX Design Certificate · 비공식 한국어 참고 자료
          <br />
          실무에서 쓰는 원어·외래어는 살리고, 설명은 한국어로 정리했습니다.
        </p>
        <a
          href="/materials"
          className="inline-flex min-h-11 items-center gap-1.5 underline underline-offset-4 hover:text-foreground"
        >
          주제별 학습 가이드 <ArrowUpRight className="size-3.5" aria-hidden />
        </a>
        <a
          href={GLOSSARY_SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 underline underline-offset-4 hover:text-foreground"
        >
          용어 목록 원본 <ArrowUpRight className="size-3.5" aria-hidden />
          <span className="sr-only"> (새 탭)</span>
        </a>
      </footer>
      <Dialog.Root
        open={activeEntry !== null}
        onOpenChange={(open) => {
          if (!open) setActiveEntry(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="glossary-lesson-overlay" />
          <Dialog.Content
            className="glossary-lesson-dialog"
            onEscapeKeyDown={(event) => {
              if (
                event.target instanceof Element &&
                event.target.closest(
                  '.vux-cta[data-panel-open="true"], .vux-studio[data-menu-open="true"]',
                )
              )
                event.preventDefault();
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              lessonTriggerRef.current?.focus();
            }}
          >
            <div className="glossary-lesson-toolbar">
              <span>
                K-MOVE <span className="glossary-lesson-toolbar-divider">/</span> VISUAL GLOSSARY
              </span>
              <Dialog.Close className="glossary-lesson-close" aria-label="학습 화면 닫기">
                <X size={20} aria-hidden />
                <span>닫기</span>
              </Dialog.Close>
            </div>
            <Dialog.Title className="sr-only">
              {activeEntry
                ? activeEntry.lessonId
                  ? VISUAL_LESSONS[activeEntry.lessonId].english
                  : activeEntry.english
                : "용어"}{" "}
              학습
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              용어에 맞는 시각 예시와 관찰 포인트를 보고 이해하는 학습 화면입니다. 조작이 도움이
              되는 용어에는 실습이 함께 제공됩니다.
            </Dialog.Description>
            {activeEntry?.lessonId && activeLearning?.mode === "practice" ? (
              <VisualGlossaryLesson key={activeEntry.id} lessonId={activeEntry.lessonId} />
            ) : activeEntry && activeLearning ? (
              <Suspense
                fallback={
                  <p className="p-8" role="status">
                    학습 예시를 불러오고 있습니다.
                  </p>
                }
              >
                <GlossaryLearningLesson
                  key={activeEntry.id}
                  entry={activeEntry}
                  learning={activeLearning}
                  practice={activePractice}
                />
              </Suspense>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
