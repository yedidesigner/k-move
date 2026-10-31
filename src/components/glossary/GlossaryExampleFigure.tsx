import { useId } from "react";
import { Search, Download, Trash2, Menu, X, Volume2, ZoomIn, CircleDot } from "lucide-react";
import type { LearningFigure } from "@/data/learning/types";
import { VisualConceptDiagram } from "./GlossaryPracticeLesson";
import { GlossaryArtifactFigure } from "./GlossaryArtifactFigure";
import { GlossaryPrincipleFigure } from "./GlossaryPrincipleFigure";
import { GLOSSARY } from "@/data/glossary";
import { ContextualExample, hasContextualExample } from "./contextual/ContextualExample";
import "./glossary-learning.css";

type FigureItem = LearningFigure["items"][number];
type FigureProps = { figure: LearningFigure; termId?: string | undefined };

function ItemCopy({ item, heading = false }: { item: FigureItem; heading?: boolean }) {
  return (
    <>
      <strong className={heading ? "gl-item-heading" : "gl-item-label"}>{item.label}</strong>
      <p>{item.text}</p>
      {item.detail && <small>{item.detail}</small>}
    </>
  );
}

function BrowserBar({ name = "K-MOVE STUDIO" }: { name?: string }) {
  return (
    <div className="gl-browser-bar" aria-hidden="true">
      <span className="gl-window-dots">
        <i />
        <i />
        <i />
      </span>
      <span>{name}</span>
      <span>↗</span>
    </div>
  );
}

function MiniScreen({ figure, termId }: FigureProps) {
  const isZ = termId === "z-shape-layout";
  const isLayered = termId === "tiered-layer-cake-layout";
  const isMobileApp = termId === "dedicated-mobile-app";
  const brand = /모래/.test(figure.title)
    ? "모래 책방"
    : /도토리/.test(figure.title)
      ? "도토리"
      : /틈새/.test(figure.title)
        ? "틈새."
        : "STUDIO.";
  return (
    <div
      className={`gl-screen gl-screen-${isZ ? "z" : isLayered ? "layered" : "standard"}${isMobileApp ? " gl-native-app" : ""}`}
    >
      {isMobileApp ? (
        <div className="gl-app-device-edge" aria-hidden="true">
          <span />
        </div>
      ) : (
        <BrowserBar />
      )}
      <div className="gl-screen-heading">
        <span>{isMobileApp ? "하루산책" : brand}</span>
        {isMobileApp ? (
          <Menu size={20} aria-hidden="true" />
        ) : (
          <span className="gl-screen-nav" aria-hidden="true">
            ABOUT / JOURNAL
          </span>
        )}
      </div>
      {isMobileApp && (
        <div className="gl-app-bottom-nav" aria-hidden="true">
          <span>오늘</span>
          <span>내 기록</span>
          <span>설정</span>
        </div>
      )}
      <div className="gl-screen-content">
        {isZ && (
          <svg
            className="gl-z-path"
            viewBox="0 0 400 260"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M40 45H360L40 215H360" />
          </svg>
        )}
        {figure.items.map((item, index) => (
          <div
            className={`gl-screen-block gl-screen-block-${index}`}
            key={`${item.label}-${index}`}
          >
            {isZ && <span className="gl-screen-order">{index + 1}</span>}
            <strong className="gl-item-heading">{item.label}</strong>
            <p
              className={
                /행동|기록 추가|누르기/.test(item.label)
                  ? "gl-ui-action"
                  : /검색/.test(item.label)
                    ? "gl-ui-search"
                    : /필터/.test(item.label)
                      ? "gl-ui-filter"
                      : /상태/.test(item.label)
                        ? "gl-ui-status"
                        : ""
              }
            >
              {/검색/.test(item.label) && <Search size={16} aria-hidden="true" />}
              {item.text}
            </p>
            {item.detail && <small>{item.detail}</small>}
            {isLayered && (
              <div className="gl-text-lines" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            )}
          </div>
        ))}
      </div>
      {isZ && (
        <p className="gl-inline-note">
          Z형 시선 이동의 예시입니다. 모든 화면에서 같은 시선 이동이 나타나는 것은 아닙니다.
        </p>
      )}
    </div>
  );
}

