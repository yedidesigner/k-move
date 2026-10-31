import type { CSSProperties, ReactNode } from "react";
import pack from "@/data/expansion/visual.json";
import "./visual-examples.css";

function Frame({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <div className="xe-visual-frame">
      <div className="xe-visual-top">
        <span>모래 스튜디오</span>
        <span>교육용 가상 예시</span>
      </div>
      <div className="xe-visual-scene">
        <p className="xe-visual-kicker">{title}</p>
        {children}
      </div>
      {note && <p className="xe-visual-note">{note}</p>}
    </div>
  );
}

function Poster({ kind }: { kind: string }) {
  if (kind === "rhythm" || kind === "repetition")
    return (
      <div className={`xe-visual-series xe-visual-${kind}`}>
        {["01", "02", "03"].map((n, i) => (
          <div className="xe-visual-print" key={n}>
            <small>모래 전시실 / {n}</small>
            <i style={{ borderRadius: i === 1 ? "0" : "50%" }} />
            <strong>
              형태의
              <br />
              기록 {n}
            </strong>
            <span>2027. 03. {10 + i}</span>
          </div>
        ))}
        <p>
          {kind === "rhythm"
            ? "반복되는 전시 단위 사이, 세 번째 장 앞에 더 긴 쉼을 둡니다."
            : "호수·제목·날짜 위치는 반복하고 중심 작품의 형태를 바꿉니다."}
        </p>
      </div>
    );
  return (
    <div className={`xe-visual-poster xe-visual-${kind}`}>
      <div className="xe-visual-poster-shape" />
      <small>모래 스튜디오 기획전</small>
      <strong>
        형태를
        <br />
        읽는 시간
      </strong>
      <p>
        같은 요소, 다른 관계.
        <br />
        여백과 배치를 관찰하는 전시.
      </p>
      <div className="xe-visual-poster-footer">
        <span>
          2027. 03. 10—24
          <br />
          서울 / 모래 전시실
        </span>
        <b>무료 관람</b>
      </div>
      {kind === "alignment" && <span className="xe-visual-axis-label">공통 왼쪽 정렬선</span>}
    </div>
  );
}

function Perception({ kind }: { kind: string }) {
  if (kind === "figure-ground")
    return (
      <div className="xe-visual-ground">
        <div className="xe-visual-ground-pattern" aria-hidden="true" />
        <div className="xe-visual-ticket">
          <small>전경 · 예약 정보</small>
          <strong>전시 관람 예약</strong>
          <p>
            3월 12일 · 오후 2시
            <br />
            성인 1명 / 예약 완료
          </p>
          <span>주변과 구분되는 패널 경계</span>
        </div>
        <span className="xe-visual-ground-caption">배경 · 공간의 맥락</span>
      </div>
    );
  if (kind === "closure")
    return (
      <div className="xe-visual-scanner">
        <div className="xe-visual-scan-target">
          <i />
          <i />
          <i />
          <i />
          <span>
            모서리 네 개가
            <br />
            하나의 영역을 암시합니다.
          </span>
        </div>
        <p>작품을 표시된 영역 안에 맞춰 주세요.</p>
      </div>
    );
  if (kind === "good-continuation")
    return (
      <svg
        className="xe-visual-svg"
        viewBox="0 0 480 240"
        role="img"
        aria-label="교차하는 두 선이 각각 매끄러운 하나의 경로로 이어지는 예시"
      >
        <path d="M30 180 C160 180 280 50 450 50" fill="none" stroke="#172020" strokeWidth="5" />
        <path d="M30 50 C160 50 280 180 450 180" fill="none" stroke="#497d72" strokeWidth="5" />
        <circle cx="240" cy="115" r="20" fill="none" stroke="#999" strokeDasharray="3 4" />
        <text x="28" y="212">
          A에서 B로
        </text>
        <text x="365" y="35">
          B
        </text>
        <text x="28" y="35">
          C에서 D로
        </text>
        <text x="365" y="212">
          D
        </text>
      </svg>
    );
  if (kind === "symmetry")
    return (
      <svg
        className="xe-visual-svg"
        viewBox="0 0 480 240"
        role="img"
        aria-label="중앙 수직축을 기준으로 좌우 도형이 거울처럼 대응하는 대칭 구성"
      >
        <line x1="240" x2="240" y1="25" y2="205" stroke="#497d72" strokeDasharray="5 5" />
        <circle cx="130" cy="90" r="35" fill="#192321" />
        <circle cx="350" cy="90" r="35" fill="#192321" />
        <rect x="95" y="148" width="70" height="30" fill="#abc3ba" />
        <rect x="315" y="148" width="70" height="30" fill="#abc3ba" />
        <text x="240" y="228" textAnchor="middle">
          중심축에서 같은 거리, 대응하는 형태
        </text>
      </svg>
    );
  return (
    <div className="xe-visual-tension-pair">
      <div>
        <small>안정된 배치</small>
        <div className="xe-visual-tension-art">
          <i />
        </div>
      </div>
      <div>
        <small>경계와의 긴장</small>
        <div className="xe-visual-tension-art xe-visual-tension-edge">
          <i />
        </div>
      </div>
    </div>
  );
}

