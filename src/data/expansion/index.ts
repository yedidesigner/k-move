import visual from "./visual.json";
import production from "./production.json";
import interaction from "./interaction.json";
import research from "./research.json";
import type { LearningFigure } from "../learning/types";
import type { TopicId } from "../design-sources";

export type WebReference = { id: string; title: string; url: string; note: string };
export type ExpandedTerm = {
  id: string;
  english: string;
  korean: string;
  pronunciation: string;
  description: string;
  example: string;
  aliases: string[];
  topic: TopicId;
  essential: string;
  application: { scenario: string; decision: string };
  critique: { tradeoff: string; evidence: string };
  confusedWith: { id: string; difference: string }[];
  sourceIds: string[];
  figure: LearningFigure;
};
type ExpansionPack = { sources: WebReference[]; terms: ExpandedTerm[] };
const packs = [visual, production, interaction, research] as ExpansionPack[];
export const EXPANDED_TERMS = packs.flatMap((pack) => pack.terms);
export const WEB_REFERENCES = packs.flatMap((pack) => pack.sources);
const sourceById = new Map(WEB_REFERENCES.map((source) => [source.id, source]));
export function expandedReferences(term: ExpandedTerm) {
  return term.sourceIds.map((id) => {
    const source = sourceById.get(id);
    if (!source) throw new Error(`Unknown design source ${id} for ${term.id}`);
    return source;
  });
}
