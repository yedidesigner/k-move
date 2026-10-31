import type { ReactNode } from "react";
import "./interaction-examples.css";

const cx = "xe-interaction-";
function Button({
  children,
  secondary = false,
  className = "",
}: {
  children: ReactNode;
  secondary?: boolean;
  className?: string;
}) {
  return (
    <span className={`${cx}button ${secondary ? `${cx}secondary` : ""} ${className}`}>
      {children}
    </span>
  );
}
function Screen({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${cx}screen ${className}`}>
      <div className={`${cx}bar`}>
        <span>문장 STUDIO</span>
        <span>{title}</span>
      </div>
      <div className={`${cx}content`}>{children}</div>
    </div>
  );
}
function Note({ children }: { children: ReactNode }) {
  return <p className={`${cx}note`}>{children}</p>;
}
function Field({ label, value, error = false }: { label: string; value: string; error?: boolean }) {
  return (
    <div className={`${cx}field-wrap`}>
      <strong>{label}</strong>
      <div className={`${cx}field ${error ? `${cx}field-error` : ""}`}>{value}</div>
    </div>
  );
}
function Row({ title, detail }: { title: string; detail: string }) {
  return (
    <div className={`${cx}row`}>
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}
function Choice({
  type,
  checked,
  children,
}: {
  type: "check" | "radio";
  checked?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`${cx}choice`}>
      <span
        className={`${cx}mark ${cx}${type} ${checked ? `${cx}checked` : ""}`}
        aria-hidden="true"
      >
        {type === "check" && checked ? "✓" : ""}
      </span>
      <span>{children}</span>
      <small>{checked ? "선택됨" : "선택 안 됨"}</small>
    </div>
  );
}
function Document({ number = "01", children }: { number?: string; children?: ReactNode }) {
  return (
    <div className={`${cx}document`}>
      <span>{number}</span>
      <div>
        <strong>{children ?? "도시의 작은 책방"}</strong>
        <p>공간 브랜딩 · 프로젝트 기록</p>
      </div>
    </div>
  );
}
function Scene({ termId }: { termId: string }) {
  switch (termId) {
    case "accordion":
      return (
        <Screen title="이용 안내">
          <h5>자주 묻는 질문</h5>
          <div className={`${cx}accordion`}>
            <div>
              <strong>배송은 얼마나 걸리나요?</strong>
              <span>−</span>
            </div>
            <p>
              출고 후 2–3일이 걸립니다.
              <br />
              배송 시작 시 알림을 보내 드려요.
            </p>
            <div>
              <strong>교환은 어떻게 하나요?</strong>
              <span>＋</span>
            </div>
            <div>
              <strong>주문을 취소할 수 있나요?</strong>
              <span>＋</span>
            </div>
          </div>
          <Note>첫 번째 패널만 펼친 상태</Note>
        </Screen>
      );
    case "tabs":
      return (
        <Screen title="상품 상세">
          <h5>주말의 기록 노트</h5>
          <div className={`${cx}tabs`}>
            <span>상세 정보</span>
            <strong>이용 안내</strong>
            <span>리뷰 12</span>
          </div>
          <div className={`${cx}panel`}>
            <strong>이용 안내</strong>
            <p>매일 한 장씩 기록해 보세요.</p>
            <Row title="구성" detail="본문 80쪽 · 무선 제본" />
            <Row title="크기" detail="148 × 210mm" />
          </div>
          <Note>활성 탭과 연결된 패널을 함께 표시</Note>
        </Screen>
      );
    case "breadcrumbs":
      return (
        <Screen title="자료실">
          <div className={`${cx}crumbs`}>
            <span>홈</span>
            <i>›</i>
            <span>자료실</span>
            <i>›</i>
            <span>타이포그래피</span>
            <i>›</i>
            <strong>가독성 가이드</strong>
          </div>
          <h5>가독성 가이드</h5>
          <p>글을 오래 읽을 수 있는 화면은 어떻게 만들까요?</p>
          <div className={`${cx}article-lines`}>
            <i />
            <i />
            <i />
          </div>
          <Note>방문 기록이 아니라 현재 문서의 상위 경로</Note>
        </Screen>
      );
    case "modal-dialog":
      return (
        <Screen title="문서 관리">
          <div className={`${cx}modal-stage`}>
            <div className={`${cx}dimmed`}>
              <Document />
              <Document number="02">전시 공간 관찰</Document>
            </div>
            <div className={`${cx}modal`}>
              <span className={`${cx}close`} aria-hidden="true">
                ×
              </span>
              <strong>문서를 삭제할까요?</strong>
              <p>‘도시의 작은 책방’ 문서가 삭제됩니다.</p>
              <div className={`${cx}actions`}>
                <Button secondary>취소</Button>
                <Button>삭제</Button>
              </div>
            </div>
          </div>
          <Note>열린 모달 상태 · 배경 조작 제한을 표현한 정적 그림</Note>
        </Screen>
      );
    case "popover":
      return (
        <Screen title="팀 문서">
          <h5>도시의 작은 책방</h5>
          <p>팀과 함께 편집하는 프로젝트 문서</p>
          <div className={`${cx}anchor-stage`}>
            <Button secondary>공유 범위 ∨</Button>
            <div className={`${cx}popover`}>
              <strong>문서 접근 권한</strong>
              <p>초대된 사람만 열람</p>
              <div className={`${cx}avatar-row`}>
                <span>서</span>
                <span>윤</span>
                <small>팀원 2명</small>
              </div>
              <div className={`${cx}link-text`}>링크 복사</div>
            </div>
          </div>
          <Note>공유 버튼과 가까이 붙어 있는 보조 레이어</Note>
        </Screen>
      );
    case "tooltip":
      return (
        <Screen title="편집 도구">
          <h5>도구의 의미</h5>
          <div className={`${cx}toolbar`}>
            <span>Aa</span>
            <span>B</span>
            <div className={`${cx}tooltip-target`}>
              <span aria-hidden="true">↗</span>
              <div className={`${cx}tooltip`}>새 탭에서 열기</div>
            </div>
            <span>⋯</span>
          </div>
          <Note>아이콘에 포커스를 둔 상태의 보조 설명 · 정적 예시</Note>
        </Screen>
      );
    case "toast":
      return (
        <Screen title="내 자료">
          <h5>저장한 문서</h5>
          <Document />
          <div className={`${cx}saved-label`}>✓ 즐겨찾기에 저장됨</div>
          <div className={`${cx}toast`}>
            <span>✓</span>
            <strong>문서를 저장했습니다</strong>
            <span aria-hidden="true">×</span>
          </div>
          <Note>잠시 보이는 알림과 목록에 남는 저장 표시</Note>
        </Screen>
      );
    case "dropdown":
      return (
        <div className={`${cx}two`}>
          <Screen title="값 선택">
            <Field label="정렬 기준" value="최신순 ∨" />
            <div className={`${cx}option-list`}>
              <strong>✓ 최신순</strong>
              <span>제목순</span>
              <span>수정일순</span>
            </div>
            <Note>선택한 값이 남음</Note>
          </Screen>
          <Screen title="명령 메뉴">
            <Button secondary>더 보기 ∨</Button>
            <div className={`${cx}option-list`}>
              <span>복제</span>
              <span>이름 변경</span>
              <span>삭제</span>
            </div>
            <Note>명령을 실행함</Note>
          </Screen>
        </div>
      );
    case "checkbox":
      return (
        <Screen title="관심 분야">
          <h5>어떤 분야가 궁금한가요?</h5>
          <p>관심 분야를 모두 선택해 주세요.</p>
          <Choice type="check" checked>
            브랜딩
          </Choice>
          <Choice type="check" checked>
            UX 리서치
          </Choice>
          <Choice type="check">모션 디자인</Choice>
          <Note>브랜딩과 UX 리서치를 동시에 선택한 상태</Note>
        </Screen>
      );
    case "radio-button":
      return (
        <Screen title="배송 방식">
          <h5>어떻게 받으시겠어요?</h5>
          <Choice type="radio" checked>
            일반 배송 · 3,000원
          </Choice>
          <Choice type="radio">매장 수령 · 무료</Choice>
          <Choice type="radio">빠른 배송 · 6,000원</Choice>
          <Note>같은 질문에 대한 선택은 한 개</Note>
        </Screen>
      );
    case "toggle-switch":
      return (
        <Screen title="알림 설정">
          <h5>댓글 알림</h5>
          <p>새 댓글이 등록되면 알려 드립니다.</p>
          <div className={`${cx}switch-comparison`}>
            <div>
              <span className={`${cx}switch`}>
                <i />
              </span>
              <strong>꺼짐</strong>
            </div>
            <div>
              <span className={`${cx}switch ${cx}switch-on`}>
                <i />
              </span>
              <strong>켜짐</strong>
            </div>
          </div>
          <Note>설정 이름은 그대로 · on/off 두 상태 비교</Note>
        </Screen>
      );
    case "combobox":
      return (
        <Screen title="지역 선택">
          <Field label="지역" value="서울 │ ⌄" />
          <div className={`${cx}option-list`}>
            <strong>서울 서초</strong>
            <span>서울 강남</span>
            <span>서울 마포</span>
          </div>
          <Note>‘서울’ 입력에 맞는 후보를 펼친 상태 · 아직 선택 확정 전</Note>
        </Screen>
      );
    case "progress-indicator":
      return (
        <Screen title="파일 업로드">
          <h5>포트폴리오 업로드</h5>
          <Row title="파일 6 / 10개" detail="60%" />
          <div className={`${cx}progress-track`}>
            <i />
          </div>
          <p className={`${cx}muted`}>진행률을 계산할 수 있는 경우</p>
          <div className={`${cx}divider`} />
          <div className={`${cx}busy-row`}>
            <span className={`${cx}spinner`} />
            <strong>파일을 검사하고 있습니다</strong>
          </div>
          <p className={`${cx}muted`}>진행률을 알 수 없는 경우 · 수치 없음</p>
        </Screen>
      );
    case "skeleton-screen":
      return (
        <div className={`${cx}two`}>
          <Screen title="불러오는 중">
            <div className={`${cx}skeleton`}>
              <i />
              <div>
                <i />
                <i />
              </div>
            </div>
            <div className={`${cx}skeleton`}>
              <i />
              <div>
                <i />
                <i />
              </div>
            </div>
            <Note>콘텐츠의 자리만 먼저 표시</Note>
          </Screen>
          <Screen title="불러온 후">
            <Document />
            <Document number="02">전시 공간 관찰</Document>
            <Note>같은 자리에 내용이 채워짐</Note>
          </Screen>
        </div>
      );
    case "empty-state":
      return (
        <Screen title="검색 결과">
          <div className={`${cx}query`}>검색: 타이포그래피 · 태그: 미완료</div>
          <div className={`${cx}empty`}>
            <span aria-hidden="true">□</span>
            <h5>조건에 맞는 문서가 없어요</h5>
            <p>선택한 태그를 줄여 보세요.</p>
            <Button secondary>필터 초기화</Button>
          </div>
          <Note>검색 결과 없음 · 첫 사용 상태와 다른 안내</Note>
        </Screen>
      );
    case "error-state":
      return (
        <Screen title="신청 정보">
          <h5>연락받을 이메일</h5>
          <Field label="이메일" value="hello.example.com" error />
          <p className={`${cx}error-message`}>! @를 포함한 이메일 주소를 입력해 주세요.</p>
          <Field label="이름" value="김문장" />
          <Note>문제 입력값과 정상 입력값을 모두 보존한 상태</Note>
        </Screen>
      );
    case "loading-state":
      return (
        <Screen title="문서 편집">
          <h5>도시의 작은 책방</h5>
          <p>독립 서점의 방문 경험을 기록했습니다.</p>
          <div className={`${cx}article-lines`}>
            <i />
            <i />
            <i />
          </div>
          <div className={`${cx}actions`}>
            <Button className={`${cx}pending`}>
              <span className={`${cx}spinner`} /> 저장 중
            </Button>
            <small>다시 누를 필요 없어요</small>
          </div>
          <Note>요청을 받은 뒤 결과를 기다리는 상태 · 정지된 예시</Note>
        </Screen>
      );
    case "focus-state":
      return (
        <Screen title="목록 필터">
          <h5>문서 상태</h5>
          <div className={`${cx}states`}>
            <div>
              <Button>전체</Button>
              <span>선택됨</span>
            </div>
            <div>
              <Button secondary className={`${cx}focus`}>
                진행 중
              </Button>
              <span>키보드 포커스</span>
            </div>
            <div>
              <Button secondary className={`${cx}hover`}>
                완료
              </Button>
              <span>hover 비교</span>
            </div>
          </div>
          <Note>선택값과 입력 위치는 독립적인 상태</Note>
        </Screen>
      );
    case "disabled-state":
      return (
        <Screen title="제출 전 확인">
          <h5>프로젝트 제출</h5>
          <Choice type="check">공개 범위를 확인했습니다</Choice>
          <p>확인을 마치면 제출할 수 있습니다.</p>
          <div className={`${cx}actions`}>
            <Button className={`${cx}disabled`}>제출하기</Button>
            <small>현재 사용 불가</small>
          </div>
          <Note>사용할 수 없는 이유를 버튼 밖에서도 읽을 수 있음</Note>
        </Screen>
      );
    case "pagination":
      return (
        <Screen title="문서 검색">
          <h5>브랜딩 검색 결과</h5>
          <p>41–60 / 전체 120개</p>
          <Document number="41" />
          <Document number="42">전시 공간 관찰</Document>
          <div className={`${cx}pagination`}>
            <span>‹ 이전</span>
            <span>1</span>
            <span>2</span>
            <strong>3</strong>
            <span>4</span>
            <span>다음 ›</span>
          </div>
          <Note>현재 3페이지 · 명시적인 구간 이동</Note>
        </Screen>
      );
    case "infinite-scroll":
      return (
        <Screen title="디자인 피드">
          <h5>작업 기록 둘러보기</h5>
          <Document number="11" />
          <Document number="12">전시 공간 관찰</Document>
          <div className={`${cx}load-boundary`}>↓ 이 지점에서 다음 묶음 불러오기</div>
          <Document number="13">편집 디자인 관찰</Document>
          <Document number="14">생활 속 타이포그래피</Document>
          <Note>스크롤에 따라 아래에 항목이 추가되는 구조 · 정적 도해</Note>
        </Screen>
      );
    case "progressive-disclosure":
      return (
        <Screen title="문서 내보내기">
          <h5>내보내기</h5>
          <Field label="파일 형식" value="PDF ∨" />
          <Field label="페이지" value="전체 페이지" />
          <div className={`${cx}disclosure-row`}>∨ 추가 설정</div>
          <div className={`${cx}extra-settings`}>
            <Row title="이미지 품질" detail="높음" />
            <Row title="메타데이터" detail="포함" />
          </div>
          <Button>PDF 내보내기</Button>
          <Note>핵심 설정을 먼저 제시하고 부가 옵션을 펼친 모습</Note>
        </Screen>
      );
    case "affordance":
      return (
        <Screen title="행동 가능성">
          <div className={`${cx}door-scene`}>
            <svg
              viewBox="0 0 300 185"
              role="img"
              aria-label="손을 넣어 잡을 수 있는 문 손잡이와 당기는 방향"
            >
              <rect
                x="45"
                y="10"
                width="135"
                height="164"
                fill="#f3f5f4"
                stroke="#323937"
                strokeWidth="2"
              />
              <path d="M145 62h20v56h-20" fill="none" stroke="#244d46" strokeWidth="9" />
              <path
                d="M185 90h55m-15-11 15 11-15 11"
                fill="none"
                stroke="#244d46"
                strokeWidth="2"
              />
              <text x="105" y="153" fontSize="12" textAnchor="middle">
                손잡이에 손을 넣고 잡기
              </text>
              <text x="233" y="122" fontSize="12" textAnchor="middle">
                당기기
              </text>
            </svg>
            <p>손의 능력 + 손잡이의 구조</p>
          </div>
          <Note>실제로 가능한 행동 · 문에 적힌 안내문과는 다른 개념</Note>
        </Screen>
      );
    case "signifier":
      return (
        <Screen title="행동을 알리는 단서">
          <h5>전시 공간 관찰</h5>
          <p>관찰 장소와 기록 방법을 확인해 보세요.</p>
          <div className={`${cx}signal-demo`}>
            <span className={`${cx}link-text`}>이용 안내 보기 ↗</span>
            <small>밑줄 + 목적이 분명한 문구</small>
          </div>
          <div className={`${cx}divider`} />
          <div className={`${cx}drag-item`}>
            <span aria-hidden="true">⠿</span>
            <strong>관찰 기록 01</strong>
            <small>순서 이동 핸들</small>
          </div>
          <Note>단서가 암시하는 행동과 실제 동작이 일치해야 함</Note>
        </Screen>
      );
    case "design-token":
      return (
        <Screen title="시스템 값 연결">
          <div className={`${cx}token-flow`}>
            <div>
              <small>의미 토큰</small>
              <code>color.text.primary</code>
            </div>
            <span>↓ 참조</span>
            <div>
              <small>밝은 테마의 기본 값</small>
              <code>neutral.950 → #171717</code>
            </div>
            <span>↓ 적용</span>
            <div className={`${cx}token-result`}>
              <strong>문서 제목</strong>
              <p>같은 의미를 여러 화면에 적용</p>
            </div>
          </div>
          <Note>어두운 테마에서는 같은 의미 이름이 다른 값으로 연결될 수 있음</Note>
        </Screen>
      );
    case "component-variant":
      return (
        <Screen title="Button 컴포넌트">
          <div className={`${cx}variant-grid`}>
            <span />
            <strong>Primary</strong>
            <strong>Secondary</strong>
            <strong>Small</strong>
            <Button className={`${cx}small`}>저장</Button>
            <Button secondary className={`${cx}small`}>
              저장
            </Button>
            <strong>Large</strong>
            <Button>저장하기</Button>
            <Button secondary>저장하기</Button>
          </div>
          <Note>역할은 같고 크기·강조 속성이 다른 네 가지 조합</Note>
        </Screen>
      );
    case "auto-layout":
      return (
        <Screen title="내용에 따라 늘어나는 버튼">
          <div className={`${cx}auto-demo`}>
            <div>
              <Button>저장</Button>
              <span>짧은 레이블</span>
            </div>
            <div>
              <Button>변경 사항 저장</Button>
              <span>긴 레이블</span>
            </div>
          </div>
          <div className={`${cx}padding-rule`}>
            <span>16px</span>
            <strong>텍스트 너비</strong>
            <span>16px</span>
          </div>
          <Note>좌우 패딩은 유지하고 콘텐츠에 맞춰 너비 조정 · 예시 수치</Note>
        </Screen>
      );
    case "breakpoint":
      return (
        <Screen title="같은 콘텐츠, 다른 배치">
          <div className={`${cx}responsive-wide`}>
            <small>넓은 영역</small>
            <div>
              <span>문서 01</span>
              <span>문서 02</span>
              <span>문서 03</span>
            </div>
          </div>
          <div className={`${cx}responsive-narrow`}>
            <small>좁은 영역</small>
            <span>문서 01</span>
            <span>문서 02</span>
            <span>문서 03</span>
          </div>
          <Note>읽는 순서와 내용은 유지 · 콘텐츠가 좁아지는 지점에서 열 변경</Note>
        </Screen>
      );
    case "touch-target":
      return (
        <Screen title="아이콘과 활성 영역">
          <div className={`${cx}target-scene`}>
            <div className={`${cx}target-box`}>
              <span aria-hidden="true">×</span>
            </div>
            <div>
              <strong>보이는 기호: 20px</strong>
              <p>활성 영역 예시: 44 × 44px (확대 도해)</p>
              <small>점선은 조작 영역을 설명하는 표시</small>
            </div>
          </div>
          <div className={`${cx}target-neighbors`}>
            <span>✎</span>
            <span>×</span>
            <small>서로 겹치지 않는 타깃</small>
          </div>
          <Note>예시 수치는 설계 선택. WCAG AA 최소 기준과 예외는 상세 해설에서 구분.</Note>
        </Screen>
      );
    case "reduced-motion":
      return (
        <Screen title="모션 선택 비교">
          <div className={`${cx}motion-row`}>
            <strong>일반 전환</strong>
            <div>
              <span>A</span>
              <i>→</i>
              <span className={`${cx}motion-mid`}>A / B</span>
              <i>→</i>
              <span>B</span>
            </div>
            <small>이동하는 중간 장면</small>
          </div>
          <div className={`${cx}motion-row`}>
            <strong>모션 줄이기</strong>
            <div>
              <span>A</span>
              <i>→</i>
              <span>B</span>
            </div>
            <small>중간 이동을 줄이고 최종 상태 유지</small>
          </div>
          <Note>안전한 비교를 위한 정적 도해 · 실제 애니메이션 없음</Note>
        </Screen>
      );
    default:
      return null;
  }
}

export function InteractionExamples({ termId }: { termId: string }) {
  return (
    <div className={`${cx}example`} data-expanded-example={termId}>
      <p className={`${cx}eyebrow`}>K-Move 가상 화면 · 정적 상태 예시</p>
      <Scene termId={termId} />
    </div>
  );
}
