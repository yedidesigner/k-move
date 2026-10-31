import entries from "./glossary.json";
import { EXPANDED_TERMS } from "./expansion";
import { hasGlossaryPractice } from "./glossary-practice";
import { getLearningMode, LEARNING_LABELS } from "./glossary-learning";
import type { LearningMode } from "./learning/types";

export type GlossaryLessonId = "cta" | "hamburger" | "carousel";
export type GlossaryFilter = "all" | LearningMode;

export type GlossaryEntry = {
  id: string;
  english: string;
  korean: string;
  pronunciation: string;
  description: string;
  example: string;
  aliases?: string[];
  letter: string;
  lessonId?: GlossaryLessonId;
};

export const GLOSSARY_SOURCE_URL =
  "https://docs.google.com/document/d/1fVNBjag4xavNIRLJQ3j-kH2WcaIQHOF1GEEtaTnutT0/edit";

function isLessonId(value: unknown): value is GlossaryLessonId {
  return value === "cta" || value === "hamburger" || value === "carousel";
}

export const GLOSSARY: GlossaryEntry[] = [...entries, ...EXPANDED_TERMS]
  .map((entry): GlossaryEntry => {
    const normalized: GlossaryEntry = {
      id: entry.id,
      english: entry.english,
      pronunciation: entry.pronunciation,
      korean: entry.korean,
      description: entry.description,
      example: entry.example,
      letter: entry.english.charAt(0).toUpperCase(),
    };
    if ("lessonId" in entry && isLessonId(entry.lessonId)) normalized.lessonId = entry.lessonId;
    if ("aliases" in entry && Array.isArray(entry.aliases)) {
      normalized.aliases = entry.aliases.filter(
        (alias): alias is string => typeof alias === "string",
      );
    }
    return normalized;
  })
  .sort((a, b) => a.english.localeCompare(b.english, "en", { sensitivity: "base" }));

export const INTERACTIVE_GLOSSARY_COUNT = GLOSSARY.filter(hasGlossaryPractice).length;

export const LEARNING_FILTERS: { value: GlossaryFilter; label: string; count: number }[] = [
  { value: "all", label: "전체", count: GLOSSARY.length },
  ...Object.entries(LEARNING_LABELS).map(([value, label]) => ({
    value: value as LearningMode,
    label,
    count: GLOSSARY.filter((entry) => getLearningMode(entry) === value).length,
  })),
];

export function filterGlossary(query: string, letter: string, filter: GlossaryFilter = "all") {
  const words = query.trim().normalize("NFKC").toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return GLOSSARY.filter((entry) => {
    if (letter !== "ALL" && entry.letter !== letter) return false;
    if (filter !== "all" && getLearningMode(entry) !== filter) return false;
    const text =
      `${entry.english} ${entry.pronunciation} ${entry.korean} ${entry.description} ${entry.example} ${(entry.aliases ?? []).join(" ")}`
        .normalize("NFKC")
        .toLocaleLowerCase();
    return words.every((word) => text.includes(word));
  });
}
