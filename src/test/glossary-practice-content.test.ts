import { describe, expect, it } from "vitest";
import { GLOSSARY } from "@/data/glossary";
import {
  PRACTICES,
  getGlossaryPractice,
  hasGlossaryPractice,
  getPracticeKind,
} from "@/data/glossary-practice";

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
  expect(value, field).not.toMatch(/TODO|TBD|준비 중|작성 예정|예시를 입력/i);
}

describe("Complete glossary practice coverage", () => {
  it("gives each of the 239 original terms one usable practice, retaining the three original demos", () => {
    expect(GLOSSARY).toHaveLength(239);
    const legacy = GLOSSARY.filter((entry) => entry.lessonId);
    expect(legacy.map((entry) => entry.lessonId).sort()).toEqual(["carousel", "cta", "hamburger"]);
    expect(Object.keys(PRACTICES)).toHaveLength(236);
    for (const entry of GLOSSARY) {
      expect(hasGlossaryPractice(entry), entry.id).toBe(true);
      expect(getPracticeKind(entry), entry.id).toBeDefined();
      if (entry.lessonId) {
        expect(getGlossaryPractice(entry.id), entry.id).toBeUndefined();
      } else {
        expect(getGlossaryPractice(entry.id)?.id, entry.id).toBe(entry.id);
      }
    }
    const glossaryIds = new Set(GLOSSARY.map((entry) => entry.id));
    for (const [id, practice] of Object.entries(PRACTICES)) {
      expect(practice.id, id).toBe(id);
      expect(glossaryIds.has(id), id).toBe(true);
    }
    expect(getGlossaryPractice("a-term-that-does-not-exist")).toBeUndefined();
    expect(hasGlossaryPractice({ ...GLOSSARY[0]!, id: "a-term-that-does-not-exist" })).toBe(false);
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

  it("includes manipulation, classification, sequencing and scenario decisions, not one repeated quiz for every word", () => {
    const practices = Object.values(PRACTICES);
    expect(new Set(practices.map((practice) => practice.kind))).toEqual(
      new Set(["visual", "decision", "sort", "sequence"]),
    );
    expect(new Set(practices.map((practice) => practice.scenario)).size).toBe(practices.length);
    const proximity = getGlossaryPractice("proximity");
    expect(proximity?.kind).toBe("visual");
    if (proximity?.kind === "visual") expect(proximity.preset).toBe("spacing");
  });
});
