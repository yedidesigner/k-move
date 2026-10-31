import { useId } from "react";
import type { ReactNode } from "react";
import research from "@/data/expansion/research.json";
import "./research-concept.css";

function Text({
  x,
  y,
  children,
  anchor = "middle",
  accent = false,
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: "middle" | "start" | "end";
  accent?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      className={accent ? "xe-research-concept-accenttext" : undefined}
    >
      {children}
    </text>
  );
}

function Node({
  x,
  y,
  w,
  h = 36,
  label,
  accent = false,
  dashed = false,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label?: string;
  accent?: boolean;
  dashed?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="2"
        className={accent ? "xe-research-concept-highlight" : "xe-research-concept-outline"}
        strokeDasharray={dashed ? "4 4" : undefined}
      />
      {label && (
        <Text x={x + w / 2} y={y + h / 2 + 5} accent={accent}>
          {label}
        </Text>
      )}
    </g>
  );
}

function Person({ x, y, accent = false }: { x: number; y: number; accent?: boolean }) {
  return (
    <g className={accent ? "xe-research-concept-personaccent" : "xe-research-concept-person"}>
      <circle cx={x} cy={y - 11} r="11" />
      <path d={`M${x - 19} ${y + 26} v-7 a19 19 0 0 1 38 0 v7`} />
    </g>
  );
}

