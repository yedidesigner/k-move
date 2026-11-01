import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WeekTwoResources } from "@/components/WeekTwoResources";

const auth = vi.hoisted(() => ({ status: "student" }));
vi.mock("@/lib/auth", () => ({ useAuth: () => auth }));
afterEach(cleanup);

describe("2주차 수업 자료", () => {
  it.each(["student", "instructor"])("%s can view slides and download only the practice ZIP", (status) => {
    auth.status = status;
    render(<WeekTwoResources sessionId="S02" />);
    expect(screen.getByTitle(/슬라이드 뷰어/)).toHaveAttribute("src", expect.stringContaining("/embed?"));
    expect(screen.getByRole("link", { name: "슬라이드 크게 보기" })).toHaveAttribute("href", expect.stringMatching(/\/preview$/));
    const downloads = screen.getAllByRole("link").filter((link) => link.getAttribute("href")?.includes("export=download"));
    expect(downloads).toHaveLength(1);
    expect(downloads[0]).toHaveTextContent("실습 자료 ZIP 다운로드");
  });

  it.each(["loading", "anonymous", "pending", "blocked"])("does not mount resources for %s", (status) => {
    auth.status = status;
    const { container } = render(<WeekTwoResources sessionId="S02" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("does not add week two resources to another session", () => {
    auth.status = "student";
    const { container } = render(<WeekTwoResources sessionId="S01" />);
    expect(container).toBeEmptyDOMElement();
  });
});
