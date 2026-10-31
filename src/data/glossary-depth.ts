import part1 from "./editorial/terms-1.json";
import part2 from "./editorial/terms-2.json";
import part3 from "./editorial/terms-3.json";
import type { SourceCitation, TopicId } from "./design-sources";
import { EXPANDED_TERMS, expandedReferences, type WebReference } from "./expansion";
export type GlossaryDepth = {
  id: string;
  topic: TopicId;
  definition: string;
  korean?: string;
  aliases?: string[];
  essential: string;
  application: { scenario: string; decision: string };
  critique: { tradeoff: string; evidence: string };
  confusedWith: { id: string; difference: string }[];
  sourceRefs: SourceCitation[];
  sourceNote?: string;
  webReferences?: WebReference[];
};
export const GLOSSARY_DEPTH = [
  ...part1,
  ...part2,
  ...part3,
  ...EXPANDED_TERMS.map((term) => ({
    ...term,
    definition: term.description,
    sourceRefs: [],
    webReferences: expandedReferences(term),
  })),
] as GlossaryDepth[];
const byId = new Map(GLOSSARY_DEPTH.map((item) => [item.id, item]));
export function getGlossaryDepth(id: string) {
  return byId.get(id);
}
