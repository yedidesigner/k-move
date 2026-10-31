import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { koreanRecordDate } from "@/lib/student-operations";

type Log = {
  id: string;
  action: string;
  created_at: string;
  target_id?: string;
  target_type?: string;
};
const ACTIONS: Record<string, string> = {
  "assignment.saved": "과제 저장",
  "assignment.target_changed": "과제 배정 변경",
  "submission.created": "과제 제출",
  "feedback.published": "피드백 공개",
  "content.published": "콘텐츠 공개·예약",
  "content.schedule_cancelled": "콘텐츠 예약 취소",
  "enrollment.status": "수강 상태 변경",
  "enrollment.added": "수강생 등록",
  "portfolio.version": "포트폴리오 버전 등록",
  "student.relinked": "학생 계정 연결 변경",
};
export function OperationsSettings() {
  const { user, status } = useAuth();
  const [logs, setLogs] = useState<Log[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (status !== "instructor") return;
    let active = true;
    setLogs(null);
    setError(false);
    void getSupabase()
      .from("kmove_operation_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(40)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError(true);
        else setLogs((data ?? []) as Log[]);
      });
    return () => {
      active = false;
    };
  }, [user?.id, status, attempt]);
  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">운영 설정</h1>
        <p className="mt-2 text-sm text-neutral-600">
          과정 운영 기준과 최근 변경 기록을 확인합니다.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="border border-neutral-300 p-5">
          <h2 className="font-semibold">일정과 공개</h2>
          <p className="mt-3 text-sm leading-7 text-neutral-600">
            시간은 한국 시간으로 표시합니다. 수업 날짜, 자료 공개 예약, 과제 마감은 각각 관리합니다.
          </p>
          <Link
            to="/sessions"
            className="mt-4 inline-flex min-h-10 items-center border border-neutral-300 px-4 text-xs"
          >
            수업 일정 관리
          </Link>
        </section>
        <section className="border border-neutral-300 p-5">
          <h2 className="font-semibold">계정과 개인 폴더</h2>
          <p className="mt-3 text-sm leading-7 text-neutral-600">
            학생은 본인 자료와 공개된 피드백을 확인합니다. 10MB를 넘는 파일은 학생의 지정 Drive
            폴더에 업로드한 후 링크로 제출합니다.
          </p>
          <Link
            to="/admin"
            search={{ tab: "students" }}
            className="mt-4 inline-flex min-h-10 items-center border border-neutral-300 px-4 text-xs"
          >
            학생 연결 확인
          </Link>
        </section>
      </div>
      <section className="border-t border-neutral-300 pt-5">
        <h2 className="text-lg font-semibold">최근 변경 기록</h2>
        {error ? (
          <div role="alert" className="py-5 text-sm">
            <p>변경 기록을 불러오지 못했습니다.</p>
            <button onClick={() => setAttempt((x) => x + 1)} className="mt-3 min-h-10 border px-4">
              다시 시도
            </button>
          </div>
        ) : logs === null ? (
          <p role="status" className="py-5 text-sm text-neutral-500">
            기록을 불러오는 중…
          </p>
        ) : !logs.length ? (
          <p className="py-5 text-sm text-neutral-500">아직 변경 기록이 없습니다.</p>
        ) : (
          <ul className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
            {logs.map((log) => (
              <li key={log.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="text-sm">{ACTIONS[log.action] ?? "운영 정보 변경"}</span>
                <time className="text-xs text-neutral-500">{koreanRecordDate(log.created_at)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
