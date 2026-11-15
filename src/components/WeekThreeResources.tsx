import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { WeekThreeNotebook } from "@/components/WeekThreeNotebook";
import { BrandWebsiteWorkshop } from "@/components/BrandWebsiteWorkshop";

const TUTORIAL_URL = "/tutorials/google-ai-studio-v5.html?tools=7";
const BASE_TUTORIAL_URL = "/tutorials/google-ai-studio-base-v6.html";

/** Keep the original tutorial unchanged; load the additive Tools lesson into a sandbox.
 * Fetch in the first-party parent, not in the opaque-origin iframe. No API keys or
 * authenticated student data are passed into the tutorial document.
 */
function AiStudioTutorialFrame() {
  const [html, setHtml] = useState("");
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    setHtml("");
    void (async () => {
      try {
        const response = await fetch(BASE_TUTORIAL_URL, { signal: controller.signal });
        if (!response.ok) throw new Error("tutorial-unavailable");
        let source = await response.text();
        if (!source.includes('data-help="input-tools"') || !source.includes("</body>"))
          throw new Error("tutorial-invalid");
        const storage = '<script>window.kmoveTutorialStorage={memory:{},getItem:function(k){try{return localStorage.getItem(k)}catch(e){return this.memory[k]||null}},setItem:function(k,v){try{localStorage.setItem(k,v)}catch(e){this.memory[k]=String(v)}},removeItem:function(k){try{localStorage.removeItem(k)}catch(e){delete this.memory[k]}}};</script>';
        source = source.replace(/\blocalStorage\.(getItem|setItem|removeItem)\(/g, "window.kmoveTutorialStorage.$1(");
        source = source.replace("<head>", "<head>" + storage);
        source = source.replace("</body>", '<script src="' + window.location.origin + '/tutorials/ai-studio-tools-v7.js?v=1"></script></body>');
        if (!controller.signal.aborted) setHtml(source);
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    })();
    return () => controller.abort();
  }, [attempt]);
  if (error) return <div role="alert" className="p-5 text-sm leading-7">튜토리얼을 불러오지 못했습니다. <button type="button" className="ml-2 min-h-11 underline" onClick={() => setAttempt((value) => value + 1)}>다시 시도</button></div>;
  if (!html) return <p role="status" className="p-5 text-sm">학습자료를 불러오는 중입니다.</p>;
  return <iframe
    srcDoc={html}
    title="Google AI Studio 옵션 인터랙티브 한국어 튜토리얼"
    className="h-[660px] w-full border border-neutral-200 bg-white sm:h-[760px]"
    sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
    referrerPolicy="no-referrer"
  />;
}

/** Session 03 keeps the brand/Notebook material; the Google AI Studio tutorial belongs to Session 04. */
export function WeekThreeResources({ sessionId }: { sessionId: string }) {
  const { status } = useAuth();
  const allowed = status === "student" || status === "instructor";
  const sessionThree = sessionId === "S03";
  const sessionFour = sessionId === "S04";
  if (!allowed || (!sessionThree && !sessionFour)) return null;

  return (
    <>
      {sessionThree && (
        <>
          <BrandWebsiteWorkshop />
          <details className="mt-8 border-t border-neutral-300 pt-5">
            <summary className="cursor-pointer text-lg font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
              기존 학습자료 · Gemini Notebook 기초·심화 펼쳐보기
            </summary>
            <p className="mt-2 text-sm leading-7 text-neutral-600">
              기존 60장 강의 뷰어와 MORU LIVING 리서치 실습, 학생 교재 및 프롬프트는 그대로 유지됩니다.
            </p>
            <WeekThreeNotebook isInstructor={status === "instructor"} />
          </details>
        </>
      )}

      {sessionFour && (
        <section aria-labelledby="week-four-ai-studio-tutorial" className="mt-6 border-y border-neutral-200 py-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-neutral-500">
                SESSION 04 · 실습 전 학습자료
              </p>
              <h2 id="week-four-ai-studio-tutorial" className="mt-2 text-lg font-bold">
                Google AI Studio · 인터랙티브 한국어 튜토리얼
              </h2>
              <p className="mt-2 max-w-2xl break-keep text-sm leading-7 text-neutral-600">
                Model selection, System instructions, Thinking level, Tools, Advanced settings를 직접 눌러 학습합니다.
                Tools의 5개 옵션은 한국어 뜻·켜짐과 꺼짐의 차이·사용 순서·디자인 실습 예시·주의사항까지 확인할 수 있습니다.
              </p>
            </div>
            <span className="border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600">
              V7 · Tools 상세 학습
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={TUTORIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center border border-black bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              튜토리얼 새 창에서 열기 ↗
            </a>
            <a
              href={`${TUTORIAL_URL}#tools`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center border border-neutral-300 px-5 py-3 text-sm font-semibold hover:bg-neutral-50"
            >
              Tools 옵션별 특징 바로 보기 ↗
            </a>
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center border border-neutral-300 px-5 py-3 text-sm font-semibold hover:bg-neutral-50"
            >
              실제 Google AI Studio ↗
            </a>
          </div>
          <details className="mt-5 border border-neutral-200 bg-white">
            <summary className="cursor-pointer px-5 py-4 text-sm font-semibold hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
              LMS 화면 안에서 튜토리얼 펼쳐보기
            </summary>
            <div className="border-t border-neutral-200 p-2 sm:p-4">
              <p className="mb-3 text-xs leading-6 text-neutral-500">
                입력창 아래 Tools를 누른 뒤 옵션 이름을 선택하세요. 스위치는 별도의 학습용 설정이며 실제 API를 실행하지 않습니다.
              </p>
              <AiStudioTutorialFrame />
            </div>
          </details>
          <p className="mt-4 break-keep text-xs leading-6 text-neutral-500">
            Google 공식 사이트가 아닌 K-MOVE 수업용 모의 화면입니다. 버튼과 설정은 학습용이며,
            실제 Gemini 모델 실행이나 API 사용·과금은 발생하지 않습니다. 기능 설명은 Google 공식 문서에 근거하며 실습 예시는 수업용입니다.
          </p>
        </section>
      )}
    </>
  );
}