function ConceptScene({ termId, arrow }: { termId: string; arrow: string }) {
  const line = (x1: number, y1: number, x2: number, y2: number, dashed = false) => (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      className="xe-research-concept-line"
      strokeDasharray={dashed ? "4 4" : undefined}
      markerEnd={`url(#${arrow})`}
    />
  );
  const path = (d: string) => (
    <path d={d} className="xe-research-concept-line" markerEnd={`url(#${arrow})`} />
  );
  const dot = (x: number, y: number, accent = false) => (
    <circle
      cx={x}
      cy={y}
      r="7"
      className={accent ? "xe-research-concept-dotaccent" : "xe-research-concept-dot"}
    />
  );
  switch (termId) {
    case "card-sorting":
      return (
        <>
          <Text x={160} y={23}>
            콘텐츠를 묶는 기준을 발견
          </Text>
          <Node x={21} y={43} w={68} h={28} label="예약 변경" />
          <Node x={126} y={43} w={68} h={28} label="영수증" />
          <Node x={231} y={43} w={68} h={28} label="예약 취소" />
          {path("M55 76 L55 103 L96 125")}
          {path("M160 76 L220 125")}
          {path("M265 76 L265 105 L126 125")}
          <rect
            x="25"
            y="126"
            width="135"
            height="66"
            rx="8"
            className="xe-research-concept-highlight"
          />
          <rect
            x="180"
            y="126"
            width="115"
            height="66"
            rx="8"
            className="xe-research-concept-outline"
          />
          <Text x={92} y={151}>
            예약 관리
          </Text>
          <Text x={92} y={176}>
            변경 · 취소
          </Text>
          <Text x={237} y={151}>
            결제 내역
          </Text>
          <Text x={237} y={176}>
            영수증
          </Text>
          <Text x={160} y={215}>
            참여자가 분류하고 이름 붙이기
          </Text>
        </>
      );
    case "tree-testing":
      return (
        <>
          <Node x={111} y={15} w={98} label="전체 메뉴" />
          {path("M160 51 V68 H73 V86")}
          {path("M160 51 V68 H247 V86")}
          <Node x={24} y={87} w={98} label="내 예약" accent />
          <Node x={198} y={87} w={98} label="이용 안내" />
          {path("M73 123 V146 H45 V160")}
          {path("M73 123 V146 H137 V160")}
          <Node x={10} y={161} w={70} label="날짜 변경" />
          <Node x={99} y={161} w={76} label="예약 취소" accent />
          <Text x={238} y={162}>
            목표 정보까지
          </Text>
          <Text x={238} y={183}>
            경로 확인
          </Text>
        </>
      );
    case "first-click-testing":
      return (
        <>
          <rect x="25" y="28" width="270" height="154" className="xe-research-concept-outline" />
          <path d="M25 70 H295" className="xe-research-concept-line" />
          <Text x={75} y={55}>
            탐색
          </Text>
          <rect x="121" y="37" width="78" height="26" className="xe-research-concept-highlight" />
          <Text x={160} y={55}>
            내 예약
          </Text>
          <Text x={244} y={55}>
            도움말
          </Text>
          <path d="M174 63 l4 29 8-10 12-2z" className="xe-research-concept-cursor" />
          <rect x="43" y="90" width="233" height="70" className="xe-research-concept-soft" />
          <Text x={160} y={132}>
            전체 화면을 제시
          </Text>
          <Text x={160} y={211}>
            과업을 듣고 처음 선택한 곳
          </Text>
        </>
      );
    case "heuristic-evaluation":
      return (
        <>
          <rect x="15" y="40" width="160" height="130" className="xe-research-concept-outline" />
          <path d="M15 67 H175" className="xe-research-concept-line" />
          <Node x={46} y={95} w={98} label="저장" />
          <circle cx="145" cy="142" r="17" className="xe-research-concept-highlight" />
          <Text x={145} y={147} accent>
            ?
          </Text>
          <Text x={95} y={196}>
            상태가 보이지 않음
          </Text>
          {line(181, 112, 213, 112)}
          <path
            d="M225 48 H297 V165 H225 Z M239 76 H283 M239 100 H283 M239 124 H270"
            className="xe-research-concept-line"
          />
          <Text x={260} y={196}>
            원칙과 대조
          </Text>
          <Text x={160} y={22}>
            전문가가 잠재적 문제를 점검
          </Text>
        </>
      );
    case "cognitive-walkthrough":
      return (
        <>
          <Text x={160} y={28}>
            처음 쓰는 사람의 과업을 따라가기
          </Text>
          <Node x={12} y={83} w={82} label="목표 인식" />
          <Node x={119} y={83} w={82} label="행동 선택" accent />
          <Node x={226} y={83} w={82} label="결과 이해" />
          {line(95, 101, 116, 101)}
          {line(202, 101, 223, 101)}
          <Text x={53} y={158}>
            떠올릴까?
          </Text>
          <Text x={160} y={158}>
            찾을까?
          </Text>
          <Text x={267} y={158}>
            알아볼까?
          </Text>
          <path d="M53 131 V141 M160 131 V141 M267 131 V141" className="xe-research-concept-line" />
          <Text x={160} y={205}>
            각 단계의 학습 가능성을 검토
          </Text>
        </>
      );
    case "contextual-inquiry":
      return (
        <>
          <ellipse cx="160" cy="110" rx="132" ry="84" className="xe-research-concept-dashed" />
          <Person x={160} y={105} accent />
          <Node x={41} y={60} w={67} h={30} label="실제 도구" />
          <Node x={212} y={60} w={67} h={30} label="주변 사람" />
          <Node x={41} y={142} w={67} h={30} label="작업 공간" />
          <Node x={212} y={142} w={67} h={30} label="방해 요소" />
          <Text x={160} y={174}>
            관찰 + 질문
          </Text>
          <Text x={160} y={22}>
            활동이 일어나는 실제 맥락
          </Text>
          <Text x={160} y={215}>
            화면 밖의 조건도 함께 이해
          </Text>
        </>
      );
    case "diary-study":
      return (
        <>
          <Text x={160} y={26}>
            여러 시점에 경험을 기록
          </Text>
          {line(24, 105, 297, 105)}
          {[55, 160, 265].map((x, i) => (
            <g key={x}>
              <line x1={x} y1="72" x2={x} y2="137" className="xe-research-concept-line" />
              {dot(x, 105, true)}
              <Text x={x} y={63}>{`DAY ${[1, 3, 6][i]}`}</Text>
              <path
                d={`M${x - 24} 143 h48 v42 h-48z m9 12h30 m-30 11h21`}
                className="xe-research-concept-line"
              />
            </g>
          ))}
          <Text x={160} y={214}>
            상황 · 행동 · 감정을 자기 보고
          </Text>
        </>
      );
    case "moderated-usability-testing":
      return (
        <>
          <Person x={58} y={87} />
          <Person x={185} y={87} accent />
          <Text x={58} y={145}>
            진행자
          </Text>
          <Text x={185} y={145}>
            참여자
          </Text>
          {line(85, 85, 154, 85)}
          {line(155, 109, 86, 109)}
          <rect x="253" y="67" width="50" height="57" className="xe-research-concept-outline" />
          {line(215, 94, 247, 94)}
          <Text x={279} y={145}>
            과업
          </Text>
          <Text x={160} y={27}>
            같은 세션에서 관찰하고 질문
          </Text>
          <Text x={160} y={196}>
            진행자는 정답 경로를 안내하지 않음
          </Text>
        </>
      );
    case "unmoderated-usability-testing":
      return (
        <>
          <Text x={160} y={27}>
            진행자 없이 미리 정한 과업 수행
          </Text>
          <Node x={12} y={68} w={83} label="과업 안내" />
          {line(97, 86, 133, 86)}
          <Person x={160} y={80} accent />
          {line(188, 86, 224, 86)}
          <path
            d="M233 59 H301 V119 H233 Z M245 76 H289 M245 91 H289 M245 106 H276"
            className="xe-research-concept-line"
          />
          <Text x={267} y={146}>
            행동 기록
          </Text>
          <Text x={160} y={146}>
            참여자
          </Text>
          {path("M267 157 V182 H160")}
          <Text x={116} y={187}>
            나중에 검토
          </Text>
        </>
      );
    case "think-aloud":
      return (
        <>
          <Person x={74} y={136} accent />
          <path
            d="M29 25 H222 V91 H115 L91 112 V91 H29 Z"
            className="xe-research-concept-outline"
          />
          <Text x={125} y={51}>
            “이걸 누르면
          </Text>
          <Text x={125} y={75}>
            무슨 일이 생길까?”
          </Text>
          <rect x="196" y="120" width="98" height="65" className="xe-research-concept-outline" />
          <Node x={215} y={142} w={61} h={26} label="다음" />
          {line(106, 150, 187, 150)}
          <Text x={160} y={215}>
            과업 수행 중 떠오르는 생각을 말하기
          </Text>
        </>
      );
    case "task-success-rate":
      return (
        <>
          <Text x={160} y={26}>
            같은 성공 기준으로 기록
          </Text>
          {Array.from({ length: 10 }, (_, i) => (
            <g key={i}>
              <circle
                cx={56 + (i % 5) * 52}
                cy={67 + Math.floor(i / 5) * 47}
                r="17"
                className={i < 8 ? "xe-research-concept-highlight" : "xe-research-concept-outline"}
              />
              <Text x={56 + (i % 5) * 52} y={72 + Math.floor(i / 5) * 47}>
                {i < 8 ? "✓" : "×"}
              </Text>
            </g>
          ))}
          <Text x={160} y={170} accent>
            성공 8 / 시도 10 = 80%
          </Text>
          <Text x={160} y={207}>
            가상 데이터 · 모집단의 확정값 아님
          </Text>
        </>
      );
    case "ab-testing":
      return (
        <>
          <Node x={103} y={15} w={114} label="무작위 배정" accent />
          {path("M160 51 V69 H73 V91")}
          {path("M160 51 V69 H247 V91")}
          <Node x={27} y={92} w={92} h={44} label="A · 현재안" />
          <Node x={201} y={92} w={92} h={44} label="B · 변경안" />
          {path("M73 136 V157 H160 V172")}
          {path("M247 136 V157 H160")}
          <Text x={160} y={192}>
            사전에 정한 같은 지표 비교
          </Text>
          <Text x={160} y={215}>
            배정 · 측정 · 분석 조건 확인
          </Text>
        </>
      );
    case "benchmarking":
      return (
        <>
          <Text x={160} y={27}>
            같은 지표를 같은 척도로 비교
          </Text>
          <Text x={50} y={85}>
            기준점
          </Text>
          <Text x={50} y={141}>
            후속점
          </Text>
          <path d="M98 51 V163 H289" className="xe-research-concept-line" />
          <rect x="99" y="65" width="103" height="27" className="xe-research-concept-outline" />
          <rect x="99" y="121" width="143" height="27" className="xe-research-concept-highlight" />
          <Text x={160} y={193}>
            과업과 모집 조건도 맞춰 보기
          </Text>
          <Text x={160} y={216}>
            길이는 개념도 · 실제 성과 아님
          </Text>
        </>
      );
    case "jobs-to-be-done":
      return (
        <>
          <Text x={160} y={29}>
            특정 상황에서 이루려는 진전
          </Text>
          <Person x={45} y={102} />
          <Node x={102} y={71} w={113} h={64} label="이루려는 변화" accent />
          {line(70, 104, 96, 104)}
          {line(218, 104, 246, 104)}
          <path
            d="M258 77 V137 M258 78 H296 L285 92 L296 106 H258"
            className="xe-research-concept-line"
          />
          <Text x={46} y={162}>
            현재 상황
          </Text>
          <Text x={270} y={162}>
            원하는 상태
          </Text>
          <Text x={160} y={205}>
            기능 요청보다 목적을 이해
          </Text>
        </>
      );
    case "service-blueprint":
      return (
        <>
          <Text x={160} y={22}>
            접점과 내부 운영을 연결
          </Text>
          {[
            { y: 40, label: "고객 행동", accent: false },
            { y: 80, label: "보이는 접점", accent: true },
            { y: 130, label: "내부 업무", accent: false },
            { y: 170, label: "지원 체계", accent: false },
          ].map((row) => (
            <g key={row.y}>
              <Text x={12} y={row.y + 21} anchor="start">
                {row.label}
              </Text>
              <Node x={112} y={row.y} w={74} h={30} accent={row.accent} />
              <Node x={221} y={row.y} w={74} h={30} accent={row.accent} />
            </g>
          ))}
          <path d="M149 70 V170 M258 70 V170" className="xe-research-concept-line" />
          <path d="M10 118 H307" className="xe-research-concept-line" strokeDasharray="5 4" />
          <Text x={160} y={218}>
            점선: 가시선 · 그 아래는 보이지 않는 운영
          </Text>
        </>
      );
    case "opportunity-solution-tree":
      return (
        <>
          <Node x={110} y={9} w={100} h={30} label="목표 결과" accent />
          {path("M160 39 V53 H77 V66")}
          {path("M160 39 V53 H243 V66")}
          <Node x={28} y={67} w={98} h={30} label="고객 기회" />
          <Node x={194} y={67} w={98} h={30} label="고객 기회" />
          {path("M77 97 V112 H43 V124")}
          {path("M77 97 V112 H119 V124")}
          {path("M243 97 V112 H202 V124")}
          {path("M243 97 V112 H278 V124")}
          {[8, 84, 167, 243].map((x) => (
            <Node key={x} x={x} y={125} w={69} h={30} label="해결 후보" />
          ))}
          {[43, 119, 202, 278].map((x) => (
            <g key={x}>
              {line(x, 156, x, 174)}
              <circle cx={x} cy="187" r="9" className="xe-research-concept-highlight" />
            </g>
          ))}
          <Text x={160} y={217}>
            아래의 작은 실험으로 가정을 확인
          </Text>
        </>
      );
    case "assumption-mapping":
      return (
        <>
          <Text x={160} y={23}>
            실패 시 영향이 큰가?
          </Text>
          <rect x="51" y="40" width="224" height="136" className="xe-research-concept-outline" />
          <rect x="52" y="41" width="111" height="67" className="xe-research-concept-soft" />
          <path d="M163 40 V176 M51 108 H275" className="xe-research-concept-line" />
          <Text x={108} y={69} accent>
            중요하지만
          </Text>
          <Text x={108} y={91} accent>
            근거 부족
          </Text>
          <Text x={219} y={81}>
            근거 있음
          </Text>
          {dot(107, 141)}
          {dot(219, 141)}
          {line(36, 176, 36, 42)}
          {line(51, 189, 275, 189)}
          <Text x={160} y={214}>
            오른쪽으로 갈수록 강한 근거
          </Text>
        </>
      );
    case "research-repository":
      return (
        <>
          <Text x={160} y={25}>
            발견에서 근거를 다시 찾는 구조
          </Text>
          <Node x={21} y={57} w={91} label="관찰 기록" />
          <Node x={21} y={126} w={91} label="연구 맥락" />
          {line(114, 75, 201, 104)}
          {line(114, 144, 201, 117)}
          <path
            d="M208 66 H294 V157 H208 Z M221 87 H281 M221 107 H281 M221 127 H264"
            className="xe-research-concept-line"
          />
          <Text x={250} y={182} accent>
            발견 / 인사이트
          </Text>
          <Text x={160} y={213}>
            원자료 · 방법 · 범위 · 접근 권한 연결
          </Text>
        </>
      );
    case "triangulation":
      return (
        <>
          <Text x={160} y={23}>
            서로 다른 근거로 같은 질문 검토
          </Text>
          <circle cx="160" cy="119" r="29" className="xe-research-concept-highlight" />
          <Text x={160} y={124}>
            질문
          </Text>
          <Node x={115} y={43} w={90} h={30} label="행동 관찰" />
          <Node x={12} y={159} w={90} h={30} label="인터뷰" />
          <Node x={218} y={159} w={90} h={30} label="행동 로그" />
          {line(160, 74, 160, 87)}
          {line(104, 163, 133, 139)}
          {line(217, 163, 187, 139)}
          <Text x={160} y={215}>
            세 가지일 필요는 없음 · 불일치도 확인
          </Text>
        </>
      );
    case "research-question":
      return (
        <>
          <Text x={160} y={25}>
            의사결정에 필요한 불확실성 구체화
          </Text>
          <path d="M28 53 H292 L229 104 H91 Z" className="xe-research-concept-outline" />
          <Text x={160} y={79}>
            팀이 내려야 할 결정
          </Text>
          <path d="M91 104 H229 L196 147 H124 Z" className="xe-research-concept-highlight" />
          <Text x={160} y={132}>
            연구 질문
          </Text>
          {line(160, 149, 160, 173)}
          <Text x={160} y={195}>
            관찰·질문으로 얻을 수 있는 근거
          </Text>
        </>
      );
    case "leading-question":
      return (
        <>
          <path d="M19 31 H301 V94 H73 L50 112 V94 H19 Z" className="xe-research-concept-outline" />
          <Text x={160} y={58}>
            “이 기능이 더 편리하죠?”
          </Text>
          <path d="M198 66 H270" className="xe-research-concept-line" />
          <Text x={160} y={83}>
            기대하는 답을 질문에 넣음
          </Text>
          {line(160, 111, 160, 132)}
          <path
            d="M19 140 H301 V201 H73 L50 214 V201 H19 Z"
            className="xe-research-concept-highlight"
          />
          <Text x={160} y={166}>
            “어떻게 사용하셨나요?”
          </Text>
          <Text x={160} y={190} accent>
            판단을 먼저 제시하지 않기
          </Text>
        </>
      );
    case "sampling-bias":
      return (
        <>
          <Text x={160} y={24}>
            모집 경로가 특정 집단만 담으면
          </Text>
          <rect x="16" y="42" width="132" height="128" className="xe-research-concept-outline" />
          {Array.from({ length: 12 }, (_, i) => (
            <g key={i}>
              {i % 3 === 0 ? (
                <rect
                  x={30 + (i % 3) * 38}
                  y={57 + Math.floor(i / 3) * 27}
                  width="13"
                  height="13"
                  className="xe-research-concept-highlight"
                />
              ) : (
                dot(37 + (i % 3) * 38, 64 + Math.floor(i / 3) * 27, i % 3 === 1)
              )}
            </g>
          ))}
          {line(154, 106, 196, 106)}
          <rect x="204" y="65" width="99" height="82" className="xe-research-concept-outline" />
          {[226, 252, 278].map((x) => (
            <g key={x}>
              {dot(x, 90, true)}
              {dot(x, 122, true)}
            </g>
          ))}
          <Text x={82} y={192}>
            알고 싶은 전체
          </Text>
          <Text x={253} y={170}>
            모인 표본
          </Text>
          <Text x={160} y={217}>
            가상 구성 · 빠진 집단을 확인
          </Text>
        </>
      );
    case "selection-bias":
      return (
        <>
          <Text x={160} y={25}>
            분석에 남기는 기준도 결과에 영향
          </Text>
          <Node x={18} y={69} w={91} h={64} label="전체 시도" />
          {line(111, 101, 143, 101)}
          <path
            d="M148 55 H208 L190 91 V121 L168 140 V91 Z"
            className="xe-research-concept-highlight"
          />
          <Text x={178} y={172}>
            선택 / 제외
          </Text>
          {line(211, 101, 244, 101)}
          <Node x={249} y={72} w={58} h={58} label="성공만" />
          {path("M178 141 V190 H92")}
          <Text x={61} y={195}>
            실패 제외
          </Text>
        </>
      );
    case "survivorship-bias":
      return (
        <>
          <Node x={96} y={15} w={128} label="처음 시작한 집단" />
          {path("M160 51 V70 H78 V88")}
          {path("M160 51 V70 H243 V88")}
          <Node x={22} y={89} w={112} h={50} label="계속 남은 사람" accent />
          <Node x={187} y={89} w={112} h={50} label="그만둔 사람" dashed />
          {line(78, 141, 78, 170)}
          <Text x={78} y={191}>
            이들만 분석
          </Text>
          <path d="M229 160 L256 187 M256 160 L229 187" className="xe-research-concept-line" />
          <Text x={243} y={213}>
            이유가 빠짐
          </Text>
        </>
      );
    case "correlation-causation":
      return (
        <>
          <path d="M48 34 V169 H292" className="xe-research-concept-line" />
          <Text x={24} y={48}>
            B
          </Text>
          <Text x={290} y={192}>
            A
          </Text>
          {[
            [71, 148],
            [106, 135],
            [137, 145],
            [162, 101],
            [198, 91],
            [224, 65],
            [265, 53],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="6" className="xe-research-concept-dotaccent" />
          ))}
          <Text x={160} y={23}>
            두 변수가 함께 변하는 관계
          </Text>
          <Text x={160} y={209}>
            가상 점 · 함께 변함 ≠ 원인과 결과
          </Text>
        </>
      );
    case "confidence-interval":
      return (
        <>
          <Text x={160} y={23}>
            참값은 고정 · 표본마다 구간은 다름
          </Text>
          <path d="M181 48 V177" className="xe-research-concept-line" strokeDasharray="4 4" />
          <Text x={181} y={200}>
            참값
          </Text>
          {[
            { y: 72, a: 120, b: 219, c: 166 },
            { y: 116, a: 154, b: 274, c: 224 },
            { y: 160, a: 51, b: 141, c: 98 },
          ].map((v, i) => (
            <g key={v.y}>
              <Text x={21} y={v.y + 4}>
                {String.fromCharCode(65 + i)}
              </Text>
              <path
                d={`M${v.a} ${v.y} H${v.b} M${v.a} ${v.y - 7} V${v.y + 7} M${v.b} ${v.y - 7} V${v.y + 7}`}
                className="xe-research-concept-accentline"
              />
              {dot(v.c, v.y, true)}
            </g>
          ))}
          <Text x={160} y={220}>
            반복 표집의 개념도 · 실제 데이터 아님
          </Text>
        </>
      );
    case "minimum-viable-product":
      return (
        <>
          <Text x={160} y={23}>
            핵심 가설을 배울 수 있는 작은 전체
          </Text>
          <rect
            x="12"
            y="45"
            width="296"
            height="93"
            rx="6"
            className="xe-research-concept-highlight"
          />
          <Node x={24} y={72} w={73} label="후보 작성" />
          <Node x={124} y={72} w={73} label="공유" />
          <Node x={224} y={72} w={73} label="응답 확인" />
          {line(99, 90, 120, 90)}
          {line(199, 90, 220, 90)}
          <Node x={39} y={161} w={102} h={31} label="자동 연동" dashed />
          <Node x={179} y={161} w={102} h={31} label="고급 통계" dashed />
          <Text x={160} y={217}>
            가상 범위 · 이번 학습에 불필요하면 보류
          </Text>
        </>
      );
    case "content-strategy":
      return (
        <>
          <Node x={110} y={13} w={100} label="목적과 필요" accent />
          <Node x={208} y={90} w={100} label="구조와 발행" />
          <Node x={108} y={167} w={104} label="검토와 갱신" />
          <Node x={12} y={90} w={100} label="관리 책임" />
          {path("M213 40 Q259 42 259 85")}
          {path("M260 131 Q260 178 216 183")}
          {path("M105 183 Q62 178 62 131")}
          {path("M62 86 Q62 42 105 40")}
          <Text x={160} y={111}>
            콘텐츠
          </Text>
        </>
      );
    case "ux-writing":
      return (
        <>
          <Text x={160} y={25}>
            흐름 전체의 언어를 연결
          </Text>
          <Node x={21} y={48} w={278} h={40} label="행동 전 · 확정 조건 안내" />
          {line(160, 90, 160, 107)}
          <Node x={74} y={109} w={172} h={37} label="예약 요청 보내기" accent />
          {line(160, 148, 160, 165)}
          <Node x={21} y={167} w={278} h={40} label="행동 후 · 요청 완료, 확인 대기" />
        </>
      );
    case "microcopy":
      return (
        <>
          <rect x="20" y="25" width="188" height="173" className="xe-research-concept-outline" />
          <Text x={36} y={52} anchor="start">
            이메일 주소
          </Text>
          <Node x={35} y={66} w={157} h={31} label="hello@" />
          <Text x={36} y={117} anchor="start">
            알림을 보내드려요.
          </Text>
          <Text x={36} y={143} anchor="start" accent>
            주소를 확인해 주세요.
          </Text>
          <Node x={35} y={157} w={85} h={28} label="저장" accent />
          {line(214, 46, 250, 46)}
          {line(214, 112, 250, 112)}
          {line(214, 141, 250, 141)}
          <Text x={279} y={51}>
            라벨
          </Text>
          <Text x={279} y={117}>
            도움말
          </Text>
          <Text x={279} y={146}>
            오류
          </Text>
          <Text x={160} y={219}>
            특정 조작을 돕는 짧은 문구
          </Text>
        </>
      );
    default:
      return null;
  }
}

export function ResearchConcept({ termId }: { termId: string }) {
  const arrow = `research-concept-arrow-${useId().replace(/:/g, "")}`;
  const term = research.terms.find((entry) => entry.id === termId);
  if (!term) return null;
  return (
    <div className="xe-research-concept" data-research-concept={termId}>
      <svg viewBox="0 0 320 230" role="img" aria-label={`${term.korean}: ${term.essential}`}>
        <defs>
          <marker
            id={arrow}
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0 0 L6 3 L0 6 Z" fill="#61746b" />
          </marker>
        </defs>
        <ConceptScene termId={termId} arrow={arrow} />
      </svg>
    </div>
  );
}
