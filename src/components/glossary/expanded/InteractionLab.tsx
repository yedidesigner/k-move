import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import "./interaction-lab.css";

const cx = "xi-lab-";

function LabFrame({
  title,
  instruction,
  onReset,
  children,
}: {
  title: string;
  instruction: string;
  onReset: () => void;
  children: ReactNode;
}) {
  return (
    <section className={`${cx}frame gp-exercise`} aria-label={title}>
      <header>
        <span>문장 STUDIO · 학습용 실습</span>
        <h4>{title}</h4>
        <p>{instruction}</p>
      </header>
      <div className={`${cx}body`}>{children}</div>
      <div className={`${cx}reset-row`}>
        <button type="button" onClick={onReset}>
          처음부터 해보기
        </button>
      </div>
      <p className={`${cx}local-note`}>
        이 화면 안에서만 동작하는 연습입니다. 실제 신청이나 정보 전송은 없습니다.
      </p>
    </section>
  );
}

function AccordionLab() {
  const id = useId();
  const [opened, setOpened] = useState<string[]>([]);
  const items = [
    {
      id: "delivery",
      title: "배송은 얼마나 걸리나요?",
      body: "출고 후 2–3일이 걸립니다. 배송이 시작되면 신청한 연락처로 안내합니다.",
    },
    {
      id: "exchange",
      title: "교환은 어떻게 하나요?",
      body: "주문 내역에서 교환할 상품과 사유를 선택합니다. 배송 조건과 함께 비교해 보세요.",
    },
    {
      id: "cancel",
      title: "주문을 취소할 수 있나요?",
      body: "출고 전이라면 주문 내역에서 취소를 요청할 수 있습니다. 출고 후에는 반품 절차를 확인합니다.",
    },
  ];
  return (
    <LabFrame
      onReset={() => setOpened([])}
      title="아코디언: 안내 비교하기"
      instruction="제목을 눌러 두 개 이상의 안내를 동시에 펼쳐 보세요."
    >
      <div className={`${cx}accordion`}>
        {items.map((item) => {
          const open = opened.includes(item.id);
          return (
            <div key={item.id}>
              <h5>
                <button
                  type="button"
                  id={`${id}-${item.id}-trigger`}
                  aria-expanded={open}
                  aria-controls={`${id}-${item.id}-panel`}
                  onClick={() =>
                    setOpened((current) =>
                      open ? current.filter((value) => value !== item.id) : [...current, item.id],
                    )
                  }
                >
                  {item.title}
                  <span aria-hidden="true">{open ? "−" : "+"}</span>
                </button>
              </h5>
              <div
                id={`${id}-${item.id}-panel`}
                role="region"
                aria-labelledby={`${id}-${item.id}-trigger`}
                hidden={!open}
              >
                <p>{item.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className={`${cx}result`} role="status">
        현재 {opened.length}개 안내가 펼쳐져 있습니다.
      </p>
    </LabFrame>
  );
}

function TabsLab() {
  const id = useId();
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const items = [
    {
      label: "상세 정보",
      title: "주말의 기록 노트",
      body: "하루의 관찰을 한 장씩 기록하는 노트입니다. 148 × 210mm, 본문 80쪽으로 구성했습니다.",
    },
    {
      label: "이용 안내",
      title: "기록을 시작하는 방법",
      body: "날짜와 관찰 장소를 먼저 적고, 오늘 발견한 형태나 색을 기록해 보세요.",
    },
    {
      label: "리뷰",
      title: "가상 리뷰 2개",
      body: "김문장: 한 장씩 쓰기 편해요. / 이기록: 종이 크기가 가방에 넣기 좋아요. 학습용으로 구성한 리뷰입니다.",
    },
  ];
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % items.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  }
  return (
    <LabFrame
      onReset={() => setSelected(0)}
      title="탭: 같은 영역의 내용 바꾸기"
      instruction="탭을 선택하거나 탭에 포커스를 둔 뒤 좌우 방향키로 이동해 보세요. Home·End도 사용할 수 있습니다."
    >
      <div role="tablist" aria-label="노트 정보" className={`${cx}tabs`}>
        {items.map((item, index) => (
          <button
            key={item.label}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel-${index}`}
            aria-selected={selected === index}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => navigate(event, index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={item.label}
          role="tabpanel"
          tabIndex={0}
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          hidden={selected !== index}
          className={`${cx}tab-panel`}
        >
          <h5>{item.title}</h5>
          <p>{item.body}</p>
        </div>
      ))}
    </LabFrame>
  );
}

function CheckboxLab() {
  const [selected, setSelected] = useState<string[]>([]);
  const options = ["브랜딩", "UX 리서치", "모션 디자인"];
  return (
    <LabFrame
      onReset={() => setSelected([])}
      title="체크박스: 여러 관심 분야 고르기"
      instruction="두 항목을 함께 선택한 뒤 하나만 해제해 보세요. 다른 선택은 그대로 유지됩니다."
    >
      <fieldset className={`${cx}options`}>
        <legend>관심 분야 · 여러 개 선택</legend>
        {options.map((option) => (
          <label key={option}>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={(event) =>
                setSelected((current) =>
                  event.target.checked
                    ? [...current, option]
                    : current.filter((value) => value !== option),
                )
              }
            />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
      <p className={`${cx}result`} role="status">
        {selected.length
          ? `선택한 분야 ${selected.length}개: ${options.filter((option) => selected.includes(option)).join(", ")}`
          : "아직 선택한 분야가 없습니다."}
      </p>
    </LabFrame>
  );
}

function RadioLab() {
  const id = useId();
  const [selected, setSelected] = useState("");
  const options = [
    { value: "delivery", label: "일반 배송", detail: "3,000원 · 출고 후 2–3일" },
    { value: "pickup", label: "매장 수령", detail: "무료 · 준비 완료 후 방문" },
    { value: "express", label: "빠른 배송", detail: "6,000원 · 출고 후 다음 날" },
  ];
  const choice = options.find((option) => option.value === selected);
  return (
    <LabFrame
      onReset={() => setSelected("")}
      title="라디오 버튼: 배송 방식 하나 고르기"
      instruction="배송 방식을 바꿔 보세요. 같은 그룹에서는 마지막으로 고른 한 가지만 선택됩니다."
    >
      <fieldset className={`${cx}options`}>
        <legend>어떻게 받으시겠어요?</legend>
        {options.map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              name={`${id}-delivery`}
              value={option.value}
              checked={selected === option.value}
              onChange={() => setSelected(option.value)}
            />
            <span>
              <strong>{option.label}</strong>
              <small>{option.detail}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <p className={`${cx}result`} role="status">
        {choice
          ? `선택한 방식: ${choice.label} · ${choice.detail}`
          : "배송 방식을 한 가지 선택해 주세요."}
      </p>
    </LabFrame>
  );
}

function SwitchLab() {
  const id = useId();
  const [enabled, setEnabled] = useState(false);
  return (
    <LabFrame
      onReset={() => setEnabled(false)}
      title="토글 스위치: 알림 켜고 끄기"
      instruction="스위치를 눌러 설정을 바꿔 보세요. 이 예시에서는 누른 즉시 화면 안의 설정에 적용됩니다."
    >
      <div className={`${cx}switch-row`}>
        <div>
          <strong id={`${id}-label`}>댓글 알림</strong>
          <p id={`${id}-help`}>새 댓글이 등록되면 알려 줍니다.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-help`}
          onClick={() => setEnabled((value) => !value)}
          className={`${cx}switch`}
        >
          <span aria-hidden="true" />
        </button>
      </div>
      <p className={`${cx}result`} role="status">
        댓글 알림이 {enabled ? "켜졌습니다" : "꺼져 있습니다"}. 설정 이름은 바뀌지 않습니다.
      </p>
    </LabFrame>
  );
}

function DisclosureLab() {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [type, setType] = useState("all");
  const [onlyCompleted, setOnlyCompleted] = useState(false);
  const projects = [
    { title: "작은 책방의 새로운 간판", type: "brand", complete: true },
    { title: "박물관 예약 화면", type: "ui", complete: false },
    { title: "전시 안내 모바일 화면", type: "ui", complete: true },
  ];
  const results = projects.filter(
    (project) => (type === "all" || project.type === type) && (!onlyCompleted || project.complete),
  );
  return (
    <LabFrame
      onReset={() => {
        setExpanded(false);
        setType("all");
        setOnlyCompleted(false);
      }}
      title="점진적 공개: 추가 필터 펼치기"
      instruction="프로젝트 분야를 먼저 고르고 추가 필터를 펼쳐 보세요. 필터를 접어도 적용한 조건과 선택은 유지됩니다."
    >
      <label className={`${cx}select`}>
        <span>프로젝트 분야</span>
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="all">전체 분야</option>
          <option value="brand">브랜딩</option>
          <option value="ui">UI 디자인</option>
        </select>
      </label>
      <button
        className={`${cx}disclosure`}
        type="button"
        aria-expanded={expanded}
        aria-controls={`${id}-advanced`}
        onClick={() => setExpanded((value) => !value)}
      >
        추가 필터 {onlyCompleted ? "· 1개 적용" : ""}
        <span aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>
      <div id={`${id}-advanced`} hidden={!expanded} className={`${cx}extra`}>
        <label>
          <input
            type="checkbox"
            checked={onlyCompleted}
            onChange={(event) => setOnlyCompleted(event.target.checked)}
          />
          <span>완료한 프로젝트만 보기</span>
        </label>
        <p>선택 후 추가 필터를 접어 보세요.</p>
      </div>
      <div role="status" className={`${cx}result`}>
        검색 결과 {results.length}개{onlyCompleted ? " · 완료한 프로젝트만" : ""}
      </div>
      <ul className={`${cx}projects`}>
        {results.map((project) => (
          <li key={project.title}>
            <strong>{project.title}</strong>
            <span>{project.complete ? "완료" : "진행 중"}</span>
          </li>
        ))}
      </ul>
      {results.length === 0 && (
        <p>조건에 맞는 프로젝트가 없습니다. 분야나 추가 필터를 바꿔 보세요.</p>
      )}
    </LabFrame>
  );
}

export function InteractionLab({ termId }: { termId: string }) {
  switch (termId) {
    case "accordion":
      return <AccordionLab />;
    case "tabs":
      return <TabsLab />;
    case "checkbox":
      return <CheckboxLab />;
    case "radio-button":
      return <RadioLab />;
    case "toggle-switch":
      return <SwitchLab />;
    case "progressive-disclosure":
      return <DisclosureLab />;
    default:
      return null;
  }
}
