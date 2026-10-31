import type { LearningFigure } from "../../data/learning/types";
import "./glossary-artifacts.css";

type FigureItem = LearningFigure["items"][number];

function ItemDetail({ item }: { item: FigureItem }) {
  return (
    <>
      {item.detail && <p className="gaf-detail">{item.detail}</p>}
      {item.value !== undefined && <span className="gaf-value">{item.value}</span>}
    </>
  );
}

/** A deliberately schematic interface: decorative, with no invented study results. */
function InterfaceDrawing({ variant = 0 }: { variant?: number }) {
  return (
    <svg viewBox="0 0 360 220" fill="none" aria-hidden="true" className="gaf-interface-drawing">
      <rect x="1" y="1" width="358" height="218" rx="8" fill="white" stroke="currentColor" />
      <path d="M1 31H359" stroke="currentColor" />
      <circle cx="14" cy="16" r="3" fill="currentColor" />
      <circle cx="25" cy="16" r="3" fill="currentColor" opacity=".3" />
      <circle cx="36" cy="16" r="3" fill="currentColor" opacity=".3" />
      <rect x="276" y="13" width="62" height="5" rx="2.5" fill="currentColor" opacity=".2" />
      {variant % 3 === 0 ? (
        <>
          <rect x="20" y="52" width="58" height="146" rx="3" fill="#edf3f0" />
          {[68, 87, 106, 125].map((y) => (
            <path
              key={y}
              d={`M32 ${y}H63`}
              stroke="currentColor"
              strokeWidth="4"
              opacity={y === 68 ? ".8" : ".2"}
            />
          ))}
          <rect x="98" y="54" width="132" height="10" rx="3" fill="currentColor" />
          <rect x="98" y="78" width="216" height="5" rx="2" fill="currentColor" opacity=".2" />
          {[98, 222].map((x) => (
            <g key={x}>
              <rect x={x} y="102" width="104" height="65" rx="4" fill="#edf3f0" />
              <path
                d={`M${x + 10} 178H${x + 78}M${x + 10} 189H${x + 57}`}
                stroke="currentColor"
                strokeWidth="4"
                opacity=".35"
              />
            </g>
          ))}
        </>
      ) : variant % 3 === 1 ? (
        <>
          <rect x="20" y="51" width="149" height="147" rx="4" fill="#e2ece7" />
          <path d="M20 160L67 105L102 142L133 118L169 158V198H20Z" fill="#23685e" opacity=".25" />
          <circle cx="130" cy="79" r="13" fill="#23685e" opacity=".28" />
          <rect x="191" y="63" width="125" height="12" rx="3" fill="currentColor" />
          <rect x="191" y="85" width="96" height="12" rx="3" fill="currentColor" />
          {[119, 131, 143].map((y) => (
            <path key={y} d={`M191 ${y}H326`} stroke="currentColor" strokeWidth="4" opacity=".2" />
          ))}
          <rect x="191" y="168" width="78" height="23" rx="3" fill="#23685e" />
        </>
      ) : (
        <>
          <rect x="20" y="52" width="152" height="11" rx="3" fill="currentColor" />
          <rect x="20" y="75" width="226" height="5" rx="2" fill="currentColor" opacity=".2" />
          {[20, 130, 240].map((x, i) => (
            <g key={x}>
              <rect
                x={x}
                y="101"
                width="99"
                height="72"
                rx="4"
                fill={i === 1 ? "#dce9e2" : "#f0f2ef"}
              />
              <path
                d={`M${x + 9} 185H${x + 70}M${x + 9} 196H${x + 49}`}
                stroke="currentColor"
                strokeWidth="4"
                opacity=".35"
              />
            </g>
          ))}
        </>
      )}
    </svg>
  );
}

