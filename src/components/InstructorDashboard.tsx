import { useMemo, useState } from "react";
import { Download, RefreshCw, Users, ClipboardCheck, ArrowRight } from "lucide-react";
import {
  formatSubmitted,
  responsesCsv,
  survey,
  type Profile,
  type SurveyResponse,
} from "@/lib/survey";
import { SurveyAnswers } from "./SurveyForm";

export function InstructorDashboard({
  profiles,
  responses,
  refreshing,
  onRefresh,
}: {
  profiles: Profile[];
  responses: SurveyResponse[];
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const responseMap = useMemo(() => new Map(responses.map((r) => [r.user_id, r])), [responses]);
  const students = profiles.filter((p) => p.role === "student");
  const submitted = students.filter((p) => responseMap.has(p.id));
  const studentResponses = submitted.flatMap((p) => responseMap.get(p.id) ?? []);
  const visible = students
    .filter((p) => {
      const r = responseMap.get(p.id);
      return (
        (filter === "all" || (filter === "submitted" ? !!r : !r)) &&
        `${p.username} ${r?.answers["name"] ?? ""}`
          .toLocaleLowerCase()
          .includes(search.trim().toLocaleLowerCase())
      );
    })
    .sort((a, b) => a.username.localeCompare(b.username, "ko"));
  const detail = selected ? responseMap.get(selected) : undefined;
  const selectedProfile = profiles.find((p) => p.id === selected);
  function download() {
    const rows = visible.flatMap((p) => responseMap.get(p.id) ?? []);
    const blob = new Blob([responsesCsv(rows, profiles)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `K-Move_1주차_설문응답_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-medium tracking-[0.18em] text-muted-foreground">
            INSTRUCTOR
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">강사 대시보드</h1>
          <p className="mt-2 text-sm text-muted-foreground">1주차 · 사전 학습 설문</p>
        </div>
        <button
          className="inline-flex min-h-11 items-center gap-2 border border-border px-4 text-sm disabled:opacity-50"
          disabled={refreshing}
          onClick={onRefresh}
        >
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
          새로고침
        </button>
      </header>
      <div className="mb-8 grid grid-cols-3 border-y border-foreground bg-card">
        {[
          { label: "전체 수강생", value: students.length, icon: Users },
          { label: "제출 완료", value: submitted.length, icon: ClipboardCheck },
          { label: "미제출", value: students.length - submitted.length, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <section key={label} className="border-r border-border px-3 py-6 last:border-r-0 sm:px-6">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon aria-hidden className="hidden size-4 sm:block" />
              {label}
            </p>
            <p className="mt-3 text-3xl font-medium tabular-nums sm:text-4xl">
              {value}
              <span className="ml-2 text-xs text-muted-foreground">명</span>
            </p>
          </section>
        ))}
      </div>
      <div className="mb-10">
        <div className="mb-2 flex justify-between text-xs">
          <span>응답률</span>
          <span>
            {students.length ? Math.round((submitted.length / students.length) * 100) : 0}%
          </span>
        </div>
        <div className="h-1.5 bg-muted">
          <div
            className="h-full bg-foreground transition-all"
            style={{
              width: `${students.length ? (submitted.length / students.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
      <section aria-labelledby="responses-title" className="mb-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="responses-title" className="text-lg font-semibold">
            수강생별 제출 현황
          </h2>
          <button
            className="inline-flex min-h-11 items-center gap-2 border border-border px-4 text-sm disabled:opacity-40"
            disabled={!visible.some((p) => responseMap.has(p.id))}
            onClick={download}
          >
            <Download aria-hidden className="size-4" />
            현재 목록 CSV
          </button>
        </div>
        <div className="mb-4 flex flex-wrap gap-3">
          <label className="min-w-0 flex-1">
            <span className="sr-only">수강생 검색</span>
            <input
              type="search"
              placeholder="수강생 이름 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-h-11 w-full border border-input bg-card px-3 text-sm"
            />
          </label>
          <label>
            <span className="sr-only">제출 상태</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="min-h-11 border border-input bg-card px-3 text-sm"
            >
              <option value="all">전체</option>
              <option value="submitted">제출 완료</option>
              <option value="pending">미제출</option>
            </select>
          </label>
        </div>
        <p className="mb-2 text-xs text-muted-foreground">
          {visible.length}명 표시 · CSV에는 현재 목록 중 제출한 수강생의 전체 응답이 포함됩니다.
        </p>
        <div className="divide-y divide-border border-y border-border bg-card">
          {visible.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              {students.length
                ? "조건에 맞는 수강생이 없습니다."
                : "아직 가입한 수강생이 없습니다. 가입 후 이곳에 표시됩니다."}
            </p>
          ) : (
            visible.map((p) => {
              const r = responseMap.get(p.id);
              return (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5"
                >
                  <div>
                    <p className="text-sm font-semibold">{p.username}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r
                        ? `최종 제출 ${formatSubmitted(r.updated_at)}`
                        : "아직 응답을 제출하지 않았습니다."}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs ${r ? "font-semibold" : "text-muted-foreground"}`}>
                      {r ? "제출 완료" : "미제출"}
                    </span>
                    {r && (
                      <button
                        className="inline-flex min-h-11 items-center gap-1 border border-border px-3 text-xs"
                        aria-label={`${p.username} 응답 보기`}
                        onClick={() => {
                          setSelected(p.id);
                          requestAnimationFrame(() =>
                            document.getElementById("response-detail")?.focus(),
                          );
                        }}
                      >
                        응답 보기
                        <ArrowRight aria-hidden className="size-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
      {detail && (
        <section
          id="response-detail"
          tabIndex={-1}
          className="mb-10 scroll-mt-6 border border-foreground bg-card p-5 sm:p-8"
        >
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{selectedProfile?.username} 님의 응답</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatSubmitted(detail.updated_at)}
              </p>
            </div>
            <button
              className="min-h-11 border border-border px-4 text-sm"
              onClick={() => setSelected(null)}
            >
              닫기
            </button>
          </div>
          <SurveyAnswers answers={detail.answers} />
        </section>
      )}
      <section aria-labelledby="summary-title">
        <h2 id="summary-title" className="mb-4 text-lg font-semibold">
          수업 준비를 위한 응답 요약
        </h2>
        <p className="mb-5 text-xs text-muted-foreground">
          수강생 응답 {studentResponses.length}건 기준 · 복수 선택 항목은 중복 집계합니다.
        </p>
        <div className="grid gap-5 lg:grid-cols-2">
          {["aiExperience", "goals", "portfolio", "interests"].map((id) => {
            const q = survey.questions.find((q) => q.id === id)!;
            return (
              <section key={id} className="border border-border bg-card p-5">
                <h3 className="mb-5 text-sm font-semibold">{q.title}</h3>
                <div className="space-y-4">
                  {q.options?.map((o) => {
                    const count = studentResponses.filter((r) =>
                      Array.isArray(r.answers[id])
                        ? (r.answers[id] as string[]).includes(o.id)
                        : r.answers[id] === o.id,
                    ).length;
                    return (
                      <div key={o.id}>
                        <div className="mb-1.5 flex justify-between gap-3 text-xs">
                          <span>{o.title}</span>
                          <span className="shrink-0 tabular-nums">{count}명</span>
                        </div>
                        <div className="h-1 bg-muted">
                          <div
                            className="h-full bg-foreground"
                            style={{
                              width: `${studentResponses.length ? (count / studentResponses.length) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </>
  );
}
