import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { InteractionLab } from "@/components/glossary/expanded/InteractionLab";

afterEach(cleanup);

function reset() {
  fireEvent.click(screen.getByRole("button", { name: "처음부터 해보기" }));
}

describe("Expanded interaction practice", () => {
  it("opens accordion panels independently and resets every panel", () => {
    render(<InteractionLab termId="accordion" />);
    const delivery = screen.getByRole("button", { name: "배송은 얼마나 걸리나요?" });
    const exchange = screen.getByRole("button", { name: "교환은 어떻게 하나요?" });
    expect(delivery).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(delivery);
    fireEvent.click(exchange);
    expect(delivery).toHaveAttribute("aria-expanded", "true");
    expect(exchange).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("region")).toHaveLength(3); // labelled lab plus two panels
    expect(screen.getByRole("region", { name: "배송은 얼마나 걸리나요?" })).toHaveTextContent(
      "2–3일",
    );
    expect(screen.getByRole("status")).toHaveTextContent("현재 2개 안내");
    fireEvent.click(delivery);
    expect(
      screen.queryByRole("region", { name: "배송은 얼마나 걸리나요?" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "교환은 어떻게 하나요?" })).toBeVisible();
    reset();
    expect(exchange).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("status")).toHaveTextContent("현재 0개 안내");
  });

  it("moves tabs with arrows, Home and End while exposing one selected panel", () => {
    render(<InteractionLab termId="tabs" />);
    const details = screen.getByRole("tab", { name: "상세 정보" });
    const guide = screen.getByRole("tab", { name: "이용 안내" });
    const reviews = screen.getByRole("tab", { name: "리뷰" });
    expect(details).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
    fireEvent.keyDown(details, { key: "ArrowRight" });
    expect(guide).toHaveFocus();
    expect(guide).toHaveAttribute("aria-selected", "true");
    expect(details).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("tabpanel", { name: "이용 안내" })).toHaveTextContent(
      "기록을 시작하는 방법",
    );
    fireEvent.keyDown(guide, { key: "End" });
    expect(reviews).toHaveFocus();
    fireEvent.keyDown(reviews, { key: "ArrowRight" });
    expect(details).toHaveFocus();
    fireEvent.keyDown(details, { key: "ArrowLeft" });
    expect(reviews).toHaveFocus();
    fireEvent.keyDown(reviews, { key: "Home" });
    expect(details).toHaveFocus();
    fireEvent.click(reviews);
    expect(screen.getByRole("tabpanel", { name: "리뷰" })).toBeVisible();
    reset();
    expect(details).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "상세 정보" })).toBeVisible();
  });

  it("keeps independent checkbox selections when another choice is cleared", () => {
    render(<InteractionLab termId="checkbox" />);
    const branding = screen.getByRole("checkbox", { name: "브랜딩" });
    const research = screen.getByRole("checkbox", { name: "UX 리서치" });
    fireEvent.click(branding);
    fireEvent.click(research);
    expect(branding).toBeChecked();
    expect(research).toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("선택한 분야 2개: 브랜딩, UX 리서치");
    fireEvent.click(branding);
    expect(branding).not.toBeChecked();
    expect(research).toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("선택한 분야 1개: UX 리서치");
    reset();
    expect(research).not.toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("아직 선택한 분야가 없습니다");
  });

  it("limits a named radio group to one delivery choice and updates the result", () => {
    render(<InteractionLab termId="radio-button" />);
    const delivery = screen.getByRole("radio", { name: /일반 배송/ });
    const pickup = screen.getByRole("radio", { name: /매장 수령/ });
    expect(delivery.getAttribute("name")).toBe(pickup.getAttribute("name"));
    fireEvent.click(delivery);
    expect(delivery).toBeChecked();
    fireEvent.click(pickup);
    expect(delivery).not.toBeChecked();
    expect(pickup).toBeChecked();
    expect(
      screen.getAllByRole("radio").filter((radio) => (radio as HTMLInputElement).checked),
    ).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("선택한 방식: 매장 수령 · 무료");
    reset();
    expect(pickup).not.toBeChecked();
  });

  it("applies a switch immediately and keeps its accessible name stable", () => {
    render(<InteractionLab termId="toggle-switch" />);
    const toggle = screen.getByRole("switch", { name: "댓글 알림" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(toggle).toHaveAccessibleName("댓글 알림");
    expect(screen.getByRole("status")).toHaveTextContent("댓글 알림이 켜졌습니다");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    fireEvent.click(toggle);
    reset();
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("reveals extra filters, keeps them applied when collapsed and resets the result", () => {
    render(<InteractionLab termId="progressive-disclosure" />);
    const type = screen.getByRole("combobox", { name: "프로젝트 분야" });
    const disclosure = screen.getByRole("button", { name: /추가 필터/ });
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("검색 결과 3개");
    fireEvent.change(type, { target: { value: "ui" } });
    expect(screen.getByRole("status")).toHaveTextContent("검색 결과 2개");
    fireEvent.click(disclosure);
    const complete = screen.getByRole("checkbox", { name: "완료한 프로젝트만 보기" });
    fireEvent.click(complete);
    expect(screen.getByRole("status")).toHaveTextContent("검색 결과 1개 · 완료한 프로젝트만");
    expect(screen.getByText("전시 안내 모바일 화면")).toBeVisible();
    expect(screen.queryByText("박물관 예약 화면")).not.toBeInTheDocument();
    fireEvent.click(disclosure);
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
    expect(disclosure).toHaveAccessibleName(expect.stringContaining("1개 적용"));
    expect(complete).not.toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("검색 결과 1개");
    fireEvent.click(disclosure);
    expect(complete).toBeChecked();
    reset();
    expect(type).toHaveValue("all");
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
    expect(complete).not.toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("검색 결과 3개");
  });

  it("preserves a learner's selections while its parent learning tab is hidden", () => {
    const view = render(
      <div hidden={false}>
        <InteractionLab termId="checkbox" />
      </div>,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "브랜딩" }));
    view.rerender(
      <div hidden>
        <InteractionLab termId="checkbox" />
      </div>,
    );
    expect(screen.queryByRole("checkbox", { name: "브랜딩" })).not.toBeInTheDocument();
    view.rerender(
      <div hidden={false}>
        <InteractionLab termId="checkbox" />
      </div>,
    );
    expect(screen.getByRole("checkbox", { name: "브랜딩" })).toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("선택한 분야 1개: 브랜딩");
  });
});
