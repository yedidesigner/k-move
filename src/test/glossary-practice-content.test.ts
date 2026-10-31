import { describe, expect, it } from "vitest";
import { GLOSSARY } from "@/data/glossary";
import { PRACTICES, getGlossaryPractice } from "@/data/glossary-practice";

const visualPresets = new Set([
  "spacing",
  "typography",
  "contrast",
  "hierarchy",
  "balance",
  "responsive",
  "decoration",
  "fidelity",
  "navigation",
  "motion",
  "focus",
  "alttext",
  "form",
  "cards",
  "grid",
  "scale",
]);

function expectAuthored(value: string, field: string) {
  expect(typeof value, field).toBe("string");
  expect(value.trim().length, field).toBeGreaterThan(0);
  expect(value, field).not.toMatch(/\bTODO\b|\bTBD\b|준비 중|작성 예정|예시를 입력/i);
}

describe("Retained practice engine content", () => {
  it("keeps practice records tied to real glossary terms and retains the three original demos", () => {
    expect(GLOSSARY).toHaveLength(359);
    const legacy = GLOSSARY.filter((entry) => entry.lessonId);
    expect(legacy.map((entry) => entry.lessonId).sort()).toEqual(["carousel", "cta", "hamburger"]);
    expect(Object.keys(PRACTICES).length).toBeGreaterThan(0);
    const glossaryIds = new Set(GLOSSARY.map((entry) => entry.id));
    for (const [id, practice] of Object.entries(PRACTICES)) {
      expect(practice.id, id).toBe(id);
      expect(glossaryIds.has(id), id).toBe(true);
    }
    expect(getGlossaryPractice("a-term-that-does-not-exist")).toBeUndefined();
  });

  it("provides specific structure, context, instructions and feedback for every new practice", () => {
    for (const practice of Object.values(PRACTICES)) {
      for (const field of ["scenario", "instruction", "takeaway"] as const) {
        expectAuthored(practice[field], `${practice.id}.${field}`);
      }
      expect(["flow", "compare", "group"]).toContain(practice.structure.type);
      expect(practice.structure.labels.length, practice.id).toBeGreaterThanOrEqual(2);
      expect(practice.structure.labels.length, practice.id).toBeLessThanOrEqual(4);
      practice.structure.labels.forEach((label) =>
        expectAuthored(label, `${practice.id}.structure`),
      );
      expectAuthored(practice.structure.caption, `${practice.id}.caption`);

      if (practice.kind === "decision") {
        expect(practice.options.length, practice.id).toBeGreaterThanOrEqual(2);
        expect(
          practice.options.filter((option) => option.correct),
          practice.id,
        ).toHaveLength(1);
        expect(new Set(practice.options.map((option) => option.label)).size, practice.id).toBe(
          practice.options.length,
        );
        for (const option of practice.options) {
          expectAuthored(option.label, practice.id);
          expectAuthored(option.feedback, `${practice.id}.feedback`);
        }
      } else if (practice.kind === "sort") {
        expect(practice.categories.length, practice.id).toBeGreaterThanOrEqual(2);
        expect(practice.items.length, practice.id).toBeGreaterThanOrEqual(3);
        expect(new Set(practice.categories).size, practice.id).toBe(practice.categories.length);
        expect(new Set(practice.items.map((item) => item.category)).size, practice.id).toBe(
          practice.categories.length,
        );
        for (const item of practice.items) {
          expect(Number.isInteger(item.category), practice.id).toBe(true);
          expect(item.category, practice.id).toBeGreaterThanOrEqual(0);
          expect(item.category, practice.id).toBeLessThan(practice.categories.length);
          expectAuthored(item.label, practice.id);
          expectAuthored(item.explanation, `${practice.id}.explanation`);
        }
      } else if (practice.kind === "sequence") {
        expect(practice.steps.length, practice.id).toBeGreaterThanOrEqual(3);
        expect(new Set(practice.steps.map((step) => step.label)).size, practice.id).toBe(
          practice.steps.length,
        );
        practice.steps.forEach((step) => {
          expectAuthored(step.label, practice.id);
          expectAuthored(step.explanation, `${practice.id}.explanation`);
        });
      } else {
        expect(visualPresets.has(practice.preset), practice.id).toBe(true);
        for (const field of ["beforeLabel", "afterLabel", "beforeNote", "afterNote"] as const) {
          expectAuthored(practice[field], `${practice.id}.${field}`);
        }
        expect(practice.beforeLabel, practice.id).not.toBe(practice.afterLabel);
      }
    }
  });

  it("keeps authored situations distinct and provides actual spacing practice for Proximity", () => {
    const practices = Object.values(PRACTICES);
    expect(new Set(practices.map((practice) => practice.scenario)).size).toBe(practices.length);
    const proximity = getGlossaryPractice("proximity");
    expect(proximity?.kind).toBe("visual");
    if (proximity?.kind === "visual") expect(proximity.preset).toBe("spacing");
  });
});
