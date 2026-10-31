import { QueryClient } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/AppShell";
import { Route as MaterialsRoute } from "@/routes/_app/materials";
import { STUDY_GUIDES } from "@/data/study-materials";

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({
    status: "student",
    user: { email: "learner@example.test", user_metadata: { username: "학습자" } },
    signOut: vi.fn(),
  }),
}));
vi.mock("@/components/glossary/GlossaryExampleFigure", () => ({
  GlossaryExampleFigure: () => <figure aria-label="시각 예시" />,
}));
afterEach(cleanup);

async function renderLearningNavigation(initialEntries = ["/glossary"]) {
  const root = createRootRouteWithContext<{ queryClient: QueryClient }>()({ component: Outlet });
  const app = createRoute({
    getParentRoute: () => root,
    id: "/_app",
    path: "",
    ssr: false,
    component: () => (
      <AppShell>
        <Outlet />
      </AppShell>
    ),
  });
  const glossary = createRoute({
    getParentRoute: () => app,
    path: "/glossary",
    component: () => <h1>디자인 용어집</h1>,
  });
  const original = createRoute({
    getParentRoute: () => app,
    path: "/origin",
    component: () => <h1>이전 화면</h1>,
  });
  const materials = createRoute({
    getParentRoute: () => app,
    path: "/materials",
    validateSearch: (search: Record<string, unknown>): { guide?: string } => {
      const validator = MaterialsRoute.options.validateSearch;
      if (typeof validator !== "function")
        throw new Error("Materials route requires a query validator");
      return Reflect.apply(validator, undefined, [search]);
    },
    component: MaterialsRoute.options.component!,
  });
  const history = createMemoryHistory({ initialEntries, initialIndex: initialEntries.length - 1 });
  const router = createRouter({
    routeTree: root.addChildren([app.addChildren([glossary, original, materials])]),
    context: { queryClient: new QueryClient() },
    history,
    defaultPendingMinMs: 0,
  });
  await router.load();
  render(<RouterProvider router={router} />);
  await screen.findByRole("heading", {
    name: initialEntries[initialEntries.length - 1]?.startsWith("/materials")
      ? "학습자료"
      : "디자인 용어집",
    level: 1,
  });
  return { router, history };
}

