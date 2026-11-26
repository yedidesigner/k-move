import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { CopyablePrompt } from "@/components/WeekSevenResources";
import { WEEK_SIX_ROUTES, WEEK_SIX_STEPS, getWeekSixPrompt } from "@/data/week-six-practice";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";
const button = `inline-flex min-h-11 items-center justify-center gap-2 border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-neutral-100 ${focus}`;
const primary = `inline-flex min-h-12 items-center justify-center gap-2 border border-black bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800 ${focus}`;
type ResearchRoute = (typeof WEEK_SIX_ROUTES)[number]["id"];
type Progress = {
  stage: number;
  route: ResearchRoute | null;
  done: number[];
  industry: string;
  sourceTab: string;
  task: string;
};

const initial: Progress = {
  stage: 0,
  route: null,
  done: [],
  industry: "",
  sourceTab: "",
  task: "",
};
const validStep = (step: unknown): step is number =>
  typeof step === "number" && Number.isInteger(step) && step >= 0 && step < WEEK_SIX_STEPS.length;

function restore(key: string | null): Progress {
  if (!key || typeof window === "undefined") return initial;
  try {
    const data = JSON.parse(window.localStorage.getItem(key) ?? "null");
    if (data?.v !== 1) return initial;
    return {
      stage: validStep(data.stage) ? data.stage : 0,
      route: WEEK_SIX_ROUTES.find((item) => item.id === data.route)?.id ?? null,
      done: Array.isArray(data.done) ? [...new Set<number>(data.done.filter(validStep))] : [],
      industry: typeof data.industry === "string" ? data.industry : "",
      sourceTab: typeof data.sourceTab === "string" ? data.sourceTab : "",
      task: typeof data.task === "string" ? data.task : "",
    };
  } catch {
    return initial;
  }
}

export function WeekSixResources() {
  const { user, isStudentPreview } = useAuth();
  const userId = isStudentPreview ? null : (user?.id ?? null);
  return <WeekSixWorkbook key={userId ?? "preview"} userId={userId} />;
}

