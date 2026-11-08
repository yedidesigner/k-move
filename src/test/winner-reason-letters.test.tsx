import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { WinnerReasonLetters } from "@/components/WinnerReasonLetters";

afterEach(cleanup);

describe("Winner-only anonymous envelope", () => {
  it("keeps notes out of sight until the recipient opens the envelope", () => {
    render(<WinnerReasonLetters recipient="수강생가"
      letters={["친구를 응원하는 따뜻한 한마디입니다."]} instructor={false} />);
    expect(document.querySelector<HTMLImageElement>(".wrl-envelope-closed")?.getAttribute("src")).toBe("/images/envelope-yd-closed-hq-v2.avif");
    expect(document.querySelector<HTMLImageElement>(".wrl-envelope-open")?.getAttribute("src")).toBe("/images/envelope-yd-open-hq-v2.avif");
    expect(document.querySelector(".wrl-open-scene")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: "편지 열기" })).toBeInTheDocument();
    expect(screen.queryByText("친구를 응원하는 따뜻한 한마디입니다.")).toBeNull();
    expect(screen.getByText(/1등으로 선정되었어요/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "편지 열기" }));
    expect(document.querySelector(".wrl-open-scene")).toHaveAttribute("aria-hidden", "false");
    expect(document.querySelector(".wrl-stage")).toHaveClass("is-open");
    expect(screen.getByText("친구를 응원하는 따뜻한 한마디입니다.")).toBeInTheDocument();
    expect(screen.queryByText("투표자")).toBeNull();
    expect(screen.queryByText("2표")).toBeNull();
  });

  it("shows only one handwritten note at a time, with previous/next and restart", () => {
    render(<WinnerReasonLetters recipient="수강생가"
      letters={["꼼꼼하게 디자인을 완성했어요.", "친구들을 도와주는 모습이 멋져요."]}
      instructor={false} />);
    fireEvent.click(screen.getByRole("button", { name: "편지 열기" }));
    expect(screen.getByText("꼼꼼하게 디자인을 완성했어요.")).toBeInTheDocument();
    expect(screen.queryByText("친구들을 도와주는 모습이 멋져요.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "다음 편지" }));
    expect(screen.getByText("친구들을 도와주는 모습이 멋져요.")).toBeInTheDocument();
    expect(screen.queryByText("꼼꼼하게 디자인을 완성했어요.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "이전 편지" }));
    expect(screen.getByText("꼼꼼하게 디자인을 완성했어요.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "다음 편지" }));
    fireEvent.click(screen.getByRole("button", { name: "처음부터 다시 보기" }));
    expect(screen.getByRole("button", { name: "편지 열기" })).toBeInTheDocument();
    expect(screen.queryByText("꼼꼼하게 디자인을 완성했어요.")).toBeNull();
  });

  it("shows the winner name to instructors but no author metadata", () => {
    render(<WinnerReasonLetters recipient="수강생가"
      letters={["작업 과정의 설명이 훌륭했어요."]} instructor={true} />);
    expect(screen.getByText("수강생가님에게 도착한 편지")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "편지 열기" }));
    expect(screen.getByText("작업 과정의 설명이 훌륭했어요.")).toBeInTheDocument();
    expect(screen.queryByText("작성자:")).toBeNull();
  });

  it("shows an empty mailbox without fabricating any letters", () => {
    render(<WinnerReasonLetters recipient="수강생가" letters={[]} instructor={false} />);
    expect(screen.getByText("이번 투표에는 전달할 선정 이유가 남아 있지 않아요.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "편지 열기" })).toBeNull();
  });

  it("assigns a different stable handwriting style to each next letter", () => {
    render(<WinnerReasonLetters recipient="수강생가"
      letters={["첫 번째 선정 이유입니다.","두 번째 선정 이유입니다."]}
      instructor={false} />);
    fireEvent.click(screen.getByRole("button", { name: "편지 열기" }));
    const first = screen.getByText("첫 번째 선정 이유입니다.");
    const firstFont = first.closest("[data-letter-font]")?.getAttribute("data-letter-font");
    expect(firstFont).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "다음 편지" }));
    const second = screen.getByText("두 번째 선정 이유입니다.");
    const secondFont = second.closest("[data-letter-font]")?.getAttribute("data-letter-font");
    expect(secondFont).toBeTruthy();
    expect(secondFont).not.toBe(firstFont);

    fireEvent.click(screen.getByRole("button", { name: "이전 편지" }));
    expect(screen.getByText("첫 번째 선정 이유입니다.")
      .closest("[data-letter-font]")?.getAttribute("data-letter-font")).toBe(firstFont);
    fireEvent.click(screen.getByRole("button", { name: "다음 편지" }));
    fireEvent.click(screen.getByRole("button", { name: "처음부터 다시 보기" }));
    fireEvent.click(screen.getByRole("button", { name: "편지 열기" }));
    expect(screen.getByText("첫 번째 선정 이유입니다.")
      .closest("[data-letter-font]")?.getAttribute("data-letter-font")).toBe(firstFont);
  });
});