describe("Separate glossary and study materials navigation", () => {
  it("offers both destinations on desktop and mobile and preserves access to assignments and portfolio", async () => {
    await renderLearningNavigation();
    for (const name of ["주요 메뉴", "하단 메뉴"]) {
      const menu = within(screen.getByRole("navigation", { name }));
      expect(menu.getByRole("link", { name: "용어집" })).toHaveAttribute("href", "/glossary");
      expect(menu.getByRole("link", { name: "학습자료" })).toHaveAttribute("href", "/materials");
      expect(menu.getByRole("link", { name: "과제" })).toHaveAttribute("href", "/assignments");
    }
    const moreMenu = within(screen.getByRole("banner")).getByText("추가 메뉴");
    expect(moreMenu.closest("details")).not.toHaveAttribute("open");
    fireEvent.click(moreMenu);
    expect(
      within(screen.getByRole("banner")).getByRole("link", { name: "내 포트폴리오" }),
    ).toHaveAttribute("href", "/portfolio");
  });

  it("renders the materials page without redirect and preserves guide state through Back and Forward", async () => {
    const { router, history } = await renderLearningNavigation(["/origin", "/materials"]);
    expect(router.state.location.pathname).toBe("/materials");
    expect(history.length).toBe(2);
    const guide = STUDY_GUIDES.find((item) => item.topic === "systems")!;
    fireEvent.change(screen.getByRole("combobox", { name: "가이드 주제" }), {
      target: { value: "systems" },
    });
    fireEvent.change(screen.getByRole("searchbox", { name: "학습 가이드 검색" }), {
      target: { value: guide.title },
    });
    fireEvent.click(screen.getByText(guide.title, { exact: true }).closest("a")!);
    await screen.findByRole("article", { name: guide.title });
    await waitFor(() => expect(router.state.location.search).toEqual({ guide: guide.id }));
    expect(history.length).toBe(3);
    await act(async () => {
      history.back();
    });
    await screen.findByRole("searchbox", { name: "학습 가이드 검색" });
    expect(screen.getByRole("searchbox", { name: "학습 가이드 검색" })).toHaveValue(guide.title);
    expect(screen.getByRole("combobox", { name: "가이드 주제" })).toHaveValue("systems");
    expect(screen.getByText(guide.title, { exact: true }).closest("a")).toHaveFocus();
    await act(async () => {
      history.forward();
    });
    expect(await screen.findByRole("article", { name: guide.title })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "학습자료 목록" }));
    await screen.findByRole("searchbox", { name: "학습 가이드 검색" });
    await waitFor(() => expect(router.state.location.search).toEqual({}));
  });

  it("validates guide queries and opens a valid bookmarked lesson", async () => {
    const validator = MaterialsRoute.options.validateSearch;
    expect(typeof validator).toBe("function");
    if (typeof validator !== "function") return;
    expect(Reflect.apply(validator, undefined, [{ guide: "<script>" }])).toEqual({});
    expect(Reflect.apply(validator, undefined, [{ guide: ["ux-ui-foundations"] }])).toEqual({});
    expect(Reflect.apply(validator, undefined, [{ guide: "a".repeat(101) }])).toEqual({});
    const guide = STUDY_GUIDES[0]!;
    await renderLearningNavigation([`/materials?guide=${guide.id}`]);
    expect(await screen.findByRole("article", { name: guide.title })).toBeVisible();
  });

  it("continues to the next guide with URL history and returns focus to the original filtered result", async () => {
    const { router, history } = await renderLearningNavigation(["/materials"]);
    const [guide, nextGuide] = STUDY_GUIDES.filter((item) => item.topic === "systems");
    expect(guide).toBeDefined();
    expect(nextGuide).toBeDefined();
    fireEvent.change(screen.getByRole("combobox", { name: "가이드 주제" }), {
      target: { value: "systems" },
    });
    fireEvent.change(screen.getByRole("searchbox", { name: "학습 가이드 검색" }), {
      target: { value: guide!.title },
    });
    fireEvent.click(screen.getByText(guide!.title, { exact: true }).closest("a")!);
    await screen.findByRole("article", { name: guide!.title });
    fireEvent.click(screen.getByRole("tab", { name: "내 작업에 적용" }));
    fireEvent.click(
      within(screen.getByRole("navigation", { name: "다음 가이드" })).getByRole("link"),
    );
    expect(await screen.findByRole("article", { name: nextGuide!.title })).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(1);
    await waitFor(() => expect(router.state.location.search).toEqual({ guide: nextGuide!.id }));
    expect(screen.getByRole("tab", { name: "개념 이해" })).toHaveAttribute("aria-selected", "true");
    expect(screen.queryByRole("navigation", { name: "다음 가이드" })).not.toBeInTheDocument();

    await act(async () => {
      history.back();
    });
    expect(await screen.findByRole("article", { name: guide!.title })).toBeVisible();
    await waitFor(() => expect(router.state.location.search).toEqual({ guide: guide!.id }));
    await act(async () => {
      history.forward();
    });
    expect(await screen.findByRole("article", { name: nextGuide!.title })).toBeVisible();
    await waitFor(() => expect(router.state.location.search).toEqual({ guide: nextGuide!.id }));

    fireEvent.click(screen.getByRole("button", { name: "학습자료 목록" }));
    await screen.findByRole("searchbox", { name: "학습 가이드 검색" });
    await waitFor(() => expect(router.state.location.search).toEqual({}));
    expect(screen.getByRole("searchbox", { name: "학습 가이드 검색" })).toHaveValue(guide!.title);
    expect(screen.getByRole("combobox", { name: "가이드 주제" })).toHaveValue("systems");
    expect(screen.getByText(guide!.title, { exact: true }).closest("a")).toHaveFocus();
  });
});
