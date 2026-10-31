import practiceEntries from "./practice/entries.json";
import type { GlossaryPractice } from "./practice/types";
import { getLearningMode } from "./glossary-learning";
import { hasExpandedPractice } from "./expansion/practice";

export type PracticeKind = GlossaryPractice["kind"];
type PracticeEntry = { id: string; lessonId?: string };

// Authored data is checked against every glossary ID and every union variant by
// the content tests before deployment. A missing practice never gets a fake CTA.
export const PRACTICES: Readonly<Record<string, GlossaryPractice>> = Object.fromEntries(
  (practiceEntries as GlossaryPractice[]).map((practice) => [practice.id, practice]),
);

export function getGlossaryPractice(id: string): GlossaryPractice | undefined {
  return PRACTICES[id];
}

export function getPracticeKind(entry: PracticeEntry): PracticeKind | undefined {
  if (getLearningMode(entry) !== "practice") return undefined;
  if (hasExpandedPractice(entry.id)) return "visual";
  if (entry.lessonId === "cta" || entry.lessonId === "hamburger" || entry.lessonId === "carousel") {
    return "visual";
  }
  return getGlossaryPractice(entry.id)?.kind;
}

export function hasGlossaryPractice(entry: PracticeEntry) {
  return getPracticeKind(entry) !== undefined;
}

export const PRACTICE_LABELS: Record<PracticeKind, string> = {
  visual: "화면 조작",
  decision: "상황 선택",
  sort: "분류",
  sequence: "순서 배열",
};
