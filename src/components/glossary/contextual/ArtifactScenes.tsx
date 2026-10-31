import type { ReactNode } from "react";
import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  FileText,
  Folder,
  LayoutGrid,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import type { LearningFigure } from "@/data/learning/types";
import { ContextFrame, ContextPhoto, ContextCallout } from "./ContextFrame";
import "./artifact-scenes.css";

export const ARTIFACT_TERM_IDS = [
  "affinity",
  "affinity-diagram",
  "aggregated-empathy-maps",
  "apprenticeships",
  "assets",
  "brand-identity",
  "case-studies",
  "case-study",
  "context",
  "design-sprint",
  "design-system",
  "design-thinking",
  "empathy-map",
  "graphic-designers",
  "hierarchical-model",
  "ideate",
  "ideation",
  "information-architecture-ia",
  "internship",
  "iteration",
  "motion-designers",
  "pain-points",
  "payment-schedule",
  "persona",
  "personal-brand",
  "portfolio",
  "qualitative-research",
  "recency-bias",
  "retrospective",
  "scope-creep",
  "second-round-of-interviews",
  "sitemap",
  "startup",
  "test",
  "user",
  "user-experience",
  "user-group",
  "user-journey",
  "ux-research",
  "variety",
  "whiteboard-interview",
] as const;

type Props = { termId: string; figure: LearningFigure };

function Kicker({ children }: { children: ReactNode }) {
  return <span className="ca-kicker">{children}</span>;
}
function Tag({ children }: { children: ReactNode }) {
  return <span className="ca-tag">{children}</span>;
}
function SampleNote({
  children = "교육용 가상 프로젝트 · 실제 조사 결과가 아닙니다.",
}: {
  children?: ReactNode;
}) {
  return <p className="ca-sample-note">{children}</p>;
}
function Member({ initial = "Y", name = "윤서" }: { initial?: string; name?: string }) {
  return (
    <span className="ca-member">
      <i>{initial}</i>
      {name}
    </span>
  );
}
function WorkspaceHeader({ title, section = "프로젝트" }: { title: string; section?: string }) {
  return (
    <div className="ca-workspace-heading">
      <div>
        <Kicker>DOTORI / {section}</Kicker>
        <h5>{title}</h5>
      </div>
      <div className="ca-collaborators" aria-label="가상 팀원 세 명">
        <i>J</i>
        <i>M</i>
        <i>S</i>
      </div>
    </div>
  );
}

