import type { CSSProperties, ReactNode } from "react";
import {
  ArrowRight,
  ChevronRight,
  Search,
  Bookmark,
  Check,
  SlidersHorizontal,
  CalendarDays,
  MapPin,
} from "lucide-react";
import type { LearningFigure } from "@/data/learning/types";
import { ContextFrame, ContextPhoto, ContextCallout } from "./ContextFrame";
import "./visual-scenes.css";

type SceneFamily =
  "magazine" | "focus" | "spacing" | "decoration" | "type" | "fidelity" | "consistency";
const scenes: Record<string, { family: SceneFamily; note: string }> = {
  "above-the-fold": {
    family: "magazine",
    note: "점선 위는 스크롤하기 전에 보이는 영역입니다. 같은 페이지라도 화면 높이에 따라 첫 화면의 끝이 달라집니다.",
  },
  "asymmetrical-layout": {
    family: "magazine",
    note: "큰 사진과 좁은 글 영역이 서로 다른 면적을 차지합니다. 좌우 대칭 없이 여백과 텍스트의 무게로 균형을 잡은 배치입니다.",
  },
  "basic-grid": {
    family: "magazine",
    note: "가이드 위에서 제목·이미지·카드의 왼쪽 끝이 맞물립니다. 이 예시는 6개 컬럼을 사용하며, 컬럼 수 자체가 모든 화면의 규칙은 아닙니다.",
  },
  borders: {
    family: "decoration",
    note: "예약 카드 가장자리를 둘러싼 실선이 보더입니다. 안쪽의 배경색이나 바깥으로 번지는 그림자와 구분해 보세요.",
  },
  "box-layout": {
    family: "magazine",
    note: "주요 기사·추천 기사·뉴스레터가 서로 다른 사각 구획을 차지합니다. 사각 영역의 조합이 페이지의 레이아웃을 만듭니다.",
  },
  cards: {
    family: "magazine",
    note: "사진·카테고리·제목·읽기 시간이 하나의 경계 안에 묶여 한 기사로 읽힙니다. 이 전체 묶음이 카드입니다.",
  },
  "common-region": {
    family: "spacing",
    note: "‘연락처’와 ‘방문 정보’를 각각 둘러싼 경계가 같은 영역에 속한 필드를 묶습니다. 단순히 가까운 배치와 함께 사용할 수도 있습니다.",
  },
  consistency: {
    family: "consistency",
    note: "예약 신청과 대기 신청에서 입력칸·선택 상태·주요 행동의 표현이 같습니다. 사용자는 앞 화면에서 배운 규칙을 다음 화면에서도 사용할 수 있습니다.",
  },
  containment: {
    family: "decoration",
    note: "예약 요약 안의 일정·인원·가격이 하나의 컨테이너에 담겼습니다. 경계와 내부 여백이 ‘어디까지 같은 내용인가’를 드러냅니다.",
  },
  dividers: {
    family: "decoration",
    note: "예약 일정과 결제 요약 사이의 가느다란 가로선이 디바이더입니다. 모든 문장에 선을 긋는 대신 정보 묶음 사이를 나눕니다.",
  },
  emphasis: {
    family: "focus",
    note: "여러 정보 중 ‘이번 주 일요일’만 굵기와 배경색으로 강조했습니다. 모든 요소를 같은 강도로 강조하면 강조점이 사라집니다.",
  },
  "f-shape-layout": {
    family: "magazine",
    note: "텍스트 중심 목록에서 상단과 각 줄의 시작을 따라 읽기 쉬운 배치입니다. 표시된 F 경로는 설명용이며 모든 사용자의 실제 시선 경로를 뜻하지 않습니다.",
  },
  "featured-image-layout": {
    family: "magazine",
    note: "화면 폭을 크게 차지하는 대표 사진이 콘텐츠의 중심입니다. 사진에 대응하는 제목·캡션·본문이 이어집니다.",
  },
  fidelity: {
    family: "fidelity",
    note: "같은 예약 화면을 구조 중심 버전과 실제 문구·사진·스타일을 적용한 버전으로 비교합니다. 여기서 비교하는 것은 표현의 구체성이지 작동 여부가 아닙니다.",
  },
  fill: {
    family: "decoration",
    note: "선택한 날짜의 내부 면을 채운 짙은 색이 필입니다. 테두리만 있는 다른 날짜와 비교하면 내부 채우기의 역할이 분명해집니다.",
  },
  "focal-point": {
    family: "focus",
    note: "넓은 사진 속 밝은 제목 영역이 주변과 대비되어 시선의 중심이 됩니다. 다른 요소를 모두 크게 만드는 대신 한 지점을 두드러지게 설계했습니다.",
  },
  font: {
    family: "type",
    note: "이 예시의 제목은 Pretendard Bold로 설정했습니다. 같은 폰트에서도 크기·행간·자간 설정을 달리할 수 있습니다.",
  },
  "gestalt-principles": {
    family: "spacing",
    note: "가까운 필드, 같은 모양의 선택지, 공통 경계를 함께 읽어 보세요. 별개의 요소들이 관계 있는 묶음으로 인식되는 예시입니다.",
  },
  "grid-of-cards-layout": {
    family: "magazine",
    note: "동일한 구조의 기사 카드 4개가 행과 열을 맞춰 배치됩니다. 한 카드의 내부 구조와 여러 카드를 배열한 그리드를 구분해 보세요.",
  },
  hierarchy: {
    family: "focus",
    note: "전시명 → 일정 → 소개 순서로 글자 크기와 굵기가 달라집니다. 정보의 중요도와 읽는 순서를 시각적으로 구분한 위계입니다.",
  },
  "high-fidelity-hi-fi": {
    family: "fidelity",
    note: "문구·사진·색·간격이 실제 서비스에 가까운 오른쪽 시안을 보세요. 하이파이 시안도 정적일 수 있으며, 인터랙션 구현을 뜻하지는 않습니다.",
  },
  "initial-focus": {
    family: "focus",
    note: "화면에 들어왔을 때 큰 전시명이 먼저 눈에 들어오도록 구성했습니다. 여기서는 첫 시각적 주목을 뜻하며 키보드의 초기 포커스와 구분합니다.",
  },
  layout: {
    family: "magazine",
    note: "같은 기사 3개를 한 열의 목록과 두 열의 카드로 배치했습니다. 내용은 같아도 요소의 위치와 공간 관계가 달라집니다.",
  },
  "layout-grid": {
    family: "magazine",
    note: "컬럼·거터·바깥 여백 위에 사진과 글이 정렬됩니다. 가이드선은 설계 기준을 보여 주는 오버레이이며 실제 서비스에서는 숨겨집니다.",
  },
  "lorem-ipsum": {
    family: "type",
    note: "왼쪽은 임시 문구, 오른쪽은 실제 기사 내용입니다. 실제 제목과 본문을 넣으면 길이·줄바꿈·필요한 영역이 달라집니다.",
  },
  "low-fidelity-lo-fi": {
    family: "fidelity",
    note: "사진 대신 영역 표시와 주요 문구만 남겼습니다. 장식보다 정보의 위치·순서·기능을 검토하는 로파이 예시입니다.",
  },
  mockup: {
    family: "fidelity",
    note: "최종 문구·이미지·버튼 모양을 표현한 정적 시안입니다. 버튼처럼 보여도 이 목업 자체에 클릭 동작이 구현되었다고 가정하지 않습니다.",
  },
  "multi-column-layout": {
    family: "magazine",
    note: "본문과 ‘이 글의 목차’가 서로 다른 세로 열을 차지합니다. 주요 내용과 보조 내용을 동시에 배치하는 다중 컬럼 레이아웃입니다.",
  },
  "negative-white-space": {
    family: "spacing",
    note: "제목 주변과 두 정보 묶음 사이에 비워 둔 공간을 보세요. 네거티브 스페이스는 흰색 자체가 아니라 요소 사이에 남긴 여유 공간입니다.",
  },
  proportion: {
    family: "focus",
    note: "같은 콘텐츠에서 사진과 글이 차지하는 비율을 비교합니다. 크기 하나보다 전체와 부분 사이의 상대적인 비중을 보는 개념입니다.",
  },
  proximity: {
    family: "spacing",
    note: "‘이름’ 라벨과 입력값은 가깝게, 다음 정보 묶음과는 멀게 두었습니다. 거리의 차이가 관련 있는 요소를 묶어 줍니다.",
  },
  scale: {
    family: "focus",
    note: "대표 기사 사진을 나머지 사진보다 크게 배치했습니다. 주변 요소와 비교한 크기 차이가 대표 콘텐츠를 드러냅니다.",
  },
  shadows: {
    family: "decoration",
    note: "예약 카드 바깥에 부드럽게 번지는 음영이 섀도입니다. 배경 위에 떠 있는 표면 관계를 표현하며 카드의 테두리와는 다릅니다.",
  },
  similarity: {
    family: "magazine",
    note: "‘에세이’는 같은 알약 모양, ‘가이드’는 같은 사각 라벨로 표시했습니다. 비슷한 시각 표현끼리 같은 범주로 묶여 보이는 예시입니다.",
  },
  "single-column-layout": {
    family: "magazine",
    note: "제목·사진·본문이 한 세로 열을 따라 이어집니다. 여러 열을 동시에 읽는 대신 위에서 아래로 순서가 명확한 구성입니다.",
  },
  "tiered-layer-cake-layout": {
    family: "magazine",
    note: "소개 사진, 추천 콘텐츠, 뉴스레터가 각각 가로 띠를 이루며 위아래로 쌓입니다. 각 띠 안에서는 다른 열 구성을 사용할 수 있습니다.",
  },
  "type-classification": {
    family: "type",
    note: "같은 영문 문장을 세리프·산세리프·모노스페이스로 비교합니다. 획 끝의 장식과 글자 폭 등 형태적 특징을 살펴보세요.",
  },
  typeface: {
    family: "type",
    note: "Pretendard의 여러 글자가 비슷한 획과 조형 규칙을 공유합니다. 서체의 정체성과 개별 굵기·크기 설정을 구분해 보세요.",
  },
  "typographic-hierarchy": {
    family: "type",
    note: "기사 제목·부제·본문·캡션의 크기와 굵기가 다릅니다. 이미지나 색 없이도 글자 설정으로 읽는 순서를 만들 수 있습니다.",
  },
  typography: {
    family: "type",
    note: "본문의 글자 크기·행간·한 줄 길이가 함께 작동합니다. 같은 내용이라도 설정에 따라 밀도와 읽는 리듬이 달라집니다.",
  },
  unity: {
    family: "consistency",
    note: "목록과 상세 화면에서 서체·색·여백·이미지 처리 방식이 반복됩니다. 서로 다른 내용이 하나의 서비스처럼 느껴지는 통일성입니다.",
  },
  "visual-balance": {
    family: "magazine",
    note: "한쪽의 큰 사진과 반대쪽의 제목·작은 사진 두 개가 시각적 무게를 나눕니다. 양쪽의 면적을 똑같이 맞추는 것만이 균형은 아닙니다.",
  },
  "visual-design": {
    family: "focus",
    note: "제목·상태 라벨·일정·행동 요소를 크기, 색, 배치로 구분했습니다. 글자만 꾸미는 것이 아니라 정보의 의미가 보이도록 설계한 화면입니다.",
  },
  "visual-weight": {
    family: "focus",
    note: "비슷한 크기의 두 카드 중 어둡고 대비가 강한 카드가 더 눈에 띕니다. 시각적 무게에는 크기뿐 아니라 색·대비·밀도도 영향을 줍니다.",
  },
  wireframe: {
    family: "fidelity",
    note: "콘텐츠 목록의 헤더·검색·카드·탐색 위치를 배치한 와이어프레임입니다. 사진과 브랜드 표현보다 구조와 요소 사이의 관계를 확인합니다.",
  },
  "z-shape-layout": {
    family: "magazine",
    note: "로고 → 상단 탐색 → 소개 문구 → 주요 행동의 네 지점을 Z 방향으로 연결한 배치입니다. 단순한 소개 화면의 구성 예시이며 실제 시선을 보장하지 않습니다.",
  },
};

