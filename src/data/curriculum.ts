/**
 * Source: 구글 시트 "K-MOVE DESIGN 커리큘럼" 시트2 (2026-11-01 개정) +
 * 구글 드라이브 "K-MOVE_커리큘럼_2-9주차_제안.md".
 *
 * 구조
 * - 1회차: OT 및 개별 상담
 * - 2~9회차: Google AI Pro 요금제 + 무료 구글 도구(Stitch, AI Studio)만으로 바이브코딩.
 *   2주 = 1사이클. 앞 주는 생각하는 주(기획·논리), 뒷 주는 만드는 주(제작·배포).
 * - 10~19회차: 수업 주제 준비 중 (이 파일에 항목 없음 → schedule.ts가 "준비 중"으로 표시)
 * - 20~24회차: 개별 피드백 (공통 주제 없음)
 *
 * Calendar dates live in schedule.ts; lessons attach by session number.
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
  /** 이번 회차에 쓰는 도구 */
  tools?: string[];
  /** 다음 회차까지 제출할 과제 */
  homework?: string;
}

export const CURRICULUM_OVERVIEW = {
  title: "K-MOVE DESIGN · Gemini 바이브코딩 커리큘럼",
  subtitle: "Google AI Pro 요금제 하나로 기획부터 배포까지, 디자이너를 위한 바이브코딩 과정",
  summary: [
    { label: "총 교육 기간", value: "24주", detail: "1회차 OT · 2~9회차 공통 · 20~24회차 개별" },
    { label: "프로젝트 사이클", value: "2주 = 1사이클", detail: "생각하는 주 + 만드는 주" },
    { label: "목표 산출물", value: "3개 사이트 + 케이스 스터디", detail: "전부 실제 URL로 배포" },
    { label: "핵심 도구", value: "Gemini · Stitch · AI Studio", detail: "AI Pro 1개 요금제 + 무료 도구" },
    { label: "교육 대상", value: "디자인 베이스 수강생", detail: "개발 용어는 디자인 비유로 해설" },
  ],
  phases: [
    { range: "1회차", label: "OT 및 개별 상담" },
    { range: "2~9회차", label: "Gemini 바이브코딩 공통 과정" },
    { range: "10~19회차", label: "수업 주제 준비 중" },
    { range: "20~24회차", label: "개별 피드백" },
  ],
};

const FEEDBACK_LESSON = (number: number): CurriculumLesson => ({
  number,
  sourceWeek: `${number}주차`,
  cycle: "개별 피드백",
  project: "개별 피드백 & 포트폴리오 마무리",
  stage: null,
  title: "개별 피드백 & 포트폴리오 마무리",
  goalOutput: "공통 주제 없음\n수강생별 진도에 맞춘 1:1 피드백",
  topics: [
    "개인별 프로젝트 진행 상황 점검 및 다음 단계 설정",
    "포트폴리오·서비스 산출물 개별 리뷰 (UI 완성도, 반응형, 케이스 스터디 서술)",
    "취업 자료(영문 케이스 스터디, 링크 정리) 개별 보완",
  ],
  terms: [],
});

