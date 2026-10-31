import type { ReactNode } from "react";
import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CloudOff,
  Download,
  FileText,
  Folder,
  Home,
  Keyboard,
  MapPin,
  Menu,
  Mic,
  Minus,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Smartphone,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import type { LearningFigure } from "@/data/learning/types";
import { ContextFrame, ContextPhoto, ContextCallout } from "./ContextFrame";
import "./interaction-scenes.css";

export const INTERACTION_TERM_IDS = [
  "accessibility",
  "alternative-text-alt-text",
  "assistive-technology",
  "call-to-action-cta",
  "carousels",
  "color-modification",
  "curb-cut",
  "customizable-text",
  "database-model",
  "deceptive-patterns",
  "dedicated-mobile-app",
  "domain",
  "edge-case",
  "elements",
  "feedback-loops",
  "graceful-degradation-top-down-designing",
  "hamburger-menus",
  "happy-path",
  "high-fidelity-prototypes",
  "iconography",
  "interactivity",
  "landmarks",
  "mental-models",
  "mobile-first-philosophy",
  "motion",
  "navigation",
  "next-billion-users-nbu",
  "platform",
  "product",
  "progressive-enhancement-bottom-up-designing",
  "prototype",
  "responsive-web-app",
  "responsive-web-design",
  "scalable",
  "screen-reader",
  "speech-to-text",
  "switch-device",
  "traversal-order",
  "universal-design",
  "voice-control",
] as const;

function Action({
  children,
  secondary = false,
  className = "",
}: {
  children: ReactNode;
  secondary?: boolean;
  className?: string;
}) {
  return (
    <span className={`ci-action ${secondary ? "ci-action-secondary" : ""} ${className}`}>
      {children}
    </span>
  );
}

function Marker({ children = 1 }: { children?: ReactNode }) {
  return <span className="ci-marker">{children}</span>;
}

function State({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="ci-state">
      <h5 className="ci-state-label">{label}</h5>
      {children}
    </section>
  );
}

function Brand({ menu = false }: { menu?: boolean }) {
  return (
    <div className="ci-brand">
      <strong>
        MORA<span>모래 책방</span>
      </strong>
      {menu ? (
        <span className="ci-menu-label">
          <Menu size={20} /> 메뉴
        </span>
      ) : (
        <span className="ci-brand-links">
          모임 <span>책방 이야기</span>
        </span>
      )}
    </div>
  );
}

function BookCard({ compact = false }: { compact?: boolean }) {
  return (
    <article className={`ci-book-card ${compact ? "ci-book-card-compact" : ""}`}>
      <div className="ci-book-cover">
        <span>MORA LIBRARY</span>
        <strong>
          잠시,
          <br />
          숲의 시간
        </strong>
        <span>ESSAYS / VOL. 08</span>
      </div>
      <div className="ci-book-copy">
        <span className="ci-overline">함께 읽는 토요일</span>
        <h5>책 한 권과 느린 오후</h5>
        <p>각자의 문장을 나누는 작은 독서 모임</p>
        <span className="ci-meta">
          <CalendarDays size={14} /> 11월 15일 · 오후 2:00
        </span>
        <span className="ci-meta">
          <MapPin size={14} /> 모래 책방 · 정원 8명
        </span>
        <strong className="ci-price">
          20,000원 <small>/ 1인</small>
        </strong>
      </div>
    </article>
  );
}

function Booking({
  step = "detail",
  focus = false,
}: {
  step?: "detail" | "form" | "done";
  focus?: boolean;
}) {
  return (
    <ContextFrame brand="모래 책방" chrome="web" url="mora.example/meetings">
      <Brand />
      {step === "detail" ? (
        <div className="ci-padding">
          <span className="ci-breadcrumb">모임 / 독서 모임</span>
          <BookCard />
          <div className="ci-booking-bottom">
            <span>낯선 문장으로 시작하는 대화</span>
            <Action className={focus ? "ci-focus" : ""}>
              모임 예약하기 <ArrowRight size={16} />
            </Action>
          </div>
        </div>
      ) : step === "form" ? (
        <div className="ci-padding">
          <span className="ci-breadcrumb">모임 / 예약 정보</span>
          <h4 className="ci-screen-title">참여 정보를 확인하세요.</h4>
          <div className="ci-field">
            <span>예약자 이름</span>
            <div className="ci-input">김모래</div>
          </div>
          <div className="ci-field">
            <span>참여 인원</span>
            <div className="ci-input">
              1명 <span>▾</span>
            </div>
          </div>
          <div className="ci-summary-line">
            <span>전체 금액</span>
            <strong>20,000원</strong>
          </div>
          <Action>
            예약 확정하기 <ArrowRight size={16} />
          </Action>
        </div>
      ) : (
        <div className="ci-done">
          <CheckCircle2 size={38} />
          <h4>예약이 완료되었습니다.</h4>
          <p>
            함께 읽는 토요일
            <br />
            11월 15일 · 오후 2:00 · 1명
          </p>
          <div className="ci-ticket">
            <span>예약 번호</span>
            <strong>MR–015</strong>
            <small>모임 시작 10분 전부터 입장할 수 있어요.</small>
          </div>
          <Action secondary>내 예약 확인</Action>
        </div>
      )}
    </ContextFrame>
  );
}

function Newsletter() {
  return (
    <>
      <ContextFrame brand="FORM. 디자인 노트" chrome="web" url="form.example/notes">
        <div className="ci-newsletter">
          <div className="ci-newsletter-photo">
            <ContextPhoto asset="forest" alt="햇빛이 스며드는 숲" />
          </div>
          <div className="ci-newsletter-copy">
            <span className="ci-overline">FORM. / WEEKLY NOTES</span>
            <h4>
              좋은 디자인을
              <br />
              매주 한 편씩.
            </h4>
            <p>
              읽고, 관찰하고, 만들어 보는
              <br />
              디자이너를 위한 작은 뉴스레터.
            </p>
            <div className="ci-highlight">
              <Marker />
              <Action>
                무료로 시작하기 <ArrowRight size={16} />
              </Action>
            </div>
            <small>매주 금요일 · 이메일로 받아보기</small>
            <span className="ci-link">지난 디자인 노트 읽기 →</span>
          </div>
        </div>
      </ContextFrame>
      <ContextCallout number={1}>
        무료 뉴스레터 구독을 제안하는 이 요소가 CTA입니다. 버튼의 모양과 함께 제안하는 행동을 읽어
        보세요.
      </ContextCallout>
    </>
  );
}

const FILES = [
  { title: "인터뷰 질문 가이드", type: "PDF", date: "10월 28일", tag: "UX 리서치" },
  { title: "사용자 관찰 노트", type: "DOC", date: "10월 27일", tag: "UX 리서치" },
  { title: "컴포넌트 설계 노트", type: "DOC", date: "10월 25일", tag: "UI 디자인" },
];

