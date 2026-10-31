import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Glossary } from "@/components/Glossary";
import { filterGlossary, GLOSSARY, INTERACTIVE_GLOSSARY_COUNT } from "@/data/glossary";
import { getLearningMode, LEARNING_ENTRIES } from "@/data/glossary-learning";
import type { LearningMode } from "@/data/learning/types";
import entries from "@/data/glossary.json";
import originalIds from "./fixtures/original-glossary-ids.json";
import { STUDY_GUIDES, getGuidesForTerm } from "@/data/study-materials";
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
  vi.resetModules();
});

function cards() {
  return within(screen.getByRole("list", { name: "용어 카드" }));
}

function practiceFilter() {
  return within(screen.getByRole("group", { name: "학습 유형 필터" })).getByRole("button", {
    name: /^예시 \+ 실습/,
  });
}

describe("Unified glossary", () => {
  it("has one term list and gives every visible term an appropriately labelled learning entry point", () => {
    render(<Glossary />);
    expect(screen.getAllByRole("list", { name: "용어 카드" })).toHaveLength(1);
    expect(
      screen.queryByRole("heading", { name: "눈으로 보고, 직접 해보기" }),
    ).not.toBeInTheDocument();
    expect(cards().getAllByRole("listitem")).toHaveLength(24);

    expect(
      cards().getAllByRole("button", { name: /(?:예시와 직접 해보기|시각 예시 보기)$/ }),
    ).toHaveLength(24);
    const filterGroup = within(screen.getByRole("group", { name: "학습 유형 필터" }));
    expect(filterGroup.getAllByRole("button")).toHaveLength(3);
    expect(filterGroup.getByRole("button", { name: /^예시 보기/ })).toBeInTheDocument();
    expect(filterGroup.getByRole("button", { name: /^예시 \+ 실습/ })).toBeInTheDocument();
    expect(filterGroup.queryByRole("button", { name: /^직접 해보기/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /시각 학습 열기/ })).not.toBeInTheDocument();
    const library = screen.getByRole("region", { name: "주제별로 이어 배우기" });
    expect(library.querySelector("details")).not.toHaveAttribute("open");
    const termList = screen.getByRole("list", { name: "용어 카드" });
    expect(
      termList.compareDocumentPosition(library) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.queryAllByRole("link").some((link) => link.getAttribute("href") === "/materials"),
    ).toBe(false);
  });

  it("combines practice, letter, and search filters and clears an empty result without trapping the learner", () => {
    render(<Glossary />);
    fireEvent.click(practiceFilter());
    fireEvent.click(screen.getByRole("button", { name: "C로 시작하는 용어" }));
    expect(cards().getAllByRole("listitem")).toHaveLength(
      filterGlossary("", "C", "practice").length,
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "용어 검색" }), {
      target: { value: "Hamburger menus" },
    });
    expect(screen.getByText("일치하는 용어가 없습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "용어 카드" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "H로 시작하는 용어" }));
    expect(cards().getAllByRole("listitem")).toHaveLength(1);
    expect(
      cards().getByRole("button", { name: "Hamburger menus — 설명 보기" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "C로 시작하는 용어" }));
    fireEvent.click(screen.getByRole("button", { name: "전체 용어 보기" }));
    expect(screen.getByRole("searchbox", { name: "용어 검색" })).toHaveValue("");
    expect(screen.getByRole("searchbox", { name: "용어 검색" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "전체 알파벳" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(practiceFilter()).toHaveAttribute("aria-pressed", "false");
    expect(cards().getAllByRole("listitem")).toHaveLength(24);
  });

  it("returns to page one after filtering a later page, and keeps pagination within the result set", () => {
    render(<Glossary />);
    fireEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    expect(screen.getByLabelText("10페이지 중 2페이지")).toBeInTheDocument();
    expect(screen.getByLabelText("용어 검색 결과")).toHaveFocus();

    fireEvent.change(screen.getByRole("searchbox", { name: "용어 검색" }), {
      target: { value: "Z-shape layout" },
    });
    expect(cards().getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByLabelText("1페이지 중 1페이지")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이전 페이지" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "다음 페이지" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "검색어 지우기" }));
    fireEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    fireEvent.click(practiceFilter());
    expect(
      screen.getByLabelText(
        `${Math.ceil(filterGlossary("", "ALL", "practice").length / 24)}페이지 중 1페이지`,
      ),
    ).toBeInTheDocument();
    expect(cards().getAllByRole("listitem")).toHaveLength(
      Math.min(24, filterGlossary("", "ALL", "practice").length),
    );
  });

  it("finds a term by its Korean reading, flips to its example, and resets cards without clearing filters", () => {
    const proximity = GLOSSARY.find((entry) => entry.id === "proximity")!;
    render(<Glossary />);
    fireEvent.click(screen.getByRole("button", { name: "P로 시작하는 용어" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "용어 검색" }), {
      target: { value: proximity.pronunciation },
    });
    const flip = cards().getByRole("button", { name: "Proximity — 설명 보기" });
    expect(flip).toHaveTextContent(`[${proximity.pronunciation}] / ${proximity.korean}`);
    fireEvent.click(flip);
    expect(flip).toHaveAttribute("aria-pressed", "true");
    expect(flip).toHaveAccessibleDescription(expect.stringContaining(proximity.example));
    expect(
      cards().getByRole("button", { name: "Proximity 예시와 직접 해보기" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "카드 초기화" }));
    expect(cards().getByRole("button", { name: "Proximity — 설명 보기" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("searchbox", { name: "용어 검색" })).toHaveValue(
      proximity.pronunciation,
    );
    expect(screen.getByRole("button", { name: "P로 시작하는 용어" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it.each(["CTA", "Hamburger menus", "Carousels", "Proximity"])(
    "opens %s from its own card without flipping it and restores focus on close",
    async (term) => {
      render(<Glossary />);
      fireEvent.click(practiceFilter());
      fireEvent.change(screen.getByRole("searchbox", { name: "용어 검색" }), {
        target: { value: term },
      });
      const flip = cards().getByRole("button", { name: `${term} — 설명 보기` });
      const learn = cards().getByRole("button", { name: `${term} 예시와 직접 해보기` });
      learn.focus();
      fireEvent.click(learn);
      const dialog = screen.getByRole("dialog", { name: `${term} 학습` });
      expect(
        await within(dialog).findByRole("heading", {
          name: term === "Proximity" ? "시각 예시" : "핵심 구조",
        }),
      ).toBeInTheDocument();
      expect(
        await within(dialog).findByRole("heading", { name: "직접 해보기" }),
      ).toBeInTheDocument();
      const termId = {
        CTA: "call-to-action-cta",
        "Hamburger menus": "hamburger-menus",
        Carousels: "carousels",
        Proximity: "proximity",
      }[term]!;
      const expectedGuides = getGuidesForTerm(termId);
      const related = within(dialog).queryByRole("region", { name: "이 개념을 더 이해하기" });
      if (expectedGuides.length) {
        expect(related).toBeInTheDocument();
        expect(
          Array.from(related!.querySelectorAll("details[data-guide-id]"), (item) =>
            item.getAttribute("data-guide-id"),
          ),
        ).toEqual(expectedGuides.map((guide) => guide.id));
        related!
          .querySelectorAll("details[data-guide-id]")
          .forEach((details) => expect(details).not.toHaveAttribute("open"));
      } else {
        expect(related).not.toBeInTheDocument();
      }
      fireEvent.click(within(dialog).getByRole("button", { name: "학습 화면 닫기" }));
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(flip).toHaveAttribute("aria-pressed", "false");
      expect(practiceFilter()).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("searchbox", { name: "용어 검색" })).toHaveValue(term);
      await waitFor(() => expect(learn).toHaveFocus());
    },
  );

  it("opens deeper reasoning and a related guide inside the lesson without losing the glossary search, filters, or flipped card", async () => {
    render(<Glossary />);
    const entry = GLOSSARY.find((term) => term.id === "call-to-action-cta")!;
    const topic = screen.getByRole("combobox", { name: "학습 주제" });
    const topicId = getGlossaryDepth(entry.id)!.topic;
    fireEvent.change(topic, { target: { value: topicId } });
    fireEvent.click(practiceFilter());
    const letter = screen.getByRole("button", { name: "C로 시작하는 용어" });
    fireEvent.click(letter);
    const search = screen.getByRole("searchbox", { name: "용어 검색" });
    fireEvent.change(search, { target: { value: "CTA" } });
    const flip = cards().getByRole("button", { name: "CTA — 설명 보기" });
    fireEvent.click(flip);
    const learn = cards().getByRole("button", { name: "CTA 예시와 직접 해보기" });
    learn.focus();
    fireEvent.click(learn);
    const dialog = screen.getByRole("dialog", { name: "CTA 학습" });
    const depth = within(dialog).getByRole("region", { name: "용어 실무 해설" });
    const reasoning = within(depth)
      .getByText("판단 기준 더 보기", { exact: false })
      .closest("details")!;
    expect(reasoning).not.toHaveAttribute("open");
    fireEvent.click(reasoning.querySelector("summary")!);
    expect(reasoning).toHaveAttribute("open");
    expect(reasoning).toHaveTextContent(getGlossaryDepth(entry.id)!.critique.evidence);

    const guide = getGuidesForTerm(entry.id)[0]!;
    const related = within(dialog).getByRole("region", { name: "이 개념을 더 이해하기" });
    const guideDetails = related.querySelector<HTMLDetailsElement>(
      `details[data-guide-id="${guide.id}"]`,
    )!;
    expect(guideDetails).not.toHaveAttribute("open");
    fireEvent.click(guideDetails.querySelector("summary")!);
    const article = await within(guideDetails).findByRole("article", { name: guide.title });
    expect(article).toHaveTextContent(guide.decision.choice);
    const sources = within(article).getByText("출처·제작 정보").closest("details")!;
    expect(sources).not.toHaveAttribute("open");
    fireEvent.click(sources.querySelector("summary")!);
    expect(sources).toHaveAttribute("open");
    expect(guideDetails).toHaveAttribute("open");
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    const relatedTerms = within(article).getByRole("region", { name: "함께 볼 용어" });
    const sameTerm = within(relatedTerms).getByText(entry.english).closest("a")!;
    fireEvent.click(sameTerm);
    expect(guideDetails).toHaveAttribute("open");
    expect(sources).toHaveAttribute("open");
    expect(reasoning).toHaveAttribute("open");
    fireEvent.click(guideDetails.querySelector("summary")!);
    expect(guideDetails).not.toHaveAttribute("open");
    expect(reasoning).toHaveAttribute("open");
    fireEvent.click(guideDetails.querySelector("summary")!);
    expect(sources).toHaveAttribute("open");
    const nextTerm = guide.relatedTerms.find((term) => term.id !== entry.id)!;
    fireEvent.click(within(relatedTerms).getByText(nextTerm.english).closest("a")!);
    const nextDialog = await screen.findByRole("dialog", { name: `${nextTerm.english} 학습` });
    await within(nextDialog).findByRole("heading", { name: nextTerm.english, level: 2 });
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(search).toHaveValue("CTA");
    expect(topic).toHaveValue(topicId);
    fireEvent.click(within(nextDialog).getByRole("button", { name: "학습 화면 닫기" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(search).toHaveValue("CTA");
    expect(topic).toHaveValue(topicId);
    expect(letter).toHaveAttribute("aria-pressed", "true");
    expect(practiceFilter()).toHaveAttribute("aria-pressed", "true");
    expect(flip).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(learn).toHaveFocus());
  });

  it("opens a term from the supplementary guide library and returns to the same glossary page, flipped card, and guide link", async () => {
    render(<Glossary />);
    fireEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    expect(screen.getByLabelText("10페이지 중 2페이지")).toBeInTheDocument();
    const flip = cards().getAllByRole("button", { name: /— 설명 보기/ })[0]!;
    fireEvent.click(flip);
    const library = screen.getByRole("region", { name: "주제별로 이어 배우기" });
    const libraryDetails = library.querySelector("details")!;
    fireEvent.click(libraryDetails.querySelector("summary")!);
    await within(library).findByRole("searchbox", { name: "학습 가이드 검색" });
    const guide = STUDY_GUIDES[0]!;
    const guideDetails = library.querySelector<HTMLDetailsElement>(
      `details[data-guide-id="${guide.id}"]`,
    )!;
    fireEvent.click(guideDetails.querySelector("summary")!);
    const article = await within(guideDetails).findByRole("article", { name: guide.title });
    const target = guide.relatedTerms[0]!;
    const link = within(within(article).getByRole("region", { name: "함께 볼 용어" }))
      .getByText(target.english)
      .closest("a")!;
    link.focus();
    fireEvent.click(link);
    const dialog = await screen.findByRole("dialog", { name: `${target.english} 학습` });
    await within(dialog).findByRole("heading", { name: target.english, level: 2 });
    fireEvent.click(within(dialog).getByRole("button", { name: "학습 화면 닫기" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByLabelText("10페이지 중 2페이지")).toBeInTheDocument();
    expect(flip).toHaveAttribute("aria-pressed", "true");
    expect(libraryDetails).toHaveAttribute("open");
    expect(guideDetails).toHaveAttribute("open");
    await waitFor(() => expect(link).toHaveFocus());
  });

  it.each<LearningMode>(["example", "practice"])(
    "filters %s learning and preserves its state when closing with Escape",
    async (mode) => {
      const matching = GLOSSARY.filter((entry) => getLearningMode(entry) === mode);
      expect(matching.length).toBeGreaterThan(0);
      render(<Glossary />);
      const filter = within(screen.getByRole("group", { name: "학습 유형 필터" })).getByRole(
        "button",
        {
          name: mode === "practice" ? /^예시 \+ 실습/ : /^예시 보기/,
        },
      );
      fireEvent.click(filter);
      expect(filter).toHaveAttribute("aria-pressed", "true");
      expect(filter).toHaveTextContent(String(matching.length));
      expect(cards().getAllByRole("listitem")).toHaveLength(Math.min(24, matching.length));
      const action = mode === "practice" ? "예시와 직접 해보기" : "시각 예시 보기";
      for (const entry of matching.slice(0, 24)) {
        const english = entry.lessonId
          ? { cta: "CTA", hamburger: "Hamburger menus", carousel: "Carousels" }[entry.lessonId]
          : entry.english;
        expect(cards().getByRole("button", { name: `${english} ${action}` })).toBeInTheDocument();
      }
      const entry = matching.find((entry) => !entry.lessonId)!;
      fireEvent.change(screen.getByRole("searchbox", { name: "용어 검색" }), {
        target: { value: entry.english },
      });
      const learn = cards().getByRole("button", { name: `${entry.english} ${action}` });
      learn.focus();
      fireEvent.click(learn);
      const dialog = screen.getByRole("dialog", { name: `${entry.english} 학습` });
      expect(await within(dialog).findByRole("heading", { name: "시각 예시" })).toBeInTheDocument();
      if (mode === "practice") {
        expect(within(dialog).getByRole("heading", { name: "직접 해보기" })).toBeInTheDocument();
        expect(within(dialog).getByRole("button", { name: "처음부터 해보기" })).toBeInTheDocument();
      } else {
        expect(
          within(dialog).queryByRole("heading", { name: "직접 해보기" }),
        ).not.toBeInTheDocument();
        expect(
          within(dialog).queryByRole("button", { name: "처음부터 해보기" }),
        ).not.toBeInTheDocument();
      }
      fireEvent.keyDown(within(dialog).getByRole("button", { name: "학습 화면 닫기" }), {
        key: "Escape",
      });
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      await waitFor(() => expect(learn).toHaveFocus());
      expect(filter).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("searchbox", { name: "용어 검색" })).toHaveValue(entry.english);
    },
  );

  it.each(["Case study", "Case studies"])(
    "opens %s as a reference example without offering a forced practice",
    async (term) => {
      render(<Glossary />);
      fireEvent.change(screen.getByRole("searchbox", { name: "용어 검색" }), {
        target: { value: term },
      });
      const learn = cards().getByRole("button", { name: `${term} 시각 예시 보기` });
      expect(
        cards().queryByRole("button", { name: `${term} 예시와 직접 해보기` }),
      ).not.toBeInTheDocument();
      fireEvent.click(learn);
      const dialog = screen.getByRole("dialog", { name: `${term} 학습` });
      expect(await within(dialog).findByRole("heading", { name: "시각 예시" })).toBeInTheDocument();
      expect(within(dialog).getByRole("figure")).toBeInTheDocument();
      const references = within(within(dialog).getByRole("region", { name: "실제 사례 더 보기" }));
      expect(
        references
          .getAllByRole("link")
          .some(
            (link) => link.getAttribute("href") === "https://stevenwett.com/work/news-on-spotify",
          ),
      ).toBe(true);
      expect(
        within(dialog).queryByRole("heading", { name: "직접 해보기" }),
      ).not.toBeInTheDocument();
      expect(
        within(dialog).queryByRole("button", { name: "처음부터 해보기" }),
      ).not.toBeInTheDocument();
    },
  );
});

describe("Glossary content and expansion", () => {
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
        expect(entry[field], `${entry.id}.${field}`).not.toMatch(/TODO|TBD|준비 중|작성 예정/i);
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
