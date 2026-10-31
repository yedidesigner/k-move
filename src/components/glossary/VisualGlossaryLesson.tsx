import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import "./visual-glossary-lesson.css";

export type VisualLessonId = "cta" | "hamburger" | "carousel";

export const VISUAL_LESSONS = {
  cta: {
    english: "CTA",
    pronunciation: "씨 티 에이",
    meaning: "CTA",
    definition:
      "사용자에게 다음 행동을 제안하는 요소입니다. 버튼이나 텍스트 링크 등으로 표현할 수 있습니다.",
  },
  hamburger: {
    english: "Hamburger menus",
    pronunciation: "햄버거 메뉴즈",
    meaning: "햄버거 메뉴",
    definition:
      "세 줄 아이콘을 눌러 숨겨진 내비게이션을 여는 패턴입니다. 아이콘은 트리거이고, 펼쳐진 링크 목록이나 패널이 메뉴입니다.",
  },
  carousel: {
    english: "Carousels",
    pronunciation: "캐러셀즈",
    meaning: "캐러셀",
    definition: "한 영역에서 여러 콘텐츠를 순서대로 살펴보는 구성입니다.",
  },
} satisfies Record<
  VisualLessonId,
  { english: string; pronunciation: string; meaning: string; definition: string }
>;

const references: Record<VisualLessonId, { label: string; url: string }[]> = {
  cta: [
    {
      label: "Typeform · 뉴스레터 CTA",
      url: "https://mobbin.com/sites/sections/4ea6adfe-7778-4ee5-8688-c3dc66903056",
    },
  ],
  hamburger: [
    {
      label: "DoorDash Dasher · 탐색 메뉴",
      url: "https://mobbin.com/screens/e990b8c2-093c-4968-b439-9596ae7d2a9a",
    },
  ],
  carousel: [
    {
      label: "Dropbox · 한 장형",
      url: "https://mobbin.com/sites/sections/6a4ca210-145e-4be6-9399-fb9da9204619",
    },
    {
      label: "Jasper · 여러 카드형",
      url: "https://mobbin.com/sites/sections/0665fa3b-9ef0-4117-bc69-c62b412518fa",
    },
    {
      label: "Mistral AI · 중앙 강조형",
      url: "https://mobbin.com/sites/sections/fc0d02b9-2df2-4539-8819-51c2d1e0bf64",
    },
  ],
};

const photoCredits = [
  {
    label: "바다 · Aditya Rajguru",
    url: "https://unsplash.com/photos/rocky-coast-meets-the-blue-ocean-under-a-clear-sky-8n3adyIkyiY",
  },
  {
    label: "숲 · Adrien Olichon",
    url: "https://unsplash.com/photos/the-sun-shines-through-the-tall-trees-in-the-forest-cfAjqji6bLw",
  },
  {
    label: "사막 · Mark Kuiper",
    url: "https://unsplash.com/photos/brown-desert-under-blue-sky-2BMSj-xN008",
  },
] as const;

function LessonSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section className="vux-section" aria-labelledby={headingId}>
      <h3 id={headingId} className="vux-section-title">
        <span aria-hidden="true">{number}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function SampleSignup({
  onClose,
  closeRef,
}: {
  onClose: () => void;
  closeRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const titleId = useId();
  return (
    <section className="vux-signup" aria-labelledby={titleId}>
      <span className="vux-tag">연습용 가입 패널</span>
      <h4 id={titleId}>이메일로 받아보세요.</h4>
      <p>가입 버튼 다음에 나타나는 화면이에요.</p>
      <label className="vux-field">
        이메일 <span>(샘플)</span>
        <input
          readOnly
          tabIndex={-1}
          value="hello@example.com"
          aria-label="샘플 이메일, 입력과 전송은 하지 않습니다"
        />
      </label>
      <button ref={closeRef} type="button" className="vux-primary" onClick={onClose}>
        예시 닫기
      </button>
      <p className="vux-caption">실제 가입이나 정보 저장은 일어나지 않아요.</p>
    </section>
  );
}

function CtaExample() {
  const [open, setOpen] = useState(false);
  const [appearance, setAppearance] = useState<"button" | "link">("button");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) closeRef.current?.focus({ preventScroll: true });
    else if (wasOpen.current) triggerRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);
  return (
    <>
      <LessonSection number="02" title="직접 해보기">
        <p className="vux-instruction">‘무료로 시작하기’를 눌러 샘플 가입 패널을 열어보세요.</p>
        <div
          className="vux-demo vux-cta"
          data-panel-open={open}
          onKeyDown={(event) => {
            if (event.key === "Escape" && open) {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
            }
          }}
        >
          <div className="vux-site-header">
            <strong>FORM.</strong>
            <span>DESIGN NOTES</span>
          </div>
          {open ? (
            <SampleSignup onClose={() => setOpen(false)} closeRef={closeRef} />
          ) : (
            <>
              <img
                className="vux-cta-photo"
                src="/glossary/forest.jpg"
                alt="햇빛이 비치는 숲"
                width="750"
                height="112"
              />
              <div className="vux-invitation">
                <h4>
                  좋은 디자인을
                  <br />
                  매주 만나보세요.
                </h4>
                <p>관찰과 영감을 이메일로 전해드려요.</p>
                <button
                  ref={triggerRef}
                  type="button"
                  className={appearance === "button" ? "vux-primary" : "vux-link-action"}
                  onClick={() => setOpen(true)}
                >
                  무료로 시작하기{" "}
                  {appearance === "link" && <ArrowRight size={17} aria-hidden="true" />}
                </button>
                <p className="vux-caption">무료 디자인 뉴스레터 · 학습용 가상 서비스</p>
              </div>
            </>
          )}
        </div>
      </LessonSection>
      <LessonSection number="03" title="다른 형태">
        <p className="vux-instruction">표현을 바꾸어도 유도하는 행동은 같습니다.</p>
        <div className="vux-layout-options" role="group" aria-label="CTA 표현 방식">
          <button
            type="button"
            aria-pressed={appearance === "button"}
            onClick={() => setAppearance("button")}
          >
            버튼 형태
          </button>
          <button
            type="button"
            aria-pressed={appearance === "link"}
            onClick={() => setAppearance("link")}
          >
            링크 형태
          </button>
        </div>
        <p className="vux-caption">
          위 예시의 CTA 모양이 바뀝니다. 가입 패널을 닫으면 다시 확인할 수 있어요.
        </p>
      </LessonSection>
      <Remember>CTA는 모양이 아니라 역할입니다. 버튼과 링크도 CTA가 될 수 있어요.</Remember>
    </>
  );
}

const studioPages = {
  프로젝트: {
    title: (
      <>
        Less noise.
        <br />
        More nature.
      </>
    ),
    caption: "자연에서 찾는 새로운 관점",
  },
  스튜디오: {
    title: (
      <>
        Small studio.
        <br />
        Open minds.
      </>
    ),
    caption: "여백을 생각하는 디자인 스튜디오",
  },
  문의: {
    title: (
      <>
        Start a<br />
        conversation.
      </>
    ),
    caption: "함께 만들고 싶은 이야기를 나눠요",
  },
};

function HamburgerExample() {
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState<"side" | "full">("side");
  const [page, setPage] = useState<keyof typeof studioPages>("프로젝트");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  function closeMenu() {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }
  return (
    <>
      <LessonSection number="02" title="직접 해보기">
        <p className="vux-instruction">오른쪽 위 메뉴를 열고, 탐색 항목을 선택하거나 닫아보세요.</p>
        <div
          className="vux-demo vux-studio"
          data-menu-open={open}
          onKeyDown={(event) => {
            if (event.key === "Escape" && open) {
              event.preventDefault();
              event.stopPropagation();
              closeMenu();
            }
          }}
        >
          <div className="vux-site-header">
            <strong>STILL STUDIO</strong>
            <button
              ref={triggerRef}
              className="vux-menu-trigger"
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
              {open ? "닫기" : "메뉴"}
            </button>
          </div>
          <div className="vux-studio-stage">
            <img src="/glossary/forest.jpg" alt="키 큰 나무로 가득한 숲" width="750" height="400" />
            <div className="vux-studio-copy" aria-live="polite">
              <h4>{studioPages[page].title}</h4>
              <p>{studioPages[page].caption}</p>
            </div>
            {open && (
              <nav
                id={panelId}
                className={`vux-menu-panel vux-menu-panel--${layout}`}
                aria-label="학습용 스튜디오 메뉴"
              >
                <p className="vux-caption">둘러보기</p>
                {(Object.keys(studioPages) as (keyof typeof studioPages)[]).map((label) => (
                  <button
                    key={label}
                    type="button"
                    aria-current={page === label ? "page" : undefined}
                    onClick={() => {
                      setPage(label);
                      closeMenu();
                    }}
                  >
                    {label}
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                ))}
                <p className="vux-menu-note">
                  STILL STUDIO
                  <br />
                  작은 여백, 새로운 시선.
                </p>
              </nav>
            )}
          </div>
        </div>
        <p className="vux-caption">탐색 항목을 누르면 이 예시 안의 내용만 바뀝니다.</p>
      </LessonSection>
      <LessonSection number="03" title="다른 형태">
        <div className="vux-layout-options" role="group" aria-label="메뉴 펼침 방식">
          <button type="button" aria-pressed={layout === "side"} onClick={() => setLayout("side")}>
            측면 패널
          </button>
          <button type="button" aria-pressed={layout === "full"} onClick={() => setLayout("full")}>
            전체 영역
          </button>
        </div>
        <p className="vux-caption">
          형태를 바꾼 뒤 메뉴를 열어보세요. 같은 탐색 목록이 다른 범위로 펼쳐집니다.
        </p>
      </LessonSection>
      <Remember>세 줄 아이콘은 메뉴를 여는 버튼이고, 펼쳐진 목록이 메뉴입니다.</Remember>
    </>
  );
}

