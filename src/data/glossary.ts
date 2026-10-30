import entries from "./glossary.json";

export type GlossaryEntry = {
  id: string;
  english: string;
  korean: string;
  description: string;
  letter: string;
};

export const GLOSSARY_SOURCE_URL =
  "https://docs.google.com/document/d/1fVNBjag4xavNIRLJQ3j-kH2WcaIQHOF1GEEtaTnutT0/edit";

export const GLOSSARY: GlossaryEntry[] = [...entries].sort((a, b) =>
  a.english.localeCompare(b.english, "en", { sensitivity: "base" }),
);

export function filterGlossary(query: string, letter: string) {
  const words = query.trim().normalize("NFKC").toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return GLOSSARY.filter((entry) => {
    if (letter !== "ALL" && entry.letter !== letter) return false;
    const text = `${entry.english} ${entry.korean} ${entry.description}`
      .normalize("NFKC")
      .toLocaleLowerCase();
    return words.every((word) => text.includes(word));
  });
}