const anatomyTerms = new Set([
  "baseline",
  "x-height",
  "cap-height",
  "ascender",
  "descender",
  "counter",
]);
function Anatomy({ kind }: { kind: string }) {
  const focusY = kind === "cap-height" ? 45 : kind === "x-height" || kind === "ascender" ? 85 : 160;
  const label =
    kind === "baseline"
      ? "베이스라인"
      : kind === "x-height"
        ? "x-height"
        : kind === "cap-height"
          ? "cap height"
          : kind === "ascender"
            ? "어센더"
            : kind === "descender"
              ? "디센더"
              : "카운터";
  return (
    <>
      <svg
        className="xe-visual-svg xe-visual-anatomy"
        viewBox="0 0 480 250"
        role="img"
        aria-label={`${label}를 표시한 직접 그린 라틴 글자 구조도`}
      >
        {[45, 85, 160, 205].map((y) => (
          <line
            key={y}
            x1="25"
            x2="455"
            y1={y}
            y2={y}
            stroke={y === focusY ? "#497d72" : "#d6dedb"}
            strokeWidth={y === focusY ? 2 : 1}
            strokeDasharray={y === focusY ? undefined : "4 4"}
          />
        ))}
        <path
          d="M42 45V160 M100 45V160 M42 99H100 M132 85L178 160 M178 85L132 160 M212 45V160 M212 111Q212 84 238 85Q258 85 258 111V160 M290 85V205 M290 97Q335 65 342 113Q350 162 307 160Q297 160 290 151"
          fill="none"
          stroke="#161c1a"
          strokeWidth="11"
          strokeLinejoin="round"
        />
        <ellipse cx="398" cy="122" rx="30" ry="37" fill="none" stroke="#161c1a" strokeWidth="11" />
        {kind === "ascender" && <path d="M212 45V85" stroke="#497d72" strokeWidth="12" />}
        {kind === "descender" && <path d="M290 160V205" stroke="#497d72" strokeWidth="12" />}
        {kind === "counter" && <ellipse cx="398" cy="122" rx="22" ry="29" fill="#b9d5cb" />}
        {(kind === "x-height" || kind === "cap-height") && (
          <>
            <line x1="19" x2="19" y1={focusY} y2="160" stroke="#497d72" strokeWidth="3" />
            <path d={`M12 ${focusY}H26M12 160H26`} stroke="#497d72" strokeWidth="2" />
          </>
        )}
        <text x="240" y="238" textAnchor="middle">
          {label} · 표시된 선 또는 영역
        </text>
      </svg>
      <p className="xe-visual-subnote">
        개념을 구분하기 위해 직접 그린 글자입니다. 실제 서체의 비례와 오버슈트는 다를 수 있습니다.
      </p>
    </>
  );
}

const paragraph =
  "형태를 관찰하면 정보의 관계가 보입니다. 제목과 본문 사이의 거리, 글자와 글자 사이의 공간을 함께 살펴보세요.";
