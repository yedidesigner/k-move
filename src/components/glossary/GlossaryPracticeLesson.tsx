import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, RotateCcw } from "lucide-react";
import type { GlossaryEntry } from "@/data/glossary";
import type {
  DecisionPractice,
  GlossaryPractice,
  PracticeStructure,
  SequencePractice,
  SortPractice,
  VisualPreset,
  VisualPractice,
} from "@/data/practice/types";
import "./glossary-practice.css";

function Section({
  title,
  number,
  children,
}: {
  title: string;
  number: string;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section className="gp-section" aria-labelledby={headingId}>
      <h3 id={headingId}>
        <span aria-hidden="true">{number}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function DiagramText({
  x,
  y,
  children,
  size = 16,
  anchor = "start",
  strong = false,
  accent = false,
}: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  anchor?: "start" | "middle" | "end";
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      fontWeight={strong ? 650 : 400}
      className={accent ? "gp-diagram-accent-text" : "gp-diagram-text"}
    >
      {children}
    </text>
  );
}

function DiagramLines({
  x,
  y,
  width = 80,
  gap = 13,
  count = 3,
}: {
  x: number;
  y: number;
  width?: number;
  gap?: number;
  count?: number;
}) {
  return (
    <g className="gp-diagram-copy" strokeWidth={4}>
      {Array.from({ length: count }, (_, index) => (
        <path
          key={index}
          d={`M${x} ${y + index * gap}h${index === count - 1 ? width * 0.7 : width}`}
        />
      ))}
    </g>
  );
}

function DiagramImage({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  return (
    <svg x={x} y={y} width={width} height={height} viewBox="0 0 120 80" preserveAspectRatio="none">
      <rect width={120} height={80} fill="#e8ece9" />
      <circle cx={92} cy={22} r={10} fill="#b9c5bf" />
      <path d="M0 80V60L34 26L83 80Z" fill="#a1afa7" />
      <path d="M38 80L83 39L120 65V80Z" fill="#73867b" />
    </svg>
  );
}

function DiagramArrow({ x, y }: { x: number; y: number }) {
  return <path className="gp-diagram-arrow" d={`M${x} ${y}h28m-7 -6 7 6-7 6`} />;
}

const diagramDescriptions: Record<VisualPreset, string> = {
  spacing:
    "배송받는 사람 라벨과 입력칸이 가까이 놓이고, 배송 주소 그룹과는 더 넓은 간격으로 떨어져 있습니다.",
  typography:
    "같은 문장의 글자 크기를 작게 또는 크게 표현하고, 글줄 사이 간격도 좁게 또는 넓게 비교합니다.",
  contrast:
    "같은 흰 배경 위에 같은 크기의 연한 회색 글자와 짙은 글자를 나란히 놓아 대비 차이를 보여 줍니다.",
  hierarchy:
    "전시 제목을 크게, 일정을 중간 크기로, 설명을 작게 표현해 정보 사이의 시각적 중요도를 구분합니다.",
  balance: "같은 폭의 구성 안에서 이미지와 텍스트가 차지하는 면적을 25 대 75, 75 대 25로 바꿉니다.",
  responsive: "같은 세 항목이 좁은 화면에서는 한 열, 넓은 화면에서는 세 열로 재배치됩니다.",
  decoration:
    "같은 두 텍스트 줄을 효과 없음, 가장자리의 테두리, 내부 채우기, 바깥 그림자로 표현합니다.",
  fidelity:
    "같은 화면 구조를 단순한 이미지 자리와 제목으로 표현한 뒤 구체적인 그림과 실제 문구로 비교합니다.",
  navigation:
    "소개 메뉴가 선택되어 있고 홈에서 소개로 이어지는 경로와 스튜디오 소개 본문이 같은 현재 위치를 나타냅니다.",
  motion:
    "동일한 화면의 패널이 닫힌 상태와 열린 상태를 나란히 보여 주고, 화살표로 시간에 따른 전환을 나타냅니다.",
  focus:
    "이름 입력칸에 눈에 보이는 포커스 테두리가 있습니다. Tab 키를 누르면 관심 분야 선택, 확인 버튼으로 이동합니다.",
  alttext: "산과 해가 있는 그림과 그 그림의 의미를 설명하는 대체 텍스트가 화살표로 연결됩니다.",
  form: "프로젝트 이름 라벨 아래 입력칸이 있고, 잘못된 입력을 고치도록 두 글자 이상이라는 안내가 바로 아래 연결됩니다.",
  cards:
    "각각의 카드 안에 이미지, 제목, 설명이 함께 들어갑니다. 같은 구조의 카드 세 개가 반복됩니다.",
  grid: "세 개의 동일한 너비 컬럼 위에 요소가 정렬되어 있고, 컬럼 사이 빈 간격인 거터가 표시됩니다.",
  scale:
    "같은 이미지와 제목을 작게 또는 크게 표현합니다. 본문 크기는 유지해 상대적인 크기 차이를 비교합니다.",
};

export function VisualConceptDiagram({ preset }: { preset: VisualPreset }) {
  const titleId = useId();
  const descriptionId = useId();
  let drawing: ReactNode;
  switch (preset) {
    case "spacing":
      drawing = (
        <>
          <DiagramText x={24} y={35} strong>
            배송받는 사람
          </DiagramText>
          <rect className="gp-diagram-box" x={24} y={45} width={210} height={33} />
          <DiagramText x={37} y={67}>
            김디자인
          </DiagramText>
          <path className="gp-diagram-guide" d="M245 31h8v14h-8" />
          <DiagramText x={270} y={47} accent>
            가까이
          </DiagramText>
          <path className="gp-diagram-guide" d="M245 86h8v48h-8" />
          <DiagramText x={270} y={104} accent>
            그룹
          </DiagramText>
          <DiagramText x={270} y={125} accent>
            간격
          </DiagramText>
          <DiagramText x={24} y={153} strong>
            배송 주소
          </DiagramText>
          <rect className="gp-diagram-box" x={24} y={163} width={210} height={33} />
          <DiagramText x={37} y={185}>
            서울시 예시로 12
          </DiagramText>
          <DiagramText x={24} y={229} size={15}>
            같은 그룹 안은 가깝게
          </DiagramText>
        </>
      );
      break;
    case "typography":
      drawing = (
        <>
          <DiagramText x={20} y={25} strong>
            글자 크기
          </DiagramText>
          <DiagramText x={24} y={76} size={14}>
            같은 문장
          </DiagramText>
          <DiagramText x={190} y={76} size={28}>
            같은 문장
          </DiagramText>
          <DiagramText x={24} y={105} size={15} accent>
            14px
          </DiagramText>
          <DiagramText x={190} y={105} size={15} accent>
            28px
          </DiagramText>
          <path className="gp-diagram-divider" d="M20 122h320" />
          <DiagramText x={20} y={151} strong>
            줄 간격
          </DiagramText>
          <DiagramLines x={24} y={175} width={120} gap={12} />
          <DiagramLines x={190} y={175} width={120} gap={24} />
          <path className="gp-diagram-guide" d="M323 175h8v24h-8" />
        </>
      );
      break;
    case "contrast":
      drawing = (
        <>
          <DiagramText x={180} y={28} anchor="middle" strong>
            같은 배경 · 같은 크기
          </DiagramText>
          <rect className="gp-diagram-box" x={18} y={49} width={152} height={135} />
          <rect className="gp-diagram-box" x={190} y={49} width={152} height={135} />
          <text x={94} y={103} fontSize={32} fill="#b4b4b4" textAnchor="middle">
            Aa
          </text>
          <text x={94} y={146} fontSize={24} fill="#b4b4b4" textAnchor="middle">
            본문
          </text>
          <text x={266} y={103} fontSize={32} fill="#1e1e1e" textAnchor="middle">
            Aa
          </text>
          <text x={266} y={146} fontSize={24} fill="#1e1e1e" textAnchor="middle">
            본문
          </text>
          <DiagramText x={94} y={218} anchor="middle">
            낮은 대비
          </DiagramText>
          <DiagramText x={266} y={218} anchor="middle" accent>
            높은 대비
          </DiagramText>
        </>
      );
      break;
    case "hierarchy":
      drawing = (
        <>
          <rect className="gp-diagram-box" x={20} y={20} width={320} height={200} />
          <DiagramText x={40} y={69} size={30} strong>
            디자인 전시
          </DiagramText>
          <DiagramText x={40} y={111} size={20} strong>
            10월 24일
          </DiagramText>
          <DiagramText x={40} y={153} size={15}>
            작은 관찰에서 시작한
          </DiagramText>
          <DiagramText x={40} y={177} size={15}>
            디자인 이야기를 만납니다.
          </DiagramText>
          <DiagramText x={312} y={66} anchor="end" accent>
            제목
          </DiagramText>
          <DiagramText x={312} y={108} anchor="end" accent>
            일정
          </DiagramText>
          <DiagramText x={312} y={153} anchor="end" accent>
            본문
          </DiagramText>
        </>
      );
      break;
    case "balance":
      drawing = (
        <>
          <DiagramText x={93} y={29} anchor="middle" strong>
            이미지 25%
          </DiagramText>
          <DiagramText x={267} y={29} anchor="middle" strong>
            이미지 75%
          </DiagramText>
          <rect className="gp-diagram-box" x={18} y={50} width={150} height={132} />
          <rect x={18} y={50} width={37.5} height={132} fill="#a1afa7" />
          <DiagramLines x={69} y={81} width={84} gap={17} count={4} />
          <rect className="gp-diagram-box" x={192} y={50} width={150} height={132} />
          <rect x={192} y={50} width={112.5} height={132} fill="#a1afa7" />
          <DiagramLines x={313} y={81} width={21} gap={17} count={4} />
          <DiagramText x={180} y={218} anchor="middle">
            같은 폭, 다른 면적 비율
          </DiagramText>
        </>
      );
      break;
    case "responsive":
      drawing = (
        <>
          <DiagramText x={72} y={28} anchor="middle" strong>
            좁은 화면
          </DiagramText>
          <DiagramText x={255} y={28} anchor="middle" strong>
            넓은 화면
          </DiagramText>
          <rect className="gp-diagram-box" x={18} y={44} width={108} height={154} />
          <rect className="gp-diagram-box" x={168} y={44} width={174} height={154} />
          {[0, 1, 2].map((index) => (
            <g key={index}>
              <rect className="gp-diagram-tint" x={30} y={58 + index * 43} width={84} height={34} />
              <DiagramText x={72} y={81 + index * 43} anchor="middle">
                0{index + 1}
              </DiagramText>
              <rect
                className="gp-diagram-tint"
                x={178 + index * 54}
                y={58}
                width={46}
                height={120}
              />
              <DiagramText x={201 + index * 54} y={126} anchor="middle">
                0{index + 1}
              </DiagramText>
            </g>
          ))}
          <DiagramArrow x={133} y={120} />
          <DiagramText x={72} y={228} anchor="middle" accent>
            1열
          </DiagramText>
          <DiagramText x={255} y={228} anchor="middle" accent>
            3열
          </DiagramText>
        </>
      );
      break;
    case "decoration":
      drawing = (
        <>
          <DiagramText x={24} y={26} strong>
            없음
          </DiagramText>
          <DiagramText x={196} y={26} strong>
            테두리
          </DiagramText>
          <DiagramText x={24} y={137} strong>
            채우기
          </DiagramText>
          <DiagramText x={196} y={137} strong>
            그림자
          </DiagramText>
          <DiagramLines x={38} y={59} width={103} count={2} />
          <rect className="gp-diagram-box" x={196} y={39} width={140} height={57} />
          <DiagramLines x={210} y={59} width={103} count={2} />
          <rect className="gp-diagram-tint" x={24} y={150} width={140} height={57} />
          <DiagramLines x={38} y={170} width={103} count={2} />
          <rect x={202} y={156} width={140} height={57} fill="#c2cbc6" />
          <rect x={196} y={150} width={140} height={57} fill="#fff" />
          <DiagramLines x={210} y={170} width={103} count={2} />
        </>
      );
      break;
    case "fidelity":
      drawing = (
        <>
          <DiagramText x={88} y={28} anchor="middle" strong>
            로파이
          </DiagramText>
          <DiagramText x={272} y={28} anchor="middle" strong>
            하이파이
          </DiagramText>
          <rect className="gp-diagram-box" x={18} y={45} width={140} height={166} />
          <rect className="gp-diagram-box" x={202} y={45} width={140} height={166} />
          <DiagramText x={32} y={73}>
            제목
          </DiagramText>
          <DiagramText x={216} y={73} strong>
            관찰 노트
          </DiagramText>
          <rect className="gp-diagram-placeholder" x={32} y={86} width={112} height={74} />
          <path className="gp-diagram-divider" d="m32 86 112 74m0-74L32 160" />
          <DiagramImage x={216} y={86} width={112} height={74} />
          <DiagramLines x={32} y={180} width={100} count={2} />
          <DiagramLines x={216} y={180} width={100} count={2} />
          <DiagramArrow x={166} y={127} />
        </>
      );
      break;
    case "navigation":
      drawing = (
        <>
          <rect className="gp-diagram-box" x={18} y={20} width={324} height={190} />
          <path className="gp-diagram-divider" d="M18 70h324" />
          <DiagramText x={33} y={51} size={14} strong>
            STUDIO.
          </DiagramText>
          <DiagramText x={170} y={51} anchor="middle">
            작업
          </DiagramText>
          <rect className="gp-diagram-tint" x={208} y={32} width={48} height={29} />
          <DiagramText x={232} y={51} anchor="middle" strong accent>
            소개
          </DiagramText>
          <DiagramText x={298} y={51} anchor="middle">
            문의
          </DiagramText>
          <DiagramText x={37} y={101} accent>
            홈 / 소개
          </DiagramText>
          <DiagramText x={37} y={144} size={24} strong>
            스튜디오 소개
          </DiagramText>
          <DiagramLines x={37} y={170} width={218} count={2} />
          <DiagramText x={180} y={235} anchor="middle" size={15}>
            선택한 메뉴 → 현재 화면
          </DiagramText>
        </>
      );
      break;
    case "motion":
      drawing = (
        <>
          <DiagramText x={84} y={40} anchor="middle" strong>
            닫힌 상태
          </DiagramText>
          <DiagramText x={276} y={40} anchor="middle" strong>
            열린 상태
          </DiagramText>
          <rect className="gp-diagram-box" x={18} y={64} width={132} height={116} />
          <DiagramLines x={33} y={88} width={98} gap={19} count={4} />
          <rect className="gp-diagram-box" x={210} y={64} width={132} height={116} />
          <DiagramLines x={225} y={88} width={98} gap={19} count={4} />
          <rect className="gp-diagram-selected" x={256} y={64} width={86} height={116} />
          <DiagramText x={299} y={129} anchor="middle" size={15} accent>
            패널
          </DiagramText>
          <DiagramArrow x={166} y={123} />
          <DiagramText x={180} y={220} anchor="middle">
            시간에 따른 상태 변화
          </DiagramText>
        </>
      );
      break;
    case "focus":
      drawing = (
        <>
          <DiagramText x={28} y={25} strong>
            이름
          </DiagramText>
          <rect className="gp-diagram-focus" x={22} y={34} width={204} height={50} />
          <rect className="gp-diagram-box" x={28} y={40} width={192} height={38} />
          <path className="gp-diagram-guide" d="M42 50v18" />
          <DiagramText x={28} y={111} strong>
            관심 분야
          </DiagramText>
          <rect className="gp-diagram-box" x={28} y={122} width={192} height={38} />
          <DiagramText x={40} y={148}>
            UI 디자인
          </DiagramText>
          <path className="gp-diagram-divider" d="m193 138 6 6 6-6" />
          <rect className="gp-diagram-selected" x={28} y={191} width={112} height={36} />
          <DiagramText x={84} y={215} anchor="middle" strong>
            확인
          </DiagramText>
          {[59, 141, 209].map((y, index) => (
            <g key={y}>
              <circle className="gp-diagram-tint" cx={273} cy={y} r={15} />
              <DiagramText x={273} y={y + 6} anchor="middle" strong accent>
                {index + 1}
              </DiagramText>
            </g>
          ))}
          <path className="gp-diagram-arrow" d="M273 80v41m-6-7 6 7 6-7M273 162v28m-6-7 6 7 6-7" />
          <DiagramText x={295} y={106} size={15}>
            Tab
          </DiagramText>
          <DiagramText x={295} y={183} size={15}>
            Tab
          </DiagramText>
        </>
      );
      break;
    case "alttext":
      drawing = (
        <>
          <DiagramText x={180} y={29} anchor="middle" strong>
            그림의 목적을 설명
          </DiagramText>
          <DiagramImage x={20} y={59} width={130} height={113} />
          <DiagramArrow x={166} y={116} />
          <rect className="gp-diagram-selected" x={210} y={59} width={130} height={113} />
          <DiagramText x={275} y={109} anchor="middle">
            산과 해가
          </DiagramText>
          <DiagramText x={275} y={134} anchor="middle">
            있는 풍경
          </DiagramText>
          <DiagramText x={85} y={211} anchor="middle">
            그림
          </DiagramText>
          <DiagramText x={275} y={211} anchor="middle" accent>
            대체 텍스트
          </DiagramText>
        </>
      );
      break;
    case "form":
      drawing = (
        <>
          <DiagramText x={28} y={34} strong>
            프로젝트 이름
          </DiagramText>
          <rect className="gp-diagram-box" x={28} y={47} width={304} height={42} />
          <DiagramText x={42} y={75}>
            A
          </DiagramText>
          <path className="gp-diagram-guide" d="M28 99v24h12" />
          <DiagramText x={52} y={126} accent>
            2자 이상 입력해 주세요
          </DiagramText>
          <rect className="gp-diagram-selected" x={28} y={153} width={155} height={42} />
          <DiagramText x={105.5} y={181} anchor="middle" strong>
            샘플 만들기
          </DiagramText>
          <DiagramText x={28} y={229} size={15}>
            입력 → 확인 → 수정
          </DiagramText>
        </>
      );
      break;
    case "cards":
      drawing = (
        <>
          <DiagramText x={180} y={29} anchor="middle" strong>
            한 주제의 정보를 한 단위로
          </DiagramText>
          {[18, 132, 246].map((x, index) => (
            <g key={x}>
              <rect
                className={index === 0 ? "gp-diagram-selected" : "gp-diagram-box"}
                x={x}
                y={52}
                width={96}
                height={154}
              />
              <rect className="gp-diagram-placeholder" x={x + 8} y={60} width={80} height={62} />
              <DiagramText x={x + 48} y={99} size={15} anchor="middle">
                이미지
              </DiagramText>
              <DiagramText x={x + 12} y={151} strong>
                제목
              </DiagramText>
              <DiagramLines x={x + 12} y={175} width={69} count={2} />
            </g>
          ))}
        </>
      );
      break;
    case "grid":
      drawing = (
        <>
          {[22, 132, 242].map((x) => (
            <g key={x}>
              <DiagramText x={x + 48} y={26} anchor="middle" strong>
                컬럼
              </DiagramText>
              <rect className="gp-diagram-column" x={x} y={39} width={96} height={157} />
              <rect className="gp-diagram-box" x={x} y={54} width={96} height={55} />
              <rect className="gp-diagram-box" x={x} y={128} width={96} height={55} />
            </g>
          ))}
          <path className="gp-diagram-guide" d="M118 202v10h14v-10m-7 10v17h30" />
          <DiagramText x={165} y={234} accent>
            거터: 컬럼 사이 간격
          </DiagramText>
        </>
      );
      break;
    case "scale":
      drawing = (
        <>
          <DiagramText x={78} y={27} anchor="middle" strong>
            작은 비중
          </DiagramText>
          <DiagramText x={275} y={27} anchor="middle" strong>
            큰 비중
          </DiagramText>
          <DiagramImage x={43} y={91} width={70} height={47} />
          <DiagramImage x={210} y={51} width={130} height={87} />
          <DiagramText x={78} y={168} size={15} anchor="middle" strong>
            관찰 노트
          </DiagramText>
          <DiagramText x={275} y={168} size={24} anchor="middle" strong>
            관찰 노트
          </DiagramText>
          <DiagramLines x={38} y={192} width={80} count={2} />
          <DiagramLines x={235} y={192} width={80} count={2} />
          <DiagramArrow x={166} y={112} />
        </>
      );
      break;
  }
  return (
    <div className="gp-concept-diagram">
      <svg
        viewBox="0 0 360 240"
        width={360}
        height={240}
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
      >
        <title id={titleId}>단순화한 핵심 구조</title>
        <desc id={descriptionId}>{diagramDescriptions[preset]}</desc>
        {drawing}
      </svg>
    </div>
  );
}

function ConceptStructure({
  structure,
  preset,
}: {
  structure: PracticeStructure;
  preset?: VisualPreset | undefined;
}) {
  const List = structure.type === "flow" ? "ol" : "ul";
  return (
    <figure
      className={`gp-structure gp-structure-${structure.type}${preset ? " gp-structure-visual" : ""}`}
    >
      {preset && <VisualConceptDiagram preset={preset} />}
      <List aria-label="개념의 핵심 관계">
        {structure.labels.map((label, index) => (
          <li key={`${index}-${label}`}>
            {structure.type === "flow" && (
              <span className="gp-structure-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
            )}
            <span>{label}</span>
          </li>
        ))}
      </List>
      <figcaption>{structure.caption}</figcaption>
    </figure>
  );
}

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="gp-reset" onClick={onClick}>
      <RotateCcw size={15} aria-hidden />
      처음부터 해보기
    </button>
  );
}

