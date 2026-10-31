import type { VisualPreset } from "../practice/types";

export type LearningMode = "example" | "practice";
export type LearningFigureKind =
  | "preset"
  | "case-study"
  | "portfolio"
  | "screen"
  | "comparison"
  | "board"
  | "persona"
  | "empathy-map"
  | "journey-map"
  | "flow"
  | "sitemap"
  | "storyboard"
  | "document"
  | "matrix"
  | "timeline"
  | "chart"
  | "typography"
  | "palette"
  | "code"
  | "anatomy"
  | "role"
  | "concept";
export type LearningFigure = {
  kind: LearningFigureKind;
  title: string;
  subtitle: string;
  items: { label: string; text: string; detail?: string; value?: number }[];
  focus: string;
  caption: string;
  preset?: VisualPreset;
  variant?:
    | "f-scan"
    | "z-scan"
    | "layer-cake"
    | "continuity"
    | "similarity"
    | "curb-cut"
    | "complementary"
    | "unity"
    | "variety"
    | "equality-equity";
};
export type LearningReference = { title: string; url: string; note: string };
export type GlossaryLearning = {
  id: string;
  mode: LearningMode;
  rationale: string;
  figure: LearningFigure;
  practiceReason?: string;
  references: LearningReference[];
};
