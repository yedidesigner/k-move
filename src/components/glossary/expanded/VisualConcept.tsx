import type { ReactNode } from "react";
import "./visual-concept.css";

const ink = "#202521";
const green = "#47776b";
const pale = "#e9f0ec";
const gray = "#c6ceca";

function Diagram({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 400 230"
      fontSize="16"
      role="img"
      aria-label={label}
      className="xe-vconcept-svg"
    >
      {children}
    </svg>
  );
}

function Measure({ x1, x2, y, label }: { x1: number; x2: number; y: number; label?: string }) {
  return (
    <g stroke={green} strokeWidth="1.5" fill="none">
      <path d={`M${x1} ${y - 5}v10m0 -5H${x2}m0 -5v10`} />
      {label && (
        <text x={(x1 + x2) / 2} y={y + 24} textAnchor="middle" fill={green} stroke="none">
          {label}
        </text>
      )}
    </g>
  );
}

function TextLines({
  x,
  y,
  widths,
  gap = 19,
  color = gray,
}: {
  x: number;
  y: number;
  widths: number[];
  gap?: number;
  color?: string;
}) {
  return (
    <g fill={color}>
      {widths.map((width, i) => (
        <rect key={i} x={x} y={y + i * gap} width={width} height="6" rx="2" />
      ))}
    </g>
  );
}

