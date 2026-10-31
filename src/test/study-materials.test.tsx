import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { afterEach, describe, expect, it } from "vitest";
import { StudyMaterials } from "@/components/StudyMaterials";
import { STUDY_GUIDES, STUDY_PATHS, DESIGN_SOURCES } from "@/data/study-materials";
import { GLOSSARY } from "@/data/glossary";
import { getGlossaryLearning } from "@/data/glossary-learning";

afterEach(cleanup);

async function renderMaterials() {
  const root = createRootRoute({ component: Outlet });
  const materials = createRoute({
    getParentRoute: () => root,
    path: "/materials",
    component: StudyMaterials,
  });
  const glossary = createRoute({
    getParentRoute: () => root,
    path: "/glossary",
    validateSearch: (search: Record<string, unknown>) => ({
      term: typeof search["term"] === "string" ? search["term"] : "",
    }),
    component: () => <h1>용어집 검색 화면</h1>,
  });
  const router = createRouter({
    routeTree: root.addChildren([materials, glossary]),
    history: createMemoryHistory({ initialEntries: ["/materials"] }),
    defaultPendingMinMs: 0,
  });
  await router.load();
  render(<RouterProvider router={router} />);
  await screen.findByRole("heading", { name: "디자인 학습 자료" });
  return router;
}

function guideCards() {
  return within(screen.getByRole("list", { name: "디자인 학습 가이드" }));
}

