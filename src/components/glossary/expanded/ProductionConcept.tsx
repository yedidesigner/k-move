import { useId, type ReactNode } from "react";
import "./production-concept.css";

const ink = "#1d2822";
const accent = "#47776b";
const light = "#e6eeea";

function Diagram({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg className="xp-concept-svg" viewBox="0 0 360 230" role="img" aria-label={label}>
      {children}
    </svg>
  );
}

function Box({
  x,
  y,
  width = 110,
  height = 48,
  label,
  active = false,
}: {
  x: number;
  y: number;
  width?: number;
  height?: number;
  label: string;
  active?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="2"
        fill={active ? light : "white"}
        stroke={active ? accent : ink}
        strokeWidth={active ? 2 : 1.3}
      />
      <text x={x + width / 2} y={y + height / 2 + 5} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const ax = x2 - 7 * Math.cos(angle - 0.5),
    ay = y2 - 7 * Math.sin(angle - 0.5);
  const bx = x2 - 7 * Math.cos(angle + 0.5),
    by = y2 - 7 * Math.sin(angle + 0.5);
  return (
    <g fill="none" stroke={accent} strokeWidth="1.5">
      <path d={`M${x1} ${y1}L${x2} ${y2}`} />
      <path d={`M${ax} ${ay}L${x2} ${y2}L${bx} ${by}`} />
    </g>
  );
}

function ColorConcept({ termId }: { termId: string }) {
  if (termId === "rgb")
    return (
      <Diagram label="RGB 빛의 세 원이 겹치는 가산 혼합 구조">
        <rect x="72" y="10" width="216" height="180" rx="2" fill="#151515" />
        <g style={{ isolation: "isolate" }}>
          <circle cx="180" cy="74" r="49" fill="red" />
          <circle cx="148" cy="124" r="49" fill="#0f0" style={{ mixBlendMode: "screen" }} />
          <circle cx="212" cy="124" r="49" fill="blue" style={{ mixBlendMode: "screen" }} />
        </g>
        <text x="180" y="46" textAnchor="middle" fill="white">
          R
        </text>
        <text x="122" y="139">
          G
        </text>
        <text x="238" y="139" fill="white">
          B
        </text>
        <text x="180" y="216" textAnchor="middle">
          빛을 더하는 세 채널
        </text>
      </Diagram>
    );
  if (termId === "cmyk" || termId === "spot-color") {
    const spot = termId === "spot-color";
    const plates = spot
      ? [
          ["별색", accent],
          ["K", ink],
        ]
      : [
          ["C", "#04adc8"],
          ["M", "#cc3d83"],
          ["Y", "#e4c941"],
          ["K", ink],
        ];
    const w = spot ? 100 : 62,
      gap = spot ? 48 : 18,
      start = (360 - (plates.length * w + (plates.length - 1) * gap)) / 2;
    return (
      <Diagram
        label={
          spot
            ? "별색 판과 검정 판 두 개를 별도로 관리하는 구조"
            : "C M Y K 네 개의 프로세스 인쇄판"
        }
      >
        {plates.map(([label, color], i) => (
          <g key={label}>
            <rect
              x={start + i * (w + gap)}
              y="45"
              width={w}
              height="105"
              fill="white"
              stroke={ink}
            />
            <circle cx={start + i * (w + gap) + w / 2} cy="92" r={spot ? 24 : 17} fill={color} />
            <text x={start + i * (w + gap) + w / 2} y="178" textAnchor="middle">
              {label}
            </text>
          </g>
        ))}
        <text x="180" y="215" textAnchor="middle">
          {spot ? "지정 잉크를 별도 판으로" : "네 프로세스 잉크의 조합"}
        </text>
      </Diagram>
    );
  }
  if (termId === "color-gamut")
    return (
      <Diagram label="서로 다른 두 색역의 공통 영역과 서로 겹치지 않는 영역">
        <ellipse cx="145" cy="103" rx="92" ry="67" fill={light} stroke={accent} strokeWidth="2" />
        <ellipse
          cx="228"
          cy="109"
          rx="80"
          ry="54"
          fill="#47776b25"
          stroke={ink}
          strokeDasharray="5 4"
        />
        <text x="89" y="102">
          범위 A
        </text>
        <text x="236" y="110">
          범위 B
        </text>
        <path d="M184 138V174" stroke={accent} />
        <text x="184" y="196" textAnchor="middle">
          공통 범위
        </text>
        <text x="180" y="221" textAnchor="middle" className="xp-concept-small">
          측정값이 아닌 관계 개념도
        </text>
      </Diagram>
    );
  if (termId === "soft-proof")
    return (
      <Diagram label="출력 프로파일로 예상 외관을 모니터에서 확인하는 소프트 프루프 구조">
        <Box x={16} y={56} width={94} height={78} label="원본 문서" />
        <Arrow x1={116} y1={96} x2={169} y2={96} />
        <rect
          x="179"
          y="43"
          width="156"
          height="105"
          rx="4"
          fill="white"
          stroke={ink}
          strokeWidth="2"
        />
        <rect x="190" y="55" width="134" height="78" fill={light} />
        <text x="257" y="94" textAnchor="middle">
          예상 출력 외관
        </text>
        <path d="M257 148V166M223 167H291" stroke={ink} strokeWidth="2" />
        <Box x={105} y={181} width={150} height={31} label="출력 프로파일" active />
        <Arrow x1={255} y1={195} x2={294} y2={153} />
      </Diagram>
    );
  const profile = termId === "icc-profile";
  return (
    <Diagram label="문서의 색 값과 프로파일에서 화면과 인쇄 두 목적지로 각각 변환">
      <Box
        x={100}
        y={12}
        width={160}
        height={53}
        label={profile ? "문서 색 + 프로파일" : "원본 색 정보"}
        active
      />
      <path d="M180 65V91M87 91H273" fill="none" stroke={accent} strokeWidth="1.5" />
      <Arrow x1={87} y1={91} x2={87} y2={118} />
      <Arrow x1={273} y1={91} x2={273} y2={118} />
      <Box x={18} y={122} width={138} height={53} label="모니터" />
      <Box x={204} y={122} width={138} height={53} label="종이 · 잉크" />
      <text x="87" y="200" textAnchor="middle" className="xp-concept-small">
        표시 프로파일
      </text>
      <text x="273" y="200" textAnchor="middle" className="xp-concept-small">
        출력 프로파일
      </text>
      <text x="180" y="224" textAnchor="middle" className="xp-concept-small">
        문서에서 목적에 따라 각각 변환
      </text>
    </Diagram>
  );
}

function OverprintConcept({ termId }: { termId: string }) {
  if (termId === "trapping")
    return (
      <Diagram label="인쇄판 맞춤 오차의 흰 틈과 경계를 조금 겹쳐 보완한 구조">
        <rect x="28" y="53" width="70" height="100" fill="#82b5a3" />
        <rect x="105" y="53" width="70" height="100" fill="#375c4d" />
        <rect x="206" y="53" width="70" height="100" fill="#82b5a3" />
        <rect x="269" y="53" width="63" height="100" fill="#375c4d" />
        <rect x="269" y="53" width="7" height="100" fill="#244739" />
        <path d="M101 155V180M272 155V180" stroke={ink} />
        <text x="101" y="201" textAnchor="middle">
          맞춤 오차의 틈
        </text>
        <text x="272" y="201" textAnchor="middle">
          작은 겹침
        </text>
        <text x="180" y="27" textAnchor="middle" className="xp-concept-small">
          경계 확대 개념도
        </text>
      </Diagram>
    );
  const knockout = termId === "knockout";
  return (
    <Diagram
      label={
        knockout
          ? "녹아웃은 위 원의 위치만큼 아래 판을 비우는 구조"
          : "오버프린트는 위 원의 아래에도 배경 잉크 판을 유지하는 구조"
      }
    >
      <rect x="25" y="45" width="130" height="105" fill="#12abc1" />
      {knockout && <circle cx="90" cy="97" r="33" fill="white" />}
      <circle cx="270" cy="97" r="33" fill="#cd3f85" />
      <rect x="205" y="45" width="130" height="105" fill="none" stroke={ink} />
      <text x="180" y="105" textAnchor="middle" style={{ fontSize: 24 }}>
        +
      </text>
      <text x="90" y="177" textAnchor="middle">
        {knockout ? "아래 판을 비움" : "아래 판을 유지"}
      </text>
      <text x="270" y="177" textAnchor="middle">
        위쪽 색판
      </text>
      <text x="180" y="217" textAnchor="middle" className="xp-concept-small">
        화면 투명도가 아닌 분판 관계
      </text>
    </Diagram>
  );
}

function PrintConcept({ termId }: { termId: string }) {
  const labels: Record<string, string> = {
    bleed: "도련: 재단선 밖의 여분",
    "trim-size": "재단 크기: 완성물의 경계",
    "safe-area": "안전 영역: 중요 내용의 안쪽 기준",
    "crop-marks": "재단 표시: 자를 위치를 안내",
  };
  const bleed = termId === "bleed",
    trim = termId === "trim-size",
    safe = termId === "safe-area",
    marks = termId === "crop-marks";
  return (
    <Diagram label={labels[termId] ?? "인쇄의 경계 구조"}>
      <rect
        x="70"
        y="32"
        width="220"
        height="135"
        fill={bleed ? light : "white"}
        stroke={bleed ? accent : "#a3afa7"}
        strokeWidth={bleed ? 3 : 1}
      />
      <rect
        x="82"
        y="44"
        width="196"
        height="111"
        fill="white"
        stroke={trim ? accent : ink}
        strokeWidth={trim ? 3 : 1.5}
      />
      <rect
        x="101"
        y="63"
        width="158"
        height="73"
        fill={safe ? light : "none"}
        stroke={safe ? accent : "#9ba89f"}
        strokeDasharray="5 4"
        strokeWidth={safe ? 3 : 1}
      />
      <path
        d="M45 44H61M82 8V23M299 44H315M278 8V23M45 155H61M82 177V193M299 155H315M278 177V193"
        fill="none"
        stroke={marks ? accent : ink}
        strokeWidth={marks ? 3 : 1}
      />
      <path d="M132 89H228M132 102H216M132 115H195" stroke="#99a79d" strokeWidth="3" />
      <text x="180" y="216" textAnchor="middle">
        {labels[termId]}
      </text>
    </Diagram>
  );
}

function PreflightConcept() {
  return (
    <Diagram label="파일의 이미지 텍스트 색상 상태를 제작 규칙과 대조하여 오류를 확인">
      <path d="M34 25H105L127 47V156H34Z" fill="white" stroke={ink} />
      <path d="M105 25V47H127" fill="none" stroke={ink} />
      <rect x="49" y="62" width="62" height="35" fill={light} />
      <path d="M49 111H111M49 122H103M49 133H96" stroke="#9ba89f" strokeWidth="3" />
      <text x="80" y="183" textAnchor="middle">
        파일
      </text>
      <Arrow x1={136} y1={91} x2={185} y2={91} />
      <rect x="196" y="31" width="136" height="127" fill="white" stroke={ink} />
      {["이미지 링크", "폰트 · 텍스트", "색 · 해상도"].map((label, i) => (
        <g key={label}>
          <rect
            x="208"
            y={48 + i * 35}
            width="13"
            height="13"
            fill={i === 1 ? light : "white"}
            stroke={accent}
          />
          <text x="230" y={60 + i * 35} className="xp-concept-small">
            {label}
          </text>
        </g>
      ))}
      <text x="264" y="183" textAnchor="middle">
        제작 규칙 대조
      </text>
      <text x="180" y="218" textAnchor="middle" className="xp-concept-small">
        검사 기준에 포함한 항목만 확인 가능
      </text>
    </Diagram>
  );
}

function ResolutionConcept({ termId }: { termId: string }) {
  if (termId === "dpi")
    return (
      <Diagram label="한 이미지 픽셀의 색과 프린터 출력 도트가 서로 다른 단위임을 보여주는 구조">
        <rect x="36" y="42" width="104" height="104" fill={accent} />
        <text x="88" y="177" textAnchor="middle">
          이미지 픽셀
        </text>
        <Arrow x1={151} y1={94} x2={201} y2={94} />
        <rect x="213" y="42" width="104" height="104" fill="white" stroke="#adb8b0" />
        {Array.from({ length: 36 }, (_, i) => (
          <circle
            key={i}
            cx={223 + (i % 6) * 17}
            cy={52 + Math.floor(i / 6) * 17}
            r="3.6"
            fill={["#08a3b9", "#c83b7b", "#d4bd38", ink][i % 4]}
          />
        ))}
        <text x="265" y="177" textAnchor="middle">
          출력 도트
        </text>
        <text x="180" y="216" textAnchor="middle" className="xp-concept-small">
          픽셀과 도트는 일대일 대응하지 않음
        </text>
      </Diagram>
    );
  return (
    <Diagram label="동일한 2400픽셀을 8인치와16인치에 배치하면300ppi와150ppi가 됨">
      <text x="180" y="28" textAnchor="middle">
        동일한 2400px 원본
      </text>
      <rect x="41" y="95" width="80" height="50" fill={light} stroke={accent} />
      <rect x="164" y="45" width="160" height="100" fill={light} stroke={accent} />
      <text x="81" y="173" textAnchor="middle">
        8in
      </text>
      <text x="244" y="173" textAnchor="middle">
        16in
      </text>
      <text x="81" y="199" textAnchor="middle">
        300ppi
      </text>
      <text x="244" y="199" textAnchor="middle">
        150ppi
      </text>
      <text x="180" y="225" textAnchor="middle" className="xp-concept-small">
        픽셀 수 ÷ 출력 인치 = PPI
      </text>
    </Diagram>
  );
}

function GeometryConcept({ termId }: { termId: string }) {
  if (termId === "raster")
    return (
      <Diagram label="사각 픽셀 각각의 색으로 곡선 형태를 나타내는 래스터 구조">
        <g transform="translate(92 20)">
          {Array.from({ length: 64 }, (_, i) => {
            const x = i % 8,
              y = Math.floor(i / 8),
              filled = (x - 3.5) ** 2 + (y - 3.5) ** 2 < 12;
            return (
              <rect
                key={i}
                x={x * 22}
                y={y * 22}
                width="22"
                height="22"
                fill={filled ? accent : "white"}
                stroke="#c7d2ca"
                strokeWidth=".7"
              />
            );
          })}
        </g>
        <text x="180" y="221" textAnchor="middle">
          픽셀 격자에 저장된 색
        </text>
      </Diagram>
    );
  if (termId === "vector")
    return (
      <Diagram label="벡터 형태는 앵커와 경로로 정의되며 확대 시 경로가 다시 계산됨">
        <path
          d="M76 150C69 80 110 39 169 32C174 101 146 146 76 150Z"
          fill={light}
          stroke={accent}
          strokeWidth="2"
        />
        <path
          d="M226 150C222 114 244 93 274 90C276 125 262 147 226 150Z"
          fill={light}
          stroke={accent}
          strokeWidth="2"
        />
        {[
          [76, 150],
          [169, 32],
          [226, 150],
          [274, 90],
        ].map(([x, y], i) => (
          <rect key={i} x={(x ?? 0) - 3} y={(y ?? 0) - 3} width="6" height="6" fill={ink} />
        ))}
        <text x="117" y="181" textAnchor="middle">
          경로와 점
        </text>
        <text x="250" y="181" textAnchor="middle">
          크기 변경
        </text>
        <text x="180" y="218" textAnchor="middle" className="xp-concept-small">
          경로의 관계를 유지해 다시 계산
        </text>
      </Diagram>
    );
  const anchor = termId === "anchor-point";
  return (
    <Diagram
      label={
        anchor
          ? "사각 앵커는 경로 위에 있고 원형 핸들은 곡선 형태를 제어함"
          : "3차 베지에 구간은 두 끝점과 두 제어점으로 구성"
      }
    >
      <path d="M48 159L109 35M309 158L254 36" stroke="#93aa9e" fill="none" strokeWidth="1.5" />
      <path d="M48 159C109 35 254 36 309 158" fill="none" stroke={accent} strokeWidth="3" />
      <circle cx="109" cy="35" r="5" fill="white" stroke={ink} />
      <circle cx="254" cy="36" r="5" fill="white" stroke={ink} />
      <rect x="43" y="154" width="10" height="10" fill={ink} />
      <rect x="304" y="153" width="10" height="10" fill={ink} />
      <text x="178" y="30" textAnchor="middle">
        핸들
      </text>
      <text x="48" y="190" textAnchor="middle">
        앵커
      </text>
      <text x="309" y="190" textAnchor="middle">
        앵커
      </text>
      <text x="180" y="220" textAnchor="middle" className="xp-concept-small">
        {anchor ? "경로는 앵커를 통과" : "곡선은 제어 핸들을 통과하지 않아도 됨"}
      </text>
    </Diagram>
  );
}

function MaskConcept({ termId }: { termId: string }) {
  const clipId = useId();
  if (termId === "alpha-channel")
    return (
      <Diagram label="검정 회색 흰색의 별도 채널 값으로 미선택 부분선택 선택을 나타냄">
        {["#000", "#888", "#fff"].map((color, i) => (
          <g key={color}>
            <rect x={30 + i * 105} y="48" width="90" height="98" fill={color} stroke={ink} />
            <text x={75 + i * 105} y="175" textAnchor="middle">
              {["미선택", "부분 선택", "선택"][i]}
            </text>
          </g>
        ))}
        <text x="180" y="213" textAnchor="middle" className="xp-concept-small">
          선택 마스크의 채널 값
        </text>
      </Diagram>
    );
  return (
    <Diagram label="콘텐츠와 원형 경계가 겹친 영역만 보이고 원본은 남는 클리핑 구조">
      <rect x="25" y="48" width="106" height="100" fill={light} />
      <path d="M25 132L63 65L100 120L131 92V148H25Z" fill={accent} />
      <circle cx="78" cy="98" r="42" fill="none" stroke={ink} strokeDasharray="4 3" />
      <Arrow x1={143} y1={99} x2={197} y2={99} />
      <defs>
        <clipPath id={clipId}>
          <circle cx="270" cy="98" r="42" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect x="217" y="48" width="106" height="100" fill={light} />
        <path d="M217 132L255 65L292 120L323 92V148H217Z" fill={accent} />
      </g>
      <text x="78" y="180" textAnchor="middle">
        원본 + 경계
      </text>
      <text x="270" y="180" textAnchor="middle">
        보이는 영역
      </text>
      <text x="180" y="216" textAnchor="middle" className="xp-concept-small">
        경계 밖 원본은 삭제되지 않음
      </text>
    </Diagram>
  );
}

function RatioConcept() {
  return (
    <Diagram label="같은 너비의 16대9 1대1 4대5 프레임은 서로 다른 높이를 가짐">
      {[
        ["16:9", 50.625],
        ["1:1", 90],
        ["4:5", 112.5],
      ].map(([label, height], i) => (
        <g key={label}>
          <rect
            x={30 + i * 105}
            y={145 - Number(height)}
            width="90"
            height={Number(height)}
            fill={light}
            stroke={accent}
          />
          <text x={75 + i * 105} y="177" textAnchor="middle">
            {label}
          </text>
        </g>
      ))}
      <text x="180" y="214" textAnchor="middle">
        너비 : 높이
      </text>
    </Diagram>
  );
}

function BrandConcept({ termId }: { termId: string }) {
  if (termId === "wordmark" || termId === "lettermark") {
    const letter = termId === "lettermark";
    return (
      <Diagram
        label={
          letter
            ? "긴 브랜드 이름의 머리글자를 추려 문자형 로고로 표현"
            : "브랜드 이름 전체의 글자 형태를 고정한 워드마크"
        }
      >
        <text x="180" y="50" textAnchor="middle" className="xp-concept-small">
          {letter ? "이름의 머리글자" : "브랜드 이름 전체"}
        </text>
        <text x="180" y="132" textAnchor="middle" className="xp-concept-mark">
          {letter ? "AB" : "ALPHA BETA"}
        </text>
        <path d="M60 151H300" stroke={accent} />
        <text x="180" y="191" textAnchor="middle">
          {letter ? "약자 중심의 형태" : "이름 중심의 형태"}
        </text>
      </Diagram>
    );
  }
  if (termId === "brand-architecture")
    return (
      <Diagram label="상위 브랜드 아래 두 하위 서비스가 연결되는 관계 구조">
        <Box x={111} y={26} width={138} label="상위 브랜드" active />
        <path d="M180 74V101M90 101H270" fill="none" stroke={accent} />
        <Arrow x1={90} y1={101} x2={90} y2={130} />
        <Arrow x1={270} y1={101} x2={270} y2={130} />
        <Box x={25} y={135} width={130} label="서비스 A" />
        <Box x={205} y={135} width={130} label="서비스 B" />
        <text x="180" y="218" textAnchor="middle" className="xp-concept-small">
          명명 · 보증 · 독립성의 관계
        </text>
      </Diagram>
    );
  if (termId === "brand-guidelines")
    return (
      <Diagram label="방향 원칙에서 요소 규칙으로 이어지고 적용 예시로 구체화되는 브랜드 가이드 구조">
        <path d="M69 18H266L290 42V207H69Z" fill="white" stroke={ink} />
        <path d="M266 18V42H290" fill="none" stroke={ink} />
        <rect x="88" y="43" width="181" height="32" fill={light} />
        <text x="178" y="65" textAnchor="middle">
          원칙
        </text>
        <path d="M98 90V165M98 104H112M98 153H112" fill="none" stroke={accent} />
        <text x="121" y="109">
          요소 규칙
        </text>
        <path d="M121 122H260M121 132H222" stroke="#a4b3a8" strokeWidth="3" />
        <text x="121" y="158">
          적용 예시
        </text>
        <rect x="121" y="170" width="43" height="21" fill={light} stroke={accent} />
        <rect x="177" y="170" width="43" height="21" fill="none" stroke={ink} />
      </Diagram>
    );
  if (termId === "art-direction")
    return (
      <Diagram label="표현 의도가 이미지 타입 색의 선택에 일관되게 연결되는 아트 디렉션 구조">
        <Box x={111} y={17} width={138} label="표현 의도" active />
        <path d="M180 65V88M63 88H297" fill="none" stroke={accent} />
        {[63, 180, 297].map((x) => (
          <Arrow key={x} x1={x} y1={88} x2={x} y2={111} />
        ))}
        <rect x="24" y="120" width="78" height="57" fill={light} stroke={ink} />
        <path d="M29 169L52 140L71 157L90 133" fill="none" stroke={accent} strokeWidth="2" />
        <text x="180" y="164" textAnchor="middle" style={{ fontSize: 35 }}>
          Aa
        </text>
        <rect x="270" y="127" width="32" height="32" fill={accent} />
        <rect x="289" y="143" width="32" height="32" fill={light} stroke={ink} />
        <text x="63" y="205" textAnchor="middle">
          이미지
        </text>
        <text x="180" y="205" textAnchor="middle">
          타입
        </text>
        <text x="297" y="205" textAnchor="middle">
          색
        </text>
      </Diagram>
    );
  return (
    <Diagram label="대상 필요와 대안의 차이를 브랜드의 가치로 연결하고 근거로 뒷받침하는 포지셔닝 구조">
      <Box x={15} y={28} width={140} label="대상의 필요" />
      <Box x={205} y={28} width={140} label="대안과의 차이" />
      <Arrow x1={85} y1={76} x2={139} y2={116} />
      <Arrow x1={275} y1={76} x2={221} y2={116} />
      <Box x={103} y={121} width={154} label="선택받을 가치" active />
      <path d="M180 169V189" stroke={accent} />
      <text x="180" y="216" textAnchor="middle">
        약속을 뒷받침할 근거
      </text>
    </Diagram>
  );
}

export function ProductionConcept({ termId }: { termId: string }) {
  let diagram: ReactNode = null;
  if (
    [
      "rgb",
      "cmyk",
      "spot-color",
      "color-gamut",
      "icc-profile",
      "color-management",
      "soft-proof",
    ].includes(termId)
  )
    diagram = <ColorConcept termId={termId} />;
  else if (["overprint", "knockout", "trapping"].includes(termId))
    diagram = <OverprintConcept termId={termId} />;
  else if (["bleed", "trim-size", "safe-area", "crop-marks"].includes(termId))
    diagram = <PrintConcept termId={termId} />;
  else if (termId === "preflight") diagram = <PreflightConcept />;
  else if (["ppi", "dpi"].includes(termId)) diagram = <ResolutionConcept termId={termId} />;
  else if (["raster", "vector", "bezier-curve", "anchor-point"].includes(termId))
    diagram = <GeometryConcept termId={termId} />;
  else if (["clipping-mask", "alpha-channel"].includes(termId))
    diagram = <MaskConcept termId={termId} />;
  else if (termId === "aspect-ratio") diagram = <RatioConcept />;
  else if (
    [
      "brand-positioning",
      "brand-architecture",
      "wordmark",
      "lettermark",
      "brand-guidelines",
      "art-direction",
    ].includes(termId)
  )
    diagram = <BrandConcept termId={termId} />;
  return diagram ? (
    <div className="xp-concept" data-production-concept={termId}>
      {diagram}
    </div>
  ) : null;
}
