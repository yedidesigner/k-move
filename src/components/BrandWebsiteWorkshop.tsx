import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

const DECK = "s03-brand-v1";
const FILE_BUCKET = "kmove-course-materials";
const BUTTON = "inline-flex min-h-11 items-center justify-center border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
const FILES = new Map([
  ["student-workbook.pdf", "K_MOVE_S03_Brand_Student_Workbook.pdf"],
  ["student-kit.zip", "K_MOVE_S03_Brand_Student_Kit.zip"],
]);

type Prompt = { id: string; title: string; tool: string; goal: string; text: string; check: string };
type Chapter = { page: number; title: string };
type Lesson = {
  title: string; version: string; date: string; pageCount: number; deck: string;
  chapters: Chapter[]; prompts: Prompt[]; checks: string[];
  steps: { id: string; title: string; prompt: string; text: string; do: string[]; done: string }[];
  files: { name: string; title: string; detail: string; downloadName: string }[];
  refs: { id: string; title: string; url: string; verified: string; note: string }[];
};
function validLesson(value: unknown): value is Lesson {
  if (!value || typeof value !== "object") return false;
  const x = value as Lesson;
  return x.deck === DECK && x.pageCount === 40 && typeof x.title === "string"
    && Array.isArray(x.chapters) && x.chapters.length > 0 && x.chapters[0]?.page === 1
    && x.chapters.every(c => Number.isInteger(c.page) && c.page >= 1 && c.page <= 40 && typeof c.title === "string")
    && Array.isArray(x.prompts) && x.prompts.length === 8 && x.prompts.every(p => typeof p.text === "string" && typeof p.id === "string")
    && Array.isArray(x.steps) && x.steps.length === 8 && x.steps.every(s => typeof s.text === "string" && Array.isArray(s.do))
    && Array.isArray(x.files) && x.files.every(f => FILES.get(f.name) === f.downloadName)
    && Array.isArray(x.checks) && Array.isArray(x.refs);
}

