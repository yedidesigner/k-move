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

export const CURRICULUM_LESSONS: CurriculumLesson[] = source.lessons.map((lesson) => {
  const base: CurriculumLesson = {
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
  };

  // Add the approved Notebook module only to S03. Preserve the source workbook,
  // original AI Studio topics/homework, every other session and calendar date.
  if (lesson.number !== 3) return base;
  const title = "Gemini Notebook 리서치 + AI Studio 웹사이트 제작";
  return {
    ...base,
    title,
    project: title,
    cycle: "사이클 1 · 디자인 리서치 · 웹사이트 제작 실습",
    goalOutput: `${base.goalOutput}\nNotebook 추가 실습: 소스 목록·출처 근거표·디자인 브리프\nMORU LIVING 리디자인 제안 8장 또는 동등한 스토리보드·QA 수정 기록`,
    topics: [
      "Notebook 기초와 화면 이해: 제공된 홈 화면의 내비게이션·검색·노트북 카드와 작업 화면의 출처·채팅·스튜디오 구조를 학습합니다.",
      "출처 기반 리서치: 소스 추가·선택·검색·버전 관리를 수행하고 인용 원문을 확인합니다. 관찰된 사실, 해석, 인사이트, 설계 가설을 구분합니다.",
      "Studio 9개 기능: AI 오디오 오버뷰, 슬라이드 자료, 동영상 개요, 마인드맵, 보고서, 플래시카드, 퀴즈, 인포그래픽, 데이터 표를 디자인 업무와 연결합니다. 계정별 미제공 기능은 템플릿으로 대체합니다.",
      "MORU LIVING 실습: 교육용 가상 브랜드의 기본 소스 6개를 분석해 요구사항·사용자 문제·경쟁사·설문을 정리하고 디자인 브리프와 정보구조 후보를 만듭니다.",
      "프레젠테이션과 검수: 8장 스토리보드를 먼저 설계하고 결과물의 근거·수치·표본·시각적 위계·가독성을 검토합니다. 실습 프롬프트 18개와 학생용 교재를 함께 사용합니다.",
      ...base.topics,
    ],
    terms: [
      ...base.terms,
      { name: "Source-grounded Research", description: "선택한 자료의 실제 근거와 인용 위치를 확인하며 수행하는 조사·분석입니다. 출처가 표시되어도 주장과 원문이 일치하는지 검증합니다." },
      { name: "Evidence Ledger", description: "주장, 소스 ID, 원문 위치, 사실·해석·가설 구분과 확인 상태를 기록하는 출처 근거표입니다." },
      { name: "Design Hypothesis", description: "관찰과 해석에서 제안한 설계 방향입니다. 효과가 입증된 성과와 구분하고 검증할 사용자 과업을 함께 정합니다." },
    ],
    tools: [...(base.tools ?? []), "Gemini Notebook (NotebookLM)"],
  };
});
