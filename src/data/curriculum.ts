import source from "./curriculum-source.json";

/** Reviewed source remains intact; session dates and stable IDs stay in schedule.ts. */
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
    { label: "총 수업", value: source.overview.duration, detail: "OT · 공통 프로젝트 · 개인 캡스톤 · 개별 피드백" },
    { label: "학습 흐름", value: "기획·구현·검증", detail: "수정 전후와 디자인 판단의 근거를 기록합니다." },
    { label: "목표 산출물", value: "웹사이트와 케이스 스터디", detail: "실제 동작과 본인의 기여 범위를 함께 설명합니다." },
    { label: "핵심 도구", value: "Gemini · Stitch · AI Studio", detail: "AI 구독, API 사용료, 배포 비용을 구분합니다." },
    { label: "교육 대상", value: "디자이너", detail: "디자인 경험을 웹 구현과 검증으로 연결합니다." },
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
  if (lesson.number !== 3) return base;
  // S03-only editorial overlay. Original workbook and existing Notebook/AI Studio
  // resources remain available; no changes to other lessons, submissions or dates.
  const title = "산업 리서치 기반 한·영 브랜드 사이트 제작";
  return {
    ...base,
    title,
    project: title,
    cycle: "사이클 1 · 산업 리서치 · 레퍼런스 분석 · 웹사이트 제작",
    stage: "직접 선택한 산업으로 기획하고, 한국어·영어 전환과 이미지 교체를 구현합니다.",
    goalOutput: "산업 브리프 1쪽과 출처 근거표\n레퍼런스 1개 분석과 이미지 4~6개 사용 조건 기록\n메인 페이지 1개·섹션 5~6개·한국어/영어 전환·로컬 이미지 교체\n데스크톱·모바일 결과와 QA 수정 기록",
    topics: [
      "산업 선택과 조사: 생수·반려동물·여행 등 키워드를 수강생이 직접 입력합니다. Gemini 앱에서 고객 과업과 공식 자료를 조사하고, 확인 사실·브랜드 주장·기획 가설·확인 불가를 구분해 1쪽 브리프를 작성합니다.",
      "레퍼런스와 이미지: 후보를 비교해 최종 사이트 1개를 선택합니다. 실제 스크린샷에서 그리드·폭·정렬·이미지 비율·시각적 위계를 분석하고 산업에 맞는 섹션 순서와 이미지 자리·출처·사용 조건을 정합니다.",
      "한영 사이트 제작: AI Studio Build의 한 프로젝트에서 메인 페이지 1개를 구현합니다. 준비된 한국어·영어 문구를 버튼으로 전환하며, 번역 API나 앱 내부 AI 기능은 넣지 않습니다. Canvas는 대체 제작 경로, Stitch는 선택 시각 검토 도구입니다.",
      "이미지 직접 교체: 학생 사이트에 로컬 파일 선택·미리보기·취소·오류 안내·되돌리기·한영 대체 텍스트 수정을 구현합니다. 기본은 임시 교체이며, IndexedDB 저장은 기본 과제를 마친 뒤 선택 심화로 진행합니다.",
      "모바일과 연결 검수: 한국어→English→사진 교체→한국어를 연속으로 조작하고 390px·360px에서 줄바꿈·크롭·메뉴·가로 넘침을 확인합니다. 재현 가능한 문제 보고로 관련 영역만 수정하고 최종 이미지의 기본 자산 반영 여부를 검토합니다.",
      "범위와 사용량: 학생 실습에서는 Supabase·Firebase·Vercel·외부 DB·실제 결제·예약·Cloud Billing을 사용하지 않습니다. 조사 1회·명세 1회·구현 2회·수정 2~3회는 운영 목표이며 사용량 보장치가 아닙니다. 기능 미제공이나 한도 도달 시 출처 검토·수정 명세·직접 QA로 이어갑니다.",
      "연결 학습자료: 기존 Gemini Notebook 60장 뷰어·MORU LIVING 리서치 실습·프롬프트와 Google AI Studio 인터랙티브 튜토리얼은 아래 기존 학습자료에서 계속 이용합니다.",
    ],
    terms: [
      { name: "Design Brief", description: "목표·사용자 과업·콘텐츠·디자인 원칙·제외 범위·검수 조건을 고정하는 제작 기준 문서입니다." },
      { name: "Reference Analysis", description: "원본의 그리드·위계·비율·여백을 관찰하고 재현할 구조와 바꿀 브랜드 콘텐츠를 구분하는 과정입니다." },
      { name: "Localization", description: "이번 실습에서는 준비된 한국어·영어 문구와 설명을 전환합니다. 언어 변경만으로 통화·제품 사양을 바꾸지 않습니다." },
      { name: "Image Slot", description: "hero·product-01처럼 이미지 자리에 부여하는 고정 식별자입니다. 언어를 바꾸어도 같은 자리를 유지합니다." },
      { name: "Local State", description: "현재 브라우저 화면의 상태입니다. 임시 이미지 교체, 브라우저 저장, 다른 사용자와의 공유 저장을 구분합니다." },
      { name: "Quality Assurance", description: "조건·재현 순서·기대/실제 결과를 기록하고 내용·디자인·동작·범위를 직접 검수하는 과정입니다." },
    ],
    tools: ["Gemini 앱 · Deep Research 또는 검색", "Google AI Studio Build", "Stitch (선택)", "Gemini Canvas (대체 경로)", "브라우저 미리보기·개발자 도구"],
    homework: "산업 브리프 1쪽, 레퍼런스 분석·이미지 출처와 사용 조건, 접근 가능한 사이트 미리보기 또는 프로젝트 파일, 한국어·영어 및 PC·모바일 캡처, QA 수정 기록을 과제&피드백 3회차에 제출합니다. 외부 배포는 필수가 아닙니다. 임시 교체·로컬 저장·기본 자산 중 실제 구현 범위와 미완성 기능을 명시합니다.",
  };
});
