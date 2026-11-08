import { useAuth } from "@/lib/auth";
import { WeekThreeNotebook } from "@/components/WeekThreeNotebook";

const TUTORIAL_URL = "/tutorials/google-ai-studio-v5.html";

/**
 * Session 03 resources. Notebook learning content is additive; the existing
 * AI Studio simulation makes no Gemini API calls and requests no credentials.
 * Google Drive file permissions are enforced independently of LMS visibility.
 */
export function WeekThreeResources({ sessionId }: { sessionId: string }) {
  const { status } = useAuth();
  if (sessionId !== "S03" || (status !== "student" && status !== "instructor")) return null;

  return (
    <>
      <WeekThreeNotebook isInstructor={status === "instructor"} />
      <section aria-labelledby="week-three-resources" className="mt-6 border-y border-neutral-200 py-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-neutral-500">
              SESSION 03 · 실습 전 학습자료
            </p>
            <h2 id="week-three-resources" className="mt-2 text-lg font-bold">
              Google AI Studio · 인터랙티브 한국어 튜토리얼
            </h2>
            <p className="mt-2 max-w-2xl break-keep text-sm leading-7 text-neutral-600">
              Build와 Playground의 영어 메뉴를 직접 눌러 한국어 해석과 사용법을 확인하세요.
              Default·Plan·Max 모드, Run settings, 프롬프트와 도구 설정을 익힐 수 있습니다.
            </p>
          </div>
          <span className="border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600">
            V5 · 학습용 데모
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
              작은 화면에서는 일부 메뉴가 좁게 보일 수 있습니다. 전체 화면 학습은 위의 새 창 열기를 이용하세요.
            </p>
            <iframe
              src={TUTORIAL_URL}
              title="Google AI Studio Build와 Playground 인터랙티브 튜토리얼"
              className="h-[660px] w-full border border-neutral-200 bg-white sm:h-[760px]"
              loading="lazy"
              sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
              referrerPolicy="no-referrer"
            />
          </div>
        </details>
        <p className="mt-4 break-keep text-xs leading-6 text-neutral-500">
          Google 공식 사이트가 아닌 K-MOVE 수업용 모의 화면입니다. 버튼과 설정은 학습용이며,
          실제 Gemini 모델 실행이나 API 사용·과금은 발생하지 않습니다.
        </p>
      </section>
    </>
  );
}
