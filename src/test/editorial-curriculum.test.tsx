import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GLOSSARY } from "@/data/glossary";
import { GLOSSARY_DEPTH } from "@/data/glossary-depth";
import { DESIGN_SOURCES, TOPICS, type SourceCitation } from "@/data/design-sources";
import { STUDY_GUIDES, STUDY_PATHS } from "@/data/study-materials";
import { Glossary } from "@/components/Glossary";
import { GlossaryDepthPanel } from "@/components/glossary/GlossaryDepthPanel";

afterEach(cleanup);
const terms = new Map(GLOSSARY.map((term) => [term.id, term]));
const sources = new Map(DESIGN_SOURCES.map((source) => [source.id, source]));
function validCitation(ref: SourceCitation, owner: string) {
  const source = sources.get(ref.sourceId);
  expect(source, `${owner}: ${ref.sourceId}`).toBeDefined();
  expect(ref.pdfPages.length, owner).toBeGreaterThan(0);
  expect(ref.section.trim().length, owner).toBeGreaterThan(0);
  expect(["concept", "application", "context"]).toContain(ref.relation);
  for (const page of ref.pdfPages) {
    expect(Number.isInteger(page), owner).toBe(true);
    expect(page, owner).toBeGreaterThanOrEqual(1);
    expect(page, owner).toBeLessThanOrEqual(source!.pageCount);
  }
}
describe("Source-aware design curriculum", () => {
  it("gives each of the239 existing terms distinct applied and critical reading with valid references", () => {
    expect(GLOSSARY_DEPTH).toHaveLength(239);
    expect(new Set(GLOSSARY_DEPTH.map((item) => item.id)).size).toBe(239);
    expect([...GLOSSARY_DEPTH.map((item) => item.id)].sort()).toEqual([...terms.keys()].sort());
    for (const profile of GLOSSARY_DEPTH) {
      expect(
        TOPICS.some((topic) => topic.id === profile.topic),
        profile.id,
      ).toBe(true);
      expect(terms.get(profile.id)!.description, profile.id).toBe(profile.definition);
      for (const text of [
        profile.essential,
        ...Object.values(profile.application),
        ...Object.values(profile.critique),
      ]) {
        expect(text.trim().length, profile.id).toBeGreaterThan(15);
        expect(text, profile.id).not.toMatch(/TODO|TBD|추후 작성/);
      }
      if (!profile.sourceRefs.length)
        expect(profile.sourceNote?.trim().length, profile.id).toBeGreaterThan(10);
      for (const ref of profile.sourceRefs) validCitation(ref, profile.id);
      for (const other of profile.confusedWith) {
        expect(terms.has(other.id), `${profile.id} -> ${other.id}`).toBe(true);
        expect(other.id).not.toBe(profile.id);
        expect(other.difference.trim().length).toBeGreaterThan(10);
      }
    }
  });
  it("uses all ten supplied sources in substantive guides and connects every guide to a learning path", () => {
    expect(DESIGN_SOURCES).toHaveLength(10);
    expect(STUDY_GUIDES).toHaveLength(20);
    const cited = new Set(
      STUDY_GUIDES.flatMap((guide) => guide.sourceRefs.map((ref) => ref.sourceId)),
    );
    expect([...cited].sort()).toEqual([...sources.keys()].sort());
    for (const guide of STUDY_GUIDES) {
      expect(guide.sections.length, guide.id).toBeGreaterThanOrEqual(4);
      expect(
        guide.sections.reduce((sum, section) => sum + section.body.length, 0),
        guide.id,
      ).toBeGreaterThan(500);
      expect(guide.exercise.criteria.length, guide.id).toBeGreaterThanOrEqual(3);
      for (const text of Object.values(guide.decision))
        expect(text.length, guide.id).toBeGreaterThan(10);
      for (const ref of guide.sourceRefs) validCitation(ref, guide.id);
      expect(terms.has(guide.visualTermId!), guide.id).toBe(true);
    }
    expect(STUDY_PATHS).toHaveLength(3);
    expect([...new Set(STUDY_PATHS.flatMap((path) => path.guideIds))].sort()).toEqual(
      STUDY_GUIDES.map((guide) => guide.id).sort(),
    );
    const excerpt = sources.get("design-psychology")!;
    expect(excerpt.edition).toContain("발췌본");
    expect(excerpt.pageCount).toBe(28);
  });
  it("filters the single glossary by topic and resets all filters from an empty result", () => {
    render(<Glossary />);
    const topic = screen.getByRole("combobox", { name: "학습 주제" });
    fireEvent.change(topic, { target: { value: "systems" } });
    const visible = within(screen.getByRole("list", { name: "용어 카드" }));
    const eligible = GLOSSARY_DEPTH.filter((profile) => profile.topic === "systems");
    expect(eligible.length).toBeGreaterThan(0);
    expect(visible.getAllByRole("button", { name: /— 설명 보기/ }).length).toBe(
      Math.min(24, eligible.length),
    );
    fireEvent.change(screen.getByRole("searchbox", { name: "용어 검색" }), {
      target: { value: "없는용어9999" },
    });
    fireEvent.click(screen.getByRole("button", { name: "전체 용어 보기" }));
    expect(topic).toHaveValue("all");
    expect(screen.getByRole("searchbox", { name: "용어 검색" })).toHaveValue("");
  });
  it("keeps professional analysis and citation scope available without pretending it is an interactive demo", () => {
    render(<GlossaryDepthPanel termId="proximity" />);
    const panel = screen.getByRole("region", { name: "용어 실무 해설" });
    expect(
      within(panel).getByText("실무에 적용하기", { exact: false }).closest("details"),
    ).toHaveAttribute("open");
    const advanced = within(panel)
      .getByText("한 단계 더 깊게", { exact: false })
      .closest("details")!;
    expect(advanced).not.toHaveAttribute("open");
    fireEvent.click(advanced.querySelector("summary")!);
    expect(advanced).toHaveAttribute("open");
    expect(within(panel).queryByRole("button")).not.toBeInTheDocument();
    expect(within(panel).getByText("학습 근거와 적용 범위", { exact: false })).toBeInTheDocument();
  });
});
