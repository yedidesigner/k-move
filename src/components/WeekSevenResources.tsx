import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useWeekSevenProgress } from "@/hooks/use-week-seven-progress";
import {
  WEEK_SEVEN_CHECKLIST,
  WEEK_SEVEN_ERROR_PROMPT,
  WEEK_SEVEN_PREPARATION,
  WEEK_SEVEN_PROMPT_DOWNLOAD,
  WEEK_SEVEN_START_RULES,
  WEEK_SEVEN_STEPS,
  WEEK_SEVEN_SUBMISSIONS,
  type WeekSevenPracticeStep,
} from "@/data/week-seven-practice";

const focusClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";
const buttonClass = `inline-flex min-h-11 items-center justify-center gap-2 border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-100 ${focusClass}`;
const primaryClass = `inline-flex min-h-12 items-center justify-center gap-2 border border-black bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-200 disabled:text-neutral-500 ${focusClass}`;
const stages = [
  { number: 0, label: "실습 준비", detail: "도구와 진행 방법" },
  ...WEEK_SEVEN_STEPS.map((step) => ({
    number: step.number,
    label: step.shortTitle,
    detail: step.title,
  })),
  { number: 6, label: "점검·제출", detail: "결과물 정리하기" },
];

export function WeekSevenResources({ sessionId }: { sessionId: string }) {
  const { user, isStudentPreview } = useAuth();
  const userId = isStudentPreview ? null : user?.id ?? null;
  if (sessionId !== "S07") return null;
  return <WeekSevenWorkbook key={userId ?? "session"} userId={userId} />;
}

