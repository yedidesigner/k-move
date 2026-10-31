import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GLOSSARY } from "@/data/glossary";
import { getGlossaryLearning } from "@/data/glossary-learning";
import { STUDY_GUIDES } from "@/data/study-materials";
import {
  CONTEXTUAL_GROUPS,
  ContextualExample,
} from "@/components/glossary/contextual/ContextualExample";
import { GlossaryExampleFigure } from "@/components/glossary/GlossaryExampleFigure";

afterEach(cleanup);

describe("Contextual visual glossary examples", () => {
  it("covers every glossary term exactly once and every guide uses a covered term", () => {
    const ids = CONTEXTUAL_GROUPS.flatMap((group) => [...group.ids]);
    expect(ids).toHaveLength(239);
    expect(new Set(ids).size).toBe(239);
    expect([...ids].sort()).toEqual(GLOSSARY.map((term) => term.id).sort());
    for (const guide of STUDY_GUIDES) {
      expect(guide.visualTermId, guide.id).toBeDefined();
      expect(ids, guide.id).toContain(guide.visualTermId);
    }
  });

  it("renders a contextual scene and specific observation for all 239 terms without dead interactive controls", () => {
    const specializedFrames: string[] = [];
    for (const term of GLOSSARY) {
      const html = renderToStaticMarkup(
        <ContextualExample termId={term.id} figure={getGlossaryLearning(term.id)!.figure} />,
      );
      expect(html, term.id).toContain(`data-contextual-term="${term.id}"`);
      if (!html.includes("cx-frame")) specializedFrames.push(term.id);
      if (term.id === "curb-cut") {
        expect(html).toContain('role="img"');
        expect(html).toContain("경사로");
      }
      if (term.id === "domain") {
        expect(html).toContain("ci-domain-browser");
        expect(html).toContain("mora.example");
      }
      expect(html, term.id).toContain("cx-callout");
      expect(html, term.id).not.toMatch(/<(?:button|input|select|textarea)(?:\s|>)/);
      expect(html, term.id).not.toMatch(/TODO|TBD|작성 예정|예시를 입력/);
      expect(html, term.id).toContain("학습용 가상 예시");
    }
    expect(specializedFrames).toEqual(["curb-cut", "domain"]);
  });

  it("shows the essential structure before the realistic example and lets the learner collapse it", () => {
    const term = GLOSSARY.find((entry) => entry.id === "proximity")!;
    const { container } = render(
      <GlossaryExampleFigure termId={term.id} figure={getGlossaryLearning(term.id)!.figure} />,
    );
    const figure = screen.getByRole("figure", { name: `${term.korean} 예시` });
    const structure = container.querySelector("details.cx-key-structure")!;
    expect(structure).toHaveAttribute("open");
    expect(within(figure).getByText("핵심 구조 살펴보기")).toBeVisible();
    const contextual = container.querySelector('[data-contextual-term="proximity"]')!;
    expect(contextual).toBeVisible();
    expect(
      structure.compareDocumentPosition(contextual) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    fireEvent.click(within(figure).getByText("핵심 구조 살펴보기"));
    expect(structure).not.toHaveAttribute("open");
    expect(contextual).toBeVisible();
    expect(within(figure).getByText("학습용 가상 예시 · 정적 화면")).toBeVisible();
    expect(within(figure).queryByRole("button")).not.toBeInTheDocument();
  });
});
