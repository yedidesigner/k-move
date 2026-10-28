import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ClipboardPenLine } from "lucide-react";

export const Route = createFileRoute("/_app/feedback")({
  head: () => ({
    meta: [
      { title: "피드백 | K-Move LMS" },
      { name: "description", content: "수강생별 1주차부터 24주차까지 피드백 아카이브" },
    ],
  }),
  component: FeedbackPage,
});

const STUDENTS = [
  { name: "강민주", major: "시각디자인학과", marked: true },
  { name: "강유민", major: "의류산업학과" },
  { name: "김다혜", major: "컴퓨터공학과" },
  { name: "김선미", major: "시각디자인학전공" },
  { name: "김재은", major: "시각커뮤니케이션디자인전공" },
  { name: "김화민", major: "영상미디어콘텐츠과", marked: true },
  { name: "류영진", major: "리빙디자인과" },
  { name: "오한별", major: "영상미디어과", marked: true },
  { name: "이익제", major: "시각디자인학과", marked: true },
  { name: "이주희", major: "디지털콘텐츠디자인학전공" },
  { name: "이지원", major: "산업디자인학전공" },
  { name: "임시윤", major: "영상미디어과", marked: true },
  { name: "정여진", major: "시각디자인학과", marked: true },
  { name: "최지인", major: "영상미디어과", marked: true },
  { name: "최형주", major: "시각디자인학과" },
] as const;

const WEEKS = Array.from({ length: 24 }, (_, i) => i + 1);

function FeedbackPage() {
  const [selectedStudent, setSelectedStudent] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const student = STUDENTS[selectedStudent];

  return (
    <div className="-mx-4 -mt-6 min-h-[calc(100vh-5rem)] bg-[#111111] px-4 pb-14 pt-9 text-white md:-mx-10 md:-mt-10 md:px-8 md:pt-11">
      <header className="mx-auto mb-9 max-w-5xl border-b border-white/30 pb-6">
        <p className="mb-2 text-[11px] font-semibold tracking-[0.3em] text-white/60">K-MOVE / DESIGN ARCHIVE</p>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-4xl font-black tracking-[-0.055em] md:text-6xl">FEEDBACK.</h1>
            <p className="mt-3 text-sm text-white/65">수강생별 · 01—24주차 피드백 아카이브</p>
          </div>
          <span className="text-xs tabular-nums tracking-widest text-white/55">15 STUDENTS / 24 WEEKS</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl items-start gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <section aria-label="수강생 선택" className="lg:sticky lg:top-6">
          <h2 className="mb-3 border-b border-white/25 pb-2 text-xs font-semibold uppercase tracking-[0.2em]">INDEX / STUDENTS</h2>
          <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-x-0">
            {STUDENTS.map((item, i) => (
              <button key={item.name} type="button" onClick={() => setSelectedStudent(i)}
                aria-pressed={selectedStudent === i}
                className={`flex min-h-11 items-center justify-between gap-2 border-b px-2 py-2 text-left text-sm transition-colors ${selectedStudent === i ? "border-white bg-white font-bold text-black" : "border-white/20 text-white/70 hover:bg-white/10 hover:text-white"}`}>
                <span>{String(i + 1).padStart(2, "0")}. {item.name}</span>
                <span aria-hidden="true" className="text-xs">{selectedStudent === i ? "↗" : ""}</span>
              </button>
            ))}
          </div>
        </section>

        <section aria-label="주차별 피드백" className="min-w-0">
          <div className="relative isolate pr-5 pt-5 sm:pr-9 sm:pt-7">
            <div aria-hidden="true" className="absolute inset-x-5 bottom-3 top-1 border border-[#d1d1ce] bg-[#dddcd8] sm:inset-x-9" />
            <div aria-hidden="true" className="absolute inset-x-2 bottom-1 top-3 border border-[#ddd] bg-[#eeeeeb] sm:inset-x-5" />

            <div className="relative min-h-[640px] border border-[#dededc] bg-[#fdfdfb] px-6 pb-10 pt-9 text-black shadow-[12px_16px_0_rgba(0,0,0,.25)] sm:px-10 sm:pt-12">
              <div className="absolute -right-5 top-8 flex flex-col gap-[2px] sm:-right-9" aria-label="주차 인덱스">
                {WEEKS.map((week) => (
                  <button type="button" key={week} onClick={() => setSelectedWeek(week)}
                    aria-label={`${week}주차 선택`} aria-pressed={selectedWeek === week}
                    className={`flex h-7 w-6 items-center justify-center rounded-r-md border border-l-0 text-[9px] font-bold tabular-nums transition-colors sm:h-8 sm:w-9 sm:text-[10px] ${selectedWeek === week ? "z-10 border-[#fdfdfb] bg-[#fdfdfb] text-black" : "border-[#d0d0ce] bg-[#dfdfdc] text-[#666] hover:bg-white"}`}>
                    {String(week).padStart(2, "0")}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between border-b border-black/20 pb-4 text-[10px] font-bold tracking-[0.2em] sm:text-xs">
                <span>K-MOVE / PORTFOLIO</span>
                <span>FEEDBACK FILE — {String(selectedStudent + 1).padStart(2, "0")}</span>
              </div>

              <div className="mt-9 border-b-2 border-black pb-7">
                <p className="mb-2 text-xs font-bold tracking-[0.2em] text-neutral-500">STUDENT PROFILE</p>
                <h2 className="text-5xl font-black tracking-[-0.065em] sm:text-7xl">{student.name}</h2>
                <p className="mt-3 text-sm text-neutral-600">{student.major}</p>
              </div>

              <div className="mt-10 flex items-end justify-between gap-4 border-b border-black/20 pb-5">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.2em] text-neutral-500">WEEKLY REVIEW</p>
                  <h3 className="mt-1 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{String(selectedWeek).padStart(2, "0")}<span className="ml-2 text-lg font-medium">주차</span></h3>
                </div>
                <ClipboardPenLine className="size-7 text-neutral-400" aria-hidden="true" />
              </div>

              <div className="mt-8 min-h-48 border-b border-black/20 pb-9">
                <p className="mb-3 text-[11px] font-bold tracking-[0.2em] text-neutral-500">INSTRUCTOR'S NOTE</p>
                <p className="text-sm leading-7 text-neutral-500">등록된 피드백이 없습니다.</p>
                <p className="mt-1 text-xs leading-6 text-neutral-400">피드백 작성 및 저장 기능은 추후 연결할 예정입니다.</p>
              </div>

              <div className="mt-8 flex items-center justify-between gap-3">
                <button type="button" disabled={selectedWeek === 1} onClick={() => setSelectedWeek((v) => Math.max(1, v - 1))}
                  className="inline-flex min-h-11 items-center gap-1 text-xs font-bold disabled:opacity-30"><ChevronLeft className="size-4" /> PREV WEEK</button>
                <span className="text-xs font-semibold tabular-nums">{String(selectedWeek).padStart(2, "0")} / 24</span>
                <button type="button" disabled={selectedWeek === 24} onClick={() => setSelectedWeek((v) => Math.min(24, v + 1))}
                  className="inline-flex min-h-11 items-center gap-1 text-xs font-bold disabled:opacity-30">NEXT WEEK <ChevronRight className="size-4" /></button>
              </div>
              <p className="mt-14 text-right text-[10px] font-bold tracking-[0.2em] text-neutral-400">K-MOVE DESIGN ARCHIVE · 2026—2027</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