function Composition({ termId }: { termId: string }) {
  if (termId === "alignment")
    return (
      <Diagram label="폭이 다른 제목, 문단, 버튼의 왼쪽 끝이 하나의 수직선에 맞춰져 있습니다.">
        <path d="M83 28V188" stroke={green} strokeDasharray="4 4" />
        <rect x="83" y="45" width="220" height="27" fill={ink} />
        <TextLines x={83} y={94} widths={[230, 190, 210]} />
        <rect x="83" y="158" width="100" height="28" fill={pale} stroke={green} />
        <text x="83" y="215" fill={green}>
          같은 기준선에 맞추기
        </text>
      </Diagram>
    );
  if (termId === "contrast")
    return (
      <Diagram label="작고 연한 원들 사이 크고 진한 원 하나가 차이를 만듭니다.">
        {[65, 125, 275, 335].map((x) => (
          <circle key={x} cx={x} cy="105" r="15" fill={gray} />
        ))}
        <circle cx="200" cy="105" r="34" fill={ink} />
        <path d="M200 146V170" stroke={green} />
        <text x="200" y="197" textAnchor="middle" fill={green}>
          크기와 명도의 차이
        </text>
      </Diagram>
    );
  if (termId === "rhythm")
    return (
      <Diagram label="같은 막대가 짧은 간격 두 번과 긴 간격 한 번으로 반복되어 리듬을 만듭니다.">
        {[48, 88, 128, 218, 258, 298].map((x) => (
          <rect key={x} x={x} y="66" width="24" height="73" fill={ink} />
        ))}
        <Measure x1={152} x2={218} y={159} label="쉼" />
        <text x="200" y="218" textAnchor="middle">
          반복 단위 + 간격의 변화
        </text>
      </Diagram>
    );
  if (termId === "repetition")
    return (
      <Diagram label="동일한 모양, 크기, 색의 원을 세 번 반복합니다.">
        {[90, 200, 310].map((x) => (
          <g key={x}>
            <circle cx={x} cy="100" r="31" fill={ink} />
            <path d={`M${x} 139v20`} stroke={green} />
          </g>
        ))}
        <path d="M90 159H310" stroke={green} />
        <text x="200" y="195" textAnchor="middle" fill={green}>
          같은 시각 규칙을 다시 사용
        </text>
      </Diagram>
    );
  if (termId === "figure-ground")
    return (
      <Diagram label="진한 배경 안의 흰 원이 전경으로 구분됩니다. 두 영역 사이의 경계가 형태를 드러냅니다.">
        <rect x="50" y="29" width="300" height="161" fill={ink} />
        <circle cx="172" cy="107" r="56" fill="white" />
        <text x="172" y="113" textAnchor="middle" fill={ink}>
          전경
        </text>
        <text x="285" y="160" textAnchor="middle" fill="white">
          배경
        </text>
        <text x="200" y="218" textAnchor="middle">
          주목하는 형태와 그 주변
        </text>
      </Diagram>
    );
  if (termId === "closure")
    return (
      <Diagram label="끊어진 네 모서리만으로 완전한 사각형 영역을 지각하는 폐쇄성 도식입니다.">
        <path
          d="M110 80V45h45m90 0h45v35m0 45v35h-45m-90 0h-45v-35"
          fill="none"
          stroke={ink}
          strokeWidth="6"
        />
        <text x="200" y="203" textAnchor="middle">
          끊어진 경계 → 하나의 형태
        </text>
      </Diagram>
    );
  if (termId === "good-continuation")
    return (
      <Diagram label="두 선이 교차하지만 각 선을 방향이 매끄럽게 이어지는 경로로 읽습니다.">
        <path
          d="M48 60C160 60 240 160 352 160M48 160C160 160 240 60 352 60"
          fill="none"
          stroke={ink}
          strokeWidth="4"
        />
        <circle cx="200" cy="110" r="24" fill="none" stroke={green} strokeDasharray="3 4" />
        <text x="34" y="45">
          A
        </text>
        <text x="350" y="189">
          B
        </text>
        <text x="200" y="218" textAnchor="middle" fill={green}>
          교차해도 매끄러운 방향을 따라 읽기
        </text>
      </Diagram>
    );
  if (termId === "symmetry")
    return (
      <Diagram label="수직축의 양쪽에 같은 거리로 대응하는 원과 사각형이 있습니다.">
        <path d="M200 22V185" stroke={green} strokeDasharray="4 4" />
        {[110, 290].map((x) => (
          <g key={x}>
            <circle cx={x} cy="75" r="30" fill={ink} />
            <rect x={x - 30} y="128" width="60" height="25" fill={gray} />
          </g>
        ))}
        <Measure x1={110} x2={200} y={177} />
        <Measure x1={200} x2={290} y={177} />
        <text x="200" y="215" textAnchor="middle" fill={green}>
          중심축을 기준으로 대응
        </text>
      </Diagram>
    );
  return (
    <Diagram label="동일한 원을 프레임 중앙과 오른쪽 경계 가까이 배치하여 경계와의 긴장을 비교합니다.">
      {[28, 214].map((x) => (
        <rect key={x} x={x} y="35" width="158" height="130" fill="none" stroke={gray} />
      ))}
      <circle cx="107" cy="100" r="24" fill={ink} />
      <circle cx="341" cy="100" r="24" fill={ink} />
      <path d="M365 71h7m-7 -5v12m7 -12v12" stroke={green} />
      <text x="107" y="194" textAnchor="middle">
        중앙 배치
      </text>
      <text x="293" y="194" textAnchor="middle" fill={green}>
        경계에 가까운 배치
      </text>
    </Diagram>
  );
}

