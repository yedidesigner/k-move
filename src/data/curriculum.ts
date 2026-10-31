import source from "./curriculum-source.json";

/**
 * Reviewed curriculum from the connected workbook's second worksheet.
 * Keep its 24 lessons keyed by session number. Calendar dates and stable IDs
 * remain in schedule.ts; editorial readiness is not a class-completion status.
 */
export interface CurriculumLesson {
  number: number;
  sourceWeek: string;
  cycle: string;
  project: string;
  stage: string | null;
  title: string;
  goalOutput: string;
  topics: string[];
  terms: { name: string; description: string }[];
  tools?: string[];
  homework?: string;
}

export const CURRICULUM_OVERVIEW = {
  ...source.overview,
  summary: [
    {
      label: "총 수업",
      value: source.overview.duration,
      detail: "OT · 공통 프로젝트 · 개인 캡스톤 · 개별 피드백",
    },
    {
      label: "학습 흐름",
      value: "기획·구현·검증",
      detail: "수정 전후와 디자인 판단의 근거를 기록합니다.",
    },
    {
      label: "목표 산출물",
      value: "웹사이트와 케이스 스터디",
      detail: "실제 동작과 본인의 기여 범위를 함께 설명합니다.",
    },
    {
      label: "핵심 도구",
      value: "Gemini · Stitch · AI Studio",
      detail: "AI 구독, API 사용료, 배포 비용을 구분합니다.",
    },
    {
      label: "교육 대상",
      value: "디자이너",
      detail: "디자인 경험을 웹 구현과 검증으로 연결합니다.",
    },
  ],
};

export const CURRICULUM_LESSONS: CurriculumLesson[] = source.lessons.map((lesson) => ({
  number: lesson.number,
  sourceWeek: `${lesson.number}회차`,
  cycle: lesson.cycle,
  project: lesson.title,
  stage: null,
  title: lesson.title,
  goalOutput: lesson.output,
  topics: [...lesson.topics],
  terms: lesson.terms.map((term) => ({ ...term })),
  tools: [...lesson.tools],
  homework: lesson.homework,
}));
