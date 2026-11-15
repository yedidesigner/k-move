import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";

// Fixed-font viewing derivative; editable instructor PPTX is retained privately.
// Every slide was rendered with the actual Pretendard Regular/Bold fonts.
const DECK_ID = "1HuAQfzdPM8CyeJoQpTNDkt_0ndfDK-oVsvnAQVgDntk";
const VIEWER_URL = `https://docs.google.com/presentation/d/${DECK_ID}/embed?start=false&loop=false&delayms=3000&rm=minimal`;
export const WEEK_FOUR_DOWNLOADS = [
  {
    id: "session-04-lecture-html",
    title: "브라우저용 발표 자료",
    fileName: "K_MOVE_S04_Lecture.html",
    driveId: "1jullIOUvHL0Ascm91HPoLm8nVEagR01N",
    type: "HTML",
    description: "브라우저에서 열어 복습하는 발표 자료 · 목차와 강사 노트 포함",
  },
  {
    id: "session-04-practice-prompts",
    title: "실습 프롬프트 8종",
    fileName: "K_MOVE_S04_Practice_Prompts.txt",
    driveId: "1W4YSf7ieY53FwxgEz7ZuYGbM02BjFYeG",
    type: "TXT",
    description: "분석·제작 명세·첫 구현·수정·검수에 사용하는 복사용 프롬프트",
  },
] as const;
const buttonClass = "inline-flex min-h-11 items-center justify-center border border-neutral-300 bg-white px-4 text-sm font-semibold text-black hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

/**
 * The LMS never links to the editable PPTX, PDF, deck export or teaching ZIP.
 * The cross-origin iframe sandbox omits downloads, popups and top-navigation;
 * those limits apply to this viewer, not to Google Drive's own export permissions.
 * Google Drive independently authorizes the explicitly shared student accounts.
 */
export function WeekFourResources({ sessionId }: { sessionId: string }) {
  const { status } = useAuth();
  if (sessionId !== "S04" || (status !== "student" && status !== "instructor")) return null;
  return <WeekFourResourceContent />;
}

function WeekFourResourceContent() {
  const root = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [reload, setReload] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setCanFullscreen(typeof root.current?.requestFullscreen === "function" && !!document.fullscreenEnabled);
    const changed = () => setFullscreen(document.fullscreenElement === root.current);
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === root.current) await document.exitFullscreen();
      else await root.current?.requestFullscreen();
    } catch {
      setNotice("전체 화면 전환이 제한되었습니다. 현재 화면에서 슬라이드를 확인해 주세요.");
    }
  };

  return (
    <section className="mt-6 border-y border-neutral-200 py-6" aria-labelledby="week-four-resources">
      <p className="text-xs font-semibold tracking-wide text-neutral-500">SESSION 04 · 강의와 실습 자료</p>
      <h2 id="week-four-resources" className="mt-2 break-keep text-xl font-bold leading-relaxed">
        Gemini + Google AI Studio 바이브코딩
      </h2>
      <p className="mt-2 break-keep text-sm leading-7 text-neutral-600">
        레퍼런스를 읽고, 실행되는 웹으로. 관찰 → 제작 명세 → 구현 → 검증 과정을 슬라이드로 학습합니다.
      </p>

      <div ref={root} tabIndex={0}
        className={`s04-slide-viewer mt-5 border border-neutral-300 bg-white ${fullscreen ? "flex h-screen w-screen flex-col p-3 sm:p-5" : ""}`}
        aria-label="4회차 강의 슬라이드 뷰어"
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && ["s", "p"].includes(event.key.toLowerCase())) {
            event.preventDefault();
            setNotice("이 뷰어에는 슬라이드 저장·인쇄 기능이 없습니다. HTML·TXT 자료는 아래에서 다운로드하세요.");
          }
        }}>
        <style>{`
          .s04-slide-viewer:fullscreen { background: #fff; overflow: auto; }
          .s04-print-notice { display: none; }
          @media print {
            .s04-slide-viewer { display: none !important; }
            .s04-print-notice { display: block !important; padding: 24px; }
          }
        `}</style>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-4 py-3">
          <h3 className="text-sm font-bold">강의 슬라이드 <span className="ml-2 font-normal text-neutral-500">51장 · 온라인 열람</span></h3>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonClass} onClick={() => { setReload((value) => value + 1); setNotice(""); }}>
              뷰어 새로고침
            </button>
            {canFullscreen && <button type="button" className={buttonClass} onClick={() => void toggleFullscreen()}>
              {fullscreen ? "전체 화면 종료" : "전체 화면"}
            </button>}
          </div>
        </div>
        <div className={`flex min-h-0 items-center justify-center bg-neutral-100 ${fullscreen ? "flex-1" : ""}`}>
          <div className="relative aspect-video w-full bg-white"
            style={fullscreen ? { maxWidth: "calc((100dvh - 180px) * 16 / 9)" } : undefined}>
            <iframe key={reload}
              src={VIEWER_URL}
              title="4회차 Gemini와 Google AI Studio 바이브코딩 강의 슬라이드 51장"
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              allow="fullscreen"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
        <div className="border-t border-neutral-200 px-4 py-3 text-xs leading-6 text-neutral-500">
          <p>슬라이드 하단의 이전·다음 버튼으로 이동하세요. PPTX·PDF 원본 다운로드와 인쇄 버튼은 제공하지 않습니다.</p>
          <p>권한 안내가 표시되면, 자료를 공유받은 수업용 Google 계정으로 브라우저에 로그인한 뒤 뷰어를 새로고침하세요.</p>
          {!!notice && <p role="status" className="mt-1 font-medium text-neutral-800">{notice}</p>}
        </div>
      </div>
      <p className="s04-print-notice">강의 슬라이드는 LMS 온라인 열람용으로 인쇄물에 포함되지 않습니다.</p>

      <div className="mt-6" aria-labelledby="week-four-downloads">
        <h3 id="week-four-downloads" className="text-base font-bold">다운로드 가능한 실습 자료</h3>
        <p className="mt-1 text-xs leading-6 text-neutral-500">HTML 발표 자료와 TXT 프롬프트만 별도로 제공합니다.</p>
        <ul className="mt-3 divide-y divide-neutral-200 border border-neutral-200 bg-white">
          {WEEK_FOUR_DOWNLOADS.map((file) => (
            <li key={file.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{file.title}</p>
                <p className="mt-1 break-keep text-xs leading-6 text-neutral-600">{file.description}</p>
                <p className="mt-1 break-all text-xs text-neutral-400">{file.fileName}</p>
              </div>
              <a href={`https://drive.google.com/uc?export=download&id=${file.driveId}`}
                target="_blank" rel="noopener noreferrer"
                aria-label={`${file.type} 다운로드 (${file.fileName})`}
                className="inline-flex min-h-11 shrink-0 items-center justify-center border border-black bg-black px-5 text-sm font-semibold text-white hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
                {file.type} 다운로드
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