// Outlined schematic glyphs keep annotation lines tied to exact letter geometry,
// independently of the platform's installed font metrics.
function Anatomy({ termId }: { termId: string }) {
  const baseline = 159;
  const labels: Record<string, string> = {
    baseline: "글자가 놓이는 기준선",
    "x-height": "소문자 x의 높이",
    "cap-height": "평평한 대문자의 높이",
    ascender: "x-height 위로 올라오는 부분",
    descender: "베이스라인 아래로 내려오는 부분",
    counter: "글자 획이 둘러싼 내부 공간",
  };
  if (termId === "counter")
    return (
      <Diagram label="소문자 o의 검은 획 안에 둘러싸인 흰 공간을 카운터라고 합니다.">
        <ellipse cx="173" cy="108" rx="52" ry="62" fill={ink} />
        <ellipse cx="173" cy="108" rx="34" ry="44" fill={pale} />
        <path d="M173 108h115" stroke={green} />
        <circle cx="173" cy="108" r="3" fill={green} />
        <text x="296" y="114" fill={green}>
          내부 공간
        </text>
        <text x="200" y="211" textAnchor="middle">
          o의 닫힌 카운터
        </text>
      </Diagram>
    );
  const top = termId === "x-height" ? 95 : 49;
  const highlight = termId === "ascender" || termId === "descender";
  return (
    <Diagram label={labels[termId] ?? "글자 구조"}>
      <path d="M52 159H350" stroke={green} strokeWidth={termId === "baseline" ? 2 : 1} />
      <path d="M52 49H350M52 95H350" stroke={gray} strokeDasharray="3 4" />
      <g fill="none" stroke={ink} strokeWidth="10" strokeLinecap="butt">
        <path d="M82 159V49m0 55h44m0 -55v110" />
        <path d="M151 95l36 64m0 -64l-36 64" />
        <path d="M216 159V49m0 66c0 -29 41 -29 41 0v44" />
        <path d="M289 195V95m0 16c9 -23 44 -17 44 16s-35 38 -44 16" />
      </g>
      {termId === "ascender" && <path d="M216 90V49" stroke={green} strokeWidth="10" />}
      {termId === "descender" && <path d="M289 164V195" stroke={green} strokeWidth="10" />}
      {!highlight && termId !== "baseline" && (
        <g stroke={green} strokeWidth="2">
          <path d={`M42 ${top}h-10v${baseline - top}h10`} />
          <path d={`M32 ${top}h10`} />
        </g>
      )}
      <text x="200" y="222" textAnchor="middle" fill={green}>
        {labels[termId]}
      </text>
    </Diagram>
  );
}

