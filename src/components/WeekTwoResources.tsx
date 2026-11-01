import { useAuth } from "@/lib/auth";

const SLIDES_ID = "1hSzShXlJEkmxQAp3rjrAif_Dg0ySA1K9E18c4Fo3-Yk";
const ZIP_ID = "1LLVSIWBvQcU0De68r0atWDlKgnoOEJt7";
const FOLDER_URL = "https://drive.google.com/drive/folders/1dnDsfj3vGqFBGJhPil1S5N8jWnIKlwYN";

/** Course resources are shown to signed-in members; Google Drive enforces file access.
 * Download/copy restrictions on the deck are managed separately in Google Drive.
 */
export function WeekTwoResources({
  sessionId,
  showPracticeDownload = true,
}: {
  sessionId: string;
  showPracticeDownload?: boolean;
}) {
  const { status } = useAuth();
  if (sessionId !== "S02" || (status !== "student" && status !== "instructor")) return null;

  return (
    <section aria-labelledby="week-two-resources" className="mt-6 border-y border-neutral-200 py-6">
      <h2 id="week-two-resources" className="text-lg font-semibold">
        2주차 수업 자료
      </h2>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        Gemini Pro 디자인 활용 가이드 · 채팅과 작업, 모델과 사고 수준
      </p>
      <div className="mt-4 aspect-video w-full overflow-hidden border border-neutral-200 bg-neutral-50">
        <iframe
          src={`https://docs.google.com/presentation/d/${SLIDES_ID}/embed?start=false&loop=false&delayms=3000`}
          title="2주차 Gemini Pro 디자인 활용 가이드 슬라이드 뷰어"
          className="h-full w-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <a
        href={`https://docs.google.com/presentation/d/${SLIDES_ID}/preview`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex min-h-11 items-center text-sm underline underline-offset-4"
      >
        슬라이드 크게 보기
      </a>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-5">
        {showPracticeDownload && (
          <a
            href={`https://drive.google.com/uc?export=download&id=${ZIP_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            실습 자료 ZIP 다운로드
          </a>
        )}
        <a
          href={FOLDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center border border-neutral-300 px-5 py-3 text-sm font-semibold hover:bg-neutral-50"
        >
          K-MOVE 공유용 폴더
        </a>
      </div>
      {showPracticeDownload && (
        <p className="mt-3 text-xs leading-6 text-muted-foreground">
          실습 파일: K_MOVE_DESIGN_261101_W2.zip · 11.2 MB
        </p>
      )}
    </section>
  );
}
