import { describe, expect, it } from "vitest";
import { GLOSSARY } from "@/data/glossary";
import { STUDY_GUIDES } from "@/data/study-materials";
import {
  currentPublishedSession,
  initialContent,
  mergeGlossary,
  mergeGuides,
  mergePaths,
  mergeSessions,
  orderGuidesByPaths,
  safeContentUrl,
  validateContent,
  type ContentKind,
  type PublishedContentRow,
} from "@/lib/content-model";

function publication(
  kind: ContentKind,
  key: string,
  document: Record<string, unknown> = {},
  hidden = false,
): PublishedContentRow {
  return { kind, content_key: key, document, hidden, published_at: "2026-11-01T00:00:00Z" };
}

describe("published educational content overlays", () => {
  it("keeps every existing term, guide and authored interaction when nothing has been edited", () => {
    expect(mergeGlossary([])).toEqual(GLOSSARY);
    expect(mergeGuides([])).toEqual(STUDY_GUIDES);
    const interactive = GLOSSARY.find((term) => term.lessonId)!;
    const changed = mergeGlossary([
      publication("glossary", interactive.id, {
        english: "Updated concept",
        description: "새 정의",
      }),
    ]).find((term) => term.id === interactive.id)!;
    expect(changed.lessonId).toBe(interactive.lessonId);
    expect(changed.description).toBe("새 정의");
    expect(changed.letter).toBe("U");
    expect(changed.managed).toBe(true);
    expect(changed.english).toBe("Updated concept");
  });
  it("starts editing visual lessons with their existing displayed name and retains original search aliases", () => {
    const term = GLOSSARY.find((item) => item.lessonId === "cta")!;
    const doc = initialContent("glossary", term.id);
    expect(doc["english"]).toBe("CTA");
    expect(doc["aliases"]).toContain(term.english);
    const published = mergeGlossary([
      publication("glossary", term.id, { ...doc, description: "새 정의" }),
    ]);
    expect(published.find((item) => item.id === term.id)?.english).toBe("CTA");
  });
  it("a hidden publication suppresses the baseline instead of restoring the original static content", () => {
    const term = GLOSSARY[0]!;
    const guide = STUDY_GUIDES[0]!;
    const rows = [
      publication("glossary", term.id, {}, true),
      publication("guide", guide.id, {}, true),
    ];
    expect(mergeGlossary(rows).some((item) => item.id === term.id)).toBe(false);
    expect(mergeGuides(rows).some((item) => item.id === guide.id)).toBe(false);
  });
  it("creates a new alphabetized term without mutating the static source", () => {
    const rows = [
      publication("glossary", "custom-new", {
        english: "Aardvark pattern",
        korean: "학습 예시",
        description: "새 개념",
        pronunciation: "아드바크",
        example: "작업 예시",
      }),
    ];
    const merged = mergeGlossary(rows);
    expect(merged).toHaveLength(GLOSSARY.length + 1);
    expect(merged.findIndex((item) => item.id === "custom-new")).toBeLessThan(
      merged.findIndex((item) => item.english === "Accessibility"),
    );
    expect(GLOSSARY.some((item) => item.id === "custom-new")).toBe(false);
  });
  it("resolves related terms against the published vocabulary, including new names and hidden entries", () => {
    const guide = STUDY_GUIDES.find((item) => item.relatedTerms.length > 1)!;
    const first = guide.relatedTerms[0]!;
    const second = guide.relatedTerms[1]!;
    const rows = [
      publication("glossary", first.id, { english: "New public name" }),
      publication("glossary", second.id, {}, true),
    ];
    const updated = mergeGuides(rows).find((item) => item.id === guide.id)!;
    expect(updated.relatedTerms.find((term) => term.id === first.id)?.english).toBe(
      "New public name",
    );
    expect(updated.relatedTerms.some((term) => term.id === second.id)).toBe(false);
  });
  it("uses published path order without bringing hidden guides back", () => {
    const first = STUDY_GUIDES[0]!,
      second = STUDY_GUIDES[1]!;
    const rows = [
      publication("path", "visual-path", { title: "시각 디자인", guideIds: [second.id, first.id] }),
      publication("guide", first.id, {}, true),
    ];
    const ordered = orderGuidesByPaths(mergeGuides(rows), mergePaths(rows));
    expect(ordered[0]?.id).toBe(second.id);
    expect(ordered.some((item) => item.id === first.id)).toBe(false);
  });
  it("suppresses unsafe reference URLs and requires an image usage basis before publication", () => {
    expect(safeContentUrl("javascript:alert(1)")).toBe("");
    expect(safeContentUrl("https://person:secret@example.com/image.png")).toBe("");
    expect(safeContentUrl("https://example.com/image.png")).toBe("https://example.com/image.png");
    expect(
      validateContent("glossary", {
        english: "Term",
        korean: "용어",
        description: "정의",
        imageUrl: "https://example.com/image.png",
      }),
    ).toContain("사용 근거");
  });
});

describe("published class schedule", () => {
  it("selects the latest actual date even when rescheduling changes session-number order", () => {
    const sessions = mergeSessions([
      publication("session", "S01", { ...initialContent("session", "S01"), date: "2026-11-05" }),
    ]);
    expect(currentPublishedSession(sessions, "2026-11-03")).toBe(2);
    expect(currentPublishedSession(sessions, "2026-11-06")).toBe(1);
    expect(currentPublishedSession(sessions, "2027-01-08")).toBe(12);
  });
  it("hiding lesson content keeps its revised schedule but not its old lesson body", () => {
    const sessions = mergeSessions([
      publication(
        "session",
        "S02",
        { date: "2026-11-03", startTime: "09:30", endTime: "16:30", body: "비공개" },
        true,
      ),
    ]);
    const session = sessions.find((item) => item.id === "S02")!;
    expect(session.date).toBe("2026-11-03");
    expect(session.startTime).toBe("09:30");
    expect(session.curriculum).toBeNull();
    expect(session.detailsPublished).toBe(false);
    expect(session.body).toBeUndefined();
  });
  it("can replace the legacy curriculum while retaining the archived static original", () => {
    const sessions = mergeSessions([
      publication("session", "S01", {
        ...initialContent("session", "S01"),
        body: "새 안내",
        keepCurriculum: false,
      }),
    ]);
    expect(sessions[0]?.curriculum).toBeNull();
    expect(sessions[0]?.body).toBe("새 안내");
    expect(mergeSessions([])[0]?.curriculum).not.toBeNull();
  });
  it("rejects impossible calendar dates and reversed class times", () => {
    expect(
      validateContent("session", {
        title: "수업",
        date: "2026-02-30",
        startTime: "10:00",
        endTime: "18:30",
      }),
    ).toContain("날짜");
    expect(
      validateContent("session", {
        title: "수업",
        date: "2026-11-01",
        startTime: "18:30",
        endTime: "10:00",
      }),
    ).toContain("종료");
  });
});
