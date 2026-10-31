/**
 * Source: 구글 AI 바이브 코딩 커리큘럼 (1~19주차).xlsx, 시트1!B10:F28.
 * The workbook states "정규 19회차 마스터": attach lessons by session number.
 * Calendar dates and homework are not supplied and must not be inferred.
 */
export interface CurriculumLesson {
  number: number;
  sourceWeek: string;
  sourceRange: string;
  cycle: string;
  project: string;
  stage: string | null;
  title: string;
  goalOutput: string;
  topics: string[];
  terms: { name: string; description: string }[];
}

export const CURRICULUM_OVERVIEW = {
  sourceName: "구글 AI 바이브 코딩 커리큘럼 (1~19주차).xlsx",
  title: "구글 AI 바이브 코딩 실무 커리큘럼 (1~19주차)",
  subtitle:
    "비전공 디자이너를 위한 2주 단위 프로덕트 빌딩 & Gemini AI 기반 실전 웹 개발 마스터 코스",
  summary: [
    {
      label: "총 교육 기간",
      value: "19주",
      detail: "정규 19회차 마스터",
    },
    {
      label: "프로젝트 사이클",
      value: "6개 + 파이널",
      detail: "2주 단위 스프린트",
    },
    {
      label: "목표 웹 산출물",
      value: "7개 웹사이트",
      detail: "100% 라이브 상용 배포",
    },
    {
      label: "핵심 기술 스택",
      value: "Gemini AI & Web",
      detail: "HTML/CSS/JS & Sheets API",
    },
    {
      label: "교육 대상 및 특징",
      value: "비전공 디자이너",
      detail: "개발 용어 해설 & 코드 프리 빌딩",
    },
  ],
  totals: {
    주차: "총계",
    "구분(사이클)": "19주 코스 완성",
    "목표 산출물": "19개 주차 / 7개 웹사이트 완성",
    "주요 교육 내용":
      "2주 단위 바이브 코딩 12주(6개 사이클) + 중간 기획 1주 + 파이널 프로젝트 6주 완성",
    "핵심 개발 용어 (해석 포함)":
      "10대 핵심 웹 개발 개념(HTML, CSS, JS, 배포, 호스팅, 도메인, 디버깅, 반응형, 크로스 브라우징, 임베드 등) 마스터",
  },
};

