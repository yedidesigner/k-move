import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  DesignGuideContent,
  GlossaryGuideLibrary,
  RelatedDesignGuides,
} from "@/components/StudyMaterials";
import { STUDY_GUIDES, getGuidesForTerm } from "@/data/study-materials";
import { GLOSSARY } from "@/data/glossary";
import { getGlossaryLearning } from "@/data/glossary-learning";

afterEach(cleanup);

function disclosureFor(container: HTMLElement, id: string) {
  const details = container.querySelector<HTMLDetailsElement>(`details[data-guide-id="${id}"]`);
  expect(details, `Guide ${id} should have an inline disclosure`).not.toBeNull();
  return details!;
}

function summaryOf(details: HTMLDetailsElement) {
  const summary = details.querySelector<HTMLElement>(":scope > summary");
  expect(summary).not.toBeNull();
  return summary!;
}

async function openLibrary() {
  const library = screen.getByRole("region", { name: "주제별로 이어 배우기" });
  const details = library.querySelector<HTMLDetailsElement>("details")!;
  expect(details).not.toHaveAttribute("open");
  fireEvent.click(summaryOf(details));
  expect(details).toHaveAttribute("open");
  await within(library).findByRole("searchbox", { name: "학습 가이드 검색" });
  return { library, details };
}

function visibleGuideIds(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLDetailsElement>("details[data-guide-id]"))
    .filter((details) => !details.closest("[hidden]"))
    .map((details) => details.dataset["guideId"]!);
}