const carouselItems = [
  { title: "바다의 여백", image: "coast", alt: "푸른 바다와 바위 해안" },
  { title: "숲의 리듬", image: "forest", alt: "햇빛이 비치는 키 큰 나무 숲" },
  { title: "모래의 선", image: "desert", alt: "푸른 하늘 아래 주황빛 모래 언덕" },
];
const carouselLayouts = { single: "한 장형", multiple: "여러 카드형", center: "중앙 강조형" };
type CarouselLayout = keyof typeof carouselLayouts;

function CarouselExample() {
  const [index, setIndex] = useState(1);
  const [layout, setLayout] = useState<CarouselLayout>("center");
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const hintId = useId();
  function step(direction: number) {
    setIndex((current) => Math.min(carouselItems.length - 1, Math.max(0, current + direction)));
  }
  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    dragStart.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }
  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    const start = dragStart.current;
    dragStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x,
      dy = event.clientY - start.y;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.3) step(dx < 0 ? 1 : -1);
  }
  return (
    <>
      <LessonSection number="02" title="직접 해보기">
        <p className="vux-instruction">
          화살표로 넘기거나 사진을 좌우로 밀어보세요. 형태를 바꿔도 선택한 콘텐츠는 유지됩니다.
        </p>
        <div
          className="vux-demo vux-editorial"
          role="region"
          aria-roledescription="캐러셀"
          aria-label="학습용 여행 콘텐츠"
        >
          <div className="vux-site-header">
            <strong>WANDER.</strong>
            <span>FIELD NOTES</span>
          </div>
          <div className="vux-editorial-body">
            <h4>장면을 수집하다</h4>
            <div className="vux-layout-options" role="group" aria-label="캐러셀 레이아웃">
              {(Object.entries(carouselLayouts) as [CarouselLayout, string][]).map(
                ([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={layout === value}
                    onClick={() => setLayout(value)}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
            <div
              className={`vux-viewport vux-viewport--${layout}`}
              tabIndex={0}
              role="group"
              aria-label="사진 영역"
              aria-describedby={hintId}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                  event.preventDefault();
                  event.stopPropagation();
                  step(event.key === "ArrowLeft" ? -1 : 1);
                }
              }}
              onPointerDown={startDrag}
              onPointerUp={finishDrag}
              onPointerCancel={() => {
                dragStart.current = null;
              }}
            >
              <div className="vux-rail" style={{ "--selected": index } as CSSProperties}>
                {carouselItems.map((item, itemIndex) => (
                  <article
                    className={`vux-slide${index === itemIndex ? " vux-slide--selected" : ""}`}
                    key={item.image}
                    aria-roledescription="슬라이드"
                    aria-label={`${itemIndex + 1} / 3, ${item.title}`}
                    aria-hidden={layout === "single" && index !== itemIndex}
                  >
                    <img
                      src={`/glossary/${item.image}.jpg`}
                      alt={item.alt}
                      width="750"
                      height="420"
                      draggable={false}
                    />
                    <div className="vux-slide-caption">
                      <span>0{itemIndex + 1} / FIELD NOTE</span>
                      <h5>{item.title}</h5>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="vux-carousel-controls">
              <button
                type="button"
                aria-label="이전 콘텐츠"
                disabled={index === 0}
                onClick={() => step(-1)}
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <p role="status" aria-live="polite" aria-atomic="true">
                <span aria-hidden="true">0{index + 1} / 03</span>
                <span className="vux-sr-only">
                  3개 중 {index + 1}번째, {carouselItems[index]?.title}
                </span>
              </p>
              <button
                type="button"
                aria-label="다음 콘텐츠"
                disabled={index === 2}
                onClick={() => step(1)}
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
            <p className="vux-caption" id={hintId}>
              같은 콘텐츠 · 같은 순서 · 자동 재생 없음
              <br />
              <span>사진 영역에서는 키보드 ← →로도 이동할 수 있어요.</span>
            </p>
          </div>
        </div>
      </LessonSection>
      <LessonSection number="03" title="다른 형태">
        <div className="vux-variation-grid">
          {(Object.entries(carouselLayouts) as [CarouselLayout, string][]).map(([value, label]) => (
            <button
              className="vux-layout-preview"
              type="button"
              key={value}
              aria-pressed={layout === value}
              onClick={() => setLayout(value)}
            >
              <span className={`vux-mini vux-mini--${value}`} aria-hidden="true">
                {[0, 1, 2].map((n) => (
                  <span key={n} />
                ))}
              </span>
              <strong>{label}</strong>
            </button>
          ))}
        </div>
        <p className="vux-caption">형태를 선택하면 위의 실제 예시에 적용됩니다.</p>
      </LessonSection>
      <Remember>
        화살표·점 표시·자동 재생·무한 반복은 선택 사항입니다. 이 예시에서는 화살표와 현재 위치
        표시를 사용했어요.
      </Remember>
    </>
  );
}

function Remember({ children }: { children: ReactNode }) {
  return (
    <aside className="vux-remember">
      <h3>기억할 점</h3>
      <p>{children}</p>
    </aside>
  );
}

export function VisualGlossaryLesson({
  lessonId,
  stage = "all",
  hideHeader = false,
}: {
  lessonId: VisualLessonId;
  stage?: "all" | "structure" | "example";
  hideHeader?: boolean;
}) {
  const lesson = VISUAL_LESSONS[lessonId];
  return (
    <article className="vux-lesson" key={lessonId} data-lesson-stage={stage}>
      {!hideHeader && (
        <header className="vux-term-header">
          <p>VISUAL GLOSSARY</p>
          <h2 lang="en">{lesson.english}</h2>
          <div>
            [{lesson.pronunciation}] / {lesson.meaning}
          </div>
        </header>
      )}
      {stage !== "example" && (
        <LessonSection number="01" title="핵심 구조">
          <img
            className="vux-concept"
            src={`/glossary/${lessonId}-structure.svg`}
            alt={
              lessonId === "cta"
                ? "안내 문장 아래 무료로 시작하기 버튼을 배치한 행동 유도 요소 도식"
                : lessonId === "hamburger"
                  ? "세 줄 메뉴 버튼과 이를 누르면 나타나는 탐색 목록 도식"
                  : "공유된 영역 안에 순서가 있는 콘텐츠가 놓이고 두 번째 콘텐츠가 선택된 캐러셀 도식"
            }
            width="800"
            height="260"
          />
          {!hideHeader && <p className="vux-definition">{lesson.definition}</p>}
        </LessonSection>
      )}
      {stage !== "structure" &&
        (lessonId === "cta" ? (
          <CtaExample />
        ) : lessonId === "hamburger" ? (
          <HamburgerExample />
        ) : (
          <CarouselExample />
        ))}
      {stage !== "structure" && (
        <details className="vux-references">
          <summary>참고 사례와 이미지 출처</summary>
          <p>
            실제 서비스의 화면 구조를 참고해 만든 학습용 예시입니다. 원본 서비스의 동작이나 권장
            사용법을 그대로 재현한 것은 아닙니다.
          </p>
          <ul>
            {references[lessonId].map((ref) => (
              <li key={ref.url}>
                <a href={ref.url} target="_blank" rel="noopener noreferrer">
                  {ref.label}
                  <ArrowUpRight size={13} aria-hidden="true" />
                  <span className="vux-sr-only"> (새 탭)</span>
                </a>
              </li>
            ))}
          </ul>
          <p>
            사진: Unsplash —{" "}
            <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer">
              라이선스<span className="vux-sr-only"> (새 탭)</span>
            </a>
          </p>
          <ul>
            {(lessonId === "carousel" ? photoCredits : [photoCredits[1]]).map((photo) => (
              <li key={photo.url}>
                <a href={photo.url} target="_blank" rel="noopener noreferrer">
                  {photo.label}
                  <ArrowUpRight size={13} aria-hidden="true" />
                  <span className="vux-sr-only"> (새 탭)</span>
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}
