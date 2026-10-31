import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Glossary } from "@/components/Glossary";
import { GLOSSARY, filterGlossary } from "@/data/glossary";
import { VISUAL_LESSONS } from "@/components/glossary/VisualGlossaryLesson";
import { STUDY_GUIDES } from "@/data/study-materials";

afterEach(cleanup);

describe("Natural design terminology", () => {
  it("finds established terms with both their current label and former Korean translation", () => {
    const cases = [
      ["case-study", "케이스 스터디", "사례 연구"],
      ["empathy-map", "엠퍼시 맵", "공감 지도"],
      ["fidelity", "피델리티", "재현 충실도"],
      ["user-journey", "유저 저니", "사용자 여정"],
      ["call-to-action-cta", "CTA", "행동 유도 요소"],
    ];
    for (const [id, current, previous] of cases) {
      expect(GLOSSARY.find((term) => term.id === id)?.korean).toBe(current);
      expect(filterGlossary(current!, "ALL").map((term) => term.id)).toContain(id);
      expect(filterGlossary(previous!, "ALL").map((term) => term.id)).toContain(id);
    }
    expect(GLOSSARY.find((term) => term.id === "accessibility")?.korean).toBe("접근성");
    expect(GLOSSARY.find((term) => term.id === "proximity")?.korean).toBe("근접성");
  });

  it("opens the glossary at the related term query and lets the learner clear it", () => {
    render(<Glossary initialQuery="Case study" />);
    const cards = within(screen.getByRole("list", { name: "용어 카드" }));
    expect(screen.getByRole("searchbox", { name: "용어 검색" })).toHaveValue("Case study");
    expect(cards.getByRole("button", { name: "Case study — 설명 보기" })).toBeInTheDocument();
    expect(
      cards.queryByRole("button", { name: "Above the fold — 설명 보기" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "검색어 지우기" }));
    expect(screen.getByRole("searchbox", { name: "용어 검색" })).toHaveValue("");
    expect(screen.getByRole("button", { name: "Above the fold — 설명 보기" })).toBeInTheDocument();
  });

  it("keeps every study-guide related term synchronized with the glossary", () => {
    expect(STUDY_GUIDES).toHaveLength(7);
    for (const guide of STUDY_GUIDES) {
      for (const related of guide.relatedTerms) {
        const term = GLOSSARY.find((entry) => entry.id === related.id);
        expect(term, `${guide.id}: ${related.id}`).toBeDefined();
        expect(related.english).toBe(term!.english);
        expect(related.korean).toBe(term!.korean);
        expect(filterGlossary(related.english, "ALL").map((entry) => entry.id)).toContain(
          related.id,
        );
      }
    }
  });

  it("uses the same Korean term in the three original demos and glossary cards", () => {
    for (const term of GLOSSARY.filter((entry) => entry.lessonId)) {
      expect(VISUAL_LESSONS[term.lessonId!].meaning).toBe(term.korean);
    }
  });
});
