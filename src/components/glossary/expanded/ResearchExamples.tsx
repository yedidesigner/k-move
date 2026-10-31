import type { ReactNode } from "react";
import research from "@/data/expansion/research.json";
import "./research-examples.css";

function Paper({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="xe-research-paper">
      <h4>{title}</h4>
      {children}
    </section>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="xe-research-note">{children}</p>;
}

function Web({ children, selected = "" }: { children: ReactNode; selected?: string }) {
  return (
    <div className="xe-research-web">
      <div className="xe-research-webbar">
        <strong>NAMU</strong>
        <span>가상 예약 서비스</span>
      </div>
      <div className="xe-research-nav">
        <span>공간 찾기</span>
        <span className={selected === "bookings" ? "xe-research-selected" : ""}>내 예약</span>
        <span>도움말</span>
      </div>
      <div className="xe-research-webbody">{children}</div>
    </div>
  );
}

function Steps({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ol className="xe-research-steps">
      {items.map((item, index) => (
        <li key={item.title}>
          <span className="xe-research-stepnum">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>{item.title}</strong>
            <p>{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Scene({ termId }: { termId: string }) {
  switch (termId) {
    case "card-sorting":
      return (
        <>
          <p className="xe-research-task">같이 찾을 것 같은 항목을 묶어 주세요.</p>
          <div className="xe-research-two">
            <Paper title="참여자가 붙인 이름 · 예약 관리">
              <div className="xe-research-card">예약 변경</div>
              <div className="xe-research-card">예약 취소</div>
            </Paper>
            <Paper title="참여자가 붙인 이름 · 결제 내역">
              <div className="xe-research-card">영수증</div>
              <div className="xe-research-card">결제 수단</div>
            </Paper>
          </div>
          <Note>
            “예약한 뒤 바꾸는 일은 같은 묶음 같아요.” — 가상 참여자의 분류 이유. 이 묶음은 최종
            메뉴의 정답이 아닙니다.
          </Note>
        </>
      );
    case "tree-testing":
      return (
        <>
          <p className="xe-research-task">과업 · 예약을 취소하는 곳을 찾아보세요.</p>
          <Paper title="화면 장식 없이 메뉴 구조만 평가">
            <ul className="xe-research-tree">
              <li>공간 찾기</li>
              <li>
                <strong>내 예약</strong>
                <ul>
                  <li>
                    <strong>예약 관리</strong>
                    <ul>
                      <li>날짜 변경</li>
                      <li className="xe-research-selected">예약 취소 ← 도착 위치</li>
                    </ul>
                  </li>
                  <li>지난 예약</li>
                </ul>
              </li>
              <li>이용 안내</li>
            </ul>
          </Paper>
          <Note>
            기록할 것: 첫 선택, 거친 경로, 되돌아감, 최종 도착. 실제 화면의 메뉴 발견 가능성은
            별도로 확인합니다.
          </Note>
        </>
      );
    case "first-click-testing":
      return (
        <>
          <p className="xe-research-task">
            과업 · 예약한 날짜를 바꾸려고 합니다. 어디서 시작할까요?
          </p>
          <Web selected="bookings">
            <span className="xe-research-pointer">↑ 첫 클릭 기록 위치 · 내 예약</span>
            <h4>작업하기 좋은 공간</h4>
            <div className="xe-research-room">
              <span>중앙 스튜디오</span>
              <small>자연광 · 2–4인 · 시간 예약</small>
            </div>
          </Web>
          <Note>
            강조 표시는 관찰 결과를 설명하기 위한 것입니다. 실제 테스트에서는 이 힌트를 보여주지
            않습니다. 첫 클릭 뒤의 완료 여부는 여기서 확인되지 않았습니다.
          </Note>
        </>
      );
    case "heuristic-evaluation":
      return (
        <>
          <Web>
            <h4>예약 요청</h4>
            <div className="xe-research-plainfield">11월 12일 · 14:00–16:00</div>
            <span className="xe-research-staticbutton">예약 요청하기</span>
            <p className="xe-research-warning">관찰된 상태 · 누른 뒤 아무 변화가 없음</p>
          </Web>
          <Paper title="평가 기록 · 시스템 상태의 가시성">
            <dl className="xe-research-dl">
              <dt>문제</dt>
              <dd>요청 중인지, 실패했는지 구분할 수 없음</dd>
              <dt>예상 영향</dt>
              <dd>중복 요청을 시도할 수 있음</dd>
              <dt>수정 가설</dt>
              <dd>처리 중 상태와 완료 / 실패 결과를 구분</dd>
            </dl>
          </Paper>
          <Note>
            원칙에 따른 전문가의 발견입니다. 실제 사용자가 겪는 빈도는 사용자 조사로 확인합니다.
          </Note>
        </>
      );
    case "cognitive-walkthrough":
      return (
        <>
          <p className="xe-research-task">처음 쓰는 사람이 예약 날짜를 변경하는 과업</p>
          <Steps
            items={[
              {
                title: "내 예약을 찾는다",
                text: "현재 목표와 ‘내 예약’이라는 이름을 연결할 수 있는가?",
              },
              { title: "날짜 변경을 선택한다", text: "예약 상세에서 가능한 행동이 보이는가?" },
              {
                title: "변경 결과를 확인한다",
                text: "새 날짜가 반영되었다는 피드백을 이해할 수 있는가?",
              },
            ]}
          />
          <Note>
            단계마다 목표 → 행동 단서 → 결과를 검토합니다. 실제 참여자의 행동 기록을 대신하지
            않습니다.
          </Note>
        </>
      );
    case "contextual-inquiry":
      return (
        <>
          <Paper title="현장 · 스튜디오 안내 데스크">
            <div className="xe-research-desk">
              <div className="xe-research-device">
                <strong>예약 목록</strong>
                <span>14:00 · 작은 방</span>
                <span>15:00 · 큰 방</span>
              </div>
              <div className="xe-research-paperpad">
                <strong>종이 메모</strong>
                <span>전화로 받은 시간 변경</span>
              </div>
              <div className="xe-research-phone">전화 응대</div>
            </div>
          </Paper>
          <dl className="xe-research-observation">
            <dt>관찰</dt>
            <dd>전화 중 변경 시간을 메모한 뒤 시스템에 다시 입력함</dd>
            <dt>중립적 질문</dt>
            <dd>“방금 메모한 내용을 언제 다시 옮기시나요?”</dd>
          </dl>
          <Note>화면만 보지 않고 도구, 방해 요소, 작업 순서를 함께 관찰한 가상 기록입니다.</Note>
        </>
      );
    case "diary-study":
      return (
        <>
          <Paper title="예약 도구 사용 일지 · 시간에 따른 기록">
            <div className="xe-research-diary">
              <article>
                <time>DAY 01 · 출근 중</time>
                <strong>모바일로 빈 시간 확인</strong>
                <p>통신이 끊겨 나중에 다시 확인했다.</p>
              </article>
              <article>
                <time>DAY 03 · 회의 직후</time>
                <strong>팀 일정과 대조</strong>
                <p>동료 답변을 기다리느라 예약을 미뤘다.</p>
              </article>
              <article>
                <time>DAY 06 · 공간 도착</time>
                <strong>출입 안내 다시 열기</strong>
                <p>확인 메일에서 출입 정보를 찾았다.</p>
              </article>
            </div>
          </Paper>
          <Note>
            가상 자기 보고 기록입니다. 기록 누락이나 회상의 한계가 있으므로 모든 실제 행동을 직접
            관찰한 것으로 해석하지 않습니다.
          </Note>
        </>
      );
    case "moderated-usability-testing":
      return (
        <>
          <div className="xe-research-two">
            <Paper title="참여자 · 과업 수행">
              <div className="xe-research-device">
                <strong>내 예약</strong>
                <span>중앙 스튜디오 · 14:00</span>
                <span className="xe-research-outlined">날짜 변경</span>
              </div>
              <p>“취소하지 않고 시간을 바꿀 수 있나요?”</p>
            </Paper>
            <Paper title="진행자 · 중립적 관찰">
              <span className="xe-research-tag">정답이나 경로를 안내하지 않음</span>
              <p>“지금 무엇을 생각하고 계신가요?”</p>
              <div className="xe-research-log">
                기록 · 변경 항목을 찾기 전 예약 취소를 먼저 읽음
              </div>
            </Paper>
          </div>
          <Note>
            진행자가 같은 세션에서 관찰하고 필요한 후속 질문을 합니다. 도움을 준 시점은 결과와 함께
            기록합니다.
          </Note>
        </>
      );
    case "unmoderated-usability-testing":
      return (
        <>
          <Paper title="참여자에게 미리 제공되는 과업">
            <span className="xe-research-tag">진행자 없이 수행</span>
            <h4>다음 주 예약 시간을 바꿔 주세요.</h4>
            <p>진행하며 생각나는 점을 말해 주세요. 막히면 어디에서 막혔는지 설명해 주세요.</p>
            <div className="xe-research-plainfield">가상 테스트 화면 · 예약 서비스 프로토타입</div>
          </Paper>
          <Paper title="연구자가 나중에 검토할 기록">
            <div className="xe-research-log">
              00:12 예약 상세 열기
              <br />
              00:25 날짜 변경 찾기
              <br />
              00:41 변경 확인 화면
            </div>
          </Paper>
          <Note>
            이 그림은 세션 구조의 예시이며 실제 녹화가 아닙니다. 모호한 과업을 즉시 설명해 줄 수
            없어 사전 파일럿이 중요합니다.
          </Note>
        </>
      );
    case "think-aloud":
      return (
        <>
          <Web>
            <h4>예약 관리</h4>
            <div className="xe-research-splitlabels">
              <span>날짜 변경</span>
              <span>예약 취소</span>
            </div>
          </Web>
          <blockquote className="xe-research-quote">
            “변경을 누르면 지금 예약이 없어질까 봐 망설여져요.”
          </blockquote>
          <Paper title="발화와 행동을 분리해 기록">
            <dl className="xe-research-dl">
              <dt>발화</dt>
              <dd>예약이 사라질 수 있다는 우려를 말함</dd>
              <dt>행동</dt>
              <dd>날짜 변경 앞에서 멈추고 안내 문구를 다시 읽음</dd>
            </dl>
          </Paper>
          <Note>
            참여자가 수행 중 생각을 소리 내어 말하는 가상 예시입니다. 발화가 행동의 모든 원인을
            설명하지는 않습니다.
          </Note>
        </>
      );
    case "task-success-rate":
      return (
        <>
          <Paper title="같은 과업 · 사전에 정한 성공 기준">
            <p>도움 없이 예약 날짜를 바꾸고 새 날짜를 확인하면 성공</p>
            <div
              className="xe-research-participants"
              aria-label="가상 참여자 10명 중 성공 8명, 실패 2명"
            >
              {Array.from({ length: 10 }, (_, i) => (
                <span className={i < 8 ? "xe-research-successdot" : "xe-research-faildot"} key={i}>
                  {i < 8 ? "✓" : "×"}
                  <small>{i + 1}</small>
                </span>
              ))}
            </div>
            <div className="xe-research-equation">
              8 / 10 <span>= 80%</span>
            </div>
            <div className="xe-research-legend">✓ 성공 8명 · × 실패 2명 · 교육용 가상 데이터</div>
          </Paper>
          <Note>
            이 표본에서 관찰한 비율입니다. 소규모 결과를 전체 사용자의 정확한 성공률로 단정하지
            않습니다. 도움받은 성공은 별도로 기록합니다.
          </Note>
        </>
      );
    case "ab-testing":
      return (
        <>
          <div className="xe-research-assignment">적격 사용자 → 무작위 배정</div>
          <div className="xe-research-two">
            <Paper title="A · 현재안">
              <p>예약 정보 입력 완료</p>
              <span className="xe-research-staticbutton">다음</span>
            </Paper>
            <Paper title="B · 변경안">
              <p>예약 정보 입력 완료</p>
              <span className="xe-research-staticbutton">예약 내용 확인</span>
            </Paper>
          </div>
          <Paper title="결과를 보기 전에 정할 것">
            <dl className="xe-research-dl">
              <dt>주요 지표</dt>
              <dd>배정 사용자 중 예약 완료 비율</dd>
              <dt>보호 지표</dt>
              <dd>오류와 중복 예약 요청</dd>
              <dt>분석 조건</dt>
              <dd>배정 단위, 기간, 표본 수, 불확실성 확인 방식</dd>
            </dl>
          </Paper>
          <Note>
            실험 설계 예시이며 승자를 정한 결과가 아닙니다. 무작위 배정만으로 측정 오류·교차
            노출·중도 이탈 문제가 사라지지는 않습니다.
          </Note>
        </>
      );
    case "benchmarking":
      return (
        <>
          <Paper title="예약 변경 과업 · 같은 기준으로 비교">
            <div className="xe-research-benchmark">
              <div>
                <span>지표</span>
                <strong>기준 시점</strong>
                <strong>후속 시점</strong>
              </div>
              <div>
                <span>도움 없는 완료</span>
                <b>8 / 10명</b>
                <b>9 / 10명</b>
              </div>
              <div>
                <span>완료자 중앙 시간</span>
                <b>72초</b>
                <b>64초</b>
              </div>
              <div>
                <span>조건</span>
                <small>동일 과업</small>
                <small>동일 기기군</small>
              </div>
            </div>
          </Paper>
          <Note>
            전부 교육용 가상 데이터입니다. 참여자·환경·시점 차이가 있으므로 이 차이만으로 개선의
            인과 효과나 통계적 확실성을 주장하지 않습니다.
          </Note>
        </>
      );
    case "jobs-to-be-done":
      return (
        <>
          <Paper title="가상 인터뷰에서 정리한 Job">
            <blockquote className="xe-research-quote">
              팀 일정이 갑자기 바뀌면, 기존 조건을 잃지 않고 회의 공간을 다시 정해, 팀원에게 확실한
              일정을 알려주고 싶다.
            </blockquote>
          </Paper>
          <div className="xe-research-job">
            <div>
              <span>상황</span>
              <strong>팀 일정 변경</strong>
            </div>
            <div>
              <span>이루려는 진전</span>
              <strong>믿고 공유할 새 예약</strong>
            </div>
            <div>
              <span>고려할 요인</span>
              <strong>비용 · 불안 · 팀의 기대</strong>
            </div>
          </div>
          <Note>
            “날짜 변경 버튼이 필요하다”는 해결책 요청과 구분합니다. 이 문장은 조사로 확인할 가상
            가설이지 모든 사용자의 Job이 아닙니다.
          </Note>
        </>
      );
    case "service-blueprint":
      return (
        <>
          <p className="xe-research-task">예약 확인에 필요한 고객 접점과 내부 업무</p>
          <div className="xe-research-blueprint">
            {[
              {
                title: "01 · 예약 요청",
                customer: "공간과 시간 선택",
                front: "요청 내용 표시",
                back: "예약 가능 여부 조회",
                support: "공간 일정 데이터",
              },
              {
                title: "02 · 예약 확정",
                customer: "확정 안내 확인",
                front: "확정 화면과 메시지",
                back: "중복 확인 후 예약 저장",
                support: "알림 발송 서비스",
              },
              {
                title: "03 · 방문",
                customer: "출입 정보 확인",
                front: "이용 안내 화면",
                back: "출입 권한 발급",
                support: "현장 운영 담당자",
              },
            ].map((stage) => (
              <article key={stage.title}>
                <h4>{stage.title}</h4>
                <dl>
                  <dt>고객 행동</dt>
                  <dd>{stage.customer}</dd>
                  <dt>보이는 접점</dt>
                  <dd>{stage.front}</dd>
                  <dt className="xe-research-visibility">가시선 아래 · 내부 업무</dt>
                  <dd>{stage.back}</dd>
                  <dt>지원 체계</dt>
                  <dd>{stage.support}</dd>
                </dl>
              </article>
            ))}
          </div>
          <Note>
            가상의 서비스 구조입니다. 고객 여정에 내부 업무와 의존 관계를 연결하며 실제 조직의 업무
            흐름은 담당자와 확인합니다.
          </Note>
        </>
      );
    case "opportunity-solution-tree":
      return (
        <>
          <div className="xe-research-ost">
            <div className="xe-research-outcome">
              <span>목표 결과</span>
              <strong>예약 변경 과업의 성공률 개선</strong>
            </div>
            <div className="xe-research-two">
              <Paper title="기회 · 조사로 확인할 불편">
                <p>변경 가능한 조건을 모르겠다</p>
                <div className="xe-research-branch">
                  <span>해결책 후보</span>
                  <strong>변경 조건을 상세에 안내</strong>
                  <small>가정 테스트: 안내를 이해하는가?</small>
                </div>
              </Paper>
              <Paper title="기회 · 조사로 확인할 불편">
                <p>팀의 빈 시간을 맞추기 어렵다</p>
                <div className="xe-research-branch">
                  <span>해결책 후보</span>
                  <strong>가능 시간 후보 공유</strong>
                  <small>가정 테스트: 조율에 도움이 되는가?</small>
                </div>
              </Paper>
            </div>
          </div>
          <Note>
            가상 탐색 지도입니다. 원하는 기능을 ‘기회’로 이름만 바꾸지 않습니다. 기회는 고객 조사로
            뒷받침하고 여러 해결책을 비교합니다.
          </Note>
        </>
      );
    case "assumption-mapping":
      return (
        <>
          <div className="xe-research-matrixaxis">↑ 위로 갈수록 실패 시 영향이 큼</div>
          <div className="xe-research-matrix">
            <div className="xe-research-matrixfocus">
              <span>높은 영향 · 약한 근거</span>
              <strong>팀원 모두가 시간 공유 링크를 열 것이다</strong>
              <small>먼저 확인할 가정</small>
            </div>
            <div>
              <span>높은 영향 · 강한 근거</span>
              <strong>업무 시간에 모바일 사용이 많다</strong>
              <small>관련 관찰 기록 있음</small>
            </div>
            <div>
              <span>낮은 영향 · 약한 근거</span>
              <strong>주간 보기부터 볼 것이다</strong>
            </div>
            <div>
              <span>낮은 영향 · 강한 근거</span>
              <strong>날짜 표기를 이해한다</strong>
            </div>
          </div>
          <div className="xe-research-matrixaxis">오른쪽으로 갈수록 근거가 강함 →</div>
          <Note>
            가상 분류입니다. 중요도는 아이디어의 매력보다 가정이 틀렸을 때의 영향을 기준으로
            판단합니다. 근거도 다시 검토할 수 있습니다.
          </Note>
        </>
      );
    case "research-repository":
      return (
        <>
          <Paper title="리서치 기록 / 예약 변경">
            <div className="xe-research-repobreadcrumb">연구 R-07 → 발견 F-03 → 원자료 P-02</div>
            <h4>변경 비용을 몰라 확정을 망설임</h4>
            <dl className="xe-research-dl">
              <dt>범위</dt>
              <dd>모바일 예약 변경 테스트 · 가상 연구</dd>
              <dt>근거</dt>
              <dd>익명 참여자 P-02 · 관찰 메모 04:12</dd>
              <dt>한계</dt>
              <dd>첫 예약 사용자만 포함</dd>
              <dt>상태</dt>
              <dd>후속 확인 필요 · 담당: 리서치 팀</dd>
            </dl>
            <div className="xe-research-repotags">
              <span>예약 변경</span>
              <span>비용 안내</span>
              <span>접근 제한 자료</span>
            </div>
          </Paper>
          <Note>
            발견만 모으는 게시판이 아니라 원자료·방법·맥락·접근 권한을 함께 관리하는 구조입니다.
            여기의 참여자와 기록은 모두 가상입니다.
          </Note>
        </>
      );
    case "triangulation":
      return (
        <>
          <div className="xe-research-outcome">
            <span>같은 질문</span>
            <strong>예약 변경 확인 단계에서 왜 멈출까?</strong>
          </div>
          <div className="xe-research-evidencegrid">
            <Paper title="행동 로그">
              <p>멈추는 위치와 반복 진입 확인</p>
              <small>이유를 직접 알 수 없음</small>
            </Paper>
            <Paper title="사용성 관찰">
              <p>비용 안내를 다시 읽는 행동</p>
              <small>특정 과업과 표본의 맥락</small>
            </Paper>
            <Paper title="후속 인터뷰">
              <p>추가 비용이 불확실했다는 설명</p>
              <small>자기 보고의 한계</small>
            </Paper>
          </div>
          <Note>
            가상의 근거 조합입니다. 서로 일치하는 내용뿐 아니라 어긋나는 결과도 설명해야 합니다. 세
            방법을 꼭 써야 한다는 뜻은 아닙니다.
          </Note>
        </>
      );
    case "research-question":
      return (
        <>
          <Steps
            items={[
              { title: "팀이 내려야 할 결정", text: "예약 변경 안내를 어디에서 제공할까?" },
              {
                title: "연구로 알아낼 질문",
                text: "사용자는 변경 조건을 언제, 무엇을 보고 이해하는가?",
              },
              { title: "필요한 근거", text: "실제 변경 과업의 행동과 중립적인 후속 질문" },
            ]}
          />
          <Note>
            연구 질문은 팀이 해결할 불확실성입니다. 참여자에게 이 문장을 그대로 읽어 주는 인터뷰
            질문과는 역할이 다릅니다.
          </Note>
        </>
      );
    case "leading-question":
      return (
        <>
          <div className="xe-research-two">
            <Paper title="답을 유도하는 질문">
              <span className="xe-research-tag">평가를 미리 제시함</span>
              <blockquote className="xe-research-quote">“새 메뉴가 더 편리하죠?”</blockquote>
              <p>‘더 편리하다’는 판단과 동의를 기대하는 표현</p>
            </Paper>
            <Paper title="경험을 묻는 질문">
              <span className="xe-research-tag">행동과 근거를 탐색함</span>
              <blockquote className="xe-research-quote">
                “방금 예약 정보를 어떻게 찾으셨나요?”
              </blockquote>
              <p>그 뒤 어렵거나 예상과 달랐던 점을 묻기</p>
            </Paper>
          </div>
          <Note>
            두 질문은 가상 인터뷰 문구입니다. 긍정적인 답을 끌어내는 대신 실제 경험을 자신의 말로
            설명하게 합니다.
          </Note>
        </>
      );
    case "sampling-bias":
      return (
        <>
          <Paper title="알고 싶은 대상 · 모든 예약 이용자">
            <div className="xe-research-population">
              <span>첫 예약 사용자</span>
              <span>반복 사용자</span>
              <span>예약을 중단한 사람</span>
              <span>고객센터로 예약한 사람</span>
            </div>
          </Paper>
          <div className="xe-research-selectionline">
            모집: 앱의 예약 완료 화면에서만 참여 요청 ↓
          </div>
          <Paper title="실제로 모인 표본">
            <div className="xe-research-population">
              <span className="xe-research-selected">앱에서 예약을 완료한 사람</span>
            </div>
            <p>중단한 사람과 다른 채널 이용자는 포함되기 어려움</p>
          </Paper>
          <Note>
            가상의 모집 구조입니다. 같은 채널로 사람 수만 늘려도 빠진 집단의 경험이 자동으로
            보완되지는 않습니다.
          </Note>
        </>
      );
    case "selection-bias":
      return (
        <>
          <Steps
            items={[
              { title: "처음 분석하려던 대상", text: "예약 변경을 시도한 모든 사용자" },
              { title: "분석에서 제외한 기록", text: "오류로 변경을 완료하지 못한 사용자" },
              {
                title: "남은 기록으로 내린 결론",
                text: "‘변경은 잘 완료된다’ → 결론이 왜곡될 수 있음",
              },
            ]}
          />
          <Paper title="핵심 확인">
            <p>포함·제외되는 과정이 우리가 측정하려는 결과와 연결되어 있는가?</p>
          </Paper>
          <Note>
            가상의 분석 선택 사례입니다. 모집 시점뿐 아니라 이탈, 제외 기준, 분석 대상 선택에서도
            편향이 생길 수 있습니다.
          </Note>
        </>
      );
    case "survivorship-bias":
      return (
        <>
          <Paper title="서비스를 사용하기 시작한 사람들">
            <div className="xe-research-two">
              <div className="xe-research-survivor">
                <strong>지금도 쓰는 사람</strong>
                <p>“예약 관리가 익숙해요.”</p>
                <span className="xe-research-tag">이 사람들만 인터뷰</span>
              </div>
              <div className="xe-research-missing">
                <strong>사용을 그만둔 사람</strong>
                <p>이탈한 이유는 기록에 없음</p>
                <span className="xe-research-tag">분석에서 보이지 않음</span>
              </div>
            </div>
          </Paper>
          <Note>
            가상 조사 구성입니다. 계속 사용하는 사람의 이야기만으로 초기 적응이 쉬웠다고 결론 내리면
            중도 이탈자의 경험을 놓칩니다.
          </Note>
        </>
      );
    case "correlation-causation":
      return (
        <>
          <Paper title="함께 늘어난 두 값 · 교육용 가상 점">
            <svg
              className="xe-research-chart"
              viewBox="0 0 320 215"
              role="img"
              aria-label="가상 산점도: 도움말 조회와 오류 횟수가 함께 증가하지만 인과관계는 확인되지 않음"
            >
              <path d="M48 18 V172 H300" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <text x="13" y="23" fontSize="12">
                오류
              </text>
              <text x="13" y="39" fontSize="12">
                횟수
              </text>
              <text x="178" y="203" fontSize="12">
                도움말 조회 횟수
              </text>
              {[
                [70, 153],
                [104, 137],
                [140, 145],
                [167, 99],
                [205, 81],
                [240, 89],
                [277, 42],
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="6" fill="#0f766e" />
              ))}
              <text x="52" y="186" fontSize="11">
                적음
              </text>
              <text x="278" y="186" fontSize="11">
                많음
              </text>
            </svg>
            <div className="xe-research-confound">
              <strong>다른 설명 가능성 · 어려운 과업</strong>
              <span>↙ 도움말 조회 증가</span>
              <span>↘ 오류 증가</span>
            </div>
          </Paper>
          <Note>
            조회가 오류를 일으켰다는 뜻이 아닙니다. 과업 난이도 같은 공통 원인이나 반대 방향의
            관계를 확인해야 합니다. 점은 실제 측정값이 아닙니다.
          </Note>
        </>
      );
    case "confidence-interval":
      return (
        <>
          <Paper title="같은 방법으로 표본을 반복해서 뽑는다면">
            <div className="xe-research-intervals">
              <div className="xe-research-truevalue">
                <span>고정된 참값</span>
              </div>
              {[
                { label: "가상 표본 A", start: "29%", width: "45%", center: "53%" },
                { label: "가상 표본 B", start: "44%", width: "41%", center: "67%" },
                { label: "가상 표본 C", start: "5%", width: "36%", center: "24%" },
              ].map((interval) => (
                <div className="xe-research-intervalrow" key={interval.label}>
                  <span>{interval.label}</span>
                  <div>
                    <i style={{ left: interval.start, width: interval.width }} />
                    <b style={{ left: interval.center }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="xe-research-legend">
              가로선 = 구간 · 점 = 표본 추정값 · 세로선 = 개념 설명용 참값
            </p>
          </Paper>
          <Note>
            95%는 같은 절차를 반복할 때 구간이 참값을 포함하는 장기 비율을 뜻합니다. 이 세 개의 가상
            구간은 95%를 재현한 실험이 아닙니다. 계산된 한 구간 안에 고정된 참값이 있을 확률이라는
            뜻도 아닙니다.
          </Note>
        </>
      );
    case "minimum-viable-product":
      return (
        <>
          <Paper title="먼저 확인할 가정">
            <h4>팀은 공유 링크로 가능한 시간을 모을 수 있는가?</h4>
            <div className="xe-research-mvp">
              <span>시간 후보 작성</span>
              <span>링크 공유</span>
              <span>팀원 응답 확인</span>
            </div>
            <span className="xe-research-tag">이 가정을 시험할 수 있는 작은 전체 흐름</span>
          </Paper>
          <Paper title="이번 학습에 필요하지 않아 보류">
            <div className="xe-research-deferred">
              <span>캘린더 자동 연동</span>
              <span>고급 통계</span>
              <span>브랜드 테마 편집</span>
            </div>
          </Paper>
          <Note>
            가상 MVP 범위입니다. 화면 수를 줄이는 것보다 무엇을 배울지 먼저 정합니다. 개인정보
            보호와 핵심 과업의 사용 가능성을 생략한다는 뜻이 아닙니다.
          </Note>
        </>
      );
    case "content-strategy":
      return (
        <>
          <Paper title="예약 변경 안내 · 콘텐츠 운영 계획">
            <dl className="xe-research-dl">
              <dt>사용자 필요</dt>
              <dd>변경 가능 시간과 추가 비용을 판단</dd>
              <dt>콘텐츠</dt>
              <dd>변경 조건, 비용 기준, 문의 경로</dd>
              <dt>위치</dt>
              <dd>예약 상세와 변경 확인 단계</dd>
              <dt>관리 책임</dt>
              <dd>서비스 운영 담당자</dd>
              <dt>검토 계기</dt>
              <dd>요금·운영 정책 변경 시 검토</dd>
              <dt>일관성</dt>
              <dd>웹, 앱, 고객 응대 안내의 기준 일치</dd>
            </dl>
          </Paper>
          <Note>
            가상의 콘텐츠 설계 기록입니다. 문구 작성뿐 아니라 목적·구조·발행·유지 관리를 연결합니다.
          </Note>
        </>
      );
    case "ux-writing":
      return (
        <>
          <Paper title="예약 요청 흐름 전체에서 같은 상태를 전달">
            <Steps
              items={[
                { title: "행동 전 · 안내", text: "공간 담당자가 확인하면 예약이 확정됩니다." },
                { title: "행동 · CTA 문구", text: "예약 요청 보내기" },
                {
                  title: "행동 후 · 상태",
                  text: "요청을 보냈습니다. 아직 예약이 확정되지 않았어요.",
                },
              ]}
            />
          </Paper>
          <Note>
            가상 화면 문구입니다. 요청을 보낸 상태와 예약이 확정된 상태를 구분해 사용자가 다음
            상황을 정확히 예상하게 합니다.
          </Note>
        </>
      );
    case "microcopy":
      return (
        <>
          <Web>
            <h4>예약 알림 받을 이메일</h4>
            <div className="xe-research-fieldlabel">이메일 주소</div>
            <div className="xe-research-plainfield xe-research-errorfield">hello@</div>
            <p className="xe-research-fieldhelp">예약 상태가 바뀌면 이 주소로 알려드려요.</p>
            <p className="xe-research-fielderror">
              주소 뒷부분을 입력해 주세요. 예: hello@example.com
            </p>
            <span className="xe-research-staticbutton">알림 주소 저장</span>
          </Web>
          <Paper title="화면 속 짧은 문구의 역할">
            <dl className="xe-research-dl">
              <dt>도움말</dt>
              <dd>왜 필요한 정보인지 설명</dd>
              <dt>오류 문구</dt>
              <dd>현재 문제와 복구 방법을 안내</dd>
              <dt>버튼 문구</dt>
              <dd>누르면 일어날 행동을 명시</dd>
            </dl>
          </Paper>
          <Note>
            입력·전송이 없는 정적 가상 화면입니다. 짧고 친근한 말 자체보다 필요한 시점에 정확한
            정보를 주는지가 중요합니다.
          </Note>
        </>
      );
    default:
      return null;
  }
}

export function ResearchExamples({ termId }: { termId: string }) {
  const term = research.terms.find((entry) => entry.id === termId);
  if (!term) return null;
  return (
    <div
      className="xe-research-example"
      data-research-example={termId}
      aria-label={`${term.korean} 교육용 시각 예시`}
    >
      <div className="xe-research-examplemeta">
        <span>교육용 가상 예시</span>
        <span>정적 자료</span>
      </div>
      <Scene termId={termId} />
    </div>
  );
}
