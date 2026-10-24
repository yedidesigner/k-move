import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CLASS_END, CLASS_START, SESSIONS, TIME_ZONE, formatDateKo } from "@/data/schedule";
import type { Session } from "@/data/schedule";
import { calendarWeeks, SESSION_MONTHS } from "@/lib/session-calendar";
import type { CalendarDay } from "@/lib/session-calendar";
import { cn } from "@/lib/utils";

const WEEKDAYS = [
  { en: "Sun", ko: "일" },
  { en: "Mon", ko: "월" },
  { en: "Tue", ko: "화" },
  { en: "Wed", ko: "수" },
  { en: "Thu", ko: "목" },
  { en: "Fri", ko: "금" },
  { en: "Sat", ko: "토" },
];
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: TIME_ZONE });
const sessionsByDate = new Map(SESSIONS.map((session) => [session.date, session]));
const cellClass = "flex min-h-[clamp(7.5rem,16vw,13rem)] flex-col p-1 sm:p-2";

function DayCell({
  day,
  session,
  today,
}: {
  day: CalendarDay;
  session: Session | undefined;
  today: string;
}) {
  const isToday = day.date === today;
  const status = isToday ? "오늘" : day.date < today ? "수업 완료" : "준비중";
  const content = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-x-1 gap-y-0.5">
        <time
          dateTime={day.date}
          aria-current={isToday ? "date" : undefined}
          className={cn(
            "block text-[clamp(1.25rem,5vw,4.5rem)] font-extralight leading-none tracking-[-0.075em] tabular-nums",
            session || isToday ? "text-foreground" : "text-neutral-300",
          )}
        >
          {String(day.number).padStart(2, "0")}
        </time>
        {isToday && <span className="pt-0.5 text-[8px] font-medium sm:text-[10px]">오늘</span>}
      </div>
      {session && (
        <div className="mt-2 border-t border-border pt-1.5">
          <p className="break-keep text-[9px] font-medium leading-snug sm:text-xs">
            {session.title}
          </p>
          <p className="mt-1 flex flex-wrap gap-x-1 text-[8px] leading-snug tabular-nums text-muted-foreground sm:text-[10px]">
            <span>{CLASS_START}</span>
            <span>– {CLASS_END}</span>
          </p>
          <div className="mt-2 flex items-center justify-between gap-1 bg-black px-1 py-0.5 text-[9px] text-white sm:text-[10px]">
            <span className="font-medium tabular-nums">
              {String(session.number).padStart(2, "0")}
            </span>
            <span className="hidden lg:inline">{status}</span>
          </div>
        </div>
      )}
    </>
  );

  return session ? (
    <Link
      to="/sessions/$id"
      params={{ id: session.id }}
      aria-label={`${formatDateKo(day.date)}, ${String(session.number).padStart(2, "0")} ${session.title}, ${CLASS_START}~${CLASS_END}, ${status}`}
      className={cn(
        cellClass,
        "h-full transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
      )}
    >
      {content}
    </Link>
  ) : (
    <div className={cellClass}>{content}</div>
  );
}

export function SessionCalendar({
  month,
  today,
  onMonthChange,
}: {
  month: string;
  today: string;
  onMonthChange: (month: string) => void;
}) {
  const monthIndex = SESSION_MONTHS.indexOf(month);
  const [year, monthNumber] = month.split("-");
  const monthLabel = `${year}년 ${Number(monthNumber)}월`;
  const monthName = monthFormatter.format(new Date(`${month}-01T12:00:00+09:00`));
  const monthlySessions = SESSIONS.filter((session) => session.date.startsWith(month));
  const todayMonth = today.slice(0, 7);
  const navigateMonth = (offset: number) => {
    const next = SESSION_MONTHS[monthIndex + offset];
    if (next) onMonthChange(next);
  };

  return (
    <section aria-label="월간 수업 캘린더">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-t border-foreground pt-5">
        <div>
          <h2
            aria-live="polite"
            className="font-serif text-4xl font-normal leading-none tracking-tight sm:text-5xl"
          >
            {monthName}
            <span className="ml-3 font-sans text-sm font-normal tracking-normal text-muted-foreground">
              {year}
            </span>
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            이달의 수업 {monthlySessions.length}회
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {SESSION_MONTHS.includes(todayMonth) && (
            <button
              type="button"
              onClick={() => onMonthChange(todayMonth)}
              className="min-h-11 px-3 text-xs hover:bg-muted"
            >
              오늘
            </button>
          )}
          <select
            aria-label="표시할 월"
            value={month}
            onChange={(event) => onMonthChange(event.target.value)}
            className="min-h-11 border border-border bg-card px-2 text-xs text-foreground"
          >
            {SESSION_MONTHS.map((value) => {
              const [optionYear, optionMonth] = value.split("-");
              return (
                <option key={value} value={value}>
                  {optionYear}년 {Number(optionMonth)}월
                </option>
              );
            })}
          </select>
          <button
            type="button"
            aria-label="이전 달"
            onClick={() => navigateMonth(-1)}
            disabled={monthIndex <= 0}
            className="inline-flex size-11 items-center justify-center hover:bg-muted disabled:cursor-default disabled:opacity-25 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="다음 달"
            onClick={() => navigateMonth(1)}
            disabled={monthIndex >= SESSION_MONTHS.length - 1}
            className="inline-flex size-11 items-center justify-center hover:bg-muted disabled:cursor-default disabled:opacity-25 disabled:hover:bg-transparent"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <table className="w-full table-fixed border-collapse">
        <caption className="sr-only">{monthLabel} 수업 일정, 한국 시간</caption>
        <thead>
          <tr>
            {WEEKDAYS.map(({ en, ko }) => (
              <th
                key={en}
                scope="col"
                className="border-b border-foreground px-1 pb-2 text-left text-[10px] font-normal text-muted-foreground sm:px-2 sm:text-xs"
              >
                <span className="hidden sm:inline">{en} </span>
                {ko}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendarWeeks(month).map((week, index) => (
            <tr key={index}>
              {week.map((day, weekday) => (
                <td
                  key={day?.date ?? `empty-${weekday}`}
                  className="border border-border bg-card p-0 align-top"
                >
                  {day ? (
                    <DayCell day={day} session={sessionsByDate.get(day.date)} today={today} />
                  ) : (
                    <div aria-hidden="true" className={cellClass} />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted-foreground">
        수업일을 선택하면 상세 내용을 확인할 수 있습니다.
      </p>
    </section>
  );
}