/** Student-facing workbook view; the session route retains the existing auth boundary. */
export function WeekSevenWorkbook({ userId }: { userId: string | null }) {
  const { activeStep, checks, setActiveStep, setCheck, storageState } =
    useWeekSevenProgress(userId);
  const heading = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLElement>(null);
  const moveFocus = useRef(false);
  const initializedHash = useRef(false);
  const completed = WEEK_SEVEN_STEPS.filter((step) =>
    step.checks.every((_, index) => checks[`step-${step.number}-${index}`]),
  ).map((step) => step.number);
  const step = WEEK_SEVEN_STEPS.find((item) => item.number === activeStep);
  const currentStage = stages.find((item) => item.number === activeStep)!;

  function navigate(number: number) {
    if (number === activeStep) return;
    moveFocus.current = true;
    setActiveStep(number);
  }

  // Keep links to the original STEP anchors useful without adding routing state.
  useEffect(() => {
    if (initializedHash.current) return;
    initializedHash.current = true;
    const hash = window.location.hash;
    const match = /^#s07-step-([1-5])$/.exec(hash);
    if (match) setActiveStep(Number(match[1]));
    else if (hash === "#s07-submission") setActiveStep(6);
    else if (hash === "#s07-preparation") setActiveStep(0);
  }, [setActiveStep]);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    heading.current?.focus({ preventScroll: true });
    panel.current?.scrollIntoView?.({ block: "start", behavior: "auto" });
    // Replace only our old lesson anchor, preserving unrelated URL state.
    if (/^#s07-/.test(window.location.hash)) {
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }, [activeStep]);

  return (
    <section id="s07-practice" aria-label="7회차 단계별 실습 워크북" className="mt-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-neutral-200 pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-sm font-bold">K-MOVE English Lab</p>
            <p className="text-xs text-neutral-500" aria-live="polite">
              {completed.length} / 5단계 완료
            </p>
          </div>
          <progress
            aria-label="완료한 실습 단계"
            max={5}
            value={completed.length}
            className="mt-2 block h-1.5 w-full max-w-64 overflow-hidden bg-neutral-100 accent-black [&::-webkit-progress-bar]:bg-neutral-100 [&::-webkit-progress-value]:bg-black [&::-moz-progress-bar]:bg-black"
          />
        </div>
        <a
          href={WEEK_SEVEN_PROMPT_DOWNLOAD.url}
          download={WEEK_SEVEN_PROMPT_DOWNLOAD.fileName}
          className={`inline-flex min-h-11 items-center gap-2 text-xs font-medium text-neutral-600 underline-offset-4 hover:text-black hover:underline ${focusClass}`}
        >
          <Download size={15} aria-hidden="true" /> 전체 프롬프트 TXT
        </a>
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[166px_minmax(0,1fr)] xl:gap-7">
        <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
          <nav aria-label="7회차 실습 단계" className="hidden xl:block">
            <p className="mb-3 text-xs font-semibold text-neutral-500">단계별 실습</p>
            <ol className="space-y-1">
              {stages.map((stage) => {
                const isActive = activeStep === stage.number;
                const isDone = completed.includes(stage.number);
                return (
                  <li key={stage.number}>
                    <button
                      type="button"
                      onClick={() => navigate(stage.number)}
                      aria-current={isActive ? "step" : undefined}
                      className={`flex min-h-16 w-full items-start gap-3 border-l-2 px-3 py-3 text-left ${isActive ? "border-black bg-neutral-100" : "border-transparent hover:bg-neutral-50"} ${focusClass}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 flex size-6 shrink-0 items-center justify-center border text-xs font-semibold ${isActive || isDone ? "border-black bg-black text-white" : "border-neutral-300 bg-white text-neutral-500"}`}
                      >
                        {isDone ? (
                          <Check size={14} />
                        ) : stage.number === 0 ? (
                          "·"
                        ) : stage.number === 6 ? (
                          "✓"
                        ) : (
                          stage.number
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{stage.label}</span>
                        <span className="mt-0.5 block text-xs text-neutral-500">
                          {isActive
                            ? "현재 단계"
                            : isDone
                              ? "확인 완료"
                              : stage.number === 0 || stage.number === 6
                                ? stage.detail
                                : `STEP ${stage.number}`}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
          <div className="flex items-center gap-3 border border-neutral-300 bg-white p-3 xl:hidden">
            <label
              htmlFor="s07-stage-select"
              className="shrink-0 text-xs font-semibold text-neutral-600"
            >
              단계 이동
            </label>
            <select
              id="s07-stage-select"
              value={activeStep}
              onChange={(event) => navigate(Number(event.target.value))}
              className={`min-h-11 w-full min-w-0 bg-white px-2 text-base font-semibold ${focusClass}`}
            >
              {stages.map((stage) => (
                <option key={stage.number} value={stage.number}>
                  {stage.number > 0 && stage.number < 6 ? `STEP ${stage.number} · ` : ""}
                  {stage.label}
                  {completed.includes(stage.number) ? " · 완료" : ""}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-3 text-xs leading-5 text-neutral-500">
            단계는 자유롭게 다시 열 수 있어요.
          </p>
          <p
            className="mt-2 text-xs leading-5 text-neutral-500"
            role={storageState === "unavailable" ? "status" : undefined}
          >
            {storageState === "saved"
              ? "실습 위치와 체크는 내 계정의 현재 브라우저에 저장됩니다."
              : storageState === "unavailable"
                ? "브라우저에 저장하지 못했습니다. 창을 닫기 전에 진행 위치를 메모해 주세요."
                : "현재 화면에서 실습 위치와 체크를 확인할 수 있습니다."}
          </p>
        </aside>

        <article
          ref={panel}
          id={
            activeStep === 0
              ? "s07-preparation"
              : activeStep === 6
                ? "s07-submission"
                : `s07-step-${activeStep}`
          }
          aria-labelledby="s07-stage-heading"
          className="min-w-0 scroll-mt-6 border border-neutral-200 bg-white"
        >
          <header className="border-b border-neutral-200 px-5 py-5 sm:px-7 sm:py-6">
            <p className="text-xs font-semibold tracking-wide text-neutral-500">
              {activeStep === 0
                ? "시작하기 전에"
                : activeStep === 6
                  ? "마무리"
                  : `STEP ${activeStep} OF 5`}
            </p>
            <h2
              ref={heading}
              id="s07-stage-heading"
              tabIndex={-1}
              className="mt-2 break-keep text-xl font-bold leading-snug outline-none sm:text-2xl"
            >
              {step?.title ?? currentStage.label}
            </h2>
            <p className="mt-3 break-keep text-sm leading-7 text-neutral-600">
              {step?.goal ??
                (activeStep === 0
                  ? "OPIc·TOEIC 학습 웹앱을 만듭니다. 한 단계씩 실행하고 결과를 확인한 뒤 다음으로 넘어가세요."
                  : "직접 확인한 결과와 남은 문제를 정리하고, 과제&피드백의 7회차에 결과물을 등록하세요.")}
            </p>
          </header>

          <div className="px-5 py-6 sm:px-7">
            {activeStep === 0 ? (
              <Preparation checks={checks} setCheck={setCheck} onStart={() => navigate(1)} />
            ) : step ? (
              <PracticeStep
                key={step.number}
                step={step}
                checks={checks}
                setCheck={setCheck}
                onNavigate={navigate}
              />
            ) : (
              <Submission checks={checks} setCheck={setCheck} onBack={() => navigate(5)} />
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

type CheckProps = {
  checks: Record<string, boolean>;
  setCheck: (id: string, checked: boolean) => void;
};

function Preparation({ checks, setCheck, onStart }: CheckProps & { onStart: () => void }) {
  return (
    <div className="space-y-7">
      <div className="border-l-2 border-black bg-neutral-50 px-4 py-4">
        <p className="text-sm font-bold">오늘 만들 결과물</p>
        <p className="mt-2 break-keep text-sm leading-7 text-neutral-600">
          강의 선택 → 말하기·문제 풀이 → 기록 확인 → 복습으로 이어지는 웹앱
        </p>
        <p className="mt-2 text-xs leading-6 text-neutral-500">
          강의 8개 · OPIc 질문 3개 · TOEIC 문항 6개가 프롬프트에 준비되어 있어요.
        </p>
      </div>
      <section aria-labelledby="s07-ready-heading">
        <h3 id="s07-ready-heading" className="text-base font-bold">
          준비물을 확인하세요
        </h3>
        <CheckList
          items={WEEK_SEVEN_PREPARATION}
          prefix="prep"
          checks={checks}
          setCheck={setCheck}
        />
      </section>
      <section aria-labelledby="s07-tools-heading">
        <h3 id="s07-tools-heading" className="text-base font-bold">
          두 도구를 열어두세요
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <ToolCard
            title="Gemini"
            detail="STEP 1 · 기획안 작성"
            url="https://gemini.google.com/"
            label="Gemini 열기"
          />
          <ToolCard
            title="Google AI Studio"
            detail="STEP 2~5 · 웹앱 제작·수정"
            url="https://aistudio.google.com/apps"
            label="AI Studio 열기"
          />
        </div>
      </section>
      <section aria-labelledby="s07-rules-heading">
        <h3 id="s07-rules-heading" className="text-base font-bold">
          이 순서만 기억하세요
        </h3>
        <ol className="mt-3 space-y-3">
          {WEEK_SEVEN_START_RULES.map((rule, index) => (
            <li key={rule} className="flex gap-3 text-sm leading-7 text-neutral-600">
              <span className="shrink-0 font-semibold text-black">{index + 1}.</span>
              <span className="break-keep">{rule}</span>
            </li>
          ))}
        </ol>
        <details className="mt-4 border-t border-neutral-200 pt-3">
          <summary className={`cursor-pointer py-2 text-sm font-medium ${focusClass}`}>
            Gemini 또는 AI Studio 하나만 사용한다면?
          </summary>
          <p className="mt-2 text-sm leading-7 text-neutral-600">
            Gemini만 사용한다면 STEP 2부터 Canvas 앱 제작 환경에서 이어가세요. AI Studio만
            사용한다면 STEP 1의 기획 조건과 STEP 2를 함께 첫 입력으로 사용하세요.
          </p>
        </details>
      </section>
      <div className="border-t border-neutral-200 pt-5">
        <button type="button" onClick={onStart} className={`${primaryClass} w-full sm:w-auto`}>
          STEP 1 시작하기 <ArrowRight size={16} aria-hidden="true" />
        </button>
        <p className="mt-3 text-xs leading-6 text-neutral-500">
          첫 버전의 개인 기록과 추가 자료는 현재 브라우저에 저장합니다. 공용 목록 연동은 이후 확장
          단계입니다.
        </p>
      </div>
    </div>
  );
}

function ToolCard({
  title,
  detail,
  url,
  label,
}: {
  title: string;
  detail: string;
  url: string;
  label: string;
}) {
  return (
    <div className="min-w-0 border border-neutral-200 p-4">
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs leading-6 text-neutral-500">{detail}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${buttonClass} mt-3 w-full`}
        aria-label={`${label} (새 탭)`}
      >
        {label}
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </div>
  );
}

function PracticeStep({
  step,
  checks,
  setCheck,
  onNavigate,
}: CheckProps & { step: WeekSevenPracticeStep; onNavigate: (step: number) => void }) {
  const ready = step.checks.every((_, index) => checks[`step-${step.number}-${index}`]);
  const target =
    step.number === 1
      ? "Gemini의 새 대화"
      : step.number === 2
        ? "AI Studio의 새 Web app"
        : "STEP 2에서 만든 AI Studio 프로젝트";
  const toolUrl =
    step.number === 1 ? "https://gemini.google.com/" : "https://aistudio.google.com/apps";
  const toolLabel =
    step.number === 1
      ? "Gemini 열기"
      : step.number === 2
        ? "AI Studio 열기"
        : "AI Studio 앱 목록 열기";
  const nextLabel = step.number === 5 ? "점검·제출" : `STEP ${step.number + 1}`;
  return (
    <div className="space-y-7">
      <section aria-label="이번 단계 진행 방법">
        <h3 className="text-base font-bold">지금 할 일</h3>
        <ol className="mt-3 space-y-2">
          {step.actions.map((action, index) => (
            <li key={action} className="flex gap-3 text-sm leading-7 text-neutral-600">
              <span className="shrink-0 font-semibold text-black">{index + 1}.</span>
              <span className="break-keep">{action}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="space-y-4">
        <CopyablePrompt
          title={`STEP ${step.number} 프롬프트`}
          prompt={step.prompt}
          target={target}
        />
        <div className="border border-neutral-200 bg-neutral-50 px-4 py-4 sm:px-5">
          <p className="text-xs font-semibold text-neutral-500">복사한 뒤 입력할 곳</p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="break-keep text-sm font-bold">{target}</p>
              <p className="mt-1 break-keep text-sm leading-7 text-neutral-600">
                {step.number === 1
                  ? "새 대화에 프롬프트를 붙여넣고, 나온 기획안을 저장하세요."
                  : step.number === 2
                    ? "STEP 1에서 받은 기획안도 함께 붙여넣으세요."
                    : "앱 목록에서 기존 프로젝트를 선택하세요. 새 프로젝트를 만들지 않고 같은 대화에서 이어갑니다."}
              </p>
            </div>
            <a
              href={toolUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${buttonClass} w-full sm:w-auto`}
              aria-label={`${toolLabel} (새 탭)`}
            >
              {toolLabel}
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <aside className="border-l-2 border-neutral-300 pl-4">
        <h3 className="text-sm font-semibold">AI가 만드는 동안 할 일</h3>
        <p className="mt-1 break-keep text-sm leading-7 text-neutral-600">{step.waiting}</p>
      </aside>

      <section
        aria-labelledby={`s07-checks-${step.number}`}
        className="border-t border-neutral-200 pt-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id={`s07-checks-${step.number}`} className="text-base font-bold">
            결과를 직접 확인하세요
          </h3>
          <span className="text-xs text-neutral-500">
            {step.checks.filter((_, index) => checks[`step-${step.number}-${index}`]).length} /{" "}
            {step.checks.length} 확인
          </span>
        </div>
        <CheckList
          items={step.checks}
          prefix={`step-${step.number}`}
          checks={checks}
          setCheck={setCheck}
        />
        <p className="mt-2 text-xs leading-6 text-neutral-500">
          체크는 내 실습 확인용입니다. 과제 제출이나 강사 평가로 처리되지 않습니다.
        </p>
      </section>

      <Troubleshooting />

      <footer className="border-t border-neutral-200 pt-5">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => onNavigate(step.number - 1)} className={buttonClass}>
            <ArrowLeft size={15} aria-hidden="true" />
            {step.number === 1 ? "실습 준비" : `STEP ${step.number - 1}`}
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => onNavigate(step.number + 1)}
            className={primaryClass}
          >
            {ready ? `확인 완료 · ${nextLabel}로` : "완료 기준을 체크해 주세요"}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
        {!ready && (
          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={() => onNavigate(step.number + 1)}
              className={`min-h-11 text-xs text-neutral-600 underline underline-offset-4 ${focusClass}`}
            >
              {nextLabel} 먼저 살펴보기
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}

function CheckList({
  items,
  prefix,
  checks,
  setCheck,
}: CheckProps & { items: string[]; prefix: string }) {
  return (
    <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
      {items.map((item, index) => {
        const id = `${prefix}-${index}`;
        return (
          <li key={id}>
            <label
              className={`flex min-h-12 cursor-pointer items-start gap-3 px-2 py-3 ${checks[id] ? "bg-neutral-50" : "hover:bg-neutral-50"}`}
            >
              <input
                type="checkbox"
                checked={!!checks[id]}
                onChange={(event) => setCheck(id, event.target.checked)}
                className={`mt-1 size-5 shrink-0 accent-black ${focusClass}`}
              />
              <span className="min-w-0 break-keep text-sm leading-7">{item}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function Submission({ checks, setCheck, onBack }: CheckProps & { onBack: () => void }) {
  return (
    <div className="space-y-7">
      <section aria-labelledby="s07-final-checks">
        <h3 id="s07-final-checks" className="text-base font-bold">
          마지막 사용 점검
        </h3>
        <p className="mt-2 text-sm leading-7 text-neutral-600">
          확인한 항목만 체크하세요. 확인하지 못한 기능은 이유와 함께 제출 자료에 적습니다.
        </p>
        <CheckList
          items={WEEK_SEVEN_CHECKLIST}
          prefix="final"
          checks={checks}
          setCheck={setCheck}
        />
      </section>
      <section aria-labelledby="s07-deliverables">
        <h3 id="s07-deliverables" className="text-base font-bold">
          제출할 자료 5가지
        </h3>
        <ol className="mt-3 space-y-3">
          {WEEK_SEVEN_SUBMISSIONS.map((item, index) => (
            <li key={item} className="flex gap-3 text-sm leading-7">
              <span className="shrink-0 font-semibold">{index + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm leading-7 text-neutral-600">
          공통 기능을 완성한 뒤 각자의 색상·정보 위계·강의 카드·모바일 탐색 방식을 발전시키세요.
          어떤 학습상의 불편을 발견했고 어떻게 바꿨는지 설명합니다.
        </p>
      </section>
      <section aria-labelledby="s07-upload-heading" className="border border-black p-5">
        <h3 id="s07-upload-heading" className="text-base font-bold">
          결과물은 여기에서 등록하세요
        </h3>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-7 text-neutral-600">
          <li>아래 버튼으로 과제&amp;피드백을 엽니다.</li>
          <li>
            상단 회차에서 <strong className="text-black">7회차</strong>를 선택합니다.
          </li>
          <li>‘과제와 피드백 자료 업로드’에 결과물을 등록합니다.</li>
        </ol>
        <Link to="/feedback" className={`${primaryClass} mt-4 w-full sm:w-auto`}>
          과제&amp;피드백 열기 <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <p className="mt-3 text-xs leading-6 text-neutral-500">
          이 화면에서 체크하는 것만으로 자료가 제출되지는 않습니다.
        </p>
      </section>
      <button type="button" onClick={onBack} className={buttonClass}>
        <ArrowLeft size={15} aria-hidden="true" />
        STEP 5 다시 보기
      </button>
    </div>
  );
}

function Troubleshooting() {
  return (
    <details className="group border border-neutral-200 px-4 sm:px-5">
      <summary
        className={`flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden ${focusClass}`}
      >
        진행이 막혔나요?
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="shrink-0 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="space-y-4 border-t border-neutral-200 py-5">
        <p className="text-sm leading-7 text-neutral-600">
          문제가 생긴 화면, 재현 순서, 오류 메시지를 기록하세요. 현재 프로젝트의 같은 대화에서 아래
          프롬프트로 수정을 요청합니다.
        </p>
        <p className="border-l-2 border-neutral-300 pl-3 text-sm leading-7 text-neutral-600">
          <strong className="text-black">마이크 문제</strong>는 권한과 장치 연결부터 확인하세요.
          미리보기에서 제한되면 독립된 HTTPS 실행 화면에서도 확인합니다. 직접 확인하지 못한 항목은
          ‘확인 필요’로 남깁니다.
        </p>
        <CopyablePrompt
          title="오류 수정 프롬프트"
          prompt={WEEK_SEVEN_ERROR_PROMPT}
          target="현재 프로젝트의 같은 대화"
        />
      </div>
    </details>
  );
}

function CopyablePrompt({
  title,
  prompt,
  target,
}: {
  title: string;
  prompt: string;
  target: string;
}) {
  const id = useId();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [selectAfterOpen, setSelectAfterOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!expanded || !selectAfterOpen || !textarea.current) return;
    textarea.current.focus();
    textarea.current.select();
    textarea.current.setSelectionRange(0, prompt.length);
    setSelectAfterOpen(false);
  }, [expanded, selectAfterOpen, prompt]);

  function selectPrompt() {
    setExpanded(true);
    setSelectAfterOpen(true);
    setNotice(
      "전체 내용을 선택했습니다. Ctrl+C 또는 ⌘C로 복사하세요. 모바일에서는 선택된 글을 길게 눌러 복사할 수 있습니다.",
    );
  }

  async function copyPrompt() {
    setCopying(true);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setNotice(`전체 프롬프트를 복사했습니다. ${target}에 붙여넣으세요.`);
    } catch {
      setCopied(false);
      setExpanded(true);
      setSelectAfterOpen(true);
      setNotice(
        "자동 복사가 제한되어 전문을 열고 전체 내용을 선택했습니다. Ctrl+C 또는 ⌘C로 복사하세요. 모바일에서는 선택된 글을 길게 눌러 복사할 수 있습니다.",
      );
    } finally {
      setCopying(false);
    }
  }

  return (
    <section aria-label={title} className="border border-neutral-300 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold">{title}</h3>
          <p className="mt-1 text-xs leading-6 text-neutral-500">
            복사 버튼을 누르면 전체 내용이 복사됩니다.
          </p>
        </div>
        <button
          type="button"
          disabled={copying}
          onClick={() => void copyPrompt()}
          aria-label={`${title} 전체 복사`}
          className={`${primaryClass} w-full sm:w-auto`}
        >
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copying ? "복사 중…" : copied ? "복사 완료 · 다시 복사" : "프롬프트 복사"}
        </button>
      </div>
      <p
        id={`${id}-notice`}
        role="status"
        aria-live="polite"
        className="mt-3 text-xs leading-6 text-neutral-600"
      >
        {notice || `복사한 뒤 ${target}에서 실행하세요.`}
      </p>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={`${id}-full`}
        onClick={() => setExpanded((value) => !value)}
        className={`mt-2 inline-flex min-h-11 items-center gap-2 text-xs font-medium text-neutral-600 ${focusClass}`}
      >
        {expanded ? "프롬프트 전문 접기" : "프롬프트 전문 보기"}
        <ChevronDown size={14} aria-hidden="true" className={expanded ? "rotate-180" : ""} />
      </button>
      {expanded && (
        <div id={`${id}-full`} className="mt-2">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={`${id}-prompt`} className="text-xs font-semibold">
              {title} 전문
            </label>
            <button type="button" onClick={selectPrompt} className={buttonClass}>
              전체 선택
            </button>
          </div>
          <textarea
            ref={textarea}
            id={`${id}-prompt`}
            readOnly
            value={prompt}
            rows={10}
            wrap="soft"
            spellCheck={false}
            aria-describedby={`${id}-notice`}
            className={`block w-full resize-y rounded-none border border-neutral-300 bg-neutral-50 p-3 font-sans text-base leading-7 text-neutral-800 ${focusClass}`}
          />
        </div>
      )}
    </section>
  );
}
