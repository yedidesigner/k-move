import { afterEach, describe, expect, it, vi } from "vitest";
import { fitWinnerLetterText } from "@/lib/fit-winner-letter";

afterEach(() => { vi.restoreAllMocks(); document.body.replaceChildren(); });

function measuredRegion(length: number, height = 100, inkExtra = 0) {
  const box = document.createElement("div");
  const text = document.createElement("p");
  box.style.padding = "2px";
  box.dataset.textFit = "pending";
  text.textContent = "가".repeat(length);
  box.append(text);
  document.body.append(box);
  Object.defineProperties(box, {
    clientWidth: { get: () => 200 },
    clientHeight: { get: () => height },
  });
  Object.defineProperties(text, {
    scrollWidth: { get: () => 195 },
    scrollHeight: { get: () => {
      const size = Number.parseFloat(text.style.fontSize) || 30;
      return Math.ceil(length * size * 0.7 / 195) * size * 1.28;
    } },
  });
  box.getBoundingClientRect = () => ({ left:0, right:200, top:0, bottom:height, width:200, height, x:0, y:0, toJSON:()=>({}) });
  vi.spyOn(document, "createRange").mockReturnValue({
    selectNodeContents: vi.fn(),
    getBoundingClientRect: () => ({ left:2, right:197, top:2, bottom:2 + text.scrollHeight + inkExtra }),
  } as unknown as Range);
  return { box, text };
}

describe("Winner letter safe-zone fitting", () => {
  it("shrinks the full natural-height reason rather than truncating it", () => {
    const { box, text } = measuredRegion(200);
    const original = text.textContent;
    expect(fitWinnerLetterText(box, text, 30)).toBe(true);
    expect(Number.parseFloat(text.style.fontSize)).toBeLessThan(30);
    expect(text.scrollHeight).toBeLessThanOrEqual(95);
    expect(text.textContent).toBe(original);
    expect(box.dataset.textFit).toBe("ready");
  });

  it("checks glyph overhang as well as the CSS line box", () => {
    const { box, text } = measuredRegion(80, 100, 12);
    expect(fitWinnerLetterText(box, text, 30)).toBe(true);
    expect(text.scrollHeight + 14).toBeLessThanOrEqual(99.5);
  });

  it("does not accept a known-overflowing 8px minimum", () => {
    const { box, text } = measuredRegion(200, 35);
    expect(fitWinnerLetterText(box, text, 30)).toBe(true);
    expect(Number.parseFloat(text.style.fontSize)).toBeLessThan(8);
    expect(text.textContent).toHaveLength(200);
  });

  it("waits for a nonzero image layout before revealing the text", () => {
    const { box, text } = measuredRegion(25, 0);
    expect(fitWinnerLetterText(box, text, 30)).toBe(false);
    expect(box.dataset.textFit).toBe("pending");
  });
});