/** Original lecture PDFs/PPTX are never sent to this viewer. Each page requires Storage RLS. */
function BrandSlideViewer({ lesson }: { lesson: Lesson }) {
  const { user, status } = useAuth();
  const allowed = !!user && (status === "student" || status === "instructor");
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState<number | null>(null);
  const [zoom, setZoom] = useState(100);
  const [full, setFull] = useState(false);
  const [canFull, setCanFull] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);
  const chapter = [...lesson.chapters].reverse().find(c => c.page <= page) ?? lesson.chapters[0] ?? { page: 1, title: "강의 슬라이드" };
  useEffect(() => {
    setCanFull(!!document.fullscreenEnabled && typeof root.current?.requestFullscreen === "function");
    const onChange = () => setFull(document.fullscreenElement === root.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  useEffect(() => {
    let cancelled = false; let objectUrl: string | null = null; let image: HTMLImageElement | null = null;
    setLoaded(null); setError("");
    const target = canvas.current;
    target?.getContext("2d")?.clearRect(0, 0, target.width, target.height);
    if (!allowed || !user) return;
    void (async () => {
      try {
        const { data, error: storageError } = await getSupabase().storage.from("kmove-lecture-pages")
          .download(`${DECK}/page-${String(page).padStart(3, "0")}.webp`);
        if (cancelled) return;
        if (storageError || !data?.size) throw new Error("page-unavailable");
        objectUrl = URL.createObjectURL(data); image = new Image();
        image.onload = () => {
          if (cancelled || !image || !canvas.current) return;
          const el = canvas.current; el.width = image.naturalWidth; el.height = image.naturalHeight;
          const ctx = el.getContext("2d");
          if (!ctx) { setError("이 브라우저에서 화면을 표시하지 못했습니다."); return; }
          ctx.drawImage(image, 0, 0);
          ctx.font = "500 14px sans-serif"; ctx.textAlign = "right";
          const mark = `K-MOVE · VIEW ONLY · ${user.id.slice(0, 8).toUpperCase()}`;
          const width = ctx.measureText(mark).width + 16;
          ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.fillRect(el.width-width-12, el.height-23, width, 20);
          ctx.fillStyle = "#606060"; ctx.fillText(mark, el.width-20, el.height-9);
          if (objectUrl) URL.revokeObjectURL(objectUrl); objectUrl = null; setLoaded(page);
        };
        image.onerror = () => {
          if (!cancelled) setError("이미지를 표시하지 못했습니다. 다시 시도해 주세요.");
          if (objectUrl) URL.revokeObjectURL(objectUrl); objectUrl = null;
        };
        image.src = objectUrl;
      } catch { if (!cancelled) setError("로그인·등록 수강 권한과 네트워크를 확인한 뒤 다시 시도해 주세요."); }
    })();
    return () => {
      cancelled = true; if (image) { image.onload = null; image.onerror = null; }
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      target?.getContext("2d")?.clearRect(0, 0, target.width, target.height);
    };
  }, [allowed, user?.id, page, retry]);
  const move = (n: number) => { if (Number.isFinite(n)) setPage(Math.max(1, Math.min(40, Math.trunc(n)))); };
  const keys = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && ["s", "p"].includes(e.key.toLowerCase())) {
      e.preventDefault(); setNotice("강의 원본 저장·인쇄 기능은 제공하지 않습니다."); return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || (e.target as HTMLElement).closest("input,select,textarea,button,[contenteditable='true']")) return;
    const n = e.key === "ArrowRight" || e.key === "PageDown" ? page+1 : e.key === "ArrowLeft" || e.key === "PageUp" ? page-1 : e.key === "Home" ? 1 : e.key === "End" ? 40 : null;
    if (n !== null) { e.preventDefault(); move(n); }
  };
  const fullscreen = async () => {
    try { if (document.fullscreenElement === root.current) await document.exitFullscreen(); else await root.current?.requestFullscreen(); }
    catch { setNotice("전체 화면이 제한되었습니다. 확대 메뉴를 사용하세요."); }
  };
  return <div ref={root} id="brand-slide-viewer" tabIndex={0} onKeyDown={keys}
    className={`brand-lecture-viewer min-w-0 border border-neutral-300 bg-white ${full ? "flex h-screen flex-col p-3" : ""}`}
    aria-label="산업 리서치 기반 한영 브랜드 사이트 강의 뷰어">
    <style>{`.brand-lecture-viewer:fullscreen{background:white;overflow:auto}.brand-print-notice{display:none}@media print{.brand-lecture-controls,.brand-lecture-screen,.brand-lecture-help{display:none!important}.brand-print-notice{display:block!important}}`}</style>
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 p-3 text-sm font-bold"><span>강의 슬라이드 · 40장</span><span className="text-xs text-neutral-500">LMS 열람 전용</span></div>
    <div className="brand-lecture-controls flex flex-wrap gap-2 border-b border-neutral-200 p-3">
      <button className={BUTTON} disabled={!allowed || page===1} onClick={() => move(page-1)}>← 이전</button>
      <select aria-label="슬라이드 페이지" value={page} disabled={!allowed} onChange={e=>move(Number(e.target.value))} className="min-h-11 border border-neutral-300 bg-white px-3 text-sm">
        {Array.from({length:40},(_,i)=><option key={i+1} value={i+1}>{i+1} / 40</option>)}
      </select>
      <button className={BUTTON} disabled={!allowed || page===40} onClick={() => move(page+1)}>다음 →</button>
      <select aria-label="슬라이드 확대" value={zoom} onChange={e=>setZoom(Number(e.target.value))} className="min-h-11 border border-neutral-300 bg-white px-3 text-sm">
        <option value={100}>화면 맞춤</option><option value={125}>125%</option><option value={150}>150%</option><option value={200}>200%</option>
      </select>
      {canFull && <button className={BUTTON} onClick={()=>void fullscreen()}>{full ? "전체 화면 종료" : "전체 화면"}</button>}
    </div>
    <div className="brand-lecture-screen min-h-0 flex-1 overflow-auto bg-neutral-100 p-2" onContextMenu={e=>e.preventDefault()} onDragStart={e=>e.preventDefault()}>
      <div className="relative mx-auto aspect-video bg-white" style={{width:`${zoom}%`,maxWidth:full&&zoom===100?"calc((100dvh - 250px) * 16 / 9)":undefined}}>
        <canvas ref={canvas} width={1920} height={1080} className="block h-full w-full select-none" role="img" aria-label={`${page} / 40 · ${chapter.title}`} style={{visibility:allowed&&loaded===page?"visible":"hidden"}}>상세 내용은 학생용 교재에서도 확인할 수 있습니다.</canvas>
        {(!allowed || loaded!==page) && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center" role="status">
          <p className="text-sm leading-7">{!allowed ? "로그인한 등록 수강생과 강사만 열람할 수 있습니다." : error || `${page}페이지를 불러오는 중입니다.`}</p>
          {error&&allowed&&<button className={BUTTON} onClick={()=>setRetry(v=>v+1)}>다시 시도</button>}
        </div>}
      </div>
    </div>
    <div className="brand-lecture-controls flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 p-3">
      <select aria-label="강의 단원 이동" value={chapter.page} onChange={e=>move(Number(e.target.value))} className="min-h-11 max-w-full border border-neutral-300 bg-white px-2 text-sm">
        {lesson.chapters.map(c=><option key={c.page} value={c.page}>{String(c.page).padStart(2,"0")} · {c.title}</option>)}
      </select><span aria-live="polite" className="text-xs text-neutral-500">{page} / 40</span>
    </div>
    <div className="brand-lecture-help border-t border-neutral-200 p-3 text-xs leading-6 text-neutral-500">뷰어에 초점을 두고 ← → 키로 이동할 수 있습니다. 원본 PDF·PPTX 다운로드와 인쇄는 제공하지 않습니다. 화면 캡처·촬영·재배포를 삼가 주세요.{notice&&<p role="status">{notice}</p>}</div>
    <p className="brand-print-notice p-5">강의 슬라이드는 열람 전용으로 인쇄물에 포함되지 않습니다.</p>
  </div>;
}