function TextLayout({ kind }: { kind: string }) {
  if (kind === "typographic-scale")
    return (
      <div className="xe-visual-type-scale">
        <span style={{ fontSize: 40, lineHeight: 1.2 }}>형태의 기록</span>
        <span style={{ fontSize: 28 }}>작은 차이를 읽는 시간</span>
        <span style={{ fontSize: 18 }}>일상 속 사물의 형태와 비례를 관찰합니다.</span>
        <span style={{ fontSize: 14 }}>40 / 28 / 18 / 14px · 이 예시의 크기 단계</span>
      </div>
    );
  if (kind === "baseline-grid")
    return (
      <div className="xe-visual-grid-sheet">
        <small>모래 도록 · 2단 본문</small>
        <svg
          className="xe-visual-svg"
          viewBox="0 0 480 195"
          role="img"
          aria-label="두 단의 글자 베이스라인이 같은 수평선에 맞춰진 예시"
        >
          {[45, 82, 119, 156].map((y, i) => (
            <g key={y}>
              <line x1="15" x2="465" y1={y} y2={y} stroke="#9ab8a8" />
              <text x="25" y={y} style={{ fontSize: 20 }}>
                {["형태를 봅니다.", "같은 기준 위에", "두 단의 글이", "함께 놓입니다."][i]}
              </text>
              <text x="265" y={y} style={{ fontSize: 20 }}>
                {["거리를 봅니다.", "각각의 문장이", "하나의 리듬을", "함께 만듭니다."][i]}
              </text>
            </g>
          ))}
        </svg>
        <p>서로 다른 단의 줄이 같은 수평 기준에 놓입니다.</p>
      </div>
    );
  if (kind === "kerning")
    return (
      <div className="xe-visual-compare">
        <div>
          <small>AV 간격이 넓은 상태</small>
          <p className="xe-visual-kern-word">
            A<span>V</span>EN
          </p>
        </div>
        <div>
          <small>AV 쌍만 조정한 상태</small>
          <p className="xe-visual-kern-word xe-visual-kern-adjusted">
            A<span>V</span>EN
          </p>
        </div>
      </div>
    );
  if (kind === "tracking")
    return (
      <div className="xe-visual-compare">
        <div>
          <small>기본 간격</small>
          <p className="xe-visual-track-word">STUDIO</p>
        </div>
        <div>
          <small>전체 간격 확대</small>
          <p className="xe-visual-track-word xe-visual-track-wide">STUDIO</p>
        </div>
      </div>
    );
  if (kind === "leading")
    return (
      <div className="xe-visual-compare">
        <div>
          <small>조밀한 행간 · 1.3</small>
          <p className="xe-visual-body-copy" style={{ lineHeight: 1.3 }}>
            {paragraph}
          </p>
        </div>
        <div>
          <small>넓힌 행간 · 1.8</small>
          <p className="xe-visual-body-copy" style={{ lineHeight: 1.8 }}>
            {paragraph}
          </p>
        </div>
      </div>
    );
  if (kind === "line-length")
    return (
      <div className="xe-visual-line-example">
        <div>
          <small>넓은 텍스트 영역</small>
          <p>
            {paragraph} {paragraph}
          </p>
        </div>
        <div className="xe-visual-measured">
          <small>읽기 폭을 제한한 영역</small>
          <p>
            {paragraph} {paragraph}
          </p>
        </div>
        <span>실제 읽기 목적과 화면 폭에 맞춰 비교하는 예시입니다.</span>
      </div>
    );
  if (kind === "rag")
    return (
      <div className="xe-visual-compare">
        <div>
          <small>강한 계단형 외곽</small>
          <p className="xe-visual-rag">
            We look at the shape.
            <br />
            We look at the
            <br />
            space and
            <br />
            type.
          </p>
        </div>
        <div>
          <small>완만한 줄 끝의 변화</small>
          <p className="xe-visual-rag">
            We look at the
            <br />
            shape. We look
            <br />
            at space and type.
          </p>
        </div>
        <p className="xe-visual-subnote">
          고정 폭 인쇄 조판의 예시입니다. 웹에서는 여러 화면 폭을 함께 확인합니다.
        </p>
      </div>
    );
  return (
    <div className="xe-visual-orphans">
      <div>
        <small>앞 단</small>
        <p>전시를 기록하는 일은 작품의 이름을 적는 것에서 시작합니다. 우리는 설명과 이미지를</p>
      </div>
      <div>
        <small>다음 단</small>
        <p className="xe-visual-lone-line">함께 읽습니다.</p>
        <p>새로운 문단은 다음 주제를 설명합니다.</p>
      </div>
      <p className="xe-visual-subnote">앞 문단의 마지막 한 줄이 다음 단에 홀로 남았습니다.</p>
    </div>
  );
}

