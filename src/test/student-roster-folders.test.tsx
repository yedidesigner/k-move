import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FolderCollection } from "@/components/FolderCollection";
import {
  ASSIGNMENT_FOLDERS,
  ASSIGNMENT_ROOT_FOLDER_URL,
  PORTFOLIO_FOLDERS,
  PORTFOLIO_ROOT_FOLDER_URL,
} from "@/data/student-roster";

afterEach(cleanup);

const expectedNames = [
  "강민주", "강유민", "김다혜", "김선미", "김재은", "김화민", "류영진", "오한별",
  "이익제", "이주희", "이지원", "임시윤", "정여진", "최지인", "최형주",
];

describe("course folder collections", () => {
  it.each([
    { title: "ASSIGNMENTS", folders: ASSIGNMENT_FOLDERS, root: ASSIGNMENT_ROOT_FOLDER_URL, label: "수강생 과제 폴더", tone: "sky" as const },
    { title: "PORTFOLIO", folders: PORTFOLIO_FOLDERS, root: PORTFOLIO_ROOT_FOLDER_URL, label: "수강생 포트폴리오 폴더", tone: "yellow" as const },
  ])("shows all 15 names in the supplied order in $title", ({ title, folders, root, label, tone }) => {
    render(<FolderCollection title={title} folders={folders} rootFolderUrl={root} listLabel={label} tone={tone} />);
    const links = within(screen.getByRole("list", { name: label })).getAllByRole("link");
    expect(links).toHaveLength(15);
    expect(links.map(link => link.textContent?.replace("Google Drive 폴더 (새 탭에서 열기)", ""))).toEqual(expectedNames);
    expect(new Set(links.map(link => link.getAttribute("href"))).size).toBe(15);
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(screen.getByRole("link", { name: /전체 폴더/ })).toHaveAttribute("href", root);
  });

  it("opens the newly verified assignment and portfolio folders separately", () => {
    expect(ASSIGNMENT_FOLDERS.find(folder => folder.name === "김재은")?.url)
      .toBe("https://drive.google.com/drive/folders/1F9EUzBjHxESVDOP_wdLsWN8EqCOeTkhF");
    expect(PORTFOLIO_FOLDERS.find(folder => folder.name === "김재은")?.url)
      .toBe("https://drive.google.com/drive/folders/1v_z1FXGbG63qe-exLS208xkuJvXOFtmw");
    expect(new Set([...ASSIGNMENT_FOLDERS, ...PORTFOLIO_FOLDERS].map(folder => folder.url)).size).toBe(30);
  });
});
