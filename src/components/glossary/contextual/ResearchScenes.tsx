import type { CSSProperties, ReactNode } from "react";
import {
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  Headphones,
  MessageSquare,
  Mic,
  Monitor,
  MousePointer2,
  Pause,
  Play,
  Search,
  Smartphone,
  Volume2,
} from "lucide-react";
import type { LearningFigure } from "@/data/learning/types";
import { ContextFrame, ContextPhoto, ContextCallout } from "./ContextFrame";
import "./research-scenes.css";

type SceneKind =
  | "bias"
  | "metrics"
  | "matrix"
  | "story"
  | "device"
  | "inclusion"
  | "flow"
  | "session"
  | "presentation"
  | "network"
  | "matrix-navigation"
  | "company"
  | "measurement"
  | "gesture";
const SCENES: Record<string, SceneKind> = {
  bias: "bias",
  "big-picture-storyboard": "story",
  "close-up-storyboard": "story",
  "competitive-audit": "matrix",
  complementary: "device",
  "confirmation-bias": "bias",
  continuity: "device",
  "conversion-rate": "metrics",
  corporation: "company",
  "curb-cut-effect": "inclusion",
  "direct-competitors": "matrix",
  dopamine: "measurement",
  empathize: "session",
  empathy: "bias",
  equality: "inclusion",
  "equity-focused-design": "inclusion",
  "false-consensus-bias": "bias",
  "friendliness-bias": "bias",
  gesture: "gesture",
  "implicit-bias": "bias",
  "impostor-syndrome": "bias",
  "inclusive-design": "inclusion",
  "indirect-competitors": "matrix",
  "interaction-designers": "flow",
  iterate: "flow",
  "key-performance-indicators-kpis": "metrics",
  "low-fidelity-prototypes": "story",
  "matrix-model": "matrix-navigation",
  networking: "network",
  presentation: "presentation",
  "primacy-bias": "bias",
  "primary-research": "session",
  "project-stakeholders": "matrix",
  "quantitative-research": "metrics",
  "representative-sample": "metrics",
  "secondary-research": "matrix",
  "serial-position-effect": "metrics",
  "social-desirability-bias": "bias",
  "spreadsheet-note-taking": "matrix",
  storyboard: "story",
  "sunk-cost-fallacy": "bias",
  "the-human-factor": "inclusion",
  "time-on-task": "matrix",
  "usability-study": "session",
  "use-of-navigation-vs-search": "metrics",
  "user-error-rates": "metrics",
  "user-flow": "flow",
  "user-centered-design": "flow",
  "web-content-accessibility-guidelines-wcag": "matrix",
};

export const RESEARCH_TERM_IDS = Object.keys(SCENES);
type Props = { termId: string; figure: LearningFigure };

function Workspace({
  title,
  section,
  children,
}: {
  title: string;
  section: string;
  children: ReactNode;
}) {
  return (
    <ContextFrame brand="FIELDNOTES" chrome="workspace" label="가상의 디자인 리서치 워크스페이스">
      <div className="cr-workspace">
        <div className="cr-workspace-nav">
          <span className="cr-logo-mark">f.</span>
          <span>리서치</span>
          <ChevronRight size={13} />
          <strong>{section}</strong>
          <span className="cr-sample">교육용 가상 기록</span>
        </div>
        <div className="cr-workspace-heading">
          <div>
            <span className="cr-eyebrow">PROJECT 04 / DESIGN RESEARCH</span>
            <h4>{title}</h4>
          </div>
          <span className="cr-avatar-stack" aria-label="예시 팀원">
            <i>수</i>
            <i>지</i>
            <i>민</i>
          </span>
        </div>
        {children}
      </div>
    </ContextFrame>
  );
}

function BookingScreen({
  compact = false,
  selected = false,
}: {
  compact?: boolean;
  selected?: boolean;
}) {
  return (
    <div className={`cr-booking ${compact ? "cr-booking-compact" : ""}`}>
      <div className="cr-product-nav">
        <b>모래.</b>
        <span>모임 찾기</span>
        <Search size={15} />
      </div>
      <ContextPhoto asset="forest" alt="푸른 숲의 산책길" className="cr-booking-photo" />
      <div className="cr-booking-copy">
        <span className="cr-eyebrow">BOOK CLUB / SEOUL</span>
        <h5>일요일, 숲과 책</h5>
        <p>같이 읽고 천천히 걸어요.</p>
        <div className="cr-booking-details">
          <span>11월 15일 · 14:00</span>
          <strong>20,000원</strong>
        </div>
        <div className={selected ? "cr-highlight cr-booking-policy" : "cr-booking-policy"}>
          일정 변경은 시작 24시간 전까지 가능해요.
        </div>
        <span className="cr-action">
          모임 예약하기 <ArrowRight size={14} />
        </span>
      </div>
    </div>
  );
}

const BIAS_CONFIG: Record<
  string,
  { tab: string; cue: string; tag: string; emphasis: number; question: string }
> = {
  bias: {
    tab: "질문지 검토",
    cue: "‘쉬운’, ‘마음에 드시죠’가 답의 방향을 먼저 정합니다.",
    tag: "질문 문구",
    emphasis: 0,
    question: "예약 과정에서 어떤 정보를 찾으셨나요?",
  },
  "confirmation-bias": {
    tab: "근거 검토",
    cue: "맞는 말만 옮기면 반대되는 관찰이 사라집니다.",
    tag: "선택된 근거",
    emphasis: 1,
    question: "가설과 맞지 않는 기록도 함께 검토했나요?",
  },
  empathy: {
    tab: "사용 맥락",
    cue: "예약을 망설이는 상황을 이해하려고 묻습니다.",
    tag: "더 이해할 점",
    emphasis: 0,
    question: "일정이 달라질까 걱정된다고 하셨는데, 어떤 상황인가요?",
  },
  "false-consensus-bias": {
    tab: "팀 가정 검토",
    cue: "나에게 익숙한 아이콘이 모두에게 익숙한 것은 아닙니다.",
    tag: "확인되지 않은 가정",
    emphasis: 1,
    question: "이 아이콘을 누르면 무엇이 일어날 것 같나요?",
  },
  "friendliness-bias": {
    tab: "발언과 행동",
    cue: "친절한 평가와 실제 과업 수행 기록을 함께 봅니다.",
    tag: "놓치지 않을 관찰",
    emphasis: 1,
    question: "메뉴를 찾을 때 무엇을 먼저 살펴보셨나요?",
  },
  "implicit-bias": {
    tab: "가정 점검",
    cue: "연령만으로 능력과 경험을 미리 판단한 부분입니다.",
    tag: "고정된 가정",
    emphasis: 0,
    question: "예약 경험과 기기 사용 경험을 사람별로 확인했나요?",
  },
  "impostor-syndrome": {
    tab: "작업 회고",
    cue: "성과의 근거와 스스로 붙인 해석이 다릅니다.",
    tag: "자기 해석",
    emphasis: 1,
    question: "내가 한 구체적 작업과 받은 피드백을 따로 기록해 보세요.",
  },
  "primacy-bias": {
    tab: "전체 기록 검토",
    cue: "처음 들은 의견이 이후의 근거보다 크게 남았습니다.",
    tag: "앞선 정보의 영향",
    emphasis: 2,
    question: "참여 순서와 무관하게 같은 기준으로 기록을 비교했나요?",
  },
  "social-desirability-bias": {
    tab: "발언과 행동",
    cue: "좋게 보이는 답과 관찰된 행동 사이의 차이를 확인합니다.",
    tag: "응답 맥락 확인",
    emphasis: 0,
    question: "이번에는 안내문을 지나가셨는데, 그때 어떤 상황이었나요?",
  },
  "sunk-cost-fallacy": {
    tab: "의사결정 기록",
    cue: "이미 쓴 시간은 앞으로 얻을 가치와 별도입니다.",
    tag: "회수할 수 없는 비용",
    emphasis: 0,
    question: "지금부터의 효과와 수정·중단 비용은 각각 어떤가요?",
  },
};