function FontFeatures({ kind }: { kind: string }) {
  if (kind === "ligature")
    return (
      <>
        <div className="xe-visual-ligature">
          <div>
            <small>문자 두 개</small>
            <strong>f + i</strong>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <small>합자 형태</small>
            <svg
              viewBox="0 0 130 120"
              role="img"
              aria-label="f와 i를 하나의 형태로 결합한 합자 개념도"
            >
              <path
                d="M35 105V35Q35 12 62 15Q80 15 86 28M15 51H90M87 51V105M20 105H53M71 105H104"
                fill="none"
                stroke="#15211d"
                strokeWidth="9"
              />
              <circle cx="87" cy="28" r="7" fill="#497d72" />
            </svg>
          </div>
        </div>
        <p className="xe-visual-subnote">
          형태 결합을 설명한 직접 그린 개념도입니다. 실제 합자는 선택한 서체가 제공해야 합니다.
        </p>
      </>
    );
  if (kind === "optical-size")
    return (
      <>
        <div className="xe-visual-optical">
          {[true, false].map((small) => (
            <div key={String(small)}>
              <small>{small ? "작은 크기용 형태" : "큰 크기용 형태"}</small>
              <svg
                viewBox="0 0 160 140"
                role="img"
                aria-label={
                  small
                    ? "작은 크기를 위한 단순하고 선명한 획 개념도"
                    : "큰 크기를 위한 가는 세부 획 개념도"
                }
              >
                <path
                  d={small ? "M40 112L80 25L120 112M55 80H105" : "M40 112L80 25L120 112M54 80H106"}
                  fill="none"
                  stroke="#17231e"
                  strokeWidth={small ? 10 : 4}
                />
              </svg>
            </div>
          ))}
        </div>
        <p className="xe-visual-subnote">
          같은 표시 크기로 차이를 강조한 개념도입니다. 실제 opsz 변화는 서체마다 다르며, 이 도형은
          폰트 축을 실행한 결과가 아닙니다.
        </p>
      </>
    );
  return (
    <div className="xe-visual-font-weights">
      <small>
        {kind === "variable-font"
          ? "한 서체 안의 굵기 인스턴스를 비교하는 예시"
          : "같은 글자, 달라지는 굵기"}
      </small>
      {[400, 550, 700].map((weight) => (
        <div key={weight}>
          <span>{weight}</span>
          <strong style={{ fontWeight: weight }}>형태 Type</strong>
        </div>
      ))}
      <p className="xe-visual-subnote">
        정적 굵기 견본입니다. 가변 폰트의 지원 축과 값 범위는 실제 폰트 파일에서 확인합니다.
      </p>
    </div>
  );
}

function ColorCoordinates({ kind }: { kind: string }) {
  const rows =
    kind === "hue"
      ? [
          [60, 50, 50],
          [180, 50, 50],
          [300, 50, 50],
        ]
      : kind === "saturation"
        ? [
            [170, 0, 45],
            [170, 40, 45],
            [170, 80, 45],
          ]
        : [
            [170, 40, 25],
            [170, 40, 50],
            [170, 40, 75],
          ];
  return (
    <div className="xe-visual-colors">
      <div>
        {rows.map(([h, s, l]) => (
          <figure key={`${h}-${s}-${l}`}>
            <div style={{ backgroundColor: `hsl(${h} ${s}% ${l}%)` }} />
            <figcaption>
              <strong>
                {kind === "hue" ? `H ${h}°` : kind === "saturation" ? `S ${s}%` : `L ${l}%`}
              </strong>
              <code>
                hsl({h} {s}% {l}%)
              </code>
            </figcaption>
          </figure>
        ))}
      </div>
      <p>
        {kind === "hue"
          ? "색상 각도만 바꿨습니다. 같은 L 값이 같은 지각적 밝기를 보장하지는 않습니다."
          : kind === "saturation"
            ? "색상과 명도를 고정하고 채도만 바꿨습니다. 투명도는 모두 100%입니다."
            : "색상과 채도를 고정하고 HSL 명도만 바꿨습니다. 대비율은 별도로 확인해야 합니다."}
      </p>
    </div>
  );
}

export function VisualExamples({ termId }: { termId: string }) {
  const term = pack.terms.find((t) => t.id === termId);
  if (!term) return null;
  let scene: ReactNode;
  if (["alignment", "contrast", "rhythm", "repetition"].includes(termId))
    scene = <Poster kind={termId} />;
  else if (
    ["figure-ground", "closure", "good-continuation", "symmetry", "visual-tension"].includes(termId)
  )
    scene = <Perception kind={termId} />;
  else if (anatomyTerms.has(termId)) scene = <Anatomy kind={termId} />;
  else if (["ligature", "variable-font", "weight-axis", "optical-size"].includes(termId))
    scene = <FontFeatures kind={termId} />;
  else if (["hue", "saturation", "lightness"].includes(termId))
    scene = <ColorCoordinates kind={termId} />;
  else scene = <TextLayout kind={termId} />;
  return (
    <div
      className="xe-visual-root"
      data-expanded-visual={termId}
      style={{ "--xe-visual-accent": "#497d72" } as CSSProperties}
    >
      <Frame title={term.korean} note={term.essential}>
        {scene}
      </Frame>
    </div>
  );
}