function ComparisonFigure({ figure, termId }: FigureProps) {
  if (termId === "high-fidelity-hi-fi")
    return (
      <div className="gl-comparison-fidelity">
        <VisualConceptDiagram preset="fidelity" />
        <div className="gl-evidence-grid">
          {figure.items.map((item, index) => (
            <div key={`${item.label}-${index}`}>
              <ItemCopy item={item} />
            </div>
          ))}
        </div>
      </div>
    );
  const isPlatform = termId === "platform";
  const isFold = termId === "above-the-fold";
  const isMap = termId === "graceful-degradation-top-down-designing";
  const isForm = termId === "common-region";
  const isState =
    termId === "edge-case" ||
    termId === "consistency" ||
    termId === "deceptive-patterns" ||
    termId === "mental-models";
  const screenComparison = isPlatform || isFold || isMap || isForm || isState;
  return (
    <div className={screenComparison ? "gl-comparison-grid" : "gl-evidence-grid"}>
      {figure.items.map((item, index) => (
        <div
          className={`gl-comparison-panel ${screenComparison ? "gl-comparison-screen" : "gl-evidence-sheet"}`}
          key={`${item.label}-${index}`}
        >
          <strong className="gl-comparison-label">{item.label}</strong>
          {screenComparison ? (
            <div
              className={`gl-comparison-display ${isPlatform && index === 1 ? "gl-phone-display" : ""} ${isFold ? "gl-fold-display" : ""}`}
            >
              <BrowserBar name={isPlatform ? item.label : "화면 예시"} />
              {isMap && index === 0 && (
                <svg
                  className="gl-map-example"
                  viewBox="0 0 260 120"
                  role="img"
                  aria-label="교육용 가상 지도와 장소 표식"
                >
                  <rect width={260} height={120} fill="#e9efea" />
                  <path
                    d="M0 35h260M65 0v120m100-120v120M0 94h260"
                    stroke="#fff"
                    strokeWidth={12}
                  />
                  <path d="M131 63c-24-32 24-32 0 0Z" fill="#315f46" />
                  <circle cx={131} cy={43} r={4} fill="#fff" />
                </svg>
              )}
              {isFold ? (
                <div className={`gl-fold-viewport gl-fold-viewport-${index}`}>
                  <div className="gl-fold-header">모래 책방</div>
                  <div className="gl-fold-hero">
                    이번 달<br />
                    함께 읽는 책
                  </div>
                  <span className="gl-static-action">모임 신청</span>
                </div>
              ) : (
                <div className={`gl-comparison-content ${isForm ? "gl-form-region" : ""}`}>
                  {isState && (
                    <span className="gl-state-marker" aria-hidden="true">
                      {termId === "mental-models" ? <Trash2 size={24} aria-hidden="true" /> : "•"}
                    </span>
                  )}
                  <p>{item.text}</p>
                  {isForm && (
                    <div className="gl-form-field-lines" aria-hidden="true">
                      <i />
                      <i />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <blockquote
              className={termId === "lorem-ipsum" ? "gl-typeset-quote" : "gl-evidence-quote"}
            >
              {item.text}
            </blockquote>
          )}
          {isFold && <p className="gl-comparison-summary">{item.text}</p>}
          {item.detail && <small>{item.detail}</small>}
        </div>
      ))}
    </div>
  );
}

function FlowFigure({ figure, termId }: FigureProps) {
  if (termId === "interaction-designers")
    return (
      <div className="gl-branch-flow">
        <div className="gl-branch-stem">
          {figure.items.slice(0, 2).map((item, index) => (
            <div key={`${item.label}-${index}`}>
              <div className="gl-flow-node">
                <ItemCopy item={item} />
              </div>
              <span className="gl-flow-arrow" aria-hidden="true">
                ↓
              </span>
            </div>
          ))}
        </div>
        <div className="gl-branch-options">
          {figure.items.slice(2).map((item, index) => (
            <div key={`${item.label}-${index}`}>
              <span className="gl-branch-condition">
                {index === 0 ? "조건 충족" : "조건 미충족 → 수정"}
              </span>
              <div className="gl-flow-node">
                <ItemCopy item={item} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  return (
    <ol className="gl-flow" aria-label="단계와 연결 관계">
      {figure.items.map((item, index) => (
        <li key={`${item.label}-${index}`}>
          <span
            className={`gl-flow-node ${index === 0 || index === figure.items.length - 1 ? "gl-flow-terminal" : ""}`}
          >
            <ItemCopy item={item} />
          </span>
          {index < figure.items.length - 1 && (
            <span className="gl-flow-arrow" aria-hidden="true">
              ↓
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

function SitemapFigure({ figure }: FigureProps) {
  return (
    <div className="gl-sitemap">
      <div className="gl-sitemap-root">
        <span aria-hidden="true">⌂</span>
        {figure.title}
      </div>
      <ul>
        {figure.items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            <strong>{item.label}</strong>
            <p>{item.text}</p>
            {item.detail && <small>{item.detail}</small>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StoryScene({ text, index }: { text: string; index: number }) {
  const travel = /버스|기차|통학|퇴근|출근|이동/.test(text);
  const food = /음식|식사|배달|도시락/.test(text);
  const arrival = /책방에 도착|모임 참여/.test(text);
  const conversation = /사람들과|대화를 나눈|설명해 달라|이유 확인|후속 확인/.test(text);
  return (
    <svg
      viewBox="0 0 240 160"
      className="gl-story-scene"
      role="img"
      aria-label={
        travel
          ? "이동 중 기기를 확인하는 사람"
          : food
            ? "식사와 관련된 상황에서 기기를 사용하는 사람"
            : arrival
              ? "책방 입구에 도착한 사람"
              : conversation
                ? "경험을 함께 이야기하는 두 사람"
                : "상황 속에서 화면을 확인하는 사람"
      }
    >
      <rect x={10} y={10} width={220} height={140} fill="#fff" stroke="#c9d1cb" />
      {travel && (
        <>
          <rect x={24} y={23} width={192} height={59} fill="#e8ede9" stroke="#a9b6ad" />
          <path d="M120 23v59M24 58h192" stroke="#a9b6ad" />
          <path d="M31 58 57 38 86 58m44 0 32-26 32 26" fill="none" stroke="#bfcbc3" />
        </>
      )}
      {!travel && (
        <>
          <path d="M25 112h190" stroke="#a9b6ad" />
          <rect x={153} y={29} width={48} height={47} fill="#edf2ee" stroke="#b2beb6" />
        </>
      )}
      {arrival && (
        <>
          <rect x={153} y={29} width={48} height={103} fill="#f1f4eb" stroke="#8d9f83" />
          <path d="m153 29 33 10v93h-33Z" fill="#e0e8d8" stroke="#8d9f83" />
          <circle cx={179} cy={84} r={2} fill="#71866a" />
        </>
      )}
      <circle
        cx={77 + (index % 2) * 12}
        cy={73}
        r={16}
        fill="#dce5de"
        stroke="#566b5d"
        strokeWidth={2}
      />
      <path
        d={`M${55 + (index % 2) * 12} 133v-29q22-22 44 0v29`}
        fill="#c8d6cc"
        stroke="#566b5d"
        strokeWidth={2}
      />
      {!arrival && !conversation && (
        <>
          <path
            d={`M${94 + (index % 2) * 12} 105 123 96`}
            fill="none"
            stroke="#566b5d"
            strokeWidth={7}
            strokeLinecap="round"
          />
          <rect
            x={120}
            y={72}
            width={25}
            height={39}
            rx={3}
            fill="#fff"
            stroke="#566b5d"
            strokeWidth={2}
          />
          <path d="M126 81h13m-13 7h13m-13 7h8" stroke="#7f9385" />
        </>
      )}
      {conversation && (
        <>
          <circle cx={176} cy={73} r={16} fill="#e3eadb" stroke="#566b5d" strokeWidth={2} />
          <path d="M154 133v-29q22-22 44 0v29" fill="#cbd9c0" stroke="#566b5d" strokeWidth={2} />
          <path d="M96 24h61v25h-14l-9 9v-9H96Z" fill="#fff" stroke="#79906d" />
          <path d="M107 34h38m-38 7h26" stroke="#79906d" strokeWidth={2} />
        </>
      )}
      {food && (
        <>
          <ellipse cx={180} cy={119} rx={28} ry={9} fill="#fff" stroke="#718577" />
          <path d="M164 113q16-23 32 0" fill="#dce5de" stroke="#718577" />
        </>
      )}
    </svg>
  );
}

function GestureScene({ index }: { index: number }) {
  return (
    <svg
      className="gl-story-scene"
      viewBox="0 0 240 160"
      role="img"
      aria-label={
        index === 0
          ? "화면에 짧게 접촉하는 탭"
          : index === 1
            ? "한 접점을 옆으로 이동하는 스와이프"
            : "두 접점을 벌리는 핀치 확대"
      }
    >
      <rect
        x={66}
        y={8}
        width={108}
        height={144}
        rx={10}
        fill="#fff"
        stroke="#738a77"
        strokeWidth={2}
      />
      <rect x={75} y={25} width={90} height={108} fill="#e7eee4" />
      <path d="m75 112 29-42 25 28 20-18 16 32" fill="#b9cdb5" />
      {index === 0 ? (
        <>
          <circle cx={120} cy={86} r={21} fill="none" stroke="#7f9d7c" strokeDasharray="3 4" />
          <circle cx={120} cy={86} r={10} fill="#2d6c5d" />
          <path d="m122 96 17 29" stroke="#2d6c5d" strokeWidth={8} strokeLinecap="round" />
        </>
      ) : index === 1 ? (
        <>
          <circle cx={87} cy={86} r={10} fill="#2d6c5d" />
          <path d="M104 86h61m-10-9 10 9-10 9" fill="none" stroke="#2d6c5d" strokeWidth={3} />
          <path d="m87 98 17 29" stroke="#2d6c5d" strokeWidth={8} strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={104} cy={94} r={9} fill="#2d6c5d" />
          <circle cx={137} cy={62} r={9} fill="#2d6c5d" />
          <path
            d="m97 103-20 20m0-12v12h12m55-69 20-20m-12 0h12v12"
            fill="none"
            stroke="#2d6c5d"
            strokeWidth={3}
          />
        </>
      )}
    </svg>
  );
}

function PaperScene({ index, presentation = false }: { index: number; presentation?: boolean }) {
  return (
    <svg
      className="gl-story-scene"
      viewBox="0 0 240 160"
      role="img"
      aria-label={
        presentation
          ? "내용을 단계별로 설명하는 발표 슬라이드"
          : "진행자가 바꾸어 보여 주는 종이 화면"
      }
    >
      <rect x={35} y={17} width={174} height={125} fill="#dfe9da" />
      <rect x={28} y={11} width={174} height={125} fill="#fff" stroke="#90a68d" strokeWidth={2} />
      <text x={43} y={38} fill="#466c45" fontSize={13} fontWeight={600}>
        {presentation ? `SLIDE 0${index + 1}` : `화면 0${index + 1}`}
      </text>
      <path d="M43 53h135M43 65h88" stroke="#b3c4ad" strokeWidth={5} />
      {index === 2 && !presentation ? (
        <>
          <circle cx={112} cy={100} r={20} fill="#ebf2e5" stroke="#66875c" />
          <path d="m101 100 8 8 16-18" fill="none" stroke="#4e7445" strokeWidth={3} />
        </>
      ) : (
        <>
          <rect x={43} y={84} width={58} height={34} fill="#e3ecdc" />
          <path d="M116 89h69M116 101h58M116 113h40" stroke="#a8bd9f" strokeWidth={4} />
        </>
      )}
      {presentation ? (
        <>
          <path d="M85 144v13m66-13v13" stroke="#688363" strokeWidth={3} />
        </>
      ) : (
        <path d="m172 118 8 29 6-10 11 1Z" fill="#345e36" stroke="#fff" />
      )}
    </svg>
  );
}

function CloseupScene({ index }: { index: number }) {
  return (
    <svg
      className="gl-story-scene gl-closeup-scene"
      viewBox="0 0 320 230"
      role="img"
      aria-label={
        [
          "모임 목록 화면에서 항목 선택",
          "날짜와 시간을 선택하는 화면",
          "예약 내용과 비용을 확인하는 화면",
          "예약 완료와 다음 안내 화면",
        ][index]
      }
    >
      <rect x={1} y={1} width={318} height={228} fill="#fff" stroke="#9db294" />
      <path d="M1 36h318" stroke="#c4d3bc" />
      <text x={18} y={24} fontSize={13} fontWeight={650} fill="#3d5832">
        모래 책방
      </text>
      <path d="M282 14h18m-18 6h18m-18 6h18" stroke="#66815a" strokeWidth={1.5} />
      {index === 0 ? (
        <>
          <text x={20} y={67} fontSize={17} fontWeight={650} fill="#263d22">
            참여할 모임
          </text>
          <rect x={20} y={83} width={280} height={56} fill="#eef4e7" stroke="#80a170" />
          <rect x={31} y={94} width={34} height={34} fill="#c0d3b2" />
          <path d="M37 103h22m-22 6h22m-22 6h14" stroke="#7d996c" strokeWidth={2} />
          <text x={80} y={106} fontSize={14} fontWeight={600} fill="#2a4423">
            일요일의 책 대화
          </text>
          <text x={80} y={127} fontSize={12} fill="#5c7650">
            자세히 보기 →
          </text>
          <rect x={20} y={152} width={280} height={56} fill="#f7f9f4" stroke="#d0ddc5" />
          <rect x={31} y={163} width={34} height={34} fill="#e1ead8" />
          <text x={80} y={179} fontSize={14} fill="#5a7051">
            다음 책 함께 읽기
          </text>
          <text x={80} y={198} fontSize={12} fill="#75866a">
            모임 일정 확인
          </text>
        </>
      ) : index === 1 ? (
        <>
          <text x={20} y={65} fontSize={17} fontWeight={650} fill="#263d22">
            날짜와 시간 선택
          </text>
          {["월", "화", "수", "목", "금", "토", "일"].map((label, i) => (
            <text
              key={label}
              x={42 + i * 39}
              y={91}
              textAnchor="middle"
              fontSize={11}
              fill="#67805c"
            >
              {label}
            </text>
          ))}
          {Array.from({ length: 14 }, (_, i) => (
            <g key={i}>
              <rect
                x={26 + (i % 7) * 39}
                y={103 + Math.floor(i / 7) * 35}
                width={32}
                height={29}
                rx={2}
                fill={i === 7 ? "#446b33" : "#f3f7ee"}
                stroke={i === 7 ? "#446b33" : "#dae4d0"}
              />
              <text
                x={42 + (i % 7) * 39}
                y={122 + Math.floor(i / 7) * 35}
                textAnchor="middle"
                fontSize={12}
                fill={i === 7 ? "#fff" : "#526b46"}
              >
                {9 + i}
              </text>
            </g>
          ))}
          <rect x={22} y={184} width={116} height={29} fill="#edf4e5" stroke="#7c9c6b" />
          <text x={80} y={204} textAnchor="middle" fontSize={13} fill="#36572a">
            오후 2:00
          </text>
        </>
      ) : index === 2 ? (
        <>
          <text x={20} y={66} fontSize={17} fontWeight={650} fill="#263d22">
            예약 내용 확인
          </text>
          <text x={20} y={98} fontSize={14} fontWeight={600} fill="#3a5730">
            일요일의 책 대화
          </text>
          <path d="M20 113h280" stroke="#d0dfc5" />
          <text x={20} y={137} fontSize={13} fill="#5b7450">
            일정 · 선택한 날짜와 시간
          </text>
          <text x={20} y={162} fontSize={13} fill="#5b7450">
            비용 · 참여 조건 확인
          </text>
          <rect x={20} y={183} width={280} height={31} fill="#446b33" />
          <text x={160} y={204} textAnchor="middle" fontSize={14} fontWeight={600} fill="#fff">
            예약하기
          </text>
        </>
      ) : (
        <>
          <circle cx={160} cy={90} r={28} fill="#e8f1df" stroke="#7e9e69" />
          <path
            d="m146 89 10 11 20-22"
            fill="none"
            stroke="#446b33"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x={160} y={143} textAnchor="middle" fontSize={20} fontWeight={650} fill="#2f4e25">
            예약 완료
          </text>
          <text x={160} y={172} textAnchor="middle" fontSize={13} fill="#5b7450">
            신청한 모임과 일정을 확인하세요.
          </text>
          <path d="M65 190h190" stroke="#d0dfc5" />
          <text x={160} y={211} textAnchor="middle" fontSize={12} fill="#55734a">
            준비물과 방문 안내
          </text>
        </>
      )}
    </svg>
  );
}

function StoryboardFigure({ figure, termId }: FigureProps) {
  return (
    <ol className="gl-storyboard">
      {figure.items.map((item, index) => (
        <li key={`${item.label}-${index}`}>
          <div className="gl-story-number">SCENE {String(index + 1).padStart(2, "0")}</div>
          {termId === "close-up-storyboard" ? (
            <CloseupScene index={index} />
          ) : termId === "gesture" ? (
            <GestureScene index={index} />
          ) : termId === "low-fidelity-prototypes" || termId === "presentation" ? (
            <PaperScene index={index} presentation={termId === "presentation"} />
          ) : (
            <StoryScene text={`${item.label} ${item.text}`} index={index} />
          )}
          <ItemCopy item={item} />
        </li>
      ))}
    </ol>
  );
}

function ChartFigure({ figure }: FigureProps) {
  const values = figure.items.flatMap((item) =>
    typeof item.value === "number" && Number.isFinite(item.value) ? [item.value] : [],
  );
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(0, ...values);
  const span = maximum - minimum || 1;
  return (
    <div className="gl-chart">
      {figure.items.map((item, index) => (
        <div className="gl-chart-row" key={`${item.label}-${index}`}>
          <div className="gl-chart-label">
            <strong>{item.label}</strong>
            {typeof item.value === "number" && Number.isFinite(item.value) && (
              <span>{item.value}</span>
            )}
          </div>
          {typeof item.value === "number" && Number.isFinite(item.value) ? (
            <div className="gl-chart-track">
              <span
                className="gl-chart-zero"
                style={{ left: `${(-minimum / span) * 100}%` }}
                aria-hidden="true"
              />
              <div
                className="gl-chart-bar"
                style={{
                  width: `${(Math.abs(item.value) / span) * 100}%`,
                  marginLeft: `${((Math.min(0, item.value) - minimum) / span) * 100}%`,
                }}
              />
            </div>
          ) : (
            <div className="gl-chart-no-value">수치가 제시되지 않은 항목</div>
          )}
          <p>{item.text}</p>
          {item.detail && <small>{item.detail}</small>}
        </div>
      ))}
    </div>
  );
}

function fontClass(label: string) {
  if (/sans|산세리프|고딕/i.test(label)) return "gl-font-sans";
  if (/mono|모노|고정폭/i.test(label)) return "gl-font-mono";
  if (/serif|세리프|명조/i.test(label)) return "gl-font-serif";
  return "gl-font-sans";
}

function TypographyFigure({ figure }: FigureProps) {
  return (
    <div className="gl-type-specimen">
      {figure.items.map((item, index) => (
        <div key={`${item.label}-${index}`}>
          <strong className="gl-specimen-label">{item.label}</strong>
          <p className={`gl-specimen-text ${fontClass(item.label)}`}>{item.text}</p>
          {item.detail && <small>{item.detail}</small>}
        </div>
      ))}
    </div>
  );
}

function PaletteFigure({ figure }: FigureProps) {
  const fallbackColors = ["#202a24", "#537865", "#a5b9ac", "#edf2ee"];
  const swatches = figure.items.map((item, index) => ({
    item,
    color:
      `${item.label} ${item.text} ${item.detail || ""}`.match(
        /#[\da-f]{6}\b|#[\da-f]{3}\b/i,
      )?.[0] ||
      fallbackColors[index % fallbackColors.length] ||
      "#537865",
  }));
  const hasFallback = figure.items.some(
    (item) =>
      !/#[\da-f]{6}\b|#[\da-f]{3}\b/i.test(`${item.label} ${item.text} ${item.detail || ""}`),
  );
  return (
    <div className="gl-palette">
      <div className="gl-swatches">
        {swatches.map(({ item, color }, index) => (
          <div key={`${item.label}-${index}`}>
            <div className="gl-swatch" style={{ backgroundColor: color }} />
            <code>{color.toUpperCase()}</code>
            <ItemCopy item={item} />
          </div>
        ))}
      </div>
      {hasFallback && (
        <p className="gl-inline-note">
          색상이 지정되지 않은 항목은 범용 학습용 색으로 표현했습니다.
        </p>
      )}
    </div>
  );
}

function CodeFigure({ figure }: FigureProps) {
  return (
    <div className="gl-code-workspace">
      <BrowserBar name="CODE EXAMPLE" />
      {figure.items.map((item, index) => (
        <div className="gl-code-file" key={`${item.label}-${index}`}>
          <strong>{item.label}</strong>
          <pre>
            <code>{item.text}</code>
          </pre>
          {item.detail && <p>{item.detail}</p>}
        </div>
      ))}
    </div>
  );
}

function AnatomyFigure({ figure, termId }: FigureProps) {
  if (termId === "iconography" || termId === "assistive-technology") {
    const icons =
      termId === "iconography" ? [Search, Download, Trash2] : [Volume2, CircleDot, ZoomIn];
    return (
      <div className="gl-icon-gallery">
        {figure.items.map((item, index) => {
          const Icon = icons[index % icons.length] || Search;
          return (
            <div key={`${item.label}-${index}`}>
              <div className="gl-icon-specimen">
                <Icon size={48} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <ItemCopy item={item} />
            </div>
          );
        })}
      </div>
    );
  }
  if (termId === "landmarks")
    return (
      <div className="gl-landmark-map">
        <BrowserBar name="SEMANTIC PAGE" />
        {figure.items.map((item, index) => (
          <div className={`gl-landmark-region gl-landmark-${index}`} key={`${item.label}-${index}`}>
            <span className="gl-landmark-tag">{["nav", "main", "aside"][index] || "section"}</span>
            <ItemCopy item={item} />
          </div>
        ))}
      </div>
    );
  if (termId === "hamburger-menus")
    return (
      <div className="gl-menu-anatomy">
        <div className="gl-menu-header">
          <strong>STUDIO.</strong>
          <span>
            <Menu size={22} aria-hidden="true" />
            메뉴
          </span>
        </div>
        <div className="gl-menu-open">
          <div className="gl-menu-open-label">
            <span>탐색 메뉴</span>
            <X size={20} aria-hidden="true" />
          </div>
          <p>프로젝트</p>
          <p>스튜디오</p>
          <p>문의</p>
        </div>
        <dl>
          {figure.items.map((item, index) => (
            <div key={`${item.label}-${index}`}>
              <dt>{item.label}</dt>
              <dd>
                {item.text}
                {item.detail && <small>{item.detail}</small>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  return (
    <div className={`gl-anatomy ${termId === "domain" ? "gl-anatomy-url" : ""}`}>
      {termId === "domain" && (
        <code className="gl-url-sample">
          <span>https://</span>
          <strong>learn.example.com</strong>
          <span>/courses</span>
        </code>
      )}
      <div className="gl-anatomy-artifact" aria-hidden="true">
        <div className="gl-anatomy-toolbar">
          <i />
          <i />
          <i />
        </div>
        {figure.items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className={`gl-anatomy-part gl-anatomy-part-${index}`}
          >
            <span>{index + 1}</span>
            <div className="gl-text-lines">
              <i />
              <i />
            </div>
          </div>
        ))}
      </div>
      <ol className="gl-anatomy-notes">
        {figure.items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            <span>{index + 1}</span>
            <div>
              <ItemCopy item={item} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function RoleFigure({ figure, termId }: FigureProps) {
  if (termId === "t-shaped-designer")
    return (
      <div className="gl-t-shaped">
        <svg
          viewBox="0 0 400 240"
          role="img"
          aria-label="가로축의 넓은 이해와 세로축의 깊은 전문성이 만나는 T자형 역량"
        >
          <path
            d="M25 25h350v57H230v140h-60V82H25Z"
            fill="#e1ecda"
            stroke="#6a8b5a"
            strokeWidth={2}
          />
          <path
            d="M40 53h320m-10-6 10 6-10 6M200 95v110m-6-10 6 10 6-10"
            fill="none"
            stroke="#426936"
            strokeWidth={2}
          />
          <text x={200} y={17} textAnchor="middle" fontSize={15} fill="#344e2d">
            관련 분야의 폭넓은 이해
          </text>
          <text x={245} y={150} fontSize={15} fill="#344e2d">
            특정 분야의
          </text>
          <text x={245} y={174} fontSize={15} fill="#344e2d">
            깊은 전문성
          </text>
        </svg>
        <div className="gl-t-shaped-notes">
          {figure.items.map((item, index) => (
            <div key={`${item.label}-${index}`}>
              <ItemCopy item={item} />
            </div>
          ))}
        </div>
      </div>
    );
  return (
    <div className="gl-role-workspace">
      <BrowserBar name="PROJECT WORKSPACE" />
      <div className="gl-role-layout">
        <div className="gl-role-sidebar" aria-hidden="true">
          <strong>PROJECT</strong>
          <span>리서치</span>
          <span>설계</span>
          <span>검토</span>
          <span>전달</span>
        </div>
        <div className="gl-role-artifacts">
          {figure.items.map((item, index) => (
            <div className="gl-role-file" key={`${item.label}-${index}`}>
              <span className="gl-file-fold" aria-hidden="true" />
              <span className="gl-file-index">{String(index + 1).padStart(2, "0")}</span>
              <ItemCopy item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConceptFigure({ figure, termId }: FigureProps) {
  return (
    <div className="gl-concept-map">
      <div className="gl-concept-center">{figure.title}</div>
      <div className="gl-concept-branches">
        {figure.items.map((item, index) => (
          <div key={`${item.label}-${index}`}>
            <span className="gl-concept-joint" aria-hidden="true" />
            <ItemCopy item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

function FigureBody({ figure, termId }: FigureProps) {
  if (figure.variant) return <GlossaryPrincipleFigure figure={figure} />;
  switch (figure.kind) {
    case "preset":
      return (
        <div className="gl-preset-figure">
          {figure.preset && <VisualConceptDiagram preset={figure.preset} />}
          <dl>
            {figure.items.map((item, index) => (
              <div key={`${item.label}-${index}`}>
                <dt>{item.label}</dt>
                <dd>
                  {item.text}
                  {item.detail && <small>{item.detail}</small>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "case-study":
    case "portfolio":
    case "persona":
    case "empathy-map":
    case "journey-map":
    case "matrix":
    case "board":
    case "document":
    case "timeline":
      return <GlossaryArtifactFigure figure={figure} />;
    case "screen":
      return <MiniScreen figure={figure} termId={termId} />;
    case "comparison":
      return <ComparisonFigure figure={figure} termId={termId} />;
    case "flow":
      return <FlowFigure figure={figure} termId={termId} />;
    case "sitemap":
      return <SitemapFigure figure={figure} />;
    case "storyboard":
      return <StoryboardFigure figure={figure} termId={termId} />;
    case "chart":
      return <ChartFigure figure={figure} />;
    case "typography":
      return <TypographyFigure figure={figure} />;
    case "palette":
      return <PaletteFigure figure={figure} />;
    case "code":
      return <CodeFigure figure={figure} />;
    case "anatomy":
      return <AnatomyFigure figure={figure} termId={termId} />;
    case "role":
      return <RoleFigure figure={figure} termId={termId} />;
    case "concept":
      return <ConceptFigure figure={figure} termId={termId} />;
  }
}

export function GlossaryExampleFigure({ figure, termId }: FigureProps) {
  const titleId = useId();
  const contextual = Boolean(termId && hasContextualExample(termId));
  const term = contextual ? GLOSSARY.find((entry) => entry.id === termId) : undefined;
  return (
    <figure
      className={`gl-example gl-example-${figure.kind}`}
      aria-labelledby={titleId}
      data-figure-kind={figure.kind}
    >
      <header className="gl-example-header">
        <span className="gl-original-label">K-Move 교육용 재구성</span>
        <h4 id={titleId}>{term ? `${term.korean} 예시` : figure.title}</h4>
        <p>{contextual ? "화면과 실무 자료 속에서 개념을 구분해 보세요." : figure.subtitle}</p>
      </header>
      {contextual && termId ? (
        <>
          <div className="gl-contextual-body">
            <details className="cx-key-structure">
              <summary>핵심 구조 살펴보기</summary>
              <div className="gl-example-body">
                <FigureBody figure={figure} termId={termId} />
                <p className="gl-observation">{figure.focus}</p>
                <p className="cx-source-note">{figure.caption}</p>
              </div>
            </details>
            <ContextualExample termId={termId} figure={figure} />
          </div>
          <figcaption>
            브랜드·프로젝트·내용은 개념을 설명하기 위해 구성한 가상 예시입니다.
          </figcaption>
        </>
      ) : (
        <>
          <div className="gl-example-body">
            <FigureBody figure={figure} termId={termId} />
          </div>
          <figcaption>{figure.caption}</figcaption>
        </>
      )}
    </figure>
  );
}
