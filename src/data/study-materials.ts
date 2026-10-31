import foundation from "./editorial/guides-foundation.json";
import practice from "./editorial/guides-practice.json";
import ai from "./editorial/guides-ai.json";
import glossary from "./glossary.json";
import { sourceReference, type SourceCitation, type TopicId } from "./design-sources";
export { TOPICS } from "./design-sources";

export type StudyGuide = {
  id: string;
  topic: TopicId;
  category: string;
  title: string;
  summary: string;
  keywords: string[];
  intro: string;
  visualTermId?: string;
  objectives: string[];
  sections: { title: string; body: string; bullets?: string[] }[];
  decision: {
    context: string;
    choice: string;
    why: string;
    alternatives: string;
    validation: string;
  };
  exercise: { brief: string; deliverable: string; criteria: string[] };
  pitfalls: string[];
  application?: { title: string; prompt: string };
  relatedTerms: { id: string; english: string; korean: string }[];
  references: { title: string; location: string; note?: string; url?: string }[];
  sourceRefs: SourceCitation[];
};
type AuthoredGuide = Omit<StudyGuide, "keywords" | "relatedTerms" | "references"> & {
  relatedTermIds: string[];
};
const supplementalReferences: Record<string, StudyGuide["references"]> = {
  "accessible-interaction": [
    {
      title: "W3C WAI · Labeling Controls",
      location: "Forms Tutorial · 컨트롤의 이름과 레이블 연결",
      note: "제공 PDF와 별도로 구현 설명을 교차 확인한 공식 자료",
      url: "https://www.w3.org/WAI/tutorials/forms/labels/",
    },
  ],
  "form-validation": [
    {
      title: "W3C WAI · User Notifications",
      location: "Forms Tutorial · 제출 결과와 오류 안내",
      note: "제공 PDF와 별도로 오류 안내와 피드백 시점을 교차 확인한 공식 자료",
      url: "https://www.w3.org/WAI/tutorials/forms/notifications/",
    },
  ],
};
const order = [
  "ux-ui-foundations",
  "visual-foundations",
  "typography-reading",
  "mental-models-cognitive-load",
  "ux-research",
  "research-synthesis",
  "evidence-led-design",
  "navigation-information",
  "interaction-forms",
  "form-validation",
  "accessible-interaction",
  "responsive-layout",
  "component-states",
  "design-systems",
  "system-governance",
  "design-critique",
  "design-handoff",
  "portfolio-case-study",
  "ai-design-workflow",
  "ai-prototype-validation",
];
export const STUDY_GUIDES: StudyGuide[] = ([...foundation, ...practice, ...ai] as AuthoredGuide[])
  .map((guide) => {
    const relatedTerms = guide.relatedTermIds.map((id) => {
      const term = glossary.find((item) => item.id === id);
      if (!term) throw new Error(`Unknown glossary term ${id} in ${guide.id}`);
      return { id: term.id, english: term.english, korean: term.korean };
    });
    return {
      ...guide,
      relatedTerms,
      keywords: relatedTerms.flatMap((term) => [term.english, term.korean]),
      references: [
        ...guide.sourceRefs.map(sourceReference),
        ...(supplementalReferences[guide.id] ?? []),
      ],
    };
  })
  .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

/** Return only guides explicitly connected to this glossary term. */
export function getGuidesForTerm(termId: string): StudyGuide[] {
  return STUDY_GUIDES.filter(
    (guide) =>
      guide.relatedTerms.some((term) => term.id === termId) || guide.visualTermId === termId,
  );
}
