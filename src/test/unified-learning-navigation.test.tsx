import { QueryClient } from "@tanstack/react-query";
import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
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

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({
    status: "student",
    user: { email: "learner@example.test", user_metadata: { username: "학습자" } },
    signOut: vi.fn(),
  }),
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
    component: () => <h1>통합 용어 학습</h1>,
  });
  const original = createRoute({
    getParentRoute: () => app,
    path: "/origin",
    component: () => <h1>이전 화면</h1>,
  });
  const materials = createRoute({
    getParentRoute: () => app,
    path: "/materials",
    // The generated callback type includes its production parent route. Invoke that
    // exact callback with this router's real context without replacing its behavior.
    beforeLoad: (context) => {
      const beforeLoad = MaterialsRoute.options.beforeLoad;
      if (!beforeLoad) throw new Error("The legacy route must provide its redirect");
      return Reflect.apply(beforeLoad, undefined, [context]);
    },
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
  await screen.findByRole("heading", { name: "통합 용어 학습" });
  return { router, history };
}

describe("One learning destination", () => {
  it("offers the glossary in desktop and mobile navigation without a separate materials destination", async () => {
    await renderLearningNavigation();
    for (const name of ["주요 메뉴", "하단 메뉴"]) {
      const menu = within(screen.getByRole("navigation", { name }));
      expect(menu.getByRole("link", { name: "용어집" })).toHaveAttribute("href", "/glossary");
      expect(menu.queryByRole("link", { name: "학습자료" })).not.toBeInTheDocument();
    }
    expect(
      screen.queryAllByRole("link").some((link) => link.getAttribute("href") === "/materials"),
    ).toBe(false);
  });

  it("replaces the legacy materials bookmark with the glossary so Back returns to the preceding page", async () => {
    const { router, history } = await renderLearningNavigation(["/origin", "/materials"]);
    expect(router.state.location.pathname).toBe("/glossary");
    expect(history.length).toBe(2);
    await act(async () => {
      history.back();
    });
    await screen.findByRole("heading", { name: "이전 화면" });
    await waitFor(() => expect(router.state.location.pathname).toBe("/origin"));
  });
});
