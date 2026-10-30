import { useId, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  RotateCw,
  Search,
  X,
  MousePointer2,
} from "lucide-react";
import { filterGlossary, GLOSSARY, GLOSSARY_SOURCE_URL, type GlossaryEntry } from "@/data/glossary";
import {
  VisualGlossaryLesson,
  VISUAL_LESSONS,
  type VisualLessonId,
} from "./glossary/VisualGlossaryLesson";
import "./glossary.css";

const PAGE_SIZE = 24;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const AVAILABLE_LETTERS = new Set(GLOSSARY.map((entry) => entry.letter));
const NUMBER_BY_ID = new Map(GLOSSARY.map((entry, index) => [entry.id, index + 1]));
const LESSON_BY_ENTRY: Record<string, VisualLessonId> = {
  "call-to-action-cta": "cta",
  "hamburger-menus": "hamburger",
  carousels: "carousel",
};
const LESSON_IDS: VisualLessonId[] = ["cta", "hamburger", "carousel"];

function GlossaryCard({
  entry,
  onLearn,
}: {
  entry: GlossaryEntry;
  onLearn: (lesson: VisualLessonId, trigger: HTMLButtonElement) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const descriptionId = useId();
  const [description, note] = entry.description.split("[실무 참고]");
  const number = String(NUMBER_BY_ID.get(entry.id)).padStart(3, "0");
  const lessonId = LESSON_BY_ENTRY[entry.id];
  const lesson = lessonId ? VISUAL_LESSONS[lessonId] : null;

  return (
    <div className="glossary-card-shell">
      <button
        type="button"
        className="glossary-card"
        aria-label={`${entry.english} — ${flipped ? "영어로 돌아가기" : "한국어 뜻 보기"}`}
        aria-pressed={flipped}
        aria-describedby={flipped ? descriptionId : undefined}
        data-flipped={flipped}
        onClick={() => setFlipped((value) => !value)}
      >
        <span className="glossary-card-inner">
          <span className="glossary-card-face glossary-card-front" aria-hidden={flipped}>
            <span className="flex items-center justify-between text-[11px] font-medium tracking-[0.12em] text-muted-foreground">
              <span>{number}</span>
              <span>EN → KR</span>
            </span>
            <span className="glossary-card-term">
              <span lang="en">{entry.english}</span>
              {lesson && (
                <span lang="ko" className="glossary-card-pronunciation">
                  [{lesson.pronunciation}] / {lesson.meaning}
                </span>
              )}
            </span>
            <span className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>클릭하여 뜻 보기</span>
              <RotateCw className="size-4" aria-hidden />
            </span>
          </span>
          <span className="glossary-card-face glossary-card-back" aria-hidden={!flipped}>
            <span className="flex items-center justify-between text-[11px] font-medium tracking-[0.12em] opacity-60">
              <span>{number}</span>
              <span>KR → EN</span>
            </span>
            <span id={descriptionId} className="my-5 block flex-1" lang="ko">
              <span className="block text-xl font-semibold leading-snug tracking-tight">
                {entry.korean}
              </span>
              <span className="mt-3 block whitespace-pre-line text-sm leading-[1.8] opacity-85">
                {description}
              </span>
              {note && (
                <span className="mt-3 block border-t border-current/25 pt-3 text-xs leading-[1.8] opacity-75">
                  <span className="mr-1 font-semibold">실무 참고</span>
                  {note.trim()}
                </span>
              )}
            </span>
            <span className="flex items-center justify-between gap-3 text-xs opacity-60">
              <span>클릭하여 영어 보기</span>
              <RotateCcw className="size-4" aria-hidden />
            </span>
          </span>
        </span>
      </button>
      {lesson && lessonId && (
        <button
          type="button"
          className="glossary-learn-button"
          aria-label={`${lesson.english} 핵심 구조와 직접 해보기`}
          onClick={(event) => onLearn(lessonId, event.currentTarget)}
        >
          <span>핵심 구조 · 직접 해보기</span>
          <ArrowUpRight className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function Glossary() {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const [activeLesson, setActiveLesson] = useState<VisualLessonId | null>(null);
  const lessonTriggerRef = useRef<HTMLButtonElement | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = filterGlossary(query, letter);
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visibleEntries = results.slice(start, start + PAGE_SIZE);

  function openLesson(lesson: VisualLessonId, trigger: HTMLButtonElement) {
    lessonTriggerRef.current = trigger;
    setActiveLesson(lesson);
  }

  function changePage(next: number) {
    setPage(next);
    resultsRef.current?.focus({ preventScroll: true });
    resultsRef.current?.scrollIntoView({ block: "start" });
  }

  function clearFilters() {
    setQuery("");
    setLetter("ALL");
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
          영어 용어를 먼저 떠올려 보세요. 카드를 누르면 한국어 뜻과 설명을 확인할 수 있습니다.
        </p>
      </header>

      <section className="glossary-visual-shortcuts" aria-labelledby="visual-lessons-title">
        <div className="glossary-visual-shortcuts-heading">
          <h2 id="visual-lessons-title">
            <MousePointer2 className="size-4" aria-hidden /> 눈으로 보고, 직접 해보기
          </h2>
          <p>핵심 구조를 먼저 익히고 실제 화면에서 조작해 보세요.</p>
        </div>
        <div className="glossary-visual-shortcut-list">
          {LESSON_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={(event) => openLesson(id, event.currentTarget)}
              aria-label={`${VISUAL_LESSONS[id].english} 시각 학습 열기`}
            >
              <span lang="en">{VISUAL_LESSONS[id].english}</span>
              <ArrowUpRight className="size-4" aria-hidden />
            </button>
          ))}
        </div>
      </section>

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
          <RotateCcw className="size-3.5" aria-hidden /> 모두 영어로
        </button>
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
            {letter === "ALL" ? "전체 용어" : `${letter}로 시작하는 용어`}{" "}
            <span className="ml-1 font-semibold text-foreground">{results.length}개</span>
            {query.trim() && <span> · 검색 결과</span>}
          </p>
          <span>ENGLISH → 한국어</span>
        </div>

        {results.length > 0 ? (
          <ul
            key={`${query}-${letter}-${page}-${resetKey}`}
            aria-label="용어 카드"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
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
              다른 검색어를 입력하거나 알파벳 필터를 변경해 보세요.
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
          Google UX Design Certificate · 비공식 한국어 참고 번역
          <br />
          원어와 실무 표현을 함께 정리했습니다.
        </p>
        <a
          href={GLOSSARY_SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 underline underline-offset-4 hover:text-foreground"
        >
          전체 번역 문서 <ArrowUpRight className="size-3.5" aria-hidden />
          <span className="sr-only"> (새 탭)</span>
        </a>
      </footer>
      <Dialog.Root
        open={activeLesson !== null}
        onOpenChange={(open) => {
          if (!open) setActiveLesson(null);
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
              {activeLesson ? VISUAL_LESSONS[activeLesson].english : "용어"} 시각 학습
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              핵심 구조를 보고, 직접 조작한 뒤 다른 형태를 비교하는 학습 화면입니다.
            </Dialog.Description>
            {activeLesson && <VisualGlossaryLesson key={activeLesson} lessonId={activeLesson} />}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
