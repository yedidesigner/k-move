import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";
import "./production-examples.css";

function Sheet({ label, children, note }: { label: string; children: ReactNode; note: string }) {
  return (
    <div className="xe-production-sheet">
      <div className="xe-production-top">
        <span>MORAE STUDIO</span>
        <span>{label}</span>
      </div>
      {children}
      <p className="xe-production-note">{note}</p>
    </div>
  );
}

function InkExample({ termId }: { termId: string }) {
  if (termId === "rgb")
    return (
      <Sheet
        label="RGB CHANNELS"
        note="빛을 더하는 관계를 단순화한 그림입니다. 실제 색은 색 공간과 디스플레이 조건에 따라 달라집니다."
      >
        <div
          className="xe-production-rgb"
          role="img"
          aria-label="검정 바탕 위 빨강 초록 파랑 빛이 겹쳐 가운데가 흰색이 되는 가산 혼합"
        >
          <i />
          <i />
          <i />
          <span>R + G + B</span>
        </div>
        <div className="xe-production-caption">
          <strong>세 채널의 빛</strong>
          <span>모델: RGB · 색 공간 예: sRGB</span>
        </div>
      </Sheet>
    );
  const spot = termId === "spot-color";
  return (
    <Sheet
      label={spot ? "SPOT SEPARATIONS" : "PROCESS SEPARATIONS"}
      note="분판 구조를 설명하는 가상 견본입니다. 화면의 색상은 실제 잉크 견본이 아닙니다."
    >
      <div className="xe-production-ink-plates">
        {(spot
          ? [
              ["MORAE GREEN", "#47776b"],
              ["BLACK", "#202020"],
            ]
          : [
              ["C", "#00a6c6"],
              ["M", "#cd397d"],
              ["Y", "#e3c934"],
              ["K", "#202020"],
            ]
        ).map(([label, color]) => (
          <div key={label}>
            <div style={{ "--ink": color } as CSSProperties} className="xe-production-ink">
              <span>모래</span>
              <i />
            </div>
            <strong>{label}</strong>
            <small>별도의 인쇄판</small>
          </div>
        ))}
      </div>
      <div className="xe-production-caption">
        <strong>{spot ? "지정 잉크 + 검정" : "C + M + Y + K"}</strong>
        <span>{spot ? "별색 이름과 판 개수를 확인" : "네 프로세스 잉크의 조합"}</span>
      </div>
    </Sheet>
  );
}

