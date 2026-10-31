import { useId, type ReactNode } from "react";
import "./interaction-concept.css";

const ink = "#222c26";
const green = "#315f45";
const pale = "#edf5ef";
const muted = "#66766b";

function Box({
  x,
  y,
  w,
  h,
  active = false,
  dashed = false,
  fill,
  radius = 3,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  active?: boolean;
  dashed?: boolean;
  fill?: string;
  radius?: number;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={radius}
      fill={fill ?? (active ? pale : "white")}
      stroke={active ? green : "#a7b6ac"}
      strokeWidth={active ? 2 : 1.2}
      strokeDasharray={dashed ? "5 4" : undefined}
    />
  );
}
function T({
  x,
  y,
  children,
  small = false,
  strong = false,
  color = ink,
  anchor = "start",
}: {
  x: number;
  y: number;
  children: ReactNode;
  small?: boolean;
  strong?: boolean;
  color?: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={small ? 12 : 14}
      fontWeight={strong ? 650 : 400}
      fill={color}
      textAnchor={anchor}
    >
      {children}
    </text>
  );
}
function L({
  x1,
  y1,
  x2,
  y2,
  dashed = false,
  color = "#a7b6ac",
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dashed?: boolean;
  color?: string;
}) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={1.5}
      strokeDasharray={dashed ? "4 4" : undefined}
    />
  );
}
function Lines({
  x,
  y,
  width = 160,
  rows = 3,
}: {
  x: number;
  y: number;
  width?: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, n) => (
        <rect
          key={n}
          x={x}
          y={y + n * 14}
          width={n === rows - 1 ? width * 0.64 : width}
          height={5}
          rx={2}
          fill="#ccd6cf"
        />
      ))}
    </>
  );
}
function Check({
  x,
  y,
  checked = false,
  radio = false,
}: {
  x: number;
  y: number;
  checked?: boolean;
  radio?: boolean;
}) {
  return (
    <g>
      {radio ? (
        <circle
          cx={x + 10}
          cy={y + 10}
          r={10}
          fill="white"
          stroke={checked ? green : muted}
          strokeWidth={1.6}
        />
      ) : (
        <rect
          x={x}
          y={y}
          width={20}
          height={20}
          rx={2}
          fill={checked ? green : "white"}
          stroke={checked ? green : muted}
          strokeWidth={1.6}
        />
      )}
      {checked &&
        (radio ? (
          <circle cx={x + 10} cy={y + 10} r={5} fill={green} />
        ) : (
          <path d={`M${x + 4} ${y + 10} l4 4 l8 -9`} stroke="white" strokeWidth={2} fill="none" />
        ))}
    </g>
  );
}
function Switch({ x, y, on = false }: { x: number; y: number; on?: boolean }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={58}
        height={30}
        rx={15}
        fill={on ? green : "#e4eae6"}
        stroke={on ? green : muted}
      />
      <circle
        cx={x + (on ? 43 : 15)}
        cy={y + 15}
        r={11}
        fill="white"
        stroke={on ? "white" : muted}
      />
    </g>
  );
}

