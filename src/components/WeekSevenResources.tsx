import { useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
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

const buttonClass =
  "inline-flex min-h-11 items-center justify-center border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";
const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center border border-black bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

/** Rendered within the existing authenticated session route. */
export function WeekSevenResources({ sessionId }: { sessionId: string }) {
  if (sessionId !== "S07") return null;
  return <WeekSevenResourceContent />;
}

function WeekSevenResourceContent() {
  return (
    <section
      id="s07-practice"
      aria-labelledby="s07-practice-title"
      className="mt-8 space-y-10 border-t border-neutral-200 pt-8"
    >
      <header>
        <p className="text-xs font-semibold tracking-wide text-neutral-500">
          CLASS 07 · 순서대로 따라 하는 실습
        </p>
        <h2
          id="s07-practice-title"
          className="mt-2 break-keep text-xl font-bold leading-relaxed sm:text-2xl"
        >
          K-MOVE English Lab
        </h2>
        <p className="mt-3 break-keep text-sm leading-7 text-neutral-600">
          강의 시청, 말하기 연습, 문제 풀이, 복습이 이어지는 OPIc·TOEIC 학습 웹앱을 만듭니다.
          Gemini에서 기획하고 Google AI Studio에서 구현한 뒤, 실제 학습 과업으로 결과를 확인합니다.
        </p>
        <p className="mt-2 break-keep text-sm leading-7 text-neutral-600">
          강의 8개 · OPIc 질문 3개 · TOEIC 문항 6개로 시작합니다. 첫 버전의 개인 기록과 추가 자료는
          현재 브라우저에 저장하며, 공용 목록 연동은 이후 확장 단계입니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={WEEK_SEVEN_PROMPT_DOWNLOAD.url}
            download={WEEK_SEVEN_PROMPT_DOWNLOAD.fileName}
            className={primaryButtonClass}
          >
            전체 프롬프트 TXT 다운로드
          </a>
          <a href="#s07-submission" className={buttonClass}>
            최종 제출 안내
          </a>
        </div>
        <p className="mt-2 break-keep text-xs leading-6 text-neutral-500">
          다운로드 파일에는 STEP 1~5의 전체 프롬프트와 오류 수정용 프롬프트가 포함되어 있습니다.
          초기 학습 자료가 본문에 있어 별도 파일 첨부 없이 시작할 수 있습니다.
        </p>
      </header>

      <section aria-labelledby="s07-preparation-title" className="border border-neutral-200">
        <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
          <h3 id="s07-preparation-title" className="text-base font-bold">
            실습 시작 전
          </h3>
        </div>
        <div className="grid gap-7 px-5 py-5 sm:grid-cols-2 sm:px-6">
          <div>
            <h4 className="text-sm font-semibold">준비물</h4>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-neutral-600">
              {WEEK_SEVEN_PREPARATION.map((item) => (
                <li key={item} className="break-keep">
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="https://gemini.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass}
                aria-label="Gemini 열기 (새 탭)"
              >
                Gemini 열기 ↗
              </a>
              <a
                href="https://aistudio.google.com/apps"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass}
                aria-label="Google AI Studio Build 열기 (새 탭)"
              >
                AI Studio 열기 ↗
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold">이 순서로 진행하세요</h4>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-neutral-600">
              {WEEK_SEVEN_START_RULES.map((item) => (
                <li key={item} className="break-keep">
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <p className="border-t border-neutral-200 bg-neutral-50 px-5 py-4 text-sm leading-7 text-neutral-600 sm:px-6">
          Gemini만 사용한다면 STEP 2부터 Canvas 앱 제작 환경에서 이어가세요. AI Studio만 사용한다면
          STEP 1의 기획 조건과 STEP 2를 함께 첫 입력으로 사용하세요.
        </p>
      </section>

      <nav aria-label="7회차 실습 단계 바로가기">
        <h3 className="text-sm font-bold">실습 순서</h3>
        <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {WEEK_SEVEN_STEPS.map((step) => (
            <li key={step.number}>
              <a
                href={`#s07-step-${step.number}`}
                className="block h-full border border-neutral-300 px-4 py-3 hover:border-black hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <span className="block text-xs font-medium text-neutral-500">
                  STEP {step.number}
                </span>
                <span className="mt-1 block text-sm font-semibold">{step.shortTitle}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-10">
        {WEEK_SEVEN_STEPS.map((step) => (
          <PracticeStep key={step.number} step={step} />
        ))}
      </div>

      <section
        id="s07-troubleshooting"
        aria-labelledby="s07-troubleshooting-title"
        className="scroll-mt-24 border-t border-neutral-200 pt-8"
      >
        <h3 id="s07-troubleshooting-title" className="text-lg font-bold">
          오류가 생겼을 때
        </h3>
        <p className="mt-3 break-keep text-sm leading-7 text-neutral-600">
          문제가 발생한 화면과 재현 순서를 기록하세요. 오류 메시지나 화면 캡처를 첨부하고, 현재
          프로젝트의 같은 대화창에서 아래 프롬프트로 수정을 요청합니다.
        </p>
        <div className="mt-4 border-l-2 border-black bg-neutral-50 px-4 py-3 text-sm leading-7">
          <p className="font-semibold">마이크가 작동하지 않는다면</p>
          <p className="mt-1 break-keep text-neutral-600">
            마이크 권한과 장치 연결을 확인하세요. 미리보기의 권한 제한이 원인일 수 있으므로, 독립된
            HTTPS 실행 화면에서도 확인합니다. 직접 확인하지 못한 항목은 ‘확인 필요’로 기록하세요.
          </p>
        </div>
        <div className="mt-5">
          <CopyablePrompt title="오류 수정 프롬프트" prompt={WEEK_SEVEN_ERROR_PROMPT} />
        </div>
      </section>

      <section
        id="s07-submission"
        aria-labelledby="s07-submission-title"
        className="scroll-mt-24 border-t border-neutral-200 pt-8"
      >
        <h3 id="s07-submission-title" className="text-lg font-bold">
          최종 점검과 제출
        </h3>
        <p className="mt-3 text-sm leading-7 text-neutral-600">
          아래 항목을 직접 확인하고, 결과와 아직 확인하지 못한 항목을 제출 자료에 정리하세요.
        </p>
        <ul className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
          {WEEK_SEVEN_CHECKLIST.map((item, index) => (
            <li key={item}>
              <label className="flex cursor-pointer items-start gap-3 px-2 py-3 hover:bg-neutral-50">
                <input
                  type="checkbox"
                  name={`s07-check-${index + 1}`}
                  className="mt-1 h-4 w-4 shrink-0 accent-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                />
                <span className="min-w-0 break-keep text-sm leading-7">{item}</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-6 border border-neutral-200 px-5 py-5 sm:px-6">
          <h4 className="text-base font-bold">제출물</h4>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-neutral-600">
            {WEEK_SEVEN_SUBMISSIONS.map((item) => (
              <li key={item} className="break-keep">
                {item}
              </li>
            ))}
          </ol>
          <p className="mt-4 break-keep text-sm leading-7 text-neutral-600">
            공통 기능을 완성한 뒤 각자의 색상·정보 위계·강의 카드·모바일 탐색 방식을 발전시키세요.
            어떤 학습상의 불편을 발견했고 어떻게 바꿨는지 설명합니다.
          </p>
          <p className="mt-4 break-keep text-sm leading-7 text-neutral-600">
            과제&amp;피드백 상단에서 <strong className="text-black">7회차</strong>를 선택한 뒤,
            ‘과제와 피드백 자료 업로드’에 결과물을 등록하세요.
          </p>
          <Link to="/feedback" className={`${primaryButtonClass} mt-5`}>
            과제&amp;피드백 열기
          </Link>
        </div>
      </section>
    </section>
  );
}

function PracticeStep({ step }: { step: WeekSevenPracticeStep }) {
  const nextStep = WEEK_SEVEN_STEPS.find((item) => item.number === step.number + 1);
  return (
    <article
      id={`s07-step-${step.number}`}
      aria-labelledby={`s07-step-${step.number}-title`}
      className="scroll-mt-24 border border-neutral-200"
    >
      <header className="border-b border-neutral-200 px-5 py-5 sm:px-6">
        <p className="text-xs font-semibold tracking-wide text-neutral-500">STEP {step.number}</p>
        <h3
          id={`s07-step-${step.number}-title`}
          className="mt-2 break-keep text-lg font-bold leading-relaxed"
        >
          {step.title}
        </h3>
        <p className="mt-2 break-keep text-sm leading-7 text-neutral-600">{step.goal}</p>
        <p className="mt-3 break-keep text-sm leading-7">
          <span className="font-semibold">입력할 곳</span>
          <span className="mx-2 text-neutral-300" aria-hidden="true">
            /
          </span>
          {step.tool}
        </p>
      </header>
      <div className="space-y-6 px-5 py-5 sm:px-6">
        <div>
          <h4 className="text-sm font-bold">따라 할 일</h4>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-neutral-600">
            {step.actions.map((action) => (
              <li key={action} className="break-keep">
                {action}
              </li>
            ))}
          </ol>
        </div>
        <CopyablePrompt title={`STEP ${step.number} 프롬프트`} prompt={step.prompt} />
        <div className="grid gap-5 border-t border-neutral-200 pt-5 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-bold">다음 단계로 가기 전</h4>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-neutral-600">
              {step.checks.map((check) => (
                <li key={check} className="break-keep">
                  {check}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-neutral-50 px-4 py-4">
            <h4 className="text-sm font-bold">AI가 생성하는 동안</h4>
            <p className="mt-2 break-keep text-sm leading-7 text-neutral-600">{step.waiting}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a href="#s07-troubleshooting" className={`${buttonClass} text-neutral-600`}>
            오류 해결 도움말
          </a>
          <a
            href={nextStep ? `#s07-step-${nextStep.number}` : "#s07-submission"}
            className={primaryButtonClass}
          >
            {nextStep ? `다음 · STEP ${nextStep.number}` : "최종 점검과 제출"}
          </a>
        </div>
      </div>
    </article>
  );
}

function CopyablePrompt({ title, prompt }: { title: string; prompt: string }) {
  const id = useId();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [notice, setNotice] = useState("");
  const [copying, setCopying] = useState(false);

  const selectPrompt = () => {
    textarea.current?.focus();
    textarea.current?.select();
    textarea.current?.setSelectionRange(0, prompt.length);
    setNotice("전체 프롬프트가 선택되었습니다. Ctrl+C 또는 ⌘C로 복사하세요.");
  };

  const copyPrompt = async () => {
    setCopying(true);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(prompt);
      setNotice("전체 프롬프트를 복사했습니다. 안내된 도구의 대화창에 붙여넣으세요.");
    } catch {
      selectPrompt();
      setNotice("자동 복사가 제한되어 전체 내용을 선택했습니다. Ctrl+C 또는 ⌘C로 복사하세요.");
    } finally {
      setCopying(false);
    }
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <label htmlFor={`${id}-prompt`} className="text-sm font-bold">
          {title}
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={selectPrompt} className={buttonClass}>
            전체 선택
          </button>
          <button
            type="button"
            onClick={() => void copyPrompt()}
            disabled={copying}
            className={`${primaryButtonClass} disabled:cursor-wait disabled:opacity-60`}
            aria-label={`${title} 전체 복사`}
          >
            {copying ? "복사 중…" : "프롬프트 전체 복사"}
          </button>
        </div>
      </div>
      <textarea
        ref={textarea}
        id={`${id}-prompt`}
        readOnly
        value={prompt}
        rows={12}
        wrap="soft"
        spellCheck={false}
        aria-describedby={`${id}-notice`}
        className="block min-h-72 w-full resize-y rounded-none border border-neutral-300 bg-neutral-50 px-4 py-3 font-sans text-sm leading-7 text-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      />
      <p
        id={`${id}-notice`}
        role="status"
        aria-live="polite"
        className="mt-2 min-h-6 text-xs leading-6 text-neutral-600"
      >
        {notice || "본문을 스크롤해 읽거나, 전체 복사 버튼으로 모든 내용을 복사하세요."}
      </p>
    </div>
  );
}