function ColorWorkflow({ termId }: { termId: string }) {
  if (termId === "color-gamut")
    return (
      <Sheet
        label="GAMUT COMPARISON"
        note="관계만 설명한 개념도입니다. 실제 CIE 색도도나 특정 장치의 측정 색역을 나타내지 않습니다."
      >
        <svg
          className="xe-production-svg"
          viewBox="0 0 420 240"
          role="img"
          aria-label="범위 A와 B가 일부 겹치며 어느 한쪽에만 속한 색도 있는 개념도"
        >
          <ellipse
            cx="170"
            cy="120"
            rx="110"
            ry="85"
            fill="#e8efec"
            stroke="#47776b"
            strokeWidth="2"
          />
          <ellipse
            cx="260"
            cy="120"
            rx="95"
            ry="65"
            fill="#657f7733"
            stroke="#222"
            strokeWidth="2"
            strokeDasharray="6 5"
          />
          <text x="95" y="120">
            범위 A
          </text>
          <text x="270" y="120">
            범위 B
          </text>
          <text x="187" y="150" fontSize="13">
            겹침
          </text>
          <circle cx="95" cy="88" r="5" fill="#47776b" />
          <circle cx="320" cy="126" r="5" fill="#222" />
        </svg>
        <div className="xe-production-caption">
          <strong>색역은 조건에 따른 범위</strong>
          <span>영역 밖의 색은 변환 과정에서 조정될 수 있습니다.</span>
        </div>
      </Sheet>
    );
  if (termId === "soft-proof")
    return (
      <Sheet
        label="SCREEN PROOF"
        note="색 변화의 설명용 비교입니다. 이 화면은 실제 ICC 변환을 실행한 소프트 프루프가 아닙니다."
      >
        <div className="xe-production-proof-pair">
          {[false, true].map((proof) => (
            <div key={String(proof)}>
              <div className={`xe-production-poster${proof ? " xe-production-proofed" : ""}`}>
                <span>MORAE</span>
                <div className="xe-production-poster-sun" />
                <strong>
                  읽는
                  <br />
                  계절.
                </strong>
                <small>THE READING SEASON</small>
              </div>
              <b>{proof ? "출력 조건 모의" : "문서 보기"}</b>
            </div>
          ))}
        </div>
        <div className="xe-production-caption">
          <strong>어떤 용지·잉크를 모의하는가?</strong>
          <span>출력 프로파일 · 모니터 상태 · 관찰 조명</span>
        </div>
      </Sheet>
    );
  const profile = termId === "icc-profile";
  return (
    <Sheet
      label={profile ? "PROFILE INFORMATION" : "COLOR WORKFLOW"}
      note="문서에서 서로 다른 목적지로 변환하는 개념도입니다. 실제 ICC 변환을 실행하지 않으며, 장치·용지에 맞는 프로파일과 제작처 조건을 사용해야 합니다."
    >
      <div className="xe-production-workflow">
        <div className="xe-production-profile-source">
          <span>원본 문서</span>
          <strong>poster.tif</strong>
          <p>색 값 + 문서 프로파일</p>
          <code>RGB + sRGB</code>
        </div>
        <p className="xe-production-profile-branch-label">목적에 따라 각각 변환</p>
        <div className="xe-production-profile-destinations">
          <div>
            <span>화면용 변환 ↓</span>
            <strong>모니터</strong>
            <p>{profile ? "디스플레이의 색 특성" : "모니터에 맞게 색 표시"}</p>
            <code>Display profile</code>
          </div>
          <div>
            <span>인쇄용 변환 ↓</span>
            <strong>종이 + 잉크</strong>
            <p>{profile ? "출력 조건의 색 특성" : "출력 조건으로 변환"}</p>
            <code>Output profile</code>
          </div>
        </div>
      </div>
    </Sheet>
  );
}

function OverlapExample({ termId }: { termId: string }) {
  const knockout = termId === "knockout";
  if (termId === "trapping")
    return (
      <Sheet
        label="REGISTRATION DETAIL"
        note="실제보다 크게 확대한 원리 설명입니다. 트래핑 폭과 방식은 제작처 조건에 맞춰 결정합니다."
      >
        <div className="xe-production-trap-pair">
          <div>
            <span>판이 어긋난 경계</span>
            <div className="xe-production-seam">
              <i />
              <b />
              <i />
            </div>
            <strong>종이색 틈</strong>
          </div>
          <div>
            <span>작은 겹침으로 보완</span>
            <div className="xe-production-seam xe-production-trapped">
              <i />
              <b />
              <i />
            </div>
            <strong>경계의 겹침</strong>
          </div>
        </div>
        <div className="xe-production-caption">
          <strong>맞닿는 색 사이를 보정</strong>
          <span>모든 도형을 무조건 확대하는 기능은 아닙니다.</span>
        </div>
      </Sheet>
    );
  return (
    <Sheet
      label={knockout ? "KNOCKOUT" : "OVERPRINT"}
      note="시안의 투명도 효과가 아니라 잉크판의 관계를 설명합니다. 합성 색은 화면용 개념 표현입니다."
    >
      <div className="xe-production-overlap">
        <svg
          viewBox="0 0 280 190"
          role="img"
          aria-label={
            knockout
              ? "시안 배경판의 원형 영역을 비우고 마젠타 원을 인쇄"
              : "시안 배경판을 유지한 채 마젠타 원을 겹쳐 인쇄"
          }
        >
          <rect x="30" y="20" width="220" height="145" fill="#00b6cf" />
          {knockout ? (
            <circle cx="150" cy="90" r="52" fill="#cf3988" />
          ) : (
            <>
              <circle cx="150" cy="90" r="52" fill="#cf3988" style={{ mixBlendMode: "multiply" }} />
            </>
          )}
          <text x="45" y="150" fontSize="14">
            C 판
          </text>
          <text x="133" y="96" fill="white" style={{ fill: "white" }} fontSize="17">
            M
          </text>
        </svg>
        <div>
          <strong>아래 C 판만 보기</strong>
          <svg
            viewBox="0 0 180 120"
            role="img"
            aria-label={knockout ? "배경판의 원 영역이 비어 있음" : "배경판이 전체 면에 유지됨"}
          >
            <rect x="10" y="10" width="160" height="100" fill="#00b6cf" />
            {knockout && <circle cx="96" cy="58" r="35" fill="white" />}
          </svg>
          <span>{knockout ? "위 객체 영역을 비움" : "위 객체 아래에도 잉크 유지"}</span>
        </div>
      </div>
    </Sheet>
  );
}