function Library({
  mode = "default",
}: {
  mode?: "default" | "focus" | "order" | "database" | "scale" | "app";
}) {
  const order = mode === "order";
  return (
    <ContextFrame brand="도토리" chrome="web" url="dotori.example/library">
      <div className="ci-library">
        <aside className="ci-library-sidebar">
          <strong className="ci-dotori">◒ 도토리</strong>
          <div className={order ? "ci-numbered" : ""}>
            {order && <Marker>1</Marker>}
            <span>
              <Home size={15} /> 홈
            </span>
          </div>
          <div className="ci-nav-active">
            <Folder size={15} /> 내 자료
          </div>
          <div>
            <Bookmark size={15} /> 즐겨찾기
          </div>
          <div>
            <Trash2 size={15} /> 휴지통
          </div>
          <small>개인 워크스페이스</small>
        </aside>
        <div className="ci-library-main">
          <div className="ci-library-top">
            <span>내 자료 / 전체</span>
            <span className="ci-avatar">M</span>
          </div>
          <div className="ci-library-title">
            <h4>내 자료</h4>
            <Action>+ 자료 추가</Action>
          </div>
          <div
            className={`ci-search ${mode === "focus" ? "ci-focus" : ""} ${order ? "ci-numbered" : ""}`}
          >
            {order && <Marker>2</Marker>}
            <Search size={16} />
            <span>{mode === "database" ? "인터뷰" : "자료 이름으로 검색"}</span>
            {mode === "focus" && <span className="ci-key-hint">키보드 포커스</span>}
          </div>
          <div className="ci-filter-row">
            <span className={mode === "database" ? "ci-selected" : ""}>
              유형: {mode === "database" ? "PDF" : "전체"} ▾
            </span>
            <span>주제: UX 리서치 ▾</span>
          </div>
          <div className="ci-file-list">
            {FILES.slice(0, mode === "database" ? 1 : 3).map((file, i) => (
              <div
                className={`ci-file-row ${order && i === 0 ? "ci-numbered" : ""}`}
                key={file.title}
              >
                {order && i === 0 && <Marker>3</Marker>}
                <span className="ci-file-icon">
                  <FileText size={23} />
                </span>
                <span className="ci-file-description">
                  <strong>{file.title}</strong>
                  <small>
                    {file.type} · {file.tag}
                  </small>
                </span>
                <span className="ci-file-date">{file.date}</span>
                <span className="ci-file-more">···</span>
              </div>
            ))}
          </div>
          {mode === "database" && (
            <div className="ci-result-count">
              검색어와 2개 속성 조건에 맞는 자료 <strong>1개</strong>
            </div>
          )}
          {mode === "scale" && (
            <div className="ci-pagination">
              <span>1–3 / 전체 248개</span>
              <span>
                ‹ <b>1</b> 2 3 … 83 ›
              </span>
            </div>
          )}
          {order && (
            <div className="ci-numbered ci-library-upload">
              <Marker>4</Marker>
              <Action secondary>새 자료 업로드</Action>
            </div>
          )}
        </div>
      </div>
    </ContextFrame>
  );
}

function Accessible() {
  return (
    <>
      <Library mode="focus" />
      <div className="ci-keyboard-strip">
        <Keyboard size={21} />
        <span>Tab</span>
        <ArrowRight size={15} />
        <span>자료 이름으로 검색</span>
        <span>Shift + Tab</span>
        <small>이전 요소</small>
      </div>
      <ContextCallout number={1}>
        검색칸의 외곽선은 현재 키보드로 조작할 위치를 알려 줍니다. 이는 접근성을 구성하는 여러 조건
        중 하나입니다.
      </ContextCallout>
    </>
  );
}

function TraversalOrder() {
  return (
    <>
      <ContextFrame brand="모래 책방" chrome="web" url="mora.example/reserve">
        <div className="ci-padding ci-traversal-form">
          <span className="ci-overline">MORA / RESERVATION</span>
          <h4 className="ci-screen-title">모임에 함께해요.</h4>
          <p className="ci-body-copy">함께 읽는 토요일 · 11월 15일 오후 2시</p>
          <div className="ci-field">
            <span>예약자 이름</span>
            <div className="ci-input ci-numbered ci-focus">
              <Marker>1</Marker>김모래
            </div>
          </div>
          <div className="ci-field">
            <span>이메일</span>
            <div className="ci-input ci-numbered">
              <Marker>2</Marker>mora@example.com
            </div>
          </div>
          <div className="ci-check-row ci-numbered">
            <Marker>3</Marker>
            <span className="ci-checkbox">
              <Check size={13} />
            </span>
            <span>예약 안내를 이메일로 받는 데 동의합니다.</span>
          </div>
          <div className="ci-numbered ci-traversal-submit">
            <Marker>4</Marker>
            <Action>
              모임 예약하기 <ArrowRight size={16} />
            </Action>
          </div>
        </div>
      </ContextFrame>
      <div className="ci-keyboard-strip">
        <Keyboard size={21} />
        <span>Tab</span>
        <ArrowRight size={15} />
        <span>1 이름 → 2 이메일 → 3 동의 → 4 예약</span>
        <span>Shift + Tab</span>
        <small>역순으로 이동</small>
      </div>
      <ContextCallout number={1}>
        이 작은 폼의 조작 요소 4개를 키보드 이동 순서대로 표시했습니다. 제목과 안내문은 읽기
        콘텐츠이며 Tab으로 이동하는 조작 대상과 구분합니다.
      </ContextCallout>
    </>
  );
}

function AltText({ technology = false }: { technology?: boolean }) {
  return (
    <>
      <div className="ci-split">
        <ContextFrame brand="하루산책" chrome="web" url="haru.example/trails/forest">
          <div className="ci-padding">
            <span className="ci-overline">WALKING JOURNAL</span>
            <h4 className="ci-screen-title">오늘은 숲으로.</h4>
            <div className="ci-photo-highlight">
              <ContextPhoto asset="forest" alt="나무 사이로 햇빛이 비치는 울창한 숲" />
              <Marker />
            </div>
            <p className="ci-body-copy">천천히 걸으며 나무 사이로 들어오는 빛을 만나 보세요.</p>
          </div>
        </ContextFrame>
        <div className="ci-access-panel">
          <span className="ci-overline">
            {technology ? "접근 방식" : "스크린 리더가 전달하는 설명"}
          </span>
          <Volume2 size={28} />
          <blockquote>“나무 사이로 햇빛이 비치는 울창한 숲”</blockquote>
          {technology ? (
            <>
              <div className="ci-tech-row">
                <Keyboard size={20} />
                <span>
                  <strong>키보드·스위치</strong>
                  <small>포인터 대신 요소를 이동하고 선택</small>
                </span>
              </div>
              <div className="ci-tech-row">
                <Plus size={20} />
                <span>
                  <strong>화면 확대</strong>
                  <small>화면의 필요한 부분을 확대</small>
                </span>
              </div>
            </>
          ) : (
            <code>&lt;img alt="나무 사이로 햇빛이 비치는 울창한 숲" /&gt;</code>
          )}
        </div>
      </div>
      <ContextCallout number={1}>
        {technology
          ? "같은 콘텐츠에 접근해도 정보를 듣거나 확대하고, 다른 장치로 입력할 수 있습니다. 보조 기술별 입력·출력 방식을 구분하세요."
          : "사진이 전달해야 하는 정보를 문장으로 제공합니다. 장식용 이미지와 정보 이미지의 목적에 따라 대체 텍스트를 결정합니다."}
      </ContextCallout>
    </>
  );
}