function Typography({ termId }: { termId: string }) {
  if (termId === "typographic-scale")
    return (
      <Diagram label="제목 40, 소제목 26, 본문 16의 세 가지 타입 크기가 정보 위계를 만듭니다.">
        <text x="45" y="73" fontSize="40" fontWeight="700">
          큰 제목
        </text>
        <text x="322" y="70" fill={green}>
          40
        </text>
        <text x="45" y="122" fontSize="26" fontWeight="600">
          소제목
        </text>
        <text x="322" y="120" fill={green}>
          26
        </text>
        <text x="45" y="165" fontSize="16">
          본문의 내용을 읽습니다.
        </text>
        <text x="322" y="165" fill={green}>
          16
        </text>
        <text x="200" y="215" textAnchor="middle">
          용도별 크기 체계 · 수치는 예시
        </text>
      </Diagram>
    );
  if (termId === "baseline-grid")
    return (
      <Diagram label="두 열의 글자 베이스라인을 같은 간격의 수평 격자에 맞춥니다.">
        {[62, 102, 142, 182].map((y) => (
          <path key={y} d={`M28 ${y}H372`} stroke={green} strokeWidth="1" />
        ))}
        {[62, 102, 142].map((y, i) => (
          <g key={y}>
            <text x="38" y={y} fontSize="21">
              {["같은 기준선", "두 열의 본문", "일정한 간격"][i]}
            </text>
            <text x="223" y={y} fontSize="21">
              {["나란한 본문", "수평으로 정렬", "같은 리듬"][i]}
            </text>
          </g>
        ))}
        <text x="200" y="217" textAnchor="middle" fill={green}>
          반복되는 베이스라인 격자
        </text>
      </Diagram>
    );
  if (termId === "kerning")
    return (
      <Diagram label="AV 한 글자쌍의 간격을 좁힙니다. 다른 글자 전체의 자간을 바꾸는 것은 아닙니다.">
        <g fontFamily="Georgia, serif" fontSize="67">
          <text x="42" y="119">
            A
          </text>
          <text x="101" y="119">
            V
          </text>
          <text x="237" y="119">
            A
          </text>
          <text x="274" y="119">
            V
          </text>
        </g>
        <Measure x1={65} x2={124} y={143} />
        <Measure x1={260} x2={297} y={143} />
        <path d="M173 95h29m-8 -7 8 7 -8 7" fill="none" stroke={green} strokeWidth="2" />
        <text x="200" y="206" textAnchor="middle" fill={green}>
          특정 글자쌍 사이 간격 조정
        </text>
      </Diagram>
    );
  if (termId === "tracking")
    return (
      <Diagram label="STUDIO 전체 글자 사이의 간격을 균일하게 늘리는 트래킹 도식입니다.">
        {[0, 1].map((row) => (
          <g key={row}>
            {"STUDIO".split("").map((letter, i) => (
              <text
                key={i}
                x={(row ? 77 : 120) + i * (row ? 43 : 26)}
                y={row ? 151 : 72}
                fontSize="28"
                textAnchor="middle"
              >
                {letter}
              </text>
            ))}
          </g>
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <Measure key={i} x1={77 + i * 43} x2={120 + i * 43} y={174} />
        ))}
        <text x="200" y="216" textAnchor="middle" fill={green}>
          선택한 글자 전체의 간격
        </text>
      </Diagram>
    );
  if (termId === "leading")
    return (
      <Diagram label="두 줄의 베이스라인 사이 거리를 재는 행간 도식입니다.">
        {[82, 146].map((y) => (
          <path key={y} d={`M34 ${y}H327`} stroke={green} />
        ))}
        <text x="46" y="82" fontSize="31">
          첫 번째 문장
        </text>
        <text x="46" y="146" fontSize="31">
          다음 문장
        </text>
        <path d="M335 82h14v64h-14m14 -64h-14" fill="none" stroke={green} strokeWidth="2" />
        <text x="200" y="202" textAnchor="middle" fill={green}>
          베이스라인 ↔ 베이스라인
        </text>
      </Diagram>
    );
  if (termId === "line-length")
    return (
      <Diagram label="글자 크기는 같아도 문단 폭에 따라 한 줄에 들어가는 글자 수가 달라집니다.">
        <path d="M45 38v135M355 38v135" stroke={gray} strokeDasharray="3 4" />
        <text x="45" y="65" fontSize="18">
          한 줄에 들어가는 글자의 양은
        </text>
        <text x="45" y="96" fontSize="18">
          문단 폭과 글자 크기에 따라
        </text>
        <text x="45" y="127" fontSize="18">
          달라집니다.
        </text>
        <Measure x1={45} x2={355} y={157} label="한 줄의 폭" />
        <text x="200" y="217" textAnchor="middle">
          길이 판단은 언어·서체·화면과 함께
        </text>
      </Diagram>
    );
  if (termId === "rag")
    return (
      <Diagram label="왼쪽은 정렬하고 오른쪽 줄끝은 길이가 달라 불규칙한 윤곽을 만듭니다.">
        <TextLines x={55} y={47} gap={24} widths={[250, 219, 238, 203, 234]} color={ink} />
        <path
          d="M314 47L283 71L302 95L267 119L298 143"
          fill="none"
          stroke={green}
          strokeWidth="2"
        />
        <path d="M47 40V155" stroke={gray} />
        <text x="200" y="199" textAnchor="middle" fill={green}>
          정렬하지 않은 쪽의 줄끝 윤곽
        </text>
      </Diagram>
    );
  if (termId === "widows-orphans")
    return (
      <Diagram label="위는 문단 마지막 한 줄만 다음 단에 떨어진 경우, 아래는 문단 첫 한 줄만 앞 단에 남은 경우입니다.">
        {[20, 123].map((y) => (
          <g key={y}>
            <rect x="45" y={y} width="133" height="72" fill="none" stroke={gray} />
            <rect x="222" y={y} width="133" height="72" fill="none" stroke={gray} />
          </g>
        ))}
        <TextLines x={57} y={32} gap={15} widths={[108, 108, 108, 108]} />
        <TextLines x={234} y={32} widths={[67]} color={green} />
        <TextLines x={57} y={180} widths={[107]} color={green} />
        <TextLines x={234} y={135} gap={15} widths={[108, 108, 108, 71]} />
        <path d="M187 55h25m-6 -5 6 5 -6 5M187 159h25m-6 -5 6 5 -6 5" fill="none" stroke={ink} />
        <text x="222" y="111" fontSize="15" fill={green}>
          끝 한 줄이 분리됨
        </text>
        <text x="45" y="218" fontSize="15" fill={green}>
          첫 한 줄이 분리됨
        </text>
      </Diagram>
    );
  if (termId === "ligature")
    return (
      <Diagram label="따로 그린 f와 i를, 획이 충돌하지 않도록 하나의 합자 글리프로 설계한 개념도입니다.">
        <g stroke={ink} strokeWidth="7" fill="none">
          <path d="M73 155V78q0 -31 30 -19M57 98h48M130 97v58" />
          <path d="M259 155V78q0 -31 47 -19M243 98h62v57" />
        </g>
        <circle cx="130" cy="67" r="5" fill={ink} />
        <circle cx="305" cy="67" r="5" fill={ink} />
        <path d="M175 105h35m-8 -7 8 7 -8 7" fill="none" stroke={green} strokeWidth="2" />
        <text x="100" y="193" textAnchor="middle">
          f + i
        </text>
        <text x="278" y="193" textAnchor="middle" fill={green}>
          하나의 글리프
        </text>
        <text x="200" y="222" textAnchor="middle" fontSize="14">
          합자 형태의 개념도 · 서체마다 다름
        </text>
      </Diagram>
    );
  return <Axes termId={termId} />;
}