export const VISUAL_TERM_IDS = Object.keys(scenes);

const stories = [
  {
    title: "숲에서 보내는 한 시간",
    category: "에세이",
    image: "forest",
    summary: "속도를 늦추고 주변의 작은 변화를 기록합니다.",
    meta: "5분 읽기",
  },
  {
    title: "파도를 기다리는 방법",
    category: "가이드",
    image: "coast",
    summary: "바다를 따라 걷는 주말의 산책 코스.",
    meta: "7분 읽기",
  },
  {
    title: "낯선 풍경을 만나는 일",
    category: "에세이",
    image: "desert",
    summary: "익숙한 일상 밖에서 발견한 색과 형태.",
    meta: "4분 읽기",
  },
  {
    title: "초록을 가까이 두기",
    category: "가이드",
    image: "forest",
    summary: "도심에서도 잠시 쉬어 갈 수 있는 장소들.",
    meta: "6분 읽기",
  },
] as const;

function Mark({ n = 1, className = "" }: { n?: number; className?: string }) {
  return (
    <span className={`cv-mark ${className}`} aria-hidden="true">
      {n}
    </span>
  );
}

function EditorialHeader({ marked = false }: { marked?: boolean }) {
  return (
    <div className="cv-editorial-header">
      <strong className="cv-logo">
        틈새<span>.</span>
        {marked && <Mark n={1} />}
      </strong>
      <div className="cv-nav">
        <span>이야기</span>
        <span>장소</span>
        <span>소개</span>
        {marked && <Mark n={2} />}
      </div>
      <Search size={17} aria-hidden="true" />
    </div>
  );
}