function PrintGeometry({ termId }: { termId: string }) {
  const terms: Record<string, [string, string]> = {
    bleed: ["도련", "재단선 밖까지 배경을 연장합니다."],
    "trim-size": ["재단 크기", "실선 안쪽이 완성물의 크기입니다."],
    "safe-area": ["안전 영역", "중요한 문자는 안쪽 안전선 안에 둡니다."],
    "crop-marks": ["재단 표시", "바깥의 짧은 선이 재단 위치를 가리킵니다."],
  };
  const [termLabel, termDescription] = terms[termId] ?? ["인쇄 구조", "제작 경계를 구분합니다."];
  return (
    <Sheet
      label="PRINT GEOMETRY"
      note="학습용 가상 엽서입니다. 수치·도련 폭·안전 여백·재단 표시 필요 여부는 제작처 지침을 따릅니다."
    >
      <div className={`xe-production-print xe-production-print-${termId}`}>
        <svg
          className="xe-production-svg"
          viewBox="0 0 420 300"
          role="img"
          aria-label="재단선 바깥의 도련, 안쪽 안전 영역, 모서리 바깥 재단 표시를 구분한 엽서"
        >
          <rect
            x="47"
            y="44"
            width="326"
            height="212"
            fill="#d9e8e2"
            stroke="#47776b"
            strokeWidth={termId === "bleed" ? 5 : 1}
          />
          <rect
            x="61"
            y="58"
            width="298"
            height="184"
            fill="none"
            stroke="#222"
            strokeWidth={termId === "trim-size" ? 4 : 1.5}
          />
          <rect
            x="84"
            y="81"
            width="252"
            height="138"
            fill="none"
            stroke="#47776b"
            strokeDasharray="6 5"
            strokeWidth={termId === "safe-area" ? 4 : 1.5}
          />
          <g stroke="#222" strokeWidth={termId === "crop-marks" ? 4 : 1.5}>
            <path d="M29 58H43 M61 25V40 M377 58H391 M359 25V40 M29 242H43 M61 260V275 M377 242H391 M359 260V275" />
          </g>
          <text x="103" y="118" fontSize="13" letterSpacing="3">
            MORAE BOOK CLUB
          </text>
          <text x="103" y="164" fontSize="34" fontWeight="700">
            함께 읽는 계절
          </text>
          <text x="103" y="197" fontSize="13">
            토요일 오후의 작은 책방
          </text>
        </svg>
      </div>
      <div className="xe-production-caption">
        <strong>{termLabel}</strong>
        <span>{termDescription}</span>
      </div>
      <ul className="xe-production-legend">
        <li>
          <i className="xe-production-bleed-key" />
          도련
        </li>
        <li>
          <i className="xe-production-trim-key" />
          재단선
        </li>
        <li>
          <i className="xe-production-safe-key" />
          안전선
        </li>
      </ul>
    </Sheet>
  );
}