const labels: Record<string, string> = {
  accordion: "제목 바로 아래에서 독립적으로 펼쳐지는 패널",
  tabs: "선택한 탭에 대응하는 하나의 콘텐츠 패널",
  breadcrumbs: "상위 페이지에서 현재 페이지까지 이어지는 계층 경로",
  "modal-dialog": "배경 작업 위에 놓이는 모달과 대화상자 내부의 포커스",
  popover: "트리거 근처에 연결되어 표시되는 작은 팝오버",
  tooltip: "아이콘의 의미를 짧게 보충하는 툴팁",
  toast: "주요 콘텐츠를 유지하며 상태를 알리는 토스트",
  dropdown: "트리거 아래 펼쳐진 목록에서 항목을 선택하는 형태",
  checkbox: "여러 항목을 독립적으로 선택하는 체크박스",
  "radio-button": "같은 그룹에서 하나를 선택하는 라디오 버튼",
  "toggle-switch": "동일한 설정의 켜짐과 꺼짐을 전환하는 스위치",
  combobox: "입력 필드와 연계된 제안 목록",
  "progress-indicator": "전체 작업 중 완료한 비율을 나타내는 진행 표시",
  "skeleton-screen": "로드될 콘텐츠의 위치와 크기를 먼저 보여주는 스켈레톤",
  "empty-state": "데이터가 없는 이유와 다음 행동을 알리는 빈 상태",
  "error-state": "문제가 있는 입력과 수정 안내가 연결된 오류 상태",
  "loading-state": "처리 중임을 알리는 대기 상태",
  "focus-state": "키보드 조작 대상의 위치를 드러내는 포커스 표시",
  "disabled-state": "사용 조건이 충족되지 않아 작동하지 않는 상태",
  pagination: "페이지 번호로 구분된 콘텐츠와 현재 페이지",
  "infinite-scroll": "스크롤 진행에 따라 콘텐츠가 이어지는 목록",
  "progressive-disclosure": "기본 정보 뒤에 필요한 추가 옵션을 펼치는 구조",
  affordance: "사용자가 실제로 할 수 있는 행동을 제공하는 형태",
  signifier: "사용 가능한 행동이나 조작 위치를 알리는 단서",
  "design-token": "이름 있는 디자인 값이 여러 요소에 연결되는 구조",
  "component-variant": "같은 컴포넌트의 명시적인 속성별 변형",
  "auto-layout": "간격과 여백 규칙에 따라 자식 요소를 배치하는 컨테이너",
  breakpoint: "특정 너비 조건을 기준으로 바뀌는 레이아웃",
  "touch-target": "눈에 보이는 아이콘을 포함하는 실제 터치 영역",
  "reduced-motion": "동작 줄이기 환경설정에 맞춰 공간 이동을 줄인 상태 전환",
};