function H({ x, y, width, weight }: { x: number; y: number; width: number; weight: number }) {
  return (
    <path
      d={`M${x} ${y + 44}V${y}m0 22h${width}m0 -22v44`}
      stroke={ink}
      strokeWidth={weight}
      fill="none"
    />
  );
}

function Axes({ termId }: { termId: string }) {
  if (termId === "variable-font")
    return (
      <Diagram label="하나의 가변 폰트에서 굵기와 폭 축을 바꾸는 개념도입니다. 지원 축은 폰트마다 다릅니다.">
        <path d="M70 174H348m-7 -6 7 6 -7 6M70 174V24m-6 7 6 -7 6 7" fill="none" stroke={green} />
        <H x={115} y={109} width={30} weight={4} />
        <H x={277} y={109} width={48} weight={4} />
        <H x={115} y={41} width={30} weight={11} />
        <H x={277} y={41} width={48} weight={11} />
        <text x="25" y="31" fill={green}>
          굵기
        </text>
        <text x="345" y="204" textAnchor="end" fill={green}>
          폭
        </text>
        <text x="200" y="226" textAnchor="middle" fontSize="14">
          축 조합의 개념도 · 지원 축은 폰트마다 다름
        </text>
      </Diagram>
    );
  if (termId === "weight-axis")
    return (
      <Diagram label="wght 축에서 굵기 값을 바꿀 때 글자의 획 두께가 연속적으로 달라지는 개념도입니다.">
        <H x={67} y={61} width={37} weight={4} />
        <H x={181} y={61} width={37} weight={8} />
        <H x={295} y={61} width={37} weight={13} />
        <path d="M68 144H332" stroke={green} />
        <circle cx="68" cy="144" r="4" fill={green} />
        <circle cx="200" cy="144" r="4" fill={green} />
        <circle cx="332" cy="144" r="4" fill={green} />
        <text x="68" y="176" textAnchor="middle">
          400
        </text>
        <text x="200" y="176" textAnchor="middle">
          550
        </text>
        <text x="332" y="176" textAnchor="middle">
          700
        </text>
        <text x="200" y="213" textAnchor="middle" fill={green}>
          wght · 값과 형태는 개념 예시
        </text>
      </Diagram>
    );
  return (
    <Diagram label="같은 크기로 확대하여 비교한 옵티컬 사이즈 도식입니다. 작은 글자용 형태는 획과 속공간을 조정하며, 단순한 확대 축소와 다릅니다.">
      <path
        d="M139 111H65c-4 -60 83 -66 83 -7m-83 7c-1 50 60 59 80 25"
        stroke={ink}
        strokeWidth="9"
        fill="none"
      />
      <path
        d="M326 109H251c-2 -64 78 -60 79 0m-79 0c-3 58 62 57 77 22"
        stroke={ink}
        strokeWidth="3"
        fill="none"
      />
      <text x="105" y="191" textAnchor="middle" fontSize="16">
        작은 글자용
      </text>
      <text x="289" y="191" textAnchor="middle" fontSize="16">
        큰 글자용
      </text>
      <text x="200" y="220" textAnchor="middle" fontSize="14" fill={green}>
        동일 크기 확대 개념도 · 변화는 서체마다 다름
      </text>
    </Diagram>
  );
}

