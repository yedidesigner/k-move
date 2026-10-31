import guides from "./study/guides.json";

export type StudyGuide = {
  id: string;
  category: string;
  title: string;
  summary: string;
  keywords: string[];
  intro: string;
  visualTermId?: string;
  objectives: string[];
  sections: { title: string; body: string; bullets?: string[] }[];
  application?: { title: string; prompt: string };
  relatedTerms: { id: string; english: string; korean: string }[];
  references: { title: string; location: string; note?: string }[];
};

export const STUDY_GUIDES = guides as StudyGuide[];
