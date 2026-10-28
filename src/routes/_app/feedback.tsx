import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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
  { name: "강민주", major: "시각디자인학과" },
  { name: "강유민", major: "의류산업학과" },
  { name: "김다혜", major: "컴퓨터공학과" },
  { name: "김선미", major: "시각디자인학전공" },
  { name: "김재은", major: "시각커뮤니케이션디자인전공" },
  { name: "김화민", major: "영상미디어콘텐츠과" },
  { name: "류영진", major: "리빙디자인과" },
  { name: "오한별", major: "영상미디어과" },
  { name: "이익제", major: "시각디자인학과" },
  { name: "이주희", major: "디지털콘텐츠디자인학전공" },
  { name: "이지원", major: "산업디자인학전공" },
  { name: "임시윤", major: "영상미디어과" },
  { name: "정여진", major: "시각디자인학과" },
  { name: "최지인", major: "영상미디어과" },
  { name: "최형주", major: "시각디자인학과" },
] as const;

const WEEKS = Array.from({ length: 24 }, (_, index) => index + 1);

function FeedbackPage() {
  const [studentIndex, setStudentIndex] = useState(0);
  const [week, setWeek] = useState(6);
  const student = STUDENTS[studentIndex];

  return (
    <div className="min-h-screen bg-[#101010] px-4 pb-20 pt-9 text-white sm:px-5 md:px-5 md:pb-12 lg:px-6">
      <h1 className="mb-8 text-[clamp(2.25rem,3.1vw,3.125rem)] font-normal leading-none tracking-[-0.035em] md:mb-7">
        FEEDBACK
      </h1>

      <div className="grid min-w-0 gap-7 md:grid-cols-[104px_minmax(0,1fr)] md:items-start md:gap-x-[clamp(2.5rem,8vw,8.75rem)]">
        <section aria-label="수강생 선택" className="min-w-0 md:pt-0">
          <div className="flex gap-1 overflow-x-auto pb-1 md:block md:overflow-visible md:pb-0">
            {STUDENTS.map((item, index) => (
              <button
                key={item.name}
                type="button"
                aria-pressed={studentIndex === index}
                onClick={() => setStudentIndex(index)}
                className={`flex h-10 min-w-[104px] shrink-0 items-center border-b border-[#666] px-2.5 text-left text-[12px] tracking-[-0.035em] transition-colors md:w-full md:min-w-0 ${studentIndex === index ? "border-white bg-white text-black" : "bg-black text-[#dedede] hover:bg-[#303030] hover:text-white"}`}
              >
                <span className="whitespace-nowrap">{String(index + 1).padStart(2, "0")}. {item.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section aria-label="주차별 피드백 문서" className="min-w-0">
          <div className="relative isolate mr-9 pt-8 sm:mr-11 md:mr-12">
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 bottom-3 top-0 border border-[#d9d9d5] bg-[#e0e0dc] sm:left-12 sm:right-6" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-3 bottom-1 top-3 border border-[#dededb] bg-[#efefec] sm:left-6 sm:right-3" />

            <div className="relative min-h-[1190px] border border-[#dadad7] bg-[#fff] text-[#111] shadow-[0_12px_20px_rgba(0,0,0,0.13)]">
              <div role="group" aria-label="피드백 주차 선택" className="absolute left-full top-11 z-10 flex flex-col">
                {WEEKS.map((number) => {
                  const active = number === week;
                  return (
                    <button
                      key={number}
                      type="button"
                      aria-label={`${number}주차 피드백 보기`}
                      aria-pressed={active}
                      onClick={() => setWeek(number)}
                      className={`relative flex h-[46px] w-9 items-center justify-center border-b-[3px] border-[#171717] text-[11px] font-semibold tabular-nums transition-colors sm:w-11 ${active ? "z-20 -ml-px bg-white text-black" : "bg-[#d2d2d0] text-[#696969] hover:bg-[#ececea] hover:text-black"}`}
                    >
                      {String(number).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>

              <div className="px-5 pt-9 sm:px-8 md:px-9 lg:px-[clamp(2rem,4vw,3.5rem)]">
                <div className="border-b-2 border-black pb-3">
                  <h2 className="text-[clamp(1.5rem,2.3vw,2rem)] font-light leading-tight tracking-[-0.05em]">
                    Week {String(week).padStart(2, "0")}
                  </h2>
                </div>
                <div className="border-b-2 border-black py-4">
                  <h3 className="text-[clamp(2.125rem,3.2vw,3.125rem)] font-semibold leading-tight tracking-[-0.055em]">
                    {student.name}
                  </h3>
                </div>
                <div className="min-h-[900px]" aria-live="polite">
                  <p className="sr-only">{student.name}의 {week}주차 피드백은 아직 등록되지 않았습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