function Carousel() {
  return (
    <>
      <ContextFrame brand="하루산책" chrome="web" url="haru.example/journal">
        <div className="ci-padding">
          <div className="ci-section-heading">
            <span>
              <span className="ci-overline">SLOW PLACES</span>
              <h4>어디에서 쉬어 갈까요?</h4>
            </span>
            <span className="ci-carousel-arrows">
              <ChevronLeft />
              <ChevronRight />
            </span>
          </div>
          <div className="ci-carousel-track">
            {(["coast", "forest", "desert"] as const).map((asset, i) => (
              <article key={asset} className={`ci-carousel-card ${i === 1 ? "ci-current" : ""}`}>
                <ContextPhoto
                  asset={asset}
                  alt={["푸른 바닷가", "햇빛이 비치는 숲", "완만한 사막 능선"][i] ?? "풍경"}
                />
                <small>0{i + 1} / WALKING JOURNAL</small>
                <h5>{["바다의 리듬", "숲의 시간", "고요한 모래"][i]}</h5>
              </article>
            ))}
          </div>
          <div className="ci-carousel-position">
            <span>
              ○ <b>●</b> ○
            </span>
            <strong>02 / 03</strong>
          </div>
        </div>
      </ContextFrame>
      <ContextCallout number={1}>
        같은 보기 영역 안에서 이어지는 콘텐츠를 살펴봅니다. 이 예시의 현재 항목은 두 번째 ‘숲의
        시간’이며, 화살표와 위치 표시는 설계 선택입니다.
      </ContextCallout>
    </>
  );
}

function Reading({ large = false, dark = false }: { large?: boolean; dark?: boolean }) {
  return (
    <ContextFrame brand="FORM. 읽기" chrome="web" url="form.example/read">
      <div
        className={`ci-reading ${large ? "ci-reading-large" : ""} ${dark ? "ci-reading-dark" : ""}`}
      >
        <div className="ci-reading-tools">
          <span>FORM. NOTES</span>
          <span>
            <Settings size={15} /> Aa
          </span>
        </div>
        <span className="ci-overline">OBSERVATION / 04</span>
        <h4>
          일상의 작은
          <br />
          불편에서 시작하기
        </h4>
        <p>문을 여는 손잡이부터 예약을 마치는 화면까지, 디자인은 우리의 행동을 안내합니다.</p>
        <p>
          익숙한 장면을 천천히 관찰해 보세요. 사용자가 멈추는 순간에 더 나은 질문이 숨어 있습니다.
        </p>
        <div className="ci-reading-foot">
          <span>김모래 · 4분 읽기</span>
          <Bookmark size={18} />
        </div>
      </div>
    </ContextFrame>
  );
}

function ReadingOptions({ color = false }: { color?: boolean }) {
  return (
    <>
      <div className="ci-reading-setting">
        <SlidersHorizontal size={18} />
        <strong>읽기 설정</strong>
        <span>{color ? "밝은 화면 → 어두운 화면" : "글자 크기 16 → 20 / 줄 간격 1.7"}</span>
      </div>
      <div className="ci-pair">
        <State label={color ? "밝은 화면" : "기본 글자 크기"}>
          <Reading />
        </State>
        <State label={color ? "어두운 화면" : "확대한 글자 크기"}>
          <Reading dark={color} large={!color} />
        </State>
      </div>
      <ContextCallout number={1}>
        {color
          ? "배경과 글자색이 함께 바뀌어도 정보와 구분이 유지됩니다. 색 변경만으로 대비 기준 충족을 판단할 수는 없습니다."
          : "같은 글을 크게 표시하면 줄바꿈과 화면 높이가 달라집니다. 글자가 커져도 내용이 잘리거나 겹치지 않아야 합니다."}
      </ContextCallout>
    </>
  );
}

function CurbCut() {
  return (
    <>
      <div className="ci-street">
        <svg
          viewBox="0 0 720 330"
          role="img"
          aria-label="보도에서 차도 방향으로 낮아지는 턱 낮춤 경사로와 횡단보도"
        >
          <rect width="720" height="330" fill="#e8edf0" />
          <path d="M0 210 720 110v220H0Z" fill="#6f767c" />
          <path d="M0 70 720 0v145L0 245Z" fill="#d3cdc1" />
          <path d="M0 210 720 110v35L0 245Z" fill="#a8a297" />
          <path d="m270 175 130-17 65 54-160 22Z" fill="#eee8dc" stroke="#8f887a" strokeWidth="2" />
          <path d="m305 234 160-22 0 8-160 22Z" fill="#b9b0a0" />
          <path d="m310 156 106-14 7 12-107 14Z" fill="#b4a65f" />
          <path d="m314 166 106-14" stroke="#77693b" strokeWidth="3" strokeDasharray="3 6" />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`m${315 + i * 29} 254 16-3 43 62-18 3Z`} fill="#f5f5ee" />
          ))}
          <path d="m357 146 35 51" stroke="#264f49" strokeWidth="5" />
          <path d="m381 189 12 10 0-16" fill="none" stroke="#264f49" strokeWidth="5" />
          <circle cx="358" cy="117" r="17" fill="#264f49" />
          <text x="358" y="123" textAnchor="middle" fontSize="17" fill="white">
            1
          </text>
          <text x="42" y="107" fontSize="21" fill="#373d39">
            보도
          </text>
          <text x="540" y="248" fontSize="21" fill="#fff">
            횡단보도
          </text>
        </svg>
        <div className="ci-street-note">
          <span>보도의 높은 면</span>
          <ArrowRight size={16} />
          <strong>경사로</strong>
          <ArrowRight size={16} />
          <span>차도 높이</span>
        </div>
      </div>
      <ContextCallout number={1}>
        보도 턱을 낮춰 높이 차이를 연결한 부분이 curb-cut입니다. 웹 UI를 지칭하는 말이 아니라 실제
        환경의 접근성 설계에서 나온 개념입니다.
      </ContextCallout>
    </>
  );
}

function Preferences({ misleading = false }: { misleading?: boolean }) {
  return (
    <ContextFrame brand="모래 책방" chrome="web" url="mora.example/settings">
      <div className="ci-padding">
        <span className="ci-breadcrumb">내 계정 / 알림 설정</span>
        <h4 className="ci-screen-title">소식을 받아보세요.</h4>
        <p className="ci-body-copy">새 모임과 책방 소식을 이메일로 안내합니다.</p>
        <div className={`ci-check-row ${misleading ? "ci-warning-area" : ""}`}>
          <span className={`ci-checkbox ${misleading ? "ci-checked" : ""}`}>
            {misleading && <Check size={14} />}
          </span>
          <span>
            {misleading
              ? "소식을 받지 않으려면 체크를 해제하지 마세요."
              : "책방 소식 이메일 받기 (선택)"}
          </span>
        </div>
        <Action>설정 저장</Action>
        {misleading && <p className="ci-tiny-link">소식 수신을 변경하지 않고 계속하기</p>}
      </div>
    </ContextFrame>
  );
}

function Deceptive() {
  return (
    <>
      <div className="ci-pair">
        <State label="선택을 혼란스럽게 만드는 표현">
          <Preferences misleading />
        </State>
        <State label="선택과 결과가 일치하는 표현">
          <Preferences />
        </State>
      </div>
      <ContextCallout number={1}>
        첫 화면의 중첩 부정과 미리 선택된 항목은 수신 여부를 오해하게 만듭니다. 실제 서비스를 평가할
        때는 동작과 맥락도 함께 확인해야 합니다.
      </ContextCallout>
    </>
  );
}

