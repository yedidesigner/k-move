export const EXPANDED_PRACTICE_IDS = [
  "accordion",
  "tabs",
  "checkbox",
  "radio-button",
  "toggle-switch",
  "progressive-disclosure",
] as const;
const practiceIds = new Set<string>(EXPANDED_PRACTICE_IDS);
export function hasExpandedPractice(id: string) {
  return practiceIds.has(id);
}