function DecisionExercise({ practice }: { practice: DecisionPractice }) {
  const [selected, setSelected] = useState<number | null>(null);
  const option = selected === null ? null : practice.options[selected];
  return (
    <div className="gp-exercise">
      <div className="gp-choices" role="group" aria-label="상황에 맞는 선택">
        {practice.options.map((item, index) => (
          <button
            type="button"
            key={item.label}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            <span className="gp-option-index" aria-hidden>
              {String.fromCharCode(65 + index)}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <div className="gp-feedback" role="status" aria-live="polite" data-correct={option?.correct}>
        {option ? (
          <>
            <strong>
              {option.correct ? "이 상황에 적합한 선택이에요." : "이 선택의 결과를 살펴보세요."}
            </strong>
            <p>{option.feedback}</p>
          </>
        ) : (
          <p>선택하면 이 상황에서의 결과와 이유를 확인할 수 있어요.</p>
        )}
      </div>
      <ResetButton onClick={() => setSelected(null)} />
    </div>
  );
}

function SortExercise({ practice }: { practice: SortPractice }) {
  const [answers, setAnswers] = useState<number[]>(() => practice.items.map(() => -1));
  const [checked, setChecked] = useState(false);
  const complete = answers.every((answer) => answer >= 0);
  const correct = answers.filter(
    (answer, index) => answer === practice.items[index]?.category,
  ).length;
  return (
    <div className="gp-exercise">
      <div className="gp-sort-items">
        {practice.items.map((item, index) => (
          <div className="gp-sort-item" key={`${index}-${item.label}`}>
            <label>
              <span>{item.label}</span>
              <select
                aria-label={`${item.label} 분류`}
                value={answers[index]}
                onChange={(event) => {
                  setAnswers((current) =>
                    current.map((value, i) => (i === index ? Number(event.target.value) : value)),
                  );
                  setChecked(false);
                }}
              >
                <option value={-1}>분류를 선택하세요</option>
                {practice.categories.map((category, i) => (
                  <option key={category} value={i}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            {checked && (
              <p className="gp-item-feedback">
                <strong>
                  {answers[index] === item.category
                    ? "맞게 분류했어요. "
                    : `이 항목은 ‘${practice.categories[item.category]}’에 해당해요. `}
                </strong>
                {item.explanation}
              </p>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="gp-primary"
        disabled={!complete}
        onClick={() => setChecked(true)}
      >
        분류 확인하기
      </button>
      <p className="gp-feedback" role="status" aria-live="polite">
        {checked
          ? `${practice.items.length}개 중 ${correct}개를 이 상황에 맞게 분류했어요. 각 항목의 이유를 확인해 보세요.`
          : "모든 항목의 분류를 선택한 뒤 확인해 보세요."}
      </p>
      <ResetButton
        onClick={() => {
          setAnswers(practice.items.map(() => -1));
          setChecked(false);
        }}
      />
    </div>
  );
}

function shuffledSteps(length: number) {
  return Array.from({ length }, (_, index) => (index + 1) % length);
}

function SequenceExercise({ practice }: { practice: SequencePractice }) {
  const [order, setOrder] = useState<number[]>(() => shuffledSteps(practice.steps.length));
  const [checked, setChecked] = useState(false);
  const correct = order.every((value, index) => value === index);
  function move(index: number, offset: number) {
    const next = index + offset;
    if (next < 0 || next >= order.length) return;
    setOrder((current) => {
      const result = [...current];
      const source = result[index];
      const target = result[next];
      if (source === undefined || target === undefined) return current;
      result[index] = target;
      result[next] = source;
      return result;
    });
    setChecked(false);
  }
  return (
    <div className="gp-exercise">
      <ol className="gp-sequence" aria-label="단계 순서">
        {order.map((stepIndex, index) => {
          const step = practice.steps[stepIndex];
          if (!step) return null;
          return (
            <li key={stepIndex}>
              <span className="gp-step-number">{index + 1}</span>
              <span className="gp-step-label">{step.label}</span>
              <span className="gp-step-controls">
                <button
                  type="button"
                  disabled={index === 0}
                  aria-label={`${step.label} 위로 이동`}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={index === order.length - 1}
                  aria-label={`${step.label} 아래로 이동`}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown size={18} aria-hidden />
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      <button type="button" className="gp-primary" onClick={() => setChecked(true)}>
        순서 확인하기
      </button>
      <div className="gp-feedback" role="status" aria-live="polite">
        {checked ? (
          <>
            <strong>
              {correct
                ? "이 상황의 흐름에 맞게 정리했어요."
                : "단계 사이의 관계를 다시 살펴보세요."}
            </strong>
            <ol className="gp-answer-steps">
              {practice.steps.map((step) => (
                <li key={step.label}>
                  <strong>{step.label}</strong>
                  <span>{step.explanation}</span>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p>위·아래 버튼으로 단계를 옮겨 보세요. 순서는 이 연습 상황을 기준으로 확인합니다.</p>
        )}
      </div>
      <ResetButton
        onClick={() => {
          setOrder(shuffledSteps(practice.steps.length));
          setChecked(false);
        }}
      />
    </div>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="gp-range">
      <span>
        {label}
        <output>
          {value}
          {unit}
        </output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function Landscape({ label }: { label?: string | undefined }) {
  return (
    <svg
      className="gp-landscape"
      viewBox="0 0 240 140"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={!label}
    >
      <rect width="240" height="140" fill="#e7f0ed" />
      <circle cx="177" cy="38" r="17" fill="#c4d8ce" />
      <path d="M0 140V103L62 54L139 140Z" fill="#6f9182" />
      <path d="M70 140L158 67L240 122V140Z" fill="#35594c" />
    </svg>
  );
}

function ContentCards({
  columns = 3,
  wireframe = false,
}: {
  columns?: number;
  wireframe?: boolean;
}) {
  return (
    <div
      className={`gp-content-cards ${wireframe ? "gp-wireframe" : ""}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {["공간을 관찰하다", "일상의 색", "작은 발견"].map((title, index) => (
        <article className="gp-sample-card" key={title}>
          {wireframe ? (
            <div className="gp-image-placeholder" aria-label="이미지 영역">
              이미지
            </div>
          ) : (
            <Landscape />
          )}
          <span className="gp-card-caption">STORY 0{index + 1}</span>
          <strong>{title}</strong>
          <p>관찰에서 시작한 디자인 이야기.</p>
        </article>
      ))}
    </div>
  );
}

/** WCAG relative luminance for an sRGB grayscale value, against white. */
export function grayOnWhiteContrast(gray: number) {
  const channel = Math.min(255, Math.max(0, gray)) / 255;
  const luminance = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  return 1.05 / (luminance + 0.05);
}

function VisualExercise({ practice }: { practice: VisualPractice }) {
  const [comparison, setComparison] = useState<number | null>(0);
  const [value, setRawValue] = useState(0);
  const [secondaryValue, setRawSecondaryValue] = useState(0);
  const [nav, setNav] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focusName, setFocusName] = useState("");
  const fieldId = useId();
  function setValue(next: number) {
    setRawValue(next);
    setComparison(null);
  }
  function setSecondaryValue(next: number) {
    setRawSecondaryValue(next);
    setComparison(null);
  }
  function compare(mode: number) {
    setComparison(mode);
    setRawValue(mode);
    setRawSecondaryValue(mode);
    setPanelOpen(false);
    setNav(0);
    setText(
      practice.preset === "alttext" && mode === 1 ? "두 산 능선 위로 둥근 해가 떠 있는 풍경" : "",
    );
    setSubmitted(false);
    setFocusName("");
  }
  const active = value >= 0.5;
  let controls: ReactNode;
  let sample: ReactNode;
  let live: ReactNode;
  switch (practice.preset) {
    case "spacing": {
      const gap = Math.round(4 + value * 36);
      controls = (
        <RangeControl
          label="그룹 사이 간격"
          value={gap}
          min={4}
          max={40}
          unit="px"
          onChange={(v) => setValue((v - 4) / 36)}
        />
      );
      sample = (
        <div className="gp-spacing-sample" style={{ gap }}>
          {["배송받는 사람", "배송 주소"].map((label) => (
            <div className="gp-field-group" key={label}>
              <strong>{label}</strong>
              <div className="gp-fake-input">
                {label === "배송 주소" ? "서울시 예시로 12" : "김디자인"}
              </div>
              <small>
                {label === "배송 주소"
                  ? "상세 주소까지 확인해 주세요."
                  : "받는 사람의 이름을 확인해 주세요."}
              </small>
            </div>
          ))}
        </div>
      );
      live = `각 라벨과 입력 영역의 거리는 유지하고, 그룹 사이만 ${gap}px로 바꾸었습니다.`;
      break;
    }
    case "typography": {
      const size = Math.round(14 + value * 14);
      const lineHeight = Number((1.2 + secondaryValue * 0.8).toFixed(1));
      controls = (
        <>
          <RangeControl
            label="본문 글자 크기"
            value={size}
            min={14}
            max={28}
            unit="px"
            onChange={(v) => setValue((v - 14) / 14)}
          />
          <RangeControl
            label="줄 간격 배수"
            value={lineHeight}
            min={1.2}
            max={2}
            step={0.1}
            onChange={(v) => setSecondaryValue((v - 1.2) / 0.8)}
          />
        </>
      );
      sample = (
        <div className="gp-reading-sample">
          <span className="gp-eyebrow">STUDIO JOURNAL</span>
          <h4>작은 관찰이 디자인을 바꿉니다.</h4>
          <p style={{ fontSize: size, lineHeight }}>
            같은 문장도 글자 크기와 줄 간격에 따라 읽는 느낌이 달라집니다. 화면을 처음 보는 사람이
            내용의 흐름을 따라갈 수 있는지 살펴보세요. 글이 커질 때 주변 영역도 함께 늘어나야
            합니다.
          </p>
        </div>
      );
      live = `본문 ${size}px · 줄 간격 ${lineHeight}배. 글자가 커지면 줄바꿈과 필요한 높이도 달라집니다.`;
      break;
    }
    case "contrast": {
      const gray = Math.round(180 - value * 150);
      const ratio = grayOnWhiteContrast(gray);
      controls = (
        <RangeControl
          label="글자 어둡기"
          value={Math.round(value * 100)}
          min={0}
          max={100}
          unit="%"
          onChange={(v) => setValue(v / 100)}
        />
      );
      sample = (
        <div className="gp-contrast-sample" style={{ color: `rgb(${gray}, ${gray}, ${gray})` }}>
          <strong>다음 수업의 준비물을 확인해 주세요.</strong>
          <p>흰 배경 위의 일반 크기 본문입니다. 글자가 배경과 얼마나 구분되는지 관찰해 보세요.</p>
        </div>
      );
      live = (
        <>
          <strong>명도 대비 {ratio.toFixed(2)}:1</strong>
          <span>
            {ratio >= 4.5
              ? "이 예시의 일반 본문은 WCAG AA 최소 대비 4.5:1을 충족합니다."
              : "이 예시의 일반 본문은 WCAG AA 최소 대비 4.5:1에 미달합니다."}
          </span>
          <small>
            대비 한 가지 기준에 대한 결과입니다. 전체 접근성 판정은 아닙니다.{" "}
            <a
              href="https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html"
              target="_blank"
              rel="noreferrer"
            >
              기준 확인
            </a>
          </small>
        </>
      );
      break;
    }
    case "hierarchy":
      sample = (
        <div className={`gp-reading-sample gp-hierarchy ${active ? "is-structured" : ""}`}>
          <span>STUDIO OPEN DAY</span>
          <h4>작업의 시작을 만나다</h4>
          <p className="gp-event-date">11월 15일 · 오후 2시</p>
          <p>프로젝트의 초안부터 완성까지 살펴보는 작은 전시입니다.</p>
          <span className="gp-static-button">전시 안내</span>
        </div>
      );
      controls = (
        <button
          className="gp-secondary"
          type="button"
          aria-pressed={active}
          onClick={() => setValue(active ? 0 : 1)}
        >
          크기와 굵기 차이 {active ? "줄이기" : "주기"}
        </button>
      );
      live = active
        ? "제목, 일정, 설명에 서로 다른 시각적 비중을 적용했습니다."
        : "제목, 일정, 설명의 크기와 굵기가 비슷한 상태입니다.";
      break;
    case "balance": {
      const percent = Math.round(25 + value * 50);
      controls = (
        <RangeControl
          label="이미지 영역 비율"
          value={percent}
          min={25}
          max={75}
          unit="%"
          onChange={(v) => setValue((v - 25) / 50)}
        />
      );
      sample = (
        <div className="gp-balance-sample">
          <div style={{ flexBasis: `${percent}%` }}>
            <Landscape />
          </div>
          <div style={{ flexBasis: `${100 - percent}%` }}>
            <strong>
              Quiet
              <br />
              moments.
            </strong>
            <p>서로 다른 요소의 시각적 무게를 비교해 보세요.</p>
          </div>
        </div>
      );
      live = `이미지 ${percent}% · 텍스트 ${100 - percent}%. 비대칭 구성에서도 색·크기·여백의 관계에 따라 균형을 만들 수 있습니다.`;
      break;
    }
    case "responsive": {
      const width = Math.round(280 + value * 420);
      const columns = width < 420 ? 1 : width < 600 ? 2 : 3;
      controls = (
        <RangeControl
          label="예시 화면 너비"
          value={width}
          min={280}
          max={700}
          unit="px"
          onChange={(v) => setValue((v - 280) / 420)}
        />
      );
      sample = (
        <div className="gp-viewport-scroll">
          <div className="gp-responsive-sample" style={{ width }}>
            <div className="gp-sitebar">
              STUDIO.<span>이야기 · 소개</span>
            </div>
            <h4>관찰의 기록</h4>
            <ContentCards columns={columns} />
          </div>
        </div>
      );
      live = `${width}px 예시 화면에서 ${columns}열로 배치합니다. 이 연습의 전환 기준이며 모든 사이트에 정해진 기준은 아닙니다. 좁은 기기에서는 예시 영역을 가로로 살펴볼 수 있어요.`;
      break;
    }
    case "decoration": {
      const mode = Math.round(value * 3);
      controls = (
        <div className="gp-control-buttons" role="group" aria-label="영역 구분 방식">
          {["없음", "테두리", "채우기", "그림자"].map((label, i) => (
            <button
              key={label}
              type="button"
              aria-pressed={mode === i}
              onClick={() => setValue(i / 3)}
            >
              {label}
            </button>
          ))}
        </div>
      );
      sample = (
        <div className="gp-decoration-sample">
          <div className={`gp-decoration-card gp-decoration-${mode}`}>
            <span className="gp-eyebrow">ORDER SUMMARY</span>
            <strong>선택한 자료</strong>
            <p>디자인 관찰 노트 · 1개</p>
            <hr />
            <p>
              총 금액 <b>₩12,000</b>
            </p>
          </div>
          <p>주변 콘텐츠와 경계를 어떻게 구분하는지 관찰해 보세요.</p>
        </div>
      );
      live = `${["별도 시각 경계 없음", "선으로 경계 표시", "배경 채우기로 영역 표시", "그림자로 깊이와 경계 표시"][mode]}. 장식 효과 자체가 클릭 가능함을 보장하지는 않습니다.`;
      break;
    }
    case "fidelity":
      controls = (
        <button
          type="button"
          className="gp-secondary"
          aria-pressed={active}
          onClick={() => setValue(active ? 0 : 1)}
        >
          {active ? "단순한 구조로 보기" : "구체적인 표현으로 보기"}
        </button>
      );
      sample = (
        <div className={`gp-fidelity-sample ${active ? "" : "gp-wireframe"}`}>
          <div className="gp-sitebar">
            {active ? "STUDIO." : "로고"}
            <span>{active ? "프로젝트 · 소개" : "메뉴"}</span>
          </div>
          <h4>{active ? "일상에서 발견한 디자인" : "페이지 제목"}</h4>
          <ContentCards columns={2} wireframe={!active} />
        </div>
      );
      live = active
        ? "같은 정보 구조에 색상, 이미지와 실제 문구를 적용했습니다. 완성도가 높아도 실제 서비스가 구현된 것은 아닙니다."
        : "핵심 구조를 검토하기 위해 색상과 이미지의 세부 표현을 줄였습니다.";
      break;
    case "navigation": {
      const labels = ["프로젝트", "스튜디오", "문의"];
      controls = (
        <div className="gp-control-buttons" role="group" aria-label="현재 위치 표시">
          <button type="button" aria-pressed={!active} onClick={() => setValue(0)}>
            현재 위치 표시 끄기
          </button>
          <button type="button" aria-pressed={active} onClick={() => setValue(1)}>
            현재 위치 표시 켜기
          </button>
        </div>
      );
      sample = (
        <div className="gp-navigation-sample">
          <div className="gp-sitebar">STUDIO.</div>
          <nav aria-label="예시 사이트 메뉴">
            {labels.map((label, i) => (
              <button
                type="button"
                key={label}
                aria-current={active && nav === i ? "page" : undefined}
                onClick={() => setNav(i)}
              >
                {label}
              </button>
            ))}
          </nav>
          {active && <p className="gp-breadcrumb">홈 / {labels[nav]}</p>}
          <div className="gp-nav-page">
            <span className="gp-eyebrow">{["OUR WORK", "ABOUT US", "CONTACT"][nav]}</span>
            <h4>{labels[nav]}</h4>
            <p>
              {
                [
                  "진행한 프로젝트와 작업 과정을 소개합니다.",
                  "관찰에서 시작하는 디자인 스튜디오입니다.",
                  "작업 문의를 위한 안내 화면입니다. 실제 전송은 하지 않습니다.",
                ][nav]
              }
            </p>
          </div>
        </div>
      );
      live = `${labels[nav]} 화면을 보고 있습니다. 메뉴를 누르면 이 예시 안에서 내용이 바뀝니다.`;
      break;
    }
    case "motion":
      controls = (
        <>
          <div className="gp-control-buttons" role="group" aria-label="전환 효과">
            <button type="button" aria-pressed={!active} onClick={() => setValue(0)}>
              즉시 전환
            </button>
            <button type="button" aria-pressed={active} onClick={() => setValue(1)}>
              부드러운 전환
            </button>
          </div>
          <button
            type="button"
            className="gp-secondary"
            aria-expanded={panelOpen}
            aria-controls={`${fieldId}-motion`}
            onClick={() => setPanelOpen((open) => !open)}
          >
            {panelOpen ? "패널 닫기" : "패널 열기"}
          </button>
        </>
      );
      sample = (
        <div className="gp-motion-stage" data-motion={active} data-open={panelOpen}>
          <div>
            <strong>STUDIO JOURNAL</strong>
            <p>패널이 나타나고 사라지는 변화를 관찰하세요.</p>
          </div>
          <div id={`${fieldId}-motion`} className="gp-motion-panel" aria-hidden={!panelOpen}>
            <strong>프로젝트 정보</strong>
            <p>상태 변화와 공간 관계를 전달하는 패널입니다.</p>
          </div>
        </div>
      );
      live = `${panelOpen ? "패널이 열린" : "패널이 닫힌"} 상태 · ${active ? "300ms 전환" : "즉시 전환"}. 기기의 움직임 줄이기 설정을 존중합니다.`;
      break;
    case "focus":
      controls = (
        <div className="gp-control-buttons" role="group" aria-label="추가 포커스 강조">
          <button type="button" aria-pressed={!active} onClick={() => setValue(0)}>
            기본 강조
          </button>
          <button type="button" aria-pressed={active} onClick={() => setValue(1)}>
            강한 강조
          </button>
        </div>
      );
      sample = (
        <div className="gp-focus-sample" data-strong={active}>
          <p>아래 이름 입력칸을 선택한 뒤 Tab 키를 눌러 이동해 보세요.</p>
          <label>
            연습용 이름
            <input
              placeholder="가상의 이름"
              value={text}
              onChange={(event) => setText(event.target.value)}
              onFocus={() => setFocusName("이름 입력칸")}
            />
          </label>
          <label>
            관심 분야
            <select
              value={nav}
              onChange={(event) => setNav(Number(event.target.value))}
              onFocus={() => setFocusName("관심 분야 선택")}
            >
              <option value={0}>UI 디자인</option>
              <option value={1}>리서치</option>
            </select>
          </label>
          <button
            type="button"
            onFocus={() => setFocusName("확인 버튼")}
            onClick={() => setFocusName("확인 버튼을 실행함")}
          >
            선택 확인
          </button>
        </div>
      );
      live = focusName
        ? `현재 연습 위치: ${focusName}. 포커스는 실제 키보드 이동 위치입니다.`
        : "입력칸 → 선택 → 확인 버튼 순서로 이동합니다. Shift+Tab으로 되돌아갈 수 있어요.";
      break;
    case "alttext":
      controls = (
        <label className="gp-text-control">
          그림에 제공할 대체 텍스트
          <textarea
            value={text}
            maxLength={180}
            placeholder="예: 두 산 능선 위로 둥근 해가 떠 있는 풍경"
            onChange={(event) => {
              setText(event.target.value);
              setComparison(null);
            }}
          />
        </label>
      );
      sample = (
        <div className="gp-alt-sample">
          <Landscape label={text.trim() || undefined} />
          <div>
            <strong>작성한 접근 가능한 이름</strong>
            <p>
              {text.trim() ||
                "아직 설명이 없습니다. 이 연습의 그림은 보조 기술에서 숨겨진 상태입니다."}
            </p>
            <small>
              입력한 문장이 실제 그림 요소의 접근 가능한 이름에 반영됩니다. 이 박스는 이름을
              확인하는 미리보기이며 스크린 리더를 흉내 낸 음성 출력은 아닙니다.
            </small>
          </div>
        </div>
      );
      live = text.trim()
        ? "설명이 추가되었습니다. 그림의 사용 목적에 필요한 정보를 전달하는지 직접 검토하세요. 정답 자동 판정은 하지 않습니다."
        : "설명을 직접 입력해 보세요. 의미 있는 그림과 장식용 그림은 서로 다르게 다뤄야 합니다.";
      break;
    case "form": {
      const valid = text.trim().length >= 2;
      controls = (
        <div className="gp-control-buttons" role="group" aria-label="입력 도움말">
          <button type="button" aria-pressed={!active} onClick={() => setValue(0)}>
            제출 후 안내
          </button>
          <button type="button" aria-pressed={active} onClick={() => setValue(1)}>
            입력 중 도움말
          </button>
        </div>
      );
      sample = (
        <form
          className="gp-form-sample"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
          noValidate
        >
          <span className="gp-eyebrow">SAMPLE PROJECT</span>
          <h4>프로젝트 만들기</h4>
          <label htmlFor={`${fieldId}-name`}>연습용 프로젝트 이름</label>
          <input
            id={`${fieldId}-name`}
            value={text}
            maxLength={40}
            placeholder="가상의 이름을 입력하세요"
            aria-invalid={submitted && !valid}
            aria-describedby={`${fieldId}-hint`}
            onChange={(event) => {
              setText(event.target.value);
              setSubmitted(false);
            }}
          />
          <p id={`${fieldId}-hint`} className="gp-field-hint">
            {submitted && !valid
              ? "이름을 2자 이상 입력해 주세요."
              : active
                ? `${text.trim().length}/2자 이상 · 이름을 입력하면 다음 단계로 진행할 수 있어요.`
                : "이 예시의 이름은 2자 이상이어야 합니다."}
          </p>
          <button type="submit" className="gp-primary">
            샘플 만들기
          </button>
          {submitted && valid && (
            <p className="gp-form-success" role="status">
              <Check size={18} aria-hidden />‘{text.trim()}’ 샘플이 준비됐어요.
            </p>
          )}
          <small>실제 프로젝트를 만들거나 정보를 저장·전송하지 않습니다.</small>
        </form>
      );
      live = submitted
        ? valid
          ? "조건을 충족해 완료 상태로 바뀌었습니다."
          : "오류의 원인과 해결 방법이 입력칸 아래 나타납니다."
        : "짧은 이름과 두 글자 이상의 이름을 각각 입력해 결과를 비교해 보세요.";
      break;
    }
    case "cards":
      controls = (
        <div className="gp-control-buttons" role="group" aria-label="콘텐츠 배치">
          <button type="button" aria-pressed={!active} onClick={() => setValue(0)}>
            목록으로
          </button>
          <button type="button" aria-pressed={active} onClick={() => setValue(1)}>
            카드로
          </button>
        </div>
      );
      sample = (
        <div className={active ? "gp-card-layout" : "gp-list-layout"}>
          <ContentCards columns={active ? 3 : 1} />
        </div>
      );
      live = "같은 세 콘텐츠와 순서를 유지하면서 묶음의 경계와 배치를 바꿉니다.";
      break;
    case "grid": {
      const columns = Math.round(1 + value * 2);
      controls = (
        <>
          <RangeControl
            label="컬럼 수"
            value={columns}
            min={1}
            max={3}
            onChange={(v) => setValue((v - 1) / 2)}
          />
          <button
            type="button"
            className="gp-secondary"
            aria-pressed={secondaryValue >= 0.5}
            onClick={() => setSecondaryValue(secondaryValue >= 0.5 ? 0 : 1)}
          >
            그리드 가이드 {secondaryValue >= 0.5 ? "끄기" : "켜기"}
          </button>
        </>
      );
      sample = (
        <div className="gp-grid-sample" style={{ "--gp-columns": columns } as CSSProperties}>
          {secondaryValue >= 0.5 && (
            <div className="gp-grid-guides" aria-hidden>
              {Array.from({ length: columns }, (_, i) => (
                <span key={i} />
              ))}
            </div>
          )}
          <ContentCards columns={columns} />
        </div>
      );
      live = `${columns}개의 동일한 너비 컬럼과 12px 간격을 사용합니다. 컬럼 수는 콘텐츠와 화면에 따라 선택할 수 있습니다.`;
      break;
    }
    case "scale": {
      const size = Math.round(70 + value * 60);
      controls = (
        <RangeControl
          label="대표 요소 크기"
          value={size}
          min={70}
          max={130}
          unit="%"
          onChange={(v) => setValue((v - 70) / 60)}
        />
      );
      sample = (
        <div className="gp-scale-sample">
          <div className="gp-scale-picture" style={{ width: `${size * 0.65}%` }}>
            <Landscape />
          </div>
          <h4 style={{ fontSize: 20 + value * 16 }}>하나의 장면, 새로운 시선</h4>
          <p>크기 변화가 주의를 어디로 이끄는지 살펴보세요.</p>
        </div>
      );
      live = `대표 요소 ${size}%. 주변의 본문 크기는 유지해 상대적 크기 차이를 관찰합니다.`;
      break;
    }
  }
  return (
    <div className="gp-exercise gp-visual-exercise">
      <div className="gp-comparison-buttons" role="group" aria-label="예시 상태 비교">
        {[practice.beforeLabel, practice.afterLabel].map((label, index) => (
          <button
            type="button"
            key={`${index}-${label}`}
            aria-pressed={comparison === index}
            onClick={() => compare(index)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="gp-comparison-note">
        {comparison === null
          ? "직접 조정한 상태입니다. 위의 두 기준 상태를 눌러 다시 비교할 수 있어요."
          : comparison === 0
            ? practice.beforeNote
            : practice.afterNote}
      </p>
      <div className="gp-controls">{controls}</div>
      <div className="gp-visual-stage">{sample}</div>
      <div className="gp-feedback gp-live-result" role="status" aria-live="polite">
        {live}
      </div>
      <ResetButton onClick={() => compare(0)} />
    </div>
  );
}

export function PracticeExercise({ practice }: { practice: GlossaryPractice }) {
  return practice.kind === "decision" ? (
    <DecisionExercise key={practice.id} practice={practice} />
  ) : practice.kind === "sort" ? (
    <SortExercise key={practice.id} practice={practice} />
  ) : practice.kind === "sequence" ? (
    <SequenceExercise key={practice.id} practice={practice} />
  ) : (
    <VisualExercise key={practice.id} practice={practice} />
  );
}

export function GlossaryPracticeLesson({
  entry,
  practice,
}: {
  entry: GlossaryEntry;
  practice: GlossaryPractice;
}) {
  const [definition, note] = entry.description.split("[실무 참고]");
  return (
    <article className="gp-lesson">
      <header className="gp-term-header">
        <p>VISUAL GLOSSARY</p>
        <h2 lang="en">{entry.english}</h2>
        <div>
          [{entry.pronunciation}] / {entry.korean}
        </div>
      </header>
      <Section title="핵심 구조" number="01">
        <ConceptStructure
          structure={practice.structure}
          preset={practice.kind === "visual" ? practice.preset : undefined}
        />
        <p className="gp-definition">{definition}</p>
        {note && <p className="gp-note">{note.trim()}</p>}
      </Section>
      <Section title="직접 해보기" number="02">
        <p className="gp-scenario">
          <span>연습 상황</span>
          {practice.scenario}
        </p>
        <p className="gp-instruction">{practice.instruction}</p>
        <PracticeExercise practice={practice} />
      </Section>
      <Section title="기억할 점" number="03">
        <p className="gp-takeaway">{practice.takeaway}</p>
      </Section>
    </article>
  );
}