export function WeekSixWorkbook({ userId }: { userId: string | null }) {
  const storageKey = userId ? `kmove:s06-workbook:v1:${userId}` : null;
  const [progress, setProgress] = useState(() => restore(storageKey));
  const [storageError, setStorageError] = useState(false);
  const changed = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const moveFocus = useRef(false);
  const { stage, route, done } = progress;
  const step = WEEK_SIX_STEPS[stage]!;
  const chosen = WEEK_SIX_ROUTES.find((item) => item.id === route);
  const prompt = chosen
    ? getWeekSixPrompt(chosen.id, progress.industry, progress.sourceTab, progress.task)
    : "";
  const last = stage === WEEK_SIX_STEPS.length - 1;

  useEffect(() => {
    if (!changed.current || !storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ v: 1, ...progress }));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [storageKey, progress]);

  useEffect(() => {
    if (moveFocus.current) {
      moveFocus.current = false;
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView?.({ block: "start" });
    }
  }, [stage]);

  function update(patch: Partial<Progress>) {
    changed.current = true;
    setProgress((previous) => ({ ...previous, ...patch }));
  }
  function go(index: number) {
    if (index === stage || !validStep(index)) return;
    moveFocus.current = true;
    update({ stage: index });
  }
  function toggleDone() {
    update({
      done: done.includes(stage) ? done.filter((value) => value !== stage) : [...done, stage],
    });
  }

  return (
    <section aria-label="6회차 단계별 실습 워크북" className="mt-5">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-y border-neutral-200 py-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-600">
            개인 프로젝트 · 6교시 · 교시당 50분
          </p>
          <p className="mt-1 break-keep text-base font-bold">
            미국 브랜드 10곳 이상 조사 · 후보 3곳 비교 · 최종 1곳 선정
          </p>
        </div>
        <div className="w-full sm:w-36">
          <p className="mb-1.5 text-xs font-medium text-neutral-600" aria-live="polite">
            내 진행률 {done.length} / {WEEK_SIX_STEPS.length}
          </p>
          <progress
            aria-label="완료한 실습 단계"
            value={done.length}
            max={WEEK_SIX_STEPS.length}
            className="block h-1.5 w-full bg-neutral-100 accent-black [&::-webkit-progress-bar]:bg-neutral-100 [&::-webkit-progress-value]:bg-black [&::-moz-progress-bar]:bg-black"
          />
        </div>
      </div>
      <div className="grid min-w-0 gap-5 lg:grid-cols-[10.5rem_minmax(0,1fr)] lg:gap-7">
        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          <nav aria-label="6회차 실습 단계" className="hidden lg:block">
            <ol className="space-y-1">
              {WEEK_SIX_STEPS.map((item, index) => (
                <li key={item.shortTitle}>
                  <button
                    type="button"
                    onClick={() => go(index)}
                    aria-current={index === stage ? "step" : undefined}
                    className={`flex min-h-14 w-full items-center gap-3 border-l-2 px-3 py-2 text-left ${focus} ${index === stage ? "border-black bg-neutral-100" : "border-transparent hover:bg-neutral-50"}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex size-6 shrink-0 items-center justify-center border text-xs font-semibold ${index === stage || done.includes(index) ? "border-black bg-black text-white" : "border-neutral-300 text-neutral-600"}`}
                    >
                      {done.includes(index) ? <Check size={14} /> : index + 1}
                    </span>
                    <span className="text-sm font-semibold">
                      {item.shortTitle}
                      {done.includes(index) && <span className="sr-only"> 완료</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <label className="flex items-center gap-3 border border-neutral-300 p-2.5 text-sm font-semibold lg:hidden">
            <span className="shrink-0 pl-1">교시 이동</span>
            <select
              className={`min-h-11 min-w-0 flex-1 bg-white text-base ${focus}`}
              value={stage}
              onChange={(e) => go(Number(e.target.value))}
            >
              {WEEK_SIX_STEPS.map((item, index) => (
                <option key={item.shortTitle} value={index}>
                  {index + 1}교시 · {item.shortTitle}
                  {done.includes(index) ? " · 완료" : ""}
                </option>
              ))}
            </select>
          </label>
          <p
            className="mt-3 text-xs leading-5 text-neutral-500"
            role={storageError ? "status" : undefined}
          >
            {storageError
              ? "현재 브라우저에서 진행률을 저장할 수 없습니다."
              : userId
                ? "진행률과 입력값은 이 계정의 현재 브라우저에 저장됩니다."
                : "미리보기의 진행률은 이 화면에서만 유지됩니다."}
          </p>
        </aside>

        <article
          aria-labelledby="s06-heading"
          className="min-w-0 border border-neutral-200 bg-white"
        >
          <header className="border-b border-neutral-200 p-5 sm:px-7 sm:py-6">
            <p className="text-sm font-semibold text-neutral-500">{stage + 1}교시 · 50분</p>
            <h2
              id="s06-heading"
              ref={heading}
              tabIndex={-1}
              className="mt-2 scroll-mt-6 break-keep text-xl font-bold outline-none sm:text-2xl"
            >
              {step.title}
            </h2>
            <p className="mt-2 break-keep text-sm leading-7 text-neutral-600">
              <strong className="mr-2 text-black">결과물</strong>
              {step.output}
            </p>
          </header>

          <div className="space-y-6 p-5 sm:p-7">
            <ol aria-label="이번 교시에 할 일" className="space-y-2">
              {step.instructions.map((line, index) => (
                <li key={line} className="flex items-baseline gap-3 text-sm leading-7">
                  <span className="shrink-0 font-bold text-neutral-500">{index + 1}.</span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>

            {stage === 0 && (
              <>
                <fieldset>
                  <legend className="text-base font-bold">내 조사 상태를 선택하세요</legend>
                  <div className="mt-3 grid gap-2">
                    {WEEK_SIX_ROUTES.map((item) => (
                      <label
                        key={item.id}
                        className={`flex cursor-pointer items-start gap-3 border p-3.5 hover:bg-neutral-50 focus-within:outline focus-within:outline-2 ${route === item.id ? "border-black bg-neutral-50" : "border-neutral-200"}`}
                      >
                        <input
                          type="radio"
                          name="s06-route"
                          value={item.id}
                          checked={route === item.id}
                          onChange={() => update({ route: item.id })}
                          className="mt-1 size-4 shrink-0 accent-black"
                        />
                        <span>
                          <strong className="block text-sm">
                            {item.id.toUpperCase()} · {item.label}
                          </strong>
                          <span className="mt-0.5 block text-sm leading-6 text-neutral-600">
                            {item.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                {chosen && (
                  <>
                    <fieldset className="space-y-3">
                      <legend className="text-base font-bold">프롬프트에 넣을 내 조사 조건</legend>
                      {(
                        [
                          ["industry", "조사 산업군", "예: 니치 향수"],
                          ["sourceTab", "기존 탭 이름", "예: 향수 브랜드 조사 또는 없음"],
                          [
                            "task",
                            "방문자가 하려는 행동",
                            "예: 우디 계열 향수 두 개의 향조를 비교한다",
                          ],
                        ] as const
                      ).map(([field, label, placeholder]) => (
                        <label key={field} className="grid gap-1 text-sm font-medium">
                          {label}
                          <input
                            type="text"
                            autoComplete="off"
                            maxLength={180}
                            value={progress[field]}
                            placeholder={placeholder}
                            onChange={(e) => update({ [field]: e.target.value })}
                            className={`min-h-11 w-full min-w-0 border border-neutral-300 px-3 text-base font-normal ${focus}`}
                          />
                        </label>
                      ))}
                    </fieldset>
                    <CopyablePrompt
                      key={prompt}
                      title={`${chosen.id.toUpperCase()} 유형 · 공통 + 맞춤 프롬프트`}
                      prompt={prompt}
                      target="개인 Google Sheets의 Gemini 측면 패널"
                    />
                  </>
                )}
                <div className="border-l-2 border-black bg-neutral-50 p-4">
                  <p className="text-sm font-bold">프롬프트를 입력할 곳</p>
                  <p className="mt-1 text-sm leading-7 text-neutral-700">
                    개인 Google Sheets 파일을 열고 오른쪽 Gemini 패널에 붙여넣으세요. 기존 자료가
                    있으면 그 파일에서 시작하세요.
                  </p>
                  <a
                    href="https://sheets.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className={`${button} mt-3`}
                  >
                    Google Sheets 열기 <ExternalLink size={14} aria-hidden="true" />
                  </a>
                  <details className="mt-3">
                    <summary className={`cursor-pointer py-2 text-sm font-semibold ${focus}`}>
                      시트에서 Gemini가 보이지 않나요?
                    </summary>
                    <p className="mt-1 text-sm leading-7">
                      Gemini 채팅에 기존 표를 붙이거나 파일을 첨부하고 같은 프롬프트를 입력하세요.
                      결과 표를 복사해 개인 파일의 해당 탭에 붙이세요. ‘Sheets로 내보내기’는 새
                      파일을 만듭니다.
                    </p>
                    <a
                      href="https://gemini.google.com/"
                      target="_blank"
                      rel="noreferrer"
                      className={`${button} mt-2`}
                    >
                      Gemini 채팅 열기 <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  </details>
                </div>
              </>
            )}

            {stage === 1 && (
              <div className="border-l-2 border-black bg-neutral-50 p-4">
                <p className="text-sm font-bold">01 미국 브랜드 조사</p>
                <p className="mt-1 text-sm leading-7">
                  브랜드 한 곳을 한 행에 담으세요. 미국에서 시작한 근거와 공식 사이트 주소를 각각
                  열어보세요. 한국 브랜드의 미국 판매 페이지 등은 추가 레퍼런스로 기록할 수 있어요.
                </p>
                <button type="button" onClick={() => go(0)} className={`${button} mt-3`}>
                  내 유형의 프롬프트 보기
                </button>
              </div>
            )}
            {(stage === 2 || stage === 3) && (
              <div className="border-l-2 border-black bg-neutral-50 p-4">
                <p className="text-sm font-bold">
                  {stage === 2 ? "한 줄 관찰 예시" : "02 리디자인 후보 비교 · 작성 예시"}
                </p>
                <dl className="mt-3 grid gap-3 text-sm leading-6">
                  <div>
                    <dt className="font-semibold">직접 확인한 사실</dt>
                    <dd className="text-neutral-700">
                      모바일 목록에는 사진과 이름이 보이고, 향조는 각 향수의 상세 페이지에서 확인할
                      수 있다.
                    </dd>
                  </div>
                  {stage === 3 && (
                    <div>
                      <dt className="font-semibold">개선 가설</dt>
                      <dd className="text-neutral-700">
                        상품 카드에 향조를 한 줄 추가하면 방문자가 두 향수의 차이를 목록에서 비교할
                        수 있을 것이다.
                      </dd>
                    </div>
                  )}
                </dl>
                <p className="mt-2 text-xs text-neutral-500">가상의 향수 사이트 예시</p>
              </div>
            )}
            {stage === 4 && (
              <div className="border-l-2 border-black bg-neutral-50 p-4">
                <p className="text-sm font-bold">03 최종 선정과 기획 방향</p>
                <p className="mt-1 text-sm leading-7">
                  “[방문자]가 [행동]할 때 [관찰한 문제]가 있었다. [브랜드 특징]을 유지하고 [화면
                  요소]를 바꾼 뒤, [행동]을 끝까지 수행해 확인하겠다.”
                </p>
                <details className="mt-3">
                  <summary className={`cursor-pointer py-2 text-sm font-semibold ${focus}`}>
                    선택 · 개인 심화 조사
                  </summary>
                  <p className="mt-1 text-sm leading-7">
                    개인 질문 하나와 추가 근거를 적고, 그 결과 달라진 디자인 결정을 한 문장으로
                    연결하세요. 지난 수업의 브랜드 분석이나 면접 준비 탭도 활용할 수 있습니다.
                  </p>
                </details>
              </div>
            )}
            {last && (
              <div className="border border-black p-4 sm:p-5">
                <h3 className="text-base font-bold">개인 시트 링크 제출</h3>
                <p className="mt-2 text-sm leading-7 text-neutral-700">
                  Google Sheets에서 강사에게 댓글 작성자 권한을 부여하고 파일 링크를 복사하세요.
                  6회차의 ‘과제와 피드백 자료 업로드’에서 ‘링크 추가’를 누르고, 복사한 주소를
                  붙여넣어 ‘링크 등록’을 선택하세요. 이후에는 같은 시트에 이어서 작성하세요.
                </p>
                <Link
                  to="/feedback"
                  search={{ week: 6 }}
                  className={`${primary} mt-3 w-full sm:w-auto`}
                >
                  6회차 과제&amp;피드백 열기 <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            )}

            <footer className="border-t border-neutral-200 pt-4">
              <label
                className={`flex min-h-12 cursor-pointer items-center gap-3 text-sm font-semibold ${focus}`}
              >
                <input
                  type="checkbox"
                  checked={done.includes(stage)}
                  onChange={toggleDone}
                  className="size-5 shrink-0 accent-black"
                />
                {last
                  ? "6회차에 개인 시트 링크를 제출했습니다"
                  : "이번 교시의 결과물을 준비했습니다"}
              </label>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                {stage > 0 && (
                  <button type="button" onClick={() => go(stage - 1)} className={button}>
                    <ArrowLeft size={15} aria-hidden="true" /> 이전 교시
                  </button>
                )}
                {!last && (
                  <button
                    type="button"
                    onClick={() => go(stage + 1)}
                    className={`${primary} ml-auto`}
                  >
                    {stage + 2}교시 · {WEEK_SIX_STEPS[stage + 1]!.shortTitle}{" "}
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
            </footer>
          </div>
        </article>
      </div>
    </section>
  );
}
