import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Glossary } from "@/components/Glossary";
import { filterGlossary, GLOSSARY, INTERACTIVE_GLOSSARY_COUNT } from "@/data/glossary";
import entries from "@/data/glossary.json";
import originalIds from "./fixtures/original-glossary-ids.json";

beforeEach(() => {
  // jsdom has no scrolling implementation; real scrolling is covered by browser QA.
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.doUnmock("@/data/glossary.json");
  vi.resetModules();
});

function cards() {
  return within(screen.getByRole("list", { name: "용어 카드" }));
}

function interactiveFilter() {
  return within(screen.getByRole("group", { name: "학습 유형 필터" }))
    .getByRole("button", { name: `직접 해보기 ${INTERACTIVE_GLOSSARY_COUNT}` });
}

describe("Unified glossary", () => {
  it("has one term list, with the three practice lessons available through that same list", () => {
    render(<Glossary />);
    expect(screen.getAllByRole("list", { name: "용어 카드" })).toHaveLength(1);
    expect(screen.queryByRole("heading", { name: "눈으로 보고, 직접 해보기" })).not.toBeInTheDocument();
    expect(cards().getAllByRole("listitem")).toHaveLength(24);

    fireEvent.click(interactiveFilter());
    expect(interactiveFilter()).toHaveAttribute("aria-pressed", "true");
    expect(cards().getAllByRole("listitem")).toHaveLength(3);
    expect(cards().getAllByRole("button", { name: /— 설명 보기$/ }).map(button => button.getAttribute("aria-label"))).toEqual([
      "CTA — 설명 보기", "Carousels — 설명 보기", "Hamburger menus — 설명 보기",
    ]);
    expect(cards().getAllByRole("button", { name: /핵심 구조와 예시 보기$/ })).toHaveLength(3);
    expect(screen.queryByRole("button", { name: /시각 학습 열기/ })).not.toBeInTheDocument();
  });

  it("combines practice, letter, and search filters and clears an empty result without trapping the learner", () => {
    render(<Glossary />);
    fireEvent.click(interactiveFilter());
    fireEvent.click(screen.getByRole("button", { name: "C로 시작하는 용어" }));
    expect(cards().getAllByRole("listitem")).toHaveLength(2);

    fireEvent.change(screen.getByRole("searchbox", { name: "용어 검색" }), { target: { value: "Hamburger menus" } });
    expect(screen.getByText("일치하는 용어가 없습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "용어 카드" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "H로 시작하는 용어" }));
    expect(cards().getAllByRole("listitem")).toHaveLength(1);
    expect(cards().getByRole("button", { name: "Hamburger menus — 설명 보기" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "C로 시작하는 용어" }));
    fireEvent.click(screen.getByRole("button", { name: "전체 용어 보기" }));
    expect(screen.getByRole("searchbox", { name: "용어 검색" })).toHaveValue("");
    expect(screen.getByRole("searchbox", { name: "용어 검색" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "전체 알파벳" })).toHaveAttribute("aria-pressed", "true");
    expect(interactiveFilter()).toHaveAttribute("aria-pressed", "false");
    expect(cards().getAllByRole("listitem")).toHaveLength(24);
  });

  it("returns to page one after filtering a later page, and keeps pagination within the result set", () => {
    render(<Glossary />);
    fireEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    expect(screen.getByLabelText("10페이지 중 2페이지")).toBeInTheDocument();
    expect(screen.getByLabelText("용어 검색 결과")).toHaveFocus();

    fireEvent.change(screen.getByRole("searchbox", { name: "용어 검색" }), { target: { value: "Z-shape layout" } });
    expect(cards().getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByLabelText("1페이지 중 1페이지")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이전 페이지" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "다음 페이지" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "검색어 지우기" }));
    fireEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    fireEvent.click(interactiveFilter());
    expect(screen.getByLabelText("1페이지 중 1페이지")).toBeInTheDocument();
    expect(cards().getAllByRole("listitem")).toHaveLength(3);
  });

  it("finds a term by its Korean reading, flips to its example, and resets cards without clearing filters", () => {
    const proximity = GLOSSARY.find(entry => entry.id === "proximity")!;
    render(<Glossary />);
    fireEvent.click(screen.getByRole("button", { name: "P로 시작하는 용어" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "용어 검색" }), { target: { value: proximity.pronunciation } });
    const flip = cards().getByRole("button", { name: "Proximity — 설명 보기" });
    expect(flip).toHaveTextContent(`[${proximity.pronunciation}] / ${proximity.korean}`);
    fireEvent.click(flip);
    expect(flip).toHaveAttribute("aria-pressed", "true");
    expect(flip).toHaveAccessibleDescription(expect.stringContaining(proximity.example));
    expect(cards().queryByRole("button", { name: /핵심 구조와 예시 보기/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "카드 초기화" }));
    expect(cards().getByRole("button", { name: "Proximity — 설명 보기" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("searchbox", { name: "용어 검색" })).toHaveValue(proximity.pronunciation);
    expect(screen.getByRole("button", { name: "P로 시작하는 용어" })).toHaveAttribute("aria-pressed", "true");
  });

  it.each(["CTA", "Hamburger menus", "Carousels"])("opens %s from its own card without flipping it and restores focus on close", async (term) => {
    render(<Glossary />);
    fireEvent.click(interactiveFilter());
    const flip = cards().getByRole("button", { name: `${term} — 설명 보기` });
    const learn = cards().getByRole("button", { name: `${term} 핵심 구조와 예시 보기` });
    learn.focus();
    fireEvent.click(learn);
    const dialog = screen.getByRole("dialog", { name: `${term} 시각 학습` });
    expect(within(dialog).getByRole("heading", { name: "핵심 구조" })).toBeInTheDocument();
    expect(within(dialog).getByRole("heading", { name: "직접 해보기" })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "학습 화면 닫기" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(flip).toHaveAttribute("aria-pressed", "false");
    expect(interactiveFilter()).toHaveAttribute("aria-pressed", "true");
    expect(cards().getAllByRole("listitem")).toHaveLength(3);
    await waitFor(() => expect(learn).toHaveFocus());
  });
});

describe("Glossary content and expansion", () => {
  it("retains all 239 original terms with unique IDs and complete Korean learning content", () => {
    expect(originalIds).toHaveLength(239);
    const ids = new Set(GLOSSARY.map(entry => entry.id));
    expect(ids.size).toBe(GLOSSARY.length);
    for (const id of originalIds) expect(ids.has(id), `Missing original term: ${id}`).toBe(true);
    for (const entry of GLOSSARY) {
      for (const field of ["english", "pronunciation", "korean", "description", "example"] as const) {
        expect(entry[field], `${entry.id}.${field}`).toEqual(expect.any(String));
        expect(entry[field].trim().length, `${entry.id}.${field}`).toBeGreaterThan(0);
        expect(entry[field], `${entry.id}.${field}`).not.toMatch(/TODO|TBD|준비 중|작성 예정/i);
      }
      expect(entry.pronunciation, entry.id).not.toMatch(/[\[\]]/);
      expect(entry.example, entry.id).not.toBe(entry.description);
    }
    expect(GLOSSARY.map(entry => entry.english)).toEqual(
      GLOSSARY.map(entry => entry.english).sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })),
    );
  });

  it("normalizes search text and finds Korean readings and examples", () => {
    expect(filterGlossary("  ＣＴＡ  ", "C", "interactive").map(entry => entry.id)).toContain("call-to-action-cta");
    expect(filterGlossary("프록시미티", "P").map(entry => entry.id)).toContain("proximity");
    const example = GLOSSARY.find(entry => entry.id === "proximity")!.example;
    expect(filterGlossary(example, "ALL").map(entry => entry.id)).toContain("proximity");
    expect(filterGlossary("", "ALL", "interactive").map(entry => entry.id)).toEqual([
      "call-to-action-cta", "carousels", "hamburger-menus",
    ]);
  });

  it("includes a new data record in sorting, reading search, alphabet filtering, and lesson counts without a new ID map", async () => {
    vi.resetModules();
    vi.doMock("@/data/glossary.json", () => ({
      default: [...entries, {
        id: "zoom-controls-test",
        english: "Zoom controls",
        pronunciation: "줌 컨트롤즈",
        korean: "확대·축소 조작부",
        description: "화면의 표시 배율을 바꾸는 조작 요소.",
        example: "지도에서 더하기 버튼을 눌러 주변 건물을 자세히 본다.",
        letter: "A",
        lessonId: "cta",
      }],
    }));
    const expanded = await import("@/data/glossary");
    expect(expanded.GLOSSARY).toHaveLength(GLOSSARY.length + 1);
    expect(expanded.INTERACTIVE_GLOSSARY_COUNT).toBe(INTERACTIVE_GLOSSARY_COUNT + 1);
    expect(expanded.filterGlossary("줌 컨트롤즈", "Z", "interactive").map(entry => entry.id)).toEqual(["zoom-controls-test"]);
    expect(expanded.GLOSSARY.map(entry => entry.english)).toEqual(
      expanded.GLOSSARY.map(entry => entry.english).sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })),
    );
  });
});
