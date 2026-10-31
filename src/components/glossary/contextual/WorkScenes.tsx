import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileText,
  MessageSquare,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { LearningFigure } from "@/data/learning/types";
import { ContextFrame, ContextPhoto, ContextCallout } from "./ContextFrame";
import "./work-scenes.css";

type SceneKind =
  | "brief"
  | "research"
  | "review"
  | "survey"
  | "privacy"
  | "business"
  | "career"
  | "role"
  | "article"
  | "literacy";
type SceneConfig = { kind: SceneKind; title: string; view: string; cue: string };

const WORK_SCENES = {
  "advertising-agencies": {
    kind: "role",
    title: "리필을 시작하는 하루",
    view: "campaign",
    cue: "하나의 캠페인 메시지를 웹 배너와 소셜 광고에 연결해 만드는 작업입니다.",
  },
  "back-end-developer": {
    kind: "role",
    title: "책갈피 저장 API",
    view: "backend",
    cue: "화면 뒤에서 인증·권한·데이터 저장을 처리하는 부분이 백엔드 개발자의 작업입니다.",
  },
  "budget-estimate": {
    kind: "business",
    title: "웹사이트 개편 견적",
    view: "estimate",
    cue: "작업 항목별 예상 금액과 전제 조건을 함께 읽어야 견적의 범위를 알 수 있습니다.",
  },
  define: {
    kind: "brief",
    title: "과제 제출의 문제 정의",
    view: "define",
    cue: "관찰 자료를 사용자·상황·필요로 좁혀 문제를 정의한 부분을 보세요.",
  },
  "design-agency": {
    kind: "role",
    title: "온점 × 모래 전시",
    view: "agency",
    cue: "고객의 의뢰를 사용자 흐름·화면·전달 자료로 구체화하는 디자인 스튜디오의 프로젝트입니다.",
  },
  "design-critique-session": {
    kind: "review",
    title: "예약 화면 크리틱",
    view: "critique",
    cue: "목표와 화면의 특정 위치를 근거로 개선 방향을 함께 논의하는 세션입니다.",
  },
  "design-research": {
    kind: "research",
    title: "자료 탐색 리서치",
    view: "plan",
    cue: "알고 싶은 질문, 관찰 방법, 설계에 활용할 단서가 연결된 리서치 계획입니다.",
  },
  "digital-literacy": {
    kind: "literacy",
    title: "자료의 신뢰성 확인하기",
    view: "sources",
    cue: "정보를 찾는 데서 끝나지 않고 작성 시점·근거·사용 조건을 평가합니다.",
  },
  "elevator-pitch": {
    kind: "brief",
    title: "30초 프로젝트 소개",
    view: "pitch",
    cue: "대상·문제·가치가 짧은 소개 안에 함께 담긴 부분을 보세요. 30초는 이 예시의 형식입니다.",
  },
  "entry-level-job": {
    kind: "career",
    title: "주니어 프로덕트 디자이너",
    view: "job",
    cue: "경력 초기 채용 공고에서도 실제 업무·기대 역량·성장 환경을 구체적으로 확인합니다.",
  },
  facilitator: {
    kind: "role",
    title: "예약 개선 워크숍",
    view: "facilitation",
    cue: "퍼실리테이터가 참여 기회와 논의 흐름을 조율하는 진행 메모를 보세요.",
  },
  feedback: {
    kind: "review",
    title: "저장 상태에 대한 피드백",
    view: "feedback",
    cue: "화면에서 관찰한 점 → 사용자에게 생길 영향 → 제안이 연결됩니다.",
  },
  "first-interview": {
    kind: "career",
    title: "첫 면접 안내",
    view: "first",
    cue: "첫 면접의 목적과 준비 항목을 확인하는 안내입니다. 회사별 절차는 다를 수 있습니다.",
  },
  "foundational-research": {
    kind: "research",
    title: "복습 경험 탐색",
    view: "discovery",
    cue: "구체적인 화면 안을 평가하기 전에, 해결되지 않은 사용자 필요를 탐색합니다.",
  },
  framework: {
    kind: "brief",
    title: "사용자 문제를 읽는 공통 틀",
    view: "framework",
    cue: "사용자·목표·장벽이라는 같은 질문을 적용해 복잡한 정보를 정리합니다.",
  },
  freelancers: {
    kind: "business",
    title: "윤 디자인 · 프로젝트 보드",
    view: "freelance",
    cue: "고객과 범위를 합의하고 독립적으로 결과물을 제공하는 프로젝트 운영 모습입니다.",
  },
  "front-end-developer": {
    kind: "role",
    title: "자료 카드 구현",
    view: "frontend",
    cue: "화면의 형태와 사용자 조작·로딩·오류 상태를 브라우저에서 구현합니다.",
  },
  generalist: {
    kind: "role",
    title: "한 프로젝트, 여러 디자인 역할",
    view: "generalist",
    cue: "리서치부터 화면 설계와 평가까지 여러 영역을 폭넓게 맡는 모습을 보세요.",
  },
  "goal-statement": {
    kind: "brief",
    title: "제출 경험 개선 목표",
    view: "goal",
    cue: "대상 사용자·도움이 될 행동·기대 결과를 연결한 목표 문장입니다.",
  },
  heading: {
    kind: "article",
    title: "색상 대비의 기초",
    view: "heading",
    cue: "H1 → H2 → H3의 제목 계층이 글의 의미 구조를 나타냅니다. 크기만 다른 글자가 아닙니다.",
  },
  "hypothesis-statement": {
    kind: "brief",
    title: "파일 형식 안내에 대한 가정",
    view: "hypothesis",
    cue: "변경안이 어떤 결과를 낼지 예상하고, 확인 방법까지 적은 검증 가능한 가정입니다.",
  },
  insight: {
    kind: "research",
    title: "제출 뒤의 불확실성",
    view: "insight",
    cue: "실제 관찰과 발언을 바탕으로 사용자의 필요를 해석한 부분이 인사이트입니다.",
  },
  interviews: {
    kind: "research",
    title: "P03 · 과제 제출 경험 인터뷰",
    view: "interview",
    cue: "최근 경험을 묻는 질문과 참여자의 답, 후속 질문이 이어지는 인터뷰 기록입니다.",
  },
  "key-terms": {
    kind: "career",
    title: "채용 공고의 핵심 요구",
    view: "keywords",
    cue: "전문 용어를 표시한 뒤 자신이 보여 줄 수 있는 작업 증거와 연결합니다.",
  },
  methodology: {
    kind: "research",
    title: "강의 비교 연구 접근",
    view: "method",
    cue: "선택한 방법뿐 아니라 그 방법을 쓰는 이유와 해석의 한계를 기록합니다.",
  },
  "non-disclosure-agreement-nda": {
    kind: "privacy",
    title: "비밀유지 합의 · 구조 예시",
    view: "nda",
    cue: "보호할 정보와 허용 목적·공유 범위·기간이 명시되는 위치를 보세요. 법률 문서 양식이 아닌 구조 예시입니다.",
  },
  notetaker: {
    kind: "research",
    title: "사용성 관찰 노트",
    view: "notes",
    cue: "직접 본 행동, 그대로 옮긴 발언, 연구자의 해석을 서로 다른 칸에 기록합니다.",
  },
  "panel-interview": {
    kind: "career",
    title: "프로젝트 패널 면접",
    view: "panel",
    cue: "여러 면접관이 같은 프로젝트를 디자인·개발·프로덕트 관점에서 질문합니다.",
  },
  "peer-reviews": {
    kind: "review",
    title: "동료 검토 · 제출 상태",
    view: "peer",
    cue: "동료가 작업물의 모호한 지점을 짚고 검토할 방향을 제안하는 기록입니다.",
  },
  "personal-statement": {
    kind: "career",
    title: "이지안 · UI 디자이너",
    view: "statement",
    cue: "자신의 방향을 설명하고 관련 경험으로 뒷받침하는 소개문을 보세요.",
  },
  "personally-identifiable-information-pii": {
    kind: "privacy",
    title: "연구 기록의 식별 정보",
    view: "pii",
    cue: "이름·이메일뿐 아니라 여러 정보의 조합도 특정 사람을 식별할 수 있습니다.",
  },
  "post-launch-research": {
    kind: "research",
    title: "출시 후 검색 경험 점검",
    view: "postlaunch",
    cue: "사용 로그에서 발견한 현상과 사용자 맥락을 함께 확인해 다음 개선을 결정합니다.",
  },
  presenter: {
    kind: "role",
    title: "제출 상태 디자인 리뷰",
    view: "presenter",
    cue: "발표자가 비교할 질문과 근거를 먼저 제시하고, 논의할 결정을 안내합니다.",
  },
  "problem-statement": {
    kind: "brief",
    title: "첫 제출의 문제 진술",
    view: "problem",
    cue: "특정 기능을 먼저 정하지 않고 사용자·어려움·필요를 분명히 적습니다.",
  },
  "product-designer": {
    kind: "role",
    title: "신청 경험 설계",
    view: "product",
    cue: "사용자 필요·운영 목적·구현 조건을 하나의 설계 결정에 연결합니다.",
  },
  "product-goal-statement": {
    kind: "brief",
    title: "용어집이 제공할 가치",
    view: "product-goal",
    cue: "제품의 기능 목록보다 누구에게 어떤 도움을 줄지 드러나는 목표 문장입니다.",
  },
  "production-designers": {
    kind: "role",
    title: "개발 전달용 디자인 패키지",
    view: "production",
    cue: "승인된 디자인 의도를 에셋·상태·규격에 일관되게 반영해 전달합니다.",
  },
  "project-background": {
    kind: "brief",
    title: "제출 경험 개편 배경",
    view: "background",
    cue: "프로젝트를 시작한 이유, 현재 영향, 작업 조건이 정리된 부분을 보세요.",
  },
  proposal: {
    kind: "business",
    title: "포트폴리오 웹사이트 제안",
    view: "proposal",
    cue: "어떤 목표를 어떤 범위·진행 방식·일정·비용 조건으로 수행할지 제안합니다.",
  },
  "research-report": {
    kind: "research",
    title: "첫 과제 제출 조사 보고서",
    view: "report",
    cue: "방법·관찰 결과·제안·한계가 구분된 보고서입니다. 표시된 수치는 교육용 가상 데이터입니다.",
  },
  "research-study": {
    kind: "research",
    title: "수업 자료 탐색 연구 계획",
    view: "study",
    cue: "조사 질문이 참여자 조건과 절차·분석 계획으로 이어집니다.",
  },
  reviewer: {
    kind: "review",
    title: "예약 금액 표시 리뷰",
    view: "reviewer",
    cue: "검토자가 개인 취향 대신 기준과 화면의 근거를 연결해 의견을 남깁니다.",
  },
  "scope-of-work": {
    kind: "business",
    title: "예약 개선 · 업무 범위",
    view: "scope",
    cue: "포함하는 일과 제외하는 일, 추가 요청을 검토할 기준을 함께 확인합니다.",
  },
  "screener-survey": {
    kind: "survey",
    title: "숙소 예약 경험 확인",
    view: "screener",
    cue: "연구 목적에 맞는 참여자를 모집하기 위해 최근 경험과 이용 환경을 확인합니다.",
  },
  "sensitive-personally-identifiable-information": {
    kind: "privacy",
    title: "연락처와 분석 기록 분리",
    view: "sensitive",
    cue: "분석 기록과 개인을 식별할 수 있는 연락 정보를 분리하고 접근 범위를 제한합니다.",
  },
  specialist: {
    kind: "role",
    title: "접근성 전문 검토",
    view: "specialist",
    cue: "특정 분야에 깊이 있는 역량을 적용해 문제 위치와 재현 조건까지 기록합니다.",
  },
  "sprint-brief": {
    kind: "brief",
    title: "첫 제출 개선 스프린트",
    view: "sprint",
    cue: "짧은 프로젝트를 시작할 때 팀이 공유할 문제·목표·범위·일정입니다.",
  },
  "statement-of-work": {
    kind: "business",
    title: "예약 화면 제작 · SOW",
    view: "sow",
    cue: "산출물에 더해 일정·책임·검수 조건을 합의하는 업무 명세입니다.",
  },
  surveys: {
    kind: "survey",
    title: "수업 자료 이용 경험",
    view: "survey",
    cue: "같은 질문을 여러 참여자에게 제시해 비교할 수 있는 응답을 수집합니다.",
  },
  "system-usability-scale-sus": {
    kind: "survey",
    title: "SUS · 사용성 설문 결과",
    view: "sus",
    cue: "10개 문항의 정해진 계산 결과입니다. 72점을 성공률 72%로 읽지 않습니다.",
  },
  "t-shaped-designer": {
    kind: "role",
    title: "넓은 이해와 깊은 전문성",
    view: "tshape",
    cue: "여러 영역의 협업 이해 위에 특정 분야의 깊은 전문성을 쌓은 역량 구조입니다.",
  },
  "user-interface-ui-designer": {
    kind: "role",
    title: "가입 화면 · 상태별 설계",
    view: "ui",
    cue: "UI 디자이너는 기본 모습뿐 아니라 입력·오류·완료 상태도 설계합니다.",
  },
  "user-story": {
    kind: "brief",
    title: "제출 내역 확인 · 유저 스토리",
    view: "story",
    cue: "누가 무엇을 왜 원하는지가 한 문장으로 드러납니다.",
  },
  "ux-designers": {
    kind: "role",
    title: "자료 탐색 구조 설계",
    view: "ux",
    cue: "사용자 목표에 맞게 정보 구조·행동 흐름을 설계하고 검증할 안을 만듭니다.",
  },
  "ux-engineers": {
    kind: "role",
    title: "컴포넌트 상태 구현",
    view: "uxengineer",
    cue: "설계한 상태와 접근성 동작을 재사용 가능한 UI 코드로 연결합니다.",
  },
  "ux-program-managers": {
    kind: "role",
    title: "UX 프로그램 일정",
    view: "program",
    cue: "연구·설계·평가의 의존 관계와 담당·다음 결정을 조율합니다.",
  },
  "ux-researchers": {
    kind: "role",
    title: "질문에서 근거까지",
    view: "researcher",
    cue: "조사 질문과 참여자 기준을 설계하고 행동·발언을 분석해 근거를 만듭니다.",
  },
  "ux-writers": {
    kind: "role",
    title: "첨부와 제출을 구분하는 문구",
    view: "writer",
    cue: "짧은 문구가 현재 상태와 다음 행동을 정확하게 알려 주는지 보세요.",
  },
  "value-proposition": {
    kind: "brief",
    title: "공방 예약의 가치 제안",
    view: "value",
    cue: "사용자가 겪는 문제와 제품이 제공할 유용한 가치를 연결합니다.",
  },
  "visual-designer": {
    kind: "role",
    title: "모래 · 비주얼 스타일",
    view: "visual",
    cue: "사진·서체·색·간격을 반복해서 적용할 표현 체계로 정리합니다.",
  },
  "vulnerable-populations": {
    kind: "survey",
    title: "학습 경험 연구 참여 안내",
    view: "recruitment",
    cue: "연구자와 참여자의 권력 관계를 살피고, 불이익 없이 거절할 수 있게 안내합니다.",
  },
  wcag: {
    kind: "review",
    title: "가입 화면 접근성 검토",
    view: "wcag",
    cue: "키보드·텍스트 대안·대비·오류 등 여러 기준으로 점검합니다. 이 화면은 적합성 인증 결과가 아닙니다.",
  },
  webaim: {
    kind: "review",
    title: "대비 계산과 사람의 검토",
    view: "webaim",
    cue: "WebAIM 같은 전문 자료·도구를 참고하되 자동 계산과 사람의 검토를 구분합니다.",
  },
} satisfies Record<string, SceneConfig>;