function ProfileDrawing() {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" className="gaf-profile-drawing">
      <circle cx="50" cy="50" r="49" fill="#e3ece7" />
      <path d="M20 88C24 68 34 62 50 62C66 62 76 68 80 88" fill="#23685e" />
      <ellipse cx="50" cy="42" rx="20" ry="23" fill="#fbfaf6" stroke="#263b34" strokeWidth="1.5" />
      <path
        d="M30 41C27 24 38 15 51 17C66 14 76 31 69 43L63 30C49 33 42 29 37 25L30 41Z"
        fill="#263b34"
      />
      <path
        d="M43 44H44M56 44H57M47 54C50 56 53 55 55 53"
        stroke="#263b34"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CaseStudy({ figure }: { figure: LearningFigure }) {
  const isLibrary = figure.title.startsWith("도토리");
  return (
    <article className="gaf-artifact gaf-case-study">
      <header className="gaf-case-cover">
        <div className="gaf-case-intro">
          <span className="gaf-kicker">PROJECT / CASE STUDY</span>
          <strong>{figure.title}</strong>
          <span className="gaf-case-rule" aria-hidden="true" />
          <small>문제에서 검증까지, 설계 과정의 기록</small>
        </div>
        <div className="gaf-case-hero">
          <div className="gaf-case-screen">
            <div className="gaf-case-screen-bar">
              {isLibrary ? "도토리 / 내 자료" : "모래 책방 / 예약 요약"}
            </div>
            <strong>{isLibrary ? "다시 찾는 나의 자료" : "함께 읽는 토요일"}</strong>
            {isLibrary ? (
              <>
                <div className="gaf-case-tags">
                  <span>전체 수업</span>
                  <span>자료 유형 ▾</span>
                </div>
                <div className="gaf-case-row">
                  <span>UX 리서치</span>
                  <b>인터뷰 질문 가이드</b>
                  <small>PDF · 저장한 자료</small>
                </div>
                <div className="gaf-case-row">
                  <span>UI 디자인</span>
                  <b>컴포넌트 설계 노트</b>
                  <small>문서 · 저장한 자료</small>
                </div>
              </>
            ) : (
              <>
                <p>11월 15일 · 14:00 · 1명</p>
                <div className="gaf-case-price">
                  <span>모임 참가비</span>
                  <b>15,000원</b>
                </div>
                <div className="gaf-case-price">
                  <span>재료비</span>
                  <b>5,000원</b>
                </div>
                <div className="gaf-case-price gaf-case-total">
                  <span>전체 금액</span>
                  <b>20,000원</b>
                </div>
                <small>모임 진행과 활동 재료 포함 · 가상 가격</small>
                <small>변경 조건: 시작 24시간 전까지 일정 변경 가능</small>
              </>
            )}
          </div>
          <span className="gaf-image-note">설계 방향을 보여 주는 정적 예시</span>
        </div>
      </header>
      <div className="gaf-case-sections">
        {figure.items.map((item, index) => (
          <section className="gaf-case-section" key={`${index}-${item.label}`}>
            <span className="gaf-index">{String(index + 1).padStart(2, "0")}</span>
            <h4>{item.label}</h4>
            <div>
              <p>{item.text}</p>
              <ItemDetail item={item} />
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

function Portfolio({ figure }: { figure: LearningFigure }) {
  return (
    <div className="gaf-artifact gaf-portfolio">
      <div className="gaf-portfolio-masthead">
        <span>SELECTED WORK</span>
        <span>PORTFOLIO</span>
      </div>
      <div className="gaf-project-grid">
        {figure.items.map((item, index) => (
          <article className="gaf-project" key={`${index}-${item.label}`}>
            <div className={`gaf-project-thumbnail gaf-project-thumbnail-${index % 3}`}>
              <InterfaceDrawing variant={index} />
              <span className="gaf-thumbnail-index">{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className="gaf-project-copy">
              <h4>{item.label}</h4>
              <p>{item.text}</p>
              <ItemDetail item={item} />
            </div>
          </article>
        ))}
      </div>
      <span className="gaf-image-note">썸네일은 프로젝트 내용을 담는 화면 구성 도식입니다.</span>
    </div>
  );
}

function Persona({ figure }: { figure: LearningFigure }) {
  const [profile, ...sections] = figure.items;
  return (
    <article className="gaf-artifact gaf-persona">
      <aside className="gaf-persona-profile">
        <span className="gaf-kicker">PERSONA</span>
        <ProfileDrawing />
        {profile && (
          <>
            <h4>{profile.label}</h4>
            <p>{profile.text}</p>
            <ItemDetail item={profile} />
          </>
        )}
      </aside>
      <div className="gaf-persona-sections">
        {sections.map((item, index) => (
          <section key={`${index}-${item.label}`}>
            <h4>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </h4>
            <p>{item.text}</p>
            <ItemDetail item={item} />
          </section>
        ))}
      </div>
    </article>
  );
}

function EmpathyMap({ figure }: { figure: LearningFigure }) {
  return (
    <div className="gaf-artifact gaf-empathy-map">
      <div className="gaf-empathy-grid">
        {figure.items.map((item, index) => (
          <section
            className={`gaf-empathy-quadrant gaf-empathy-quadrant-${index}`}
            key={`${index}-${item.label}`}
          >
            <h4>
              <span className="gaf-quadrant-mark" aria-hidden="true">
                {["“", "…", "↗", "♡"][index % 4]}
              </span>
              {item.label}
            </h4>
            <p>{item.text}</p>
            <ItemDetail item={item} />
          </section>
        ))}
      </div>
      <div className="gaf-empathy-person" aria-hidden="true">
        <ProfileDrawing />
      </div>
    </div>
  );
}

function JourneyMap({ figure }: { figure: LearningFigure }) {
  const hasExperience = figure.items.some((item) => item.detail);
  return (
    <div className="gaf-artifact gaf-journey-map">
      <div className="gaf-map-heading">
        <span>JOURNEY MAP</span>
        <span>접점의 흐름 →</span>
      </div>
      <div
        className="gaf-table-scroll"
        role="region"
        aria-label="여정 단계별 행동과 경험"
        tabIndex={0}
      >
        <table className="gaf-journey-table">
          <thead>
            <tr>
              <th scope="col">단계</th>
              {figure.items.map((item, index) => (
                <th scope="col" key={`${index}-${item.label}`}>
                  <span className="gaf-stage-number">{String(index + 1).padStart(2, "0")}</span>
                  {item.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">행동·접점</th>
              {figure.items.map((item, index) => (
                <td key={`${index}-${item.label}`}>
                  <p>{item.text}</p>
                  {item.value !== undefined && <span className="gaf-value">{item.value}</span>}
                </td>
              ))}
            </tr>
            {hasExperience && (
              <tr className="gaf-experience-row">
                <th scope="row">경험·맥락</th>
                {figure.items.map((item, index) => (
                  <td key={`${index}-${item.label}`}>
                    {item.detail || <span aria-label="기록 없음">—</span>}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Matrix({ figure }: { figure: LearningFigure }) {
  const hasDetail = figure.items.some((item) => item.detail);
  return (
    <div className="gaf-artifact gaf-matrix">
      <div className="gaf-matrix-ruler" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="gaf-table-scroll" role="region" aria-label="항목별 비교표" tabIndex={0}>
        <table className="gaf-matrix-table">
          <thead>
            <tr>
              <th scope="col">항목</th>
              <th scope="col">내용</th>
              {hasDetail && <th scope="col">맥락·근거</th>}
            </tr>
          </thead>
          <tbody>
            {figure.items.map((item, index) => (
              <tr key={`${index}-${item.label}`}>
                <th scope="row">{item.label}</th>
                <td>
                  <p>{item.text}</p>
                  {item.value !== undefined && <span className="gaf-value">{item.value}</span>}
                </td>
                {hasDetail && <td>{item.detail || <span aria-label="기록 없음">—</span>}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Board({ figure }: { figure: LearningFigure }) {
  return (
    <div className="gaf-artifact gaf-board">
      <div className="gaf-board-heading">
        <span>WORKING BOARD</span>
        <span className="gaf-board-pin" aria-hidden="true" />
      </div>
      <div className="gaf-board-groups">
        {figure.items.map((item, index) => (
          <section className="gaf-board-group" key={`${index}-${item.label}`}>
            <h4>{item.label}</h4>
            <div className={`gaf-sticky gaf-sticky-${index % 3}`}>
              <p>{item.text}</p>
              {item.value !== undefined && <span className="gaf-value">{item.value}</span>}
            </div>
            {item.detail && <p className="gaf-board-comment">{item.detail}</p>}
          </section>
        ))}
      </div>
    </div>
  );
}

function Document({ figure }: { figure: LearningFigure }) {
  return (
    <div className="gaf-artifact gaf-document-desk">
      <article className="gaf-document">
        <header className="gaf-document-head">
          <span>WORKING DOCUMENT</span>
          <span className="gaf-paper-mark" aria-hidden="true">
            ↗
          </span>
        </header>
        <h4 className="gaf-document-title">{figure.title}</h4>
        <div className="gaf-document-sections">
          {figure.items.map((item, index) => (
            <section key={`${index}-${item.label}`}>
              <h5>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </h5>
              <p>{item.text}</p>
              <ItemDetail item={item} />
            </section>
          ))}
        </div>
        <footer className="gaf-document-footer">
          <span>내용과 근거를 함께 기록</span>
          <span aria-hidden="true">01</span>
        </footer>
      </article>
    </div>
  );
}

function Timeline({ figure }: { figure: LearningFigure }) {
  return (
    <div className="gaf-artifact gaf-timeline">
      <div className="gaf-timeline-heading">
        <span>PROCESS / TIMELINE</span>
        <span>진행 흐름</span>
      </div>
      <ol className="gaf-timeline-stages">
        {figure.items.map((item, index) => (
          <li key={`${index}-${item.label}`}>
            <span className="gaf-timeline-point" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="gaf-timeline-content">
              <h4>{item.label}</h4>
              <p>{item.text}</p>
              <ItemDetail item={item} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function GlossaryArtifactFigure({ figure }: { figure: LearningFigure }) {
  switch (figure.kind) {
    case "case-study":
      return <CaseStudy figure={figure} />;
    case "portfolio":
      return <Portfolio figure={figure} />;
    case "persona":
      return <Persona figure={figure} />;
    case "empathy-map":
      return <EmpathyMap figure={figure} />;
    case "journey-map":
      return <JourneyMap figure={figure} />;
    case "matrix":
      return <Matrix figure={figure} />;
    case "board":
      return <Board figure={figure} />;
    case "document":
      return <Document figure={figure} />;
    case "timeline":
      return <Timeline figure={figure} />;
    default:
      return null;
  }
}
