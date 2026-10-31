import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DesignGuideContent,
  RelatedDesignGuides,
  StudyMaterials,
} from "@/components/StudyMaterials";
import { STUDY_GUIDES, getGuidesForTerm } from "@/data/study-materials";
import { GLOSSARY } from "@/data/glossary";
import { getGlossaryLearning } from "@/data/glossary-learning";

vi.mock("@/components/glossary/GlossaryExampleFigure", () => ({
  GlossaryExampleFigure: ({ termId }: { termId: string }) => (
    <figure aria-label={`${termId} 시각 예시`} />
  ),
}));
afterEach(cleanup);

function openDetails(container: HTMLElement, text: string) {
  const summary = within(container).getByText(text, { exact: true });
  const details = summary.closest("details")!;
  expect(details).not.toHaveAttribute("open");
  fireEvent.click(summary);
  expect(details).toHaveAttribute("open");
  return details;
}

describe("A focused designer study library", () => {
  it("retains all 28 substantive guides and their precise term and source connections", () => {
    expect(STUDY_GUIDES).toHaveLength(28);
    expect(new Set(STUDY_GUIDES.map((guide) => guide.id)).size).toBe(28);
    const terms = new Map(GLOSSARY.map((term) => [term.id, term]));
    for (const guide of STUDY_GUIDES) {
      expect(guide.objectives.length).toBeGreaterThan(0);
      expect(guide.sections.length).toBeGreaterThanOrEqual(3);
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

  it("connects a term only to its explicitly related guides and opens a dedicated materials URL", () => {
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
    expect(getGuidesForTerm("missing-term")).toEqual([]);
    const view = render(<RelatedDesignGuides termId="call-to-action-cta" />);
    const region = screen.getByRole("region", { name: "이어서 공부하기" });
    const expected = getGuidesForTerm("call-to-action-cta");
    expect(within(region).getAllByRole("link")).toHaveLength(expected.length);
    for (const guide of expected)
      expect(within(region).getByRole("link", { name: guide.title })).toHaveAttribute(
        "href",
        `/materials?guide=${guide.id}`,
      );
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    view.rerender(<RelatedDesignGuides termId="missing-term" />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("begins with topics rather than full lessons and offers the whole catalog without experience levels", () => {
    render(<StudyMaterials />);
    expect(screen.getByRole("heading", { name: "학습자료", level: 1 })).toBeVisible();
    expect(screen.getByRole("heading", { name: "주제별로 이어 배우기" })).toBeVisible();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "주제별 학습 가이드" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "전체 가이드" }));
    const catalog = screen.getByRole("list", { name: "주제별 학습 가이드" });
    expect(within(catalog).getAllByRole("link")).toHaveLength(28);
    expect(screen.getAllByRole("combobox")).toHaveLength(1);
    expect(screen.queryByRole("combobox", { name: "학습 수준" })).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "디자인 참고 자료" })).not.toBeInTheDocument();
    for (const label of ["디자인 준비생", "경력 디자이너", "프로 디자이너"])
      expect(screen.queryByText(label, { exact: true })).not.toBeInTheDocument();
  });

  it("preserves search and topic on return, restores the originating link focus, and recovers from no matches", () => {
    render(<StudyMaterials />);
    const guide = STUDY_GUIDES.find((item) => item.topic === "systems")!;
    fireEvent.change(screen.getByRole("combobox", { name: "가이드 주제" }), {
      target: { value: "systems" },
    });
    fireEvent.change(screen.getByRole("searchbox", { name: "학습 가이드 검색" }), {
      target: { value: guide.title },
    });
    const link = screen.getByText(guide.title, { exact: true }).closest("a")!;
    fireEvent.click(link);
    expect(screen.getByRole("article", { name: guide.title })).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "학습자료 목록" }));
    expect(screen.getByRole("searchbox", { name: "학습 가이드 검색" })).toHaveValue(guide.title);
    expect(screen.getByRole("combobox", { name: "가이드 주제" })).toHaveValue("systems");
    expect(screen.getByText(guide.title, { exact: true }).closest("a")).toHaveFocus();
    fireEvent.change(screen.getByRole("searchbox", { name: "학습 가이드 검색" }), {
      target: { value: "없는가이드9999" },
    });
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "전체 가이드 보기" }));
    expect(screen.getByRole("searchbox", { name: "학습 가이드 검색" })).toHaveValue("");
    expect(screen.getByRole("combobox", { name: "가이드 주제" })).toHaveValue("all");
    expect(
      within(screen.getByRole("list", { name: "주제별 학습 가이드" })).getAllByRole("link"),
    ).toHaveLength(28);
  });

  it("keeps each guide's full content reachable while showing only one learning stage and concept at a time", () => {
    for (const guide of STUDY_GUIDES) {
      const view = render(<DesignGuideContent guide={guide} />);
      const article = screen.getByRole("article", { name: guide.title });
      expect(within(article).getAllByRole("tabpanel")).toHaveLength(1);
      const firstBody = within(article).getByText(guide.sections[0]!.body, { exact: true });
      expect(firstBody).toBeVisible();
      for (const [index, section] of guide.sections.entries()) {
        const button = within(article).getByRole("button", { name: section.title });
        if (index > 0) {
          expect(within(article).getByText(section.body, { exact: true })).not.toBeVisible();
          fireEvent.click(button);
          expect(firstBody).not.toBeVisible();
        }
        expect(button).toHaveAttribute("aria-expanded", "true");
        expect(within(article).getByText(section.body, { exact: true })).toBeVisible();
      }
      openDetails(article, "이 가이드에서 배울 것");
      for (const objective of guide.objectives)
        expect(within(article).getByText(objective, { exact: true })).toBeVisible();
      fireEvent.click(within(article).getByRole("tab", { name: "설계 판단" }));
      expect(within(article).getAllByRole("tabpanel")).toHaveLength(1);
      expect(within(article).getByText(guide.decision.alternatives, { exact: true })).toBeVisible();
      expect(within(article).getByText(guide.decision.validation, { exact: true })).toBeVisible();
      openDetails(article, "흔히 놓치는 점");
      for (const pitfall of guide.pitfalls)
        expect(within(article).getByText(pitfall, { exact: true })).toBeVisible();
      fireEvent.click(within(article).getByRole("tab", { name: "내 작업에 적용" }));
      expect(within(article).getAllByRole("tabpanel")).toHaveLength(1);
      expect(within(article).getByText(guide.exercise.deliverable, { exact: true })).toBeVisible();
      for (const criterion of guide.exercise.criteria)
        expect(within(article).getByText(criterion, { exact: true })).toBeVisible();
      const references = openDetails(article, "출처·제작 정보");
      for (const reference of guide.references) {
        expect(
          within(references).getAllByText(reference.title, { exact: false }).length,
        ).toBeGreaterThan(0);
        if (reference.note)
          expect(
            within(references).getAllByText(reference.note, { exact: true }).length,
          ).toBeGreaterThan(0);
      }
      expect(within(article).queryByRole("link", { name: /다운로드/ })).not.toBeInTheDocument();
      view.unmount();
    }
  }, 20000);

  it("supports keyboard tabs, keeps opened concept state, and links related terms to the glossary", () => {
    const guide = STUDY_GUIDES[0]!;
    render(<DesignGuideContent guide={guide} />);
    fireEvent.click(screen.getByRole("button", { name: guide.sections[1]!.title }));
    const concept = screen.getByRole("tab", { name: "개념 이해" });
    concept.focus();
    fireEvent.keyDown(concept, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "설계 판단" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "설계 판단" })).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(screen.getByRole("tab", { name: "설계 판단" }), { key: "End" });
    expect(screen.getByRole("tab", { name: "내 작업에 적용" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("tab", { name: "내 작업에 적용" }), { key: "Home" });
    expect(concept).toHaveFocus();
    expect(screen.getByText(guide.sections[1]!.body, { exact: true })).toBeVisible();
    const related = openDetails(screen.getByRole("article"), "함께 볼 용어");
    for (const term of guide.relatedTerms) {
      const link = within(related).getByText(term.english).closest("a")!;
      const url = new URL(link.href, "https://k-move.vercel.app");
      expect(url.pathname).toBe("/glossary");
      expect(url.searchParams.get("term")).toBe(term.english);
    }
  });

  it("opens a known deep link and handles an unknown guide without an empty screen", () => {
    const guide = STUDY_GUIDES[0]!;
    const view = render(<StudyMaterials guideId={guide.id} onGuideChange={() => {}} />);
    expect(screen.getByRole("article", { name: guide.title })).toBeVisible();
    view.rerender(<StudyMaterials guideId="missing-guide" onGuideChange={() => {}} />);
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("이 가이드를 찾을 수 없습니다");
    expect(screen.getByRole("searchbox", { name: "학습 가이드 검색" })).toBeVisible();
  });

  it("offers one ordered next guide from the same topic only in the application stage", () => {
    const [guide, nextGuide] = STUDY_GUIDES.filter((item) => item.topic === "systems");
    expect(guide).toBeDefined();
    expect(nextGuide).toBeDefined();
    const onGuideChange = vi.fn();
    render(<DesignGuideContent guide={guide!} onGuideChange={onGuideChange} />);
    expect(screen.queryByRole("navigation", { name: "다음 가이드" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "설계 판단" }));
    expect(screen.queryByRole("navigation", { name: "다음 가이드" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "내 작업에 적용" }));
    const nextNavigation = within(screen.getByRole("navigation", { name: "다음 가이드" }));
    expect(nextNavigation.getAllByRole("link")).toHaveLength(1);
    const nextLink = nextNavigation.getByRole("link", { name: `다음 가이드 ${nextGuide!.title}` });
    expect(nextLink).toHaveAttribute("href", `/materials?guide=${nextGuide!.id}`);
    fireEvent.click(nextLink);
    expect(onGuideChange).toHaveBeenCalledExactlyOnceWith(nextGuide!.id);
  });

  it("ends a topic without an invented completion claim or a next-topic jump", () => {
    const guides = STUDY_GUIDES.filter((item) => item.topic === "systems");
    const lastGuide = guides[guides.length - 1]!;
    render(<DesignGuideContent guide={lastGuide} />);
    fireEvent.click(screen.getByRole("tab", { name: "내 작업에 적용" }));
    expect(screen.queryByRole("navigation", { name: "다음 가이드" })).not.toBeInTheDocument();
    expect(
      screen.queryByText(/주제의 가이드를 모두 살펴봤습니다|학습을 완료했습니다/),
    ).not.toBeInTheDocument();
    expect(screen.getByText(lastGuide.exercise.deliverable, { exact: true })).toBeVisible();
  });
});