function WalkApp({
  lowData = false,
  switchMode = false,
  voice = false,
}: {
  lowData?: boolean;
  switchMode?: boolean;
  voice?: boolean;
}) {
  return (
    <ContextFrame brand="하루산책" chrome="mobile">
      <div className="ci-walk-app">
        <div className="ci-app-greeting">
          <span>안녕하세요, 모래님</span>
          <span className="ci-avatar">M</span>
        </div>
        <h4>
          오늘은 어디를
          <br />
          걸어 볼까요?
        </h4>
        {lowData ? (
          <div className="ci-offline-banner">
            <CloudOff size={17} />
            <span>데이터 절약 모드 · 저장한 경로 이용 가능</span>
          </div>
        ) : (
          <div className="ci-app-hero">
            <ContextPhoto asset="forest" alt="햇빛이 비치는 숲" />
            <span>
              오늘의 추천
              <br />
              <strong>초록빛 숲길</strong>
            </span>
          </div>
        )}
        <div className="ci-app-section-heading">
          <strong>{lowData ? "저장한 산책" : "가까운 산책"}</strong>
          <span>전체 보기</span>
        </div>
        {["초록빛 숲길", "강변 바람길"].map((name, i) => (
          <div
            className={`ci-trail-row ${switchMode && i === 0 ? "ci-scan-focus" : ""}`}
            key={name}
          >
            {(switchMode || voice) && <Marker>{i + 1}</Marker>}
            <span className="ci-trail-icon">
              <MapPin size={20} />
            </span>
            <span>
              <strong>{name}</strong>
              <small>
                {i === 0 ? "1.8 km · 약 30분" : "2.4 km · 약 40분"}
                {lowData ? " · 오프라인" : ""}
              </small>
            </span>
            <ChevronRight size={17} />
          </div>
        ))}
        <div className="ci-app-tabs">
          <span className="ci-app-tab-active">
            <Home size={18} />
            오늘
          </span>
          <span>
            <Bookmark size={18} />내 산책
          </span>
          <span>
            <Settings size={18} />
            설정
          </span>
        </div>
      </div>
    </ContextFrame>
  );
}

function Domain() {
  return (
    <>
      <div className="ci-domain-browser">
        <div className="ci-browser-toolbar">
          <span>◁ ▷ ⟳</span>
          <div className="ci-address">
            <span>https://</span>
            <strong>mora.example</strong>
            <span>/meetings?day=sat</span>
          </div>
          <span>···</span>
        </div>
        <Brand />
        <div className="ci-padding">
          <BookCard compact />
        </div>
      </div>
      <div className="ci-url-parts">
        <span>
          <small>프로토콜</small>
          <code>https://</code>
        </span>
        <span className="ci-selected">
          <small>도메인</small>
          <code>mora.example</code>
        </span>
        <span>
          <small>경로</small>
          <code>/meetings</code>
        </span>
        <span>
          <small>쿼리</small>
          <code>?day=sat</code>
        </span>
      </div>
      <ContextCallout number={1}>
        주소에서 호스트를 식별하는 도메인 이름을 봅니다. 이 화면의 mora.example은 교육용 가상
        주소입니다.
      </ContextCallout>
    </>
  );
}

function UploadState({ error = false }: { error?: boolean }) {
  return (
    <ContextFrame brand="도토리" chrome="web" url="dotori.example/upload">
      <div className="ci-padding">
        <span className="ci-breadcrumb">내 자료 / 파일 업로드</span>
        <h4 className="ci-screen-title">자료를 보관하세요.</h4>
        <div className="ci-dropzone">
          <FileText size={31} />
          <strong>리서치_포트폴리오.pdf</strong>
          <small>{error ? "12 MB" : "4.2 MB"} · PDF 문서</small>
        </div>
        <div className={`ci-upload-status ${error ? "ci-error" : "ci-success"}`}>
          {error ? (
            <>
              <span className="ci-status-symbol">!</span>
              <span>
                <strong>파일을 올리지 못했어요.</strong>
                <small>10 MB 이하 파일을 선택해 주세요.</small>
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              <span>
                <strong>업로드 완료</strong>
                <small>내 자료에서 다시 열 수 있습니다.</small>
              </span>
            </>
          )}
        </div>
        <Action secondary>{error ? "다른 파일 선택" : "내 자료로 이동"}</Action>
      </div>
    </ContextFrame>
  );
}

function FormState({ valid = false, done = false }: { valid?: boolean; done?: boolean }) {
  return (
    <ContextFrame brand="도토리" chrome="web" url="dotori.example/projects/new">
      <div className="ci-padding">
        <span className="ci-overline">NEW PROJECT</span>
        {done ? (
          <div className="ci-form-done">
            <CheckCircle2 size={35} />
            <h4>프로젝트를 만들었어요.</h4>
            <p>‘모래 책방’에서 첫 자료를 추가해 보세요.</p>
            <Action>프로젝트 열기</Action>
          </div>
        ) : (
          <>
            <h4 className="ci-screen-title">프로젝트 만들기</h4>
            <p className="ci-body-copy">함께 모아 볼 자료의 이름을 정하세요.</p>
            <div className="ci-field">
              <span>프로젝트 이름</span>
              <div className={`ci-input ${valid ? "ci-valid-input" : "ci-invalid-input"}`}>
                {valid ? "모래 책방" : "모"}
                {valid ? <Check size={17} /> : <span>!</span>}
              </div>
              <small className={valid ? "ci-valid-text" : "ci-error-text"}>
                {valid ? "사용할 수 있는 이름입니다." : "이름은 두 글자 이상 입력해 주세요."}
              </small>
            </div>
            <Action className={valid ? "" : "ci-disabled-action"}>프로젝트 만들기</Action>
          </>
        )}
      </div>
    </ContextFrame>
  );
}

function FormFeedback({ fidelity = false }: { fidelity?: boolean }) {
  return (
    <>
      <div className="ci-pair">
        <State label="입력 후 · 수정 안내">
          <FormState />
        </State>
        <State label="입력 수정 후 · 조건 충족">
          <FormState valid />
        </State>
      </div>
      {fidelity && (
        <div className="ci-prototype-strip">
          <span>입력값 변경</span>
          <ArrowRight size={17} />
          <span>오류 메시지 갱신</span>
          <ArrowRight size={17} />
          <span>완료 화면으로 이동</span>
          <small>프로토타입에서 검토할 상태 연결</small>
        </div>
      )}
      <ContextCallout number={1}>
        {fidelity
          ? "실제와 가까운 글자·색·간격뿐 아니라 입력값에 따른 상태 전환까지 검토하는 하이파이 프로토타입의 화면 예시입니다. 위 두 장은 상태를 비교하는 정적 화면입니다."
          : "오류 안내를 읽고 이름을 수정하면 피드백이 바뀝니다. 행동 → 결과 확인 → 다음 행동의 반복을 봅니다."}
      </ContextCallout>
    </>
  );
}

