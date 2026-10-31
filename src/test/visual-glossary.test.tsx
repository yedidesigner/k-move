import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Glossary } from "@/components/Glossary";
import { VisualGlossaryLesson } from "@/components/glossary/VisualGlossaryLesson";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function carousel() {
  return within(screen.getByRole("region", { name: "학습용 여행 콘텐츠" }));
}

function expectPosition(position: number, title: string) {
  expect(carousel().getByRole("status")).toHaveTextContent(`3개 중 ${position}번째, ${title}`);
}

function pointer(target: HTMLElement, type: "pointerdown" | "pointerup" | "pointercancel", x: number, y: number) {
  // jsdom lacks PointerEvent; supply the browser fields React's handler reads.
  const event = new MouseEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0 });
  Object.defineProperties(event, {
    isPrimary: { value: true },
    pointerType: { value: "touch" },
    pointerId: { value: 1 },
  });
  fireEvent(target, event);
}

describe("Visual glossary lessons", () => {
  it("lets the learner open and close a clearly labelled CTA sample without submitting data", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    render(<VisualGlossaryLesson lessonId="cta" />);

    fireEvent.click(screen.getByRole("button", { name: "무료로 시작하기" }));
    const panel = screen.getByRole("region", { name: "이메일로 받아보세요." });
    expect(within(panel).getByRole("textbox")).toHaveAttribute("readonly");
    expect(within(panel).getByRole("textbox")).toHaveValue("hello@example.com");
    const close = within(panel).getByRole("button", { name: "예시 닫기" });
    expect(close).toHaveFocus();
    fireEvent.click(close);

    expect(screen.queryByRole("region", { name: "이메일로 받아보세요." })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "무료로 시작하기" })).toHaveFocus();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("keeps the same CTA result when switching to a link appearance", () => {
    render(<VisualGlossaryLesson lessonId="cta" />);
    fireEvent.click(screen.getByRole("button", { name: "링크 형태" }));
    expect(screen.getByRole("button", { name: "링크 형태" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "무료로 시작하기" }));
    expect(screen.getByRole("region", { name: "이메일로 받아보세요." })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("button", { name: "예시 닫기" }), { key: "Escape" });
    expect(screen.getByRole("button", { name: "무료로 시작하기" })).toHaveFocus();
  });

  it("opens navigation, selects local content, and returns focus to its trigger", () => {
    render(<VisualGlossaryLesson lessonId="hamburger" />);
    const trigger = screen.getByRole("button", { name: "메뉴" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const navigation = screen.getByRole("navigation", { name: "학습용 스튜디오 메뉴" });
    fireEvent.click(within(navigation).getByRole("button", { name: "스튜디오" }));
    expect(screen.queryByRole("navigation", { name: "학습용 스튜디오 메뉴" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Small studio. Open minds." })).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "전체 영역" }));
    fireEvent.click(trigger);
    const selectedItem = within(screen.getByRole("navigation", { name: "학습용 스튜디오 메뉴" })).getByRole("button", { name: "스튜디오" });
    expect(selectedItem).toHaveAttribute("aria-current", "page");
    fireEvent.keyDown(selectedItem, { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("stops carousel navigation at both boundaries and supports arrow keys", () => {
    render(<VisualGlossaryLesson lessonId="carousel" />);
    expectPosition(2, "숲의 리듬");
    const previous = carousel().getByRole("button", { name: "이전 콘텐츠" });
    const next = carousel().getByRole("button", { name: "다음 콘텐츠" });
    fireEvent.click(next);
    expectPosition(3, "모래의 선");
    expect(next).toBeDisabled();
    fireEvent.click(next);
    expectPosition(3, "모래의 선");
    const viewport = carousel().getByRole("group", { name: "사진 영역" });
    fireEvent.keyDown(viewport, { key: "ArrowLeft" });
    fireEvent.keyDown(viewport, { key: "ArrowLeft" });
    expectPosition(1, "바다의 여백");
    expect(previous).toBeDisabled();
    fireEvent.keyDown(viewport, { key: "ArrowLeft" });
    expectPosition(1, "바다의 여백");
    fireEvent.keyDown(viewport, { key: "ArrowRight" });
    expectPosition(2, "숲의 리듬");
  });

  it("preserves selected content and content order across all carousel layouts", () => {
    render(<VisualGlossaryLesson lessonId="carousel" />);
    fireEvent.click(carousel().getByRole("button", { name: "다음 콘텐츠" }));
    const layouts = within(carousel().getByRole("group", { name: "캐러셀 레이아웃" }));
    for (const name of ["한 장형", "여러 카드형", "중앙 강조형"]) {
      fireEvent.click(layouts.getByRole("button", { name }));
      expect(layouts.getByRole("button", { name })).toHaveAttribute("aria-pressed", "true");
      expectPosition(3, "모래의 선");
      expect(carousel().getAllByRole("article", { hidden: true }).map(item => item.getAttribute("aria-label"))).toEqual([
        "1 / 3, 바다의 여백", "2 / 3, 숲의 리듬", "3 / 3, 모래의 선",
      ]);
    }
  });

  it("treats horizontal swipes as navigation but leaves vertical scrolling and cancelled gestures alone", () => {
    render(<VisualGlossaryLesson lessonId="carousel" />);
    const viewport = carousel().getByRole("group", { name: "사진 영역" });
    pointer(viewport, "pointerdown", 220, 100);
    pointer(viewport, "pointerup", 140, 104);
    expectPosition(3, "모래의 선");
    pointer(viewport, "pointerdown", 140, 104);
    pointer(viewport, "pointerup", 220, 108);
    expectPosition(2, "숲의 리듬");
    pointer(viewport, "pointerdown", 140, 104);
    pointer(viewport, "pointerup", 160, 200);
    expectPosition(2, "숲의 리듬");
    pointer(viewport, "pointerdown", 220, 100);
    pointer(viewport, "pointercancel", 140, 104);
    pointer(viewport, "pointerup", 100, 104);
    expectPosition(2, "숲의 리듬");
  });

  it("starts a fresh lesson at the original selection when reopened", () => {
    const first = render(<VisualGlossaryLesson lessonId="carousel" />);
    fireEvent.click(carousel().getByRole("button", { name: "다음 콘텐츠" }));
    fireEvent.click(within(carousel().getByRole("group", { name: "캐러셀 레이아웃" })).getByRole("button", { name: "한 장형" }));
    first.unmount();
    render(<VisualGlossaryLesson lessonId="carousel" />);
    expectPosition(2, "숲의 리듬");
    expect(within(carousel().getByRole("group", { name: "캐러셀 레이아웃" })).getByRole("button", { name: "중앙 강조형" })).toHaveAttribute("aria-pressed", "true");
  });

  it("opens the lesson from a searched, flipped card and restores that card state and focus", async () => {
    render(<Glossary />);
    fireEvent.change(screen.getByRole("searchbox", { name: "용어 검색" }), { target: { value: "CTA" } });
    const flip = screen.getByRole("button", { name: "CTA — 설명 보기" });
    fireEvent.click(flip);
    expect(flip).toHaveAttribute("aria-pressed", "true");
    const learn = screen.getByRole("button", { name: "CTA 핵심 구조와 직접 해보기" });
    learn.focus();
    fireEvent.click(learn);
    const dialog = screen.getByRole("dialog", { name: "CTA 시각 학습" });
    expect(within(dialog).getByRole("img", { name: /행동 유도 요소 도식/ })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "무료로 시작하기" }));
    fireEvent.keyDown(within(dialog).getByRole("button", { name: "예시 닫기" }), { key: "Escape" });
    expect(screen.getByRole("dialog", { name: "CTA 시각 학습" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "무료로 시작하기" })).toHaveFocus();
    fireEvent.keyDown(within(dialog).getByRole("button", { name: "무료로 시작하기" }), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("searchbox", { name: "용어 검색" })).toHaveValue("CTA");
    expect(flip).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(learn).toHaveFocus());
  });
});