function Diagram({ termId, arrow }: { termId: string; arrow: string }) {
  const A = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={green}
      strokeWidth={1.5}
      markerEnd={`url(#${arrow})`}
    />
  );
  switch (termId) {
    case "accordion":
      return (
        <>
          <Box x={48} y={24} w={264} h={38} active />
          <T x={63} y={48} strong>
            안내 제목 A
          </T>
          <T x={289} y={48}>
            −
          </T>
          <Box x={48} y={62} w={264} h={66} fill="#f7faf8" />
          <Lines x={63} y={80} width={205} />
          <Box x={48} y={140} w={264} h={38} />
          <T x={63} y={164}>
            안내 제목 B
          </T>
          <T x={289} y={164}>
            ＋
          </T>
          <T x={180} y={205} small anchor="middle">
            열린 패널은 제목 바로 아래에
          </T>
        </>
      );
    case "tabs":
      return (
        <>
          <Box x={35} y={37} w={290} h={142} />
          <Box x={35} y={37} w={96} h={38} active />
          <T x={83} y={62} strong anchor="middle">
            탭 A
          </T>
          <T x={180} y={62} anchor="middle">
            탭 B
          </T>
          <T x={277} y={62} anchor="middle">
            탭 C
          </T>
          <L x1={35} y1={75} x2={325} y2={75} />
          <T x={55} y={108} strong>
            선택한 A의 내용
          </T>
          <Lines x={55} y={125} width={238} rows={2} />
          <T x={180} y={205} small anchor="middle">
            같은 영역에 한 패널씩 표시
          </T>
        </>
      );
    case "breadcrumbs":
      return (
        <>
          <T x={30} y={67}>
            홈
          </T>
          <T x={68} y={67} color={muted}>
            ›
          </T>
          <T x={99} y={67}>
            분류
          </T>
          <T x={147} y={67} color={muted}>
            ›
          </T>
          <T x={180} y={67} strong color={green}>
            현재 페이지
          </T>
          <L x1={29} y1={75} x2={44} y2={75} color={ink} />
          <L x1={98} y1={75} x2={127} y2={75} color={ink} />
          <Box x={30} y={100} w={300} h={73} />
          <Lines x={48} y={119} width={248} />
          <T x={30} y={202} small>
            상위 계층으로 이동
          </T>
          <T x={330} y={202} small anchor="end" color={green}>
            현재 위치
          </T>
        </>
      );
    case "modal-dialog":
      return (
        <>
          <Box x={22} y={20} w={316} h={165} fill="#dce2de" />
          <Lines x={38} y={38} width={270} rows={4} />
          <Box x={73} y={49} w={214} h={112} active fill="white" />
          <T x={91} y={75} strong>
            대화상자
          </T>
          <T x={264} y={75}>
            ×
          </T>
          <Lines x={91} y={90} width={160} rows={2} />
          <rect
            x={207}
            y={123}
            width={62}
            height={25}
            rx={2}
            fill={pale}
            stroke={green}
            strokeWidth={2}
          />
          <T x={238} y={141} small anchor="middle">
            확인
          </T>
          <T x={180} y={207} small anchor="middle">
            열린 동안 배경 작업·포커스 제한
          </T>
        </>
      );
    case "popover":
      return (
        <>
          <Box x={25} y={24} w={310} h={158} />
          <Lines x={42} y={43} width={143} rows={3} />
          <Box x={247} y={39} w={67} h={31} active />
          <T x={280} y={59} small anchor="middle">
            옵션 ▾
          </T>
          <path d="M276 81 l7 -11 l7 11" fill="white" stroke={green} />
          <Box x={150} y={81} w={164} h={78} active />
          <T x={164} y={104} small strong>
            추가 설정
          </T>
          <T x={295} y={104}>
            ×
          </T>
          <Lines x={164} y={119} width={123} rows={2} />
          <T x={180} y={205} small anchor="middle">
            트리거 근처에 보조 내용 표시
          </T>
        </>
      );
    case "tooltip":
      return (
        <>
          <T x={64} y={121} strong>
            배송 정보
          </T>
          <circle cx={167} cy={116} r={12} fill="white" stroke={green} strokeWidth={2} />
          <T x={167} y={121} anchor="middle" strong>
            i
          </T>
          <Box x={88} y={49} w={205} h={39} active />
          <T x={190} y={74} anchor="middle" small>
            출고 후 2–3일 소요
          </T>
          <path d="M159 88 l8 12 l8 -12" fill={pale} stroke={green} />
          <T x={180} y={180} small anchor="middle">
            호버·포커스에 짧은 보충 설명
          </T>
          <T x={180} y={202} small anchor="middle">
            툴팁 안에 조작 컨트롤은 넣지 않음
          </T>
        </>
      );
    case "toast":
      return (
        <>
          <Box x={26} y={20} w={308} h={163} />
          <Lines x={44} y={42} width={250} rows={5} />
          <Box x={111} y={135} w={205} h={34} active />
          <T x={126} y={157} small strong>
            ✓ 변경사항을 저장했어요
          </T>
          <T x={180} y={206} small anchor="middle">
            주요 작업을 가리지 않는 상태 알림
          </T>
        </>
      );
    case "dropdown":
      return (
        <>
          <Box x={81} y={22} w={198} h={35} active />
          <T x={96} y={45}>
            선택한 항목 B
          </T>
          <T x={254} y={45}>
            ▾
          </T>
          <Box x={81} y={64} w={198} h={111} />
          <T x={98} y={91}>
            항목 A
          </T>
          <rect x={84} y={101} width={192} height={33} fill={pale} />
          <T x={98} y={123} color={green} strong>
            ✓ 항목 B
          </T>
          <T x={98} y={158}>
            항목 C
          </T>
          <T x={180} y={204} small anchor="middle">
            트리거 + 펼쳐지는 목록 · 선택형 예시
          </T>
        </>
      );
    case "checkbox":
      return (
        <>
          {[0, 1, 2].map((n) => (
            <g key={n}>
              <Check x={81} y={39 + n * 43} checked={n !== 1} />
              <T x={117} y={55 + n * 43}>
                항목 {String.fromCharCode(65 + n)}
              </T>
              {n !== 1 && (
                <T x={238} y={55 + n * 43} small color={green}>
                  선택됨
                </T>
              )}
            </g>
          ))}
          <T x={180} y={200} small anchor="middle">
            각 항목을 독립적으로 켜고 끄기
          </T>
        </>
      );
    case "radio-button":
      return (
        <>
          <Box x={62} y={22} w={236} h={148} dashed />
          {[0, 1, 2].map((n) => (
            <g key={n}>
              <Check x={82} y={39 + n * 42} checked={n === 1} radio />
              <T x={118} y={55 + n * 42}>
                항목 {String.fromCharCode(65 + n)}
              </T>
              {n === 1 && (
                <T x={234} y={55 + n * 42} small color={green}>
                  선택됨
                </T>
              )}
            </g>
          ))}
          <T x={180} y={201} small anchor="middle">
            같은 그룹에서 하나만 선택
          </T>
        </>
      );
    case "toggle-switch":
      return (
        <>
          <T x={84} y={50} strong anchor="middle">
            꺼짐
          </T>
          <T x={276} y={50} strong anchor="middle">
            켜짐
          </T>
          <Switch x={55} y={79} />
          <Switch x={247} y={79} on />
          <A x1={132} y1={94} x2={223} y2={94} />
          <T x={84} y={142} small anchor="middle">
            알림
          </T>
          <T x={276} y={142} small anchor="middle">
            알림
          </T>
          <T x={180} y={193} small anchor="middle">
            동일한 설정의 상태를 전환
          </T>
          <T x={180} y={213} small anchor="middle">
            상태가 바뀌어도 설정 이름은 유지
          </T>
        </>
      );
    case "combobox":
      return (
        <>
          <Box x={68} y={22} w={224} h={40} active />
          <T x={84} y={48}>
            회
          </T>
          <L x1={101} y1={32} x2={101} y2={51} color={green} />
          <T x={266} y={48}>
            ▾
          </T>
          <Box x={68} y={68} w={224} h={99} />
          <rect x={71} y={71} width={218} height={31} fill={pale} />
          <T x={84} y={92} strong color={green}>
            회의실 A
          </T>
          <T x={84} y={123}>
            회의실 B
          </T>
          <T x={84} y={154}>
            회고실
          </T>
          <T x={180} y={201} small anchor="middle">
            입력값 + 연계된 제안 목록
          </T>
        </>
      );
    case "progress-indicator":
      return (
        <>
          <T x={39} y={72} strong>
            작업 완료 비율
          </T>
          <T x={321} y={72} anchor="end" strong color={green}>
            60%
          </T>
          <rect x={39} y={91} width={282} height={20} rx={10} fill="#e3e9e5" />
          <rect x={39} y={91} width={169} height={20} rx={10} fill={green} />
          <T x={39} y={140} small>
            0
          </T>
          <T x={321} y={140} small anchor="end">
            전체 100%
          </T>
          <T x={180} y={192} small anchor="middle">
            전체량을 알 때만 정확한 비율 표시
          </T>
        </>
      );
    case "skeleton-screen":
      return (
        <>
          <T x={91} y={34} small anchor="middle">
            로드 전
          </T>
          <T x={271} y={34} small anchor="middle">
            로드 후
          </T>
          <Box x={29} y={48} w={126} h={116} />
          <rect x={41} y={61} width={102} height={53} fill="#dce5df" />
          <Lines x={41} y={127} width={102} rows={2} />
          <A x1={168} y1={106} x2={192} y2={106} />
          <Box x={209} y={48} w={126} h={116} />
          <rect x={221} y={61} width={102} height={53} fill={pale} />
          <path
            d="M226 109 l31 -29 l17 16 l19 -24 l26 37"
            fill="none"
            stroke={green}
            strokeWidth={2}
          />
          <T x={221} y={139} small strong>
            실제 콘텐츠
          </T>
          <L x1={221} y1={149} x2={288} y2={149} />
          <T x={180} y={202} small anchor="middle">
            콘텐츠의 크기·위치를 먼저 예고
          </T>
        </>
      );
    case "empty-state":
      return (
        <>
          <Box x={44} y={23} w={272} h={158} />
          <path
            d="M156 62 l-9 19 v20 h66 V81 l-9 -19 Z M147 81 h20 l5 8 h16 l5 -8 h20"
            fill="none"
            stroke={green}
            strokeWidth={1.5}
          />
          <T x={180} y={126} strong anchor="middle">
            아직 항목이 없습니다
          </T>
          <Box x={128} y={139} w={104} h={29} active />
          <T x={180} y={159} small anchor="middle">
            첫 항목 추가
          </T>
          <T x={180} y={208} small anchor="middle">
            빈 이유 + 의미 있는 다음 행동
          </T>
        </>
      );
    case "error-state":
      return (
        <>
          <T x={47} y={48} strong>
            이메일
          </T>
          <Box x={47} y={65} w={266} h={43} active />
          <T x={62} y={92}>
            name@
          </T>
          <circle cx={59} cy={135} r={10} fill="none" stroke={ink} strokeWidth={1.5} />
          <T x={59} y={140} strong anchor="middle">
            !
          </T>
          <T x={78} y={140} small>
            도메인까지 입력해 주세요
          </T>
          <T x={180} y={195} small anchor="middle">
            오류 위치 + 구체적인 수정 방법
          </T>
          <T x={180} y={215} small anchor="middle">
            색상만으로 오류를 구별하지 않기
          </T>
        </>
      );
    case "loading-state":
      return (
        <>
          <Box x={50} y={29} w={260} h={139} />
          <circle cx={180} cy={82} r={20} fill="none" stroke="#dfe7e2" strokeWidth={5} />
          <path d="M180 62 a20 20 0 0 1 20 20" fill="none" stroke={green} strokeWidth={5} />
          <T x={180} y={130} strong anchor="middle">
            처리 중…
          </T>
          <T x={180} y={198} small anchor="middle">
            작업이 진행 중임을 알림
          </T>
          <T x={180} y={217} small anchor="middle">
            소요량을 모르면 비율을 만들지 않음
          </T>
        </>
      );
    case "focus-state":
      return (
        <>
          {[42, 143, 244].map((x, n) => (
            <g key={x}>
              <Box x={x} y={70} w={75} h={42} />
              <T x={x + 37.5} y={97} anchor="middle">
                {["이전", "저장", "다음"][n]}
              </T>
            </g>
          ))}
          <rect
            x={137}
            y={64}
            width={87}
            height={54}
            rx={4}
            fill="none"
            stroke={green}
            strokeWidth={3}
          />
          <T x={180} y={46} small anchor="middle" color={green}>
            현재 키보드 조작 대상
          </T>
          <A x1={89} y1={148} x2={171} y2={148} />
          <T x={121} y={171} small anchor="middle">
            Tab
          </T>
          <T x={180} y={207} small anchor="middle">
            포커스됨 ≠ 선택됨·실행됨
          </T>
        </>
      );
    case "disabled-state":
      return (
        <>
          <Check x={71} y={40} />
          <T x={107} y={56}>
            필수 조건에 동의
          </T>
          <Box x={76} y={89} w={208} h={46} fill="#eff1ef" />
          <T x={180} y={119} color="#87938a" anchor="middle">
            계속하기
          </T>
          <T x={180} y={162} small anchor="middle">
            필수 조건을 완료하면 사용 가능
          </T>
          <T x={180} y={207} small anchor="middle">
            현재는 작동하지 않는 컨트롤
          </T>
        </>
      );
    case "pagination":
      return (
        <>
          <Box x={37} y={22} w={286} h={102} />
          <T x={54} y={48} strong>
            2페이지의 항목
          </T>
          <Lines x={54} y={65} width={239} rows={3} />
          <T x={49} y={161}>
            ‹
          </T>
          {[1, 2, 3, 4].map((n) => (
            <g key={n}>
              {n === 2 && <Box x={78 + (n - 1) * 49} y={140} w={34} h={32} active />}
              <T x={95 + (n - 1) * 49} y={162} anchor="middle" strong={n === 2}>
                {n}
              </T>
            </g>
          ))}
          <T x={307} y={161}>
            ›
          </T>
          <T x={180} y={204} small anchor="middle">
            페이지 경계 + 현재 위치
          </T>
        </>
      );
    case "infinite-scroll":
      return (
        <>
          <Box x={73} y={17} w={214} h={169} />
          {[37, 78, 119].map((y, n) => (
            <g key={y}>
              <Box x={87} y={y} w={175} h={31} active={n === 2} />
              <T x={100} y={y + 21} small>
                {n === 2 ? "새로 이어진 항목" : `목록 항목 ${n + 1}`}
              </T>
            </g>
          ))}
          <L x1={88} y1={168} x2={262} y2={168} dashed />
          <rect x={273} y={64} width={4} height={60} rx={2} fill="#c4d1c8" />
          <A x1={307} y1={78} x2={307} y2={144} />
          <T x={180} y={209} small anchor="middle">
            아래로 읽으며 콘텐츠를 계속 추가
          </T>
        </>
      );
    case "progressive-disclosure":
      return (
        <>
          <T x={55} y={34} small strong>
            항상 보이는 기본 옵션
          </T>
          <Box x={55} y={45} w={250} h={34} />
          <T x={70} y={67}>
            분야 선택
          </T>
          <T x={288} y={67}>
            ▾
          </T>
          <T x={55} y={106} strong color={green}>
            추가 옵션 −
          </T>
          <Box x={55} y={118} w={250} h={57} dashed active />
          <Check x={70} y={136} />
          <T x={104} y={152} small>
            완료한 항목만 보기
          </T>
          <T x={180} y={207} small anchor="middle">
            필요할 때 세부 옵션을 펼침
          </T>
        </>
      );
    case "affordance":
      return (
        <>
          <path
            d="M107 51 h101 v94 q0 15 -15 15 h-71 q-15 0 -15 -15 Z"
            fill="white"
            stroke={ink}
            strokeWidth={2}
          />
          <path
            d="M208 65 h22 q30 0 30 30 q0 30 -30 30 h-22 M208 79 h21 q17 0 17 16 q0 16 -17 16 h-21"
            fill={pale}
            stroke={green}
            strokeWidth={2}
          />
          <A x1={289} y1={57} x2={244} y2={80} />
          <T x={290} y={42} small anchor="end" color={green}>
            쥘 수 있는 공간
          </T>
          <T x={180} y={193} small anchor="middle">
            손과 손잡이의 관계가 쥐기를 가능하게 함
          </T>
          <T x={180} y={213} small anchor="middle">
            모양의 암시보다 실제 행동 가능성
          </T>
        </>
      );
    case "signifier":
      return (
        <>
          <Box x={72} y={46} w={216} h={78} />
          <L x1={98} y1={65} x2={123} y2={65} color={ink} />
          <L x1={98} y1={75} x2={123} y2={75} color={ink} />
          <L x1={98} y1={85} x2={123} y2={85} color={ink} />
          <T x={142} y={81} strong>
            메뉴
          </T>
          <A x1={111} y1={164} x2={111} y2={100} />
          <T x={141} y={162} small color={green}>
            조작 위치·행동을 알리는 단서
          </T>
          <T x={180} y={209} small anchor="middle">
            아이콘·라벨은 메뉴를 여는 기능의 단서
          </T>
        </>
      );
    case "design-token":
      return (
        <>
          <Box x={54} y={25} w={252} h={56} active />
          <rect x={69} y={42} width={22} height={22} rx={2} fill={green} />
          <T x={103} y={48} small strong>
            color.action.primary
          </T>
          <T x={103} y={67} small>
            #315F45
          </T>
          <A x1={180} y1={87} x2={77} y2={122} />
          <A x1={180} y1={87} x2={180} y2={122} />
          <A x1={180} y1={87} x2={282} y2={122} />
          <rect x={42} y={132} width={70} height={30} rx={3} fill={green} />
          <T x={77} y={152} small anchor="middle" color="white">
            버튼
          </T>
          <T x={180} y={152} anchor="middle" color={green}>
            링크
          </T>
          <L x1={166} y1={158} x2={194} y2={158} color={green} />
          <Check x={273} y={137} checked />
          <T x={180} y={205} small anchor="middle">
            의미 있는 이름으로 값을 연결·재사용
          </T>
        </>
      );
    case "component-variant":
      return (
        <>
          <T x={180} y={35} strong anchor="middle">
            Button 컴포넌트
          </T>
          <A x1={161} y1={49} x2={96} y2={76} />
          <A x1={199} y1={49} x2={264} y2={76} />
          <rect x={52} y={87} width={88} height={35} rx={3} fill={green} />
          <T x={96} y={110} small anchor="middle" color="white">
            저장
          </T>
          <Box x={205} y={81} w={119} h={47} active fill="white" />
          <T x={264} y={110} anchor="middle" color={green}>
            저장
          </T>
          <T x={96} y={151} small anchor="middle">
            Filled · Small
          </T>
          <T x={264} y={151} small anchor="middle">
            Outline · Large
          </T>
          <T x={180} y={201} small anchor="middle">
            속성 조합으로 구분한 같은 컴포넌트
          </T>
        </>
      );
    case "auto-layout":
      return (
        <>
          <Box x={29} y={48} w={302} h={109} dashed active />
          <Box x={49} y={80} w={75} h={46} />
          <Box x={144} y={80} w={167} h={46} />
          <T x={86} y={109} anchor="middle">
            짧은 글
          </T>
          <T x={228} y={109} anchor="middle">
            조금 더 긴 글
          </T>
          <L x1={29} y1={65} x2={49} y2={65} color={green} />
          <T x={41} y={38} small anchor="middle">
            여백
          </T>
          <L x1={124} y1={141} x2={144} y2={141} color={green} />
          <T x={134} y={177} small anchor="middle">
            간격
          </T>
          <T x={272} y={37} small anchor="middle">
            가로 정렬
          </T>
          <T x={180} y={207} small anchor="middle">
            내용 크기가 바뀌어도 배치 규칙 유지
          </T>
        </>
      );
    case "breakpoint":
      return (
        <>
          <T x={78} y={30} small anchor="middle">
            720px 미만
          </T>
          <T x={258} y={30} small anchor="middle">
            720px 이상
          </T>
          <Box x={38} y={42} w={80} h={127} />
          {[56, 91, 126].map((y) => (
            <Box key={y} x={49} y={y} w={58} h={26} active />
          ))}
          <A x1={133} y1={103} x2={172} y2={103} />
          <Box x={188} y={42} w={142} h={127} />
          {(
            [
              [201, 57],
              [266, 57],
              [201, 106],
              [266, 106],
            ] as const
          ).map(([x, y]) => (
            <Box key={`${x}-${y}`} x={x} y={y} w={52} h={36} active />
          ))}
          <T x={180} y={202} small anchor="middle">
            너비 조건에 따라 구조 변경 · 720px는 예시
          </T>
        </>
      );
    case "touch-target":
      return (
        <>
          <Box x={125} y={44} w={110} h={110} active dashed />
          <path d="M164 84 h32 M164 97 h32 M164 110 h32" stroke={ink} strokeWidth={3} />
          <T x={254} y={96} small color={green}>
            조작 영역
          </T>
          <L x1={237} y1={99} x2={248} y2={99} color={green} />
          <L x1={125} y1={167} x2={235} y2={167} color={green} />
          <T x={180} y={186} small anchor="middle">
            예: 44 × 44 CSS px · 확대 도해
          </T>
          <T x={180} y={212} small anchor="middle">
            보이는 아이콘보다 넓게 잡은 터치 영역
          </T>
        </>
      );
    case "reduced-motion":
      return (
        <>
          <T x={29} y={37} small strong>
            기본 전환
          </T>
          <Box x={29} y={49} w={302} h={46} />
          <circle cx={56} cy={72} r={13} fill="#d8e3dc" />
          <A x1={81} y1={72} x2={282} y2={72} />
          <circle cx={304} cy={72} r={13} fill={green} />
          <T x={29} y={125} small strong>
            동작 줄이기 예시
          </T>
          <Box x={29} y={137} w={302} h={46} />
          <T x={45} y={166} small>
            공간 이동 없이 최종 상태로
          </T>
          <circle cx={304} cy={160} r={13} fill={green} />
          <T x={180} y={211} small anchor="middle">
            정보·결과를 유지하며 불필요한 움직임 축소
          </T>
        </>
      );
    default:
      return null;
  }
}

export function InteractionConcept({ termId }: { termId: string }) {
  const id = useId().replaceAll(":", "");
  const title = labels[termId];
  if (!title) return null;
  return (
    <div className="xc-interaction-concept">
      <svg viewBox="0 0 360 230" role="img" aria-labelledby={`${id}-title`}>
        <title id={`${id}-title`}>{title} — 핵심 구조 정적 도식</title>
        <defs>
          <marker
            id={`${id}-arrow`}
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L8 4 L0 8" fill={green} />
          </marker>
        </defs>
        <Diagram termId={termId} arrow={`${id}-arrow`} />
      </svg>
      <span className="xc-interaction-static">형태와 관계를 설명하는 정적 도식</span>
    </div>
  );
}
