import rawSchema from "@/data/survey-schema.json";

export interface Choice {
  id: string;
  title: string;
  description?: string;
}
export interface Question {
  id: string;
  number: number;
  step: number;
  type: string;
  required: boolean;
  title: string;
  help?: string;
  maxLength?: number;
  max?: number;
  options?: Choice[];
  rows?: Choice[];
  services?: Choice[];
  exclusive?: string;
  other?: boolean;
  otherOptionIds?: string[];
  otherText?: boolean;
  otherMaxLength?: number;
  layout?: string;
}
export const survey = rawSchema as {
  id: string;
  version: number;
  title: string;
  questions: Question[];
  levels: { id: string; short: string; description: string }[];
};
export type Answers = Record<string, string | string[] | Record<string, string>>;
export interface SurveyResponse {
  user_id: string;
  survey_id: string;
  schema_version: number;
  answers: Answers;
  submitted_at: string;
  updated_at: string;
}
export interface Profile {
  id: string;
  username: string;
  role: "student" | "instructor";
  created_at: string;
}
export const steps = ["나의 AI 경험", "도구와 포트폴리오", "관심 분야와 목표"];

export function hasOther(q: Question, value: unknown) {
  return Array.isArray(value) && (q.otherOptionIds ?? ["other"]).some((id) => value.includes(id));
}

export function toggleChoice(q: Question, current: string[], id: string) {
  if (current.includes(id)) return current.filter((value) => value !== id);
  if (q.exclusive === id) return [id];
  const next = current.filter((value) => value !== q.exclusive);
  return q.max && next.length >= q.max ? current : [...next, id];
}

export function validateQuestion(q: Question, a: Answers): string | null {
  const v = a[q.id];
  if (q.type === "text" || q.type === "textarea") {
    if (q.required && (typeof v !== "string" || !v.trim())) return "내용을 입력해 주세요.";
    if (v !== undefined && typeof v !== "string") return "텍스트로 입력해 주세요.";
    if (typeof v === "string" && v.length > (q.maxLength ?? 1000))
      return `최대 ${q.maxLength}자까지 입력해 주세요.`;
  } else if (q.type === "single") {
    if (!q.options?.some((o) => o.id === v)) return "한 가지를 선택해 주세요.";
  } else if (q.type === "multi") {
    if (!Array.isArray(v) || !v.length) return "한 가지 이상 선택해 주세요.";
    if (v.some((id) => !q.options?.some((o) => o.id === id)) || new Set(v).size !== v.length)
      return "선택 항목을 확인해 주세요.";
    if (q.max && v.length > q.max) return `최대 ${q.max}개까지 선택해 주세요.`;
    if (q.exclusive && v.includes(q.exclusive) && v.length > 1)
      return "사용 경험 없음 또는 미정은 단독으로 선택해 주세요.";
    if (
      q.other &&
      hasOther(q, v) &&
      (typeof a[q.id + "Other"] !== "string" || !(a[q.id + "Other"] as string).trim())
    )
      return "기타 내용을 입력해 주세요.";
    if (typeof a[q.id + "Other"] === "string" && (a[q.id + "Other"] as string).length > 150)
      return "기타 내용은 150자 이내로 입력해 주세요.";
  } else if (q.type === "matrix") {
    if (
      !v ||
      typeof v !== "object" ||
      Array.isArray(v) ||
      q.rows?.some((row) => !survey.levels.some((l) => l.id === v[row.id]))
    )
      return "모든 프로그램의 활용 수준을 선택해 주세요.";
    if (
      typeof a[q.id + "Other"] === "string" &&
      (a[q.id + "Other"] as string).length > (q.otherMaxLength ?? 300)
    )
      return "기타 내용은 300자 이내로 입력해 주세요.";
  }
  return null;
}

export function cleanAnswers(input: Answers): Answers {
  const out: Answers = {};
  for (const q of survey.questions) {
    const value = input[q.id];
    if (value !== undefined) out[q.id] = typeof value === "string" ? value.trim() : value;
    const other = input[q.id + "Other"];
    if ((q.otherText || (q.other && hasOther(q, value))) && typeof other === "string")
      out[q.id + "Other"] = other.trim();
  }
  return out;
}

export function answerLabel(q: Question, a: Answers): string {
  const v = a[q.id];
  let result = "미응답";
  if (typeof v === "string") result = (q.options?.find((o) => o.id === v)?.title ?? v) || "미응답";
  if (Array.isArray(v))
    result = v.map((id) => q.options?.find((o) => o.id === id)?.title ?? id).join(" / ");
  if (q.type === "matrix" && v && typeof v === "object" && !Array.isArray(v))
    result = (q.rows ?? [])
      .map(
        (row) =>
          `${row.title}: ${survey.levels.find((l) => l.id === v[row.id])?.short ?? "미응답"}`,
      )
      .join("\n");
  const other = a[q.id + "Other"];
  if (typeof other === "string" && other) result += `\n기타: ${other}`;
  return result;
}

export function formatSubmitted(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

export function csvCell(value: string) {
  const first =
    Array.from(value).find((char) => char.charCodeAt(0) > 31 && !/\s/u.test(char)) ?? "";
  const safe = ["=", "+", "@", "-"].includes(first) ? "'" + value : value;
  return '"' + safe.replaceAll('"', '""') + '"';
}

export function responsesCsv(rows: SurveyResponse[], profiles: Profile[]) {
  const headers = [
    "수강생 아이디",
    "최초 제출 시각 (한국)",
    "최종 수정 시각 (한국)",
    ...survey.questions.map((q) => q.title),
  ];
  const records = rows.map((r) => [
    profiles.find((p) => p.id === r.user_id)?.username ?? r.user_id,
    formatSubmitted(r.submitted_at),
    formatSubmitted(r.updated_at),
    ...survey.questions.map((q) => answerLabel(q, r.answers)),
  ]);
  return "\uFEFF" + [headers, ...records].map((row) => row.map(csvCell).join(",")).join("\r\n");
}
