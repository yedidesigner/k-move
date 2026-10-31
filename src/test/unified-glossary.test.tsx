import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Glossary } from "@/components/Glossary";
import { filterGlossary, GLOSSARY, INTERACTIVE_GLOSSARY_COUNT } from "@/data/glossary";
import { LEARNING_ENTRIES } from "@/data/glossary-learning";
import entries from "@/data/glossary.json";
import originalIds from "./fixtures/original-glossary-ids.json";
import { getGlossaryDepth } from "@/data/glossary-depth";

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
  vi.doUnmock("@/data/learning/entries.json");
});

function cards() {
  return within(screen.getByRole("list", { name: "용어 카드" }));
}

describe("Focused design glossary", () => {
  it("shows twelve cards, a closed secondary filter, and keeps topic learning in materials", () => {
    const { container } = render(<Glossary />);
    expect(cards().getAllByRole("listitem")).toHaveLength(12);
    expect(container.querySelector(".glossary-advanced-filters")).not.toHaveAttribute("open");
    expect(screen.queryByRole("region", { name: "주제별로 이어 배우기" })).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "학습 주제" })).toBeVisible();
  });

  it("combines optional type and letter filters and resets the page on search", () => {
    render(<Glossary />);
    fireEvent.click(screen.getByText("상세 필터", { exact: false }));
    fireEvent.click(
      within(screen.getByRole("group", { name: "학습 유형 필터" })).getByRole("button", {
        name: /^예시 \+ 실습/,
      }),
    );
    expect(cards().getAllByRole("listitem")).toHaveLength(12);
    fireEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    expect(screen.getByLabelText(/페이지 중 2페이지/)).toBeVisible();
    fireEvent.change(screen.getByRole("searchbox", { name: "용어 검색" }), {
      target: { value: "Proximity" },
    });
    expect(cards().getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByLabelText("1페이지 중 1페이지")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "C로 시작하는 용어" }));
    expect(screen.getByText("일치하는 용어가 없습니다.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "전체 용어 보기" }));
    expect(cards().getAllByRole("listitem")).toHaveLength(12);
  });

  it("preserves the flipped card, query and topic when a lesson closes", async () => {
    render(<Glossary initialQuery="Proximity" />);
    fireEvent.change(screen.getByRole("combobox", { name: "학습 주제" }), {
      target: { value: "visual" },
    });
    fireEvent.click(cards().getByRole("button", { name: "Proximity — 설명 보기" }));
    const learn = cards().getByRole("button", { name: "Proximity 예시와 직접 해보기" });
    fireEvent.click(learn);
    const dialog = await screen.findByRole("dialog", { name: "Proximity 학습" });
    await within(dialog).findByRole("tab", { name: /핵심 구조/ });
    expect(within(dialog).getAllByRole("tabpanel")).toHaveLength(1);
    expect(within(dialog).queryByRole("heading", { name: "직접 해보기" })).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("tab", { name: /예시 · 실습/ }));
    const slider = within(dialog).getByRole("slider", { name: "그룹 사이 간격" });
    fireEvent.change(slider, { target: { value: "40" } });
    fireEvent.click(within(dialog).getByRole("tab", { name: /실무 해설/ }));
    expect(within(dialog).getByRole("heading", { name: "왜 이렇게 설계할까?" })).toBeVisible();
    fireEvent.keyDown(within(dialog).getByRole("tab", { name: /실무 해설/ }), { key: "ArrowLeft" });
    expect(within(dialog).getByRole("slider", { name: "그룹 사이 간격" })).toHaveValue("40");
    fireEvent.click(within(dialog).getByRole("button", { name: "학습 화면 닫기" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("searchbox", { name: "용어 검색" })).toHaveValue("Proximity");
    expect(screen.getByRole("combobox", { name: "학습 주제" })).toHaveValue("visual");
    expect(cards().getByRole("button", { name: "Proximity — 용어로 돌아가기" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await waitFor(() => expect(learn).toHaveFocus());
  });

  it.each(["CTA", "Hamburger menus", "Carousels"])(
    "keeps %s demonstrations behind the example step",
    async (term) => {
      render(<Glossary initialQuery={term} />);
      fireEvent.click(cards().getByRole("button", { name: `${term} 예시와 직접 해보기` }));
      const dialog = await screen.findByRole("dialog", { name: `${term} 학습` });
      await within(dialog).findByRole("tab", { name: /핵심 구조/ });
      expect(within(dialog).getByRole("img")).toBeVisible();
      fireEvent.click(within(dialog).getByRole("tab", { name: /예시 · 실습/ }));
      expect(within(dialog).getByRole("heading", { name: "직접 해보기" })).toBeVisible();
      expect(within(dialog).getAllByRole("tabpanel")).toHaveLength(1);
    },
  );

  it("opens a related concept in the same dialog and restores the original list", async () => {
    render(<Glossary initialQuery="Proximity" />);
    const learn = cards().getByRole("button", { name: "Proximity 예시와 직접 해보기" });
    fireEvent.click(learn);
    let dialog = await screen.findByRole("dialog", { name: "Proximity 학습" });
    fireEvent.click(await within(dialog).findByRole("tab", { name: /실무 해설/ }));
    const other = getGlossaryDepth("proximity")!.confusedWith[0]!;
    const otherTerm = GLOSSARY.find((t) => t.id === other.id)!;
    fireEvent.click(within(dialog).getByRole("link", { name: new RegExp(otherTerm.english) }));
    dialog = await screen.findByRole("dialog", { name: `${otherTerm.english} 학습` });
    expect(await within(dialog).findByRole("tab", { name: /핵심 구조/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "학습 화면 닫기" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("searchbox", { name: "용어 검색" })).toHaveValue("Proximity");
  });

  it("opens the new print concept with source attribution and meaningful visual evidence", async () => {
    const entry = GLOSSARY.find((t) => t.id === "bleed")!;
    render(<Glossary initialQuery="Bleed" />);
    fireEvent.click(cards().getByRole("button", { name: `${entry.english} 시각 예시 보기` }));
    const dialog = await screen.findByRole("dialog", { name: `${entry.english} 학습` });
    fireEvent.click(await within(dialog).findByRole("tab", { name: /예시 보기/ }));
    expect(dialog.querySelector('[data-expanded-example="bleed"]')).toBeVisible();
    expect(within(dialog).queryByRole("heading", { name: "직접 해보기" })).not.toBeInTheDocument();
    const source = within(dialog).getByText("출처·제작 정보").closest("details")!;
    expect(source).not.toHaveAttribute("open");
    fireEvent.click(source.querySelector("summary")!);
    expect(within(source).getAllByRole("link").length).toBeGreaterThan(0);
  });

  it("retains all 239 original terms with unique IDs and complete Korean learning content", () => {
    expect(originalIds).toHaveLength(239);
    const ids = new Set(GLOSSARY.map((entry) => entry.id));
    expect(ids.size).toBe(GLOSSARY.length);
    for (const id of originalIds) expect(ids.has(id), `Missing original term: ${id}`).toBe(true);
    for (const entry of GLOSSARY) {
      for (const field of [
        "english",
        "pronunciation",
        "korean",
        "description",
        "example",
      ] as const) {
        expect(entry[field], `${entry.id}.${field}`).toEqual(expect.any(String));
        expect(entry[field].trim().length, `${entry.id}.${field}`).toBeGreaterThan(0);
        expect(entry[field], `${entry.id}.${field}`).not.toMatch(
          /\bTODO\b|\bTBD\b|준비 중|작성 예정/i,
        );
      }
      expect(entry.pronunciation, entry.id).not.toMatch(/\[|\]/);
      expect(entry.example, entry.id).not.toBe(entry.description);
    }
    expect(GLOSSARY.map((entry) => entry.english)).toEqual(
      GLOSSARY.map((entry) => entry.english).sort((a, b) =>
        a.localeCompare(b, "en", { sensitivity: "base" }),
      ),
    );
  });

  it("normalizes search text and finds Korean readings and examples", () => {
    expect(filterGlossary("  ＣＴＡ  ", "C", "practice").map((entry) => entry.id)).toContain(
      "call-to-action-cta",
    );
    expect(filterGlossary("프록시미티", "P").map((entry) => entry.id)).toContain("proximity");
    const example = GLOSSARY.find((entry) => entry.id === "proximity")!.example;
    expect(filterGlossary(example, "ALL").map((entry) => entry.id)).toContain("proximity");
    const practiceIds = Object.values(LEARNING_ENTRIES)
      .filter((entry) => entry.mode === "practice")
      .map((entry) => entry.id);
    expect(INTERACTIVE_GLOSSARY_COUNT).toBe(practiceIds.length);
    expect(INTERACTIVE_GLOSSARY_COUNT).toBeGreaterThan(0);
    expect(INTERACTIVE_GLOSSARY_COUNT).toBeLessThan(239);
    expect(filterGlossary("", "ALL", "practice").map((entry) => entry.id)).toEqual(
      GLOSSARY.filter((entry) => practiceIds.includes(entry.id)).map((entry) => entry.id),
    );
  });

  it("adds a future term and visual specification without inventing a practice for it", async () => {
    vi.resetModules();
    vi.doMock("@/data/glossary.json", () => ({
      default: [
        ...entries,
        {
          id: "zoom-controls-test",
          english: "Zoom controls",
          pronunciation: "줌 컨트롤즈",
          korean: "확대·축소 조작부",
          description: "화면의 표시 배율을 바꾸는 조작 요소.",
          example: "지도에서 더하기 버튼을 눌러 주변 건물을 자세히 본다.",
          letter: "A",
        },
      ],
    }));
    vi.doMock("@/data/learning/entries.json", () => ({
      default: [
        ...Object.values(LEARNING_ENTRIES),
        {
          id: "zoom-controls-test",
          mode: "example",
          rationale: "배율 조작부의 위치와 표시 형태를 먼저 관찰한다.",
          figure: {
            kind: "screen",
            title: "지도 배율 조작부",
            subtitle: "지도 우측의 확대·축소 버튼",
            items: [
              { label: "확대", text: "+ 버튼" },
              { label: "축소", text: "− 버튼" },
            ],
            focus: "화면의 배율을 바꾸는 조작부를 찾는다.",
            caption: "확대·축소 조작부를 보여 주는 설명용 예시.",
          },
          references: [],
        },
      ],
    }));
    const expanded = await import("@/data/glossary");
    expect(expanded.GLOSSARY).toHaveLength(GLOSSARY.length + 1);
    expect(expanded.INTERACTIVE_GLOSSARY_COUNT).toBe(INTERACTIVE_GLOSSARY_COUNT);
    expect(expanded.LEARNING_FILTERS.find((filter) => filter.value === "example")?.count).toBe(
      GLOSSARY.length - INTERACTIVE_GLOSSARY_COUNT + 1,
    );
    expect(expanded.filterGlossary("줌 컨트롤즈", "Z", "example").map((entry) => entry.id)).toEqual(
      ["zoom-controls-test"],
    );
    expect(expanded.filterGlossary("줌 컨트롤즈", "Z", "practice")).toEqual([]);
    expect(expanded.GLOSSARY.map((entry) => entry.english)).toEqual(
      expanded.GLOSSARY.map((entry) => entry.english).sort((a, b) =>
        a.localeCompare(b, "en", { sensitivity: "base" }),
      ),
    );
  });
});
