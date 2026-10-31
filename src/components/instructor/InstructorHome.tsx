import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  RefreshCw,
  FilePenLine,
  ClipboardCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  listAssignments,
  listAssignmentTargets,
  listEnrollments,
  listSubmissions,
  listReviewDrafts,
  listReviewPublications,
} from "@/lib/instructor-api";
import { summarizeInstructorWork, type InstructorWorkData } from "@/lib/instructor-dashboard";
import { usePublishedSessions, PublishedAnnouncements } from "@/lib/published-content";
import { formatDateKo, seoulToday, CLASS_START, CLASS_END } from "@/data/schedule";
import { getSupabase } from "@/lib/supabase";
import { koreanRecordDate } from "@/lib/student-operations";

export function InstructorHome({ onPreview }: { onPreview: () => void }) {
  const { user, status } = useAuth();
  const sessions = usePublishedSessions();
  const [today, setToday] = useState(seoulToday);
  const [data, setData] = useState<InstructorWorkData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [driveProblems, setDriveProblems] = useState<number | null>(null);
  const generation = useRef(0);
  const load = useCallback(async () => {
    if (status !== "instructor" || !user) return;
    const request = ++generation.current;
    setBusy(true);
    setError("");
    try {
      const [enrollments, assignments, targets, submissions, reviews, publications, folders] =
        await Promise.all([
          listEnrollments(),
          listAssignments(),
          listAssignmentTargets(),
          listSubmissions(),
          listReviewDrafts(),
          listReviewPublications(),
          getSupabase().from("kmove_student_drive_folders").select("user_id,sharing_ready"),
        ]);
      if (request !== generation.current) return;
      setData({ enrollments, assignments, targets, submissions, reviews, publications });
      const active = new Set(
        enrollments.filter((row) => row.status === "active").map((row) => row.user_id),
      );
      setDriveProblems(
        folders.error
          ? null
          : enrollments.filter(
              (row) =>
                active.has(row.user_id) &&
                !folders.data?.some(
                  (folder) => folder.user_id === row.user_id && folder.sharing_ready,
                ),
            ).length,
      );
    } catch {
      if (request === generation.current)
        setError("수업 운영 현황을 불러오지 못했습니다. 다시 시도해 주세요.");
    } finally {
      if (request === generation.current) setBusy(false);
    }
  }, [status, user?.id]);
  useEffect(() => {
    setData(null);
    setDriveProblems(null);
    void load();
    const refresh = () => {
      setToday(seoulToday());
      if (document.visibilityState !== "hidden") void load();
    };
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    return () => {
      generation.current++;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [load]);
  const next = [...sessions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .find((session) => session.date >= today);
  const summary = data ? summarizeInstructorWork(data) : null;
  const activeCount = data?.enrollments.filter((row) => row.status === "active").length;
  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-300 pb-5">
        <div>
          <p className="text-[11px] font-medium tracking-[0.14em] text-neutral-500">
            INSTRUCTOR WORKSPACE
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">강사 홈</h1>
          <p className="mt-2 text-sm text-neutral-600">오늘 수업과 확인할 제출물을 정리했습니다.</p>
        </div>
        <button
          type="button"
          onClick={onPreview}
          className="min-h-10 border border-neutral-300 px-4 text-xs font-medium hover:bg-neutral-100"
        >
          학생 홈 미리보기
        </button>
      </header>
      <PublishedAnnouncements />
      <section
        aria-labelledby="instructor-next-session"
        className="flex flex-wrap items-center justify-between gap-6 border border-neutral-300 bg-white p-5 md:p-7"
      >
        <div>
          <p className="flex items-center gap-2 text-xs text-neutral-500">
            <CalendarDays className="size-4" aria-hidden />
            {next?.date === today ? "오늘의 수업" : next ? "다음 수업" : "과정 일정 종료"}
          </p>
          <h2 id="instructor-next-session" className="mt-3 text-xl font-semibold">
            {next
              ? `${String(next.number).padStart(2, "0")}회차 · ${next.title}`
              : "남은 제출물과 피드백을 확인해 주세요."}
          </h2>
          {next && (
            <p className="mt-2 text-sm text-neutral-600">
              {formatDateKo(next.date)} · {next.startTime ?? CLASS_START}–
              {next.endTime ?? CLASS_END} (한국 시간)
            </p>
          )}
        </div>
        {next && (
          <Link
            to="/sessions/$id"
            params={{ id: next.id }}
            className="inline-flex min-h-11 items-center gap-5 bg-black px-5 text-sm font-medium text-white"
          >
            수업 열기
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </section>
      <section aria-label="수업 운영 현황">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            {activeCount === undefined ? "수강생 확인 중" : "수강 중 " + activeCount + "명"} · 전체
            회차 기준
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void load()}
            className="inline-flex min-h-9 items-center gap-2 text-xs text-neutral-600 disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${busy ? "animate-spin" : ""}`} aria-hidden />
            새로고침
          </button>
        </div>
        {error && (
          <div role="alert" className="mb-4 border border-neutral-300 p-4 text-sm">
            {error}
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "검토 대기",
              count: summary?.pending.length,
              unit: "건",
              filter: "pending",
              icon: ClipboardCheck,
            },
            {
              label: "작성 중 피드백",
              count: summary?.drafts.length,
              unit: "건",
              filter: "draft",
              icon: FilePenLine,
            },
            {
              label: "마감 후 미제출",
              count: summary?.missingStudentCount,
              unit: "명",
              filter: "missing",
              icon: Users,
            },
          ].map((item) => (
            <a
              key={item.filter}
              href={`/feedback?filter=${item.filter}&session=all`}
              className="flex items-center justify-between border border-neutral-300 bg-white p-5 hover:border-black"
            >
              <span>
                <span className="flex items-center gap-2 text-sm text-neutral-600">
                  <item.icon className="size-4" aria-hidden />
                  {item.label}
                </span>
                <span className="mt-3 block text-3xl font-semibold tabular-nums">
                  {error ? "—" : (item.count ?? "—")}
                  <span className="ml-1 text-xs font-normal text-neutral-500">{item.unit}</span>
                </span>
              </span>
              <ArrowRight className="size-4" aria-hidden />
            </a>
          ))}
        </div>
      </section>
      <section aria-labelledby="instructor-work-queue" className="border-t border-neutral-300 pt-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="instructor-work-queue" className="text-lg font-semibold">
            이어서 처리하기
          </h2>
          <a
            href="/feedback?session=all"
            className="min-h-9 py-2 text-xs underline underline-offset-4"
          >
            전체 제출물
          </a>
        </div>
        {!summary ? (
          <p role="status" className="py-8 text-sm text-neutral-500">
            {error ? "현황을 확인한 후 목록을 표시합니다." : "제출물을 불러오는 중…"}
          </p>
        ) : !summary.queue.length ? (
          <div className="border border-dashed border-neutral-300 px-5 py-8">
            <p className="text-sm font-medium">현재 검토할 제출물이 없습니다.</p>
            <p className="mt-2 text-xs leading-6 text-neutral-500">
              과제를 공개하고 학생이 제출하면 이곳에서 확인할 수 있습니다.
            </p>
            <Link
              to="/assignments"
              className="mt-4 inline-flex min-h-10 items-center border border-neutral-300 px-4 text-xs"
            >
              과제 관리 열기
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 border-y border-neutral-200">
            {summary.queue.slice(0, 8).map((row) => (
              <a
                key={row.submission.id}
                href={`/feedback?submission=${row.submission.id}`}
                className="flex items-center justify-between gap-4 py-4 hover:bg-neutral-50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {row.enrollment.name}
                    <span className="ml-3 text-xs font-normal text-neutral-500">
                      {String(row.assignment.session_number).padStart(2, "0")}회차 · v
                      {row.submission.version}
                    </span>
                  </p>
                  <p className="mt-1 truncate text-sm text-neutral-600">{row.assignment.title}</p>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    제출 {koreanRecordDate(row.submission.submitted_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="border border-neutral-300 px-2 py-1 text-xs">
                    {row.kind === "draft"
                      ? "작성 이어가기"
                      : row.submission.version > 1
                        ? "수정본 검토"
                        : "검토 시작"}
                  </span>
                  <ArrowRight className="size-4" aria-hidden />
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
      <details className="border-t border-neutral-300 pt-4">
        <summary className="cursor-pointer text-sm font-medium">
          운영 확인 사항{driveProblems !== null && driveProblems > 0 ? ` · ${driveProblems}건` : ""}
        </summary>
        <div className="mt-4 space-y-3 text-sm text-neutral-600">
          <p>
            {driveProblems === null
              ? "Drive 연결 상태는 학생 관리에서 확인할 수 있습니다."
              : driveProblems
                ? `Drive 공유 연결을 확인할 학생이 ${driveProblems}명 있습니다.`
                : "수강 중인 학생의 Drive 연결이 준비되어 있습니다."}
          </p>
          <p>폴더 연결 상태는 과제 제출 여부와 별도로 관리합니다.</p>
          <Link
            to="/admin"
            className="inline-flex min-h-10 items-center border border-neutral-300 px-4 text-xs"
          >
            학생 관리 열기
          </Link>
        </div>
      </details>
    </div>
  );
}