function EditorialCard({
  index,
  compact = false,
  mark = false,
  categoryShape = false,
}: {
  index: number;
  compact?: boolean;
  mark?: boolean;
  categoryShape?: boolean;
}) {
  const story = stories[index % stories.length]!;
  return (
    <article
      className={`cv-editorial-card${compact ? " cv-card-compact" : ""}${mark ? " cv-highlight" : ""}`}
    >
      <div className="cv-card-photo">
        <ContextPhoto
          asset={story.image}
          alt={
            index === 1 ? "바닷가의 해안선" : index === 2 ? "넓게 펼쳐진 사막" : "빛이 들어오는 숲"
          }
        />
        {mark && <Mark />}
      </div>
      <div className="cv-card-copy">
        <span
          className={`cv-story-category${categoryShape ? (story.category === "에세이" ? " cv-category-pill" : " cv-category-square") : ""}`}
        >
          {story.category}
        </span>
        <h5>{story.title}</h5>
        {!compact && <p>{story.summary}</p>}
        <span className="cv-story-meta">
          {story.meta}
          <Bookmark size={14} aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

function Hero({ variant = "split", marked = false }: { variant?: string; marked?: boolean }) {
  return (
    <div className={`cv-hero cv-hero-${variant}`}>
      <div className="cv-hero-photo">
        <ContextPhoto asset="forest" alt="햇빛이 들어오는 초록 숲" />
        {marked && <Mark />}
      </div>
      <div className="cv-hero-copy">
        <span className="cv-kicker">SLOW JOURNAL / 06</span>
        <h5>
          잠시 멈추면
          <br />
          보이는 것들.
        </h5>
        <p>걷고, 바라보고, 기록하는 사람들을 위한 작은 매거진.</p>
        <span className="cv-text-link">
          이번 호 읽기 <ArrowRight size={15} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

function FoldScene() {
  return (
    <div className="cv-fold-pair">
      {["짧은 화면", "긴 화면"].map((label, index) => (
        <div className="cv-fold-example" key={label}>
          <span className="cv-comparison-label">{label}</span>
          <ContextFrame brand="모래 책방" chrome="web" url="morae.example">
            <div className={`cv-fold-viewport cv-fold-${index}`}>
              <div className="cv-shop-header">
                <strong>모래 책방</strong>
                <span>모임 / 책 / 소개</span>
              </div>
              <div className="cv-fold-photo">
                <ContextPhoto asset="forest" alt="이번 달 독서 모임의 숲 사진" />
              </div>
              <div className="cv-fold-copy">
                <span className="cv-kicker">BOOK CLUB</span>
                <h5>함께 읽는 토요일</h5>
                <p>책 한 권을 사이에 두고 나누는 대화.</p>
                <span className="cv-solid-action">
                  모임 신청하기 <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
              <div className="cv-fold-more">
                <h6>이달의 책 모임</h6>
                <p>처음 오시는 분도 편하게 참여할 수 있어요.</p>
              </div>
            </div>
            <div className="cv-fold-line">
              <span>이 화면에서 스크롤 전 보이는 끝</span>
              <Mark />
            </div>
          </ContextFrame>
        </div>
      ))}
    </div>
  );
}

function LayoutComparison() {
  return (
    <div className="cv-layout-comparison">
      {["한 열 목록", "카드 그리드"].map((label, version) => (
        <div key={label}>
          <span className="cv-comparison-label">{label}</span>
          <ContextFrame brand="틈새" chrome="web">
            <div className="cv-mini-magazine">
              <EditorialHeader />
              <h5 className="cv-section-heading">이번 주 읽을거리</h5>
              <div className={version === 0 ? "cv-row-list" : "cv-mini-grid"}>
                {stories.slice(0, 3).map((story, i) => (
                  <EditorialCard key={story.title} index={i} compact />
                ))}
              </div>
            </div>
          </ContextFrame>
        </div>
      ))}
    </div>
  );
}

function MagazineScene({ termId }: { termId: string }) {
  if (termId === "above-the-fold") return <FoldScene />;
  if (termId === "layout") return <LayoutComparison />;
  const grid = ["basic-grid", "layout-grid"].includes(termId);
  const isF = termId === "f-shape-layout";
  const isZ = termId === "z-shape-layout";
  const fullImage = termId === "featured-image-layout";
  const single = termId === "single-column-layout";
  const multi = termId === "multi-column-layout";
  const boxed = termId === "box-layout";
  const layers = termId === "tiered-layer-cake-layout";
  const asymmetric = ["asymmetrical-layout", "visual-balance"].includes(termId);
  const cardMode = ["cards", "grid-of-cards-layout", "similarity"].includes(termId);
  return (
    <ContextFrame brand="틈새 매거진" chrome="web" url="teumsae.example/journal">
      <div className={`cv-magazine cv-magazine-${termId}${grid ? " cv-grid-visible" : ""}`}>
        <EditorialHeader marked={isZ} />
        {grid && (
          <div className="cv-grid-legend">
            <span>컬럼</span>
            <span>↔ 거터</span>
            <span>↔ 바깥 여백</span>
          </div>
        )}
        <div className="cv-magazine-body">
          {isF ? (
            <div className="cv-f-layout">
              <header>
                <span className="cv-kicker">JOURNAL</span>
                <h5>일상에 틈을 만드는 이야기</h5>
                <p>가까운 곳에서 발견하는 새로운 장면들.</p>
              </header>
              <div className="cv-f-scan" aria-hidden="true">
                <i />
                <i />
                <i />
                <Mark />
              </div>
              {stories.slice(0, 3).map((story, index) => (
                <article className="cv-f-story" key={story.title}>
                  <div>
                    <span className="cv-story-category">{story.category}</span>
                    <h6>{story.title}</h6>
                    <p>{story.summary} 바쁜 하루에서 나만의 속도를 찾아 보세요.</p>
                    <small>{story.meta}</small>
                  </div>
                  <ContextPhoto asset={story.image} alt={story.title} />
                </article>
              ))}
            </div>
          ) : single || multi ? (
            <>
              <div className="cv-article-title">
                <span className="cv-kicker">ESSAY / 5 MIN READ</span>
                <h5>
                  숲에서 보내는
                  <br />한 시간
                </h5>
                <p>글 · 이서윤 / 사진 · 틈새 편집부</p>
              </div>
              <ContextPhoto
                asset="forest"
                alt="기사의 대표 이미지인 울창한 숲"
                className="cv-article-cover"
              />
              <div className={`cv-reading-layout${multi ? " cv-reading-multi" : ""}`}>
                <div className="cv-reading-copy">
                  <h6>천천히 걸어도 괜찮은 곳</h6>
                  <p>
                    길의 끝을 정하지 않고 걷기 시작했습니다. 발아래의 작은 잎, 나무 사이로 들어오는
                    빛, 바람에 바뀌는 소리에 잠시 멈췄습니다.
                  </p>
                  <p>
                    멀리 떠나지 않아도 괜찮습니다. 익숙한 풍경을 조금 다른 속도로 바라보는 것부터
                    시작해 보세요.
                  </p>
                </div>
                {multi && (
                  <aside className="cv-article-toc">
                    <Mark />
                    <span>이 글의 목차</span>
                    <p>01 · 천천히 걷기</p>
                    <p>02 · 작은 것 관찰하기</p>
                    <p>03 · 오늘의 장면 기록</p>
                  </aside>
                )}
              </div>
            </>
          ) : isZ ? (
            <div className="cv-z-layout">
              <div className="cv-z-empty">
                <ContextPhoto asset="coast" alt="틈새 매거진에 소개된 해안 풍경" />
              </div>
              <div className="cv-z-bottom">
                <div>
                  <Mark n={3} />
                  <h5>
                    당신의 주말에,
                    <br />
                    작은 틈을.
                  </h5>
                  <p>새로운 장소와 이야기를 만나세요.</p>
                </div>
                <span className="cv-solid-action">
                  이야기 둘러보기 <ArrowRight size={15} aria-hidden="true" />
                  <Mark n={4} />
                </span>
              </div>
              <svg
                className="cv-z-guide"
                viewBox="0 0 600 260"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M25 10H575L25 230H575" />
              </svg>
            </div>
          ) : cardMode ? (
            <>
              <div className="cv-title-line">
                <div>
                  <span className="cv-kicker">CURATED STORIES</span>
                  <h5>이번 주 읽을거리</h5>
                </div>
                <span>전체 보기 →</span>
              </div>
              <div className={termId === "cards" ? "cv-one-card" : "cv-editorial-grid"}>
                {stories.slice(0, termId === "cards" ? 1 : 4).map((story, index) => (
                  <EditorialCard
                    key={story.title}
                    index={index}
                    mark={termId === "cards"}
                    categoryShape={termId === "similarity"}
                  />
                ))}
              </div>
            </>
          ) : boxed ? (
            <div className="cv-box-layout">
              <div className="cv-box-lead">
                <Hero variant="overlay" />
              </div>
              <div className="cv-box-side">
                <span className="cv-kicker">EDITOR'S NOTE</span>
                <h5>
                  더 천천히,
                  <br />더 가까이.
                </h5>
                <p>좋은 이야기는 가장 가까운 곳에 있습니다.</p>
                <span className="cv-text-link">편집자의 편지 →</span>
              </div>
              <div className="cv-box-footer">
                <strong>월요일에 만나요.</strong>
                <span>틈새의 새 이야기를 이메일로 받아보세요.</span>
                <span className="cv-outline-action">뉴스레터 구독</span>
              </div>
            </div>
          ) : asymmetric ? (
            <div className="cv-asymmetric">
              <div className="cv-asymmetric-photo">
                <ContextPhoto asset="forest" alt="큰 면적으로 배치한 숲 사진" />
                <span className="cv-photo-credit">A SLOW AFTERNOON</span>
              </div>
              <div className="cv-asymmetric-copy">
                <span className="cv-kicker">FIELD NOTES / 06</span>
                <h5>
                  숲에 머무는
                  <br />
                  오후
                </h5>
                <p>오래 바라볼수록 더 많은 장면을 발견합니다.</p>
                <span className="cv-text-link">이야기 읽기 →</span>
                <div className="cv-small-photo-pair">
                  <ContextPhoto asset="coast" alt="작게 배치한 바다 사진" />
                  <ContextPhoto asset="desert" alt="작게 배치한 사막 사진" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <Hero variant={fullImage || layers ? "full" : "split"} marked={fullImage} />
              <div className={`cv-magazine-secondary${layers ? " cv-layer-strip" : ""}`}>
                <h5 className="cv-section-heading">함께 읽는 이야기</h5>
                <div className="cv-editorial-grid">
                  {stories.slice(1, 3).map((story, index) => (
                    <EditorialCard key={story.title} index={index + 1} compact />
                  ))}
                </div>
              </div>
              {layers && (
                <div className="cv-newsletter-strip">
                  <div>
                    <span className="cv-kicker">NEWSLETTER</span>
                    <h5>당신의 일상에, 틈새.</h5>
                  </div>
                  <span className="cv-outline-action">이메일로 받아보기 →</span>
                </div>
              )}
            </>
          )}
        </div>
        {grid && (
          <div className="cv-grid-overlay" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
        )}
      </div>
    </ContextFrame>
  );
}

function EventPoster({ tone = "normal", className = "" }: { tone?: string; className?: string }) {
  return (
    <div className={`cv-event-poster cv-event-${tone} ${className}`}>
      <div className="cv-event-photo">
        <ContextPhoto asset="coast" alt="잔잔한 해안의 풍경" />
      </div>
      <div className="cv-event-copy">
        <span className="cv-kicker">틈새 갤러리 / PHOTO EXHIBITION</span>
        <h5>
          머무는
          <br />
          풍경
        </h5>
        <p className="cv-event-date">
          <CalendarDays size={15} aria-hidden="true" />
          11.01 — 11.30
        </p>
        <p>익숙한 공간을 새롭게 바라보는 세 사람의 사진.</p>
        <span className="cv-solid-action">
          전시 안내 보기 <ArrowRight size={15} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

function TaskDashboard() {
  return (
    <div className="cv-task-app">
      <div className="cv-task-sidebar">
        <b>FORM.</b>
        <span className="cv-task-selected">내 프로젝트</span>
        <span>파일</span>
        <span>팀</span>
      </div>
      <div className="cv-task-main">
        <div className="cv-task-top">
          <span>내 프로젝트 / 포트폴리오</span>
          <span className="cv-avatar">서</span>
        </div>
        <div className="cv-title-line">
          <div>
            <span className="cv-kicker">PROJECT 03</span>
            <h5>포트폴리오 리뷰 준비</h5>
          </div>
          <span className="cv-outline-action">새 작업 +</span>
        </div>
        <div className="cv-task-banner">
          <div>
            <span className="cv-status-chip">마감 예정</span>
            <h6>케이스 스터디 초안 제출</h6>
            <p>프로젝트의 문제와 핵심 결정을 정리해 주세요.</p>
          </div>
          <b>
            내일<small>18:00</small>
          </b>
          <Mark />
        </div>
        <div className="cv-task-list">
          <div>
            <Check size={17} />
            <span>리서치 자료 정리</span>
            <small>완료</small>
          </div>
          <div>
            <span className="cv-empty-check" />
            <span>디자인 과정 작성</span>
            <small>진행 중</small>
          </div>
          <div>
            <span className="cv-empty-check" />
            <span>최종 시안 추가</span>
            <small>예정</small>
          </div>
        </div>
      </div>
    </div>
  );
}

function FocusScene({ termId }: { termId: string }) {
  if (termId === "visual-design")
    return (
      <ContextFrame brand="FORM. 작업 공간" chrome="web" url="form.example/projects">
        <TaskDashboard />
      </ContextFrame>
    );
  if (termId === "proportion")
    return (
      <div className="cv-proportion-pair">
        {["사진 ½ · 글 ½", "사진 ⅔ · 글 ⅓"].map((label, index) => (
          <div key={label}>
            <span className="cv-comparison-label">{label}</span>
            <ContextFrame brand="틈새 갤러리" chrome="web">
              <EventPoster tone={`proportion-${index}`} />
            </ContextFrame>
          </div>
        ))}
      </div>
    );
  if (termId === "scale" || termId === "visual-weight")
    return (
      <ContextFrame brand="틈새" chrome="web" url="teumsae.example">
        <div className="cv-magazine">
          <EditorialHeader />
          <div className="cv-magazine-body">
            <div className="cv-title-line">
              <div>
                <span className="cv-kicker">EDITOR'S PICK</span>
                <h5>이번 주의 시선</h5>
              </div>
            </div>
            <div className={`cv-weight-grid cv-weight-${termId}`}>
              <div>
                <EditorialCard index={0} />
              </div>
              <div>
                <EditorialCard index={1} />
                <span className="cv-story-footnote">주말에 떠나는 짧은 여행</span>
              </div>
            </div>
          </div>
        </div>
      </ContextFrame>
    );
  return (
    <ContextFrame brand="틈새 갤러리" chrome="web" url="teumsae.example/exhibition">
      <div className={`cv-gallery cv-focus-${termId}`}>
        <div className="cv-gallery-header">
          <strong>teumsae gallery</strong>
          <span>현재 전시 / 방문 안내</span>
        </div>
        <EventPoster tone={termId === "focal-point" ? "overlay" : "normal"} />
        {termId === "emphasis" && (
          <div className="cv-event-notice">
            <span className="cv-notice-emphasis">
              이번 주 일요일
              <Mark />
            </span>
            <p>작가와 함께 전시를 둘러보는 시간이 열립니다.</p>
            <span className="cv-text-link">도슨트 일정 확인 →</span>
          </div>
        )}
        {termId !== "emphasis" && (
          <div className="cv-exhibition-detail">
            <div>
              <span>전시 장소</span>
              <strong>틈새 갤러리 1층</strong>
            </div>
            <div>
              <span>관람 시간</span>
              <strong>화–일 · 10:00–18:00</strong>
            </div>
            <div>
              <span>입장 안내</span>
              <strong>현장 관람 가능</strong>
            </div>
          </div>
        )}
      </div>
    </ContextFrame>
  );
}

function FauxField({
  label,
  children,
  marker = false,
}: {
  label: string;
  children: ReactNode;
  marker?: boolean;
}) {
  return (
    <div className="cv-field">
      <span className="cv-field-label">
        {label}
        {marker && <Mark />}
      </span>
      <div className="cv-field-value">{children}</div>
    </div>
  );
}

function SpacingScene({ termId }: { termId: string }) {
  return (
    <ContextFrame brand="모래 책방" chrome="web" url="morae.example/reservation">
      <div className={`cv-booking cv-spacing-${termId}`}>
        <div className="cv-shop-header">
          <strong>모래 책방</strong>
          <span>
            모임 예약 <ChevronRight size={14} aria-hidden="true" /> 신청 정보
          </span>
        </div>
        <div className="cv-booking-grid">
          <aside className="cv-booking-summary">
            <ContextPhoto asset="forest" alt="책 모임을 소개하는 숲 이미지" />
            <span className="cv-kicker">BOOK CLUB</span>
            <h5>함께 읽는 토요일</h5>
            <p>11월 14일 · 오후 2시</p>
            <span className="cv-summary-price">
              20,000원 <small>/ 1명</small>
            </span>
          </aside>
          <div className="cv-booking-form">
            <h5>신청 정보</h5>
            <p className="cv-form-intro">예약 안내를 받을 정보를 확인해 주세요.</p>
            <section className="cv-form-group">
              <h6>연락처</h6>
              <FauxField label="이름" marker={termId === "proximity"}>
                이서윤
              </FauxField>
              <FauxField label="이메일">seoyun@example.com</FauxField>
            </section>
            <section className="cv-form-group">
              <h6>방문 정보</h6>
              <FauxField label="참여 인원">
                1명 <ChevronRight size={15} aria-hidden="true" />
              </FauxField>
              <div className="cv-field">
                <span className="cv-field-label">참여 경험</span>
                <div className="cv-radio-options">
                  <span className="cv-radio-option cv-option-selected">
                    <i />
                    처음이에요
                  </span>
                  <span className="cv-radio-option">
                    <i />
                    참여한 적 있어요
                  </span>
                </div>
              </div>
            </section>
            <div className="cv-booking-bottom">
              <span>총 20,000원</span>
              <span className="cv-solid-action">
                예약 내용 확인 <ArrowRight size={14} aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </ContextFrame>
  );
}

function ReservationCard({ highlight, shadow = false }: { highlight?: string; shadow?: boolean }) {
  return (
    <article
      className={`cv-reservation-card${highlight ? ` cv-reservation-${highlight}` : ""}${shadow ? " cv-reservation-shadow" : ""}`}
    >
      <div className="cv-reservation-photo">
        <ContextPhoto asset="forest" alt="예약한 독서 모임의 대표 사진" />
      </div>
      <div className="cv-reservation-head">
        <span className="cv-status-chip">예약 확정</span>
        <h5>함께 읽는 토요일</h5>
        <p>한 권의 책으로 시작하는 대화</p>
      </div>
      <div className="cv-reservation-details">
        <div>
          <CalendarDays size={16} />
          <span>11월 14일 · 오후 2:00</span>
        </div>
        <div>
          <MapPin size={16} />
          <span>모래 책방 · 2층 모임방</span>
        </div>
      </div>
      <div className="cv-reservation-divider" />{" "}
      <div className="cv-reservation-price">
        <span>참여 인원</span>
        <span>1명</span>
        <span>총 결제 금액</span>
        <strong>20,000원</strong>
      </div>
      <div className="cv-reservation-actions">
        <span>예약 상세 보기</span>
        <ArrowRight size={16} aria-hidden="true" />
      </div>
      {highlight && <Mark className="cv-reservation-mark" />}
    </article>
  );
}

function DecorationScene({ termId }: { termId: string }) {
  if (termId === "fill")
    return (
      <ContextFrame brand="모래 책방" chrome="mobile">
        <div className="cv-date-app">
          <div className="cv-mobile-pagebar">
            <span>‹</span>
            <strong>모임 날짜 선택</strong>
            <span>×</span>
          </div>
          <div className="cv-date-photo">
            <ContextPhoto asset="forest" alt="숲 사진을 사용한 책 모임" />
            <span>함께 읽는 토요일</span>
          </div>
          <h5>
            11월 <small>2026</small>
          </h5>
          <div className="cv-calendar-head">
            {["월", "화", "수", "목", "금", "토", "일"].map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
          <div className="cv-calendar-grid">
            {Array.from({ length: 42 }, (_, index) => {
              // November 2026 begins on Sunday; this calendar starts on Monday.
              const day = index - 5;
              const withinMonth = day >= 1 && day <= 30;
              return (
                <span
                  key={index}
                  className={day === 14 ? "cv-date-selected" : day < 7 ? "cv-date-muted" : ""}
                  aria-hidden={!withinMonth || undefined}
                >
                  {withinMonth ? day : ""}
                  {day === 14 && <Mark />}
                </span>
              );
            })}
          </div>
          <div className="cv-time-options">
            <span>오전 11:00</span>
            <span className="cv-time-selected">
              오후 2:00 <Check size={15} />
            </span>
          </div>
          <div className="cv-date-summary">
            <span>11월 14일 · 오후 2:00</span>
            <span className="cv-solid-action">이 일정으로 선택</span>
          </div>
        </div>
      </ContextFrame>
    );
  return (
    <ContextFrame brand="모래 책방" chrome="web" url="morae.example/my/reservations">
      <div className={`cv-reservations cv-decoration-${termId}`}>
        <div className="cv-shop-header">
          <strong>모래 책방</strong>
          <span>내 예약 / 내 정보</span>
        </div>
        <div className="cv-reservations-content">
          <div className="cv-title-line">
            <div>
              <span className="cv-kicker">MY RESERVATIONS</span>
              <h5>예정된 모임</h5>
            </div>
            <span className="cv-filter-label">
              <SlidersHorizontal size={15} />
              전체 기간
            </span>
          </div>
          <div className={termId === "shadows" ? "cv-shadow-comparison" : "cv-single-reservation"}>
            {termId === "shadows" && (
              <div>
                <span className="cv-comparison-label">음영 없음</span>
                <ReservationCard />
              </div>
            )}
            <div>
              {termId === "shadows" && <span className="cv-comparison-label">음영 있음</span>}
              <ReservationCard highlight={termId} shadow={termId === "shadows"} />
            </div>
          </div>
        </div>
      </div>
    </ContextFrame>
  );
}

function ReadingPage({ lorem = false, dense = false }: { lorem?: boolean; dense?: boolean }) {
  return (
    <article className={`cv-reading-page${dense ? " cv-reading-dense" : ""}`}>
      <span className="cv-kicker">TEUMSAE / ESSAY</span>
      <h5>{lorem ? "Lorem ipsum dolor sit amet" : "숲에서 보내는 한 시간"}</h5>
      <p className="cv-reading-deck">
        {lorem
          ? "Consectetur adipiscing elit, sed do eiusmod tempor."
          : "도시의 속도에서 잠시 벗어나 나만의 리듬을 찾는 방법."}
      </p>
      <div className="cv-reading-byline">
        {lorem ? "Author name / Date" : "글 · 이서윤 / 2026.11.01"}
      </div>
      <ContextPhoto asset="forest" alt="기사에 배치된 숲 풍경" />
      <small className="cv-image-caption">
        {lorem ? "Image caption goes here." : "나무 사이로 햇빛이 들어오는 숲."}
      </small>
      <h6>{lorem ? "Ut enim ad minim veniam" : "작은 장면을 발견하는 시간"}</h6>
      <p>
        {lorem
          ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          : "길의 끝을 정하지 않고 걷기 시작했습니다. 발아래의 작은 잎과 나무 사이로 들어오는 빛이 눈에 들어왔습니다. 바쁜 일상에서 놓쳤던 소리에 잠시 귀를 기울였습니다."}
      </p>
      <p>
        {lorem
          ? "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
          : "새로운 장소에 가지 않아도 괜찮습니다. 익숙한 길을 조금 다른 속도로 걷는 것만으로 오늘의 풍경은 달라질 수 있습니다."}
      </p>
    </article>
  );
}

function TypeScene({ termId }: { termId: string }) {
  if (["lorem-ipsum", "typography"].includes(termId))
    return (
      <div className="cv-type-comparison">
        {[0, 1].map((i) => (
          <div key={i}>
            <span className="cv-comparison-label">
              {termId === "lorem-ipsum"
                ? i === 0
                  ? "임시 문구"
                  : "실제 콘텐츠"
                : i === 0
                  ? "촘촘한 행간"
                  : "여유 있는 행간"}
            </span>
            <ContextFrame brand="틈새" chrome="web">
              <ReadingPage
                lorem={termId === "lorem-ipsum" && i === 0}
                dense={termId === "typography" && i === 0}
              />
            </ContextFrame>
          </div>
        ))}
      </div>
    );
  if (termId === "type-classification")
    return (
      <ContextFrame brand="틈새 에디토리얼 / 서체 검토" chrome="workspace">
        <div className="cv-type-review">
          <header>
            <span className="cv-kicker">TYPE EXPLORATION</span>
            <h5>같은 문장, 다른 문자 형태</h5>
            <p>기사의 제목용 서체를 비교하는 디자인 작업 화면</p>
          </header>
          {[
            {
              label: "Serif",
              name: "Georgia",
              className: "cv-font-serif",
              note: "획 끝에 세리프가 있음",
            },
            {
              label: "Sans serif",
              name: "Arial",
              className: "cv-font-sans",
              note: "획 끝에 세리프가 없음",
            },
            {
              label: "Monospace",
              name: "Courier New",
              className: "cv-font-mono",
              note: "문자마다 같은 폭을 사용",
            },
          ].map((font, i) => (
            <div className="cv-type-row" key={font.label}>
              <div>
                <b>{font.label}</b>
                <small>{font.name}</small>
              </div>
              <div className={font.className}>
                <strong>Slow mornings.</strong>
                <span>Aa Bb Cc · 0123</span>
              </div>
              <span className="cv-font-feature">
                {font.note}
                {i === 0 && <Mark />}
              </span>
            </div>
          ))}
        </div>
      </ContextFrame>
    );
  if (termId === "typeface")
    return (
      <ContextFrame brand="틈새 / 브랜드 가이드" chrome="document">
        <div className="cv-typeface-sheet">
          <span className="cv-kicker">TYPOGRAPHY / OUR TYPEFACE</span>
          <h5>Pretendard</h5>
          <p>틈새의 제목과 본문에 사용하는 서체</p>
          <div className="cv-typeface-glyphs">
            <span>가나다라마바사</span>
            <span>ABCDEFGHIJKLM</span>
            <span>abcdefghijklm</span>
            <span>0123456789 &amp; @</span>
            <Mark />
          </div>
          <div className="cv-typeface-weights">
            <span style={{ fontWeight: 400 }}>
              일상의 작은 틈<small>Regular</small>
            </span>
            <span style={{ fontWeight: 600 }}>
              일상의 작은 틈<small>Semibold</small>
            </span>
            <span style={{ fontWeight: 700 }}>
              일상의 작은 틈<small>Bold</small>
            </span>
          </div>
        </div>
      </ContextFrame>
    );
  return (
    <ContextFrame
      brand={termId === "font" ? "틈새 / 제목 스타일 편집" : "틈새 / 기사 상세"}
      chrome={termId === "font" ? "workspace" : "web"}
    >
      <div className={`cv-type-editor cv-type-${termId}`}>
        <ReadingPage />
        {termId === "font" ? (
          <aside className="cv-type-properties">
            <span className="cv-kicker">TEXT / TITLE</span>
            <h6>글자 스타일</h6>
            <div>
              <span>Font family</span>
              <b>Pretendard</b>
            </div>
            <div>
              <span>Font style</span>
              <b>Bold · 700</b>
            </div>
            <div>
              <span>Size</span>
              <b>28 px</b>
            </div>
            <div>
              <span>Line height</span>
              <b>1.25</b>
            </div>
            <div>
              <span>Letter spacing</span>
              <b>−0.03em</b>
            </div>
            <Mark />
          </aside>
        ) : (
          <aside className="cv-type-levels">
            <div>
              <b>01</b>
              <span>
                제목<small>큰 크기 · 굵게</small>
              </span>
            </div>
            <div>
              <b>02</b>
              <span>
                부제<small>내용의 방향</small>
              </span>
            </div>
            <div>
              <b>03</b>
              <span>
                본문<small>읽기 위한 문장</small>
              </span>
            </div>
            <div>
              <b>04</b>
              <span>
                캡션<small>사진의 보조 설명</small>
              </span>
            </div>
          </aside>
        )}
      </div>
    </ContextFrame>
  );
}

function WireScreen({ listing = false }: { listing?: boolean }) {
  return (
    <div className={`cv-wire-screen${listing ? " cv-wire-listing" : ""}`}>
      <div className="cv-wire-header">
        <strong>모래 책방</strong>
        <span>모임 / 소개</span>
      </div>
      <div className="cv-wire-body">
        <div className="cv-wire-heading">
          <span className="cv-wire-tag">{listing ? "목록 영역" : "상세 제목 영역"}</span>
          <h5>{listing ? "참여할 모임" : "함께 읽는 토요일"}</h5>
        </div>
        {listing ? (
          <>
            <div className="cv-wire-search">
              <Search size={15} />
              모임 검색
            </div>
            <div className="cv-wire-cards">
              {["함께 읽는 토요일", "책과 함께하는 산책"].map((title) => (
                <div key={title}>
                  <div className="cv-wire-image">
                    <span>사진</span>
                  </div>
                  <strong>{title}</strong>
                  <p>일정 · 장소</p>
                  <span className="cv-wire-action">상세 보기</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="cv-wire-image">
              <span>대표 사진 영역</span>
            </div>
            <div className="cv-wire-information">
              <p>일정 · 11월 14일 오후 2시</p>
              <p>장소 · 모래 책방</p>
              <p>참여비 · 20,000원</p>
            </div>
            <div className="cv-wire-action">모임 예약하기</div>
          </>
        )}
      </div>
    </div>
  );
}

function DetailedBooking() {
  return (
    <div className="cv-detailed-booking">
      <div className="cv-shop-header">
        <strong>모래 책방</strong>
        <span>모임 / 소개</span>
      </div>
      <div className="cv-detailed-photo">
        <ContextPhoto asset="forest" alt="모임의 분위기를 전하는 숲 사진" />
        <span className="cv-status-chip">이번 달 모임</span>
      </div>
      <div className="cv-detailed-copy">
        <span className="cv-kicker">BOOK CLUB / 11</span>
        <h5>함께 읽는 토요일</h5>
        <p>같은 책을 읽고 서로 다른 생각을 나눠요. 처음 오시는 분도 편하게 함께할 수 있습니다.</p>
        <dl>
          <div>
            <dt>일정</dt>
            <dd>11월 14일 · 오후 2:00</dd>
          </div>
          <div>
            <dt>장소</dt>
            <dd>모래 책방 · 2층</dd>
          </div>
          <div>
            <dt>참여비</dt>
            <dd>20,000원 / 1명</dd>
          </div>
        </dl>
        <span className="cv-solid-action">
          모임 예약하기 <ArrowRight size={16} />
        </span>
      </div>
    </div>
  );
}

function FidelityScene({ termId }: { termId: string }) {
  const onlyWire = ["low-fidelity-lo-fi", "wireframe"].includes(termId);
  if (onlyWire)
    return (
      <ContextFrame brand="모래 책방 / 구조 검토" chrome="workspace">
        <div className="cv-wire-workspace">
          <div className="cv-workspace-ruler">
            FRAME 01{" "}
            <span>{termId === "wireframe" ? "콘텐츠와 기능의 배치" : "스타일 적용 전"}</span>
          </div>
          <WireScreen listing={termId === "wireframe"} />
        </div>
      </ContextFrame>
    );
  if (termId === "mockup")
    return (
      <ContextFrame brand="모래 책방 / 화면 시안" chrome="web" url="morae.example/club">
        <DetailedBooking />
      </ContextFrame>
    );
  return (
    <div className="cv-fidelity-comparison">
      <div>
        <span className="cv-comparison-label">Lo-fi · 구조와 순서</span>
        <ContextFrame brand="모래 책방" chrome="web">
          <WireScreen />
        </ContextFrame>
      </div>
      <div>
        <span className="cv-comparison-label">Hi-fi · 실제 모습에 가깝게</span>
        <ContextFrame brand="모래 책방" chrome="web">
          <DetailedBooking />
        </ContextFrame>
      </div>
    </div>
  );
}

function ConsistencyScene({ termId }: { termId: string }) {
  if (termId === "unity")
    return (
      <div className="cv-unity-comparison">
        <div>
          <span className="cv-comparison-label">목록 화면</span>
          <ContextFrame brand="틈새" chrome="web">
            <div className="cv-mini-magazine">
              <EditorialHeader />
              <h5 className="cv-section-heading">이번 주 읽을거리</h5>
              <div className="cv-mini-grid">
                <EditorialCard index={0} compact />
                <EditorialCard index={1} compact />
              </div>
            </div>
          </ContextFrame>
        </div>
        <div>
          <span className="cv-comparison-label">상세 화면</span>
          <ContextFrame brand="틈새" chrome="web">
            <div className="cv-mini-magazine">
              <EditorialHeader />
              <ReadingPage />
            </div>
          </ContextFrame>
        </div>
      </div>
    );
  return (
    <div className="cv-consistency-pair">
      {["예약 신청", "대기 신청"].map((label, index) => (
        <div key={label}>
          <span className="cv-comparison-label">{label}</span>
          <ContextFrame brand="모래 책방" chrome="mobile">
            <div className="cv-consistency-app">
              <div className="cv-mobile-pagebar">
                <span>‹</span>
                <strong>{label}</strong>
                <span />
              </div>
              <div className="cv-consistency-body">
                <span className="cv-kicker">BOOK CLUB</span>
                <h5>함께 읽는 토요일</h5>
                <p>{index === 0 ? "참여 정보를 확인해 주세요." : "자리가 나면 안내해 드릴게요."}</p>
                <FauxField label="이름">이서윤</FauxField>
                <FauxField label="이메일">seoyun@example.com</FauxField>
                <div className="cv-consent">
                  <span>
                    <Check size={14} />
                  </span>
                  예약 안내 수신에 동의합니다.
                </div>
                <span className="cv-solid-action">
                  {index === 0 ? "예약 내용 확인" : "대기 신청하기"}
                  <ArrowRight size={16} />
                </span>
                <p className="cv-form-help">
                  {index === 0
                    ? "다음 단계에서 결제 내용을 확인합니다."
                    : "대기 신청에는 결제가 필요하지 않습니다."}
                </p>
              </div>
            </div>
          </ContextFrame>
        </div>
      ))}
    </div>
  );
}

export function VisualScenes({ termId, figure }: { termId: string; figure: LearningFigure }) {
  const scene = scenes[termId];
  if (!scene) return null;
  const renderers: Record<SceneFamily, (props: { termId: string }) => ReactNode> = {
    magazine: MagazineScene,
    focus: FocusScene,
    spacing: SpacingScene,
    decoration: DecorationScene,
    type: TypeScene,
    fidelity: FidelityScene,
    consistency: ConsistencyScene,
  };
  const Scene = renderers[scene.family];
  return (
    <div
      className="cv-scene"
      data-context-term={termId}
      aria-label={`${figure.title}의 실제 맥락 예시`}
      style={{ "--cv-accent": "#335f50" } as CSSProperties}
    >
      <Scene termId={termId} />
      <ContextCallout number={1}>{scene.note}</ContextCallout>
    </div>
  );
}
