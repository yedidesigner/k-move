import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GlossaryPracticeLesson,
  grayOnWhiteContrast,
} from "@/components/glossary/GlossaryPracticeLesson";
import { PRACTICES } from "@/data/glossary-practice";
import { GLOSSARY } from "@/data/glossary";
import type { VisualPreset } from "@/data/practice/types";
import {
  decisionFixture,
  practiceEntry,
  sequenceFixture,
  sortFixture,
  visualFixture,
} from "./fixtures/practice-fixtures";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function reset() {
  fireEvent.click(screen.getByRole("button", { name: "처음부터 해보기" }));
}

describe("Scenario and manipulation practice", () => {
  it("shows the consequence of each choice and lets the learner retry without submitting data", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    render(<GlossaryPracticeLesson entry={practiceEntry} practice={decisionFixture} />);
    expect(screen.getByRole("heading", { name: "핵심 구조" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "직접 해보기" })).toBeInTheDocument();
    const wrong = screen.getByRole("button", { name: decisionFixture.options[0]!.label });
    const right = screen.getByRole("button", { name: decisionFixture.options[1]!.label });
    fireEvent.click(wrong);
    expect(screen.getByRole("status")).toHaveTextContent(decisionFixture.options[0]!.feedback);
    expect(wrong).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(right);
    expect(screen.getByRole("status")).toHaveTextContent(decisionFixture.options[1]!.feedback);
    expect(screen.getByRole("status")).not.toHaveTextContent(decisionFixture.options[0]!.feedback);
    expect(wrong).toHaveAttribute("aria-pressed", "false");
    reset();
    expect(right).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("status")).not.toHaveTextContent(decisionFixture.options[1]!.feedback);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("requires classification of every item, explains corrections, and clears prior feedback when answers change", () => {
    render(<GlossaryPracticeLesson entry={practiceEntry} practice={sortFixture} />);
    const check = screen.getByRole("button", { name: "분류 확인하기" });
    expect(check).toBeDisabled();
    const selects = sortFixture.items.map((item) =>
      screen.getByRole("combobox", { name: `${item.label} 분류` }),
    );
    selects.forEach((select) => fireEvent.change(select, { target: { value: "0" } }));
    expect(check).toBeEnabled();
    fireEvent.click(check);
    expect(screen.getByRole("status")).toHaveTextContent("3개 중 2개");
    for (const item of sortFixture.items)
      expect(screen.getByText(item.explanation, { exact: false })).toBeInTheDocument();
    fireEvent.change(selects[1]!, { target: { value: "1" } });
    expect(
      screen.queryByText(sortFixture.items[1]!.explanation, { exact: false }),
    ).not.toBeInTheDocument();
    fireEvent.click(check);
    expect(screen.getByRole("status")).toHaveTextContent("3개 중 3개");
    reset();
    expect(check).toBeDisabled();
    selects.forEach((select) => expect(select).toHaveValue("-1"));
  });

  it("lets learners reorder steps with accessible controls, inspect reasons and start with a mixed order again", () => {
    render(<GlossaryPracticeLesson entry={practiceEntry} practice={sequenceFixture} />);
    const list = within(screen.getByRole("list", { name: "단계 순서" }));
    const readOrder = () =>
      list
        .getAllByRole("button", { name: /위로 이동$/ })
        .map((button) => button.getAttribute("aria-label")!.replace(/ 위로 이동$/, ""));
    const desired = sequenceFixture.steps.map((step) => step.label);
    const starting = readOrder();
    expect(starting).not.toEqual(desired);
    fireEvent.click(screen.getByRole("button", { name: "순서 확인하기" }));
    expect(screen.getByRole("status")).toHaveTextContent("단계 사이의 관계를 다시 살펴보세요.");
    for (let target = 0; target < desired.length; target++) {
      const label = desired[target]!;
      while (readOrder().indexOf(label) > target)
        fireEvent.click(list.getByRole("button", { name: `${label} 위로 이동` }));
    }
    expect(readOrder()).toEqual(desired);
    expect(list.getByRole("button", { name: `${desired[0]} 위로 이동` })).toBeDisabled();
    expect(list.getByRole("button", { name: `${desired[2]} 아래로 이동` })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "순서 확인하기" }));
    expect(screen.getByRole("status")).toHaveTextContent("이 상황의 흐름에 맞게 정리했어요.");
    sequenceFixture.steps.forEach((step) =>
      expect(screen.getByRole("status")).toHaveTextContent(step.explanation),
    );
    reset();
    expect(readOrder()).toEqual(starting);
    expect(screen.getByRole("status")).not.toHaveTextContent(sequenceFixture.steps[0]!.explanation);
  });

  it("updates actual spacing and restores the starting value", () => {
    const { container } = render(
      <GlossaryPracticeLesson entry={practiceEntry} practice={visualFixture("spacing")} />,
    );
    const slider = screen.getByRole("slider", { name: "그룹 사이 간격" });
    expect(slider).toHaveValue("4");
    fireEvent.change(slider, { target: { value: "28" } });
    expect(container.querySelector(".gp-spacing-sample")).toHaveStyle({ gap: "28px" });
    expect(screen.getByText(/그룹 사이만 28px/)).toBeInTheDocument();
    reset();
    expect(slider).toHaveValue("4");
    expect(container.querySelector(".gp-spacing-sample")).toHaveStyle({ gap: "4px" });
  });

  it("reports measured grayscale contrast and does not mistake that one result for complete accessibility", () => {
    expect(grayOnWhiteContrast(0)).toBeCloseTo(21, 8);
    expect(grayOnWhiteContrast(255)).toBeCloseTo(1, 8);
    expect(grayOnWhiteContrast(119)).toBeCloseTo(4.478, 3);
    render(<GlossaryPracticeLesson entry={practiceEntry} practice={visualFixture("contrast")} />);
    expect(screen.getByText(/최소 대비 4.5:1에 미달/)).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider", { name: "글자 어둡기" }), {
      target: { value: "100" },
    });
    expect(
      screen.getByText(`명도 대비 ${grayOnWhiteContrast(30).toFixed(2)}:1`),
    ).toBeInTheDocument();
    expect(screen.getByText(/최소 대비 4.5:1을 충족/)).toBeInTheDocument();
    expect(screen.getByText(/전체 접근성 판정은 아닙니다/)).toBeInTheDocument();
  });

  it("stops showing a preset explanation after the learner adjusts its actual values", () => {
    const practice = visualFixture("contrast");
    render(<GlossaryPracticeLesson entry={practiceEntry} practice={practice} />);
    const second = screen.getByRole("button", { name: practice.afterLabel });
    fireEvent.click(second);
    expect(screen.getByText(practice.afterNote)).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider", { name: "글자 어둡기" }), {
      target: { value: "0" },
    });
    expect(second).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: practice.beforeLabel })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.queryByText(practice.afterNote)).not.toBeInTheDocument();
    expect(screen.getByText(/직접 조정한 상태입니다/)).toBeInTheDocument();
    expect(screen.getByText(/최소 대비 4.5:1에 미달/)).toBeInTheDocument();
  });

  it("independently changes type size and line spacing in the reading sample", () => {
    const { container } = render(
      <GlossaryPracticeLesson entry={practiceEntry} practice={visualFixture("typography")} />,
    );
    fireEvent.change(screen.getByRole("slider", { name: "본문 글자 크기" }), {
      target: { value: "24" },
    });
    fireEvent.change(screen.getByRole("slider", { name: "줄 간격 배수" }), {
      target: { value: "1.8" },
    });
    expect(container.querySelector(".gp-reading-sample p")).toHaveStyle({
      fontSize: "24px",
      lineHeight: "1.8",
    });
    expect(screen.getByText(/본문 24px · 줄 간격 1.8배/)).toBeInTheDocument();
  });

  it("lets learners compare equal and differentiated visual hierarchy", () => {
    const { container } = render(
      <GlossaryPracticeLesson entry={practiceEntry} practice={visualFixture("hierarchy")} />,
    );
    const sample = container.querySelector(".gp-hierarchy");
    expect(sample).not.toHaveClass("is-structured");
    fireEvent.click(screen.getByRole("button", { name: "크기와 굵기 차이 주기" }));
    expect(sample).toHaveClass("is-structured");
    expect(
      screen.getByText("제목, 일정, 설명에 서로 다른 시각적 비중을 적용했습니다."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "크기와 굵기 차이 줄이기" }));
    expect(sample).not.toHaveClass("is-structured");
  });

  it("changes both sides of a composition when adjusting its balance", () => {
    const { container } = render(
      <GlossaryPracticeLesson entry={practiceEntry} practice={visualFixture("balance")} />,
    );
    fireEvent.change(screen.getByRole("slider", { name: "이미지 영역 비율" }), {
      target: { value: "65" },
    });
    const panels = container.querySelectorAll(".gp-balance-sample > div");
    expect(panels[0]).toHaveStyle({ flexBasis: "65%" });
    expect(panels[1]).toHaveStyle({ flexBasis: "35%" });
    expect(screen.getByText(/이미지 65% · 텍스트 35%/)).toBeInTheDocument();
  });

  it("reflows the same content across narrow, medium and wide example viewports", () => {
    const { container } = render(
      <GlossaryPracticeLesson entry={practiceEntry} practice={visualFixture("responsive")} />,
    );
    const titles = () =>
      Array.from(container.querySelectorAll(".gp-sample-card strong"), (node) => node.textContent);
    const original = titles();
    const slider = screen.getByRole("slider", { name: "예시 화면 너비" });
    for (const [width, columns] of [
      [280, 1],
      [500, 2],
      [700, 3],
    ]) {
      fireEvent.change(slider, { target: { value: String(width) } });
      expect(container.querySelector(".gp-responsive-sample")).toHaveStyle({ width: `${width}px` });
      expect(container.querySelector(".gp-content-cards")).toHaveStyle({
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      });
      expect(titles()).toEqual(original);
      expect(
        screen.getByText(new RegExp(`${width}px 예시 화면에서 ${columns}열`)),
      ).toBeInTheDocument();
    }
  });

  it("changes the actual region treatment across all four decoration choices", () => {
    const { container } = render(
      <GlossaryPracticeLesson entry={practiceEntry} practice={visualFixture("decoration")} />,
    );
    const modes = within(screen.getByRole("group", { name: "영역 구분 방식" }));
    for (const [index, name] of ["없음", "테두리", "채우기", "그림자"].entries()) {
      const option = modes.getByRole("button", { name });
      fireEvent.click(option);
      expect(option).toHaveAttribute("aria-pressed", "true");
      expect(container.querySelector(".gp-decoration-card")).toHaveClass(`gp-decoration-${index}`);
    }
    expect(
      screen.getByText(/장식 효과 자체가 클릭 가능함을 보장하지는 않습니다/),
    ).toBeInTheDocument();
  });

  it("preserves the content skeleton when toggling from concept placeholders to a contextual screen", () => {
    const { container } = render(
      <GlossaryPracticeLesson entry={practiceEntry} practice={visualFixture("fidelity")} />,
    );
    expect(container.querySelectorAll(".gp-image-placeholder")).toHaveLength(3);
    const titles = Array.from(
      container.querySelectorAll(".gp-sample-card strong"),
      (node) => node.textContent,
    );
    fireEvent.click(screen.getByRole("button", { name: "구체적인 표현으로 보기" }));
    expect(container.querySelectorAll(".gp-image-placeholder")).toHaveLength(0);
    expect(container.querySelectorAll(".gp-sample-card svg")).toHaveLength(3);
    expect(
      Array.from(container.querySelectorAll(".gp-sample-card strong"), (node) => node.textContent),
    ).toEqual(titles);
    expect(screen.getByRole("heading", { name: "일상에서 발견한 디자인" })).toBeInTheDocument();
    reset();
    expect(screen.getByRole("heading", { name: "페이지 제목" })).toBeInTheDocument();
  });

  it("opens and closes the described motion panel with a connected accessible trigger", () => {
    const { container } = render(
      <GlossaryPracticeLesson entry={practiceEntry} practice={visualFixture("motion")} />,
    );
    const trigger = screen.getByRole("button", { name: "패널 열기" });
    const panel = document.getElementById(trigger.getAttribute("aria-controls")!);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveAttribute("aria-hidden", "true");
    fireEvent.click(screen.getByRole("button", { name: "부드러운 전환" }));
    fireEvent.click(trigger);
    expect(container.querySelector(".gp-motion-stage")).toHaveAttribute("data-motion", "true");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(panel).toHaveAttribute("aria-hidden", "false");
    expect(screen.getByText(/패널이 열린 상태 · 300ms 전환/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "패널 닫기" }));
    expect(panel).toHaveAttribute("aria-hidden", "true");
  });

  it("reports actual focus targets and clears editable practice fields on reset", () => {
    const { container } = render(
      <GlossaryPracticeLesson entry={practiceEntry} practice={visualFixture("focus")} />,
    );
    const name = screen.getByRole("textbox", { name: "연습용 이름" });
    const interest = screen.getByRole("combobox", { name: "관심 분야" });
    act(() => name.focus());
    expect(name).toHaveFocus();
    expect(screen.getByText(/현재 연습 위치: 이름 입력칸/)).toBeInTheDocument();
    fireEvent.change(name, { target: { value: "연습 이름" } });
    act(() => interest.focus());
    expect(interest).toHaveFocus();
    expect(screen.getByText(/현재 연습 위치: 관심 분야 선택/)).toBeInTheDocument();
    fireEvent.change(interest, { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "강한 강조" }));
    expect(container.querySelector(".gp-focus-sample")).toHaveAttribute("data-strong", "true");
    fireEvent.click(screen.getByRole("button", { name: "선택 확인" }));
    expect(screen.getByText(/현재 연습 위치: 확인 버튼을 실행함/)).toBeInTheDocument();
    reset();
    expect(name).toHaveValue("");
    expect(interest).toHaveValue("0");
    expect(container.querySelector(".gp-focus-sample")).toHaveAttribute("data-strong", "false");
  });

  it("retains content and order while switching between a list and cards", () => {
    const { container } = render(
      <GlossaryPracticeLesson entry={practiceEntry} practice={visualFixture("cards")} />,
    );
    const titles = () =>
      Array.from(container.querySelectorAll(".gp-sample-card strong"), (node) => node.textContent);
    const original = titles();
    expect(container.querySelector(".gp-list-layout")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "카드로" }));
    expect(container.querySelector(".gp-card-layout")).toBeInTheDocument();
    expect(titles()).toEqual(original);
    fireEvent.click(screen.getByRole("button", { name: "목록으로" }));
    expect(container.querySelector(".gp-list-layout")).toBeInTheDocument();
    expect(titles()).toEqual(original);
  });

  it("keeps grid guides aligned with the selected number of content columns", () => {
    const { container } = render(
      <GlossaryPracticeLesson entry={practiceEntry} practice={visualFixture("grid")} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "그리드 가이드 켜기" }));
    fireEvent.change(screen.getByRole("slider", { name: "컬럼 수" }), { target: { value: "2" } });
    expect(container.querySelector(".gp-content-cards")).toHaveStyle({
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    });
    expect(container.querySelectorAll(".gp-grid-guides span")).toHaveLength(2);
    expect(screen.getByText(/2개의 동일한 너비 컬럼과 12px 간격/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "그리드 가이드 끄기" }));
    expect(container.querySelector(".gp-grid-guides")).not.toBeInTheDocument();
  });

  it("scales the representative elements without scaling the supporting body text", () => {
    const { container } = render(
      <GlossaryPracticeLesson entry={practiceEntry} practice={visualFixture("scale")} />,
    );
    const paragraph = container.querySelector(".gp-scale-sample p")!;
    const initialBody = paragraph.outerHTML;
    fireEvent.change(screen.getByRole("slider", { name: "대표 요소 크기" }), {
      target: { value: "130" },
    });
    expect(container.querySelector(".gp-scale-picture")).toHaveStyle({ width: "84.5%" });
    expect(screen.getByRole("heading", { name: "하나의 장면, 새로운 시선" })).toHaveStyle({
      fontSize: "36px",
    });
    expect(paragraph.outerHTML).toBe(initialBody);
    expect(screen.getByText(/대표 요소 130%/)).toBeInTheDocument();
  });

  it("reflects authored alt text in the actual image accessible name and resets it", () => {
    render(<GlossaryPracticeLesson entry={practiceEntry} practice={visualFixture("alttext")} />);
    const sample = within(screen.getByRole("region", { name: "직접 해보기" }));
    const description = screen.getByRole("textbox", { name: "그림에 제공할 대체 텍스트" });
    const text = "서로 겹친 두 산 능선 위에 둥근 해가 떠 있다.";
    expect(sample.queryByRole("img")).not.toBeInTheDocument();
    fireEvent.change(description, { target: { value: text } });
    expect(sample.getByRole("img", { name: text })).toBeInTheDocument();
    expect(screen.getByText(/정답 자동 판정은 하지 않습니다/)).toBeInTheDocument();
    reset();
    expect(description).toHaveValue("");
    expect(sample.queryByRole("img")).not.toBeInTheDocument();
  });

  it("shows recoverable input validation and a local success state without a network submission", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    render(<GlossaryPracticeLesson entry={practiceEntry} practice={visualFixture("form")} />);
    const name = screen.getByRole("textbox", { name: "연습용 프로젝트 이름" });
    fireEvent.change(name, { target: { value: "가" } });
    fireEvent.click(screen.getByRole("button", { name: "샘플 만들기" }));
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("이름을 2자 이상 입력해 주세요.")).toBeInTheDocument();
    fireEvent.change(name, { target: { value: "디자인 노트" } });
    fireEvent.click(screen.getByRole("button", { name: "샘플 만들기" }));
    expect(name).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByText("‘디자인 노트’ 샘플이 준비됐어요.")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    reset();
    expect(name).toHaveValue("");
    expect(screen.queryByText("‘디자인 노트’ 샘플이 준비됐어요.")).not.toBeInTheDocument();
  });

  it("changes contextual navigation locally and identifies the current item when that cue is enabled", () => {
    render(<GlossaryPracticeLesson entry={practiceEntry} practice={visualFixture("navigation")} />);
    const menu = within(screen.getByRole("navigation", { name: "예시 사이트 메뉴" }));
    fireEvent.click(screen.getByRole("button", { name: "현재 위치 표시 켜기" }));
    fireEvent.click(menu.getByRole("button", { name: "문의" }));
    expect(menu.getByRole("button", { name: "문의" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { name: "문의" })).toBeInTheDocument();
    expect(screen.getByText("홈 / 문의")).toBeInTheDocument();
    expect(screen.getByText(/실제 전송은 하지 않습니다/)).toBeInTheDocument();
  });
});