function Preflight() {
  return (
    <Sheet
      label="PREFLIGHT REPORT"
      note="가상 검사 결과입니다. 실제 파일 검사를 실행하는 도구는 아니며 검사 프로파일의 역할을 보여줍니다."
    >
      <div className="xe-production-preflight">
        <header>
          <strong>morae_catalog.indd</strong>
          <span>인쇄 전달용 · 사용자 정의 프로파일</span>
        </header>
        <div>
          <b>확인 필요 3건</b>
          <dl>
            <div>
              <dt>링크 누락</dt>
              <dd>p.04 · cover-photo.tif</dd>
            </div>
            <div>
              <dt>텍스트 넘침</dt>
              <dd>p.08 · 행사 안내 본문</dd>
            </div>
            <div>
              <dt>이미지 해상도</dt>
              <dd>p.12 · 기준보다 낮은 유효 PPI</dd>
            </div>
          </dl>
        </div>
        <footer>수동 교정: 오탈자 · 내용 정확성 · 최종 레이아웃</footer>
      </div>
    </Sheet>
  );
}

function ResolutionExample({ termId }: { termId: string }) {
  if (termId === "dpi")
    return (
      <Sheet
        label="PIXEL / PRINT DOTS"
        note="한 픽셀과 출력 도트의 차이를 크게 확대한 개념도입니다. 특정 프린터의 도트 배열·개수를 재현한 것이 아닙니다."
      >
        <div className="xe-production-resolution">
          <div>
            <span>이미지의 한 픽셀</span>
            <div className="xe-production-one-pixel" />
            <strong>하나의 색 값</strong>
          </div>
          <div>
            <span>장치의 작은 출력 도트</span>
            <div className="xe-production-dot-grid">
              {Array.from({ length: 36 }, (_, i) => (
                <i
                  key={i}
                  style={{ background: ["#1c1c1c", "#00a8c1", "#c7387a", "#dfc132"][i % 4] }}
                />
              ))}
            </div>
            <strong>도트 조합으로 색조 표현</strong>
          </div>
        </div>
      </Sheet>
    );
  return (
    <Sheet
      label="EFFECTIVE PPI"
      note="출력 길이의 비율을 보여주는 도식입니다. 화면의 실제 길이가 8인치·16인치라는 뜻은 아닙니다."
    >
      <div className="xe-production-ppi">
        <div>
          <span>2400px 원본</span>
          <div className="xe-production-small-print">MORAE</div>
          <strong>8in → 300ppi</strong>
        </div>
        <div>
          <span>동일한 2400px 원본</span>
          <div className="xe-production-large-print">MORAE</div>
          <strong>16in → 150ppi</strong>
        </div>
      </div>
      <div className="xe-production-caption">
        <strong>같은 픽셀을 두 배 길이에 배치</strong>
        <span>유효 PPI는 절반 · 새 디테일이 생기지 않음</span>
      </div>
    </Sheet>
  );
}

function PathExample({ termId }: { termId: string }) {
  const anchor = termId === "anchor-point";
  return (
    <Sheet
      label={anchor ? "ANCHOR POINTS" : "BÉZIER SEGMENT"}
      note="원본 곡선을 SVG로 구성했습니다. 사각형은 경로 위의 앵커, 작은 원은 곡선 밖에 있을 수 있는 제어 핸들입니다."
    >
      <svg
        className="xe-production-svg"
        viewBox="0 0 420 260"
        role="img"
        aria-label="두 끝 앵커를 잇는 곡선과 앵커에서 뻗은 두 제어 핸들"
      >
        <path d="M65 194L120 40 M350 190L300 45" fill="none" stroke="#82978f" strokeWidth="2" />
        <path d="M65 194C120 40 300 45 350 190" fill="none" stroke="#181818" strokeWidth="4" />
        <circle cx="120" cy="40" r="6" fill="white" stroke="#47776b" strokeWidth="2" />
        <circle cx="300" cy="45" r="6" fill="white" stroke="#47776b" strokeWidth="2" />
        <rect x="59" y="188" width="12" height="12" fill="#47776b" />
        <rect x="344" y="184" width="12" height="12" fill="#47776b" />
        <text x="65" y="227">
          앵커
        </text>
        <text x="316" y="224">
          앵커
        </text>
        <text x="173" y="44">
          핸들
        </text>
        <text x="157" y="158" fontSize="14">
          {anchor ? "경로는 앵커를 통과" : "곡선은 핸들을 통과하지 않음"}
        </text>
      </svg>
      {anchor && (
        <div className="xe-production-caption">
          <strong>코너와 스무스</strong>
          <span>앵커 주변의 접선 연결 방식이 형태를 바꿉니다.</span>
        </div>
      )}
    </Sheet>
  );
}

