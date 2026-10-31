import entries from "./glossary.json";

export type GlossaryLessonId = "cta" | "hamburger" | "carousel";
export type GlossaryFilter = "all" | "interactive";

export type GlossaryEntry = {
  id: string;
  english: string;
  korean: string;
  pronunciation: string;
  description: string;
  example: string;
  letter: string;
  lessonId?: GlossaryLessonId;
};

export const GLOSSARY_SOURCE_URL =
  "https://docs.google.com/document/d/1fVNBjag4xavNIRLJQ3j-kH2WcaIQHOF1GEEtaTnutT0/edit";

function isLessonId(value: unknown): value is GlossaryLessonId {
  return value === "cta" || value === "hamburger" || value === "carousel";
}

export const GLOSSARY: GlossaryEntry[] = entries
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
    return normalized;
  })
  .sort((a, b) => a.english.localeCompare(b.english, "en", { sensitivity: "base" }));

export const INTERACTIVE_GLOSSARY_COUNT = GLOSSARY.filter((entry) => entry.lessonId).length;

export function filterGlossary(query: string, letter: string, filter: GlossaryFilter = "all") {
  const words = query.trim().normalize("NFKC").toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return GLOSSARY.filter((entry) => {
    if (letter !== "ALL" && entry.letter !== letter) return false;
    if (filter === "interactive" && !entry.lessonId) return false;
    const text = `${entry.english} ${entry.pronunciation} ${entry.korean} ${entry.description} ${entry.example}`
      .normalize("NFKC")
      .toLocaleLowerCase();
    return words.every((word) => text.includes(word));
  });
}