describe("Practice rendering coverage", () => {
  it.each<VisualPreset>([
    "spacing",
    "typography",
    "contrast",
    "hierarchy",
    "balance",
    "responsive",
    "decoration",
    "fidelity",
    "navigation",
    "motion",
    "focus",
    "alttext",
    "form",
    "cards",
    "grid",
    "scale",
  ])("offers both comparison states and a reset in the %s visual exercise", (preset) => {
    const practice = visualFixture(preset);
    const { container } = render(
      <GlossaryPracticeLesson entry={practiceEntry} practice={practice} />,
    );
    const concept = within(screen.getByRole("region", { name: "핵심 구조" }));
    const diagram = concept.getByRole("img", { name: /^단순화한 핵심 구조/ });
    expect(diagram.tagName.toLowerCase()).toBe("svg");
    expect(diagram.querySelector("title")).not.toBeEmptyDOMElement();
    const description = diagram.querySelector("desc");
    expect(description).not.toBeEmptyDOMElement();
    expect(diagram).toHaveAccessibleName(expect.stringContaining(description!.textContent!));
    const initialSample = container.querySelector(".gp-visual-stage")!.innerHTML;
    const second = screen.getByRole("button", { name: practice.afterLabel });
    fireEvent.click(second);
    expect(second).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(practice.afterNote)).toBeInTheDocument();
    expect(container.querySelector(".gp-visual-stage")!.innerHTML).not.toEqual(initialSample);
    reset();
    expect(screen.getByRole("button", { name: practice.beforeLabel })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText(practice.beforeNote)).toBeInTheDocument();
    expect(container.querySelector(".gp-visual-stage")!.innerHTML).toEqual(initialSample);
  });

  it("mounts every retained practice with its actual entry, core relationship and instructions", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnings = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(Object.keys(PRACTICES).length).toBeGreaterThan(0);
    for (const practice of Object.values(PRACTICES)) {
      const entry = GLOSSARY.find((entry) => entry.id === practice.id)!;
      expect(entry, practice.id).toBeDefined();
      const view = render(<GlossaryPracticeLesson entry={entry} practice={practice} />);
      expect(screen.getByRole("heading", { name: entry.english }), entry.id).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "핵심 구조" }), entry.id).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "직접 해보기" }), entry.id).toBeInTheDocument();
      expect(screen.getByText(practice.scenario), entry.id).toBeInTheDocument();
      expect(screen.getByText(practice.instruction), entry.id).toBeInTheDocument();
      if (practice.kind === "visual") {
        const concept = within(screen.getByRole("region", { name: "핵심 구조" }));
        const diagrams = concept.getAllByRole("img", { name: /^단순화한 핵심 구조/ });
        expect(diagrams, entry.id).toHaveLength(1);
        expect(diagrams[0]!.querySelector("desc"), entry.id).not.toBeEmptyDOMElement();
      }
      const structure = within(screen.getByRole("list", { name: "개념의 핵심 관계" }));
      expect(structure.getAllByRole("listitem"), entry.id).toHaveLength(
        practice.structure.labels.length,
      );
      expect(screen.getByRole("button", { name: "처음부터 해보기" }), entry.id).toBeInTheDocument();
      view.unmount();
    }
    expect(errors).not.toHaveBeenCalled();
    expect(warnings).not.toHaveBeenCalled();
  }, 20_000);
});
