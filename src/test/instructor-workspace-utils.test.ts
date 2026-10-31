import { describe, expect, it } from "vitest";
import {
  EMPTY_REVIEW,
  fromSeoulInput,
  hasReviewContent,
  normalizeReviewContent,
  safeAssetUrl,
  toSeoulInput,
} from "@/components/instructor/workspace-utils";
describe("instructor workspace data boundaries", () => {
  it("interprets deadline inputs consistently as Korea time", () => {
    expect(fromSeoulInput("2026-11-01T10:00")).toBe("2026-11-01T01:00:00.000Z");
    expect(toSeoulInput("2026-11-01T01:00:00Z")).toBe("2026-11-01T10:00");
    expect(fromSeoulInput("")).toBeNull();
  });
  it("does not treat a private note as public feedback", () => {
    expect(hasReviewContent({ ...EMPTY_REVIEW, private_note: "강사만 보는 메모" })).toBe(false);
    expect(hasReviewContent({ ...EMPTY_REVIEW, asset_comments: { asset: "자료 의견" } })).toBe(
      true,
    );
  });
  it("rejects unsafe external links and coordinates outside the original image", () => {
    expect(safeAssetUrl("javascript:alert(1)")).toBeNull();
    expect(safeAssetUrl("https://user:secret@example.com")).toBeNull();
    expect(safeAssetUrl("https://figma.com/design/example")).toBe(
      "https://figma.com/design/example",
    );
    const content = normalizeReviewContent({
      pins: [
        { id: "good", image_id: "image", x: 0.5, y: 0.25, content: "위치" },
        { id: "bad", image_id: "image", x: 4, y: 0.25, content: "위치" },
      ],
      asset_comments: { a: "의견", b: 4 },
    });
    expect(content.pins).toHaveLength(1);
    expect(content.asset_comments).toEqual({ a: "의견" });
  });
});