export const WORK_TERM_IDS = Object.keys(WORK_SCENES);
type Props = { config: SceneConfig; figure: LearningFigure };

function SmallTag({ children }: { children: ReactNode }) {
  return <span className="cw-tag">{children}</span>;
}
function Workspace({
  title,
  children,
  section = "프로젝트 문서",
}: {
  title: string;
  children: ReactNode;
  section?: string;
}) {
  return (
    <ContextFrame
      chrome="workspace"
      brand="도토리 WORKSPACE"
      label={`${title} 교육용 가상 작업 화면`}
    >
      <div className="cw-workspace">
        <aside className="cw-sidebar">
          <b>도토리 프로젝트</b>
          <span>개요</span>
          <span>리서치</span>
          <span className="cw-selected">{section}</span>
          <span>디자인</span>
          <span>전달 자료</span>
          <small>DESIGN / 04</small>
        </aside>
        <div className="cw-main">
          <div className="cw-toolbar">
            <span>
              <FileText size={14} /> {section} / {title}
            </span>
            <span>
              검토용 <ChevronDown size={13} />
            </span>
          </div>
          {children}
        </div>
      </div>
    </ContextFrame>
  );
}
function DocumentHeader({
  title,
  label = "PROJECT NOTE",
  sample = false,
}: {
  title: string;
  label?: string;
  sample?: boolean;
}) {
  return (
    <header className="cw-doc-header">
      <small>{label}</small>
      <h4>{title}</h4>
      <div className="cw-meta">
        <span>작성 · 디자인팀</span>
        <span>버전 1.0</span>
        {sample && <span>교육용 가상 기록</span>}
      </div>
    </header>
  );
}
function BriefScene({ config, figure }: Props) {
  const v = config.view;
  const statement = figure.items.map((x) => x.text.replace(/\.$/u, "")).join(". ") + ".";
  return (
    <Workspace title={config.title}>
      <div className="cw-paper">
        <DocumentHeader
          title={config.title}
          label={
            v === "sprint"
              ? "SPRINT BRIEF"
              : v === "story"
                ? "USER STORY / US-014"
                : "DESIGN DIRECTION"
          }
        />
        {v === "story" ? (
          <>
            <div className="cw-story-sentence">
              <span>사용자의 입장에서</span>
              <p>{statement}</p>
            </div>
            <div className="cw-acceptance">
              <b>함께 확인할 화면</b>
              <div className="cw-submission">
                <CheckCircle2 size={22} />
                <span>
                  <strong>과제가 제출되었어요</strong>
                  <small>portfolio.pdf · 오늘 14:32</small>
                </span>
                <span className="cw-outline-action">제출 내역</span>
              </div>
            </div>
          </>
        ) : v === "hypothesis" ? (
          <>
            <div className="cw-hypothesis">
              <span>IF · 변경한다면</span>
              <p>{figure.items[0]?.text}</p>
              <ArrowRight aria-hidden />
              <span>THEN · 기대하는 결과</span>
              <p>{figure.items[1]?.text}</p>
            </div>
            <div className="cw-evidence-strip">
              <b>확인 계획</b>
              <p>{figure.items[2]?.text}</p>
              <small>아직 검증하지 않은 가정</small>
            </div>
          </>
        ) : v === "pitch" ? (
          <>
            <div className="cw-pitch">
              <small>도토리 / ONE MINUTE INTRO</small>
              <h5>
                다음 수업에 필요한 것을
                <br />
                한곳에서.
              </h5>
              <p>
                {figure.items[0]?.text} {figure.items[1]?.text}
              </p>
            </div>
            <div className="cw-pitch-tags">
              <SmallTag>누구에게</SmallTag>
              <ArrowRight size={15} />
              <SmallTag>어떤 도움</SmallTag>
              <ArrowRight size={15} />
              <SmallTag>기억할 가치</SmallTag>
            </div>
          </>
        ) : v === "sprint" ? (
          <>
            <div className="cw-sprint-banner">
              <small>DESIGN SPRINT</small>
              <h5>
                첨부와 제출을
                <br />
                명확하게 구분하기
              </h5>
              <div className="cw-week">
                {["월 · 문제", "화 · 아이디어", "수 · 결정", "목 · 시안", "금 · 평가"].map((x) => (
                  <span key={x}>{x}</span>
                ))}
              </div>
            </div>
            <DocSections figure={figure} />
          </>
        ) : v === "framework" ? (
          <>
            <div className="cw-framework">
              {figure.items.map((item, i) => (
                <div key={item.label}>
                  <span>0{i + 1}</span>
                  <h5>{item.label}</h5>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
            <p className="cw-doc-footnote">같은 틀을 다른 사용자·상황에도 적용해 비교합니다.</p>
          </>
        ) : v === "value" || v === "product-goal" ? (
          <>
            <div className="cw-value-intro">
              <span className="cw-mark">D.</span>
              <small>{v === "value" ? "제품 가치 제안" : "프로덕트 목표 정의문"}</small>
              <h5>
                {v === "value"
                  ? "메시지를 오가지 않고,\n예약을 한곳에서."
                  : "용어를 읽고,\n화면에서 알아보는 경험."}
              </h5>
            </div>
            <DocSections figure={figure} />
          </>
        ) : (
          <>
            <div className="cw-memo-lead">
              <span>핵심 문장</span>
              <p>
                {v === "define" || v === "problem"
                  ? figure.items.at(-1)?.text
                  : figure.items[1]?.text}
              </p>
            </div>
            <DocSections figure={figure} />
          </>
        )}
      </div>
    </Workspace>
  );
}
function DocSections({ figure }: { figure: LearningFigure }) {
  return (
    <div className="cw-doc-sections">
      {figure.items.map((item, i) => (
        <section key={item.label}>
          <span className="cw-section-num">{String(i + 1).padStart(2, "0")}</span>
          <div>
            <h5>{item.label}</h5>
            <p>{item.text}</p>
            {item.detail && <small>{item.detail}</small>}
          </div>
        </section>
      ))}
    </div>
  );
}

function ResearchScene({ config, figure }: Props) {
  const v = config.view;
  return (
    <Workspace title={config.title} section="리서치 노트">
      <div className="cw-paper">
        <DocumentHeader
          title={config.title}
          label={v === "report" ? "RESEARCH REPORT / R-03" : "RESEARCH / STUDY 03"}
          sample
        />
        {v === "interview" ? (
          <>
            <div className="cw-recording">
              <span className="cw-recording-dot" />
              <b>P03 인터뷰</b>
              <span>12:08 / 24:00</span>
              <div className="cw-waveform" aria-hidden>
                {Array.from({ length: 18 }, (_, i) => (
                  <i key={i} style={{ height: 10 + ((i * 7) % 20) }} />
                ))}
              </div>
            </div>
            <div className="cw-transcript">
              {figure.items.slice(0, 3).map((x, i) => (
                <div key={x.label}>
                  <small>{["12:08 · 연구자", "12:26 · 연구자", "12:42 · 참여자 P03"][i]}</small>
                  <p>{x.text}</p>
                </div>
              ))}
            </div>
            <div className="cw-research-note">
              <b>기록 규칙</b>
              <p>{figure.items[3]?.text}</p>
            </div>
          </>
        ) : v === "notes" ? (
          <>
            <div className="cw-task-bar">
              <SmallTag>과업 02</SmallTag>
              <span>첨부한 파일을 제출해 주세요.</span>
            </div>
            <div className="cw-note-table">
              {figure.items.map((x, i) => (
                <div key={x.label}>
                  <span>{["02:14", "02:18", "연구자 메모"][i]}</span>
                  <strong>{x.label}</strong>
                  <p>{x.text}</p>
                </div>
              ))}
            </div>
            <p className="cw-doc-footnote">
              관찰 사실과 해석을 섞지 않아야 나중에 근거를 다시 확인할 수 있습니다.
            </p>
          </>
        ) : v === "insight" ? (
          <>
            <div className="cw-insight-evidence">
              <SmallTag>관찰 + 발언 · 가상 예시</SmallTag>
              <blockquote>
                “파일이 제대로 올라갔는지
                <br />
                다시 확인하고 싶었어요.”
              </blockquote>
              <small>P03 · 과제 제출 과업</small>
            </div>
            <div className="cw-insight-chain">
              {figure.items.map((x, i) => (
                <section key={x.label}>
                  <span>{i + 1}</span>
                  <div>
                    <h5>{x.label}</h5>
                    <p>{x.text}</p>
                  </div>
                </section>
              ))}
            </div>
          </>
        ) : v === "report" ? (
          <>
            <div className="cw-report-summary">
              <div>
                <small>가상 관찰 데이터</small>
                <strong>
                  4<span> / 6명</span>
                </strong>
                <p>파일 첨부를 제출 완료로 이해</p>
              </div>
              <div className="cw-person-dots" aria-label="6명 중 4명의 관찰 예시">
                {Array.from({ length: 6 }, (_, i) => (
                  <i key={i} data-active={i < 4} />
                ))}
              </div>
            </div>
            <DocSections figure={figure} />
            <div className="cw-research-note">
              <b>해석 범위</b>
              <p>소규모 과업 관찰 예시입니다. 전체 학생의 비율을 추정한 결과가 아닙니다.</p>
            </div>
          </>
        ) : v === "postlaunch" ? (
          <>
            <div className="cw-log-head">
              <Search size={18} />
              <strong>검색 결과 없음</strong>
              <span>후속 조사 필요</span>
            </div>
            <div className="cw-log-table">
              <div>
                <b>검색어</b>
                <b>관찰한 현상</b>
              </div>
              <div>
                <span>이번 주 준비물</span>
                <span>자료 분류와 표현이 다름</span>
              </div>
              <div>
                <span>제출 예시</span>
                <span>다른 메뉴에 자료 존재</span>
              </div>
            </div>
            <DocSections figure={figure} />
          </>
        ) : (
          <>
            <div className="cw-research-question">
              <small>
                {v === "discovery"
                  ? "아직 해결안을 정하지 않은 질문"
                  : "이번 연구에서 알고 싶은 것"}
              </small>
              <h5>{figure.items[0]?.text}</h5>
            </div>
            <div className="cw-research-plan">
              {figure.items.slice(1).map((x, i) => (
                <section key={x.label}>
                  <span className="cw-plan-icon">0{i + 1}</span>
                  <div>
                    <h5>{x.label}</h5>
                    <p>{x.text}</p>
                    {x.detail && <small>{x.detail}</small>}
                  </div>
                </section>
              ))}
            </div>
            <div className="cw-plan-status">
              <span>질문 정리</span>
              <ArrowRight size={14} />
              <span>자료 수집</span>
              <ArrowRight size={14} />
              <span>분석·설계에 활용</span>
            </div>
          </>
        )}
      </div>
    </Workspace>
  );
}

function SampleProduct({ type = "signup", pin = false }: { type?: string; pin?: boolean }) {
  const isBooking = type === "booking" || type === "schedule";
  const isUpload = type === "upload" || type === "upload-ambiguous";
  return (
    <div className={`cw-product cw-product-${type}`}>
      <div className="cw-product-nav">
        <b>{isBooking ? "틈새 STAY" : "도토리"}</b>
        <span>{isBooking ? "예약 확인" : "내 학습"}</span>
      </div>
      {isBooking && (
        <ContextPhoto
          asset="forest"
          alt="나무 사이로 햇빛이 들어오는 숲"
          className="cw-product-photo"
        />
      )}
      <div className="cw-product-body">
        <small>{isBooking ? "FOREST ROOM" : "PROJECT / 01"}</small>
        <h5>
          {isBooking
            ? "숲에 머무는 하루"
            : isUpload
              ? "포트폴리오 과제"
              : type === "save"
                ? "내 리서치 노트"
                : "학습 노트 시작하기"}
        </h5>
        {isBooking ? (
          <>
            {type === "schedule" && (
              <div className="cw-product-row">
                <span>예약 일정</span>
                <b>11월 15일 · 1박</b>
              </div>
            )}
            <div className="cw-product-row">
              <span>객실 1박</span>
              <b>120,000원</b>
            </div>
            <div className="cw-product-row">
              <span>인원</span>
              <span>성인 2명</span>
            </div>
            <div className="cw-price-focus">
              {type === "schedule" ? "동의 사항 확인 · 취소 조건 안내" : "총액 안내 위치"}
              {pin && type !== "schedule" && <b className="cw-pin">1</b>}
            </div>
            <span className="cw-action">
              예약 계속하기 <ArrowRight size={14} />
              {pin && type === "schedule" && <b className="cw-pin">1</b>}
            </span>
          </>
        ) : isUpload ? (
          <>
            <div className="cw-file-row">
              <FileText size={20} />
              <span>
                <b>portfolio.pdf</b>
                <small>{type === "upload-ambiguous" ? "완료" : "파일 첨부 완료"}</small>
              </span>
              <Check size={15} />
            </div>
            <div className="cw-upload-message">
              {type === "upload-ambiguous" ? (
                "완료되었습니다."
              ) : (
                <>
                  파일이 첨부됐어요.
                  <br />
                  제출 버튼을 눌러 마무리하세요.
                </>
              )}
              {pin && <b className="cw-pin">1</b>}
            </div>
            <span className="cw-action">과제 제출하기</span>
          </>
        ) : type === "save" ? (
          <>
            <div className="cw-note-editor">
              <small>오늘의 관찰</small>
              <p>자료를 찾는 기준은 강의 제목보다 이번 주의 과제였어요.</p>
              <p>다음 인터뷰에서 최근 탐색 경로를 물어볼 것.</p>
            </div>
            <span className="cw-action">저장{pin && <b className="cw-pin">1</b>}</span>
          </>
        ) : (
          <>
            <label className="cw-static-field">
              이메일<span>hello@example.com</span>
            </label>
            <label className="cw-static-field">
              비밀번호<span className="cw-password">••••••••••</span>
            </label>
            <p className="cw-field-help">8자 이상 입력해 주세요.</p>
            <span className="cw-action">무료로 시작하기{pin && <b className="cw-pin">1</b>}</span>
            <small className="cw-product-terms">학습용 화면 · 실제 가입 없음</small>
          </>
        )}
      </div>
    </div>
  );
}

function ReviewScene({ config, figure }: Props) {
  const v = config.view,
    audit = v === "wcag" || v === "webaim";
  return (
    <ContextFrame
      chrome="workspace"
      brand="ONJEOM / DESIGN REVIEW"
      label={`${config.title} 교육용 검토 화면`}
    >
      <div className="cw-review-toolbar">
        <span>
          <MessageSquare size={15} /> {config.title}
        </span>
        <SmallTag>{audit ? "검토 예시" : "의견 3개"}</SmallTag>
      </div>
      <div className="cw-review-layout">
        <div className="cw-review-canvas">
          <span className="cw-frame-name">
            {audit
              ? "가입 화면 / 기본 상태"
              : v === "reviewer" || v === "critique"
                ? "예약 화면 / 검토할 시안"
                : v === "feedback"
                  ? "노트 저장 / 검토할 시안"
                  : "제출 화면 / 검토할 시안"}
          </span>
          <SampleProduct
            type={
              audit
                ? "signup"
                : v === "reviewer"
                  ? "booking"
                  : v === "critique"
                    ? "schedule"
                    : v === "feedback"
                      ? "save"
                      : "upload-ambiguous"
            }
            pin
          />
          <small>
            {audit
              ? "화면과 검토 기록을 함께 확인합니다."
              : "번호 1과 연결된 의견을 오른쪽에서 확인하세요."}
          </small>
        </div>
        <aside className="cw-comments">
          <div className="cw-comments-header">
            {audit ? "접근성 검토 메모" : "디자인 검토"}
            <span className="cw-comment-avatar">지</span>
          </div>
          {v === "webaim" ? (
            <>
              <div className="cw-contrast-tool">
                <small>색상 대비 · 예시 값</small>
                <div className="cw-aa">Aa</div>
                <div>
                  <span>#222222</span>
                  <span>#FFFFFF</span>
                </div>
                <strong>15.91 : 1</strong>
                <small>텍스트와 배경의 대비 계산</small>
              </div>
              <p className="cw-comment-body">
                계산 결과만으로 전체 접근성을 판단하지 않습니다. 키보드 흐름과 의미 있는 이름도 따로
                확인합니다.
              </p>
            </>
          ) : (
            figure.items.map((x, i) => (
              <section className="cw-comment" key={x.label}>
                <div>
                  <span className="cw-comment-count">{i + 1}</span>
                  <b>{x.label}</b>
                  {audit && <span className="cw-audit-status">확인 항목</span>}
                </div>
                <p>{x.text}</p>
              </section>
            ))
          )}
          <div className="cw-comment-footer">
            {audit ? "자동 인증·전체 적합성 판정 아님" : "관찰 → 영향 → 제안 → 후속 확인"}
          </div>
        </aside>
      </div>
    </ContextFrame>
  );
}

function StaticChoices({ choices, selected = 0 }: { choices: string[]; selected?: number }) {
  return (
    <div className="cw-choices">
      {choices.map((x, i) => (
        <span key={x} className={i === selected ? "cw-choice cw-choice-selected" : "cw-choice"}>
          <i aria-hidden />
          {x}
        </span>
      ))}
    </div>
  );
}
function SurveyScene({ config, figure }: Props) {
  const v = config.view;
  return (
    <ContextFrame
      chrome="web"
      brand="도토리 RESEARCH"
      url="research.example/experience"
      label={`${config.title} 정적 설문 예시`}
    >
      <div className="cw-survey-site">
        <div className="cw-survey-masthead">
          <b>도토리</b>
          <span>사용자 경험 리서치</span>
        </div>
        <div className="cw-survey-sheet">
          <small>{v === "sus" ? "USABILITY / SAMPLE RESULT" : "참여 안내 · 교육용 예시"}</small>
          <h4>{config.title}</h4>
          <p className="cw-survey-intro">
            {v === "recruitment"
              ? "온라인 학습 경험을 듣고 개선할 부분을 찾고 있습니다."
              : v === "sus"
                ? "전반적인 사용성에 대한 응답을 정해진 방식으로 계산한 점수입니다."
                : "최근의 실제 경험을 기준으로 응답해 주세요."}
          </p>
          {v === "sus" ? (
            <>
              <div className="cw-sus-score">
                <span>참여자 평균 SUS 점수 · 가상 집계</span>
                <strong>
                  72<span>/ 100</span>
                </strong>
                <div className="cw-sus-scale">
                  <i />
                </div>
                <div>
                  <small>0</small>
                  <small>100</small>
                </div>
              </div>
              <div className="cw-sus-detail">
                <b>개인별 10개 문항 환산 → 참여자 평균</b>
                <p>
                  72점은 여러 참여자의 점수를 평균 낸 교육용 가상 집계입니다. 과업 성공률 72% 또는
                  72번째 백분위를 뜻하지 않습니다.
                </p>
              </div>
              <DocSections figure={figure} />
            </>
          ) : v === "recruitment" ? (
            <>
              <div className="cw-consent-notice">
                <ShieldCheck size={23} />
                <div>
                  <b>참여는 자유롭게 결정할 수 있어요.</b>
                  <p>참여하거나 거절해도 수업 평가에 영향을 주지 않습니다.</p>
                </div>
              </div>
              <section className="cw-survey-question">
                <h5>편한 연락 방법을 선택해 주세요.</h5>
                <StaticChoices
                  choices={["별도 연구 담당자에게 연락", "이번에는 참여하지 않음"]}
                  selected={1}
                />
                <p className="cw-field-help">거절 의사는 다른 수강생에게 공개하지 않습니다.</p>
              </section>
              <span className="cw-action">안내 확인</span>
              <div className="cw-survey-endnote">
                {figure.items[0]?.text}
                <br />
                관계에 따른 부담과 보호 방법을 함께 살펴보는 예시입니다.
              </div>
            </>
          ) : (
            <>
              <div className="cw-survey-progress">
                <i />
                <span>{v === "screener" ? "참여 조건 확인" : "3개 질문"}</span>
              </div>
              <section className="cw-survey-question">
                <span>01</span>
                <h5>
                  {v === "screener"
                    ? "최근 3개월 동안 숙소를 직접 예약한 적이 있나요?"
                    : "지난 7일 동안 수업 자료를 열어 본 적이 있나요?"}
                </h5>
                <StaticChoices choices={["네, 있습니다", "아니요, 없습니다"]} />
              </section>
              <section className="cw-survey-question">
                <span>02</span>
                <h5>
                  {v === "screener"
                    ? "예약할 때 주로 사용한 기기는 무엇인가요?"
                    : "지난 7일 동안 자료를 며칠 이용했나요?"}
                </h5>
                <StaticChoices
                  choices={
                    v === "screener"
                      ? ["스마트폰", "컴퓨터", "태블릿"]
                      : ["1–2일", "3–4일", "5–7일"]
                  }
                />
              </section>
              {v === "survey" && (
                <section className="cw-survey-question">
                  <span>03</span>
                  <h5>자료를 이용하며 어려웠던 점이 있다면 적어 주세요.</h5>
                  <div className="cw-textarea">
                    이번 주 자료를 찾을 때 공지와 자료실을 함께 확인했어요.
                  </div>
                </section>
              )}
              <span className="cw-action">
                {v === "screener" ? "참여 조건 확인하기" : "응답 제출하기"} <ArrowRight size={15} />
              </span>
              <p className="cw-survey-endnote">
                {v === "screener"
                  ? "응답과 연구 조건을 검토해 참여 후보를 구성합니다."
                  : "같은 질문으로 여러 사람의 경험을 수집합니다."}{" "}
                실제 응답을 전송하지 않는 정적 화면입니다.
              </p>
            </>
          )}
        </div>
      </div>
    </ContextFrame>
  );
}

function PrivacyScene({ config, figure }: Props) {
  const v = config.view;
  return (
    <Workspace title={config.title} section="연구 자료 관리">
      <div className="cw-paper">
        <DocumentHeader
          title={config.title}
          label={v === "nda" ? "CONFIDENTIAL / STRUCTURE EXAMPLE" : "RESEARCH DATA / SAMPLE"}
        />
        {v === "nda" ? (
          <>
            <div className="cw-document-stamp">
              <ShieldCheck size={20} />
              <b>프로젝트 내 제한 공유</b>
              <span>초안 · 구조 확인용</span>
            </div>
            <DocSections figure={figure} />
            <p className="cw-doc-footnote">
              내용을 그대로 계약에 사용하는 양식이 아닙니다. 어떤 항목을 확인하는지 보여 주는 학습용
              예시입니다.
            </p>
          </>
        ) : (
          <>
            <div className="cw-data-split">
              <section>
                <div className="cw-data-header">
                  <ShieldCheck size={18} />
                  <b>{v === "sensitive" ? "제한된 연락 기록" : "식별 정보 포함 기록"}</b>
                </div>
                <dl>
                  <div>
                    <dt>참여자</dt>
                    <dd>P03</dd>
                  </div>
                  <div>
                    <dt>이름</dt>
                    <dd>
                      <span className="cw-redacted">가상 참여자</span>
                    </dd>
                  </div>
                  <div>
                    <dt>이메일</dt>
                    <dd>
                      <span className="cw-redacted">participant@example.com</span>
                    </dd>
                  </div>
                  <div>
                    <dt>접근 권한</dt>
                    <dd>연구 연락 담당자</dd>
                  </div>
                </dl>
              </section>
              <section className="cw-safe-data">
                <div className="cw-data-header">
                  <FileText size={18} />
                  <b>팀 분석용 기록</b>
                </div>
                <dl>
                  <div>
                    <dt>참여자 코드</dt>
                    <dd>P03</dd>
                  </div>
                  <div>
                    <dt>과업</dt>
                    <dd>제출 내역 확인</dd>
                  </div>
                  <div>
                    <dt>관찰</dt>
                    <dd>완료 후 파일 목록을 다시 열었음</dd>
                  </div>
                </dl>
                <span className="cw-safe-note">개인 연락 정보는 이 문서에 없음</span>
              </section>
            </div>
            {v === "sensitive" && (
              <div className="cw-sensitive-decisions">
                <h5>민감한 정보 · 수집 필요성부터 검토</h5>
                <div>
                  <strong>건강 정보</strong>
                  <span>이 연구에서는 수집하지 않음</span>
                </div>
                <div>
                  <strong>재정 정보</strong>
                  <span>연구 목적상 불필요</span>
                </div>
                <p>식별 가능성에 더해, 정보가 드러났을 때의 영향을 함께 살핍니다.</p>
              </div>
            )}
            <DocSections figure={figure} />
          </>
        )}
      </div>
    </Workspace>
  );
}

function BusinessScene({ config, figure }: Props) {
  const v = config.view;
  return (
    <ContextFrame
      chrome={v === "freelance" ? "workspace" : "document"}
      brand="ONJEOM STUDIO"
      label={`${config.title} 교육용 문서 예시`}
    >
      <div className="cw-business">
        <div className="cw-business-letterhead">
          <b>{v === "freelance" ? "YOON DESIGN" : "ONJEOM."}</b>
          <span>
            {v === "estimate"
              ? "ESTIMATE / 004"
              : v === "sow"
                ? "STATEMENT OF WORK"
                : "PROJECT DOCUMENT"}
          </span>
        </div>
        <DocumentHeader title={config.title} label="모래 책방 × 디자인 스튜디오" />
        {v === "estimate" ? (
          <>
            <div className="cw-estimate-table">
              <div>
                <b>작업 항목</b>
                <b>예상 금액</b>
              </div>
              <div>
                <span>소개·목록·상세 화면 설계</span>
                <span>2,400,000원</span>
              </div>
              <div>
                <span>콘텐츠 자료 정리</span>
                <span>600,000원</span>
              </div>
              <div className="cw-estimate-total">
                <strong>예상 합계</strong>
                <strong>3,000,000원</strong>
              </div>
            </div>
            <p className="cw-doc-footnote">교육용 가상 금액 · 실제 서비스 견적이 아닙니다.</p>
            <div className="cw-business-conditions">
              {figure.items.slice(2).map((x) => (
                <section key={x.label}>
                  <b>{x.label}</b>
                  <p>{x.text}</p>
                </section>
              ))}
            </div>
          </>
        ) : v === "scope" ? (
          <>
            <div className="cw-scope-columns">
              <section>
                <span className="cw-scope-in">IN SCOPE</span>
                <h5>이번에 만드는 것</h5>
                <p>{figure.items[0]?.text}</p>
                <p>{figure.items[1]?.text}</p>
              </section>
              <section>
                <span className="cw-scope-out">OUT OF SCOPE</span>
                <h5>이번 범위에 없는 것</h5>
                <p>{figure.items[2]?.text}</p>
              </section>
            </div>
            <div className="cw-research-note">
              <b>범위가 바뀐다면</b>
              <p>{figure.items[3]?.text}</p>
            </div>
          </>
        ) : v === "sow" ? (
          <>
            <div className="cw-sow-table">
              {figure.items.map((x, i) => (
                <div key={x.label}>
                  <b>{x.label}</b>
                  <p>{x.text}</p>
                  <span>{["설계팀", "공동 합의", "팀 A / 팀 B", "검토 담당자"][i]}</span>
                </div>
              ))}
            </div>
            <div className="cw-acceptance-check">
              <CheckCircle2 size={18} />
              <span>검수 기준을 먼저 확인하고 제작합니다.</span>
            </div>
          </>
        ) : v === "freelance" ? (
          <>
            <div className="cw-client-strip">
              <span className="cw-avatar">윤</span>
              <div>
                <strong>독립 디자이너 윤</strong>
                <small>클라이언트 · 모래 책방</small>
              </div>
              <SmallTag>프로젝트 단위 계약</SmallTag>
            </div>
            <div className="cw-kanban">
              {figure.items.map((x, i) => (
                <section key={x.label}>
                  <h5>{["합의", "제작", "검토·납품"][i]}</h5>
                  <div>
                    <b>{x.label}</b>
                    <p>{x.text}</p>
                    <small>{["범위와 일정 확인", "독립적으로 작업", "승인된 자료 전달"][i]}</small>
                  </div>
                </section>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="cw-proposal-cover">
              <h5>
                작업의 방향부터
                <br />
                전달하는 방법까지.
              </h5>
              <p>포트폴리오 웹사이트 제작 제안</p>
              <span>PROPOSAL / 01</span>
            </div>
            <DocSections figure={figure} />
          </>
        )}
      </div>
    </ContextFrame>
  );
}

function CareerScene({ config, figure }: Props) {
  const v = config.view;
  return (
    <ContextFrame
      chrome="web"
      brand={v === "statement" ? "JIAN / PORTFOLIO" : "ONJEOM / CAREERS"}
      url={v === "statement" ? "jian.example/about" : "onjeom.example/careers"}
      label={`${config.title} 교육용 채용·포트폴리오 화면`}
    >
      <div className="cw-career">
        <div className="cw-career-nav">
          <b>{v === "statement" ? "JIAN LEE" : "ONJEOM."}</b>
          <span>{v === "statement" ? "WORK / ABOUT" : "STUDIO / CAREERS"}</span>
        </div>
        {v === "statement" ? (
          <>
            <div className="cw-about">
              <div className="cw-monogram">
                JL<span>UI DESIGNER</span>
              </div>
              <div>
                <small>ABOUT ME</small>
                <h4>
                  복잡한 정보를
                  <br />
                  명료한 경험으로.
                </h4>
                <p>{figure.items[0]?.text}</p>
              </div>
            </div>
            <div className="cw-career-sections">
              {figure.items.slice(1).map((x) => (
                <section key={x.label}>
                  <h5>{x.label}</h5>
                  <p>{x.text}</p>
                </section>
              ))}
            </div>
          </>
        ) : v === "first" || v === "panel" ? (
          <>
            <div className="cw-interview-title">
              <small>INTERVIEW INVITATION</small>
              <h4>{config.title}</h4>
              <p>시간과 대화의 목적을 미리 확인해 주세요.</p>
            </div>
            <div className="cw-interview-meta">
              <span>온라인 · 45분</span>
              <span>가상 회사의 예시 일정</span>
            </div>
            {v === "panel" && (
              <div className="cw-panel-people">
                {["디자인", "개발", "프로덕트"].map((x, i) => (
                  <div key={x}>
                    <span>{["지", "준", "서"][i]}</span>
                    <b>{x} 면접관</b>
                  </div>
                ))}
              </div>
            )}
            <DocSections figure={figure} />
          </>
        ) : (
          <>
            <div className="cw-job-header">
              <SmallTag>DESIGN / JUNIOR</SmallTag>
              <h4>{config.title}</h4>
              <p>사용자의 일을 이해하고, 팀과 함께 더 명확한 화면을 만듭니다.</p>
              <div>
                <span>서울</span>
                <span>프로덕트 디자인팀</span>
              </div>
            </div>
            {v === "keywords" ? (
              <div className="cw-keyword-list">
                {figure.items.map((x) => (
                  <section key={x.label}>
                    <mark>{x.label}</mark>
                    <p>{x.text}</p>
                    <small>포트폴리오에서 보여 줄 관련 작업을 찾아보세요.</small>
                  </section>
                ))}
              </div>
            ) : (
              <DocSections figure={figure} />
            )}
            <div className="cw-job-footer">
              <span>포트폴리오와 설계 과정을 함께 봅니다.</span>
              <span className="cw-outline-action">지원 안내</span>
            </div>
          </>
        )}
      </div>
    </ContextFrame>
  );
}

function RoleScene({ config, figure }: Props) {
  const v = config.view;
  const code = v === "frontend" || v === "backend" || v === "uxengineer";
  return (
    <ContextFrame
      chrome="workspace"
      brand="ONJEOM / PROJECT STUDIO"
      label={`${config.title} 디자이너 역할의 작업 예시`}
    >
      <div className="cw-role-toolbar">
        <span>PROJECT · 도토리</span>
        <b>{config.title}</b>
        <SmallTag>작업의 한 장면</SmallTag>
      </div>
      {code ? (
        <div className="cw-code-workspace">
          <div className="cw-code-panel">
            <div>
              <Code2 size={15} />
              {v === "backend"
                ? "bookmarks.ts / SERVER"
                : v === "frontend"
                  ? "ResourceCard.tsx"
                  : "Button.tsx / STATES"}
            </div>
            <pre>
              <code>
                {v === "backend"
                  ? "POST /api/bookmarks\n\n1  사용자 인증 확인\n2  자료 접근 권한 확인\n3  책갈피 데이터 저장\n4  결과 응답 반환\n\n201  { saved: true }"
                  : v === "frontend"
                    ? '<ResourceCard\n  title="인터뷰 질문 가이드"\n  state="loaded"\n  onOpen={showDetail}\n/>\n\nloading → loaded / error'
                    : '<Button\n  state="loading"\n  aria-busy="true"\n>\n  저장 중…\n</Button>\n\n기본 · 로딩 · 오류 · 완료'}
              </code>
            </pre>
            <small>개념을 설명하는 의사 코드 · 실행 코드 아님</small>
          </div>
          <div className="cw-code-preview">
            <small>{v === "backend" ? "응답을 받은 화면" : "브라우저 미리보기"}</small>
            <div className="cw-resource-card">
              <ContextPhoto asset="forest" alt="숲의 나무와 햇빛" />
              <div>
                <span>RESEARCH / GUIDE</span>
                <h5>인터뷰 질문 가이드</h5>
                <p>질문에서 사용자의 경험을 발견하기</p>
                <span className="cw-resource-state">
                  {v === "backend"
                    ? "✓ 책갈피에 저장됨"
                    : v === "uxengineer"
                      ? "저장 중…"
                      : "가이드 열기 →"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : v === "program" ? (
        <div className="cw-program">
          <div className="cw-program-head">
            <h5>리서치 결과 공유 후 화면 검토</h5>
            <span>의존 관계가 있는 업무</span>
          </div>
          <div className="cw-schedule-grid">
            <div>
              <b>작업 / 담당</b>
              <b>1주</b>
              <b>2주</b>
              <b>3주</b>
            </div>
            {["연구 / 민서", "화면 설계 / 지안", "사용성 평가 / 준"].map((x, i) => (
              <div key={x}>
                <span>{x}</span>
                {[0, 1, 2].map((j) => (
                  <span key={j} className={i === j ? "cw-schedule-active" : ""}>
                    {i === j ? ["결과 공유", "설계 검토", "평가·결정"][i] : ""}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="cw-role-notes">
            {figure.items.map((x) => (
              <p key={x.label}>
                <b>{x.label}</b>
                {x.text}
              </p>
            ))}
          </div>
        </div>
      ) : v === "visual" || v === "production" ? (
        <div className="cw-style-work">
          <div className="cw-style-spec">
            <span className="cw-spec-label">
              {v === "visual" ? "VISUAL SYSTEM" : "HANDOFF / ASSETS"}
            </span>
            <h5>모래</h5>
            <p>고요한 시간, 선명한 이야기.</p>
            <div className="cw-swatch-row">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="cw-type-spec">
              <b>Aa 가</b>
              <span>
                제목 / 본문 / 안내
                <br />
                타이포그래피 역할
              </span>
            </div>
            {v === "production" && (
              <div className="cw-asset-table">
                <span>icon / search.svg</span>
                <span>24 × 24</span>
                <span>button / primary</span>
                <span>기본·로딩·비활성</span>
              </div>
            )}
          </div>
          <div className="cw-style-preview">
            <ContextPhoto asset="coast" alt="푸른 바다와 해안 풍경" />
            <div>
              <small>MORAE JOURNAL</small>
              <h5>잠시, 머물러 읽기.</h5>
              <p>자연과 일상을 기록한 새로운 이야기</p>
              <span className="cw-outline-action">이야기 읽기 →</span>
            </div>
          </div>
        </div>
      ) : v === "writer" || v === "ui" || v === "product" || v === "specialist" ? (
        <div className="cw-role-product">
          <SampleProduct type={v === "writer" ? "upload" : "signup"} />
          <div className="cw-role-spec">
            <span className="cw-spec-label">
              {v === "writer"
                ? "CONTENT DESIGN"
                : v === "ui"
                  ? "COMPONENT STATES"
                  : v === "specialist"
                    ? "ACCESSIBILITY REVIEW"
                    : "PRODUCT DECISION"}
            </span>
            {v === "ui" && (
              <div className="cw-input-states">
                <span>
                  기본<span className="cw-default-input">이메일을 입력해 주세요</span>
                </span>
                <span>
                  오류<span className="cw-error-input">hello.example.com</span>
                  <small>이메일에 @를 포함해 주세요.</small>
                </span>
              </div>
            )}
            {figure.items.map((x) => (
              <section key={x.label}>
                <h5>{x.label}</h5>
                <p>{x.text}</p>
              </section>
            ))}
          </div>
        </div>
      ) : v === "campaign" ? (
        <div className="cw-campaign">
          <div className="cw-campaign-poster">
            <small>REFILL EVERYDAY</small>
            <h5>
              리필을 시작하는
              <br />
              하루.
            </h5>
            <div className="cw-bottle" aria-hidden>
              <span>
                REFILL
                <br />
                01
              </span>
            </div>
            <span>담아 쓰는 생활의 변화</span>
          </div>
          <div className="cw-campaign-output">
            <small>WEB / SOCIAL</small>
            <div className="cw-campaign-banner">
              <b>
                새로 사기 전에,
                <br />
                다시 채우기.
              </b>
              <span>리필 알아보기 →</span>
            </div>
            <DocSections figure={figure} />
          </div>
        </div>
      ) : v === "facilitation" || v === "presenter" ? (
        <div className="cw-meeting">
          <div className="cw-slide">
            <span>{v === "presenter" ? "DESIGN REVIEW / 01" : "WORKSHOP / CHECK IN"}</span>
            <h5>
              {v === "presenter"
                ? "무엇이 완료되었는지,\n같은 뜻으로 읽히나요?"
                : "모든 의견을 먼저,\n판단은 그다음에."}
            </h5>
            <div className="cw-meeting-comparison">
              <span>파일 첨부 완료</span>
              <ArrowRight />
              <span>과제 제출 완료</span>
            </div>
          </div>
          <aside>
            <h5>{v === "presenter" ? "발표자 노트" : "진행자 노트"}</h5>
            {figure.items.map((x) => (
              <section key={x.label}>
                <b>{x.label}</b>
                <p>{x.text}</p>
              </section>
            ))}
          </aside>
        </div>
      ) : v === "generalist" || v === "tshape" ? (
        <div className="cw-skills-work">
          <div className={`cw-skill-map ${v === "tshape" ? "cw-t-map" : ""}`}>
            <div>
              {["리서치", "정보 구조", "비주얼", "개발 협업"].map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
            {v === "tshape" ? (
              <section>
                <strong>정보 구조 · 탐색 설계</strong>
                <p>분류 → 연결 → 탐색 → 검증</p>
                <small>깊이 수행하는 전문 영역</small>
              </section>
            ) : (
              <section>
                <strong>여러 영역을 함께 수행</strong>
                <p>인터뷰 기록 + 화면 시안 + 평가 결과</p>
              </section>
            )}
          </div>
          <div className="cw-role-notes">
            {figure.items.map((x) => (
              <p key={x.label}>
                <b>{x.label}</b>
                {x.text}
              </p>
            ))}
          </div>
        </div>
      ) : v === "ux" || v === "researcher" ? (
        <div className="cw-ux-board">
          <div className="cw-ux-board-title">
            <Search size={16} />
            <span>{v === "ux" ? "자료 탐색 흐름 / 안 02" : "관찰 기록 → 분석 → 설계 근거"}</span>
          </div>
          <div className="cw-flow-row">
            {(v === "ux"
              ? ["전체 수업", "회차 상세", "자료 목록", "자료 열기"]
              : ["연구 질문", "관찰·발언", "패턴·예외", "결과·한계"]
            ).map((x, i) => (
              <div key={x}>
                <span>0{i + 1}</span>
                <strong>{x}</strong>
                {i < 3 && <ArrowRight size={16} />}
              </div>
            ))}
          </div>
          <div className="cw-research-cards">
            {figure.items.map((x) => (
              <section key={x.label}>
                <SmallTag>{x.label}</SmallTag>
                <p>{x.text}</p>
              </section>
            ))}
          </div>
        </div>
      ) : (
        <div className="cw-agency">
          <header>
            <small>CLIENT PROJECT / 014</small>
            <h5>
              예약의 시작부터
              <br />
              방문하는 순간까지.
            </h5>
            <p>온점 디자인 스튜디오 × 모래 전시</p>
          </header>
          <div>
            <SampleProduct type="booking" />
          </div>
          <footer>
            {figure.items.map((x) => (
              <section key={x.label}>
                <b>{x.label}</b>
                <p>{x.text}</p>
              </section>
            ))}
          </footer>
        </div>
      )}
      {![
        "program",
        "generalist",
        "tshape",
        "product",
        "ui",
        "writer",
        "specialist",
        "facilitation",
        "presenter",
        "ux",
        "researcher",
        "agency",
        "campaign",
      ].includes(v) && (
        <div className="cw-role-caption">
          {figure.items.map((x) => (
            <p key={x.label}>
              <b>{x.label}</b>
              {x.text}
            </p>
          ))}
        </div>
      )}
    </ContextFrame>
  );
}

function ArticleScene() {
  return (
    <ContextFrame chrome="web" brand="MORAE JOURNAL" url="morae.example/journal/contrast">
      <div className="cw-article">
        <nav>
          모래 저널 <span>디자인 노트 / 접근성</span>
        </nav>
        <div className="cw-article-columns">
          <article>
            <div className="cw-heading-label">H1 · 문서의 대표 제목</div>
            <h4>색상 대비의 기초</h4>
            <p>텍스트와 배경의 대비는 내용을 구분하고 읽는 데 영향을 줍니다.</p>
            <div className="cw-heading-label">H2 · 큰 주제</div>
            <h5>명도 대비 확인하기</h5>
            <p>같은 배경에서도 글자색에 따라 읽는 경험이 달라집니다.</p>
            <div className="cw-heading-label">H3 · 세부 주제</div>
            <h6>일반 텍스트의 예</h6>
            <div className="cw-article-example">
              읽기 쉬운 내용을
              <br />
              <strong>명확한 제목 구조와 함께.</strong>
            </div>
          </article>
          <aside>
            <strong>이 글의 구조</strong>
            <span>색상 대비의 기초</span>
            <span>↳ 명도 대비 확인하기</span>
            <span className="cw-outline-nested">↳ 일반 텍스트의 예</span>
            <small>시각적 크기와 함께 제목의 의미 계층을 설계합니다.</small>
          </aside>
        </div>
      </div>
    </ContextFrame>
  );
}
function LiteracyScene() {
  return (
    <Workspace title="자료 비교 노트" section="참고 자료">
      <div className="cw-paper">
        <DocumentHeader title="발견한 정보를 바로 믿기 전에" label="SOURCE REVIEW" />
        <div className="cw-source-result">
          <Search size={18} />
          <span>디자인 시스템 문서 작성</span>
        </div>
        <div className="cw-source-row">
          <span className="cw-source-icon">A</span>
          <div>
            <b>공식 문서 · 컴포넌트 사용 지침</b>
            <p>작성자·업데이트 날짜·설명 근거 확인 가능</p>
            <span>제공한 코드와 예시의 사용 조건 확인</span>
          </div>
          <SmallTag>원문 확인</SmallTag>
        </div>
        <div className="cw-source-row">
          <span className="cw-source-icon">B</span>
          <div>
            <b>날짜가 없는 짧은 요약</b>
            <p>출처가 불분명한 수치와 단정적 주장 포함</p>
            <span>원래 근거를 찾기 전에는 인용 보류</span>
          </div>
          <SmallTag>추가 확인</SmallTag>
        </div>
        <div className="cw-research-note">
          <b>나의 정리 노트</b>
          <p>확인한 내용만 요약하고 원문 출처와 사용 조건을 함께 남깁니다.</p>
        </div>
      </div>
    </Workspace>
  );
}

export function WorkScenes({ termId, figure }: { termId: string; figure: LearningFigure }) {
  const config = WORK_SCENES[termId as keyof typeof WORK_SCENES];
  if (!config) return null;
  let scene: ReactNode;
  switch (config.kind) {
    case "brief":
      scene = <BriefScene config={config} figure={figure} />;
      break;
    case "research":
      scene = <ResearchScene config={config} figure={figure} />;
      break;
    case "review":
      scene = <ReviewScene config={config} figure={figure} />;
      break;
    case "survey":
      scene = <SurveyScene config={config} figure={figure} />;
      break;
    case "privacy":
      scene = <PrivacyScene config={config} figure={figure} />;
      break;
    case "business":
      scene = <BusinessScene config={config} figure={figure} />;
      break;
    case "career":
      scene = <CareerScene config={config} figure={figure} />;
      break;
    case "role":
      scene = <RoleScene config={config} figure={figure} />;
      break;
    case "article":
      scene = <ArticleScene />;
      break;
    case "literacy":
      scene = <LiteracyScene />;
      break;
  }
  return (
    <div className="cw-scene" data-context-term={termId} data-work-view={config.view}>
      {scene}
      <ContextCallout number={1}>{config.cue}</ContextCallout>
    </div>
  );
}
