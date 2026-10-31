import { useId, type ReactNode } from "react";
import type { LearningFigure } from "@/data/learning/types";
import "./glossary-principles.css";

const descriptions: Record<NonNullable<LearningFigure["variant"]>, string> = {
  "f-scan":
    "왼쪽에서 오른쪽으로 읽는 글 중심 화면 위에, 긴 가로 탐색과 짧은 가로 탐색, 왼쪽 세로 탐색이 F 형태의 한 예로 표시됩니다.",
  "z-scan":
    "요소가 적은 화면에서 왼쪽 위에서 오른쪽 위, 왼쪽 아래, 오른쪽 아래로 이어지는 Z 형태의 시선 경로 예시입니다.",
  "layer-cake":
    "세 개의 제목 띠와 각 제목 아래 본문이 번갈아 나타납니다. 제목을 중심으로 훑어읽는 경로가 강조됩니다.",
  continuity:
    "두 곡선이 가운데에서 교차합니다. 교차점에서 갑자기 꺾인 조각보다 부드럽게 이어지는 두 선으로 읽힙니다.",
  similarity:
    "같은 간격으로 배치한 원과 삼각형 중 같은 모양의 요소끼리 한 집단처럼 보이는 예시입니다.",
  "curb-cut":
    "높은 보도와 낮은 도로 사이의 경사로를 단면으로 보여 줍니다. 휠체어, 유아차, 이동 가방에 같은 연결이 도움이 될 수 있습니다.",
  complementary:
    "색상환에서 서로 마주 보는 두 위치가 연결됩니다. 아래에는 색상환의 반대편에 놓이는 빨강과 청록 계열의 예시 색이 있습니다.",
  unity:
    "여러 카드의 크기, 제목 정렬, 여백, 선 굵기가 같은 규칙을 공유해 하나의 화면처럼 보입니다.",
  variety:
    "한 화면 안에서 공통 제목 스타일은 유지하면서 이미지의 비율과 카드 크기에 차이를 준 예시입니다.",
  "equality-equity":
    "모두에게 같은 지원을 제공하는 방식과, 접근 장벽에 맞춰 자막·키보드·글자 확대를 제공하는 방식을 나란히 비교합니다.",
};

function CopyLines({
  x,
  y,
  width,
  rows = 3,
}: {
  x: number;
  y: number;
  width: number;
  rows?: number;
}) {
  return (
    <g stroke="#c2c7c4" strokeWidth="4">
      {Array.from({ length: rows }, (_, i) => (
        <path key={i} d={`M${x} ${y + i * 14}h${i === rows - 1 ? width * 0.72 : width}`} />
      ))}
    </g>
  );
}

