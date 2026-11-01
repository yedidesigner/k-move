import { useEffect, useRef, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { formatDateKo } from "@/data/schedule";
import "./feedback-document.css";

type Props = {
  children: ReactNode;
  week: number;
  currentWeek: number;
  sessions: readonly { id: string; number: number; date: string }[];
  onWeekChange: (week: number) => void;
  name: string;
  description: string;
  students?: readonly { user_id: string; name: string }[];
  selectedStudent?: string;
  onStudentChange?: (id: string) => void;
  loading?: boolean;
};

/** Presentation only. Ownership, drafts, and publication stay in the workspace. */
export function FeedbackDocument({
  children,
  week,
  currentWeek,
  sessions,
  onWeekChange,
  name,
  description,
  students,
  selectedStudent,
  onStudentChange,
  loading,
}: Props) {
  const navigation = useRef<HTMLDivElement>(null);
  const activeTab = useRef<HTMLButtonElement>(null);
  const session = sessions.find((item) => item.number === week);
  useEffect(() => {
    const nav = navigation.current;
    const active = activeTab.current;
    if (nav && active && window.matchMedia("(max-width: 639px)").matches)
      nav.scrollLeft = active.offsetLeft - nav.clientWidth / 2 + active.offsetWidth / 2;
  }, [week]);

  return (
    <div className="feedback-document">
      <h1 className="feedback-document-title">과제&amp;피드백</h1>
      <section className="feedback-paper-stack" aria-label="주차별 피드백 문서">
        <div className="feedback-paper-layer feedback-paper-layer-back" aria-hidden="true" />
        <div className="feedback-paper-layer feedback-paper-layer-front" aria-hidden="true" />
        <div className="feedback-paper">
          <div
            ref={navigation}
            role="group"
            aria-label="피드백 주차 선택"
            className="feedback-week-tabs"
          >
            {sessions.map(({ id, number, date }) => (
              <button
                ref={number === week ? activeTab : undefined}
                key={id}
                type="button"
                aria-label={`${number}주차 피드백 보기`}
                aria-pressed={number === week}
                title={formatDateKo(date)}
                onClick={() => onWeekChange(number)}
              >
                {String(number).padStart(2, "0")}
              </button>
            ))}
          </div>
          <div className="feedback-paper-content">
            <header className="feedback-document-header">
              <div className="feedback-week-heading">
                <div>
                  <h2>WEEK {String(week).padStart(2, "0")}</h2>
                  {session && <span>{formatDateKo(session.date)}</span>}
                </div>
                <button
                  type="button"
                  aria-label={`현재 주차 ${currentWeek}주차로 이동`}
                  onClick={() => onWeekChange(currentWeek)}
                >
                  현재 주차 · {String(currentWeek).padStart(2, "0")}
                </button>
              </div>
              <div className="feedback-student-heading">
                <h3>{name}</h3>
                {students && onStudentChange && (
                  <label className="feedback-student-picker">
                    <span className="sr-only">수강생 변경</span>
                    <span className="feedback-student-picker-icon" aria-hidden="true">
                      <ChevronDown size={10} />
                    </span>
                    <select
                      aria-label="수강생 변경"
                      value={selectedStudent ?? "all"}
                      disabled={loading || !students.length}
                      onChange={(event) => onStudentChange(event.target.value)}
                    >
                      <option value="all">전체 수강생</option>
                      {students.map((student) => (
                        <option key={student.user_id} value={student.user_id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              <p>{description}</p>
            </header>
            <div className="instructor-workspace feedback-workspace">{children}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