describe("Design study materials", () => {
  it("provides twenty authored guides with valid glossary and visual-example connections", () => {
    expect(STUDY_GUIDES).toHaveLength(20);
    expect(new Set(STUDY_GUIDES.map((guide) => guide.id)).size).toBe(20);
    const terms = new Map(GLOSSARY.map((term) => [term.id, term]));
    for (const guide of STUDY_GUIDES) {
      expect(guide.objectives.length).toBeGreaterThan(0);
      expect(guide.sections.length).toBeGreaterThan(0);
      expect(guide.references.length).toBeGreaterThan(0);
      expect(guide.relatedTerms.length).toBeGreaterThan(0);
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

  it("shows all guides and searches English or Korean content without trapping an empty result", async () => {
    await renderMaterials();
    expect(guideCards().getAllByRole("button")).toHaveLength(20);
    const input = screen.getByRole("searchbox", { name: "학습 자료 검색" });
    const guide = STUDY_GUIDES[0]!;
    fireEvent.change(input, { target: { value: guide.title } });
    expect(
      guideCards().getByRole("button", { name: `${guide.title} 가이드 읽기` }),
    ).toBeInTheDocument();
    expect(guideCards().getAllByRole("button").length).toBeLessThan(20);
    fireEvent.change(input, { target: { value: guide.relatedTerms[0]!.english } });
    expect(
      guideCards().getByRole("button", { name: `${guide.title} 가이드 읽기` }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "검색어 지우기" }));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: "없는자료9999" } });
    expect(screen.getByRole("heading", { name: "검색 결과가 없습니다" })).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "디자인 학습 가이드" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "전체 가이드 보기" }));
    expect(input).toHaveFocus();
    expect(input).toHaveValue("");
    expect(guideCards().getAllByRole("button")).toHaveLength(20);
  });

  it("opens every guide's objectives, teaching sections, and bibliography and returns focus on close", async () => {
    await renderMaterials();
    for (const guide of STUDY_GUIDES) {
      const trigger = guideCards().getByRole("button", { name: `${guide.title} 가이드 읽기` });
      trigger.focus();
      fireEvent.click(trigger);
      const dialog = screen.getByRole("dialog", { name: guide.title });
      expect(
        within(dialog).getByRole("heading", { name: "이 가이드에서 배울 것" }),
      ).toBeInTheDocument();
      for (const objective of guide.objectives)
        expect(within(dialog).getByText(objective)).toBeInTheDocument();
      for (const section of guide.sections) {
        expect(within(dialog).getByRole("heading", { name: section.title })).toBeInTheDocument();
        expect(dialog).toHaveTextContent(section.body.replace(/\s+/g, " "));
      }
      const references = within(within(dialog).getByRole("region", { name: "참고한 자료" }));
      for (const reference of guide.references)
        expect(references.getAllByText(reference.title, { exact: false }).length).toBeGreaterThan(
          0,
        );
      expect(within(dialog).queryByRole("link", { name: /다운로드/ })).not.toBeInTheDocument();
      if (guide.application)
        expect(dialog).toHaveTextContent(guide.application.prompt.replace(/\s+/g, " "));
      fireEvent.click(within(dialog).getByRole("button", { name: "학습 가이드 닫기" }));
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      await waitFor(() => expect(trigger).toHaveFocus());
    }
  }, 20000);

  it("shows a real concept figure without adding an activity and preserves the filter after Escape", async () => {
    const guide = STUDY_GUIDES.find((item) => item.visualTermId)!;
    expect(guide).toBeDefined();
    const visual = getGlossaryLearning(guide.visualTermId!)!;
    await renderMaterials();
    const input = screen.getByRole("searchbox", { name: "학습 자료 검색" });
    fireEvent.change(input, { target: { value: guide.title } });
    const trigger = guideCards().getByRole("button", { name: `${guide.title} 가이드 읽기` });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: guide.title });
    expect(
      await within(dialog).findByRole("figure", {
        name: `${GLOSSARY.find((term) => term.id === visual.id)!.korean} 예시`,
      }),
    ).toBeInTheDocument();
    expect(within(dialog).queryByRole("heading", { name: "직접 해보기" })).not.toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(input).toHaveValue(guide.title);
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("navigates related terms to the glossary with the original English search term", async () => {
    const router = await renderMaterials();
    const guide = STUDY_GUIDES[0]!;
    const term = guide.relatedTerms[0]!;
    fireEvent.click(guideCards().getByRole("button", { name: `${guide.title} 가이드 읽기` }));
    const dialog = screen.getByRole("dialog", { name: guide.title });
    const related = within(within(dialog).getByRole("region", { name: "함께 볼 용어" }));
    const link = related.getByText(term.english).closest("a")!;
    expect(new URL(link.href, "https://k-move.vercel.app").searchParams.get("term")).toBe(
      term.english,
    );
    fireEvent.click(link);
    await screen.findByRole("heading", { name: "용어집 검색 화면" });
    expect(router.state.location.pathname).toBe("/glossary");
    expect(router.state.location.search).toMatchObject({ term: term.english });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("combines topic and level filters, resets empty combinations, and opens guides from learning paths", async () => {
    await renderMaterials();
    const topic = screen.getByRole("combobox", { name: "주제" });
    const level = screen.getByRole("combobox", { name: "학습 수준" });
    fireEvent.change(topic, { target: { value: "systems" } });
    fireEvent.change(level, { target: { value: "advanced" } });
    const expected = STUDY_GUIDES.filter(
      (guide) => guide.topic === "systems" && guide.level === "advanced",
    );
    expect(expected.length).toBeGreaterThan(0);
    expect(guideCards().getAllByRole("button")).toHaveLength(expected.length);
    fireEvent.change(screen.getByRole("searchbox", { name: "학습 자료 검색" }), {
      target: { value: "없는자료9999" },
    });
    fireEvent.click(screen.getByRole("button", { name: "전체 가이드 보기" }));
    expect(topic).toHaveValue("all");
    expect(level).toHaveValue("all");
    fireEvent.click(screen.getByRole("button", { name: "학습 경로" }));
    for (const path of STUDY_PATHS)
      expect(screen.getByRole("heading", { name: path.title })).toBeInTheDocument();
    const guide = STUDY_GUIDES.find((item) => item.id === STUDY_PATHS[0]!.guideIds[0])!;
    const trigger = screen.getByRole("button", { name: `${guide.title} 가이드 읽기` });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: guide.title });
    expect(
      within(dialog).getByRole("heading", { name: "디자인 판단 따라가기" }),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("heading", { name: "결과물 점검 기준" })).toBeInTheDocument();
    expect(dialog).toHaveTextContent(guide.decision.alternatives);
    expect(dialog).toHaveTextContent(guide.decision.validation);
    fireEvent.click(within(dialog).getByRole("button", { name: "학습 가이드 닫기" }));
    await waitFor(() => expect(trigger).toHaveFocus());
    fireEvent.click(screen.getByRole("button", { name: "참고 자료" }));
    const catalog = within(screen.getByRole("list", { name: "디자인 참고 자료" }));
    for (const source of DESIGN_SOURCES)
      expect(catalog.getByRole("heading", { name: source.title })).toBeInTheDocument();
    expect(catalog.getByText(/28쪽 발췌본/)).toBeInTheDocument();
    expect(catalog.queryByRole("link", { name: /다운로드/ })).not.toBeInTheDocument();
  });
});