function BiasContextScreen({ termId }: { termId: string }) {
  if (termId === "false-consensus-bias")
    return (
      <div className="cr-bias-canvas">
        <div className="cr-product-nav">
          <b>도토리</b>
          <Bookmark size={20} />
        </div>
        <ContextPhoto asset="coast" alt="책 소개의 해안 표지 사진" className="cr-booking-photo" />
        <div className="cr-bias-canvas-body">
          <h5>조용히 머무는 시간</h5>
          <p>읽고 싶은 책의 내용을 살펴봅니다.</p>
          <div className="cr-icon-inspection">
            <Bookmark size={27} />
            <span>
              이 아이콘의 의미를
              <br />
              모두 알 것이라고 가정했나요?
            </span>
          </div>
          <span className="cr-screen-caption">관찰 질문: 누르면 무엇이 일어날까요?</span>
        </div>
      </div>
    );
  if (termId === "implicit-bias")
    return (
      <div className="cr-bias-canvas">
        <div className="cr-product-nav">
          <b>FIELDNOTES</b>
          <span>모집 기록</span>
        </div>
        <div className="cr-bias-canvas-body">
          <span className="cr-eyebrow">가상 참여자 · 실제 개인정보 아님</span>
          <h5>연령과 경험을 나눠 보기</h5>
          <div className="cr-recruit-row">
            <b>P01 · 68세</b>
            <span>모바일 예약을 자주 이용</span>
          </div>
          <div className="cr-recruit-row">
            <b>P02 · 64세</b>
            <span>전화 예약에 익숙함</span>
          </div>
          <div className="cr-recruit-row">
            <b>P03 · 32세</b>
            <span>해당 서비스는 처음 이용</span>
          </div>
          <p>같은 연령대에서도 경험은 다릅니다.</p>
        </div>
      </div>
    );
  if (termId === "sunk-cost-fallacy")
    return (
      <div className="cr-bias-canvas">
        <div className="cr-product-nav">
          <b>도토리</b>
          <span>수업 영상</span>
        </div>
        <div className="cr-autoplay-video">
          <ContextPhoto asset="coast" alt="수업 영상의 표지" />
          <Pause size={30} />
          <strong>다음 수업 자동 재생</strong>
        </div>
        <div className="cr-bias-canvas-body">
          <span className="cr-eyebrow">기능 검토 기록</span>
          <h5>자동 재생 기능</h5>
          <div className="cr-recruit-row">
            <b>이미 투입한 시간</b>
            <span>3주 · 회수할 수 없는 비용</span>
          </div>
          <div className="cr-recruit-row">
            <b>새로 확인한 문제</b>
            <span>학습자가 내용을 정리하는 데 방해</span>
          </div>
        </div>
      </div>
    );
  if (termId === "friendliness-bias")
    return (
      <div className="cr-bias-canvas">
        <div className="cr-product-nav">
          <b>도토리</b>
          <span>수업</span>
          <span>자료</span>
        </div>
        <div className="cr-bias-canvas-body">
          <span className="cr-eyebrow">관찰 화면</span>
          <h5>다음 수업 준비물</h5>
          <div className="cr-menu-route">
            <span>수업 상세</span>
            <ArrowRight size={16} />
            <span>자료실</span>
            <ArrowRight size={16} />
            <span>공지</span>
          </div>
          <p>자료를 찾으며 여러 메뉴를 다시 열었습니다.</p>
          <span className="cr-observed-quote">“네, 다 좋았어요.”</span>
        </div>
      </div>
    );
  if (termId === "social-desirability-bias")
    return (
      <div className="cr-bias-canvas">
        <div className="cr-product-nav">
          <b>도토리</b>
          <span>제출 안내</span>
        </div>
        <div className="cr-bias-canvas-body">
          <h5>제출 전에 확인해 주세요.</h5>
          <div className="cr-notice-card">
            <strong>파일 제출 안내</strong>
            <p>
              PDF 파일을 첨부한 뒤 최종 제출을 눌러 주세요. 첨부만 하면 제출이 완료되지 않습니다.
            </p>
          </div>
          <span className="cr-action">제출 시작하기</span>
          <span className="cr-screen-caption">관찰: 이번에는 안내문을 건너뛰고 클릭</span>
        </div>
      </div>
    );
  if (termId === "confirmation-bias")
    return (
      <div className="cr-bias-canvas">
        <div className="cr-product-nav">
          <b>도토리</b>
          <span>프로젝트 편집</span>
        </div>
        <div className="cr-bias-canvas-body">
          <h5>봄날 프로젝트</h5>
          <div className="cr-notice-card">
            <strong>프로젝트 소개</strong>
            <p>함께 읽고 기록하는 독서 경험을 디자인합니다.</p>
          </div>
          <span className="cr-action">저장하기</span>
          <div className="cr-recruit-row">
            <b>함께 볼 관찰</b>
            <span>버튼은 찾았지만 저장 결과를 알지 못함</span>
          </div>
        </div>
      </div>
    );
  return <BookingScreen compact selected={termId === "empathy"} />;
}

function BiasScene({ termId, figure }: Props) {
  const config = BIAS_CONFIG[termId]!;
  const personal = termId === "impostor-syndrome";
  return (
    <>
      <Workspace title={figure.title} section={config.tab}>
        <div className="cr-review-layout">
          <div className="cr-observed-screen">
            {personal ? (
              <div className="cr-delivery">
                <span className="cr-eyebrow">PRODUCTION / COPY REVIEW</span>
                <h5>제출 오류 안내 개선</h5>
                <div className="cr-delivery-diff">
                  <del>오류가 발생했습니다.</del>
                  <ins>
                    파일 형식이 맞지 않아요.
                    <br />
                    PDF 파일을 선택해 주세요.
                  </ins>
                </div>
                <span className="cr-approved">
                  <CheckCircle2 size={15} /> 검토 완료 · 반영됨
                </span>
                <p>작성자 · 나 / 문구와 해결 안내 개선</p>
              </div>
            ) : (
              <BiasContextScreen termId={termId} />
            )}
            <span className="cr-screen-caption">
              {personal ? "확인 가능한 작업 기록" : "관찰 대상 화면 · 가상 서비스"}
            </span>
          </div>
          <div className="cr-evidence-log">
            <div className="cr-log-toolbar">
              <span>검토 기록</span>
              <span>{figure.items.length} NOTES</span>
            </div>
            {figure.items.map((item, index) => (
              <section
                key={item.label}
                className={`cr-evidence-row ${index === config.emphasis ? "cr-evidence-selected" : ""}`}
              >
                <span className="cr-note-index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <span className="cr-note-label">{item.label}</span>
                  <p>{item.text}</p>
                  {index === config.emphasis && <span className="cr-focus-tag">{config.tag}</span>}
                </div>
              </section>
            ))}
            <div className="cr-review-question">
              <MessageSquare size={17} />
              <div>
                <strong>다음에 확인할 질문</strong>
                <p>{config.question}</p>
              </div>
            </div>
          </div>
        </div>
      </Workspace>
      <ContextCallout number={1}>
        {config.cue}{" "}
        {termId.includes("bias")
          ? "이 예시는 편향이 생길 수 있는 지점을 보여 주며, 한 기록만으로 사람의 의도를 단정하지 않습니다."
          : ""}
      </ContextCallout>
    </>
  );
}

const METRICS: Record<string, { label: string; value: string; basis: string; tab: string }> = {
  "conversion-rate": {
    label: "신청 전환율",
    value: "20%",
    basis: "신청 완료 20명 ÷ 방문자 100명",
    tab: "전환 분석",
  },
  "key-performance-indicators-kpis": {
    label: "핵심 지표 · 제출 완료율",
    value: "81%",
    basis: "3주차 완료 81회 ÷ 시도 100회",
    tab: "목표와 지표",
  },
  "quantitative-research": {
    label: "기기별 완료율 차이",
    value: "15%p",
    basis: "모바일 75% / 데스크톱 90%",
    tab: "과업 비교",
  },
  "representative-sample": {
    label: "모바일 이용자 구성",
    value: "70%",
    basis: "대상 집단과 표본에서 같은 비율",
    tab: "모집 현황",
  },
  "serial-position-effect": {
    label: "처음 · 중간 · 마지막",
    value: "72 · 43 · 68%",
    basis: "제시 위치별 회상률 · 설명용 가상 수치",
    tab: "기억 과제",
  },
  "use-of-navigation-vs-search": {
    label: "메뉴에서 시작한 비율",
    value: "60%",
    basis: "메뉴 12회 / 검색 8회 · 총 20회",
    tab: "탐색 방식",
  },
  "user-error-rates": {
    label: "오류가 발생한 시도",
    value: "20%",
    basis: "잘못된 파일 선택 4회 ÷ 전체 시도 20회",
    tab: "오류 분석",
  },
};