export const CURRICULUM_LESSONS: CurriculumLesson[] = [
  {
    number: 1,
    sourceWeek: "1주차",
    sourceRange: "시트1!B10:F10",
    cycle: "사이클 1 (기초 탐색)",
    project: "개인 포트폴리오 웹사이트",
    stage: "1단계: 정적 UI 구조화",
    title: "개인 포트폴리오 웹사이트 · 1단계: 정적 UI 구조화",
    goalOutput: "개인 포트폴리오 웹사이트\n[1단계: 정적 UI 구조화]",
    topics: [
      "바이브 코딩(Vibe Coding) 개념 소개 및 Gemini 프롬프트 작성 기초",
      "디자인 시안/아이디어 텍스트를 HTML/CSS 기본 골격으로 변환",
      "웹 페이지 레이아웃 구조와 디자이너를 위한 기초 코드 읽기",
    ],
    terms: [
      {
        name: "HTML (HyperText Markup Language)",
        description: "웹페이지의 뼈대와 구조를 잡는 언어 (디자인의 와이어프레임 역할)",
      },
      {
        name: "CSS (Cascading Style Sheets)",
        description:
          "색상, 폰트, 여백 등 시각적 스타일을 입히는 언어 (디자인의 스타일 가이드 역할)",
      },
    ],
  },
  {
    number: 2,
    sourceWeek: "2주차",
    sourceRange: "시트1!B11:F11",
    cycle: "사이클 1 (기초 탐색)",
    project: "개인 포트폴리오 웹사이트",
    stage: "2단계: 호스팅 & 웹 배포",
    title: "개인 포트폴리오 웹사이트 · 2단계: 호스팅 & 웹 배포",
    goalOutput: "개인 포트폴리오 웹사이트\n[2단계: 호스팅 & 웹 배포]",
    topics: [
      "생성된 웹 코드의 로컬 브라우저 검토 및 실시간 수정/스타일링 기법",
      "깃허브 페이지(GitHub Pages) 또는 Vercel을 통한 원클릭 웹 배포 실습",
      "내 포트폴리오를 실제 라이브 웹 링크(URL)로 공유하고 모바일 브라우저 확인",
    ],
    terms: [
      {
        name: "배포 (Deployment)",
        description:
          "내 컴퓨터에서 작업한 웹사이트 파일을 인터넷 서버에 올려 누구나 접속할 수 있게 하는 과정",
      },
      {
        name: "호스팅 (Hosting)",
        description:
          "웹사이트 파일들을 24시간 인터넷에 띄워둘 수 있도록 서버 공간을 빌려주는 서비스",
      },
    ],
  },
  {
    number: 3,
    sourceWeek: "3주차",
    sourceRange: "시트1!B12:F12",
    cycle: "사이클 2 (인터랙션 기초)",
    project: "브랜드/제품 소개 랜딩페이지",
    stage: "1단계: AI 기획 & 에셋",
    title: "브랜드/제품 소개 랜딩페이지 · 1단계: AI 기획 & 에셋",
    goalOutput: "브랜드/제품 소개 랜딩페이지\n[1단계: AI 기획 & 에셋]",
    topics: [
      "Gemini를 활용한 가상 브랜드 스토리, 제품 USP, 마케팅 카피라이팅 도출",
      "AI 프롬프트 기반 배너 이미지 및 아이콘 에셋 자동 생성",
      "텍스트 프롬프트 기반 1차 웹페이지 레이아웃 고속 생성 및 와이어프레임 정렬",
    ],
    terms: [
      {
        name: "프롬프트 엔지니어링 (Prompt Engineering)",
        description: "AI에게 원하는 디자인과 코드 결과물을 유도하기 위한 구체적인 지시문 작성법",
      },
      {
        name: "CTA (Call To Action)",
        description: "'구매하기', '사전예약' 등 사용자의 특정 행동을 유도하는 핵심 버튼/링크",
      },
    ],
  },
  {
    number: 4,
    sourceWeek: "4주차",
    sourceRange: "시트1!B13:F13",
    cycle: "사이클 2 (인터랙션 기초)",
    project: "브랜드/제품 소개 랜딩페이지",
    stage: "2단계: 반응형 UI 최적화",
    title: "브랜드/제품 소개 랜딩페이지 · 2단계: 반응형 UI 최적화",
    goalOutput: "브랜드/제품 소개 랜딩페이지\n[2단계: 반응형 UI 최적화]",
    topics: [
      "모바일, 태블릿, PC 화면 크기에 맞춰 자연스럽게 반응하는 레이아웃 구현",
      "클릭 시 특정 섹션으로 부드럽게 이동하는 스크롤 및 마우스 호버(Hover) 효과",
      "비전공자를 위한 디버깅 팁: 화면 깨짐 및 레이아웃 틀어짐 신속 해결",
    ],
    terms: [
      {
        name: "반응형 웹 (Responsive Web)",
        description:
          "PC, 태블릿, 모바일 등 화면 크기에 맞춰 레이아웃이 유연하게 최적화되는 웹 디자인 기술",
      },
      {
        name: "디버깅 (Debugging)",
        description: "코드에서 발생한 오류나 화면 깨짐 현상(버그)을 찾아내어 바로잡는 과정",
      },
    ],
  },
  {
    number: 5,
    sourceWeek: "5주차",
    sourceRange: "시트1!B14:F14",
    cycle: "사이클 3 (데이터 수집)",
    project: "이벤트 신청 & 뉴스레터 웹",
    stage: "1단계: UI 및 입력 폼",
    title: "이벤트 신청 & 뉴스레터 웹 · 1단계: UI 및 입력 폼",
    goalOutput: "이벤트 신청 & 뉴스레터 웹\n[1단계: UI 및 입력 폼]",
    topics: [
      "사용자 참여 유도를 위한 이벤트 신청 폼 및 뉴스레터 구독 섹션 UI 디자인",
      "텍스트 필드, 이메일, 드롭다운 셀렉트 등 입력 폼(Form) 태그 구성",
      "구글 폼(Google Forms) 생성을 통한 백엔드 데이터 수집 기반 마련",
    ],
    terms: [
      {
        name: "임베드 (Embed)",
        description:
          "다른 서비스(구글 폼, 유튜브 영상, 지도 등)의 기능을 내 웹페이지 안에 코드 조각으로 삽입하는 방식",
      },
      {
        name: "유효성 검사 (Validation)",
        description:
          "사용자가 이메일 형식(@ 포함)이나 필수 입력값을 올바르게 적었는지 확인하는 절차",
      },
    ],
  },
  {
    number: 6,
    sourceWeek: "6주차",
    sourceRange: "시트1!B15:F15",
    cycle: "사이클 3 (데이터 수집)",
    project: "이벤트 신청 & 뉴스레터 웹",
    stage: "2단계: 구글 시트 자동화",
    title: "이벤트 신청 & 뉴스레터 웹 · 2단계: 구글 시트 자동화",
    goalOutput: "이벤트 신청 & 뉴스레터 웹\n[2단계: 구글 시트 자동화]",
    topics: [
      "웹페이지 폼 입력을 구글 스프레드시트로 실시간 전송 및 저장하는 워크플로우",
      "Gemini를 활용한 데이터 전송 성공/실패 팝업 모달창 인터랙션 구현",
      "폼 제출 완료 시 사용자 대상 자동 확인 이메일 발송 워크플로우 연결",
    ],
    terms: [
      {
        name: "JS (JavaScript)",
        description:
          "클릭, 팝업, 데이터 전송 등 웹페이지에 동적인 동작과 상호작용을 불어넣는 프로그래밍 언어",
      },
      {
        name: "모달 (Modal)",
        description:
          "기존 페이지 위에 레이어 형태로 떠서 중요한 안내나 전송 결과를 보여주는 팝업 창",
      },
    ],
  },
  {
    number: 7,
    sourceWeek: "7주차",
    sourceRange: "시트1!B16:F16",
    cycle: "사이클 4 (비주얼 인터랙션)",
    project: "인터랙티브 링크트리 & 프로필 웹",
    stage: "1단계: 모바일 퍼스트 카드 UI",
    title: "인터랙티브 링크트리 & 프로필 웹 · 1단계: 모바일 퍼스트 카드 UI",
    goalOutput: "인터랙티브 링크트리 & 프로필 웹\n[1단계: 모바일 퍼스트 카드 UI]",
    topics: [
      "모바일 퍼스트(Mobile First) 기반의 SNS 링크트리 스타일 카드 레이아웃",
      "Figma 디자인 시안 이미지를 Gemini에 업로드하여 코드로 변환 (Image-to-Code)",
      "카드 클릭 시 상세 정보가 펼쳐지는 아코디언 및 부드러운 전환 효과 적용",
    ],
    terms: [
      {
        name: "Image-to-Code",
        description:
          "디자인 시안이나 캡처 이미지를 AI에 업로드하여 웹 코드로 즉각 변환하는 최신 바이브 코딩 기법",
      },
      {
        name: "모바일 퍼스트 (Mobile First)",
        description: "데스크톱보다 모바일 화면의 사용성과 경험을 우선적으로 고려하여 설계하는 방식",
      },
    ],
  },
  {
    number: 8,
    sourceWeek: "8주차",
    sourceRange: "시트1!B17:F17",
    cycle: "사이클 4 (비주얼 인터랙션)",
    project: "인터랙티브 링크트리 & 프로필 웹",
    stage: "2단계: 테마 전환 & 크로스 브라우징",
    title: "인터랙티브 링크트리 & 프로필 웹 · 2단계: 테마 전환 & 크로스 브라우징",
    goalOutput: "인터랙티브 링크트리 & 프로필 웹\n[2단계: 테마 전환 & 크로스 브라우징]",
    topics: [
      "다크 모드 / 라이트 모드 전환 토글 스위치 및 CSS 변수 테마 시스템 구현",
      "버튼 클릭감과 시각적 피드백을 극대화하는 마이크로 인터랙션 디테일링",
      "아이폰 사파리, 안드로이드 크롬 등 다양한 모바일 브라우저 크로스 브라우징 점검",
    ],
    terms: [
      {
        name: "마이크로 인터랙션 (Micro-interaction)",
        description:
          "버튼 누름 효과, 스위치 온오프 등 미세한 피드백으로 UX 완성도를 높이는 시각 디테일",
      },
      {
        name: "크로스 브라우징 (Cross Browsing)",
        description:
          "크롬, 사파리, 엣지 등 어떤 브라우저에서도 웹사이트가 동일하게 보이고 작동하도록 하는 기술",
      },
    ],
  },
  {
    number: 9,
    sourceWeek: "9주차",
    sourceRange: "시트1!B18:F18",
    cycle: "사이클 5 (동적 콘텐츠)",
    project: "구글 시트 연동 갤러리 웹",
    stage: "1단계: 시트 DB 모델링",
    title: "구글 시트 연동 갤러리 웹 · 1단계: 시트 DB 모델링",
    goalOutput: "구글 시트 연동 갤러리 웹\n[1단계: 시트 DB 모델링]",
    topics: [
      "구글 시트를 노코드/코드리스 무료 데이터베이스(CMS)로 기획 및 구조화",
      "시트에 작품명, 썸네일 이미지 URL, 카테고리, 태그, 상세 설명 데이터 구축",
      "구글 시트 데이터를 웹페이지로 불러오는 기본 원리와 JSON 데이터 구조 이해",
    ],
    terms: [
      {
        name: "CMS (Content Management System)",
        description:
          "웹 코드를 수정하지 않고도 콘텐츠를 손쉽게 등록·수정·관리하는 콘텐츠 관리 시스템",
      },
      {
        name: "JSON (JavaScript Object Notation)",
        description:
          "서버와 웹페이지 사이에서 데이터를 가볍고 명확하게 주고받기 위한 표준 텍스트 데이터 형식",
      },
    ],
  },
  {
    number: 10,
    sourceWeek: "10주차",
    sourceRange: "시트1!B19:F19",
    cycle: "사이클 5 (동적 콘텐츠)",
    project: "구글 시트 연동 갤러리 웹",
    stage: "2단계: 동적 렌더링 & 필터",
    title: "구글 시트 연동 갤러리 웹 · 2단계: 동적 렌더링 & 필터",
    goalOutput: "구글 시트 연동 갤러리 웹\n[2단계: 동적 렌더링 & 필터]",
    topics: [
      "시트 데이터 수정 시 웹페이지에 실시간 반영되는 동적 카드 리스트 구현",
      "카테고리별(브랜딩, UI/UX, 그래픽) 원클릭 필터링 버튼 인터랙션 추가",
      "검색창 키워드 입력에 따른 실시간 즉시 검색 및 카드 필터링 기능 완성",
    ],
    terms: [
      {
        name: "API (Application Programming Interface)",
        description:
          "서로 다른 소프트웨어(구글 시트와 내 웹사이트)가 데이터를 주고받도록 잇는 통신 창구",
      },
      {
        name: "동적 렌더링 (Dynamic Rendering)",
        description:
          "고정된 웹 문서가 아니라 저장된 데이터에 따라 화면 요소가 실시간으로 생성되어 표시되는 방식",
      },
    ],
  },
  {
    number: 11,
    sourceWeek: "11주차",
    sourceRange: "시트1!B20:F20",
    cycle: "사이클 6 (양방향 커뮤니케이션)",
    project: "디자이너 Q&A & 피드백 보드",
    stage: "1단계: GAS 백엔드 API",
    title: "디자이너 Q&A & 피드백 보드 · 1단계: GAS 백엔드 API",
    goalOutput: "디자이너 Q&A & 피드백 보드\n[1단계: GAS 백엔드 API]",
    topics: [
      "구글 앱스 스크립트(GAS)를 활용한 간단한 웹 API 엔드포인트 구축",
      "Gemini로 비전공자도 쉽게 작성하는 백엔드 스크립트 프롬프트 패턴 학습",
      "방문자가 남긴 질문과 피드백을 구글 시트에 안전하게 저장하는 양방향 통신",
    ],
    terms: [
      {
        name: "GAS (Google Apps Script)",
        description:
          "구글 시트, 폼 등 워크스페이스 앱을 자동화하고 웹 API로 만들어주는 구글의 클라우드 스크립트 도구",
      },
      {
        name: "엔드포인트 (Endpoint)",
        description: "API 통신에서 데이터가 도달하여 처리되는 특정 웹 주소(URL) 목적지",
      },
    ],
  },
  {
    number: 12,
    sourceWeek: "12주차",
    sourceRange: "시트1!B21:F21",
    cycle: "사이클 6 (양방향 커뮤니케이션)",
    project: "디자이너 Q&A & 피드백 보드",
    stage: "2단계: 실시간 피드 & 리뷰",
    title: "디자이너 Q&A & 피드백 보드 · 2단계: 실시간 피드 & 리뷰",
    goalOutput: "디자이너 Q&A & 피드백 보드\n[2단계: 실시간 피드 & 리뷰]",
    topics: [
      "등록된 질문과 댓글이 페이지 새로고침 없이 화면에 즉각 업데이트되는 UI",
      "악성 글 방지를 위한 글자 수 제한, 필수 입력 체크, 비속어 필터링 기초",
      "사이클 1~6(총 6개 사이클) 프로젝트 총정리 및 수강생 간 상호 피어 리뷰",
    ],
    terms: [
      {
        name: "비동기 통신 (Asynchronous / AJAX)",
        description:
          "웹페이지를 새로고침하지 않고도 백그라운드에서 필요한 데이터만 가져와 화면을 갱신하는 기술",
      },
      {
        name: "피어 리뷰 (Peer Review)",
        description:
          "동료들과 서로의 완성작을 직접 사용해보고 장단점 피드백을 주고받는 상호 평가 과정",
      },
    ],
  },
  {
    number: 13,
    sourceWeek: "13주차",
    sourceRange: "시트1!B22:F22",
    cycle: "중간 점검 & 기획",
    project: "파이널 프로젝트 기획서 & 와이어프레임 명세서",
    stage: null,
    title: "파이널 프로젝트 기획서 & 와이어프레임 명세서",
    goalOutput: "파이널 프로젝트 기획서 &\n와이어프레임 명세서",
    topics: [
      "1~12주차 핵심 웹 개발 개념 총복습 (HTML/CSS/JS/API 구조 체계화)",
      "나만의 실무 맞춤형 웹 서비스 기획 (디자인 스튜디오, 커머스, 커뮤니티 등)",
      "Gemini를 페어 프로그래밍 파트너로 활용한 파이널 프로젝트 6주 로드맵 수립",
    ],
    terms: [
      {
        name: "페어 프로그래밍 (Pair Programming)",
        description:
          "두 사람이 협업하듯, 디자이너가 기획·디자인을 이끌고 AI가 코딩 파트너 역할을 하는 방식",
      },
      {
        name: "와이어프레임 (Wireframe)",
        description:
          "웹페이지의 레이아웃, 화면 구조, 인터랙션 요소를 단순한 선과 도형으로 설계한 청사진",
      },
    ],
  },
  {
    number: 14,
    sourceWeek: "14주차",
    sourceRange: "시트1!B23:F23",
    cycle: "파이널 프로젝트 (실무 종합)",
    project: "파이널 웹 서비스",
    stage: "1단계: 기획 및 디자인 시스템 구축",
    title: "파이널 웹 서비스 · 1단계: 기획 및 디자인 시스템 구축",
    goalOutput: "파이널 웹 서비스 [1단계]:\n기획 및 디자인 시스템 구축",
    topics: [
      "Gemini와 함께 서비스 유저 플로우(User Flow) 및 정보 구조(IA) 정밀 설계",
      "글로벌 컬러, 타이포그래피, 버튼, 폼 등 일관된 디자인 시스템 토큰 정의",
      "메인 페이지 및 서브 페이지 화면 레이아웃 와이어프레임 확정",
    ],
    terms: [
      {
        name: "디자인 시스템 (Design System)",
        description:
          "일관된 브랜드 경험을 위해 색상, 서체, UI 컴포넌트 규칙을 체계적으로 정리한 디자인 규격",
      },
      {
        name: "IA (Information Architecture)",
        description:
          "사용자가 원하는 정보에 쉽게 도달할 수 있도록 사이트의 메뉴와 정보 구조를 체계화하는 설계",
      },
    ],
  },
  {
    number: 15,
    sourceWeek: "15주차",
    sourceRange: "시트1!B24:F24",
    cycle: "파이널 프로젝트 (실무 종합)",
    project: "파이널 웹 서비스",
    stage: "2단계: 메인 UI 고속 바이브 코딩",
    title: "파이널 웹 서비스 · 2단계: 메인 UI 고속 바이브 코딩",
    goalOutput: "파이널 웹 서비스 [2단계]:\n메인 UI 고속 바이브 코딩",
    topics: [
      "Figma 확정 시안을 Image-to-Code 기법으로 고품질 웹 코드로 신속 변환",
      "Flexbox 및 Grid 기반 모던 CSS 레이아웃 구조화 및 컴포넌트 모듈화",
      "시각적 계층 구조(Hierarchy) 점검 및 디자이너 특유의 정밀 여백/패딩 보정",
    ],
    terms: [
      {
        name: "Flexbox & Grid",
        description:
          "웹페이지의 UI 요소들을 가로나 세로 방향으로 자유롭고 정교하게 배치할 수 있는 모던 CSS 레이아웃 도구",
      },
      {
        name: "시각적 계층 구조 (Visual Hierarchy)",
        description:
          "폰트 크기, 명도 대비, 여백을 조절하여 사용자가 중요 정보부터 자연스럽게 읽도록 돕는 원칙",
      },
    ],
  },
  {
    number: 16,
    sourceWeek: "16주차",
    sourceRange: "시트1!B25:F25",
    cycle: "파이널 프로젝트 (실무 종합)",
    project: "파이널 웹 서비스",
    stage: "3단계: 인터랙션 & 구글 워크스페이스 연동",
    title: "파이널 웹 서비스 · 3단계: 인터랙션 & 구글 워크스페이스 연동",
    goalOutput: "파이널 웹 서비스 [3단계]:\n인터랙션 & 구글 워크스페이스 연동",
    topics: [
      "구글 시트 CMS 연동을 통한 동적 데이터(상품/콘텐츠 목록) 실시간 바인딩",
      "문의/주문/예약 등 사용자 인터랙티브 입력 폼 및 실시간 유효성 체크 연결",
      "스크롤 애니메이션(AOS) 및 모달 인터랙션을 결합한 인터랙티브 완성도 극대화",
    ],
    terms: [
      {
        name: "데이터 바인딩 (Data Binding)",
        description:
          "구글 시트에 입력된 실제 데이터와 화면의 텍스트·이미지를 자동으로 연결해 동기화하는 기술",
      },
      {
        name: "AOS (Animate On Scroll)",
        description:
          "사용자가 스크롤을 내릴 때 특정 요소들이 부드럽게 나타나거나 움직이도록 연출하는 애니메이션 라이브러리",
      },
    ],
  },
  {
    number: 17,
    sourceWeek: "17주차",
    sourceRange: "시트1!B26:F26",
    cycle: "파이널 프로젝트 (실무 종합)",
    project: "파이널 웹 서비스",
    stage: "4단계: 반응형 고도화 & 크로스 브라우징",
    title: "파이널 웹 서비스 · 4단계: 반응형 고도화 & 크로스 브라우징",
    goalOutput: "파이널 웹 서비스 [4단계]:\n반응형 고도화 & 크로스 브라우징",
    topics: [
      "PC, 맥북, 태블릿, 모바일 기기별 완벽한 반응형 뷰포트 정밀 테스트",
      "크롬, 사파리(iOS), 엣지 브라우저 간 스타일 오차 디버깅 및 호환성 확보",
      "웹페이지 로딩 속도 향상을 위한 WebP 이미지 변환 및 리소스 최적화",
    ],
    terms: [
      {
        name: "뷰포트 (Viewport)",
        description:
          "스마트폰, 노트북, 모니터 등 사용자가 기기 화면을 통해 실제로 웹페이지를 보고 있는 디스플레이 표시 영역",
      },
      {
        name: "최적화 (Optimization)",
        description:
          "불필요한 코드와 무거운 이미지를 압축·다듬어 웹페이지가 1초 이내로 빠르게 로딩되도록 성능을 개선하는 작업",
      },
    ],
  },
  {
    number: 18,
    sourceWeek: "18주차",
    sourceRange: "시트1!B27:F27",
    cycle: "파이널 프로젝트 (실무 종합)",
    project: "파이널 웹 서비스",
    stage: "5단계: 커스텀 도메인 & 상용 배포",
    title: "파이널 웹 서비스 · 5단계: 커스텀 도메인 & 상용 배포",
    goalOutput: "파이널 웹 서비스 [5단계]:\n커스텀 도메인 & 상용 배포",
    topics: [
      "Vercel / Netlify 클라우드 호스팅 플랫폼에 최종 소스코드 상용 배포",
      "개인 커스텀 도메인(예: mybrand.com) 구매 및 DNS 레코드 연동 실습",
      "구글/네이버 검색 노출을 위한 SEO 메타태그 및 카카오톡/SNS 공유용 OG 태그 설정",
    ],
    terms: [
      {
        name: "도메인 (Domain)",
        description:
          "복잡한 숫자 IP 주소 대신 누구나 쉽게 기억하고 접속할 수 있도록 부여한 나만의 웹사이트 주소",
      },
      {
        name: "SEO (Search Engine Optimization)",
        description:
          "구글 등 검색 엔진 결과 상위에 내 사이트가 노출되도록 메타태그와 제목을 최적화하는 기법",
      },
      {
        name: "SSL (Secure Sockets Layer)",
        description:
          "사용자 데이터를 암호화하여 브라우저에 안전한 자물쇠(https://)를 표시해주는 보안 인증서",
      },
    ],
  },
  {
    number: 19,
    sourceWeek: "19주차",
    sourceRange: "시트1!B28:F28",
    cycle: "파이널 프로젝트 (실무 종합)",
    project: "파이널 웹 서비스",
    stage: "6단계: 최종 런칭 쇼케이스 & 운영 가이드",
    title: "파이널 웹 서비스 · 6단계: 최종 런칭 쇼케이스 & 운영 가이드",
    goalOutput: "파이널 웹 서비스 [6단계]:\n최종 런칭 쇼케이스 & 운영 가이드",
    topics: [
      "완성된 나만의 라이브 웹 서비스 최종 발표 및 라이브 데모 쇼케이스",
      "구글 시트를 활용한 비개발자 유지보수 및 일상 콘텐츠 운영 매뉴얼 가이드",
      "전문 개발자와의 실무 협업 노하우 및 AI 바이브 코딩 기반 디자이너 성장 로드맵",
    ],
    terms: [
      {
        name: "런칭 (Launching)",
        description:
          "완성된 웹 서비스를 일반 대중과 실제 타깃 사용자에게 공식적으로 오픈하고 상용 운영을 시작하는 것",
      },
      {
        name: "유지보수 (Maintenance)",
        description:
          "서비스 출시 이후에도 새로운 콘텐츠를 업데이트하고 오류나 기능을 지속적으로 관리·보수하는 활동",
      },
    ],
  },
];
