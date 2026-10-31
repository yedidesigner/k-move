export const PORTFOLIO_STAGES = [
  { value: "planning", label: "기획" },
  { value: "structure", label: "구조" },
  { value: "visual", label: "시각화" },
  { value: "prototype", label: "프로토타입" },
  { value: "case-study", label: "케이스 스터디" },
  { value: "ready", label: "제출 준비" },
] as const;

export type PortfolioStage = (typeof PORTFOLIO_STAGES)[number]["value"];

export function portfolioStageLabel(stage: string) {
  return PORTFOLIO_STAGES.find((entry) => entry.value === stage)?.label ?? stage;
}

/** Never render a stored URL as a link unless it is a credential-free HTTP(S) URL. */
export function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function koreanRecordDate(value: string | null | undefined): string {
  if (!value) return "기록 없음";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "기록 없음";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function matchesStudentSearch(student: { name: string }, query: string) {
  return student.name
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .includes(query.trim().normalize("NFKC").toLocaleLowerCase("ko-KR"));
}

export function normalizedProjectValues(value: {
  title: string;
  target_role: string;
  stage: string;
  next_goal: string;
}) {
  const title = value.title.trim();
  if (!title) throw new Error("프로젝트명을 입력해 주세요.");
  if (title.length > 200) throw new Error("프로젝트명은 200자 이내로 입력해 주세요.");
  if (!PORTFOLIO_STAGES.some((stage) => stage.value === value.stage)) {
    throw new Error("진행 단계를 선택해 주세요.");
  }
  return {
    title,
    target_role: value.target_role.trim(),
    stage: value.stage,
    next_goal: value.next_goal.trim(),
  };
}

export function normalizedVersionValues(value: { label: string; url: string; notes: string }) {
  const label = value.label.trim();
  if (!label) throw new Error("버전 이름을 입력해 주세요.");
  if (label.length > 200) throw new Error("버전 이름은 200자 이내로 입력해 주세요.");
  const url = safeExternalUrl(value.url);
  if (!url) throw new Error("로그인 정보가 포함되지 않은 http 또는 https 링크를 입력해 주세요.");
  return { label, url, notes: value.notes.trim() };
}