function Location({ map = true, enhanced = false }: { map?: boolean; enhanced?: boolean }) {
  return (
    <ContextFrame brand="모래 책방" chrome="web" url="mora.example/visit">
      <div className="ci-padding">
        <span className="ci-overline">VISIT MORA</span>
        <h4 className="ci-screen-title">책방에 오시는 길</h4>
        {enhanced && (
          <div className="ci-location-search">
            <span className="ci-input">
              <Search size={16} /> 서림역
            </span>
            <div className="ci-suggestion">
              <MapPin size={15} /> 서림역 2번 출구 <small>도보 6분</small>
            </div>
          </div>
        )}
        {map && (
          <div className="ci-map">
            <span className="ci-map-park">서림공원</span>
            <span className="ci-map-road">숲길로</span>
            <span className="ci-map-place">
              <MapPin size={24} />
              <b>MORA</b>
            </span>
            <span className="ci-map-station">서림역</span>
          </div>
        )}
        <div className="ci-location-info">
          <MapPin size={19} />
          <span>
            <strong>서림로 24, 1층</strong>
            <small>서림역 2번 출구에서 도보 6분</small>
            <small>화–일 11:00–19:00 · 월요일 휴무</small>
          </span>
        </div>
        <Action secondary>주소 복사</Action>
      </div>
    </ContextFrame>
  );
}

function Enhancement({ graceful = false }: { graceful?: boolean }) {
  return (
    <>
      <div className="ci-pair">
        <State label={graceful ? "지도 기능을 쓸 수 있는 환경" : "기본 기능부터 제공"}>
          <Location map={graceful} />
        </State>
        <State label={graceful ? "지도 기능을 쓸 수 없는 환경" : "지원되는 환경에서 기능 추가"}>
          <Location map={!graceful} enhanced={!graceful} />
        </State>
      </div>
      <ContextCallout number={1}>
        {graceful
          ? "지도 표시가 빠져도 주소·출구·도보 안내는 남습니다. 풍부한 기능에서 일부가 줄어들어도 핵심 이용이 가능하도록 설계합니다."
          : "주소와 방문 안내를 기본으로 제공하고, 지원되는 환경에서 검색 제안과 지도를 더합니다. 기본 기능이 향상 기능에 의존하지 않는 방향입니다."}
      </ContextCallout>
    </>
  );
}

function MenuWebsite({ open = false, motionStep }: { open?: boolean; motionStep?: number }) {
  return (
    <ContextFrame brand="STUDIO. 산책" chrome="web" url="studio.example">
      <div className={`ci-menu-site ${open ? "ci-menu-open" : ""}`}>
        <div className="ci-studio-header">
          <strong>STUDIO.</strong>
          <span className="ci-menu-trigger">
            {open ? <X size={21} /> : <Menu size={21} />}
            {open ? "닫기" : "메뉴"}
          </span>
        </div>
        <div className="ci-site-hero">
          <ContextPhoto asset="forest" alt="나무 사이로 햇빛이 비치는 숲" />
          <h4>
            Less noise.
            <br />
            More nature.
          </h4>
          {open && (
            <div className={`ci-menu-panel ${motionStep === 1 ? "ci-menu-midway" : ""}`}>
              <span className="ci-overline">EXPLORE STUDIO</span>
              <strong>
                프로젝트 <ArrowRight size={16} />
              </strong>
              <strong>스튜디오 소개</strong>
              <strong>저널</strong>
              <strong>문의하기</strong>
              <small>함께 걷는 속도를 생각합니다.</small>
            </div>
          )}
        </div>
      </div>
    </ContextFrame>
  );
}

function Hamburger() {
  return (
    <>
      <div className="ci-pair">
        <State label="닫힌 상태 · 세 줄 아이콘">
          <MenuWebsite />
        </State>
        <State label="열린 상태 · 내비게이션">
          <MenuWebsite open />
        </State>
      </div>
      <ContextCallout number={1}>
        오른쪽 위의 세 줄 아이콘은 여는 트리거입니다. 그 아래 펼쳐지는 탐색 목록이 메뉴이며 같은
        위치의 닫기 제어로 되돌아갑니다.
      </ContextCallout>
    </>
  );
}

function HappyPath({ product = false }: { product?: boolean }) {
  return (
    <>
      <div className="ci-sequence">
        <State label={product ? "찾기" : "01 · 모임 선택"}>
          <Booking />
        </State>
        <span className="ci-sequence-arrow">
          <ArrowRight />
        </span>
        <State label={product ? "예약하기" : "02 · 정보 확인"}>
          <Booking step="form" />
        </State>
        <span className="ci-sequence-arrow">
          <ArrowRight />
        </span>
        <State label={product ? "참여 준비" : "03 · 예약 완료"}>
          <Booking step="done" />
        </State>
      </div>
      <ContextCallout number={1}>
        {product
          ? "가치가 제공되는 전체를 봅니다. 모임을 찾고 예약하고 참여를 준비하는 경험이 하나의 프로덕트로 이어집니다."
          : "입력과 결제 등 필요한 조건이 충족될 때 완료까지 이어지는 경로입니다. 실제 설계에서는 오류·취소·재시도 경로도 별도로 필요합니다."}
      </ContextCallout>
    </>
  );
}