function MetricScene({ termId, figure }: Props) {
  const config = METRICS[termId]!;
  const chartItems =
    termId === "key-performance-indicators-kpis"
      ? figure.items.map((item, index) => ({ ...item, value: [70, 76, 81][index] }))
      : figure.items;
  const sample = termId === "representative-sample";
  return (
    <>
      <Workspace title={figure.title} section={config.tab}>
        <div className="cr-dashboard-tabs">
          <span className="cr-tab-selected">개요</span>
          <span>세부 기록</span>
          <span>측정 기준</span>
          <small>가상 데이터</small>
        </div>
        <div className="cr-metric-banner">
          <div>
            <span>{config.label}</span>
            <strong>{config.value}</strong>
            <p>{config.basis}</p>
          </div>
          <div className="cr-metric-filter">
            <span>프로젝트 / 모래</span>
            <b>{termId === "key-performance-indicators-kpis" ? "1–3주차" : "예시 측정 기간"} ▾</b>
          </div>
        </div>
        <div className="cr-chart-card">
          <div className="cr-chart-heading">
            <h5>
              {sample
                ? "대상 집단과 표본의 분포 비교"
                : termId === "serial-position-effect"
                  ? "제시 위치에 따른 회상"
                  : "같은 기준으로 비교하기"}
            </h5>
            <span>단위 %</span>
          </div>
          <div className="cr-bar-chart">
            {chartItems.map((item, index) => (
              <div key={item.label} className="cr-bar-row">
                <div className="cr-bar-label">
                  <strong>{item.label}</strong>
                  <span>{item.text}</span>
                </div>
                <div className="cr-bar-track">
                  <span
                    style={{ "--bar": `${item.value ?? 0}%` } as CSSProperties}
                    className={index === 0 ? "cr-bar-primary" : ""}
                  />
                  <b>{item.value}%</b>
                </div>
              </div>
            ))}
          </div>
          <div className="cr-chart-axis">
            <span>0</span>
            <span>50</span>
            <span>100%</span>
          </div>
        </div>
        <div className="cr-measurement-note">
          <strong>측정 메모</strong>
          <p>
            {termId === "conversion-rate"
              ? "방문자와 신청 완료자를 같은 기간·같은 집단으로 집계합니다."
              : termId === "user-error-rates"
                ? "오류의 정의: 잘못된 파일을 선택한 시도. 여러 오류 횟수의 합이 아닌, 오류 발생 시도 비율입니다."
                : termId === "representative-sample"
                  ? "이용 기기 한 가지 분포를 맞춘 예시입니다. 관련 특성·모집 경로도 확인해야 합니다."
                  : termId === "serial-position-effect"
                    ? "모든 화면에 적용되는 배치 규칙이 아닙니다. 과제와 조건에 따라 효과가 달라질 수 있습니다."
                    : termId === "use-of-navigation-vs-search"
                      ? "이 표는 첫 탐색 방식입니다. 과업의 성공 여부와 혼동하지 않습니다."
                      : termId === "key-performance-indicators-kpis"
                        ? "목표: 학생이 제출을 끝마칠 수 있도록 돕기. 핵심 지표는 목표와 연결해 선정합니다."
                        : "완료율 차이는 관찰 결과입니다. 차이가 생긴 이유는 추가 조사로 확인합니다."}
          </p>
        </div>
      </Workspace>
      <ContextCallout number={1}>{figure.focus}</ContextCallout>
    </>
  );
}

type MatrixData = { headers: string[]; rows: string[][]; focusColumn?: number; ribbon: string };
const MATRICES: Record<string, MatrixData> = {
  "competitive-audit": {
    headers: ["서비스", "총액 표시", "취소 안내", "비교 과업"],
    rows: [
      ["빈자리", "목록에서", "상세 화면", "같은 날짜 · 1명"],
      ["오늘모임", "상세 화면", "결제 직전", "같은 날짜 · 1명"],
      ["자리찾기", "옵션 선택 후", "별도 문서", "같은 날짜 · 1명"],
    ],
    focusColumn: 1,
    ribbon: "같은 과업 · 같은 관찰 기준",
  },
  "direct-competitors": {
    headers: ["서비스", "주요 고객", "제공 방식", "관계"],
    rows: [
      ["모래", "지역 주민", "오프라인 책 모임 예약", "기준 서비스"],
      ["책자리", "지역 주민", "오프라인 책 모임 예약", "직접 경쟁"],
      ["읽는밤", "혼자 읽는 독자", "독서 기록", "제공 방식이 다름"],
    ],
    focusColumn: 3,
    ribbon: "유사한 고객 + 유사한 서비스",
  },
  "indirect-competitors": {
    headers: ["해결할 필요", "서비스", "해결 방식", "관계"],
    rows: [
      ["식사 준비 부담 줄이기", "오늘식단", "식단 자동 계획", "기준 서비스"],
      ["식사 준비 부담 줄이기", "한끼플랜", "식단 계획 앱", "직접 경쟁"],
      ["식사 준비 부담 줄이기", "주간식탁", "정기 밀키트 배송", "간접 경쟁"],
    ],
    focusColumn: 2,
    ribbon: "같은 필요를 다른 방식으로 해결",
  },
  "secondary-research": {
    headers: ["자료", "이미 있는 근거", "확인할 조건", "적용 메모"],
    rows: [
      ["산업 통계", "기기별 예약 이용 보고서", "발행일 · 조사 대상", "현재 고객과 비교"],
      ["이전 조사", "지난 예약 테스트 기록", "과업 · 모집 방법", "겹치는 문제 검토"],
      ["관련 문헌", "예약 취소 결정 연구", "서비스 맥락", "적용 한계 기록"],
    ],
    focusColumn: 2,
    ribbon: "기존 자료 검토 · 새로운 인터뷰 아님",
  },
  "project-stakeholders": {
    headers: ["이해관계자", "필요·관심", "책임·영향", "확인 시점"],
    rows: [
      ["학생", "제출 상태 확인", "기능을 직접 사용", "설계 · 테스트"],
      ["강사", "제출물 검토", "피드백 운영", "설계 · 운영"],
      ["개발·운영", "권한과 저장 조건", "구현 · 장애 대응", "설계 · 배포"],
      ["교육 담당", "일정과 지원 조율", "수업 운영", "기획 · 운영"],
    ],
    focusColumn: 2,
    ribbon: "참여하는 사람 + 결과의 영향을 받는 사람",
  },
  "spreadsheet-note-taking": {
    headers: ["참여자", "과업", "관찰한 행동", "참여자 발언"],
    rows: [
      ["P01", "자료 찾기", "자료와 게시판을 번갈아 열었다.", "어디 있는지 모르겠어요."],
      ["P02", "자료 찾기", "수업 상세의 자료 링크를 열었다.", "제목 옆에 있어서 찾았어요."],
      ["분석 메모", "별도 구분", "진입 경로와 망설인 지점 비교", "관찰·발언과 구분해 기록"],
    ],
    focusColumn: 2,
    ribbon: "행 = 기록 / 열 = 동일한 관찰 항목",
  },
  "time-on-task": {
    headers: ["참여자", "과업 결과", "기록 시간", "집계 메모"],
    rows: [
      ["P01", "완료", "46초", "성공 시간"],
      ["P02", "완료", "71초", "성공 시간"],
      ["P03", "중단", "120초 시점", "성공 시간과 별도 집계"],
    ],
    focusColumn: 2,
    ribbon: "과제 열기 요청 → 완료 상태 확인",
  },
  "web-content-accessibility-guidelines-wcag": {
    headers: ["화면 관찰", "확인할 사항", "검토 방법", "상태"],
    rows: [
      ["가입 버튼에 Tab으로 도달 못함", "키보드로 조작 가능한가", "키보드 경로 확인", "수정 필요"],
      [
        "삭제 아이콘 기능이 읽히지 않음",
        "접근 가능한 이름이 있는가",
        "구조 · 보조 기술 확인",
        "수정 필요",
      ],
      [
        "색만 바뀌고 오류 이유 없음",
        "오류와 해결 방법을 알 수 있는가",
        "오류 상태 확인",
        "수정 필요",
      ],
    ],
    focusColumn: 1,
    ribbon: "화면의 문제 → 관련 기준 검토",
  },
};

