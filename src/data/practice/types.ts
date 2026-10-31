export type PracticeStructure = {
  type: "flow" | "compare" | "group";
  labels: string[];
  caption: string;
};

type PracticeBase = {
  id: string;
  scenario: string;
  instruction: string;
  structure: PracticeStructure;
  takeaway: string;
};

export type DecisionPractice = PracticeBase & {
  kind: "decision";
  options: { label: string; feedback: string; correct: boolean }[];
};

export type SortPractice = PracticeBase & {
  kind: "sort";
  categories: string[];
  items: { label: string; category: number; explanation: string }[];
};

export type SequencePractice = PracticeBase & {
  kind: "sequence";
  steps: { label: string; explanation: string }[];
};

export type VisualPreset =
  | "spacing"
  | "typography"
  | "contrast"
  | "hierarchy"
  | "balance"
  | "responsive"
  | "decoration"
  | "fidelity"
  | "navigation"
  | "motion"
  | "focus"
  | "alttext"
  | "form"
  | "cards"
  | "grid"
  | "scale";

export type VisualPractice = PracticeBase & {
  kind: "visual";
  preset: VisualPreset;
  beforeLabel: string;
  afterLabel: string;
  beforeNote: string;
  afterNote: string;
};

export type GlossaryPractice = DecisionPractice | SortPractice | SequencePractice | VisualPractice;