function IconSystem({ elements = false }: { elements?: boolean }) {
  return (
    <>
      <ContextFrame
        brand={elements ? "모래 책방" : "도토리"}
        chrome="web"
        url={elements ? "mora.example/meetings" : "dotori.example/library"}
      >
        {elements ? (
          <div className="ci-padding">
            <div className="ci-elements-card">
              <ContextPhoto asset="forest" alt="책 모임의 주제인 숲의 풍경" />
              <div className="ci-elements-copy">
                <div>
                  <Marker>1</Marker>
                  <span className="ci-overline">READING CLUB</span>
                </div>
                <h4>
                  <Marker>2</Marker>숲을 읽는 토요일
                </h4>
                <p>
                  <Marker>3</Marker>각자의 문장을 나누는 오후.
                </p>
                <span className="ci-meta">
                  <CalendarDays size={16} /> 11월 15일 · 14:00
                </span>
                <div>
                  <Marker>4</Marker>
                  <Action>
                    모임 살펴보기 <ArrowRight size={16} />
                  </Action>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="ci-padding">
            <div className="ci-library-title">
              <h4>컴포넌트 설계 노트</h4>
              <span className="ci-avatar">M</span>
            </div>
            <div className="ci-icon-toolbar">
              {[
                { Icon: Search, label: "검색" },
                { Icon: Bookmark, label: "저장" },
                { Icon: Download, label: "다운로드" },
                { Icon: Trash2, label: "삭제" },
              ].map(({ Icon, label }) => (
                <span key={label}>
                  <Icon size={23} strokeWidth={1.7} />
                  <small>{label}</small>
                </span>
              ))}
            </div>
            <div className="ci-document-page">
              <span className="ci-overline">DESIGN NOTES</span>
              <h4>
                일관된 아이콘,
                <br />
                다른 기능.
              </h4>
              <p>그림의 의미와 텍스트 라벨을 함께 읽어 보세요.</p>
              <div className="ci-line-samples">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}
      </ContextFrame>
      <ContextCallout number={1}>
        {elements
          ? "이미지·텍스트·아이콘·버튼이 결합해 하나의 모임 카드를 이룹니다. 각각의 기본 요소와 조합된 컴포넌트를 구분하세요."
          : "같은 선 굵기·모서리·시각 크기를 사용하는 아이콘 집합입니다. 공통 스타일이 기능 의미를 대신하지 않으므로 필요한 곳에 이름을 함께 제공합니다."}
      </ContextCallout>
    </>
  );
}

function Tabs({ saved = false, navigation = false }: { saved?: boolean; navigation?: boolean }) {
  return (
    <ContextFrame brand="도토리" chrome="web" url={`dotori.example/${saved ? "saved" : "library"}`}>
      <div className="ci-padding">
        <div className="ci-library-title">
          <strong className="ci-dotori">◒ 도토리</strong>
          <span className="ci-avatar">M</span>
        </div>
        {navigation && <span className="ci-breadcrumb">홈 / 내 자료 / 즐겨찾기</span>}
        <div className="ci-tabs">
          <span className={!saved ? "ci-tab-active" : ""}>
            <Folder size={16} /> 전체 자료
          </span>
          <span className={saved ? "ci-tab-active" : ""}>
            <Bookmark size={16} /> 즐겨찾기
          </span>
        </div>
        <h4 className="ci-screen-title">{saved ? "다시 보고 싶은 자료" : "내가 모은 자료"}</h4>
        {FILES.slice(0, saved ? 1 : 3).map((file) => (
          <div className="ci-file-row" key={file.title}>
            <span className="ci-file-icon">
              <FileText size={22} />
            </span>
            <span className="ci-file-description">
              <strong>{file.title}</strong>
              <small>
                {file.type} · {file.tag}
              </small>
            </span>
            {saved && <Bookmark size={18} fill="currentColor" />}
          </div>
        ))}
      </div>
    </ContextFrame>
  );
}

function Interaction({
  navigation = false,
  prototype = false,
}: {
  navigation?: boolean;
  prototype?: boolean;
}) {
  return (
    <>
      {navigation ? (
        <Tabs saved navigation />
      ) : (
        <div className="ci-pair">
          <State label="선택 전 · 전체 자료">
            <Tabs />
          </State>
          <State label="즐겨찾기 선택 후">
            <Tabs saved />
          </State>
        </div>
      )}
      {prototype && (
        <div className="ci-prototype-strip">
          <span className="ci-prototype-node">전체 자료 화면</span>
          <ArrowRight size={18} />
          <span>On click · 즐겨찾기</span>
          <ArrowRight size={18} />
          <span className="ci-prototype-node">즐겨찾기 화면</span>
        </div>
      )}
      <ContextCallout number={1}>
        {navigation
          ? "선택된 메뉴, 현재 위치 경로와 본문이 같은 위치를 가리킵니다. 내비게이션은 어디로 갈 수 있고 지금 어디에 있는지 알려 줍니다."
          : prototype
            ? "두 화면을 선택 동작으로 연결해 사용 흐름을 검토하는 모형입니다. 화면 충실도가 낮아도 프로토타입이 될 수 있습니다. 여기서는 연결할 상태를 정적으로 보여 줍니다."
            : "사용자의 선택에 따라 선택 표시와 본문 결과가 함께 바뀝니다. 인터랙티비티의 입력과 반응을 두 화면에서 연결해 보세요."}
      </ContextCallout>
    </>
  );
}

function Landmarks() {
  return (
    <>
      <ContextFrame brand="모래 책방" chrome="web" url="mora.example/journal">
        <div className="ci-landmark-page">
          <div className="ci-landmark-header">
            <span className="ci-landmark-tag">banner · header</span>
            <Brand />
          </div>
          <div className="ci-landmark-nav">
            <span className="ci-landmark-tag">navigation</span>
            <span>모임</span>
            <strong>저널</strong>
            <span>책방 소개</span>
          </div>
          <div className="ci-landmark-columns">
            <div className="ci-landmark-main">
              <span className="ci-landmark-tag">main</span>
              <ContextPhoto asset="forest" alt="숲의 풍경" />
              <span className="ci-overline">MORA JOURNAL / 08</span>
              <h4>천천히 읽는 시간</h4>
              <p>한 권의 책을 오래 읽는 즐거움.</p>
            </div>
            <aside className="ci-landmark-aside">
              <span className="ci-landmark-tag">complementary · aside</span>
              <strong>함께 읽을 글</strong>
              <p>책방을 여는 아침</p>
              <p>모임을 이어 가는 문장</p>
            </aside>
          </div>
          <div className="ci-landmark-footer">
            <span className="ci-landmark-tag">contentinfo · footer</span>
            <strong>MORA.</strong>
            <span>이용 안내 · 문의</span>
          </div>
        </div>
      </ContextFrame>
      <ContextCallout number={1}>
        겉으로 구분된 영역에 어떤 의미를 부여하는지 표시했습니다. 보조 기술의 영역 탐색을 지원하려면
        실제 HTML 의미와 이름도 맞게 구현해야 합니다.
      </ContextCallout>
    </>
  );
}

function TrashExpectation({ reader = false }: { reader?: boolean }) {
  return (
    <>
      <ContextFrame brand="도토리" chrome="web" url="dotori.example/library">
        <div className="ci-padding">
          <h4 className="ci-screen-title">{reader ? "첨부한 자료" : "내 자료"}</h4>
          <div className="ci-file-row ci-trash-row">
            <span className="ci-file-icon">
              <FileText size={24} />
            </span>
            <span className="ci-file-description">
              <strong>리서치_노트.pdf</strong>
              <small>PDF · 2.4 MB</small>
            </span>
            <span className="ci-trash-control">
              <Marker />
              <Trash2 size={21} />
              <small>삭제</small>
            </span>
          </div>
          {reader ? (
            <div className="ci-speech-output">
              <Volume2 size={22} />
              <span>“리서치 노트 삭제, 버튼”</span>
            </div>
          ) : (
            <div className="ci-toast">
              <Check size={18} />
              <span>파일을 휴지통으로 옮겼습니다.</span>
              <strong>실행 취소</strong>
            </div>
          )}
        </div>
      </ContextFrame>
      {reader && (
        <div className="ci-semantic-parts">
          <span>
            <small>접근 가능한 이름</small>
            <strong>리서치 노트 삭제</strong>
          </span>
          <span>
            <small>역할</small>
            <strong>버튼</strong>
          </span>
          <span>
            <small>상태</small>
            <strong>사용 가능</strong>
          </span>
        </div>
      )}
      <ContextCallout number={1}>
        {reader
          ? "화면의 쓰레기통 모양 자체를 읽는 것이 아니라, 구현된 이름·역할·상태를 음성 등으로 전달합니다. 실제 안내 문구는 보조 기술과 설정에 따라 다릅니다."
          : "휴지통 아이콘을 보면 삭제나 휴지통 이동을 예상합니다. 익숙한 경험으로 생긴 기대와 실제 결과가 연결되는지 보세요."}
      </ContextCallout>
    </>
  );
}

function Responsive({
  first = false,
  app = false,
  platform = false,
}: {
  first?: boolean;
  app?: boolean;
  platform?: boolean;
}) {
  const desktop = (
    <ContextFrame
      brand={app ? "도토리" : "하루산책"}
      chrome="web"
      url={app ? "dotori.example/library" : "haru.example/trails"}
    >
      <div className="ci-padding">
        <div className="ci-library-title">
          <strong>{app ? "◒ 도토리" : "HARU."}</strong>
          <span className="ci-brand-links">{app ? "내 자료 / 즐겨찾기" : "산책길 / 저널"}</span>
        </div>
        <h4 className="ci-screen-title">{app ? "저장한 산책 자료" : "오늘, 잠시 걸어 보세요."}</h4>
        <div className="ci-responsive-cards">
          {(["forest", "coast", "desert"] as const).map((asset, i) => (
            <div className="ci-landscape-card" key={asset}>
              <ContextPhoto asset={asset} alt={["숲", "바다", "사막"][i] ?? "풍경"} />
              <strong>{["초록빛 숲길", "바다의 산책", "고요한 모래"][i]}</strong>
              <small>
                {app ? "JPG · 산책 기록" : ["30분 · 1.8 km", "40분 · 2.4 km", "50분 · 3.1 km"][i]}
              </small>
            </div>
          ))}
        </div>
      </div>
    </ContextFrame>
  );
  const mobile = platform ? (
    <WalkApp />
  ) : (
    <ContextFrame
      brand={app ? "도토리" : "하루산책"}
      chrome="mobile"
      url={app ? "dotori.example/library" : "haru.example/trails"}
    >
      <div className="ci-mobile-web-address">
        <span>AA</span>
        <strong>{app ? "dotori.example" : "haru.example"}</strong>
        <span>⟳</span>
      </div>
      <div className="ci-padding">
        <div className="ci-library-title">
          <strong>{app ? "◒ 도토리" : "HARU."}</strong>
          <Menu size={20} />
        </div>
        <h4 className="ci-screen-title">{app ? "저장한 산책 자료" : "오늘, 잠시 걸어 보세요."}</h4>
        <div className="ci-responsive-cards ci-responsive-cards-mobile">
          {(["forest", "coast", "desert"] as const).map((asset, i) => (
            <div className="ci-landscape-card" key={asset}>
              <ContextPhoto asset={asset} alt={["숲", "바다", "사막"][i] ?? "풍경"} />
              <strong>{["초록빛 숲길", "바다의 산책", "고요한 모래"][i]}</strong>
              <small>
                {app ? "JPG · 산책 기록" : ["30분 · 1.8 km", "40분 · 2.4 km", "50분 · 3.1 km"][i]}
              </small>
            </div>
          ))}
        </div>
      </div>
    </ContextFrame>
  );
  return (
    <>
      <div className={`ci-responsive-pair ${first ? "ci-mobile-first" : ""}`}>
        <State label={first ? "먼저 · 작은 화면의 핵심 정보" : "넓은 화면 · 웹"}>
          {first ? mobile : desktop}
        </State>
        <State
          label={
            first
              ? "다음 · 여유 공간으로 확장"
              : platform
                ? "휴대전화 · 설치형 앱"
                : "좁은 화면 · 같은 웹"
          }
        >
          {first ? desktop : mobile}
        </State>
      </div>
      <ContextCallout number={1}>
        {first
          ? "작은 화면에서 필요한 정보와 행동을 먼저 정하고 넓은 화면으로 확장하는 설계 순서입니다. 단순히 모바일 크기가 존재한다는 뜻과 구분합니다."
          : platform
            ? "컴퓨터의 웹 브라우저와 휴대전화의 설치형 앱처럼 제품이 작동하는 환경을 비교합니다. 화면 크기뿐 아니라 입력·배포·기기 기능 조건도 다릅니다."
            : app
              ? "자료를 찾는 같은 웹앱의 기능과 데이터가 화면 폭에 맞춰 재배치됩니다. 단순한 모바일 전용 앱을 뜻하지 않습니다."
              : "같은 콘텐츠의 열 수와 줄바꿈이 가용 폭에 맞춰 바뀝니다. 데스크톱 화면 전체를 작게 축소한 모습과 구분하세요."}
      </ContextCallout>
    </>
  );
}

function Motion() {
  return (
    <>
      <div className="ci-motion-states">
        <State label="시작 · 0 ms">
          <MenuWebsite />
        </State>
        <State label="중간 · 140 ms">
          <MenuWebsite open motionStep={1} />
        </State>
        <State label="끝 · 280 ms">
          <MenuWebsite open />
        </State>
      </div>
      <div className="ci-motion-timeline">
        <i />
        <span>닫힘</span>
        <span>위치·투명도의 변화</span>
        <span>열림</span>
      </div>
      <ContextCallout number={1}>
        움직임의 시작·중간·끝을 나란히 놓은 상태 예시입니다. 패널이 어디서 나타났는지 연결하고,
        움직임 줄이기 설정도 고려합니다.
      </ContextCallout>
    </>
  );
}

function Speech({
  control = false,
  switchMode = false,
}: {
  control?: boolean;
  switchMode?: boolean;
}) {
  if (control || switchMode)
    return (
      <>
        <div className="ci-assistive-layout">
          <WalkApp voice={control} switchMode={switchMode} />
          <div className="ci-assistive-console">
            <span className="ci-overline">{control ? "음성 명령" : "스위치 입력"}</span>
            {control ? (
              <>
                <Mic size={33} />
                <blockquote>“초록빛 숲길 열기”</blockquote>
                <div className="ci-command-result">
                  <Check size={18} />
                  <span>이름이 일치하는 항목 선택</span>
                </div>
                <small>보이는 이름과 조작 대상 이름을 연결합니다.</small>
              </>
            ) : (
              <>
                <span className="ci-switch-disc">선택</span>
                <div className="ci-scan-order">
                  <span className="ci-selected">1</span>
                  <ArrowRight size={15} />
                  <span>2</span>
                  <ArrowRight size={15} />
                  <span>3</span>
                </div>
                <p>스캔 강조가 원하는 항목에 왔을 때 스위치를 작동합니다.</p>
                <small>자동 스캔 방식의 한 예시이며 장치와 설정에 따라 다릅니다.</small>
              </>
            )}
          </div>
        </div>
        <ContextCallout number={1}>
          {control
            ? "음성 제어는 말로 UI를 조작하는 방식입니다. 말을 입력칸의 문자로 바꾸는 음성 받아쓰기와 구분하세요."
            : "물리 스위치의 신호를 항목 이동이나 선택 동작에 연결합니다. 한 번의 입력이 무엇을 뜻하는지는 접근 방식과 설정에 따라 달라집니다."}
        </ContextCallout>
      </>
    );
  return (
    <>
      <ContextFrame brand="도토리 노트" chrome="web" url="dotori.example/notes/new">
        <div className="ci-padding">
          <span className="ci-overline">NEW NOTE</span>
          <h4 className="ci-screen-title">산책하며 떠오른 생각</h4>
          <div className="ci-dictation">
            <div className="ci-dictation-bar">
              <Mic size={20} />
              <strong>말을 텍스트로 입력하는 중</strong>
              <span className="ci-audio-bars">
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>
            <p>
              오늘은 숲길의 안내 표지판을 관찰했다.
              <br />
              갈림길에서 다음 방향을 쉽게 알 수 있었다.
              <span className="ci-caret" />
            </p>
          </div>
          <span className="ci-body-copy">초안을 읽고 잘못 인식된 표현을 수정하세요.</span>
          <Action>노트 저장</Action>
        </div>
      </ContextFrame>
      <div className="ci-transcription-flow">
        <span>
          <Mic size={18} /> 발화 내용
        </span>
        <ArrowRight size={17} />
        <span>“오늘은 숲길의…”</span>
        <ArrowRight size={17} />
        <span>편집 가능한 텍스트</span>
      </div>
      <ContextCallout number={1}>
        말한 내용이 문자로 변환되는 과정입니다. ‘노트 저장’이라는 음성 명령을 실행하는 것과 다르며
        인식 결과를 확인해야 합니다.
      </ContextCallout>
    </>
  );
}

function Universal() {
  return (
    <>
      <ContextFrame brand="모래 책방" chrome="web" url="mora.example/reserve">
        <div className="ci-padding">
          <BookCard compact />
          <div className="ci-quantity">
            <div>
              <strong>참여 인원</strong>
              <small>한 번에 최대 4명까지 예약할 수 있어요.</small>
            </div>
            <span className="ci-stepper">
              <span>
                <Minus size={19} />
              </span>
              <strong>1</strong>
              <span>
                <Plus size={19} />
              </span>
            </span>
          </div>
          <Action>
            1명 예약하기 <ArrowRight size={16} />
          </Action>
          <p className="ci-body-copy">변경·취소 조건은 예약 전에 확인할 수 있습니다.</p>
        </div>
      </ContextFrame>
      <div className="ci-input-methods">
        <span>
          <span className="ci-input-icon">↖</span>
          <strong>마우스·터치</strong>
          <small>+ / − 선택</small>
        </span>
        <span>
          <Keyboard size={22} />
          <strong>키보드</strong>
          <small>요소 이동 후 실행</small>
        </span>
        <span>
          <Mic size={22} />
          <strong>음성 제어</strong>
          <small>이름으로 요소 선택</small>
        </span>
      </div>
      <ContextCallout number={1}>
        같은 예약 과업을 다양한 조건에서 이용하도록 입력 방법과 명확한 안내를 함께 고려합니다. 이
        화면 하나로 모든 사용자의 접근성이 보장되는 것은 아닙니다.
      </ContextCallout>
    </>
  );
}

function Body({ termId }: { termId: string }) {
  switch (termId) {
    case "accessibility":
      return <Accessible />;
    case "traversal-order":
      return <TraversalOrder />;
    case "alternative-text-alt-text":
      return <AltText />;
    case "assistive-technology":
      return <AltText technology />;
    case "call-to-action-cta":
      return <Newsletter />;
    case "carousels":
      return <Carousel />;
    case "color-modification":
      return <ReadingOptions color />;
    case "curb-cut":
      return <CurbCut />;
    case "customizable-text":
      return <ReadingOptions />;
    case "database-model":
      return (
        <>
          <Library mode="database" />
          <ContextCallout number={1}>
            자료가 제목·유형·주제 같은 속성으로 저장되고, 검색어와 조건을 조합해 접근하는
            모습입니다. 표 모양 자체만을 뜻하지 않습니다.
          </ContextCallout>
        </>
      );
    case "deceptive-patterns":
      return <Deceptive />;
    case "dedicated-mobile-app":
      return (
        <>
          <div className="ci-installed-app">
            <div className="ci-install-badge">
              <span className="ci-app-icon">h.</span>
              <span>
                <strong>하루산책</strong>
                <small>휴대전화에 설치한 앱</small>
              </span>
              <Smartphone size={24} />
            </div>
            <WalkApp />
          </div>
          <ContextCallout number={1}>
            홈 화면의 앱 아이콘으로 실행한 설치형 모바일 앱의 예시입니다. 좁은 웹사이트 화면과
            설치·실행 환경을 구분하세요.
          </ContextCallout>
        </>
      );
    case "domain":
      return <Domain />;
    case "edge-case":
      return (
        <>
          <div className="ci-pair">
            <State label="일반적인 성공 상태">
              <UploadState />
            </State>
            <State label="용량 제한에 걸린 경우">
              <UploadState error />
            </State>
          </div>
          <ContextCallout number={1}>
            정상 완료 외에 파일이 제한을 넘을 때의 화면과 복구 행동을 설계합니다. 이런 예외 조건을
            포함해야 실제 이용 상황을 다룰 수 있습니다.
          </ContextCallout>
        </>
      );
    case "elements":
      return <IconSystem elements />;
    case "feedback-loops":
      return <FormFeedback />;
    case "graceful-degradation-top-down-designing":
      return <Enhancement graceful />;
    case "hamburger-menus":
      return <Hamburger />;
    case "happy-path":
      return <HappyPath />;
    case "high-fidelity-prototypes":
      return <FormFeedback fidelity />;
    case "iconography":
      return <IconSystem />;
    case "interactivity":
      return <Interaction />;
    case "landmarks":
      return <Landmarks />;
    case "mental-models":
      return <TrashExpectation />;
    case "mobile-first-philosophy":
      return <Responsive first />;
    case "motion":
      return <Motion />;
    case "navigation":
      return <Interaction navigation />;
    case "next-billion-users-nbu":
      return (
        <>
          <div className="ci-assistive-layout">
            <WalkApp lowData />
            <div className="ci-access-panel">
              <span className="ci-overline">연결 조건을 고려한 설계</span>
              <CloudOff size={31} />
              <h4>
                연결이 느려도
                <br />
                이어지는 산책.
              </h4>
              <p>이미지 전송량을 줄이고 저장한 길의 이름·거리·예상 시간을 먼저 제공합니다.</p>
              <div className="ci-command-result">
                <Check size={18} /> 저장한 경로는 오프라인에서 확인
              </div>
            </div>
          </div>
          <ContextCallout number={1}>
            새로 인터넷을 이용하는 다양한 사용자 맥락을 살펴보는 예시입니다. 한 지역·연령·기기
            수준으로 사용자를 단정하지 않고 언어·연결·경험 조건을 조사합니다.
          </ContextCallout>
        </>
      );
    case "platform":
      return <Responsive platform />;
    case "product":
      return <HappyPath product />;
    case "progressive-enhancement-bottom-up-designing":
      return <Enhancement />;
    case "prototype":
      return <Interaction prototype />;
    case "responsive-web-app":
      return <Responsive app />;
    case "responsive-web-design":
      return <Responsive />;
    case "scalable":
      return (
        <>
          <Library mode="scale" />
          <div className="ci-scale-rule">
            <span>
              <Folder size={18} />
              <strong>12개 자료</strong>
            </span>
            <ArrowRight size={17} />
            <span>
              <Folder size={18} />
              <strong>248개 자료</strong>
            </span>
            <small>같은 필드·검색·필터·페이지 규칙</small>
          </div>
          <ContextCallout number={1}>
            콘텐츠 수가 늘어도 탐색과 관리 규칙을 확장할 수 있게 구성한 예시입니다. 화면을 확대하는
            것과 구분하며 실제 성능은 별도 검증이 필요합니다.
          </ContextCallout>
        </>
      );
    case "screen-reader":
      return <TrashExpectation reader />;
    case "speech-to-text":
      return <Speech />;
    case "switch-device":
      return <Speech switchMode />;
    case "universal-design":
      return <Universal />;
    case "voice-control":
      return <Speech control />;
    default:
      return null;
  }
}

export function InteractionScenes({ termId, figure }: { termId: string; figure: LearningFigure }) {
  return (
    <div
      className="ci-scenes"
      data-context-term={termId}
      aria-label={`${figure.title}의 실제 맥락 예시`}
    >
      <Body termId={termId} />
    </div>
  );
}
