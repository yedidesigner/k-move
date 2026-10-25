import { describe, expect, it } from "vitest";
import {
  cleanAnswers,
  csvCell,
  survey,
  toggleChoice,
  validateQuestion,
  type Answers,
} from "./survey";
export const valid: Answers = {
  name: "테스트 수강생",
  aiExperience: "basic",
  aiServices: ["chatgpt_free"],
  designSkills: Object.fromEntries(
    survey.questions.find((q) => q.id === "designSkills")!.rows!.map((r) => [r.id, "guided"]),
  ),
  portfolio: "works",
  interests: ["graphic"],
  goals: ["prompt", "image"],
  message: "",
};
const q = (id: string) => survey.questions.find((q) => q.id === id)!;
describe("survey rules", () => {
  it("accepts a complete response", () =>
    expect(survey.questions.map((q) => validateQuestion(q, valid))).toEqual(Array(8).fill(null)));
  it("rejects missing required inputs", () =>
    expect(survey.questions.filter((q) => q.required).every((q) => validateQuestion(q, {}))).toBe(
      true,
    ));
  it("limits goals to two and handles exclusive options", () => {
    expect(toggleChoice(q("goals"), ["prompt", "image"], "visual")).toEqual(["prompt", "image"]);
    expect(toggleChoice(q("aiServices"), ["chatgpt_free"], "none")).toEqual(["none"]);
    expect(toggleChoice(q("aiServices"), ["none"], "chatgpt_paid")).toEqual(["chatgpt_paid"]);
  });
  it("validates malicious and inconsistent payloads", () => {
    expect(validateQuestion(q("goals"), { ...valid, goals: ["prompt", "prompt"] })).toBeTruthy();
    expect(
      validateQuestion(q("aiServices"), { ...valid, aiServices: ["none", "chatgpt_paid"] }),
    ).toBeTruthy();
    expect(
      validateQuestion(q("designSkills"), { ...valid, designSkills: { figma: "advanced" } }),
    ).toBeTruthy();
  });
  it("requires other text only when selected", () => {
    expect(validateQuestion(q("goals"), { ...valid, goals: ["other"] })).toBeTruthy();
    expect(cleanAnswers({ ...valid, goalsOther: "stale" })["goalsOther"]).toBeUndefined();
  });
  it("prevents CSV formula injection and escapes multiline cells", () => {
    expect(csvCell(" \t=HYPERLINK(1)")).toBe('"\' \t=HYPERLINK(1)"');
    expect(csvCell('a,"b"\nc')).toBe('"a,""b""\nc"');
  });
});