function ColorConcept({ termId }: { termId: string }) {
  const hue = termId === "hue";
  const saturation = termId === "saturation";
  const values = hue ? [60, 180, 300] : saturation ? [0, 40, 80] : [25, 50, 75];
  const fixed = hue
    ? "S 50% · L 50% 고정"
    : saturation
      ? "H 170° · L 45% 고정"
      : "H 170° · S 40% 고정";
  return (
    <Diagram
      label={`${hue ? "색상" : saturation ? "채도" : "명도"}만 바꾸고 나머지 HSL 두 좌표는 고정한 색 견본입니다. ${fixed}.`}
    >
      {values.map((v, i) => (
        <g key={v}>
          <rect
            x={40 + i * 113}
            y="39"
            width="94"
            height="97"
            rx="2"
            fill={
              hue ? `hsl(${v} 50% 50%)` : saturation ? `hsl(170 ${v}% 45%)` : `hsl(170 40% ${v}%)`
            }
            stroke="#d9dedb"
          />
          <text x={87 + i * 113} y="164" textAnchor="middle">
            {hue ? `H ${v}°` : `${saturation ? "S" : "L"} ${v}%`}
          </text>
        </g>
      ))}
      <text x="200" y="197" textAnchor="middle" fill={green}>
        {fixed}
      </text>
      <text x="200" y="222" textAnchor="middle" fontSize="13">
        HSL 수치 변화 · 지각적 차이가 균일한 척도는 아님
      </text>
    </Diagram>
  );
}

const compositionTerms = new Set([
  "alignment",
  "contrast",
  "rhythm",
  "repetition",
  "figure-ground",
  "closure",
  "good-continuation",
  "symmetry",
  "visual-tension",
]);
const anatomyTerms = new Set([
  "baseline",
  "x-height",
  "cap-height",
  "ascender",
  "descender",
  "counter",
]);
const typographyTerms = new Set([
  "typographic-scale",
  "baseline-grid",
  "kerning",
  "tracking",
  "leading",
  "line-length",
  "rag",
  "widows-orphans",
  "ligature",
  "variable-font",
  "weight-axis",
  "optical-size",
]);

export function VisualConcept({ termId }: { termId: string }) {
  let content: ReactNode;
  if (compositionTerms.has(termId)) content = <Composition termId={termId} />;
  else if (anatomyTerms.has(termId)) content = <Anatomy termId={termId} />;
  else if (typographyTerms.has(termId)) content = <Typography termId={termId} />;
  else if (["hue", "saturation", "lightness"].includes(termId))
    content = <ColorConcept termId={termId} />;
  else return null;
  return <div className="xe-vconcept">{content}</div>;
}
