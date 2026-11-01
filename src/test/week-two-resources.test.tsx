import type { ComponentType, ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WeekTwoResources } from "@/components/WeekTwoResources";
import { Route } from "@/routes/_app/sessions.$id";

const auth = vi.hoisted(() => ({ status: "student" }));
const publication = vi.hoisted(() => ({
  hidden: false,
  materials: [] as Record<string, unknown>[],
}));
vi.mock("@/lib/auth", () => ({ useAuth: () => auth }));
vi.mock("@/lib/published-content", async () => {
  const { mergeSessions, initialContent } = await import("@/lib/content-model");
  return {
    usePublishedContent: () => ({
      sessions: mergeSessions([
        {
          kind: "session",
          content_key: "S02",
          hidden: publication.hidden,
          document: { ...initialContent("session", "S02"), materials: publication.materials },
          published_at: "2026-11-01T00:00:00Z",
        },
      ]),
      guides: [],
      glossary: [],
    }),
    PublishedAnnouncements: () => null,
  };
});
vi.mock("@tanstack/react-router", async () => {
  const { SESSIONS } = await import("@/data/schedule");
  return {
    createFileRoute: () => (options: { component: ComponentType }) => ({
      options,
      useLoaderData: () => SESSIONS.find((session) => session.id === "S02"),
    }),
    Link: ({
      to,
      params,
      children,
      ...props
    }: {
      to: string;
      params?: { id: string };
      children: ReactNode;
    }) => (
      <a {...props} href={to.replace("$id", params?.id ?? "")}>
        {children}
      </a>
    ),
    notFound: () => new Error("Not found"),
  };
});
afterEach(cleanup);
beforeEach(() => {
  auth.status = "student";
  publication.hidden = false;
  publication.materials = [];
});
const SessionDetail = Route.options.component as ComponentType;
const practiceMaterial = {
  id: "week-02-class-materials",
  title: "수업 자료",
  fileName: "K_MOVE_DESIGN_261101_W2.zip",
  url: "https://drive.google.com/uc?export=download&id=1LLVSIWBvQcU0De68r0atWDlKgnoOEJt7",
  sizeBytes: 11249358,
};

describe("2주차 수업 자료", () => {
  it.each(["student", "instructor"])(
    "%s can view slides and download only the practice ZIP",
    (status) => {
      auth.status = status;
      render(<WeekTwoResources sessionId="S02" />);
      expect(screen.getByTitle(/슬라이드 뷰어/)).toHaveAttribute(
        "src",
        expect.stringContaining("/embed?"),
      );
      expect(screen.getByRole("link", { name: "슬라이드 크게 보기" })).toHaveAttribute(
        "href",
        expect.stringMatching(/\/preview$/),
      );
      const downloads = screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("href")?.includes("export=download"));
      expect(downloads).toHaveLength(1);
      expect(downloads[0]).toHaveTextContent("실습 자료 ZIP 다운로드");
    },
  );

  it.each(["loading", "anonymous", "pending", "blocked"])(
    "does not mount resources for %s",
    (status) => {
      auth.status = status;
      const { container } = render(<WeekTwoResources sessionId="S02" />);
      expect(container).toBeEmptyDOMElement();
    },
  );

  it("does not add week two resources to another session", () => {
    auth.status = "student";
    const { container } = render(<WeekTwoResources sessionId="S01" />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each(["student", "instructor"])(
    "preserves the slides and exposes one published ZIP download for %s",
    (status) => {
      auth.status = status;
      publication.materials = [practiceMaterial];
      render(<SessionDetail />);
      expect(screen.getByTitle(/슬라이드 뷰어/)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "슬라이드 크게 보기" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "K-MOVE 공유용 폴더" })).toBeInTheDocument();
      const downloads = screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("href")?.includes("export=download"));
      expect(downloads).toHaveLength(1);
      expect(downloads[0]).toHaveAccessibleName(
        `수업 자료 다운로드 (${practiceMaterial.fileName})`,
      );
      expect(
        screen.queryByRole("link", { name: "실습 자료 ZIP 다운로드" }),
      ).not.toBeInTheDocument();
    },
  );

  it("keeps the original ZIP download when no published material replaces it", () => {
    render(<SessionDetail />);
    expect(screen.getByRole("link", { name: "실습 자료 ZIP 다운로드" })).toHaveAttribute(
      "href",
      practiceMaterial.url,
    );
    expect(screen.getByTitle(/슬라이드 뷰어/)).toBeInTheDocument();
  });

  it("hides both published materials and the legacy slide resources for a hidden session", () => {
    publication.hidden = true;
    publication.materials = [practiceMaterial];
    render(<SessionDetail />);
    expect(screen.queryByTitle(/슬라이드 뷰어/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /다운로드/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "K-MOVE 공유용 폴더" })).not.toBeInTheDocument();
    expect(screen.getByText("세부 커리큘럼과 자료가 아직 공개되지 않았습니다")).toBeInTheDocument();
  });
});
