import type { ComponentPropsWithoutRef } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WeekSevenWorkbook } from "@/components/WeekSevenResources";
import { WEEK_SEVEN_CHECKLIST, WEEK_SEVEN_STEPS } from "@/data/week-seven-practice";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: ComponentPropsWithoutRef<"a"> & { to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
const firstStep = WEEK_SEVEN_STEPS[0]!;
const secondStep = WEEK_SEVEN_STEPS[1]!;

function chooseStage(value: number) {
  fireEvent.change(screen.getByRole("combobox", { name: "단계 이동" }), {
    target: { value: String(value) },
  });
}

function clipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, "", "/sessions/S07");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  if (originalClipboard) Object.defineProperty(navigator, "clipboard", originalClipboard);
  else Reflect.deleteProperty(navigator, "clipboard");
  window.history.replaceState({}, "", "/sessions/S07");
});

describe("session 07 step-by-step workbook", () => {
  it("starts from preparation and displays only the selected practice stage", () => {
    render(<WeekSevenWorkbook userId="student-a" />);
    expect(screen.getByRole("heading", { level: 2, name: "실습 준비" })).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.queryByRole("heading", { level: 2, name: firstStep.title })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "STEP 1 시작하기" }));
    const heading = screen.getByRole("heading", { level: 2, name: firstStep.title });
    expect(heading).toBeVisible();
    expect(heading).toHaveFocus();
    expect(screen.queryByRole("heading", { level: 2, name: "실습 준비" })).toBeNull();
    expect(screen.queryByRole("heading", { level: 2, name: secondStep.title })).toBeNull();
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.getByRole("progressbar", { name: "완료한 실습 단계" })).toHaveAttribute(
      "value",
      "0",
    );
  });

  it("allows looking ahead without treating navigation as completing the previous stage", () => {
    render(<WeekSevenWorkbook userId="student-a" />);
    fireEvent.click(screen.getByRole("button", { name: "STEP 1 시작하기" }));
    expect(screen.getByRole("button", { name: "완료 기준을 체크해 주세요" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "STEP 2 먼저 살펴보기" }));
    expect(screen.getByRole("heading", { level: 2, name: secondStep.title })).toBeVisible();
    expect(screen.getByRole("progressbar", { name: "완료한 실습 단계" })).toHaveAttribute(
      "value",
      "0",
    );
    fireEvent.click(screen.getByRole("button", { name: "STEP 1", exact: true }));
    for (const check of firstStep.checks) {
      expect(screen.getByRole("checkbox", { name: check })).not.toBeChecked();
    }
  });

  it("enables the next action after checking results and restores checks and location after reopening", () => {
    const firstVisit = render(<WeekSevenWorkbook userId="student-a" />);
    fireEvent.click(screen.getByRole("button", { name: "STEP 1 시작하기" }));
    for (const check of firstStep.checks) {
      fireEvent.click(screen.getByRole("checkbox", { name: check }));
    }
    expect(screen.getByRole("progressbar", { name: "완료한 실습 단계" })).toHaveAttribute(
      "value",
      "1",
    );
    const next = screen.getByRole("button", { name: "확인 완료 · STEP 2로" });
    expect(next).toBeEnabled();
    fireEvent.click(next);
    expect(screen.getByRole("heading", { level: 2, name: secondStep.title })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "STEP 1", exact: true }));
    for (const check of firstStep.checks) {
      expect(screen.getByRole("checkbox", { name: check })).toBeChecked();
    }

    firstVisit.unmount();
    render(<WeekSevenWorkbook userId="student-a" />);
    expect(screen.getByRole("heading", { level: 2, name: firstStep.title })).toBeVisible();
    for (const check of firstStep.checks) {
      expect(screen.getByRole("checkbox", { name: check })).toBeChecked();
    }
    fireEvent.click(screen.getByRole("checkbox", { name: firstStep.checks[0]! }));
    expect(screen.getByRole("progressbar", { name: "완료한 실습 단계" })).toHaveAttribute(
      "value",
      "0",
    );
    expect(screen.getByRole("button", { name: "완료 기준을 체크해 주세요" })).toBeDisabled();
  });

  it("copies the entire long STEP 2 prompt while its preview stays collapsed", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    clipboard(writeText);
    render(<WeekSevenWorkbook userId="student-a" />);
    chooseStage(2);
    const prompt = screen.getByRole("region", { name: "STEP 2 프롬프트", exact: true });
    const preview = within(prompt).getByRole("button", { name: "프롬프트 전문 보기" });
    expect(preview).toHaveAttribute("aria-expanded", "false");
    expect(within(prompt).queryByRole("textbox")).toBeNull();
    fireEvent.click(within(prompt).getByRole("button", { name: "STEP 2 프롬프트 전체 복사" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledExactlyOnceWith(secondStep.prompt));
    expect(within(prompt).getByRole("status")).toHaveTextContent(
      "전체 프롬프트를 복사했습니다. AI Studio의 새 Web app에 붙여넣으세요.",
    );
    expect(preview).toHaveAttribute("aria-expanded", "false");
    expect(within(prompt).queryByRole("textbox")).toBeNull();
    expect(screen.getByRole("progressbar", { name: "완료한 실습 단계" })).toHaveAttribute(
      "value",
      "0",
    );
  });

  it("opens and fully selects the actual prompt if browser clipboard access fails", async () => {
    clipboard(vi.fn().mockRejectedValue(new DOMException("Denied", "NotAllowedError")));
    render(<WeekSevenWorkbook userId="student-a" />);
    chooseStage(2);
    const prompt = screen.getByRole("region", { name: "STEP 2 프롬프트", exact: true });
    fireEvent.click(within(prompt).getByRole("button", { name: "STEP 2 프롬프트 전체 복사" }));
    const text = (await within(prompt).findByRole("textbox", {
      name: "STEP 2 프롬프트 전문",
    })) as HTMLTextAreaElement;
    expect(text).toBeVisible();
    expect(text).toHaveValue(secondStep.prompt);
    expect(text).toHaveFocus();
    expect(text.selectionStart).toBe(0);
    expect(text.selectionEnd).toBe(secondStep.prompt.length);
    expect(within(prompt).getByRole("button", { name: "프롬프트 전문 접기" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(within(prompt).getByRole("status")).toHaveTextContent("자동 복사가 제한되어");
  });

  it("keeps the final checklist distinct from actual submission and directs students to session 7", () => {
    render(<WeekSevenWorkbook userId="student-a" />);
    chooseStage(6);
    expect(screen.getByRole("heading", { level: 2, name: "점검·제출" })).toBeVisible();
    expect(screen.getAllByRole("checkbox")).toHaveLength(WEEK_SEVEN_CHECKLIST.length);
    const upload = screen.getByRole("region", { name: "결과물은 여기에서 등록하세요" });
    expect(upload).toHaveTextContent("상단 회차에서 7회차를 선택합니다.");
    expect(upload).toHaveTextContent("‘과제와 피드백 자료 업로드’에 결과물을 등록합니다.");
    expect(upload).toHaveTextContent("이 화면에서 체크하는 것만으로 자료가 제출되지는 않습니다.");
    expect(within(upload).getByRole("link", { name: "과제&피드백 열기" })).toHaveAttribute(
      "href",
      "/feedback",
    );
    fireEvent.click(screen.getByRole("button", { name: "STEP 5 다시 보기" }));
    expect(
      screen.getByRole("heading", { level: 2, name: WEEK_SEVEN_STEPS[4]!.title }),
    ).toBeVisible();
  });

  it("opens a legacy STEP anchor and clears only that anchor after manual navigation", () => {
    window.history.replaceState({}, "", "/sessions/S07?cohort=2026#s07-step-3");
    window.localStorage.setItem(
      "kmove:s07-practice:v1:student-a",
      JSON.stringify({ schemaVersion: 1, activeStep: 1, checks: {} }),
    );
    render(<WeekSevenWorkbook userId="student-a" />);
    expect(
      screen.getByRole("heading", { level: 2, name: WEEK_SEVEN_STEPS[2]!.title }),
    ).toBeVisible();
    chooseStage(4);
    expect(
      screen.getByRole("heading", { level: 2, name: WEEK_SEVEN_STEPS[3]!.title }),
    ).toBeVisible();
    expect(window.location.pathname).toBe("/sessions/S07");
    expect(window.location.search).toBe("?cohort=2026");
    expect(window.location.hash).toBe("");
  });
});