export function GlossaryPrincipleFigure({ figure }: { figure: LearningFigure }) {
  const id = useId();
  const variant = figure.variant;
  if (!variant) return null;
  let drawing: ReactNode;
  if (variant === "f-scan" || variant === "z-scan" || variant === "layer-cake") {
    drawing = (
      <>
        <rect x="16" y="12" width="328" height="216" fill="white" stroke="#b8bfbb" />
        {variant === "z-scan" ? (
          <>
            <rect x="34" y="31" width="72" height="13" fill="#454b48" />
            <path d="M240 38h77" stroke="#a1aaa5" strokeWidth="7" />
            <rect x="35" y="77" width="132" height="65" fill="#e5eae7" />
            <CopyLines x={190} y={90} width={126} />
            <rect x="248" y="177" width="67" height="24" fill="#454b48" />
            <path d="M39 55H316L39 169H310" className="gpf-path" markerEnd={`url(#${id}-arrow)`} />
          </>
        ) : variant === "f-scan" ? (
          <>
            <CopyLines x={34} y={38} width={280} rows={5} />
            <CopyLines x={34} y={125} width={252} rows={6} />
            <path
              d="M35 42H310M35 87H245M35 42V204"
              className="gpf-path"
              markerEnd={`url(#${id}-arrow)`}
            />
          </>
        ) : (
          <>
            {[35, 100, 165].map((y) => (
              <g key={y}>
                <rect x="29" y={y - 14} width="298" height="25" fill="#e4efeb" />
                <path d={`M39 ${y}h160`} stroke="#35473f" strokeWidth="8" />
                <CopyLines x={39} y={y + 24} width={269} rows={2} />
                <path d={`M216 ${y}h97`} className="gpf-path" markerEnd={`url(#${id}-arrow)`} />
              </g>
            ))}
          </>
        )}
      </>
    );
  } else if (variant === "continuity") {
    drawing = (
      <>
        <path
          d="M30 175C103 175 124 60 181 96S250 155 330 50M30 47C110 47 139 151 181 96S261 47 330 181"
          fill="none"
          stroke="#262c28"
          strokeWidth="5"
        />
        <circle
          cx="181"
          cy="96"
          r="27"
          fill="none"
          stroke="#4a8a77"
          strokeWidth="2"
          strokeDasharray="5 5"
        />
        <text x="180" y="223" textAnchor="middle">
          교차해도 이어지는 흐름
        </text>
      </>
    );
  } else if (variant === "similarity") {
    drawing = (
      <>
        {[0, 1, 2].flatMap((row) =>
          [0, 1, 2, 3, 4, 5].map((col) => {
            const x = 43 + col * 55,
              y = 45 + row * 57;
            return col % 2 === 0 ? (
              <circle key={`${row}-${col}`} cx={x} cy={y} r="14" fill="#303b35" />
            ) : (
              <path key={`${row}-${col}`} d={`M${x} ${y - 16}l17 29h-34Z`} fill="#303b35" />
            );
          }),
        )}
        <text x="180" y="223" textAnchor="middle">
          같은 간격 · 다른 모양
        </text>
      </>
    );
  } else if (variant === "curb-cut") {
    drawing = (
      <>
        <path d="M16 145H130L237 197H344V228H16Z" fill="#e1e7e3" stroke="#889b8f" strokeWidth="2" />
        <path d="M130 145L237 197" stroke="#23685e" strokeWidth="5" />
        <text x="27" y="132">
          보도
        </text>
        <text x="280" y="185">
          도로
        </text>
        <path d="M185 98v46m-6-8 6 8 6-8" fill="none" stroke="#23685e" strokeWidth="2" />
        <text x="185" y="82" textAnchor="middle">
          턱을 연결하는 경사로
        </text>
        <circle cx="63" cy="100" r="18" fill="none" stroke="#303b35" strokeWidth="4" />
        <circle cx="66" cy="61" r="8" fill="#303b35" />
        <path
          d="M64 76v22h29l11 26M63 87h20M62 77h21"
          fill="none"
          stroke="#303b35"
          strokeWidth="4"
        />
      </>
    );
  } else if (variant === "complementary") {
    const cx = 180,
      cy = 92,
      r = 68;
    drawing = (
      <>
        {Array.from({ length: 12 }, (_, i) => {
          const a = ((i * 30 - 90) * Math.PI) / 180,
            b = (((i + 1) * 30 - 90) * Math.PI) / 180;
          return (
            <path
              key={i}
              d={`M${cx} ${cy}L${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}A${r} ${r} 0 0 1 ${cx + r * Math.cos(b)} ${cy + r * Math.sin(b)}Z`}
              fill={`hsl(${i * 30},62%,56%)`}
            />
          );
        })}
        <circle cx={cx} cy={cy} r="37" fill="white" />
        <path d="M198 28L162 156" stroke="#17211c" strokeWidth="2" />
        <circle cx="198" cy="28" r="7" fill="white" stroke="#17211c" strokeWidth="2" />
        <circle cx="162" cy="156" r="7" fill="white" stroke="#17211c" strokeWidth="2" />
        <rect x="46" y="188" width="116" height="28" fill="hsl(0,62%,56%)" />
        <rect x="198" y="188" width="116" height="28" fill="hsl(180,62%,56%)" />
        <text x="180" y="237" textAnchor="middle">
          색상환에서 마주 보는 위치
        </text>
      </>
    );
  } else if (variant === "unity" || variant === "variety") {
    const boxes: [number, number, number, number][] =
      variant === "unity"
        ? [
            [23, 40, 98, 140],
            [131, 40, 98, 140],
            [239, 40, 98, 140],
          ]
        : [
            [23, 26, 194, 93],
            [229, 26, 108, 176],
            [23, 132, 194, 70],
          ];
    drawing = (
      <>
        {boxes.map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill="white" stroke="#abb8af" />
            <rect
              x={x + 8}
              y={y + 8}
              width={w - 16}
              height={h * 0.4}
              fill={i === 1 && variant === "variety" ? "#bdd3c8" : "#e4eae6"}
            />
            <path
              d={`M${x + 10} ${y + h * 0.4 + 24}h${w * 0.55}`}
              stroke="#2c3b32"
              strokeWidth="6"
            />
            <path
              d={`M${x + 10} ${y + h * 0.4 + 38}h${w * 0.7}`}
              stroke="#a6b1aa"
              strokeWidth="3"
            />
          </g>
        ))}
        <text x="180" y="233" textAnchor="middle">
          {variant === "unity" ? "공통 규칙이 만드는 통일감" : "공통 규칙 안에서 만드는 변화"}
        </text>
      </>
    );
  } else {
    drawing = (
      <>
        <text x="93" y="28" textAnchor="middle">
          같은 지원
        </text>
        <text x="268" y="28" textAnchor="middle">
          장벽에 맞춘 지원
        </text>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <circle cx="42" cy={65 + i * 55} r="12" fill="#9dab9f" />
            <rect x="70" y={51 + i * 55} width="83" height="28" fill="#e9eee9" stroke="#9dac9f" />
            <text x="111" y={71 + i * 55} textAnchor="middle" fontSize="14">
              같은 안내
            </text>
            <circle cx="215" cy={65 + i * 55} r="12" fill="#9dab9f" />
            <rect x="242" y={51 + i * 55} width="98" height="28" fill="#e4efeb" stroke="#719986" />
            <text x="291" y={71 + i * 55} textAnchor="middle" fontSize="14">
              {["자막", "키보드 탐색", "글자 확대"][i]}
            </text>
          </g>
        ))}
        <path d="M178 41v166" stroke="#ccd5ce" strokeDasharray="4 4" />
        <text x="180" y="233" textAnchor="middle">
          기능별 접근 장벽을 살피는 예시
        </text>
      </>
    );
  }
  return (
    <div className="gpf-figure">
      <svg
        className="gpf-diagram"
        viewBox="0 0 360 250"
        role="img"
        aria-labelledby={`${id}-title ${id}-description`}
      >
        <title id={`${id}-title`}>{figure.title}</title>
        <desc id={`${id}-description`}>{descriptions[variant]}</desc>
        <defs>
          <marker
            id={`${id}-arrow`}
            markerWidth="7"
            markerHeight="7"
            refX="6"
            refY="3.5"
            orient="auto"
          >
            <path d="M0 0L7 3.5L0 7Z" fill="#23685e" />
          </marker>
        </defs>
        {drawing}
      </svg>
      <div className="gpf-notes">
        {figure.items.map((item, index) => (
          <div key={`${index}-${item.label}`}>
            <strong>{item.label}</strong>
            <p>{item.text}</p>
            {item.detail && <small>{item.detail}</small>}
          </div>
        ))}
      </div>
      {(variant === "f-scan" || variant === "z-scan" || variant === "layer-cake") && (
        <p className="gpf-boundary">
          내용과 과업에 따라 달라지는 읽기 패턴의 예시입니다. 모든 화면에서 같은 순서로 본다는 뜻은
          아닙니다.
        </p>
      )}
    </div>
  );
}
