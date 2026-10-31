import entries from "./learning/entries.json";
import type { GlossaryLearning, LearningMode } from "./learning/types";

export const LEARNING_ENTRIES: Readonly<Record<string, GlossaryLearning>> = Object.fromEntries(
  (entries as GlossaryLearning[]).map((entry) => [entry.id, entry]),
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