describe("Guides embedded in the glossary", () => {
  it("retains twenty substantive guides with valid glossary and visual connections", () => {
    expect(STUDY_GUIDES).toHaveLength(20);
    expect(new Set(STUDY_GUIDES.map((guide) => guide.id)).size).toBe(20);
    const terms = new Map(GLOSSARY.map((term) => [term.id, term]));
    for (const guide of STUDY_GUIDES) {
      expect(guide.objectives.length).toBeGreaterThan(0);
      expect(guide.sections.length).toBeGreaterThanOrEqual(4);
      expect(guide.references.length).toBeGreaterThan(0);
      expect(guide.relatedTerms.length).toBeGreaterThan(0);
      expect(guide).not.toHaveProperty("level");
      for (const term of guide.relatedTerms) {
        expect(terms.get(term.id)?.english).toBe(term.english);
        expect(terms.get(term.id)?.korean).toBe(term.korean);
      }
      if (guide.visualTermId) expect(getGlossaryLearning(guide.visualTermId)).toBeDefined();
      for (const reference of guide.references) {
        expect(reference.title.trim()).not.toBe("");
        expect(reference.location.trim()).not.toBe("");
        expect(JSON.stringify(reference)).not.toMatch(/drive\.google\.com/);
      }
    }
  });

  it("connects only explicitly related IDs, including visual terms, without topic or text fallback", () => {
    for (const term of GLOSSARY) {
      const expected = STUDY_GUIDES.filter(
        (guide) =>
          guide.visualTermId === term.id || guide.relatedTerms.some((item) => item.id === term.id),
      );
      expect(
        getGuidesForTerm(term.id).map((guide) => guide.id),
        term.id,
      ).toEqual(expected.map((guide) => guide.id));
    }
    expect(getGuidesForTerm("call-to-action-cta").map((guide) => guide.id)).toContain(
      "interaction-forms",
    );
    expect(getGuidesForTerm("carousels")).toEqual([]);
    expect(getGuidesForTerm("CTA")).toEqual([]);
    expect(getGuidesForTerm("interaction")).toEqual([]);
    expect(getGuidesForTerm("missing-term")).toEqual([]);
  });

  it("shows related guide titles and summaries as closed inline disclosures, and omits unrelated suggestions", async () => {
    const view = render(<RelatedDesignGuides termId="call-to-action-cta" />);
    const related = screen.getByRole("region", { name: "이 개념을 더 이해하기" });
    const expected = getGuidesForTerm("call-to-action-cta");
    expect(visibleGuideIds(related)).toEqual(expected.map((guide) => guide.id));
    for (const guide of expected) {
      const details = disclosureFor(related, guide.id);
      expect(details).not.toHaveAttribute("open");
      expect(summaryOf(details)).toHaveAccessibleName(guide.title);
      expect(summaryOf(details)).toHaveTextContent(guide.summary);
      fireEvent.click(summaryOf(details));
      expect(details).toHaveAttribute("open");
      expect(await within(details).findByRole("article", { name: guide.title })).toBeVisible();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      fireEvent.click(summaryOf(details));
      expect(details).not.toHaveAttribute("open");
    }
    view.rerender(<RelatedDesignGuides termId="carousels" />);
    expect(screen.queryByRole("region", { name: "이 개념을 더 이해하기" })).not.toBeInTheDocument();
    expect(screen.queryByText("질문부터 줄이는 폼 설계")).not.toBeInTheDocument();
  });

  it("keeps the supplementary library closed initially and exposes every guide without audience levels or a source catalog", async () => {
    render(<GlossaryGuideLibrary />);
    const { library } = await openLibrary();
    expect(visibleGuideIds(library)).toEqual(STUDY_GUIDES.map((guide) => guide.id));
    for (const guide of STUDY_GUIDES) {
      const details = disclosureFor(library, guide.id);
      expect(details).not.toHaveAttribute("open");
      expect(summaryOf(details)).toHaveAccessibleName(guide.title);
      expect(summaryOf(details)).toHaveTextContent(guide.summary);
    }
    expect(within(library).getAllByRole("combobox")).toHaveLength(1);
    expect(within(library).getByRole("combobox", { name: "가이드 주제" })).toBeVisible();
    expect(screen.queryByRole("combobox", { name: "학습 수준" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "학습 경로" })).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "디자인 참고 자료" })).not.toBeInTheDocument();
    for (const label of ["디자인 준비생", "경력 디자이너", "프로 디자이너"])
      expect(within(library).queryByText(label, { exact: true })).not.toBeInTheDocument();
  });

  it("combines search and topic, recovers from no matches, and preserves the reader's filters when collapsed", async () => {
    render(<GlossaryGuideLibrary />);
    const { library, details: libraryDetails } = await openLibrary();
    const input = within(library).getByRole("searchbox", { name: "학습 가이드 검색" });
    const topic = within(library).getByRole("combobox", { name: "가이드 주제" });
    const guide = STUDY_GUIDES.find((item) => item.topic === "systems")!;
    fireEvent.change(topic, { target: { value: guide.topic } });
    expect(visibleGuideIds(library)).toEqual(
      STUDY_GUIDES.filter((item) => item.topic === guide.topic).map((item) => item.id),
    );
    fireEvent.change(input, { target: { value: guide.title } });
    expect(visibleGuideIds(library)).toEqual([guide.id]);
    const guideDetails = disclosureFor(library, guide.id);
    fireEvent.click(summaryOf(guideDetails));
    expect(guideDetails).toHaveAttribute("open");
    await within(guideDetails).findByRole("article", { name: guide.title });
    fireEvent.click(summaryOf(libraryDetails));
    expect(libraryDetails).not.toHaveAttribute("open");
    fireEvent.click(summaryOf(libraryDetails));
    expect(input).toHaveValue(guide.title);
    expect(topic).toHaveValue(guide.topic);
    expect(guideDetails).toHaveAttribute("open");
    expect(within(guideDetails).getByRole("article", { name: guide.title })).toBeVisible();

    fireEvent.change(input, { target: { value: "없는가이드9999" } });
    expect(visibleGuideIds(library)).toEqual([]);
    fireEvent.click(within(library).getByRole("button", { name: "전체 가이드 보기" }));
    expect(input).toHaveValue("");
    expect(topic).toHaveValue("all");
    expect(visibleGuideIds(library)).toHaveLength(20);
    expect(guideDetails).toHaveAttribute("open");
    fireEvent.change(input, { target: { value: guide.relatedTerms[0]!.english } });
    expect(visibleGuideIds(library)).toContain(guide.id);
    fireEvent.click(within(library).getByRole("button", { name: "가이드 검색어 지우기" }));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
  });

  it("opens all twenty guides in place with their complete teaching content and optional closed references", async () => {
    render(<GlossaryGuideLibrary />);
    const { library } = await openLibrary();
    for (const guide of STUDY_GUIDES) {
      const details = disclosureFor(library, guide.id);
      fireEvent.click(summaryOf(details));
      const article = await within(details).findByRole("article", { name: guide.title });
      if (guide.visualTermId) await within(article).findByRole("figure");
      for (const objective of guide.objectives)
        expect(article).toHaveTextContent(objective.replace(/\s+/g, " "));
      for (const section of guide.sections) {
        expect(within(article).getByRole("heading", { name: section.title })).toBeVisible();
        expect(article).toHaveTextContent(section.body.replace(/\s+/g, " "));
      }
      expect(within(article).getByRole("heading", { name: "디자인 판단 따라가기" })).toBeVisible();
      expect(article).toHaveTextContent(guide.decision.alternatives);
      expect(article).toHaveTextContent(guide.decision.validation);
      for (const criterion of guide.exercise.criteria) expect(article).toHaveTextContent(criterion);
      const sources = within(article)
        .getByText("출처·제작 정보", { exact: false })
        .closest("details")!;
      expect(sources).not.toHaveAttribute("open");
      fireEvent.click(summaryOf(sources));
      expect(sources).toHaveAttribute("open");
      for (const reference of guide.references)
        expect(
          within(sources).getAllByText(reference.title, { exact: false }).length,
        ).toBeGreaterThan(0);
      expect(within(article).queryByRole("link", { name: /다운로드/ })).not.toBeInTheDocument();
      expect(
        within(article).queryByRole("button", { name: "처음부터 해보기" }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      fireEvent.click(summaryOf(details));
      expect(details).not.toHaveAttribute("open");
    }
  }, 20000);

  it("links a guide's exact related terms back to their English glossary query", () => {
    const guide = STUDY_GUIDES[0]!;
    render(<DesignGuideContent guide={guide} />);
    const article = screen.getByRole("article", { name: guide.title });
    const related = within(article).getByRole("region", { name: "함께 볼 용어" });
    for (const term of guide.relatedTerms) {
      const link = within(related).getByText(term.english).closest("a")!;
      const url = new URL(link.href, "https://k-move.vercel.app");
      expect(url.pathname).toBe("/glossary");
      expect(url.searchParams.get("term")).toBe(term.english);
    }
  });
});
