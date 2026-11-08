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
    const signature = screen.getByText("- 당신을 응원하는 누군가 -");
    const handwrittenNote = screen.getByText("친구를 응원하는 따뜻한 한마디입니다.");
    expect(signature.closest(".wrl-letter")).toBe(handwrittenNote.closest(".wrl-letter"));
    expect(screen.queryByText("with warmth, ♡")).toBeNull();
    expect(screen.queryByText("A NOTE FROM A CLASSMATE")).toBeNull();
    expect(screen.getByText(/^\d{2}년 \d{2}월 \d{2}일$/)).toBeInTheDocument();
    expect(screen.queryByText("투표자")).toBeNull();
    expect(screen.queryByText("2표")).toBeNull();
    expect(screen.queryByRole("button", { name: "왼쪽 정렬" })).toBeNull();
    expect(screen.queryByRole("button", { name: "오른쪽 정렬" })).toBeNull();
    expect(document.querySelector(".wrl-letter")).toHaveAttribute("data-letter-align", "center");
    expect(screen.getByRole("combobox", { name: "글자 크기" })).toHaveValue("16");
    fireEvent.change(screen.getByRole("combobox", { name: "글자 크기" }), { target:{ value:"20" } });
    expect(document.querySelector(".wrl-letter")).toHaveAttribute("data-letter-point-size", "20");

  });

  it("keeps an entire long Korean reason and its anonymous signature on the same paper", () => {
    const reason = "디자인 과정에서 꾸준히 친구들을 도와주고, 새로운 아이디어와 정교한 설명으로 완성도를 높인 점이 아주 인상 깊었습니다. ".repeat(2).trim();
    render(<WinnerReasonLetters recipient="수강생가" letters={[reason]} instructor={false} />);
    fireEvent.click(screen.getByRole("button", { name: "편지 열기" }));
    expect(screen.getByText(reason)).toBeInTheDocument();
    expect(screen.getByText("- 당신을 응원하는 누군가 -")).toBeInTheDocument();
    expect(document.querySelector(".wrl-letter-message")).toBeInTheDocument();
    expect(screen.queryByText("with warmth, ♡")).toBeNull();
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
  it("uses centered writing only and keeps 10–20pt choices", () => {
    render(<WinnerReasonLetters recipient="수강생가" letters={["정렬과 크기 테스트"]} instructor={false} />);
    fireEvent.click(screen.getByRole("button", { name: "편지 열기" }));
    expect(screen.queryByRole("button", { name:"왼쪽 정렬" })).toBeNull();
    expect(screen.queryByRole("button", { name:"오른쪽 정렬" })).toBeNull();
    expect(document.querySelector(".wrl-letter")).toHaveAttribute("data-letter-align","center");
    const size = screen.getByRole("combobox", { name:"글자 크기" });
    expect(Array.from((size as HTMLSelectElement).options).map(option => option.text)).toEqual(
      ["10 pt","12 pt","14 pt","16 pt","18 pt","20 pt"],
    );
    fireEvent.change(size,{target:{value:"10"}});
    expect(document.querySelector(".wrl-letter")).toHaveAttribute("data-letter-point-size","10");
  });


  it("offers seven pastel envelope colors with the original blue selected by default", () => {
    render(<WinnerReasonLetters recipient="수강생가" letters={["색상 테스트"]} instructor={false} />);
    fireEvent.click(screen.getByRole("button", { name:"편지 열기" }));
    for (const label of ["연한 핑크","파스텔 주황","파스텔 노랑","파스텔 초록","파스텔 파랑","파스텔 남색","파스텔 보라"]) {
      expect(screen.getByRole("button", { name:label })).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name:"파스텔 파랑" })).toHaveAttribute("aria-pressed","true");
    fireEvent.click(screen.getByRole("button", { name:"파스텔 보라" }));
    expect(screen.getByRole("button", { name:"파스텔 보라" })).toHaveAttribute("aria-pressed","true");
  });

  it("opens save choices for one PNG or all letters ZIP on a separate row", () => {
    render(<WinnerReasonLetters recipient="수강생가" letters={["저장 테스트","두 번째 편지"]} instructor={false} />);
    expect(screen.queryByRole("button", { name:"영원히 기억하기" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name:"편지 열기" }));
    const memory = screen.getByRole("button", { name:"영원히 기억하기" });
    expect(memory).toHaveAttribute("aria-expanded","false");
    fireEvent.click(memory);
    expect(memory).toHaveAttribute("aria-expanded","true");
    expect(screen.getByRole("menuitem", { name:/현재 편지 1장 저장/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name:/전체 편지 ZIP 다운로드/ })).toBeInTheDocument();
  });


});
