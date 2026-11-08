import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

const PAGE_COUNT = 60;
const BUCKET = "kmove-lecture-pages";
const DECK = "s03-notebook-v1";
const CHAPTERS = [
  { page: 1, title: "시작과 학습 목표" },
  { page: 3, title: "기초 개념" },
  { page: 6, title: "홈 화면" },
  { page: 12, title: "작업 화면" },
  { page: 15, title: "소스 관리" },
  { page: 21, title: "리서치와 채팅" },
  { page: 27, title: "Studio 9개 기능" },
  { page: 36, title: "슬라이드 제작" },
  { page: 39, title: "공유와 사용 조건" },
  { page: 41, title: "디자인 실무 실습" },
  { page: 52, title: "검수·심화·평가" },
  { page: 57, title: "복습과 출처" },
];
const control = "inline-flex min-h-11 items-center justify-center border border-neutral-300 bg-white px-3 text-sm font-semibold text-black hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

/**
 * No original PDF/PPTX or public/signed file URL is delivered to the browser.
 * Each page is read with the user's JWT; Storage RLS checks instructor status
 * or active student enrollment. Canvas/watermark/print controls deter casual
 * copying, not screenshots or extraction by an already authorized viewer.
 */
export function NotebookLectureViewer() {
  const { user, status } = useAuth();
  const allowed = !!user && (status === "student" || status === "instructor");
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(1);
  const [loadedPage, setLoadedPage] = useState<number | null>(null);
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);
  const memberCode = user?.id.slice(0, 8).toUpperCase() ?? "";
  const chapter = [...CHAPTERS].reverse().find((item) => item.page <= page)!;

  useEffect(() => {
    setCanFullscreen(typeof root.current?.requestFullscreen === "function" && document.fullscreenEnabled);
    const changed = () => setFullscreen(document.fullscreenElement === root.current);
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    let image: HTMLImageElement | null = null;
    setLoadedPage(null);
    setError("");
    const target = canvas.current;
    target?.getContext("2d")?.clearRect(0, 0, target.width, target.height);
    if (!allowed || !user) return;
    void (async () => {
      try {
        const { data, error: storageError } = await getSupabase().storage
          .from(BUCKET)
          .download(`${DECK}/page-${String(page).padStart(3, "0")}.webp`);
        if (cancelled) return;
        if (storageError || !data || data.size === 0) throw new Error("page-unavailable");
        objectUrl = URL.createObjectURL(data);
        image = new Image();
        image.onload = () => {
          if (cancelled || !image || !canvas.current) return;
          const element = canvas.current;
          element.width = image.naturalWidth;
          element.height = image.naturalHeight;
          const context = element.getContext("2d");
          if (!context) {
            setError("이 브라우저에서 슬라이드를 표시하지 못했습니다. 다른 브라우저로 접속해 주세요.");
            return;
          }
          context.drawImage(image, 0, 0);
          // A small viewing mark is rendered into the pixels, outside the source footer.
          const mark = `K-MOVE · VIEW ONLY · ${memberCode}`;
          context.save();
          context.font = "500 15px sans-serif";
          context.textAlign = "right";
          const markWidth = context.measureText(mark).width + 20;
          context.fillStyle = "rgba(255,255,255,0.9)";
          context.fillRect(element.width - markWidth - 14, element.height - 24, markWidth, 20);
          context.fillStyle = "rgba(70,70,70,0.72)";
          context.fillText(mark, element.width - 24, element.height - 10);
          context.restore();
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          objectUrl = null;
          setLoadedPage(page);
        };
        image.onerror = () => {
          if (!cancelled) setError("슬라이드 이미지를 표시하지 못했습니다. 다시 시도해 주세요.");
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        };
        image.src = objectUrl;
      } catch {
        if (!cancelled) setError("슬라이드를 불러오지 못했습니다. 로그인·수강 권한과 네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
      }
    })();
    return () => {
      cancelled = true;
      if (image) { image.onload = null; image.onerror = null; }
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      target?.getContext("2d")?.clearRect(0, 0, target.width, target.height);
    };
  }, [allowed, user?.id, page, retry, memberCode]);

  const moveTo = (next: number) => {
    setPage(Math.max(1, Math.min(PAGE_COUNT, Math.trunc(next))));
    setNotice("");
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === root.current) await document.exitFullscreen();
      else if (root.current?.requestFullscreen) await root.current.requestFullscreen();
    } catch {
      setNotice("전체 화면 전환이 제한되었습니다. 확대 메뉴를 사용해 주세요.");
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.ctrlKey || event.metaKey) && ["s", "p"].includes(event.key.toLowerCase())) {
      event.preventDefault();
      setNotice("강의 슬라이드는 LMS 열람 전용입니다. 저장·인쇄 기능은 제공하지 않습니다.");
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if ((event.target as HTMLElement).closest("input, select, textarea, [contenteditable='true']")) return;
    const next = event.key === "ArrowRight" || event.key === "PageDown" ? page + 1
      : event.key === "ArrowLeft" || event.key === "PageUp" ? page - 1
      : event.key === "Home" ? 1 : event.key === "End" ? PAGE_COUNT : null;
    if (next !== null) { event.preventDefault(); moveTo(next); }
  };

  return (
    <div id="notebook-slide-viewer" ref={root} tabIndex={0} onKeyDown={onKeyDown}
      className={`kmove-lecture-viewer mt-4 flex min-w-0 flex-col border border-neutral-300 bg-white ${fullscreen ? "h-screen w-screen p-3 sm:p-5" : ""}`}
      aria-label="Gemini Notebook 강의 슬라이드 열람 전용 뷰어">
      <style>{`
        .kmove-lecture-viewer:fullscreen { background: white; overflow: auto; }
        .kmove-lecture-print-notice { display: none; }
        @media print {
          .kmove-lecture-screen, .kmove-lecture-controls, .kmove-lecture-help { display: none !important; }
          .kmove-lecture-print-notice { display: block !important; padding: 24px; color: black; }
        }
      `}</style>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-4 py-3">
        <h4 className="text-sm font-bold">강의 슬라이드 <span className="ml-2 font-normal text-neutral-500">60장</span></h4>
        <span className="text-xs font-semibold text-neutral-500">LMS 열람 전용</span>
      </div>
      <div className="kmove-lecture-controls flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={control} disabled={page === 1 || !allowed} onClick={() => moveTo(page - 1)} aria-label="이전 슬라이드">← 이전</button>
          <label className="inline-flex min-h-11 items-center gap-1 text-sm">
            <span className="sr-only">슬라이드 페이지 선택</span>
            <select value={page} onChange={(event) => moveTo(Number(event.target.value))} className="h-11 min-w-16 border border-neutral-300 bg-white px-2 text-center text-sm" disabled={!allowed}>
              {Array.from({ length: PAGE_COUNT }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
            </select><span className="px-1 text-neutral-500">/ {PAGE_COUNT}</span>
          </label>
          <button type="button" className={control} disabled={page === PAGE_COUNT || !allowed} onClick={() => moveTo(page + 1)} aria-label="다음 슬라이드">다음 →</button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium"><span className="sr-only">슬라이드 확대 비율</span>
            <select value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="h-11 border border-neutral-300 bg-white px-2 text-sm">
              <option value={100}>화면 맞춤</option><option value={125}>125%</option><option value={150}>150%</option><option value={200}>200%</option>
            </select>
          </label>
          {canFullscreen && <button type="button" className={control} onClick={() => void toggleFullscreen()}>{fullscreen ? "전체 화면 종료" : "전체 화면"}</button>}
        </div>
      </div>
      <div className="kmove-lecture-screen min-h-0 flex-1 overflow-auto bg-neutral-100 p-2 sm:p-3"
        onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()}>
        <div className="relative mx-auto aspect-video bg-white shadow-sm"
          style={{ width: `${zoom}%`, maxWidth: fullscreen && zoom === 100 ? "calc((100dvh - 260px) * 16 / 9)" : undefined }}>
          <canvas ref={canvas} width={1920} height={1080} role="img" aria-label={`강의 슬라이드 ${page}/${PAGE_COUNT} · ${chapter.title}`}
            className="block h-full w-full select-none" style={{ visibility: allowed && loadedPage === page ? "visible" : "hidden" }}>
            강의 슬라이드 {page}페이지. 상세 설명은 학생용 실습 교재에서 확인하세요.
          </canvas>
          {(!allowed || loadedPage !== page) && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white px-5 text-center" role="status" aria-live="polite">
            <p className="max-w-lg break-keep text-sm leading-7 text-neutral-700">{!allowed ? "로그인한 수강생과 강사만 슬라이드를 볼 수 있습니다." : error || `${page}페이지를 불러오는 중입니다.`}</p>
            {!!error && allowed && <button type="button" className={control} onClick={() => setRetry((value) => value + 1)}>다시 시도</button>}
          </div>}
        </div>
      </div>
      <div className="kmove-lecture-controls flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3">
        <label className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-medium text-neutral-600">단원 이동
          <select value={chapter.page} onChange={(event) => moveTo(Number(event.target.value))} className="min-h-11 max-w-full border border-neutral-300 bg-white px-2 text-sm text-black">
            {CHAPTERS.map((item) => <option key={item.page} value={item.page}>{String(item.page).padStart(2, "0")} · {item.title}</option>)}
          </select>
        </label>
        <p aria-live="polite" className="text-xs text-neutral-500">{page} / {PAGE_COUNT} · {chapter.title}</p>
      </div>
      <div className="kmove-lecture-help border-t border-neutral-200 px-4 py-3 text-xs leading-6 text-neutral-500">
        <p>이전·다음 버튼 또는 뷰어에 초점을 둔 상태에서 ← → 키로 이동합니다. 원본 PDF·PPTX 다운로드와 인쇄는 제공하지 않습니다.</p>
        <p>개인 학습용 열람 자료입니다. 화면 캡처·촬영·재배포를 삼가 주세요.</p>
        {!!notice && <p role="status" className="mt-1 font-semibold text-neutral-800">{notice}</p>}
      </div>
      <p className="kmove-lecture-print-notice">강의 슬라이드는 LMS 열람 전용으로, 인쇄물에 포함되지 않습니다.</p>
    </div>
  );
}
