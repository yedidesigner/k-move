import { describe, expect, it } from "vitest";
import source from "@/data/curriculum-source.json";
import { CURRICULUM_LESSONS, CURRICULUM_OVERVIEW } from "@/data/curriculum";
import { SESSIONS } from "@/data/schedule";

describe("Reviewed Sheet 2 curriculum", () => {
  it("maps all 24 numbered lessons to the existing dated sessions without duplicate keys", () => {
    const numbers = Array.from({ length: 24 }, (_, index) => index + 1);
    expect(source.lessons.map((lesson) => lesson.number)).toEqual(numbers);
    expect(new Set(source.lessons.map((lesson) => lesson.number)).size).toBe(24);
    expect(SESSIONS.map((session) => session.id)).toEqual(
      numbers.map((number) => `S${String(number).padStart(2, "0")}`),
    );
    expect(SESSIONS[0]?.date).toBe("2026-10-25");
    expect(SESSIONS[23]?.date).toBe("2027-02-19");
    for (const session of SESSIONS) {
      expect(session.curriculum?.number).toBe(session.number);
      expect(session.detailsPublished).toBe(true);
      expect(session.curriculum?.sourceWeek).toBe(`${session.number}회차`);
    }
  });

  it("preserves the original introductory project order and individual feedback period", () => {
    const lesson = (number: number) => CURRICULUM_LESSONS[number - 1]!;
    expect(lesson(1).title).toContain("OT");
    expect(lesson(2).cycle).toContain("개인 포트폴리오");
        expect(lesson(3).title).toContain("Google AI Studio");
        expect(lesson(3).cycle).toContain("Google AI Studio");
        expect(lesson(3).topics).toHaveLength(8);
        expect(lesson(3).topics[6]).toContain("서브페이지");
        expect(lesson(3).topics[7]).toContain("개인별 제작");
        expect(lesson(3).tools).toContain("Google AI Studio (Build · Playground)");
        expect(JSON.stringify(lesson(3))).not.toMatch(/포트폴리오 v1 배포|GitHub에 올리고 Vercel/);
    for (const number of [4, 5]) expect(lesson(number).cycle).toContain("브랜드 랜딩페이지");
    for (const number of [6, 7]) expect(lesson(number).cycle).toContain("신청 서비스");
    expect(lesson(8).title).toContain("Google Sheets");
    expect(lesson(9).cycle).toContain("중간 쇼케이스");
    for (const number of [20, 21, 22, 23, 24]) {
      expect(lesson(number).cycle).toBe("개별 피드백");
      expect(lesson(number).topics.join(" ")).toContain("공통 제작 주제 없이");
    }
  });

  it("provides concrete capstone work instead of the previously empty lessons 10 through 19", () => {
    const capstone = CURRICULUM_LESSONS.filter(
      (lesson) => lesson.number >= 10 && lesson.number <= 19,
    );
    expect(capstone).toHaveLength(10);
    expect(new Set(capstone.map((lesson) => lesson.title)).size).toBe(10);
    for (const lesson of capstone) {
      expect(lesson.cycle).toContain("개인 캡스톤");
      expect(lesson.goalOutput.length).toBeGreaterThan(20);
      expect(lesson.topics).toHaveLength(4);
      expect(lesson.homework?.length).toBeGreaterThan(25);
      expect(lesson.terms.length).toBeGreaterThanOrEqual(3);
      expect(JSON.stringify(lesson)).not.toMatch(/수업 주제 준비 중|TBD|TODO/);
    }
  });

  it("keeps teaching claims explicit about cost, evidence, and conceptual distinctions", () => {
    const allText = JSON.stringify(source);
    expect(CURRICULUM_OVERVIEW.toolPolicy).toContain(
      "Google AI Pro 구독, Gemini API 사용료, 배포 비용은 구분",
    );
    expect(allText).not.toMatch(
      /요금제 하나로|요금제 1개 \+ 무료|무료로 빌려줌|디버깅의 80%|피그마 컴포넌트와 같음/,
    );
    expect(CURRICULUM_OVERVIEW.assessment).toContain("측정하지 않은 성과");
    const cta = CURRICULUM_LESSONS.flatMap((lesson) => lesson.terms).find(
      (term) => term.name === "CTA",
    );
    expect(cta?.description).toContain("반드시 버튼 하나로 제한되지는 않습니다");
    expect(CURRICULUM_LESSONS[14]?.topics.join(" ")).toContain("행동, 발언, 진행자의 해석을 구분");
  });

  it("retains a bounded list of official references with usable HTTPS URLs", () => {
    const allowed = new Set(["ai.google.dev", "blog.google", "vercel.com"]);
    expect(CURRICULUM_OVERVIEW.sources.length).toBeGreaterThanOrEqual(4);
    expect(new Set(CURRICULUM_OVERVIEW.sources.map((item) => item.url)).size).toBe(
      CURRICULUM_OVERVIEW.sources.length,
    );
    for (const reference of CURRICULUM_OVERVIEW.sources) {
      const url = new URL(reference.url);
      expect(url.protocol).toBe("https:");
      expect(allowed.has(url.hostname)).toBe(true);
      expect(reference.title.trim()).not.toBe("");
      expect(reference.use.trim()).not.toBe("");
    }
  });
});