function PixelVector({ termId }: { termId: string }) {
  return (
    <Sheet
      label={termId === "raster" ? "PIXEL STRUCTURE" : "PATH STRUCTURE"}
      note="같은 잎 모티프의 픽셀 구조와 경로 구조를 단순화한 비교입니다. 파일 확장자만으로 내용 유형을 판단하지 않습니다."
    >
      <div className="xe-production-vector-pair">
        <div>
          <svg viewBox="0 0 160 160" role="img" aria-label="작은 사각 픽셀로 표현한 잎">
            <g fill="#47776b">
              {(
                [
                  [5, 1],
                  [4, 2],
                  [5, 2],
                  [6, 2],
                  [3, 3],
                  [4, 3],
                  [5, 3],
                  [6, 3],
                  [2, 4],
                  [3, 4],
                  [4, 4],
                  [5, 4],
                  [6, 4],
                  [2, 5],
                  [3, 5],
                  [4, 5],
                  [5, 5],
                  [2, 6],
                  [3, 6],
                  [4, 6],
                  [2, 7],
                ] as const
              ).map(([x, y], i) => (
                <rect key={i} x={x * 16} y={y * 16} width="16" height="16" />
              ))}
            </g>
          </svg>
          <strong>래스터</strong>
          <span>각 픽셀의 색 정보</span>
        </div>
        <div>
          <svg viewBox="0 0 160 160" role="img" aria-label="매끄러운 베지에 곡선으로 표현한 잎">
            <path d="M32 126C24 54 68 20 116 18C116 90 86 112 32 126Z" fill="#47776b" />
            <path d="M32 126L91 49" stroke="white" strokeWidth="3" />
          </svg>
          <strong>벡터</strong>
          <span>점과 곡선의 관계</span>
        </div>
      </div>
    </Sheet>
  );
}

function MaskExample({ termId }: { termId: string }) {
  const id = useId().replace(/:/g, "");
  if (termId === "alpha-channel")
    return (
      <Sheet
        label="ALPHA / SAVED SELECTION"
        note="Photoshop의 선택 마스크를 설명하는 그림입니다. 저장된 알파 채널과 파일에 적용된 투명도는 별도로 확인합니다."
      >
        <div className="xe-production-alpha">
          <div className="xe-production-alpha-ramp" />
          <div>
            <span>검정 · 미선택</span>
            <span>회색 · 부분 선택</span>
            <span>흰색 · 선택</span>
          </div>
        </div>
        <div className="xe-production-caption">
          <strong>색과 별도로 저장하는 보조 값</strong>
          <span>선택 불러오기 → 마스크 적용 → 투명도 내보내기 확인</span>
        </div>
      </Sheet>
    );
  return (
    <Sheet
      label="CLIPPING MASK"
      note="원본 경로는 남아 있고 원형 경계 밖만 숨겨진 가상 작업물입니다. 이 예시는 실제 편집 도구가 아닙니다."
    >
      <div className="xe-production-vector-pair">
        <div>
          <svg viewBox="0 0 160 160" role="img" aria-label="전체 일러스트와 점선 원형 경계">
            <rect x="10" y="10" width="140" height="140" fill="#d9e8e2" />
            <path d="M10 130L55 50L90 100L123 40L150 130Z" fill="#47776b" />
            <circle cx="80" cy="80" r="58" fill="none" stroke="#111" strokeDasharray="4 4" />
          </svg>
          <strong>원본 + 마스크 경계</strong>
        </div>
        <div>
          <svg viewBox="0 0 160 160" role="img" aria-label="동일 일러스트가 원형 영역 안에만 보임">
            <defs>
              <clipPath id={`xe-production-${id}`}>
                <circle cx="80" cy="80" r="58" />
              </clipPath>
            </defs>
            <g clipPath={`url(#xe-production-${id})`}>
              <rect x="10" y="10" width="140" height="140" fill="#d9e8e2" />
              <path d="M10 130L55 50L90 100L123 40L150 130Z" fill="#47776b" />
            </g>
          </svg>
          <strong>보이는 결과</strong>
        </div>
      </div>
    </Sheet>
  );
}