export function BrandWebsiteWorkshop() {
  const { user, status } = useAuth();
  const allowed = !!user && (status === "student" || status === "instructor");
  const activeUser = useRef<string | null>(null);
  activeUser.current = allowed ? user!.id : null;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState(""); const [retry, setRetry] = useState(0);
  const [industry, setIndustry] = useState(""); const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null); const [viewer, setViewer] = useState(false);
  const [checks, setChecks] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false; setLesson(null); setError(""); setIndustry(""); setChecks([]); setViewer(false); setMessage("");
    if (!allowed) return;
    void (async()=>{
      try {
        const {data,error:readError}=await getSupabase().storage.from(FILE_BUCKET).download(`${DECK}/lesson.json`);
        if (readError || !data) throw new Error("unavailable");
        const parsed: unknown=JSON.parse(await data.text());
        if (!validLesson(parsed)) throw new Error("invalid-lesson");
        if (!cancelled) setLesson(parsed);
      } catch { if (!cancelled) setError("학습자료를 불러오지 못했습니다. 등록 수강 권한과 연결 상태를 확인해 주세요."); }
    })();
    return ()=>{cancelled=true;};
  },[allowed,user?.id,retry]);
  const download=async(name:string)=>{
    const filename=FILES.get(name),requestedUser=activeUser.current;
    if (!filename || !requestedUser || busy) return;
    setBusy(name);setMessage("");
    try {
      const {data,error:readError}=await getSupabase().storage.from(FILE_BUCKET).download(`${DECK}/${name}`);
      if (activeUser.current!==requestedUser) return;
      if (readError || !data?.size) throw new Error("download-failed");
      const url=URL.createObjectURL(data),a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),60000);
      setMessage("다운로드를 요청했습니다. 브라우저의 다운로드 목록을 확인하세요.");
    } catch { if (activeUser.current===requestedUser) setMessage("다운로드하지 못했습니다. 로그인·수강 권한과 브라우저 다운로드 설정을 확인하세요."); }
    finally { setBusy(null); }
  };
  const adapted=(text:string)=>industry.trim()?text.replace("산업 키워드: [직접 입력]",`산업 키워드: ${industry.trim()}`).replace("산업: [입력]",`산업: ${industry.trim()}`):text;
  const copy=async(p:Prompt)=>{
    try { await navigator.clipboard.writeText(adapted(p.text));setMessage(`${p.id} 프롬프트를 복사했습니다. 나머지 [입력]을 본인 내용으로 바꾸세요.`); }
    catch { setMessage("자동 복사가 제한되었습니다. 프롬프트 문장을 직접 선택해 복사하세요."); }
  };
  if (!allowed) return null;
  return <section id="brand-workshop" className="mt-6 min-w-0 scroll-mt-6 border border-neutral-300 bg-white" aria-labelledby="brand-workshop-title">
    <header className="border-b border-neutral-200 p-5 sm:p-7">
      <p className="text-xs font-bold tracking-widest text-blue-700">SESSION 03 · 이번 실습</p>
      <h2 id="brand-workshop-title" className="mt-3 break-keep text-2xl font-bold leading-tight sm:text-3xl">내가 선택한 산업으로<br/>한·영 브랜드 사이트 만들기</h2>
      <p className="mt-4 max-w-2xl break-keep text-sm leading-7 text-neutral-700">산업 조사 → 브리프 → 레퍼런스 1개 → 배치·이미지 → 한영 사이트 → 이미지 직접 교체 → 모바일 검수</p>
      <p className="mt-3 border-l-2 border-blue-700 pl-3 text-sm leading-7">학생 프로젝트는 Gemini 앱과 AI Studio를 중심으로 진행합니다. Supabase·Firebase·Vercel·외부 API·실제 결제는 사용하지 않습니다. Stitch는 선택, Canvas는 대체 경로입니다.</p>
      <nav aria-label="브랜드 사이트 실습 영역" className="mt-4 flex flex-wrap gap-2">
        {[["brand-files","학생 자료"],["brand-lecture","강의 뷰어"],["brand-steps","실습 단계"],["brand-prompts","프롬프트"],["brand-submit","제출·점검"]].map(([id,label])=><a key={id} className={BUTTON} href={`#${id}`}>{label}</a>)}
      </nav>
    </header>
    {!lesson?<div className="p-6" role="status"><p className="text-sm leading-7">{error||"학습자료를 불러오는 중입니다."}</p>{error&&<button className={`${BUTTON} mt-3`} onClick={()=>setRetry(v=>v+1)}>다시 시도</button>}</div>:
    <div className="space-y-8 p-5 sm:p-7">
      <section id="brand-files" className="scroll-mt-6" aria-labelledby="brand-files-title">
        <h3 id="brand-files-title" className="text-lg font-bold">학생용 자료 다운로드</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{lesson.files.map(f=><div key={f.name} className="border border-neutral-200 p-4"><h4 className="font-bold">{f.title}</h4><p className="mt-2 text-sm leading-7 text-neutral-600">{f.detail}</p><button className={`${BUTTON} mt-4 w-full`} disabled={!!busy} onClick={()=>void download(f.name)}>{busy===f.name?"파일 준비 중…":"다운로드"}</button></div>)}</div>
        <p className="mt-3 text-xs leading-6 text-neutral-500">LMS 등록 수강 권한으로 직접 내려받습니다. 별도 Google Drive 공유 승인은 필요하지 않습니다. 학생 패키지에는 강의 원본과 강사 해설이 없습니다.</p>
      </section>
      <section id="brand-lecture" className="scroll-mt-6" aria-labelledby="brand-lecture-title">
        <h3 id="brand-lecture-title" className="text-lg font-bold">강의 슬라이드 · 뷰어 전용</h3>
        <button className={`${BUTTON} mt-3`} aria-expanded={viewer} aria-controls="brand-slide-region" onClick={()=>setViewer(v=>!v)}>{viewer?"강의 뷰어 접기":"40장 강의 슬라이드 열기"}</button>
        <div id="brand-slide-region" className="mt-3">{viewer&&<BrandSlideViewer lesson={lesson}/>}</div>
        {status==="instructor"&&<p className="mt-3 text-xs leading-6 text-neutral-500">강사용 PPTX·PDF 원본과 진행·평가 가이드는 GPT 채팅의 다운로드 파일로 제공됩니다. LMS에는 원본 다운로드 링크를 넣지 않았습니다.</p>}
      </section>
      <section id="brand-steps" className="scroll-mt-6" aria-labelledby="brand-steps-title">
        <h3 id="brand-steps-title" className="text-lg font-bold">단계별 실습</h3>
        <p className="mt-2 text-sm leading-7 text-neutral-600">메인 1개 · 섹션 5~6개 · 레퍼런스 1개 · 이미지 4~6개. 생성 횟수가 아니라 직접 확인한 결과를 기준으로 진행합니다.</p>
        <div className="mt-4 border-x border-t border-neutral-200">{lesson.steps.map((s,i)=><details key={s.id} open={i===0} className="border-b border-neutral-200"><summary className="cursor-pointer px-4 py-4 text-sm font-bold focus-visible:outline focus-visible:outline-2">{s.title}</summary><div className="px-4 pb-5 text-sm leading-7"><p className="break-keep text-neutral-700">{s.text}</p><ol className="mt-3 list-decimal space-y-2 pl-5">{s.do.map(t=><li key={t}>{t}</li>)}</ol><p className="mt-3 border-l-2 border-blue-700 pl-3 font-semibold">완료 기준 · {s.done}</p>{s.prompt&&<a href="#brand-prompts" className="mt-2 inline-flex min-h-11 items-center text-blue-700 underline underline-offset-4">{s.prompt} 프롬프트 확인 →</a>}</div></details>)}</div>
      </section>
      <section id="brand-prompts" className="scroll-mt-6" aria-labelledby="brand-prompts-title">
        <h3 id="brand-prompts-title" className="text-lg font-bold">복사해서 사용하는 프롬프트 8개</h3>
        <label className="mt-4 block text-sm font-semibold">내 산업 키워드<input value={industry} onChange={e=>setIndustry(e.target.value)} maxLength={100} placeholder="예: 생수 브랜드 / 반려동물 브랜드 / 여행 브랜드" className="mt-2 block min-h-12 w-full border border-neutral-400 bg-white px-3 py-3 text-sm"/></label>
        <p className="mt-2 text-xs leading-6 text-neutral-500">입력한 키워드는 해당 프롬프트의 산업 항목에만 적용됩니다. 브랜드명 등 나머지 [입력]은 직접 작성하세요. 키워드와 체크 상태는 서버에 저장되지 않습니다.</p>
        <p role="status" aria-live="polite" className="mt-3 text-sm leading-7 text-blue-800">{message}</p>
        <div className="mt-4 border-x border-t border-neutral-200">{lesson.prompts.map(p=><details key={p.id} className="border-b border-neutral-200"><summary className="cursor-pointer px-4 py-4 text-sm font-bold"><span className="mr-3 font-mono text-blue-700">{p.id}</span>{p.title}</summary><div className="px-4 pb-5"><p className="text-xs leading-6 text-neutral-600">{p.tool} · {p.goal}</p><p className="mt-3 select-text whitespace-pre-wrap break-keep bg-neutral-50 p-4 text-sm leading-7">{adapted(p.text)}</p><button className={`${BUTTON} mt-3`} onClick={()=>void copy(p)}>프롬프트 복사</button><p className="mt-3 text-xs leading-6 text-neutral-600">검수 · {p.check}</p></div></details>)}</div>
      </section>
      <section id="brand-submit" className="scroll-mt-6" aria-labelledby="brand-submit-title"><h3 id="brand-submit-title" className="text-lg font-bold">제출·자기 점검</h3><p className="mt-2 text-sm leading-7">1쪽 브리프 + 레퍼런스·이미지 출처 + 한영·PC·모바일 결과 + QA 기록을 제출합니다. 외부 배포 URL은 필수가 아닙니다.</p><fieldset className="mt-4 border border-neutral-200 p-4"><legend className="px-2 text-sm font-semibold">실제로 확인한 항목 · {checks.length}/{lesson.checks.length}</legend>{lesson.checks.map(c=><label key={c} className="mb-3 flex cursor-pointer items-start gap-3 text-sm leading-7"><input type="checkbox" className="mt-1.5 h-4 w-4 shrink-0 accent-black" checked={checks.includes(c)} onChange={e=>setChecks(v=>e.target.checked?[...v,c]:v.filter(x=>x!==c))}/><span>{c}</span></label>)}</fieldset><p className="mt-2 text-xs leading-6 text-neutral-500">자기 점검은 현재 화면에서만 유지됩니다. 과제 제출·출석·수료로 자동 처리되지 않습니다.</p><a href="/feedback" className={`${BUTTON} mt-4`}>과제&피드백에서 3회차 제출 →</a></section>
      <details className="border-t border-neutral-200 pt-4"><summary className="cursor-pointer text-sm font-semibold">출처와 확인 범위</summary><p className="mt-3 text-xs leading-6 text-neutral-600">사용자와 합의한 실습안과 기존 Notebook의 근거→문제→가설→검증 흐름을 바탕으로 제작했습니다. 실제 학생 계정에서 생성 과정을 실행한 기록은 아닙니다. 계정별 메뉴·모델·사용량은 수업 전 확인합니다.</p>{lesson.refs.map(r=><div key={r.id} className="mt-3 text-xs leading-6"><p className="font-semibold">{r.id} · {r.title}</p>{r.url.startsWith("https://")&&<a href={r.url} target="_blank" rel="noopener noreferrer" className="break-all underline underline-offset-4">공식 문서 열기 ↗</a>}<p className="text-neutral-600">{r.verified} · {r.note}</p></div>)}</details>
      <footer className="border-t border-neutral-200 pt-4 text-xs text-neutral-500">K-MOVE SESSION 03 · BRAND WEBSITE WORKSHOP · {lesson.date} · v{lesson.version}</footer>
    </div>}
  </section>;
}
