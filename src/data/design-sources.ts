export type TopicId =
  | "foundations"
  | "research"
  | "visual"
  | "interaction"
  | "systems"
  | "accessibility"
  | "strategy"
  | "career";
export type StudyLevel = "foundation" | "applied" | "advanced";
export type SourceCitation = {
  sourceId: string;
  pdfPages: number[];
  section: string;
  relation: "concept" | "application" | "context";
};
export type DesignSource = {
  id: string;
  title: string;
  author: string;
  edition: string;
  pageCount: number;
  coverage: string;
  limitations: string;
};
export const TOPICS: { id: TopicId; label: string }[] = [
  { id: "foundations", label: "UX·UI 기초" },
  { id: "research", label: "리서치·사용자 이해" },
  { id: "visual", label: "비주얼·타이포그래피" },
  { id: "interaction", label: "인터랙션·정보 구조" },
  { id: "systems", label: "디자인 시스템" },
  { id: "accessibility", label: "접근성·포용적 디자인" },
  { id: "strategy", label: "제품 전략·AI 워크플로" },
  { id: "career", label: "협업·포트폴리오" },
];
export const LEVELS: { id: StudyLevel; label: string }[] = [
  { id: "foundation", label: "기초 이해" },
  { id: "applied", label: "실무 적용" },
  { id: "advanced", label: "심화 판단" },
];
export const DESIGN_SOURCES: DesignSource[] = [
  {
    id: "form-patterns",
    title: "Form Design Patterns",
    author: "Adam Silver",
    edition: "2018 · 제공 PDF",
    pageCount: 386,
    coverage:
      "질문의 목적, 라벨과 도움말, 입력·검증·오류 복구 및 폼 흐름을 학습 주제별로 검토했습니다.",
    limitations:
      "책의 모든 폼을 재현하거나 모든 코드를 검증한 것은 아닙니다. 당시 브라우저·기술 예제를 현재 구현 표준으로 사용하지 않습니다.",
  },
  {
    id: "ux-practices",
    title: "50 UX Best Practices",
    author: "Above the Fold",
    edition: "2012 · 제공 PDF",
    pageCount: 62,
    coverage: "사용자·사업 목표, 리서치와 관찰, 협업, 패턴 문서화와 콘텐츠 맥락을 참고했습니다.",
    limitations: "오래된 서비스·도구 추천과 성과 수치는 현재의 보편 규칙으로 옮기지 않았습니다.",
  },
  {
    id: "laws-ux",
    title: "Laws of UX",
    author: "Jon Yablonski",
    edition: "제공된 Early Release 판본",
    pageCount: 91,
    coverage:
      "멘탈 모델, 인지 부하, 청킹과 미적 사용성 효과를 설계 가설과 검토 질문으로 연결했습니다.",
    limitations:
      "최신 완전판을 검토한 것은 아닙니다. 법칙의 명칭을 모든 사용자에게 적용되는 결정 공식으로 사용하지 않습니다.",
  },
  {
    id: "design-psychology",
    title: "100 MORE Things Every Designer Needs to Know About People",
    author: "Susan M. Weinschenk",
    edition: "28쪽 발췌본 · 전체 책 아님",
    pageCount: 28,
    coverage:
      "발췌본에 실제 포함된 본문을 근거로 지각·인지에 대한 주장을 화면에서 검증하는 학습에 반영했습니다.",
    limitations:
      "목차·색인은 본문 근거가 아닙니다. 수록되지 않은 장을 읽거나 검증한 것으로 표시하지 않으며 심리적 경향을 성과 보장으로 일반화하지 않습니다.",
  },
  {
    id: "design-systems",
    title: "Design Systems",
    author: "Alla Kholmatova",
    edition: "2017 · 제공 PDF",
    pageCount: 289,
    coverage:
      "기능·시각 패턴, 공통 언어, 문서화, 팀의 기여·유지 방식과 시스템 운영을 참고했습니다.",
    limitations:
      "책의 조직 사례는 선택의 배경입니다. 모든 팀에 동일한 운영 모델을 처방하거나 최신 도구 기능의 근거로 사용하지 않습니다.",
  },
  {
    id: "vibe-playbook",
    title: "The Vibe Coding Playbook",
    author: "Harrell Howard",
    edition: "제공 PDF",
    pageCount: 103,
    coverage:
      "요구사항 명세, AI 초안 검토, 점진적 수정, 버전 관리, 엣지 케이스와 검증을 참고했습니다.",
    limitations:
      "구체적 API·도구 기능·보안 코드의 최신성을 보증하지 않습니다. AI의 설명과 실제 구현 확인을 구분합니다.",
  },
  {
    id: "vibe-revolution",
    title: "The Vibecoding Revolution: Your Path to Micro SaaS Success",
    author: "제공본에서 저자 확정하지 않음",
    edition: "제공 PDF",
    pageCount: 38,
    coverage:
      "구체적인 작업 요청과 생성 결과의 검토·수정 흐름을 디자인 프로토타입 제작에 적용했습니다.",
    limitations:
      "책의 수익·속도·사업 성공 주장, 특정 플랫폼의 기능·요금은 교육적 사실이나 현재 권장 사항으로 채택하지 않았습니다.",
  },
  {
    id: "intro-ux",
    title: "Introduction of UI & UX",
    author: "Hiten M Sadani 외",
    edition: "제공 PDF",
    pageCount: 42,
    coverage: "UX·UI 관계, 사용자 목표, 설계 자료와 테스트의 기본 개념을 참고했습니다.",
    limitations:
      "UI와 UX를 외형과 기능으로 단순 분리하지 않으며, 간략한 소개를 전문적인 연구 방법 전체로 간주하지 않습니다.",
  },
  {
    id: "ui-fundamentals",
    title: "Fundamentals of Creating a Great UI/UX",
    author: "Elisa Paduraru / Creative Tim",
    edition: "2022 · 제공 PDF",
    pageCount: 272,
    coverage: "그리드·레이아웃, 타이포그래피·색상, UI 요소와 화면 구성의 관련 장을 검토했습니다.",
    limitations:
      "특정 컬럼 수·간격 배수·타입 스케일을 보편 규칙으로 옮기지 않았습니다. 예시의 장식적 완성도와 사용성 근거를 구분합니다.",
  },
  {
    id: "web-terms",
    title: "웹디자인 관련 용어",
    author: "제공 자료",
    edition: "2026 표기 · 제공 PDF",
    pageCount: 78,
    coverage:
      "레이아웃·박스 모델, 타이포그래피, 인터페이스 요소와 디자인 시스템의 실무 명칭을 대조했습니다.",
    limitations:
      "단순화된 용어 설명은 다른 자료와 대조했습니다. CTA와 버튼, 포커스 관리와 닫기 동작 등은 정확히 구분합니다.",
  },
];
export const SOURCE_RELATIONS = {
  concept: "개념 근거",
  application: "적용 참고",
  context: "관련 맥락",
} as const;
export function sourceReference(citation: SourceCitation) {
  const source = DESIGN_SOURCES.find((item) => item.id === citation.sourceId);
  return {
    title: source?.title ?? citation.sourceId,
    location: `PDF ${citation.pdfPages.join(", ")}쪽 · ${citation.section}`,
    note: `${SOURCE_RELATIONS[citation.relation]} · 제공 PDF 뷰어의 1쪽부터 센 번호입니다. 인쇄된 책 쪽수와 다를 수 있습니다.`,
  };
}