/** Original static product screens used inside portfolios and research artifacts. */
function LearningScreen({ version = 2, compact = false }: { version?: number; compact?: boolean }) {
  return (
    <div className={`ca-learning-screen ${compact ? "ca-learning-compact" : ""}`}>
      <div className="ca-product-nav">
        <b>dotori.</b>
        <span>내 수업</span>
        <span className="ca-nav-active">내 자료</span>
        <i>Y</i>
      </div>
      <div className="ca-learning-content">
        <div className="ca-product-eyebrow">MY LIBRARY</div>
        <h6>배운 것을, 다시 꺼내다.</h6>
        <p>저장한 수업 자료를 한곳에서 확인하세요.</p>
        <div className={`ca-search-field ${version > 0 ? "ca-focus-outline" : ""}`}>
          <Search size={15} />
          <span>{version === 0 ? "파일명으로 검색" : "수업 이름이나 자료로 검색"}</span>
        </div>
        {version > 0 && (
          <div className="ca-filter-bar">
            <span className="ca-selected">전체 자료</span>
            <span>UX 리서치</span>
            <span>UI 디자인</span>
            <SlidersHorizontal size={14} />
          </div>
        )}
        <div className="ca-library-grid">
          <div>
            <span className="ca-file-cover ca-file-cover-green">
              <FileText size={23} />
              <b>
                리서치
                <br />
                질문 가이드
              </b>
            </span>
            <strong>{version === 0 ? "guide_final_02.pdf" : "좋은 인터뷰 질문 만들기"}</strong>
            <small>{version === 0 ? "PDF · 12p" : "UX 리서치 02 · PDF"}</small>
          </div>
          <div>
            <span className="ca-file-cover ca-file-cover-lilac">
              <LayoutGrid size={23} />
              <b>
                화면 설계
                <br />
                워크북
              </b>
            </span>
            <strong>{version === 0 ? "worksheet_v3.pdf" : "컴포넌트 상태 설계"}</strong>
            <small>{version === 0 ? "PDF · 8p" : "UI 디자인 04 · PDF"}</small>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReservationScreen() {
  return (
    <div className="ca-reservation-screen">
      <div className="ca-product-nav">
        <b>모래.</b>
        <span>책과 사람</span>
        <span>모임</span>
      </div>
      <ContextPhoto asset="forest" alt="나무 사이로 비치는 햇빛" className="ca-reservation-photo" />
      <div className="ca-reservation-body">
        <Kicker>BOOK CLUB / SATURDAY</Kicker>
        <h6>토요일, 숲을 읽다</h6>
        <p>한 권을 함께 읽고 나누는 오후</p>
        <div className="ca-booking-row">
          <CalendarDays size={15} />
          <span>11월 15일 · 오후 2:00 · 1명</span>
        </div>
        <div className="ca-price-detail">
          <span>모임 참가비</span>
          <b>15,000원</b>
          <span>활동 재료</span>
          <b>5,000원</b>
          <strong>총 결제 금액</strong>
          <strong>20,000원</strong>
        </div>
        <span className="ca-product-button">
          20,000원으로 예약하기 <ArrowRight size={14} />
        </span>
        <small>시작 24시간 전까지 일정 변경 가능</small>
      </div>
    </div>
  );
}

function CaseStudy({ figure, plural }: { figure: LearningFigure; plural: boolean }) {
  return (
    <ContextFrame
      brand="SEO YUN / DESIGNER"
      chrome="web"
      url="seoyun.example/work"
      label="가상 디자이너의 케이스 스터디 상세 페이지"
    >
      <div className="ca-case-page">
        <nav className="ca-portfolio-nav">
          <b>SEO YUN.</b>
          <span>Work</span>
          <span>About</span>
          <span>Contact ↗</span>
        </nav>
        <header className="ca-case-title">
          <Kicker>UX CASE STUDY / CONCEPT PROJECT</Kicker>
          <h5>
            {plural ? (
              <>
                예약하기 전에,
                <br />
                전체 비용이 보이도록.
              </>
            ) : (
              <>
                저장한 자료를
                <br />
                다시 찾을 수 있도록.
              </>
            )}
          </h5>
          <p>{plural ? "모래 책방 · 모임 예약 경험 개편" : "도토리 · 학습 자료 탐색 경험 개편"}</p>
          <div className="ca-project-meta">
            <span>
              <small>ROLE</small>UX 리서치 · UI 설계
            </span>
            <span>
              <small>DELIVERABLE</small>웹 · 프로토타입
            </span>
            <span>
              <small>STATUS</small>교육용 가상 프로젝트
            </span>
          </div>
        </header>
        <div className={`ca-case-showcase ${plural ? "ca-case-showcase-sand" : ""}`}>
          {plural ? <ReservationScreen /> : <LearningScreen />}
        </div>
        <div className="ca-case-body">
          <div className="ca-case-side">
            OVERVIEW
            <br />
            <b>
              문제에서
              <br />
              판단까지.
            </b>
          </div>
          <div className="ca-case-chapters">
            {figure.items.map((item, index) => (
              <section key={item.label} className={index === 2 ? "ca-chapter-highlight" : ""}>
                <span>0{index + 1}</span>
                <div>
                  <h6>{item.label}</h6>
                  <p>{item.text}</p>
                  {item.detail && <small>{item.detail}</small>}
                </div>
              </section>
            ))}
          </div>
        </div>
        <SampleNote>
          가상 케이스 스터디입니다. 실제 사용자 검증이나 개선 성과를 주장하지 않습니다.
        </SampleNote>
      </div>
    </ContextFrame>
  );
}

function Portfolio({ termId }: { termId: string }) {
  const personal = termId === "personal-brand";
  const variety = termId === "variety";
  return (
    <ContextFrame
      brand="SEO YUN / PORTFOLIO"
      chrome="web"
      url="seoyun.example"
      label="가상 디자이너의 프로젝트 포트폴리오"
    >
      <div className="ca-portfolio-page">
        <nav className="ca-portfolio-nav">
          <b>SEO YUN.</b>
          <span>Work</span>
          <span>About</span>
          <span>Contact ↗</span>
        </nav>
        <header className={personal ? "ca-brand-highlight" : ""}>
          <Kicker>PRODUCT DESIGNER / SEOUL</Kicker>
          <h5>
            복잡한 정보를
            <br />
            명확한 경험으로.
          </h5>
          <p>
            {personal
              ? "정보 구조와 탐색 흐름을 설계하는 프로덕트 디자이너 서윤입니다."
              : "사용자의 맥락에서 문제를 찾고, 설계의 이유를 기록합니다."}
          </p>
        </header>
        <div className="ca-section-label">
          <strong>Selected work</strong>
          <span>2025—2026</span>
        </div>
        <div className={`ca-portfolio-projects ${variety ? "ca-varied-projects" : ""}`}>
          <article className={personal ? "ca-brand-highlight" : ""}>
            <div className="ca-portfolio-preview">
              <LearningScreen compact />
            </div>
            <div className="ca-project-description">
              <h6>
                {personal ? "저장한 자료를 맥락으로 찾기" : "도토리의 자료 탐색 개선"}{" "}
                <ArrowRight size={16} />
              </h6>
              <p>
                {personal ? "정보 구조 · 검색 · 필터 설계" : "UX 리서치 · UI 설계 · 프로토타입"}
              </p>
              <small>역할과 설계 근거 보기</small>
            </div>
          </article>
          <article>
            <div className="ca-portfolio-preview ca-portfolio-preview-photo">
              <ContextPhoto asset="coast" alt="해안 절벽과 푸른 바다" />
              <span>
                WALK
                <br />
                SLOWLY.
              </span>
            </div>
            <div className="ca-project-description">
              <h6>
                {personal ? "정보를 따라 천천히 걷는 법" : "도시를 걷는 새로운 방식"}{" "}
                <ArrowRight size={16} />
              </h6>
              <p>
                {personal
                  ? "경로와 장소 정보를 연결하는 탐색 디자인 노트"
                  : "지도 탐색 · 모바일 화면 · 현장 맥락"}
              </p>
              <small>{personal ? "전문성과 연결된 글" : "프로젝트 과정 보기"}</small>
            </div>
          </article>
          {variety && (
            <article className="ca-variety-small">
              <div className="ca-sketch-board">
                <span>01 경로</span>
                <i>출발</i>
                <ArrowRight size={18} />
                <i>장소</i>
                <ArrowRight size={18} />
                <i>도착</i>
              </div>
              <h6>작은 과정 기록</h6>
              <p>대표 이미지와 다른 크기, 같은 글자와 간격 규칙.</p>
            </article>
          )}
        </div>
        <footer className="ca-portfolio-footer">
          <span>Let’s make it clear.</span>
          <span>hello@example.com ↗</span>
        </footer>
        <SampleNote>가상 디자이너의 포트폴리오 구성 예시입니다.</SampleNote>
      </div>
    </ContextFrame>
  );
}

function GraphicDesign() {
  return (
    <ContextFrame
      brand="MORAE / EXHIBITION IDENTITY"
      chrome="workspace"
      label="동일한 전시 아이덴티티를 적용한 포스터, 안내 카드, 디지털 배너"
    >
      <div className="ca-graphic-board">
        <WorkspaceHeader title="관찰의 시작" section="비주얼 아이덴티티" />
        <div className="ca-graphic-layout">
          <div className="ca-exhibition-poster">
            <ContextPhoto asset="forest" alt="빛과 나무가 겹치는 숲" />
            <strong>
              관찰의
              <br />
              시작
            </strong>
            <span>THE ART OF NOTICING</span>
            <small>
              11.15—12.06
              <br />
              모래 갤러리
            </small>
          </div>
          <div className="ca-graphic-right">
            <div className="ca-exhibition-ticket">
              <Kicker>VISITOR GUIDE</Kicker>
              <strong>관찰의 시작</strong>
              <p>
                11월 15일 — 12월 6일
                <br />
                10:00–18:00 · 화요일 휴관
              </p>
              <span>모래 갤러리 / 1F</span>
            </div>
            <div className="ca-exhibition-banner">
              <ContextPhoto asset="forest" alt="전시 배너에 사용한 같은 숲 사진" />
              <strong>
                관찰에서
                <br />
                작업으로.
              </strong>
              <span>전시 자세히 보기 ↗</span>
            </div>
            <div className="ca-brand-key">
              <i /> <span>먹색 · 아이보리 · 차분한 녹색</span>
            </div>
          </div>
        </div>
        <SampleNote>가상 전시의 매체별 적용 예시입니다.</SampleNote>
      </div>
    </ContextFrame>
  );
}

function Persona({ figure }: { figure: LearningFigure }) {
  return (
    <ContextFrame
      brand="DOTORI / RESEARCH"
      chrome="document"
      label="목표, 행동, 필요와 근거를 담은 페르소나 시트"
    >
      <div className="ca-persona-sheet">
        <div className="ca-document-top">
          <Kicker>RESEARCH ARTIFACT / PERSONA</Kicker>
          <Tag>가상 조사 예시</Tag>
        </div>
        <div className="ca-persona-grid">
          <aside>
            <div className="ca-profile-portrait" aria-hidden="true">
              <span>Y</span>
              <i />
            </div>
            <h5>윤서</h5>
            <p>일과 공부를 병행하는 수강생</p>
            <blockquote>
              “이동하는 10분도
              <br />
              복습에 쓰고 싶어요.”
            </blockquote>
            <span className="ca-profile-tag">이동 중 모바일 학습</span>
          </aside>
          <div className="ca-artifact-main">
            <h6>통학 중 짧게 복습하는 학습자</h6>
            {figure.items.slice(1).map((item, i) => (
              <section key={item.label}>
                <span className="ca-number">0{i + 1}</span>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.text}</p>
                  {item.detail && <small>{item.detail}</small>}
                </div>
              </section>
            ))}
            <div className="ca-research-evidence">
              <b>근거를 표시하기</b>
              <p>
                행동 패턴과 필요는 조사로 확인해야 합니다. 이름·인구통계만으로 페르소나를 만들지
                않습니다.
              </p>
            </div>
          </div>
        </div>
        <SampleNote />
      </div>
    </ContextFrame>
  );
}

function ContextOfUse() {
  return (
    <ContextFrame
      brand="DOTORI / FIELD NOTES"
      chrome="workspace"
      label="퇴근길 버스 안에서 한 손으로 수업 준비물을 확인하는 맥락"
    >
      <div className="ca-use-context">
        <WorkspaceHeader title="퇴근길, 18:42" section="사용 맥락" />
        <div className="ca-context-scene">
          <div className="ca-bus-window">
            <ContextPhoto asset="forest" alt="버스 창밖으로 지나가는 녹지의 표현" />
            <span>버스 안 · 이동 중</span>
            <div className="ca-bus-handle" aria-hidden="true" />
          </div>
          <div className="ca-phone-mock">
            <div className="ca-phone-status">
              18:42 <span>LTE ▰</span>
            </div>
            <div className="ca-phone-header">
              dotori. <MenuGlyph />
            </div>
            <Kicker>TODAY’S CLASS</Kicker>
            <h6>
              UI 디자인
              <br />
              저녁 7:30
            </h6>
            <div className="ca-context-highlight">
              <strong>오늘의 준비물</strong>
              <p>
                노트북 · 충전기
                <br />
                지난주 화면 설계 파일
              </p>
            </div>
            <span className="ca-product-button">수업 안내 보기</span>
            <small>한 손으로 빠르게 확인</small>
          </div>
        </div>
        <div className="ca-context-facts">
          <span>
            <b>목표</b>준비물 확인
          </span>
          <span>
            <b>환경</b>이동·소음·한 손
          </span>
          <span>
            <b>제약</b>하차 전 짧은 시간
          </span>
        </div>
      </div>
    </ContextFrame>
  );
}
function MenuGlyph() {
  return (
    <span className="ca-menu-glyph" aria-hidden="true">
      ☰
    </span>
  );
}

function Users({ group }: { group: boolean }) {
  const records = group
    ? [
        {
          title: "이동 중 복습",
          name: "짧은 시간 · 휴대전화",
          task: "오늘 배운 것 다시 보기",
          details: ["10분 핵심 구간", "데이터 사용량 확인"],
          mobile: true,
        },
        {
          title: "집중해서 과제",
          name: "긴 시간 · 큰 화면",
          task: "과제 03 · 화면 설계",
          details: ["상세 제출 안내", "피드백과 작업 나란히"],
          mobile: false,
        },
      ]
    : [
        {
          title: "학생",
          name: "자료를 배우는 사람",
          task: "오늘의 학습 자료",
          details: ["UI 디자인 워크북", "내 제출 내역"],
          mobile: true,
        },
        {
          title: "강사",
          name: "학습을 운영하는 사람",
          task: "수업 자료 관리",
          details: ["자료 등록 · 공개", "수강생 제출 확인"],
          mobile: false,
        },
        {
          title: "운영자",
          name: "계정을 관리하는 사람",
          task: "계정 승인 대기",
          details: ["신규 계정 검토", "수강 문의 처리"],
          mobile: false,
        },
      ];
  return (
    <ContextFrame
      brand="DOTORI / USER CONTEXTS"
      chrome="workspace"
      label={
        group
          ? "목표와 상황에 따라 달라지는 두 사용자 그룹"
          : "같은 서비스에서 다른 목표로 사용하는 학생, 강사, 운영자"
      }
    >
      <div className="ca-users">
        <WorkspaceHeader
          title={group ? "같은 서비스, 다른 이용 조건" : "같은 제품을 사용하는 사람들"}
          section={group ? "사용자 그룹" : "사용자"}
        />
        <div className="ca-user-panels">
          {records.map((r, i) => (
            <article key={r.title}>
              <div className="ca-user-heading">
                <Member initial={["Y", "J", "M"][i] ?? "Y"} name={r.title} />
                <small>{r.name}</small>
              </div>
              <div className={`ca-role-screen ${r.mobile ? "ca-role-screen-mobile" : ""}`}>
                <div className="ca-product-nav">
                  <b>dotori.</b>
                  <i>{i + 1}</i>
                </div>
                <h6>{r.task}</h6>
                {r.details.map((d, j) => (
                  <div className="ca-user-task" key={d}>
                    {j ? <Folder size={17} /> : <FileText size={17} />}
                    <span>{d}</span>
                    <ChevronRight size={14} />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        <p className="ca-plain-note">
          {group
            ? "한 사람이 상황에 따라 두 그룹의 행동을 모두 보일 수 있습니다."
            : "구매자만이 아니라, 실제로 제품과 상호작용하는 사람을 살펴봅니다."}
        </p>
      </div>
    </ContextFrame>
  );
}

function EmpathyMap({ figure, aggregated }: { figure: LearningFigure; aggregated: boolean }) {
  return (
    <ContextFrame
      brand="DOTORI / RESEARCH BOARD"
      chrome="workspace"
      label={
        aggregated
          ? "여러 신규 수강생의 자료를 종합한 엠퍼시 맵"
          : "한 사용자의 말, 생각, 행동, 감정을 정리한 엠퍼시 맵"
      }
    >
      <div className="ca-empathy">
        <WorkspaceHeader
          title={aggregated ? "신규 수강생의 첫 수업" : "저장을 확인하는 민서"}
          section="엠퍼시 맵"
        />
        <div className="ca-empathy-subject">
          <span className="ca-map-avatar">{aggregated ? "A B C" : "M"}</span>
          <div>
            <strong>{aggregated ? "여러 참여자의 공통 경험" : "한 참여자의 경험"}</strong>
            <p>
              {aggregated
                ? "개인별 기록을 함께 읽되 차이를 남깁니다."
                : "관찰한 사실과 추정한 감정을 구분합니다."}
            </p>
          </div>
        </div>
        <div className="ca-empathy-quadrants">
          {figure.items.map((item, i) => (
            <section key={item.label} className={`ca-empathy-q-${i}`}>
              <h6>
                <span>{["SAYS", "THINKS", "DOES", "FEELS"][i]}</span>
                {item.label}
              </h6>
              <div className="ca-sticky">
                <p>{item.text}</p>
                <small>{i === 0 || i === 2 ? "관찰·발언 예시" : "해석 · 추가 확인 필요"}</small>
              </div>
              {aggregated && (
                <div className="ca-source-chips">
                  <span>{i === 0 ? "참여자 A·C" : "참여자 B·C"}</span>
                  <span>공통점 + 차이 기록</span>
                </div>
              )}
            </section>
          ))}
        </div>
        <SampleNote />
      </div>
    </ContextFrame>
  );
}

function TouchpointScreen({
  kind,
  issue = false,
  context = "exhibition",
}: {
  kind: number;
  issue?: boolean;
  context?: "exhibition" | "learning" | "assignment" | "workshop";
}) {
  const assignment = context === "assignment",
    learning = context === "learning",
    workshop = context === "workshop";
  return (
    <div className={`ca-touchpoint-screen ${issue ? "ca-touchpoint-issue" : ""}`}>
      <div className="ca-touchpoint-top">
        {kind === 0
          ? assignment || learning
            ? "DOTORI."
            : workshop
              ? "공방 모아"
              : "MORAE."
          : ["", "신청 정보", "받은 안내", "수업 공간"][kind]}
      </div>
      {kind === 0 ? (
        assignment ? (
          <>
            <strong>과제는 어디에?</strong>
            <div className="ca-assignment-nav">
              <span>수업 자료</span>
              <span>과제</span>
            </div>
            <span className="ca-fake-field">card-design.pdf</span>
            <small>어느 메뉴에서 제출하는지 찾는 중</small>
            <div className="ca-mini-search">
              <Search size={14} /> 제출 안내 검색
            </div>
          </>
        ) : (
          <>
            <ContextPhoto
              asset={learning ? "forest" : "coast"}
              alt={
                learning
                  ? "수업 소개에 사용된 숲 사진"
                  : workshop
                    ? "공방 프로그램의 풍경 이미지"
                    : "전시 소개의 바다 풍경"
              }
            />
            <strong>
              {learning ? "UI 디자인 첫걸음" : workshop ? "주말 도자기 공방" : "바라보는 시간"}
            </strong>
            <small>
              {learning
                ? "일요일 · 10:00 · 수업 소개"
                : workshop
                  ? "일정 · 참가비 · 프로그램"
                  : "일정과 관람 안내"}
            </small>
          </>
        )
      ) : kind === 1 ? (
        <>
          <span className="ca-field-label">{assignment ? "과제" : "참여자 이름"}</span>
          <span className="ca-fake-field">{assignment ? "03 카드 컴포넌트" : "윤서"}</span>
          <span className="ca-field-label">
            {issue ? "파일 첨부" : learning ? "수업 일정" : "방문 날짜"}
          </span>
          <span className="ca-fake-field">{issue ? "design.psd" : "11월 15일"}</span>
          <span className={issue ? "ca-small-error" : "ca-mini-button"}>
            {issue ? "지원하지 않는 파일입니다" : workshop ? "예약 요청" : "신청 완료"}
          </span>
        </>
      ) : kind === 2 ? (
        <>
          <span className="ca-email-stamp">
            <Check size={18} />
          </span>
          <strong>
            {issue ? "처리되었습니다" : workshop ? "예약 요청을 보냈어요" : "신청이 완료되었어요"}
          </strong>
          <small>
            {issue
              ? "첨부된 파일은 어디 있지?"
              : learning
                ? "참여 링크와 준비물을 확인하세요."
                : workshop
                  ? "확정 안내는 알림으로 알려드려요."
                  : "예약 일시와 입장 방법을 확인하세요."}
          </small>
          <span className="ca-mini-button">안내 확인</span>
        </>
      ) : (
        <>
          <span className="ca-session-circle">01</span>
          <strong>첫 수업 시작하기</strong>
          <small>오늘의 활동과 진행 순서</small>
          <span className="ca-mini-button">활동 자료 열기</span>
        </>
      )}
    </div>
  );
}
function Journey({ termId, figure }: Props) {
  const pain = termId === "pain-points",
    ux = termId === "user-experience";
  const emotion = pain
    ? ["어디에 있지?", "다시 바꿔야 하네", "제출된 게 맞을까?"]
    : ux
      ? ["기대", "확인하고 안심", "방문 준비"]
      : ["관심", "확인 필요", "안심", "참여"];
  return (
    <ContextFrame
      brand="DOTORI / EXPERIENCE MAP"
      chrome="workspace"
      label={
        pain
          ? "과제 제출 여정의 세 지점에서 드러나는 페인 포인트"
          : "접점, 행동, 감정이 이어지는 사용자 경험 지도"
      }
    >
      <div className="ca-journey">
        <WorkspaceHeader title={figure.title} section={pain ? "페인 포인트" : "저니 맵"} />
        <div className="ca-journey-person">
          <Member name="윤서" />
          <span>
            {pain
              ? "목표: 올바른 과제 파일 제출"
              : ux
                ? "목표: 관심 있는 전시 예약"
                : "목표: 수업 신청 후 첫 참여"}
          </span>
          <Tag>가상 시나리오</Tag>
        </div>
        <div className="ca-journey-stages">
          {figure.items.map((item, i) => (
            <section key={item.label}>
              <div className="ca-stage-head">
                <span>0{i + 1}</span>
                <h6>{item.label}</h6>
              </div>
              <TouchpointScreen
                kind={i}
                issue={pain}
                context={pain ? "assignment" : ux ? "exhibition" : "learning"}
              />
              <div className="ca-map-row">
                <small>행동</small>
                <p>{item.text}</p>
              </div>
              <div className={`ca-emotion ${pain ? "ca-emotion-pain" : ""}`}>
                <span aria-hidden="true">{pain ? "↘" : i === 0 ? "↗" : i === 1 ? "→" : "↗"}</span>
                {emotion[i]}
              </div>
              <div className="ca-map-row ca-map-insight">
                <small>{pain ? "어려움" : "생각과 질문"}</small>
                <p>{item.detail}</p>
              </div>
            </section>
          ))}
        </div>
        {ux && (
          <div className="ca-journey-range">
            <span>사용 전</span>
            <i />
            <span>사용 중</span>
            <i />
            <span>사용 후</span>
          </div>
        )}
      </div>
    </ContextFrame>
  );
}

const affinityNotes = [
  {
    topic: "일정 선택",
    color: "yellow",
    notes: ["빈 날짜와 마감된 날짜가 헷갈려요.", "시간대를 바꾸면 고른 날짜가 사라져요."],
    insight: "선택 상태를 계속 보여 주기",
  },
  {
    topic: "가격 정보",
    color: "purple",
    notes: ["마지막 화면에서 추가 요금을 봤어요.", "이 가격이 1명 기준인지 모르겠어요."],
    insight: "총액과 기준을 미리 안내하기",
  },
];
function Affinity({ simple }: { simple: boolean }) {
  return (
    <ContextFrame
      brand="DOTORI / ANALYSIS"
      chrome="workspace"
      label={
        simple
          ? "공통된 필요로 연결되는 두 발언과 다른 주제의 발언"
          : "인터뷰 메모를 유사한 주제로 묶은 어피니티 다이어그램"
      }
    >
      <div className="ca-affinity">
        <WorkspaceHeader
          title={simple ? "표현은 달라도, 같은 필요" : "빈자리 예약 조사"}
          section="인터뷰 분석"
        />
        <div className="ca-board-tools">
          <span>관찰 메모</span>
          <span>→</span>
          <b>주제별 묶음</b>
          <span>→</span>
          <span>해석</span>
        </div>
        {simple ? (
          <div className="ca-affinity-simple">
            <section className="ca-affinity-group ca-affinity-yellow">
              <h6>비용을 먼저 알고 싶다</h6>
              <div className="ca-sticky">
                <p>“결제 전에 총액을 알고 싶어요.”</p>
                <small>참여자 A</small>
              </div>
              <div className="ca-sticky">
                <p>“마지막에 배송비가 붙었어요.”</p>
                <small>참여자 B</small>
              </div>
              <span className="ca-connection-label">같은 단어보다 의미의 연관성</span>
            </section>
            <section className="ca-affinity-group ca-affinity-purple">
              <h6>언제 도착하는가</h6>
              <div className="ca-sticky">
                <p>“주말 전에 받을 수 있을까요?”</p>
                <small>참여자 C</small>
              </div>
              <span className="ca-connection-label">다른 필요로 묶기</span>
            </section>
          </div>
        ) : (
          <div className="ca-affinity-columns">
            {affinityNotes.map((group) => (
              <section key={group.topic} className={`ca-affinity-group ca-affinity-${group.color}`}>
                <h6>
                  {group.topic}
                  <span>2</span>
                </h6>
                {group.notes.map((note, i) => (
                  <div className="ca-sticky" key={note}>
                    <p>“{note}”</p>
                    <small>참여자 {i ? "B" : "A"} · 발언</small>
                  </div>
                ))}
                <div className="ca-board-insight">
                  <ArrowRight size={17} />
                  <span>{group.insight}</span>
                </div>
              </section>
            ))}
          </div>
        )}
        <SampleNote>
          가상 인터뷰 메모입니다. 묶음은 분석 결과이며 해결안은 별도 검증이 필요합니다.
        </SampleNote>
      </div>
    </ContextFrame>
  );
}

function Assets() {
  return (
    <ContextFrame
      brand="DOTORI / HANDOFF"
      chrome="workspace"
      label="로고, 사진, 아이콘, 디자인 토큰과 상태 명세가 모인 디자인 에셋 파일 뷰"
    >
      <div className="ca-assets">
        <WorkspaceHeader title="프로젝트 에셋" section="개발 전달" />
        <div className="ca-file-toolbar">
          <span>
            전체 파일 <b>6</b>
          </span>
          <span>최신 버전 ↓</span>
        </div>
        <div className="ca-asset-grid">
          <article>
            <div className="ca-asset-preview ca-logo-preview">dotori.</div>
            <b>dotori-logo.svg</b>
            <small>브랜드 · 벡터</small>
          </article>
          <article>
            <div className="ca-asset-preview ca-icons-preview">
              <Bookmark />
              <Search />
              <Folder />
              <Check />
            </div>
            <b>icons.svg</b>
            <small>아이콘 · 24px 기준</small>
          </article>
          <article>
            <div className="ca-asset-preview">
              <ContextPhoto asset="forest" alt="전달할 숲 이미지 에셋" />
            </div>
            <b>reading-cover.jpg</b>
            <small>사진 · 사용 출처 포함</small>
          </article>
          <article>
            <div className="ca-asset-preview ca-token-preview">
              <i />
              <i />
              <i />
            </div>
            <b>color-tokens.json</b>
            <small>디자인 값 · 의미별 색</small>
          </article>
          <article>
            <div className="ca-asset-preview ca-style-preview">
              <span>Aa</span>
              <small>16 / 24 / Semibold</small>
            </div>
            <b>text-styles</b>
            <small>글꼴 · 크기 · 행간</small>
          </article>
          <article>
            <div className="ca-asset-preview ca-button-preview">
              <span>자료 저장</span>
              <span>자료 저장</span>
            </div>
            <b>button-states</b>
            <small>기본 · 포커스 · 비활성</small>
          </article>
        </div>
        <div className="ca-asset-manifest">
          <FileText size={18} />
          <span>
            <b>README · 사용 명세</b>
            <small>크기 · 상태 · 사용 조건 · 출처 · 담당자</small>
          </span>
          <Tag>함께 전달</Tag>
        </div>
      </div>
    </ContextFrame>
  );
}

function BrandIdentity() {
  return (
    <ContextFrame
      brand="MORAE / BRAND GUIDELINES"
      chrome="document"
      label="모래 책방의 이름, 표현 태도, 색, 서체, 말투와 화면 적용"
    >
      <div className="ca-brand-board">
        <div className="ca-brand-masthead">
          <span>모래.</span>
          <div>
            <Kicker>BRAND IDENTITY</Kicker>
            <h5>
              천천히 읽고,
              <br />
              오래 나누다.
            </h5>
          </div>
        </div>
        <div className="ca-brand-grid">
          <section>
            <Kicker>01 / TYPOGRAPHY</Kicker>
            <strong className="ca-brand-type">
              가까운 책방,
              <br />
              편안한 문장.
            </strong>
            <p>명료한 본문 · 넉넉한 행간</p>
          </section>
          <section>
            <Kicker>02 / COLOUR</Kicker>
            <div className="ca-brand-swatches">
              <span>
                INK
                <br />
                #242A25
              </span>
              <span>
                PAPER
                <br />
                #F3F0E8
              </span>
              <span>
                LEAF
                <br />
                #587465
              </span>
            </div>
          </section>
          <section>
            <Kicker>03 / VOICE</Kicker>
            <blockquote>
              “다음 책을
              <br />
              함께 골라 볼까요?”
            </blockquote>
            <p>재촉하지 않고, 다정하게 제안합니다.</p>
          </section>
          <section className="ca-brand-application">
            <div className="ca-brand-mini-nav">
              모래. <span>책과 사람 / 모임</span>
            </div>
            <ContextPhoto asset="forest" alt="책방 웹페이지에 적용한 숲 이미지" />
            <strong>
              이번 토요일,
              <br />
              숲을 읽어요.
            </strong>
            <span className="ca-mini-button">모임 살펴보기 →</span>
          </section>
        </div>
        <SampleNote>
          가상 브랜드입니다. 로고뿐 아니라 여러 접점의 표현이 같은 태도를 전달합니다.
        </SampleNote>
      </div>
    </ContextFrame>
  );
}

function DesignSystem() {
  return (
    <ContextFrame
      brand="DOTORI / DESIGN SYSTEM"
      chrome="workspace"
      label="버튼의 상태, 토큰, 사용 지침과 변경 관리가 함께 있는 디자인 시스템"
    >
      <div className="ca-system">
        <aside className="ca-system-nav">
          <b>
            dotori.<small>DESIGN SYSTEM</small>
          </b>
          <span>원칙</span>
          <span>파운데이션</span>
          <strong>컴포넌트</strong>
          <i>Button</i>
          <span>패턴</span>
          <span>변경 기록</span>
        </aside>
        <div className="ca-artifact-main">
          <Kicker>COMPONENTS / ACTION</Kicker>
          <h5>Button</h5>
          <p>사용자가 다음 행동을 명확하게 선택할 수 있도록 합니다.</p>
          <div className="ca-system-tabs">
            <b>사용법</b>
            <span>상태</span>
            <span>접근성</span>
            <span>변경 기록</span>
          </div>
          <div className="ca-button-states">
            <div>
              <small>Default</small>
              <span>자료 저장</span>
            </div>
            <div>
              <small>Focus</small>
              <span className="ca-state-focus">자료 저장</span>
            </div>
            <div>
              <small>Disabled</small>
              <span className="ca-state-disabled">자료 저장</span>
            </div>
          </div>
          <div className="ca-system-specs">
            <section>
              <h6>연결된 토큰</h6>
              <dl>
                <dt>color.action.primary</dt>
                <dd>
                  <i />
                  #315F4E
                </dd>
                <dt>radius.control</dt>
                <dd>8px</dd>
                <dt>space.control.inline</dt>
                <dd>16px</dd>
              </dl>
            </section>
            <section className="ca-system-guidance">
              <h6>사용 지침</h6>
              <p>결과를 예상할 수 있는 행동형 라벨을 씁니다.</p>
              <span className="ca-guideline-good">✓ 자료 저장</span>
              <span className="ca-guideline-avoid">검토: ‘클릭’만 쓰면 결과가 불명확</span>
            </section>
          </div>
          <div className="ca-system-governance">
            <strong>변경 관리</strong>
            <span>제안 → 접근성·사용 사례 검토 → 승인 → 버전 기록</span>
            <small>담당: 디자인 시스템 팀 · v1.2</small>
          </div>
        </div>
      </div>
      <SampleNote>
        가상 제품의 규칙입니다. 수치와 스타일은 모든 디자인 시스템의 표준이 아닙니다.
      </SampleNote>
    </ContextFrame>
  );
}

function IdeaScreen({
  variant,
  purpose = "assignment",
}: {
  variant: number;
  purpose?: "assignment" | "materials" | "preparation";
}) {
  const preparing = purpose === "preparation",
    materials = purpose === "materials";
  return (
    <div className="ca-idea-screen">
      <div className="ca-idea-nav">
        dotori. <span>HOME</span>
      </div>
      {variant === 0 ? (
        <>
          <h6>오늘의 수업</h6>
          <div className="ca-idea-card">
            <small>UI DESIGN · 03</small>
            <b>카드 컴포넌트</b>
            <span>수업 자료</span>
            <span className="ca-idea-highlight">
              {preparing ? "준비물 확인 →" : materials ? "수업 자료 열기 →" : "과제 확인 →"}
            </span>
          </div>
        </>
      ) : variant === 1 ? (
        <>
          <h6>
            {preparing ? "다가오는 수업" : materials ? "처음 시작하는 수업" : "곧 마감하는 과제"}
          </h6>
          <div className="ca-idea-deadline">
            <CalendarDays size={24} />
            <b>{preparing ? "오늘 저녁" : materials ? "처음이라면" : "오늘까지"}</b>
          </div>
          <div className="ca-idea-highlight">
            {preparing
              ? "카드 컴포넌트 · 준비물"
              : materials
                ? "첫 수업의 자료 모음"
                : "03 카드 컴포넌트 제출"}
          </div>
        </>
      ) : (
        <>
          <h6>어떤 자료를 찾나요?</h6>
          <div className="ca-idea-search">
            <Search size={15} /> 카드 컴포넌트
          </div>
          <div className="ca-idea-highlight">
            {preparing
              ? "준비물 03 · 확인 →"
              : materials
                ? "자료 03 · 화면 설계 워크북 →"
                : "과제 03 · 제출 안내 →"}
          </div>
          <p>수업 · 자료 · 과제 통합 검색</p>
        </>
      )}
    </div>
  );
}
function Ideation({ termId, figure }: Props) {
  const thinking = termId === "design-thinking",
    whiteboard = termId === "whiteboard-interview";
  if (thinking)
    return (
      <ContextFrame
        brand="DOTORI / DESIGN PROCESS"
        chrome="workspace"
        label="조사에서 문제를 정의하고 대안을 만들고 테스트한 뒤 다시 검토하는 디자인 씽킹 보드"
      >
        <div className="ca-thinking">
          <WorkspaceHeader title="준비물을 찾기 쉬운 수업" section="디자인 씽킹" />
          <div className="ca-thinking-steps">
            {figure.items.map((item, i) => (
              <section key={item.label}>
                <span className="ca-number">0{i + 1}</span>
                <h6>{item.label}</h6>
                {i === 0 ? (
                  <div className="ca-sticky">
                    <p>“수업 공지와 소개를 번갈아 보고 있어요.”</p>
                    <small>관찰 메모 · 가상</small>
                  </div>
                ) : i === 1 ? (
                  <div className="ca-problem-note">
                    <strong>어떻게 하면</strong>
                    <p>
                      흩어진 준비물 정보를
                      <br />
                      수업 전에 모아 볼까?
                    </p>
                  </div>
                ) : (
                  <IdeaScreen variant={i === 2 ? 0 : 1} purpose="preparation" />
                )}
                <p>{item.text}</p>
              </section>
            ))}
          </div>
          <div className="ca-return-path">
            ↶ 테스트에서 발견한 새 필요를 바탕으로 문제 정의와 아이디어를 다시 검토
          </div>
        </div>
      </ContextFrame>
    );
  return (
    <ContextFrame
      brand="DOTORI / IDEATION BOARD"
      chrome="workspace"
      label={
        whiteboard
          ? "질문, 가정과 화면 흐름을 설명하는 화이트보드 인터뷰"
          : "같은 문제에 대해 서로 다른 화면 해결안을 만든 아이데이션 보드"
      }
    >
      <div className="ca-ideation">
        <WorkspaceHeader
          title={
            whiteboard
              ? "공방 예약을 쉽게 만들려면?"
              : termId === "ideate"
                ? "과제 제출 위치를 어떻게 찾게 할까?"
                : "처음 온 학생이 자료에 도달하려면?"
          }
          section={whiteboard ? "화이트보드 인터뷰" : "아이데이션"}
        />
        {whiteboard ? (
          <>
            <div className="ca-whiteboard-notes">
              <div className="ca-sticky">
                <b>질문</b>
                <p>누가, 어떤 기기로 예약하나요?</p>
              </div>
              <div className="ca-sticky">
                <b>가정</b>
                <p>가능한 날짜와 최종 금액을 함께 확인해야 한다.</p>
              </div>
            </div>
            <div className="ca-whiteboard-flow">
              <div>
                <span>공방 선택</span>
                <TouchpointScreen kind={0} context="workshop" />
              </div>
              <ArrowRight size={21} />
              <div>
                <span>날짜 확인</span>
                <TouchpointScreen kind={1} context="workshop" />
              </div>
              <ArrowRight size={21} />
              <div>
                <span>예약 요청</span>
                <TouchpointScreen kind={2} context="workshop" />
              </div>
            </div>
            <div className="ca-return-path">↶ 날짜 변경 · 마감 · 오류 경로도 함께 논의</div>
          </>
        ) : (
          <>
            <p className="ca-board-question">
              하나의 답을 확정하기 전에, 서로 다른 진입 경로를 구체적으로 만듭니다.
            </p>
            <div className="ca-idea-columns">
              {["수업 안에서", "시간을 기준으로", "검색으로 바로"].map((name, i) => (
                <section key={name}>
                  <div className="ca-idea-label">
                    <span>{String.fromCharCode(65 + i)}</span>
                    <strong>{name}</strong>
                  </div>
                  <IdeaScreen
                    variant={i}
                    purpose={termId === "ideation" ? "materials" : "assignment"}
                  />
                  <p>
                    {
                      (termId === "ideation"
                        ? [
                            "오늘 수업의 자료 연결",
                            "첫 수업의 자료 모음 안내",
                            "제목을 아는 사람의 탐색",
                          ]
                        : [
                            "수업 카드와 과제 연결",
                            "임박한 마감부터 안내",
                            "제목을 아는 사람의 탐색",
                          ])[i]
                    }
                  </p>
                </section>
              ))}
            </div>
            <div className="ca-idea-bottom">
              <Tag>대안 3개</Tag>
              <span>선택 전: 상황별 장점과 검증할 가정 비교</span>
            </div>
          </>
        )}
        <SampleNote />
      </div>
    </ContextFrame>
  );
}

function ResearchWorkspace({ termId }: { termId: string }) {
  const qualitative = termId === "qualitative-research",
    recency = termId === "recency-bias";
  return (
    <ContextFrame
      brand="DOTORI / RESEARCH REPOSITORY"
      chrome="workspace"
      label={
        recency
          ? "최근의 한 의견이 이전 조사 기록보다 과도하게 강조된 검토 화면"
          : qualitative
            ? "인터뷰 발언과 관찰을 해석과 구분한 정성 리서치 기록"
            : "연구 질문과 수집 근거, 분석, 설계 결정을 연결한 UX 리서치 저장소"
      }
    >
      <div className="ca-research-work">
        <WorkspaceHeader
          title={
            recency
              ? "예약 인터뷰 검토"
              : qualitative
                ? "결제 화면에서 멈춘 이유"
                : "제출 완료를 다시 묻는 이유"
          }
          section="리서치"
        />
        {recency ? (
          <div className="ca-recency-layout">
            <section>
              <div className="ca-research-table-head">
                <span>세션</span>
                <span>발견한 내용</span>
              </div>
              {["A", "B", "C", "D", "E"].map((id, i) => (
                <div className={`ca-research-record ${i === 4 ? "ca-recent-record" : ""}`} key={id}>
                  <span>참여자 {id}</span>
                  <p>{i === 4 ? "대표 사진이 작게 느껴졌다." : "가격 안내를 찾기 어려웠다."}</p>
                  {i === 4 && <small>마지막 인터뷰</small>}
                </div>
              ))}
            </section>
            <aside className="ca-recency-summary">
              <Tag>검토가 필요한 판단</Tag>
              <h6>“사진부터 키워야겠어.”</h6>
              <p>
                마지막 의견은 선명하지만,
                <br />
                앞선 기록도 함께 검토해야 합니다.
              </p>
              <strong>전체 기록으로 돌아가기 ↶</strong>
            </aside>
          </div>
        ) : (
          <>
            <div className="ca-research-question">
              <Kicker>RESEARCH QUESTION</Kicker>
              <h6>
                {qualitative
                  ? "왜 총액을 보고도 결제를 멈출까?"
                  : "왜 첨부 뒤에도 제출 완료 여부를 문의할까?"}
              </h6>
            </div>
            <div className="ca-research-split">
              <section className="ca-transcript">
                <div className="ca-transcript-head">
                  <MessageSquare size={17} />
                  <b>참여자 A · 인터뷰</b>
                  <small>가상 기록</small>
                </div>
                <div className="ca-audio-strip">
                  <span>▶</span>
                  <i />
                  <span>02:14 / 08:32</span>
                </div>
                <div className="ca-transcript-line">
                  <time>02:14</time>
                  <blockquote>
                    {qualitative
                      ? "“결제 뒤에 요금이 더 붙을까 봐 멈췄어요.”"
                      : "“파일을 올렸는데, 이게 제출된 건가요?”"}
                  </blockquote>
                </div>
                <div className="ca-transcript-line">
                  <time>02:36</time>
                  <p>
                    {qualitative
                      ? "총액 아래 작은 안내를 두 번 읽고 이전 화면으로 이동함."
                      : "첨부한 파일명을 확인한 뒤 제출 버튼을 누르지 않고 기다림."}
                  </p>
                </div>
                <span className="ca-evidence-tag">
                  {qualitative ? "추가 비용 불확실성" : "첨부와 제출 혼동"}
                </span>
              </section>
              <section className="ca-analysis-note">
                <Kicker>ANALYSIS</Kicker>
                <h6>발언 → 관찰 → 해석</h6>
                <div>
                  <small>관찰한 사실</small>
                  <p>
                    {qualitative
                      ? "안내를 다시 읽고 이전 화면으로 갔다."
                      : "파일을 첨부한 뒤 제출을 완료하지 않았다."}
                  </p>
                </div>
                <div>
                  <small>검토할 해석</small>
                  <p>
                    {qualitative
                      ? "추가 요금에 대한 불확실성이 진행을 막았을 수 있다."
                      : "완료 상태의 차이를 이해하기 어려웠을 수 있다."}
                  </p>
                </div>
                <div className="ca-research-design-link">
                  <ArrowRight size={16} />
                  <span>
                    {qualitative ? "총액 안내와 포함 항목 검토" : "첨부·제출 상태를 나누어 설계"}
                  </span>
                </div>
              </section>
            </div>
          </>
        )}
        <SampleNote>
          모든 발언과 행동 기록은 교육용 가상 자료입니다. 해석을 사실이나 전체 사용자 비율로
          단정하지 않습니다.
        </SampleNote>
      </div>
    </ContextFrame>
  );
}

function Retrospective({ figure }: { figure: LearningFigure }) {
  return (
    <ContextFrame
      brand="DOTORI / TEAM RETRO"
      chrome="workspace"
      label="유지할 점, 어려움과 다음 실험을 정리한 팀 회고 보드"
    >
      <div className="ca-retro">
        <WorkspaceHeader title="첫 배포를 돌아보며" section="RETROSPECTIVE" />
        <div className="ca-retro-meta">
          <Tag>이번 회고 · 30분</Tag>
          <span>진행자 J · 참여 M, S</span>
        </div>
        <div className="ca-retro-columns">
          {figure.items.map((item, i) => (
            <section key={item.label}>
              <h6>
                <span>{["KEEP", "PROBLEM", "TRY"][i]}</span>
                {item.label}
              </h6>
              <div className="ca-sticky">
                <p>{item.text}</p>
                <small>{i === 2 ? "담당 J · 다음 주 수요일" : "가상 팀원 메모"}</small>
              </div>
              {i === 2 && (
                <div className="ca-retro-action">
                  <CalendarDays size={17} />
                  <span>다음 회고에서 효과 확인</span>
                </div>
              )}
            </section>
          ))}
        </div>
        <SampleNote>
          개인을 평가하기보다 일하는 방식과 다음 행동을 정하는 가상 회고입니다.
        </SampleNote>
      </div>
    </ContextFrame>
  );
}

function InformationArchitecture({ termId, figure }: Props) {
  const store = termId === "hierarchical-model",
    ia = termId === "information-architecture-ia";
  const categories = store
    ? [
        { name: "의류", children: ["셔츠", "재킷", "바지"], leaf: "옥스퍼드 셔츠 · 린넨 셔츠" },
        { name: "신발", children: ["스니커즈", "로퍼"], leaf: "로우탑 · 하이탑" },
        { name: "액세서리", children: ["가방", "모자"], leaf: "토트백 · 백팩" },
      ]
    : [
        { name: "수업", children: ["수업 목록", "회차별 자료"], leaf: "자료 상세" },
        { name: "과제", children: ["과제 목록", "제출 내역"], leaf: "과제 상세 · 피드백" },
        { name: "계정", children: ["프로필", "보안 설정"], leaf: "비밀번호 변경" },
      ];
  return (
    <ContextFrame
      brand={store ? "STILL / STRUCTURE" : "DOTORI / STRUCTURE"}
      chrome="workspace"
      label={
        ia
          ? "분류와 명칭을 사이트 메뉴 및 콘텐츠에 연결한 정보 구조"
          : store
            ? "상위 범주에서 하위 범주로 이어지는 계층형 정보 구조"
            : "홈에서 하위 페이지로 이어지는 사이트맵"
      }
    >
      <div className="ca-ia">
        <WorkspaceHeader
          title={
            ia
              ? "이름을 정하고, 콘텐츠를 묶다"
              : store
                ? "스토어의 계층 구조"
                : "학습 사이트의 페이지 지도"
          }
          section={ia ? "정보 구조" : "사이트맵"}
        />
        <div className="ca-ia-tree">
          <div className="ca-ia-root">{store ? "스토어" : "홈"}</div>
          <div className="ca-ia-branches">
            {categories.map((cat, i) => (
              <section key={cat.name}>
                <div className="ca-ia-branch-node">
                  <span>0{i + 1}</span>
                  {cat.name}
                </div>
                <div className="ca-ia-children">
                  {cat.children.map((child) => (
                    <span key={child}>{child}</span>
                  ))}
                </div>
                <small>{cat.leaf}</small>
              </section>
            ))}
          </div>
        </div>
        {ia && (
          <div className="ca-ia-application">
            <Kicker>구조를 화면에 적용</Kicker>
            <div className="ca-product-nav">
              <b>dotori.</b>
              {categories.map((cat) => (
                <span key={cat.name}>{cat.name}</span>
              ))}
            </div>
            <div className="ca-ia-content">
              <h6>내 수업</h6>
              <span>
                <Folder size={16} /> UI 디자인 · 4개 자료
              </span>
              <span>
                <Folder size={16} /> UX 리서치 · 3개 자료
              </span>
            </div>
          </div>
        )}
        <p className="ca-plain-note">{figure.caption}</p>
      </div>
    </ContextFrame>
  );
}

function SubmissionScreen({ version, issue = false }: { version: number; issue?: boolean }) {
  return (
    <div className="ca-submission-screen">
      <div className="ca-product-nav">
        <b>dotori.</b>
        <small>과제 03</small>
      </div>
      <h6>카드 컴포넌트 설계</h6>
      <p>화면 파일을 첨부하고 제출하세요.</p>
      <div className="ca-upload-area">
        <Upload size={22} />
        <strong>{version === 0 ? "파일 선택" : "card-design.pdf"}</strong>
        {version > 0 && <span className="ca-upload-state">✓ 업로드 완료</span>}
      </div>
      {version === 0 ? (
        <span className="ca-subtle-submit">보내기</span>
      ) : version === 1 ? (
        <span className="ca-product-button">과제 제출</span>
      ) : (
        <>
          <div className={`ca-submitted ${issue ? "ca-submitted-issue" : ""}`}>
            <Check size={18} />
            <strong>{issue ? "파일을 첨부했어요" : "과제가 제출되었어요"}</strong>
          </div>
          <span className="ca-submission-return">
            {issue ? "‘제출’ 버튼을 눌러 완료하세요" : "내 제출 목록 보기 →"}
          </span>
        </>
      )}
    </div>
  );
}

function Iteration() {
  return (
    <ContextFrame
      brand="DOTORI / DESIGN HISTORY"
      chrome="workspace"
      label="관찰한 문제를 바탕으로 과제 제출 화면이 세 번 수정된 이터레이션 기록"
    >
      <div className="ca-iterations">
        <WorkspaceHeader title="제출 경험 · 세 번의 개선" section="버전 기록" />
        <div className="ca-iteration-columns">
          {["버튼을 찾기 어려움", "첨부 상태가 불확실", "다음 행동이 불명확"].map((problem, i) => (
            <section key={problem}>
              <div className="ca-iteration-heading">
                <b>v0{i + 1}</b>
                <span>{i === 2 ? "현재 검토안" : "이전 버전"}</span>
              </div>
              <SubmissionScreen version={i} />
              <div className="ca-iteration-note">
                <small>이 회차에서 배운 점</small>
                <strong>{problem}</strong>
                <p>
                  {
                    [
                      "버튼 위치와 명칭 수정",
                      "파일명과 업로드 상태 추가",
                      "제출 완료와 복귀 경로 안내",
                    ][i]
                  }
                </p>
              </div>
            </section>
          ))}
        </div>
        <SampleNote>
          가상의 버전 비교입니다. 실제 테스트 성과나 시간 단축을 의미하지 않습니다.
        </SampleNote>
      </div>
    </ContextFrame>
  );
}

function TestScene() {
  return (
    <ContextFrame
      brand="DOTORI / PROTOTYPE TEST"
      chrome="workspace"
      label="과제 제출 프로토타입과 관찰 질문, 기록, 다음 수정 계획을 함께 놓은 테스트 화면"
    >
      <div className="ca-test">
        <WorkspaceHeader title="‘첨부’와 ‘제출’을 구분할 수 있을까?" section="TEST SESSION" />
        <div className="ca-test-grid">
          <div className="ca-test-prototype">
            <Tag>검토할 프로토타입</Tag>
            <SubmissionScreen version={2} issue />
          </div>
          <div className="ca-test-notes">
            <section>
              <Kicker>01 / TASK</Kicker>
              <h6>과제 파일을 제출해 주세요.</h6>
              <p>진행 방법을 먼저 알려 주지 않고 실제 행동을 관찰합니다.</p>
            </section>
            <section className="ca-observation-box">
              <Kicker>02 / OBSERVE</Kicker>
              <p>언제 제출이 끝났다고 느끼는지, 어디에서 멈추는지 기록합니다.</p>
              <span>관찰 기록 영역 · 아직 테스트하지 않음</span>
            </section>
            <section>
              <Kicker>03 / NEXT ITERATION</Kicker>
              <p>안내를 놓친 지점을 확인하고 다음 시안을 수정합니다.</p>
            </section>
          </div>
        </div>
        <SampleNote>
          교육용 테스트 계획입니다. 테스트 결과나 성공률을 만들어 넣지 않았습니다.
        </SampleNote>
      </div>
    </ContextFrame>
  );
}

function Startup() {
  return (
    <ContextFrame
      brand="MOMENT / TEAM WORKSPACE"
      chrome="workspace"
      label="제품 문제와 사업 가설을 함께 검증하는 가상 스타트업의 프로젝트 보드"
    >
      <div className="ca-startup">
        <WorkspaceHeader title="작은 공방의 예약을 한곳에" section="초기 제품 실험" />
        <div className="ca-startup-layout">
          <div className="ca-startup-product">
            <div className="ca-product-nav">
              <b>moment.</b>
              <span>예약 관리</span>
            </div>
            <h6>이번 주 예약</h6>
            <div className="ca-booking-calendar">
              {["월", "화", "수", "목", "금"].map((d, i) => (
                <div key={d}>
                  <small>{d}</small>
                  <b>{10 + i}</b>
                  {i === 1 || i === 3 ? (
                    <span>
                      원데이
                      <br />
                      클래스
                    </span>
                  ) : (
                    <i>—</i>
                  )}
                </div>
              ))}
            </div>
            <div className="ca-startup-reservation">
              <CalendarDays size={18} />
              <span>
                <b>도자기 클래스</b>
                <small>예약 요청 · 2명</small>
              </span>
              <Tag>확인 대기</Tag>
            </div>
          </div>
          <div className="ca-startup-hypotheses">
            <section>
              <Kicker>사용자 가설</Kicker>
              <h6>문의가 여러 채널에 흩어져 관리하기 어렵다.</h6>
              <p>공방의 현재 업무를 관찰해 확인</p>
            </section>
            <section>
              <Kicker>사업 가설</Kicker>
              <h6>예약 관리에 지속적으로 비용을 지불할까?</h6>
              <p>실제 사용·유지 이유·지불 조건 검증</p>
            </section>
            <span className="ca-status-pending">검증 전 · 가설 단계</span>
          </div>
        </div>
      </div>
    </ContextFrame>
  );
}

function MotionDesign() {
  return (
    <ContextFrame
      brand="DOTORI / MOTION SPEC"
      chrome="workspace"
      label="패널이 열리는 세 시점과 시간, 움직임 감소 조건을 함께 설계한 모션 명세"
    >
      <div className="ca-motion">
        <WorkspaceHeader title="자료 정보 패널" section="MOTION SPECIFICATION" />
        <div className="ca-motion-frames">
          {[0, 150, 300].map((time, i) => (
            <section key={time}>
              <small>{time}ms</small>
              <div className={`ca-motion-screen ca-motion-${i}`}>
                <div className="ca-motion-top">
                  dotori. <span>자료 정보</span>
                </div>
                <div className="ca-motion-document">
                  <FileText size={28} />
                  <strong>리서치 가이드</strong>
                  <span>읽고 있는 자료</span>
                </div>
                <div className="ca-motion-panel">
                  <b>자료 정보</b>
                  <span>PDF · 12페이지</span>
                  <span>UX 리서치 02</span>
                  <small>닫기 ×</small>
                </div>
              </div>
              <strong>{["닫힘", "전환 중", "열림"][i]}</strong>
            </section>
          ))}
        </div>
        <div className="ca-motion-timeline">
          <span>0ms</span>
          <div>
            <i />
          </div>
          <span>300ms</span>
        </div>
        <div className="ca-motion-spec">
          <span>
            <b>목적</b>본문과 추가 정보의 관계를 유지
          </span>
          <span>
            <b>전환</b>패널 위치 + 불투명도 변화
          </span>
          <span>
            <b>움직임 감소</b>전환을 줄이고 최종 정보를 즉시 제공
          </span>
        </div>
        <SampleNote>
          정적 상태 비교이며 자동으로 움직이지 않습니다. 시간값은 이 가상 예제의 선택입니다.
        </SampleNote>
      </div>
    </ContextFrame>
  );
}

function Schedule({ termId, figure }: Props) {
  const sprint = termId === "design-sprint",
    payment = termId === "payment-schedule",
    scope = termId === "scope-creep",
    interview = termId === "second-round-of-interviews",
    apprentice = termId === "apprenticeships";
  if (payment)
    return (
      <ContextFrame
        brand="SEO YUN / PROJECT AGREEMENT"
        chrome="document"
        label="지급 비율과 산출물 검토 조건을 함께 명시한 가상 외주 지급 일정"
      >
        <div className="ca-payment">
          <div className="ca-document-top">
            <Kicker>PROJECT AGREEMENT</Kicker>
            <Tag>가상 합의 예시</Tag>
          </div>
          <h5>브랜드 웹사이트 · 지급 일정</h5>
          <p>각 단계의 산출물과 확인 조건에 맞춰 지급합니다.</p>
          <div className="ca-payment-bar">
            <span>착수 30%</span>
            <span>중간 40%</span>
            <span>완료 30%</span>
          </div>
          <div className="ca-payment-rows">
            {figure.items.map((item, i) => (
              <section key={item.label}>
                <span>0{i + 1}</span>
                <h6>{item.label}</h6>
                <div>
                  <p>{item.text}</p>
                  <small>{item.detail}</small>
                </div>
                <Tag>{["계약 합의", "중간안 검토", "최종 검수"][i]}</Tag>
              </section>
            ))}
          </div>
          <SampleNote>
            비율과 조건은 가상 합의 내용입니다. 실제 프로젝트마다 별도로 정합니다.
          </SampleNote>
        </div>
      </ContextFrame>
    );
  if (scope)
    return (
      <ContextFrame
        brand="DOTORI / PROJECT PLAN"
        chrome="workspace"
        label="작업 범위는 늘지만 일정과 인원이 조정되지 않은 스코프 크리프 사례"
      >
        <div className="ca-scope">
          <WorkspaceHeader title="예약 화면 개편" section="작업 범위" />
          <div className="ca-scope-summary">
            <Tag>마감 2주</Tag>
            <Tag>디자이너 1명</Tag>
            <Tag>예산 조정 없음</Tag>
          </div>
          <div className="ca-scope-columns">
            <section>
              <h6>최초 합의</h6>
              <div className="ca-task-card">
                <span>01</span>
                <b>예약 목록</b>
                <small>합의된 범위</small>
              </div>
              <div className="ca-task-card">
                <span>02</span>
                <b>예약 상세</b>
                <small>합의된 범위</small>
              </div>
            </section>
            <section>
              <h6>같은 일정에 추가</h6>
              <div className="ca-task-card ca-added">
                <span>+</span>
                <b>리뷰 작성</b>
                <small>영향 검토 전</small>
              </div>
              <div className="ca-task-card ca-added">
                <span>+</span>
                <b>알림 설정</b>
                <small>영향 검토 전</small>
              </div>
            </section>
          </div>
          <div className="ca-scope-alert">
            <strong>범위 ↑ / 일정·인원·예산 →</strong>
            <p>추가 요구의 영향을 합의하지 않은 채 작업이 커집니다.</p>
          </div>
        </div>
      </ContextFrame>
    );
  if (interview)
    return (
      <ContextFrame
        brand="NAMU / HIRING"
        chrome="document"
        label="첫 면접 이후 프로젝트 판단과 협업을 더 깊이 확인하는 후속 면접 일정"
      >
        <div className="ca-interview">
          <WorkspaceHeader title="프로덕트 디자이너 · 후속 면접" section="채용 과정" />
          <div className="ca-hiring-steps">
            <span>서류 검토</span>
            <i>→</i>
            <span>첫 면접</span>
            <i>→</i>
            <b>후속 면접</b>
          </div>
          <div className="ca-interview-detail">
            <div className="ca-date-tile">
              <small>NOV</small>
              <b>19</b>
              <span>14:00–15:00</span>
            </div>
            <div>
              <h6>예약 경험 개선 사례를 더 살펴봅니다.</h6>
              <ul>
                <li>왜 이 설계안을 선택했나요?</li>
                <li>개발자와 의견이 달랐을 때 어떻게 조율했나요?</li>
                <li>검증하지 못한 점과 다음 계획은 무엇인가요?</li>
              </ul>
            </div>
          </div>
          <SampleNote>가상 채용 과정입니다. 면접의 순서·형식·시간은 회사마다 다릅니다.</SampleNote>
        </div>
      </ContextFrame>
    );
  const cards = sprint
    ? [
        { label: "MON", title: "문제 이해", work: "목표·집중 지점 합의" },
        { label: "TUE", title: "아이디어", work: "개별 스케치·대안" },
        { label: "WED", title: "결정", work: "검증할 흐름 선택" },
        { label: "THU", title: "프로토타입", work: "테스트용 화면 제작" },
        { label: "FRI", title: "테스트", work: "사용자에게 확인" },
      ]
    : apprentice
      ? [
          { label: "OBSERVE", title: "함께 살펴보기", work: "멘토의 카드 설계 설명" },
          { label: "PRACTICE", title: "실무 참여", work: "작은 화면 영역 담당" },
          { label: "REVIEW", title: "검토와 성장", work: "피드백을 다음 작업에 반영" },
        ]
      : [
          { label: "WEEK 01", title: "팀과 제품 이해", work: "학습 목표·업무 범위" },
          { label: "WEEK 02", title: "실무 관찰", work: "접근성 관찰 기록" },
          { label: "WEEK 03", title: "개선안 제작", work: "작은 프로토타입·멘토 검토" },
          { label: "WEEK 04", title: "공유와 회고", work: "기여·배움·다음 목표" },
        ];
  return (
    <ContextFrame
      brand="NAMU / PROJECT PLAN"
      chrome="workspace"
      label={
        sprint
          ? "GV 5일 모델의 한 사례를 적용한 디자인 스프린트 일정"
          : apprentice
            ? "멘토와 실제 작업을 함께하는 도제식 실무 교육 계획"
            : "한 달 동안 실무 참여와 멘토 피드백을 연결한 가상 인턴십 일정"
      }
    >
      <div className="ca-schedule">
        <WorkspaceHeader
          title={
            sprint
              ? "예약 문제를 검토하는 한 주"
              : apprentice
                ? "함께 일하며 배우기"
                : "디자인 인턴십 · 첫 한 달"
          }
          section={sprint ? "DESIGN SPRINT" : "TEAM LEARNING"}
        />
        <div className="ca-schedule-columns">
          {cards.map((card, i) => (
            <section key={card.label}>
              <Kicker>{card.label}</Kicker>
              <h6>{card.title}</h6>
              <div className={`ca-schedule-artifact ca-schedule-artifact-${i % 3}`}>
                {sprint ? (
                  i === 3 ? (
                    <TouchpointScreen kind={1} context="workshop" />
                  ) : (
                    <>
                      <span className="ca-schedule-sticky">
                        {
                          [
                            "예약의 어려움",
                            "목록형 / 달력형",
                            "검증할 흐름",
                            "",
                            "날짜를 골라 주세요",
                          ][i]
                        }
                      </span>
                      <span className="ca-schedule-sticky">
                        {
                          [
                            "확인할 질문",
                            "다른 구조로 스케치",
                            "선택 근거 기록",
                            "",
                            "어디서 멈추는가?",
                          ][i]
                        }
                      </span>
                    </>
                  )
                ) : i % 3 === 0 ? (
                  <>
                    <span className="ca-schedule-sticky">관찰한 사실</span>
                    <span className="ca-schedule-sticky">확인할 질문</span>
                  </>
                ) : i % 3 === 1 ? (
                  <IdeaScreen variant={0} />
                ) : (
                  <>
                    <Check size={27} />
                    <strong>검토 기록</strong>
                    <span>다음에 확인할 점 →</span>
                  </>
                )}
              </div>
              <p>{card.work}</p>
              <Member
                initial={i % 2 ? "M" : "J"}
                name={
                  sprint
                    ? i < 3
                      ? "팀 함께"
                      : "제작·검증"
                    : apprentice
                      ? i === 1
                        ? "신입 담당"
                        : "멘토와 함께"
                      : "팀·멘토와 함께"
                }
              />
            </section>
          ))}
        </div>
        {apprentice && (
          <div className="ca-mentor-feedback">
            <MessageSquare size={19} />
            <span>
              <b>멘토의 피드백</b>
              <p>결과뿐 아니라 “왜 이렇게 설계했는지” 함께 검토합니다.</p>
            </span>
          </div>
        )}
        <SampleNote>{figure.caption}</SampleNote>
      </div>
    </ContextFrame>
  );
}

/** All assigned concepts choose an intentional artifact; there is no generic fallback. */
function ArtifactContent({ termId, figure }: Props): ReactNode {
  switch (termId) {
    case "case-study":
      return <CaseStudy figure={figure} plural={false} />;
    case "case-studies":
      return <CaseStudy figure={figure} plural />;
    case "portfolio":
    case "personal-brand":
    case "variety":
      return <Portfolio termId={termId} />;
    case "graphic-designers":
      return <GraphicDesign />;
    case "persona":
      return <Persona figure={figure} />;
    case "context":
      return <ContextOfUse />;
    case "user":
      return <Users group={false} />;
    case "user-group":
      return <Users group />;
    case "empathy-map":
      return <EmpathyMap figure={figure} aggregated={false} />;
    case "aggregated-empathy-maps":
      return <EmpathyMap figure={figure} aggregated />;
    case "pain-points":
    case "user-journey":
    case "user-experience":
      return <Journey termId={termId} figure={figure} />;
    case "affinity":
      return <Affinity simple />;
    case "affinity-diagram":
      return <Affinity simple={false} />;
    case "assets":
      return <Assets />;
    case "brand-identity":
      return <BrandIdentity />;
    case "design-system":
      return <DesignSystem />;
    case "design-thinking":
    case "ideate":
    case "ideation":
    case "whiteboard-interview":
      return <Ideation termId={termId} figure={figure} />;
    case "qualitative-research":
    case "ux-research":
    case "recency-bias":
      return <ResearchWorkspace termId={termId} />;
    case "retrospective":
      return <Retrospective figure={figure} />;
    case "hierarchical-model":
    case "information-architecture-ia":
    case "sitemap":
      return <InformationArchitecture termId={termId} figure={figure} />;
    case "iteration":
      return <Iteration />;
    case "test":
      return <TestScene />;
    case "startup":
      return <Startup />;
    case "motion-designers":
      return <MotionDesign />;
    case "apprenticeships":
    case "design-sprint":
    case "internship":
    case "payment-schedule":
    case "scope-creep":
    case "second-round-of-interviews":
      return <Schedule termId={termId} figure={figure} />;
    default:
      return null;
  }
}

export function ArtifactScenes({ termId, figure }: Props) {
  if (!(ARTIFACT_TERM_IDS as readonly string[]).includes(termId)) return null;
  return (
    <div className="ca-scene" data-context-term={termId}>
      <ArtifactContent termId={termId} figure={figure} />
      <ContextCallout number={1}>{figure.focus}</ContextCallout>
    </div>
  );
}
