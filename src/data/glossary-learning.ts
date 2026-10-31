import entries from "./learning/entries.json";
import type { GlossaryLearning, LearningMode } from "./learning/types";
import { EXPANDED_TERMS } from "./expansion";
import { hasExpandedPractice } from "./expansion/practice";

export const LEARNING_ENTRIES: Readonly<Record<string, GlossaryLearning>> = Object.fromEntries(
  [
    ...(entries as GlossaryLearning[]),
    ...EXPANDED_TERMS.map((term): GlossaryLearning => ({
      id: term.id,
      mode: hasExpandedPractice(term.id) ? "practice" : "example",
      rationale: term.essential,
      figure: term.figure,
      references: [],
      ...(hasExpandedPractice(term.id)
        ? { practiceReason: "선택과 화면 변화를 직접 비교하며 동작의 차이를 확인합니다." }
        : {}),
    })),
  ].map((entry) => [entry.id, entry]),
);

export function getGlossaryLearning(id: string): GlossaryLearning | undefined {
  return LEARNING_ENTRIES[id];
}

export function getLearningMode(entry: { id: string }): LearningMode | undefined {
  return getGlossaryLearning(entry.id)?.mode;
}

export const LEARNING_LABELS: Record<LearningMode, string> = {
  example: "예시 보기",
  practice: "예시 + 실습",
};
