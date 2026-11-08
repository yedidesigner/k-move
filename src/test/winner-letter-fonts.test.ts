import { describe, expect, it } from "vitest";
import { WINNER_LETTER_FONTS, randomLetterFontSequence, findLargestFittingLetterSize } from "@/lib/winner-letter-fonts";

describe("Per-note Korean handwriting selection", () => {
  it("has unique verified font faces in the allowed web-font set", () => {
    expect(WINNER_LETTER_FONTS).toHaveLength(8);
    expect(new Set(WINNER_LETTER_FONTS.map(font => font.family)).size).toBe(8);
    expect(WINNER_LETTER_FONTS.some(font => font.family === "WrlKyobo")).toBe(true);
    expect(WINNER_LETTER_FONTS.some(font => font.family === "WrlGeuriunCat")).toBe(true);
    expect(WINNER_LETTER_FONTS.some(font => /Diary|Beomseok/i.test(font.family))).toBe(false);
  });

  it("shuffles without repeating a style in a cycle or at cycle boundaries", () => {
    for (const seed of [0,0.29,0.51,0.999]) {
      const fonts = randomLetterFontSequence(20,()=>seed);
      expect(fonts).toHaveLength(20);
      expect(new Set(fonts.slice(0,8).map(font => font.family)).size).toBe(8);
      expect(new Set(fonts.slice(8,16).map(font => font.family)).size).toBe(8);
      for (let i=1;i<fonts.length;i++) {
        expect(fonts[i]?.family).not.toBe(fonts[i-1]?.family);
      }
    }
  });

  it("selects the largest font that actually fits the measured paper space", () => {
    expect(findLargestFittingLetterSize(size => size <= 18)).toBe(18);
    expect(findLargestFittingLetterSize(size => size <= 30)).toBe(30);
    expect(findLargestFittingLetterSize(() => false)).toBe(8);
    expect(findLargestFittingLetterSize(size => size <= 12, 10, 20)).toBe(12);
  });

  it("handles invalid counts safely", () => {
    expect(randomLetterFontSequence(0)).toEqual([]);
    expect(randomLetterFontSequence(-10)).toEqual([]);
    expect(randomLetterFontSequence(Number.NaN)).toEqual([]);
    expect(randomLetterFontSequence(1)).toHaveLength(1);
  });
});
