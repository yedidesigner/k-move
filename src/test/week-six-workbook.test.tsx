import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WeekSixWorkbook } from "@/components/WeekSixResources";
import { WEEK_SIX_ROUTES } from "@/data/week-six-practice";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    search,
    children,
  }: {
    to: string;
    search: { week: number };
    children: ReactNode;
  }) => <a href={`${to}?week=${search.week}`}>{children}</a>,
}));

const clipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  if (clipboard) Object.defineProperty(navigator, "clipboard", clipboard);
  else Reflect.deleteProperty(navigator, "clipboard");
});

describe("week six individual research workbook", () => {
  it("copies the common sheet structure, the selected track and the student's own fields together", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<WeekSixWorkbook userId="student-a" />);
    expect(screen.queryByRole("button", { name: /전체 복사/ })).toBeNull();
    for (const track of WEEK_SIX_ROUTES) {
      fireEvent.click(screen.getByRole("radio", { name: new RegExp(track.label) }));
      fireEvent.change(screen.getByLabelText("조사 산업군"), { target: { value: "커피" } });
      fireEvent.change(screen.getByLabelText("기존 탭 이름"), { target: { value: "브랜드 메모" } });
      fireEvent.change(screen.getByLabelText("방문자가 하려는 행동"), {
        target: { value: "두 원두의 향을 비교한다" },
      });
      fireEvent.click(screen.getByRole("button", { name: /전체 복사/ }));
      await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("복사했습니다"));
      const copied: string = writeText.mock.lastCall![0];
      for (const required of [
        track.prompt,
        "커피",
        "브랜드 메모",
        "두 원두의 향을 비교한다",
        "01 미국 브랜드 조사",
        "02 리디자인 후보 비교",
        "03 최종 선정과 기획 방향",
      ]) {
        expect(copied).toContain(required);
      }
      for (const other of WEEK_SIX_ROUTES.filter((item) => item.id !== track.id)) {
        expect(copied).not.toContain(other.prompt);
      }
    }
  });

  it("restores the student's stage and checklist without sharing preview state, and links to week six submissions", () => {
    const student = render(<WeekSixWorkbook userId="student-a" />);
    const goToFinal = () =>
      fireEvent.change(screen.getByRole("combobox", { name: /교시 이동/ }), {
        target: { value: "5" },
      });
    goToFinal();
    expect(screen.getByRole("link", { name: "6회차 과제&피드백 열기" })).toHaveAttribute(
      "href",
      "/feedback?week=6",
    );
    fireEvent.click(screen.getByRole("checkbox"));
    student.unmount();

    const preview = render(<WeekSixWorkbook userId={null} />);
    expect(screen.getByRole("combobox")).toHaveValue("0");
    goToFinal();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    preview.unmount();
    const secondStudent = render(<WeekSixWorkbook userId="student-b" />);
    expect(screen.getByRole("combobox")).toHaveValue("0");
    secondStudent.unmount();
    render(<WeekSixWorkbook userId="student-a" />);
    expect(screen.getByRole("combobox")).toHaveValue("5");
    expect(screen.getByRole("checkbox")).toBeChecked();
  });
});