function MatrixScene({ termId, figure }: Props) {
  const data = MATRICES[termId]!;
  return (
    <>
      <Workspace
        title={figure.title}
        section={termId === "spreadsheet-note-taking" ? "관찰 시트" : "분석 테이블"}
      >
        <div className="cr-table-toolbar">
          <div>
            <span className="cr-table-icon">▦</span>
            <b>{data.ribbon}</b>
          </div>
          <span>{data.rows.length}개 기록</span>
        </div>
        <div className="cr-data-table" role="table" aria-label={figure.title}>
          <div className="cr-data-row cr-data-header" role="row">
            {data.headers.map((header) => (
              <strong role="columnheader" key={header}>
                {header}
              </strong>
            ))}
          </div>
          {data.rows.map((row, index) => (
            <div className="cr-data-row" role="row" key={index}>
              {row.map((cell, column) => (
                <div
                  role="cell"
                  key={column}
                  className={column === data.focusColumn ? "cr-cell-focus" : ""}
                >
                  <span className="cr-mobile-column" aria-hidden="true">
                    {data.headers[column]}
                  </span>
                  {column === 0 && (
                    <span className="cr-row-index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  )}
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="cr-table-bottom">
          <span>
            <FileText size={14} /> 검토 메모
          </span>
          <p>
            {termId === "time-on-task"
              ? "완료한 시간과 중단 시점은 의미가 다릅니다. 시작·종료·실패 처리 기준을 먼저 정합니다."
              : termId === "web-content-accessibility-guidelines-wcag"
                ? "일부 예시 항목입니다. 이 표나 자동 검사만으로 WCAG 전체 적합성을 판단하지 않습니다."
                : figure.caption}
          </p>
        </div>
      </Workspace>
      <ContextCallout number={1}>{figure.focus}</ContextCallout>
    </>
  );
}

function PersonScene({ scene }: { scene: "travel" | "phone" | "meeting" | "arrival" }) {
  return (
    <svg
      className="cr-illustration"
      viewBox="0 0 320 200"
      role="img"
      aria-label={
        {
          travel: "버스에서 휴대전화를 확인하는 사람",
          phone: "책상에서 정보를 찾는 사람",
          meeting: "책을 펼치고 이야기하는 사람들",
          arrival: "책방에 도착한 사람",
        }[scene]
      }
    >
      <rect width="320" height="200" fill="#f3eee6" />
      {scene === "travel" ? (
        <>
          <rect x="16" y="18" width="288" height="84" rx="10" fill="#d6e2e2" stroke="#8b9a9b" />
          <path d="M160 18v84M17 82h286" stroke="#899a9b" />
          <path d="M25 82 55 45 85 82 120 55 148 82M188 82 224 43 259 82 293 53" fill="#afc4ba" />
        </>
      ) : scene === "arrival" ? (
        <>
          <rect x="44" y="18" width="233" height="168" fill="#e6d1b3" />
          <rect x="135" y="63" width="83" height="123" fill="#5c7466" />
          <rect x="58" y="71" width="59" height="70" fill="#fff8e7" />
          <path d="M57 103h59M86 71v69" stroke="#b9a992" />
          <text x="161" y="46" textAnchor="middle" fontSize="19" fontWeight="700" fill="#39473d">
            모래 책방
          </text>
          <circle cx="203" cy="122" r="3" fill="#e6d1b3" />
        </>
      ) : (
        <>
          <rect x="211" y="20" width="80" height="65" fill="#dce8dd" />
          <path d="M251 21v63M211 53h80" stroke="#9eafa5" />
          <rect x="11" y="24" width="72" height="47" fill="#e3c4ab" />
        </>
      )}
      {scene !== "arrival" && <path d="M0 172h320" stroke="#b3a28c" />}
      <g transform={scene === "arrival" ? "translate(-25 12)" : "translate(0 0)"}>
        <path d="M92 190v-52c0-38 60-38 60 0v52" fill="#7d8874" />
        <ellipse cx="122" cy="89" rx="22" ry="26" fill="#e5b99c" />
        <path d="M99 88c-8-35 51-41 48 5l-13-20-35 15" fill="#443c35" />
        <path d="M143 140 177 117" stroke="#e5b99c" strokeWidth="13" strokeLinecap="round" />
        <rect x="169" y="91" width="26" height="42" rx="4" fill="#282b2b" />
        <rect x="172" y="96" width="20" height="28" fill="#f4f7f1" />
      </g>
      {scene === "meeting" && (
        <>
          <path d="M223 190v-48c0-33 52-33 52 0v48" fill="#b1785d" />
          <ellipse cx="249" cy="93" rx="20" ry="24" fill="#e5b99c" />
          <path d="M229 89c-6-27 49-35 41 2l-21-18-20 16" fill="#463e37" />
          <ellipse cx="180" cy="165" rx="72" ry="17" fill="#be9d78" />
          <path d="m162 147 25-5 16 15-26 5Z" fill="#fffdf5" stroke="#8c7b62" />
        </>
      )}
    </svg>
  );
}

function SmallTaskScreen({
  step,
  booking = false,
  paper = false,
}: {
  step: number;
  booking?: boolean;
  paper?: boolean;
}) {
  return (
    <div className={`cr-task-screen ${paper ? "cr-paper-screen" : ""}`}>
      <div className="cr-task-top">
        <b>{booking ? "모래." : "도토리"}</b>
        <span>•••</span>
      </div>
      {step === 0 && booking ? (
        <>
          <span className="cr-eyebrow">함께 읽는 사람들</span>
          <h5>이번 달의 책 모임</h5>
          <div className="cr-booking-list-item cr-highlight">
            <ContextPhoto asset="forest" alt="숲에서 함께 읽는 모임" />
            <div>
              <strong>일요일, 숲과 책</strong>
              <span>11월 15일 · 20,000원</span>
              <b>자세히 보기 →</b>
            </div>
          </div>
          <div className="cr-booking-list-item">
            <ContextPhoto asset="coast" alt="바다와 여행을 주제로 하는 모임" />
            <div>
              <strong>여행을 읽는 밤</strong>
              <span>11월 22일 · 15,000원</span>
              <b>자세히 보기 →</b>
            </div>
          </div>
        </>
      ) : step === 0 ? (
        <>
          <ContextPhoto
            asset={booking ? "forest" : "coast"}
            alt={booking ? "숲에서 진행하는 모임" : "디자인 수업 표지 사진"}
            className="cr-task-image"
          />
          <h5>{booking ? "일요일, 숲과 책" : "Week 04 · 레이아웃"}</h5>
          <p>{booking ? "11월 15일 · 20,000원" : "반응형 페이지를 만들어 보세요."}</p>
          <span className="cr-action">{booking ? "일정 선택" : "과제 보기"}</span>
        </>
      ) : step === 1 ? (
        <>
          <span className="cr-eyebrow">{booking ? "예약 일정" : "과제 제출"}</span>
          <h5>{booking ? "언제 만날까요?" : "작업 파일 선택"}</h5>
          {booking ? (
            <div className="cr-dates">
              {[13, 14, 15, 16, 17, 18].map((n) => (
                <span key={n} className={n === 15 ? "cr-date-selected" : ""}>
                  {n}
                </span>
              ))}
            </div>
          ) : (
            <div className="cr-upload-box">
              <FileText size={24} />
              <b>layout.pdf</b>
              <small>첨부됨 · 아직 제출 전</small>
            </div>
          )}
          <span className="cr-action">{booking ? "14:00 선택" : "제출 내용 확인"}</span>
        </>
      ) : step === 2 ? (
        <>
          <span className="cr-eyebrow">최종 확인</span>
          <h5>{booking ? "예약을 확인해 주세요." : "이 파일을 제출할까요?"}</h5>
          <div className="cr-task-summary">
            <span>{booking ? "일요일, 숲과 책" : "layout.pdf"}</span>
            <strong>{booking ? "11월 15일 · 14:00" : "Week 04 · 레이아웃"}</strong>
            <span>{booking ? "합계 20,000원" : "PDF · 2.4 MB"}</span>
          </div>
          <span className="cr-action">{booking ? "예약하기" : "최종 제출"}</span>
        </>
      ) : (
        <>
          <div className="cr-success-symbol">
            <Check size={28} />
          </div>
          <h5>{booking ? "예약이 완료됐어요." : "제출이 완료됐어요."}</h5>
          <p>{booking ? "11월 15일 14:00에 만나요." : "layout.pdf가 제출되었습니다."}</p>
          <span className="cr-secondary-action">
            {booking ? "예약 내역 보기" : "제출 내역 보기"}
          </span>
        </>
      )}
    </div>
  );
}

function StoryScene({ termId, figure }: Props) {
  const close = termId === "close-up-storyboard";
  const paper = termId === "low-fidelity-prototypes";
  const scenes: Array<"travel" | "phone" | "meeting" | "arrival"> =
    termId === "big-picture-storyboard"
      ? ["travel", "phone", "arrival", "meeting"]
      : ["travel", "phone", "phone", "phone"];
  return (
    <>
      <Workspace title={figure.title} section={paper ? "종이 프로토타입" : "스토리보드"}>
        <div className="cr-story-brief">
          <strong>
            {paper
              ? "진행자가 종이를 바꾸며 반응을 보여 줍니다."
              : close
                ? "제품 안에서 이어지는 화면과 조작"
                : "제품을 쓰기 전과 후까지, 사용자의 상황"}
          </strong>
          <span>
            {paper
              ? "손으로 가리키는 조작을 관찰"
              : `${figure.items.length}개 장면 · 교육용 가상 시나리오`}
          </span>
        </div>
        <div className={`cr-story-grid ${paper ? "cr-paper-grid" : ""}`}>
          {figure.items.map((item, index) => (
            <article key={item.label} className="cr-story-panel">
              <div className="cr-story-visual">
                {close || paper ? (
                  <>
                    <SmallTaskScreen
                      step={paper ? [1, 2, 3][index]! : index}
                      booking={close}
                      paper={paper}
                    />
                    {paper && index !== 2 && (
                      <MousePointer2 className="cr-paper-pointer" size={30} aria-hidden="true" />
                    )}
                  </>
                ) : (
                  <>
                    <PersonScene scene={scenes[index] ?? "phone"} />
                    {termId === "storyboard" && index === 3 && (
                      <div className="cr-story-inset">
                        <strong>수업 준비물</strong>
                        <span>✓ 노트북</span>
                        <span>✓ 충전기</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <span className="cr-story-number">SCENE {String(index + 1).padStart(2, "0")}</span>
              <h5>{item.label.replace(/^\d\s*·\s*/, "")}</h5>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </Workspace>
      <ContextCallout number={1}>{figure.focus}</ContextCallout>
    </>
  );
}

function DeviceScene({ termId, figure }: Props) {
  const complementary = termId === "complementary";
  return (
    <>
      <div className="cr-device-pair">
        <div>
          <span className="cr-device-label">
            <Smartphone size={16} /> {complementary ? "발표자만 보는 화면" : "출근길 · 휴대전화"}
          </span>
          <ContextFrame brand={complementary ? "무대" : "도토리"} chrome="mobile">
            <div className="cr-device-content">
              {complementary ? (
                <>
                  <span className="cr-eyebrow">PRESENTER VIEW</span>
                  <h5>슬라이드 03 / 08</h5>
                  <div className="cr-mini-slide">
                    작은 쉼표를
                    <br />
                    <strong>만드는 디자인.</strong>
                  </div>
                  <div className="cr-presenter-notes">
                    <b>발표 메모</b>
                    <p>사용자가 잠시 멈추고 내용을 읽을 수 있도록 여백을 확보했습니다.</p>
                  </div>
                  <div className="cr-presenter-controls">
                    <span>← 이전</span>
                    <strong>다음 →</strong>
                  </div>
                </>
              ) : (
                <>
                  <ContextPhoto
                    asset="coast"
                    alt="바다가 보이는 풍경"
                    className="cr-reader-photo"
                  />
                  <h5>조용히 머무는 시간</h5>
                  <p>일상의 속도를 잠시 늦추면 그동안 보지 못했던 장면이 보입니다.</p>
                  <div className="cr-reading-position">
                    <span>3장 · 읽던 위치</span>
                    <strong>42%</strong>
                    <i />
                  </div>
                </>
              )}
            </div>
          </ContextFrame>
        </div>
        <div>
          <span className="cr-device-label">
            <Monitor size={16} />{" "}
            {complementary ? "청중에게 보여 주는 화면" : "집 · 컴퓨터에서 이어 읽기"}
          </span>
          <ContextFrame brand={complementary ? "무대" : "도토리"} chrome="web">
            <div
              className={`cr-wide-device ${complementary ? "cr-slide-display" : "cr-reading-desktop"}`}
            >
              {complementary ? (
                <>
                  <span className="cr-eyebrow">DESIGN DIRECTION</span>
                  <h4>
                    작은 쉼표를
                    <br />
                    <em>만드는 디자인.</em>
                  </h4>
                  <ContextPhoto asset="coast" alt="고요한 해안 풍경" />
                  <span className="cr-slide-number">03 / 08</span>
                </>
              ) : (
                <>
                  <aside>
                    <b>목차</b>
                    <span>01 · 시작</span>
                    <span>02 · 거리</span>
                    <strong>03 · 머무는 시간</strong>
                    <span>04 · 돌아오기</span>
                  </aside>
                  <div>
                    <span className="cr-resume-tag">휴대전화에서 읽던 위치 · 42%</span>
                    <h4>조용히 머무는 시간</h4>
                    <p>일상의 속도를 잠시 늦추면 그동안 보지 못했던 장면이 보입니다.</p>
                    <p className="cr-highlight">여기부터 이어 읽습니다.</p>
                    <p>같은 책과 읽던 위치를 불러와 중단했던 흐름을 계속합니다.</p>
                  </div>
                </>
              )}
            </div>
          </ContextFrame>
        </div>
      </div>
      <ContextCallout number={1}>{figure.focus}</ContextCallout>
    </>
  );
}

function RampIllustration() {
  return (
    <svg
      viewBox="0 0 640 210"
      className="cr-ramp"
      role="img"
      aria-label="휠체어, 유아차, 이동 가방이 낮춘 보도 턱을 함께 이용하는 장면"
    >
      <rect width="640" height="210" fill="#eaf1ee" />
      <path d="M0 150h215l95 35H640v25H0Z" fill="#c2c7c0" />
      <path d="M0 150h215l95 35H640" stroke="#8b958b" strokeWidth="4" />
      <path d="M330 197h45m30 0h45m30 0h45m30 0h45" stroke="white" strokeWidth="4" />
      <g stroke="#354d46" strokeWidth="5" fill="none">
        <circle cx="135" cy="124" r="22" />
        <circle cx="173" cy="139" r="8" />
        <path d="M126 95h34l13 44M136 77v30h29M139 108l22 21" />
        <circle cx="137" cy="58" r="11" fill="#c68d72" stroke="none" />
        <path d="M360 144l13-49m-13 14-18 6M372 141l-4-26" />
        <circle cx="375" cy="76" r="11" fill="#c68d72" stroke="none" />
        <path d="M340 115h-48l8 27h32ZM340 115l8-11" />
        <circle cx="304" cy="151" r="7" />
        <circle cx="330" cy="151" r="7" />
        <path d="M517 149l7-49m-7 20-15 8m23-8 15 28" />
        <circle cx="525" cy="81" r="11" fill="#c68d72" stroke="none" />
        <rect x="478" y="132" width="24" height="34" rx="3" fill="#d5ac70" />
        <path d="M489 131v-13h10v15" />
      </g>
      <text x="117" y="30" fontSize="16" fill="#344f46">
        휠체어
      </text>
      <text x="297" y="30" fontSize="16" fill="#344f46">
        유아차
      </text>
      <text x="482" y="30" fontSize="16" fill="#344f46">
        이동 가방
      </text>
    </svg>
  );
}

function InclusionScene({ termId, figure }: Props) {
  if (termId === "curb-cut-effect")
    return (
      <>
        <ContextFrame brand="시민을 위한 거리" chrome="document">
          <div className="cr-inclusive-paper">
            <span className="cr-eyebrow">ACCESSIBLE STREET / CONCEPT EXAMPLE</span>
            <h4>
              한 사람의 장벽을 낮추면,
              <br />더 많은 사람이 편해질 수 있습니다.
            </h4>
            <RampIllustration />
            <div className="cr-inclusive-summary">
              보도 턱을 낮춘 경사로 → 바퀴로 이동하는 여러 상황에 도움
            </div>
          </div>
        </ContextFrame>
        <ContextCallout number={1}>{figure.focus}</ContextCallout>
      </>
    );
  if (termId === "inclusive-design")
    return (
      <>
        <ContextFrame brand="어디로" chrome="web">
          <div className="cr-transit-scene">
            <div className="cr-product-nav">
              <b>어디로.</b>
              <span>이동 안내</span>
              <span>한국어 / EN</span>
            </div>
            <div className="cr-transit-layout">
              <div className="cr-transit-ticket">
                <span className="cr-eyebrow">MY JOURNEY / 나의 여정</span>
                <h4>서울역 → 부산역</h4>
                <p>오늘 14:00 출발 · 16:45 도착</p>
                <div className="cr-departure-notice">
                  <Volume2 size={20} />
                  <div>
                    <strong>곧 출발합니다.</strong>
                    <span>14:00 · 7번 승강장</span>
                    <small>소리와 함께 화면에도 안내</small>
                  </div>
                </div>
                <div className="cr-transit-direction">
                  <span>승강장</span>
                  <strong>7</strong>
                  <span>Platform</span>
                </div>
                <span className="cr-action">
                  승강장 안내 보기 <ArrowRight size={16} />
                </span>
                <span className="cr-screen-caption">드래그 없이 버튼 선택으로 이동</span>
              </div>
              <div className="cr-transit-support">
                <span className="cr-eyebrow">같은 여정, 다양한 이용 조건</span>
                {figure.items.map((item, index) => (
                  <section key={item.label}>
                    <span className="cr-need-number">0{index + 1}</span>
                    <h5>{item.label}</h5>
                    <p>{item.text}</p>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </ContextFrame>
        <ContextCallout number={1}>
          소리를 듣기 어려운 상황에는 화면 안내, 한 손 사용에는 버튼 선택, 낯선 언어에는 쉬운 표현과
          일관된 표식을 제공합니다.
        </ContextCallout>
      </>
    );
  const equality = termId === "equality";
  const equity = termId === "equity-focused-design";
  const human = termId === "the-human-factor";
  return (
    <>
      <ContextFrame brand={human ? "도토리" : "모두의 배움"} chrome="web">
        <div className="cr-inclusive-app">
          <div className="cr-product-nav">
            <b>{human ? "도토리" : "모두의 배움"}</b>
            <span>나의 학습</span>
            <span>접근성</span>
          </div>
          <div className="cr-learning-media">
            <ContextPhoto asset="coast" alt="수업에서 설명하는 해안 풍경" />
            <div className="cr-video-overlay">
              <Play size={27} fill="currentColor" />
              <b>Week 04 · 화면을 읽는 순서</b>
            </div>
            {!equality && (
              <div className="cr-video-caption">관련된 정보는 가까이 배치해 그룹을 만듭니다.</div>
            )}
            <div className="cr-video-controls">
              <Pause size={14} />
              <span>03:24 / 12:00</span>
              <div />
              <Volume2 size={15} />
              <b className={!equality ? "cr-caption-active" : ""}>CC</b>
            </div>
          </div>
          <div className="cr-inclusive-options">
            <div>
              <span className="cr-eyebrow">
                {equality ? "동일한 제공" : human ? "사용 조건을 함께 살피기" : "참여 방법 선택"}
              </span>
              <h5>
                {equality
                  ? "모두에게 같은 PDF 1개"
                  : human
                    ? "이동 중에도 필요한 자료 찾기"
                    : "내게 맞는 방법으로 학습하세요."}
              </h5>
              <p>
                {equality
                  ? "제공 형식과 분량이 같습니다. 실제로 읽을 수 있는지는 별도로 확인합니다."
                  : human
                    ? "한 손 사용, 익숙하지 않은 용어, 시간 압박이 화면 사용에 함께 영향을 줍니다."
                    : "같은 수업 내용에 여러 방식으로 접근할 수 있습니다."}
              </p>
            </div>
            <div className="cr-access-options">
              {equality ? (
                <span>
                  <FileText size={18} /> 수업 자료.pdf
                </span>
              ) : (
                <>
                  <span>
                    <FileText size={18} /> 텍스트 자료
                  </span>
                  <span>
                    <Headphones size={18} /> 음성으로 듣기
                  </span>
                  <span className="cr-highlight">
                    가 <b>가</b> <strong>가</strong> <small>글자 크기</small>
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="cr-needs-grid">
            {figure.items.map((item, index) => (
              <div key={item.label}>
                <span className="cr-need-number">0{index + 1}</span>
                <strong>{item.label}</strong>
                <p>{item.text}</p>
                {equity && (
                  <small>
                    {
                      [
                        "읽기 조건에 맞춘 조절",
                        "소리 없이도 내용 확인",
                        "구조와 설명으로 정보 제공",
                      ][index]
                    }
                  </small>
                )}
              </div>
            ))}
          </div>
        </div>
      </ContextFrame>
      <ContextCallout number={1}>{figure.focus}</ContextCallout>
    </>
  );
}

function FlowScene({ termId, figure }: Props) {
  const interaction = termId === "interaction-designers";
  const iterative = termId === "iterate" || termId === "user-centered-design";
  if (interaction)
    return (
      <>
        <Workspace title="프로젝트 만들기 · 상태 설계" section="인터랙션 명세">
          <div className="cr-state-path">
            <div className="cr-mini-form">
              <span className="cr-state-kicker">01 / 입력</span>
              <h5>새 프로젝트</h5>
              <span className="cr-field-label">프로젝트 이름</span>
              <div className="cr-faux-input">
                봄<span className="cr-caret">|</span>
              </div>
              <span className="cr-action">만들기</span>
            </div>
            <span className="cr-state-arrow">→</span>
            <div className="cr-mini-form cr-form-error">
              <span className="cr-state-kicker">02 / 오류 + 복구</span>
              <h5>새 프로젝트</h5>
              <span className="cr-field-label">프로젝트 이름</span>
              <div className="cr-faux-input">봄</div>
              <p>이름을 두 글자 이상 입력해 주세요.</p>
              <span className="cr-correction">이름 수정: 봄날 프로젝트 →</span>
            </div>
            <span className="cr-state-arrow">→</span>
            <div className="cr-mini-form cr-form-success">
              <span className="cr-state-kicker">03 / 성공</span>
              <CheckCircle2 size={34} />
              <h5>프로젝트를 만들었어요.</h5>
              <p>봄날 프로젝트</p>
              <span className="cr-secondary-action">프로젝트 열기</span>
            </div>
          </div>
          <div className="cr-flow-rules">
            <strong>동작 규칙</strong>
            <span>2자 미만 → 입력값 유지 + 오류 안내</span>
            <span>2자 이상 → 생성 결과 표시</span>
          </div>
        </Workspace>
        <ContextCallout number={1}>
          한 개의 완성 화면이 아니라 입력·검증·결과·오류 복구의 관계를 설계합니다. 화면은 정적 상태
          예시입니다.
        </ContextCallout>
      </>
    );
  if (iterative)
    return (
      <>
        <Workspace title={figure.title} section="반복 설계 기록">
          <div className="cr-iteration-pair">
            <div>
              <span className="cr-state-kicker">이전 안 / 관찰 대상</span>
              <div className="cr-mini-form">
                <h5>과제 제출</h5>
                <div className="cr-upload-box">
                  <FileText size={24} />
                  <b>layout.pdf</b>
                  <small>첨부 완료</small>
                </div>
                <span className="cr-secondary-action">확인</span>
                <div className="cr-comment-pin">① 첨부만으로 제출됐다고 생각한 장면</div>
              </div>
            </div>
            <div>
              <span className="cr-state-kicker">수정 안 / 다시 평가할 대상</span>
              <div className="cr-mini-form cr-iteration-new">
                <h5>마지막으로 제출해 주세요.</h5>
                <div className="cr-upload-box">
                  <FileText size={24} />
                  <b>layout.pdf</b>
                  <small>첨부됨 · 아직 제출 전</small>
                </div>
                <span className="cr-action">최종 제출</span>
                <div className="cr-comment-pin">② 첨부 상태와 다음 행동 구분</div>
              </div>
            </div>
          </div>
          <ol className="cr-iteration-notes">
            {figure.items.map((item, index) => (
              <li key={item.label}>
                <span>{index + 1}</span>
                <strong>{item.label}</strong>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
          <div className="cr-loop-back">↶ 수정 후에도 사용자가 구분하는지 다시 확인</div>
        </Workspace>
        <ContextCallout number={1}>
          {figure.focus} 수정안의 효과는 아직 검증되지 않은 가상 예시입니다.
        </ContextCallout>
      </>
    );
  return (
    <>
      <Workspace title="과제 제출 · 목표와 분기" section="유저 플로우">
        <div className="cr-flow-start">시작 · 과제 제출하기</div>
        <div className="cr-flow-screens">
          {[0, 1, 2, 3].map((step) => (
            <div key={step} className="cr-flow-screen-item">
              <span className="cr-state-kicker">
                0{step + 1} / {figure.items[step]?.label}
              </span>
              <SmallTaskScreen step={step} />
              {step < 3 && (
                <span className="cr-flow-connector" aria-hidden="true">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="cr-flow-branch">
          <strong>파일 조건 확인</strong>
          <span>PDF가 아님 → 오류 안내 → 파일 다시 선택 ↶</span>
          <span>PDF이며 용량 조건 충족 → 내용 확인 → 최종 제출</span>
        </div>
      </Workspace>
      <ContextCallout number={1}>
        화면과 행동을 연결하고, 파일 조건에 따른 분기와 돌아가는 경로를 보여 줍니다.
      </ContextCallout>
    </>
  );
}

function SessionScene({ termId, figure }: Props) {
  const primary = termId === "primary-research";
  return (
    <>
      <Workspace title={figure.title} section={primary ? "신규 자료 수집" : "관찰 세션"}>
        <div className="cr-session-meta">
          <span>
            <i /> 가상 세션 P01
          </span>
          <span>과업: {primary ? "레이아웃 과제 제출하기" : "다음 수업 준비물 찾기"}</span>
          <span>원본 기록과 해석 구분</span>
        </div>
        <div className="cr-session-layout">
          <div className="cr-shared-view">
            <div className="cr-share-heading">
              <Monitor size={15} /> 참여자가 사용한 화면
            </div>
            {primary ? (
              <SmallTaskScreen step={1} />
            ) : (
              <div className="cr-study-app">
                <div className="cr-product-nav">
                  <b>도토리</b>
                  <span>수업</span>
                  <span>자료</span>
                  <span>공지</span>
                </div>
                <h5>이번 주 수업</h5>
                <ContextPhoto asset="coast" alt="디자인 수업 표지" className="cr-session-cover" />
                <strong>Week 04 · 레이아웃</strong>
                <p>일요일 10:00 · 준비물을 확인해 주세요.</p>
                <span className="cr-text-link">수업 준비물.pdf</span>
                <MousePointer2 size={25} className="cr-session-cursor" />
              </div>
            )}
            <div className="cr-session-progress">
              <span>00:46</span>
              <i />
              <span>01:20</span>
            </div>
          </div>
          <aside className="cr-session-notes">
            <h5>
              <Mic size={15} /> 진행·관찰 기록
            </h5>
            {figure.items.map((item, index) => (
              <div key={item.label}>
                <span className="cr-time-stamp">{["00:00", "00:24", "00:46", "01:20"][index]}</span>
                <strong>{item.label}</strong>
                <p>{item.text}</p>
              </div>
            ))}
          </aside>
        </div>
        {primary && (
          <div className="cr-primary-distinction">
            <strong>이번 질문을 위해 새로 얻은 자료</strong>
            <span>인터뷰 발언 + 실제 행동 관찰</span>
            <small>지난 학기 보고서를 읽는 것은 2차 자료 활용입니다.</small>
          </div>
        )}
      </Workspace>
      <ContextCallout number={1}>{figure.focus}</ContextCallout>
    </>
  );
}

function PresentationScene({ figure }: Props) {
  return (
    <>
      <ContextFrame brand="무대" chrome="workspace">
        <div className="cr-presentation-app">
          <div className="cr-presentation-toolbar">
            <strong>제출 경험 개선 제안</strong>
            <span>발표 자료 · 가상 프로젝트</span>
          </div>
          <div className="cr-presentation-layout">
            <aside className="cr-slide-thumbnails">
              {figure.items.map((item, index) => (
                <div key={item.label} className={index === 2 ? "cr-slide-selected" : ""}>
                  <span>0{index + 1}</span>
                  <strong>{item.label.replace(/^\d\s*·\s*/, "")}</strong>
                </div>
              ))}
            </aside>
            <div className="cr-main-slide">
              <span className="cr-eyebrow">03 / DESIGN PROPOSAL</span>
              <h4>
                ‘첨부됨’과 ‘제출 완료’를
                <br />
                구분해 보여 줍니다.
              </h4>
              <div className="cr-slide-comparison">
                <div>
                  <span>이전</span>
                  <p>첨부 완료</p>
                </div>
                <ArrowRight size={23} />
                <div>
                  <span>제안</span>
                  <p>첨부됨 · 아직 제출 전</p>
                  <b>최종 제출</b>
                </div>
              </div>
              <div className="cr-slide-footer">
                <span>확인할 질문: 최종 제출까지 완료하는가?</span>
                <span>03 / 04</span>
              </div>
            </div>
          </div>
          <div className="cr-speaker-note">
            <b>발표자 메모</b>
            <p>관찰 근거를 설명한 뒤, 수정안을 다음 테스트에서 확인할지 논의합니다.</p>
          </div>
        </div>
      </ContextFrame>
      <ContextCallout number={1}>{figure.focus}</ContextCallout>
    </>
  );
}

function MatrixNavigation() {
  return (
    <>
      <ContextFrame brand="도토리" chrome="web">
        <div className="cr-library-app">
          <div className="cr-product-nav">
            <b>도토리</b>
            <span>학습 자료</span>
            <Search size={18} />
          </div>
          <h4>지금 필요한 배움</h4>
          <p>주제와 수준을 교차해 자료를 찾아보세요.</p>
          <div className="cr-filter-row">
            <span>
              주제 <b>UI 디자인 ▾</b>
            </span>
            <span>
              수준 <b>전체 ▾</b>
            </span>
          </div>
          <div className="cr-matrix-library">
            <span />
            <strong>입문</strong>
            <strong>심화</strong>
            <strong>UI 디자인</strong>
            <div>
              <ContextPhoto asset="coast" alt="레이아웃 수업 표지" />
              <b>레이아웃의 기초</b>
              <small>UI · 입문</small>
            </div>
            <div>
              <ContextPhoto asset="forest" alt="폼 설계 수업 표지" />
              <b>복잡한 폼 설계</b>
              <small>UI · 심화</small>
            </div>
            <strong>리서치</strong>
            <div>
              <FileText size={24} />
              <b>인터뷰 질문 만들기</b>
              <small>리서치 · 입문</small>
            </div>
            <div>
              <FileText size={24} />
              <b>혼합 방법 조사 계획</b>
              <small>리서치 · 심화</small>
            </div>
          </div>
        </div>
      </ContextFrame>
      <ContextCallout number={1}>
        하나의 콘텐츠를 ‘주제’와 ‘수준’이라는 서로 다른 기준으로 찾을 수 있습니다. 단일 상하 구조와
        구분하세요.
      </ContextCallout>
    </>
  );
}

function NetworkScene({ figure }: Props) {
  return (
    <>
      <ContextFrame brand="연결" chrome="web">
        <div className="cr-network-app">
          <div className="cr-product-nav">
            <b>연결.</b>
            <span>디자인 커뮤니티</span>
            <MessageSquare size={19} />
          </div>
          <div className="cr-network-profile">
            <span className="cr-person-avatar">지</span>
            <div>
              <h5>지윤 · 프로덕트 디자이너</h5>
              <p>접근성 세션에서 나눈 대화를 이어갑니다.</p>
            </div>
            <span className="cr-chip">새 대화</span>
          </div>
          <div className="cr-chat-thread">
            <div className="cr-chat-bubble">
              <span>지윤 · 모임에서</span>
              <p>오늘 이야기한 키보드 탐색 작업이 흥미로웠어요. 참고한 공개 자료가 있을까요?</p>
            </div>
            <div className="cr-chat-bubble cr-chat-mine">
              <span>나 · 후속 교류</span>
              <p>네, 당시 확인한 공개 가이드를 공유해요. 다음에는 작업 결과도 함께 이야기해요.</p>
              <div className="cr-chat-link">
                <FileText size={19} />
                <span>
                  키보드 접근성 가이드
                  <br />
                  <small>공개 참고 자료 · 예시</small>
                </span>
              </div>
            </div>
            <div className="cr-chat-date">이후에도 이어지는 교류</div>
            <div className="cr-chat-bubble">
              <span>지윤</span>
              <p>공유해 주신 관점으로 수정안을 검토했어요. 제 작업도 의견을 나눌 수 있을까요?</p>
            </div>
          </div>
        </div>
      </ContextFrame>
      <ContextCallout number={1}>
        {figure.focus} 이 대화는 교육용 예시이며 실제 메시지를 전송하지 않습니다.
      </ContextCallout>
    </>
  );
}

function CompanyScene({ figure }: Props) {
  return (
    <>
      <ContextFrame brand="누리" chrome="web">
        <div className="cr-company-app">
          <div className="cr-product-nav">
            <b>NURI.</b>
            <span>회사 소개</span>
            <span>서비스</span>
            <span>문의</span>
          </div>
          <div className="cr-company-intro">
            <span className="cr-eyebrow">COMPANY PROFILE</span>
            <h4>
              함께 만드는
              <br />더 나은 일상.
            </h4>
            <p>교육용 가상 기업 · 주식회사 누리</p>
          </div>
          <div className="cr-company-record">
            <div>
              <span>계약 주체</span>
              <strong>주식회사 누리</strong>
              <p>회사 명의로 계약과 사업을 수행</p>
            </div>
            <div>
              <span>소유 관계</span>
              <strong>주주</strong>
              <p>회사의 지분을 보유 · 회사와는 구분</p>
            </div>
          </div>
          <footer>
            주식회사 누리 · 법적 실체를 설명하는 개념 예시
            <br />
            <small>직원 수나 사업 규모로 법인 여부를 판단하지 않습니다.</small>
          </footer>
        </div>
      </ContextFrame>
      <ContextCallout number={1}>
        {figure.focus} 구체적인 설립 요건은 관할 제도에 따라 다릅니다.
      </ContextCallout>
    </>
  );
}

function MeasurementBoundary({ figure }: Props) {
  return (
    <>
      <Workspace title="관찰한 행동과 측정하지 않은 것" section="해석 범위 검토">
        <div className="cr-measurement-boundary">
          <div className="cr-notification-app">
            <div className="cr-product-nav">
              <b>도토리</b>
              <span>알림</span>
            </div>
            <div className="cr-notification">
              <span className="cr-notification-dot" />
              <div>
                <strong>새 피드백이 도착했어요.</strong>
                <p>Week 04 · 레이아웃 과제</p>
                <small>지금</small>
              </div>
            </div>
            <div className="cr-behavior-event">
              <CheckCircle2 size={18} />
              <span>관찰 기록: 알림 열기</span>
            </div>
            <div className="cr-behavior-event">
              <CheckCircle2 size={18} />
              <span>관찰 기록: 다시 방문</span>
            </div>
          </div>
          <div className="cr-inference-boundary">
            <span className="cr-boundary-icon">≠</span>
            <h5>도파민 변화의 측정</h5>
            <p>클릭이나 재방문만으로 신경전달물질의 변화를 알 수 없습니다.</p>
            <span>직접 측정한 근거 없음</span>
          </div>
        </div>
        <div className="cr-measurement-note">
          <strong>개념 범위</strong>
          <p>
            도파민은 보상 학습·동기·움직임 등 여러 기능에 관여합니다. 단순히 ‘즐거움 물질’이나 UI
            성과의 다른 이름으로 쓰지 않습니다.
          </p>
        </div>
      </Workspace>
      <ContextCallout number={1}>{figure.focus}</ContextCallout>
    </>
  );
}

function GestureScene({ figure }: Props) {
  return (
    <>
      <div className="cr-gesture-grid">
        {figure.items.map((item, index) => (
          <div key={item.label}>
            <ContextFrame brand="모래 사진첩" chrome="mobile">
              <div className="cr-photo-app">
                <div className="cr-product-nav">
                  <b>여행의 장면</b>
                  <span>•••</span>
                </div>
                <div className={`cr-gesture-photo cr-gesture-photo-${index}`}>
                  <ContextPhoto
                    asset={index === 1 ? "forest" : "coast"}
                    alt={index === 1 ? "숲 사진으로 이동한 화면" : "해안 사진"}
                  />
                  <svg viewBox="0 0 220 190" className="cr-gesture-overlay" aria-hidden="true">
                    {index === 0 ? (
                      <>
                        <circle cx="112" cy="100" r="22" />
                        <circle cx="112" cy="100" r="8" fill="white" />
                        <path d="m118 109 20 28" />
                      </>
                    ) : index === 1 ? (
                      <>
                        <circle cx="72" cy="100" r="10" fill="white" />
                        <path d="M91 100h80m-16-12 16 12-16 12" />
                      </>
                    ) : (
                      <>
                        <circle cx="86" cy="119" r="10" fill="white" />
                        <circle cx="137" cy="72" r="10" fill="white" />
                        <path d="m72 130-20 20m0-15v15h15m82-88 20-20m-15 0h15v15" />
                      </>
                    )}
                  </svg>
                </div>
                <div className="cr-photo-caption">
                  <b>{index === 1 ? "02 / 12" : index === 2 ? "확대 보기 · 150%" : "01 / 12"}</b>
                  <p>
                    {["짧게 눌러 사진 열기", "옆으로 쓸어 다음 사진", "두 접점을 벌려 확대"][index]}
                  </p>
                </div>
              </div>
            </ContextFrame>
            <h5>{item.label}</h5>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
      <ContextCallout number={1}>
        접촉 방식과 화면 반응을 함께 보세요. 이 그림은 탭·스와이프·핀치의 정적 동작 예시입니다.
      </ContextCallout>
    </>
  );
}

export function ResearchScenes({ termId, figure }: Props) {
  switch (SCENES[termId]) {
    case "bias":
      return <BiasScene termId={termId} figure={figure} />;
    case "metrics":
      return <MetricScene termId={termId} figure={figure} />;
    case "matrix":
      return <MatrixScene termId={termId} figure={figure} />;
    case "story":
      return <StoryScene termId={termId} figure={figure} />;
    case "device":
      return <DeviceScene termId={termId} figure={figure} />;
    case "inclusion":
      return <InclusionScene termId={termId} figure={figure} />;
    case "flow":
      return <FlowScene termId={termId} figure={figure} />;
    case "session":
      return <SessionScene termId={termId} figure={figure} />;
    case "presentation":
      return <PresentationScene termId={termId} figure={figure} />;
    case "network":
      return <NetworkScene termId={termId} figure={figure} />;
    case "matrix-navigation":
      return <MatrixNavigation />;
    case "company":
      return <CompanyScene termId={termId} figure={figure} />;
    case "measurement":
      return <MeasurementBoundary termId={termId} figure={figure} />;
    case "gesture":
      return <GestureScene termId={termId} figure={figure} />;
    default:
      return null;
  }
}