export const CURRICULUM_LESSONS: CurriculumLesson[] = [
  {
    number: 1,
    sourceWeek: "1주차",
    cycle: "오리엔테이션",
    project: "OT 및 개별 상담",
    stage: null,
    title: "OT 및 개별 상담",
    goalOutput: "과정 안내 · 도구 준비 · 개인별 목표 설정",
    topics: [
      "24주 과정 구조와 운영 방식 안내",
      "Google AI Pro 요금제 가입 및 사용 도구 확인 (Gemini, Stitch, AI Studio, GitHub, Vercel)",
      "수강생별 현재 역량·목표·관심 분야 개별 상담",
    ],
    terms: [],
  },
  {
    number: 2,
    sourceWeek: "2주차",
    cycle: "사이클 1 · 개인 포트폴리오 (생각하는 주)",
    project: "개인 포트폴리오 사이트",
    stage: "1단계: 기획서 + 첫 생성",
    title: "개인 포트폴리오 사이트 · 1단계: 기획서 + 첫 생성",
    goalOutput:
      "포트폴리오 1페이지 기획서 (목적 / 보는 사람 / 섹션 목록 / 섹션별 메시지)\nGemini Canvas로 생성한 첫 포트폴리오 페이지 (미리보기 공유 링크)",
    topics: [
      "바이브코딩 개념: 코드를 쓰는 게 아니라 요구사항을 정확히 말하는 일. 디자이너가 유리한 이유",
      "구글 AI 도구 지도: Gemini 앱/Canvas, Nano Banana, NotebookLM, Stitch, AI Studio — 각각 언제 쓰는지",
      "사고 훈련 ①: 기획서 없이 프롬프트 쓰기 vs 기획서 쓰고 프롬프트 쓰기 — 같은 요청을 두 번 실행해 결과 비교",
      "프롬프트 = 디자인 브리프 구조: 목적 → 대상 → 콘텐츠 → 구조 → 스타일 → 제약",
      "Canvas 기본 조작: 생성 → 미리보기 → 수정 요청 → 버전 비교 → 공유 링크",
    ],
    terms: [
      {
        name: "HTML",
        description:
          "페이지의 뼈대. 와이어프레임에서 '여기 제목, 여기 이미지'라고 적어둔 것을 글로 쓴 버전",
      },
      {
        name: "CSS",
        description: "뼈대에 입히는 옷. 색·서체·여백·정렬 = 스타일 가이드를 코드로 쓴 것",
      },
      {
        name: "프롬프트 (Prompt)",
        description: "AI에게 주는 디자인 브리프. 브리프가 모호하면 결과도 모호함",
      },
    ],
    tools: ["Gemini 앱 (Canvas)"],
    homework: "기획서 수정본 + 프롬프트 3회 반복 기록 (무엇을 바꿔 말했더니 무엇이 달라졌는지)",
  },
  {
    number: 3,
    sourceWeek: "3주차",
    cycle: "사이클 1 · 개인 포트폴리오 (만드는 주)",
    project: "개인 포트폴리오 사이트",
    stage: "2단계: 내 링크 만들기 (배포)",
    title: "개인 포트폴리오 사이트 · 2단계: 내 링크 만들기 (배포)",
    goalOutput: "실제 URL로 접속되는 포트폴리오 사이트 v1 (모바일 확인 완료)",
    topics: [
      "페이지 구조 읽기: Hero / About / Work / Contact — 코드 안에서 지금 어느 섹션을 보고 있는지 찾는 법 (태그 이름만 보면 됨)",
      "수정 요청의 기술: '예쁘게'가 아니라 '제목 크기 1.5배, 섹션 간격 80px, 버튼 모서리 8px' — 디자이너의 수치 감각이 그대로 프롬프트가 됨",
      "이미지 넣기: 이미지 파일과 경로(주소) 개념, Nano Banana로 임시 작품 썸네일·배경 생성",
      "배포 실습: GitHub 웹 업로드(드래그 앤 드롭) → Vercel 연결 → URL 발급 → 모바일에서 열어보기",
      "디버깅 루틴 ①: 화면이 깨지면 스크린샷을 찍어 Gemini에 보여주고 '이 부분이 이렇게 나온다'라고 말하기",
    ],
    terms: [
      {
        name: "배포 (Deployment)",
        description:
          "내 컴퓨터 안의 파일을 인터넷에 올려 남이 볼 수 있게 하는 것. 인쇄소에 파일 넘기는 것과 같음",
      },
      {
        name: "호스팅 (Hosting)",
        description: "그 파일을 24시간 올려두는 서버 공간. Vercel이 무료로 빌려줌",
      },
      {
        name: "GitHub 저장소 (Repository)",
        description: "프로젝트 파일을 담는 온라인 폴더. 이번 과정에선 '업로드 폴더'로만 사용",
      },
      {
        name: "경로 (Path)",
        description:
          "이미지 파일이 어디에 있는지 적는 주소. 경로가 틀리면 이미지가 안 뜸 — 가장 흔한 오류",
      },
    ],
    tools: ["Gemini 앱 (Canvas)", "Nano Banana", "GitHub", "Vercel"],
    homework: "포트폴리오 URL 제출 + 모바일 스크린샷 + 깨진 부분 1개 이상 직접 고친 기록",
  },
  {
    number: 4,
    sourceWeek: "4주차",
    cycle: "사이클 2 · 브랜드 랜딩페이지 (생각하는 주)",
    project: "브랜드 랜딩페이지",
    stage: "1단계: 기획력 — 무엇을 왜 만드는가",
    title: "브랜드 랜딩페이지 · 1단계: 기획력 — 무엇을 왜 만드는가",
    goalOutput:
      "가상 브랜드 정의서 1장 (문제 / 타겟 / 한 줄 가치 / 톤)\n랜딩페이지 IA + 섹션별 '목적–메시지–행동(CTA)' 표\nStitch 와이어프레임 3안 + 1안 선정 근거",
    topics: [
      "사고 훈련 ②: 레퍼런스 리서치 — NotebookLM/Deep Research로 같은 카테고리 랜딩 5개 분석 → 공통 구조 추출",
      "기획 프레임: 문제 정의 → 타겟 → 가치 제안 → 사용자가 페이지에서 해야 할 단 하나의 행동",
      "정보 구조(IA): 섹션 순서가 설득 순서. '왜 이 섹션이 이 위치인가'를 말로 설명하기",
      "Stitch 실습: 텍스트 프롬프트로 3안 생성 → 비교 → Figma에 붙여넣어 정리",
      "논리 훈련: 3안 중 1안 선정 시 '느낌'이 아니라 '타겟·목적 기준 3가지'로 근거 작성",
    ],
    terms: [
      {
        name: "IA (정보 구조)",
        description: "메뉴·섹션의 순서와 위계. 디자이너에게 익숙한 개념, 이름만 새로움",
      },
      {
        name: "유저 플로우 (User Flow)",
        description: "사용자가 들어와서 나갈 때까지의 경로. 화살표 하나하나가 '다음 화면'",
      },
      {
        name: "CTA (Call To Action)",
        description: "페이지가 원하는 단 하나의 행동 버튼. 섹션마다 CTA가 다르면 기획이 흐려진 것",
      },
      {
        name: "와이어프레임 / 로우파이·하이파이",
        description: "선만 있는 설계도 vs 색·서체까지 입힌 시안",
      },
    ],
    tools: ["NotebookLM / Deep Research", "Stitch", "Figma"],
    homework: "브랜드 정의서 + IA 표 + 선정안과 근거 제출",
  },
  {
    number: 5,
    sourceWeek: "5주차",
    cycle: "사이클 2 · 브랜드 랜딩페이지 (만드는 주)",
    project: "브랜드 랜딩페이지",
    stage: "2단계: 시안을 그대로 코드로 (반응형 배포)",
    title: "브랜드 랜딩페이지 · 2단계: 시안을 그대로 코드로 (반응형 배포)",
    goalOutput: "반응형 랜딩페이지 배포 (PC·모바일 정상, 호버·스크롤 인터랙션 포함)",
    topics: [
      "디자인 시스템 토큰 정의: 색 5개, 서체 2개, 간격 단위(8px 배수), 모서리 반경 — 이 표를 프롬프트 맨 위에 붙이면 결과가 일관됨",
      "Image-to-Code: Stitch/Figma 시안 이미지를 Gemini Canvas에 업로드 → '이 시안대로' 생성 → 토큰 표로 보정",
      "반응형: 브레이크포인트 3개(모바일/태블릿/PC)에서 무엇이 바뀌어야 하는지 먼저 디자이너가 결정하고 AI에게 지시",
      "인터랙션: 호버, 부드러운 스크롤 이동, 등장 애니메이션 — '어떤 느낌'이 아니라 '0.3초, 아래에서 20px 올라오며 나타남'으로 지시",
      "디버깅 루틴 ②: 깨진 화면 스크린샷 + '어느 기기, 어느 브라우저, 어느 섹션'을 함께 전달",
    ],
    terms: [
      {
        name: "반응형 / 브레이크포인트",
        description: "화면 폭에 따라 레이아웃이 바뀌는 지점. 아트보드를 3개 만드는 것과 같음",
      },
      {
        name: "CSS 변수 (토큰)",
        description: "색·간격에 이름을 붙여 한 곳에서 관리. 피그마의 Variables와 같은 개념",
      },
      {
        name: "호버 (Hover)",
        description: "마우스를 올렸을 때의 상태. 피그마 프로토타입의 'While hovering'",
      },
      {
        name: "디버깅 (Debugging)",
        description: "깨진 곳을 찾아 고치는 과정. '증상을 정확히 설명하는 것'이 디버깅의 80%",
      },
    ],
    tools: ["Stitch", "Gemini 앱 (Canvas)", "Vercel"],
    homework: "랜딩페이지 URL + 토큰 표 + 반응형 3개 화면 스크린샷",
  },
  {
    number: 6,
    sourceWeek: "6주차",
    cycle: "사이클 3 · 신청 서비스 (생각하는 주)",
    project: "신청 서비스 (이벤트 신청 폼)",
    stage: "1단계: 논리력 — 서비스는 입력과 상태로 이루어진다",
    title: "신청 서비스 · 1단계: 논리력 — 서비스는 입력과 상태로 이루어진다",
    goalOutput:
      "기능 정의서 (이 서비스가 하는 일 5개 이하)\n화면 목록 + 화면별 상태 설계 (비어있음 / 입력 중 / 성공 / 실패)\nStitch로 만든 신청 플로우 화면 시안",
    topics: [
      "'사이트'와 '서비스'의 차이: 보여주기만 하는가, 사용자의 입력을 받아 무언가 바뀌는가",
      "사고 훈련 ③: 기능 분해 — '이벤트 신청'을 입력 항목 / 저장 / 확인 / 관리로 쪼개기. 쪼갤수록 AI 지시가 정확해짐",
      "상태(State) 사고: 디자이너가 가장 자주 놓치는 것 — 빈 화면, 로딩, 오류, 완료 화면을 먼저 디자인",
      "폼 UX 기본: 입력 항목 최소화, 필수/선택 구분, 오류 메시지 문구, 완료 후 다음 행동",
      "데이터 흐름을 그림으로: 사용자 입력 → 어디에 저장 → 누가 어디서 보는가 (화살표 3개면 충분)",
    ],
    terms: [
      {
        name: "폼 (Form) / 입력 필드",
        description: "사용자가 값을 넣는 영역. 텍스트·이메일·선택 등 종류가 있음",
      },
      {
        name: "유효성 검사 (Validation)",
        description: "입력이 올바른지 확인. '이메일에 @가 없음' 같은 오류 메시지가 그 결과",
      },
      {
        name: "상태 (State)",
        description: "같은 화면이 상황에 따라 다르게 보이는 것. 피그마의 Variants와 같은 개념",
      },
      {
        name: "프론트엔드 / 백엔드",
        description: "사용자가 보는 화면 / 보이지 않는 곳에서 저장·처리하는 부분. 매장과 창고",
      },
    ],
    tools: ["Gemini 앱", "Stitch"],
    homework: "기능 정의서 + 상태별 화면 4종 시안",
  },
  {
    number: 7,
    sourceWeek: "7주차",
    cycle: "사이클 3 · 신청 서비스 (만드는 주)",
    project: "신청 서비스 (이벤트 신청 폼)",
    stage: "2단계: AI Studio로 서비스 만들기",
    title: "신청 서비스 · 2단계: AI Studio로 서비스 만들기",
    goalOutput: "신청 폼 → 저장 → 성공/실패 안내 → 관리자 목록 화면까지 동작하는 서비스 배포 URL",
    topics: [
      "Google AI Studio Build 입문: Canvas와 다른 점 — 여러 파일, 데이터 저장, 배포가 한 화면에서",
      "6주차 기능 정의서를 그대로 프롬프트로: 기능 → 화면 → 상태 순서로 지시",
      "저장 연결: AI Studio가 제안하는 데이터 저장 사용 — 설정은 AI가 하고, 학생은 '무엇을 저장하는지'만 정의 (대안: 구글 폼 임베드 / 구글 시트 저장)",
      "성공/실패 모달, 관리자 목록 화면 추가",
      "AI Studio 배포 → URL 발급 → 동료가 실제로 신청해보기",
    ],
    terms: [
      {
        name: "데이터베이스 (DB)",
        description: "입력값이 쌓이는 표. 구글 시트를 떠올리면 됨",
      },
      {
        name: "API",
        description: "화면과 저장소 사이의 창구. 주문서를 주방에 전달하는 서빙 직원",
      },
      {
        name: "모달 (Modal)",
        description: "화면 위에 뜨는 안내 창. 성공·실패 결과를 보여주는 자리",
      },
      {
        name: "프로젝트 파일 구조",
        description: "화면 파일, 스타일 파일, 데이터 파일이 나뉘어 있음. 폴더 이름만 읽을 수 있으면 됨",
      },
    ],
    tools: ["Google AI Studio (Build)"],
    homework: "서비스 URL + 동료 신청 테스트 결과 3건 + 발견한 오류와 수정 기록",
  },
  {
    number: 8,
    sourceWeek: "8주차",
    cycle: "사이클 4 · 데이터 갤러리",
    project: "구글 시트 연동 작품 갤러리",
    stage: "콘텐츠를 데이터로 분리하기",
    title: "구글 시트 연동 작품 갤러리 · 콘텐츠를 데이터로 분리하기",
    goalOutput: "구글 시트에 작품을 추가하면 사이트에 자동 반영되는 작품 갤러리 (카테고리 필터 + 검색)",
    topics: [
      "사고 훈련 ④: 콘텐츠 모델링 — 작품 1개를 설명하는 항목(제목·연도·카테고리·태그·썸네일·설명)을 표로 정의. 표 설계가 곧 화면 설계",
      "구글 시트 = CMS: 코드를 안 건드리고 내용만 바꾸는 구조의 가치",
      "AI Studio Build에서 시트 연결 → 카드 반복 → 필터·검색",
      "컴포넌트 사고: 카드 1장을 완성하면 100장은 자동. 피그마 컴포넌트와 동일한 사고",
      "빈 상태·검색 결과 없음 화면 디자인 (6주차 상태 사고 재적용)",
    ],
    terms: [
      {
        name: "CMS",
        description: "코드 수정 없이 콘텐츠를 관리하는 시스템. 이 과정에서는 구글 시트",
      },
      {
        name: "JSON",
        description: "데이터를 주고받을 때의 표준 형식. 시트의 한 줄이 {제목: ..., 연도: ...} 형태로 바뀐 것",
      },
      {
        name: "컴포넌트 (Component)",
        description: "반복되는 UI 단위. 피그마 컴포넌트와 같음",
      },
      {
        name: "렌더링 (Rendering)",
        description: "데이터를 화면으로 그려내는 일. 시트 100줄 → 카드 100장",
      },
    ],
    tools: ["Google AI Studio (Build)", "Google Sheets"],
    homework: "갤러리 URL + 시트 구조 캡처 + 본인 작품 5개 이상 등록",
  },
  {
    number: 9,
    sourceWeek: "9주차",
    cycle: "통합 · 중간 쇼케이스",
    project: "케이스 스터디 & 포트폴리오 허브 v2",
    stage: "설명할 수 있는 포트폴리오",
    title: "케이스 스터디 & 포트폴리오 허브 v2 · 설명할 수 있는 포트폴리오",
    goalOutput:
      "케이스 스터디 3편 (포트폴리오 / 랜딩 / 서비스) — 문제 → 접근 → 결과 → 배운 점\n포트폴리오 허브 v2: 3개 프로젝트 링크 + 케이스 스터디 연결\n중간 쇼케이스 발표 (5분) + 피어 리뷰",
    topics: [
      "사고 훈련 ⑤: 미국형 케이스 스터디 구조 — 결과 이미지가 아니라 의사결정 과정이 평가 대상",
      "프롬프트 로그를 프로세스 자료로 전환: 'AI에게 무엇을 어떻게 지시했는가'가 곧 디자이너의 사고 증거",
      "2~8주차 산출물 전수 점검 체크리스트: 링크 작동, 모바일, 이미지 경로, 오타, 빈 상태",
      "피어 리뷰 규칙: 칭찬 1 / 질문 1 / 제안 1",
      "10주차 이후 개인 방향 설정: 포트폴리오 심화 / 서비스 심화 / 취업 자료 중 선택",
    ],
    terms: [
      {
        name: "케이스 스터디 (Case Study)",
        description: "프로젝트를 '결과물'이 아니라 '문제 해결 이야기'로 쓴 문서",
      },
      {
        name: "README",
        description: "프로젝트 폴더 안의 설명서. 케이스 스터디의 짧은 버전",
      },
      {
        name: "버전 (v1, v2)",
        description: "같은 사이트의 개선 단계. 이전 버전 링크를 남겨두면 성장 기록이 됨",
      },
    ],
    tools: ["Gemini 앱 (Canvas)", "Vercel"],
    homework: "케이스 스터디 3편 + 허브 URL + 다음 10주 개인 목표 1문장",
  },
  FEEDBACK_LESSON(20),
  FEEDBACK_LESSON(21),
  FEEDBACK_LESSON(22),
  FEEDBACK_LESSON(23),
  FEEDBACK_LESSON(24),
];