function Ratios() {
  return (
    <Sheet
      label="FORMAT STUDY"
      note="각 비율에 맞춰 내용의 구도를 조정한 가상 표지입니다. 비율 변경은 단순한 가로·세로 늘이기와 다릅니다."
    >
      <div className="xe-production-ratios">
        {["16 / 9", "1 / 1", "4 / 5"].map((ratio, i) => (
          <div key={ratio}>
            <div style={{ aspectRatio: ratio }}>
              <span>MORAE</span>
              <i />
              <strong>
                READ
                <br />
                SLOW.
              </strong>
            </div>
            <b>{["16:9", "1:1", "4:5"][i]}</b>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

function BrandExamples({ termId }: { termId: string }) {
  if (termId === "brand-architecture")
    return (
      <Sheet
        label="BRAND RELATIONSHIPS"
        note="가상 브랜드 구조입니다. 하나의 가능한 구성으로, 모든 조직에 같은 위계가 필요한 것은 아닙니다."
      >
        <div className="xe-production-brand-tree">
          <strong>MORAE</strong>
          <span>책을 매개로 연결되는 브랜드</span>
          <div>
            <div>
              <b>MORAE BOOKS</b>
              <span>책방</span>
            </div>
            <div>
              <b>MORAE PRESS</b>
              <span>출판</span>
            </div>
            <div>
              <b>MORAE CLUB</b>
              <span>독서 모임</span>
            </div>
          </div>
        </div>
        <div className="xe-production-caption">
          <strong>관계가 이름과 표현으로 드러남</strong>
          <span>상위 브랜드 공유 · 서비스별 이름 구분</span>
        </div>
      </Sheet>
    );
  if (termId === "wordmark" || termId === "lettermark")
    return (
      <Sheet
        label="IDENTITY SPECIMEN"
        note="교육용으로 만든 가상 브랜드의 문자형 로고입니다. 기존 브랜드 로고를 복제하지 않았습니다."
      >
        <div
          className={`xe-production-mark${termId === "lettermark" ? " xe-production-lettermark" : ""}`}
        >
          <span>{termId === "lettermark" ? "MP" : "MORAE"}</span>
          <small>{termId === "lettermark" ? "MORAE PRESS" : "BOOKS & CONVERSATIONS"}</small>
        </div>
        <div className="xe-production-mark-uses">
          <div>
            {termId === "lettermark" ? "MP" : "MORAE"}
            <small>책등</small>
          </div>
          <div>
            {termId === "lettermark" ? "MP" : "MORAE"}
            <small>패키지</small>
          </div>
        </div>
        <div className="xe-production-caption">
          <strong>
            {termId === "lettermark" ? "머리글자로 표현한 레터마크" : "이름 자체로 표현한 워드마크"}
          </strong>
          <span>작은 크기에서도 읽힘과 식별성을 확인합니다.</span>
        </div>
      </Sheet>
    );
  if (termId === "brand-guidelines")
    return (
      <Sheet
        label="BRAND GUIDELINES / 01"
        note="가상 브랜드의 일부 규칙 예시입니다. 표시된 보호 공간과 색 규칙은 이 예시 안에서만 적용됩니다."
      >
        <div className="xe-production-guideline">
          <div className="xe-production-exclusion">
            <span>MORAE</span>
            <small>보호 공간 · 이 예시의 규칙</small>
          </div>
          <dl>
            <div>
              <dt>로고</dt>
              <dd>승인된 원본 비율 유지</dd>
            </div>
            <div>
              <dt>색상</dt>
              <dd>
                <i />
                FOREST · INK · PAPER
              </dd>
            </div>
            <div>
              <dt>타입</dt>
              <dd>제목과 본문의 역할 구분</dd>
            </div>
            <div>
              <dt>피해야 할 사용</dt>
              <dd>왜곡 · 임의 색 교체 · 배경 대비 부족</dd>
            </div>
          </dl>
        </div>
      </Sheet>
    );
  if (termId === "art-direction")
    return (
      <Sheet
        label="ART DIRECTION / MORAE TEA"
        note="가상 캠페인의 방향을 설명하는 원본 일러스트입니다. 동일한 표현 의도를 서로 다른 구도에 적용했습니다."
      >
        <div className="xe-production-direction">
          {[0, 1].map((i) => (
            <div key={i} className={`xe-production-tea xe-production-tea-${i}`}>
              <span>MORAE TEA</span>
              <div className="xe-production-cup">
                <i />
              </div>
              <strong>{i === 0 ? "잠깐의 고요." : "A QUIET PAUSE."}</strong>
            </div>
          ))}
        </div>
        <div className="xe-production-caption">
          <strong>의도: 일상 속의 고요</strong>
          <span>절제된 색 · 측면광의 인상 · 넓은 여백 · 차분한 타입</span>
        </div>
      </Sheet>
    );
  return (
    <Sheet
      label="POSITIONING BRIEF"
      note="실제 시장 조사 결과가 아닌 가상 브랜드의 전략 초안입니다. 고객이 이 가치를 인식하는지는 별도 검증해야 합니다."
    >
      <div className="xe-production-position">
        <span>모래 책방</span>
        <h5>
          책을 고르는 시간을
          <br />
          대화로 바꿉니다.
        </h5>
        <dl>
          <div>
            <dt>누구에게</dt>
            <dd>혼자 고르기 어려운 독자</dd>
          </div>
          <div>
            <dt>다른 점</dt>
            <dd>대화에 기반한 큐레이션</dd>
          </div>
          <div>
            <dt>약속의 근거</dt>
            <dd>선정 이유 · 작은 독서 모임</dd>
          </div>
        </dl>
      </div>
    </Sheet>
  );
}

export function ProductionExamples({ termId }: { termId: string }) {
  let content: ReactNode = null;
  if (["rgb", "cmyk", "spot-color"].includes(termId)) content = <InkExample termId={termId} />;
  else if (["color-gamut", "icc-profile", "color-management", "soft-proof"].includes(termId))
    content = <ColorWorkflow termId={termId} />;
  else if (["overprint", "knockout", "trapping"].includes(termId))
    content = <OverlapExample termId={termId} />;
  else if (["bleed", "trim-size", "safe-area", "crop-marks"].includes(termId))
    content = <PrintGeometry termId={termId} />;
  else if (termId === "preflight") content = <Preflight />;
  else if (["ppi", "dpi"].includes(termId)) content = <ResolutionExample termId={termId} />;
  else if (["raster", "vector"].includes(termId)) content = <PixelVector termId={termId} />;
  else if (["bezier-curve", "anchor-point"].includes(termId))
    content = <PathExample termId={termId} />;
  else if (["clipping-mask", "alpha-channel"].includes(termId))
    content = <MaskExample termId={termId} />;
  else if (termId === "aspect-ratio") content = <Ratios />;
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
    content = <BrandExamples termId={termId} />;
  return content ? (
    <div className="xe-production-root" data-expanded-example={termId}>
      {content}
    </div>
  ) : null;
}
