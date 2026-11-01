import { describe, expect, it } from "vitest";
import { GLOSSARY } from "@/data/glossary";
import { STUDY_GUIDES } from "@/data/study-materials";
import {
  currentPublishedSession,
  editableSessionContent,
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
  it("adds a session download without replacing its published lesson or editable fields", () => {
    const material = {
      id: " week-02-class-materials ",
      title: " 수업 자료 ",
      fileName: " lesson.zip ",
      url: " https://example.com/lesson.zip ",
      sizeBytes: "11249358",
    };
    const doc = editableSessionContent("S02", {
      title: "강사가 수정한 제목",
      date: "2026-11-03",
      body: "현재 공개된 안내",
      materials: [material],
      curriculum: { topics: ["수정한 교육 내용"] },
    });
    const sessions = mergeSessions([publication("session", "S02", doc)]);
    const session = sessions.find((item) => item.id === "S02")!;
    expect(session.materials).toEqual([
      {
        id: "week-02-class-materials",
        title: "수업 자료",
        fileName: "lesson.zip",
        url: "https://example.com/lesson.zip",
        sizeBytes: 11249358,
      },
    ]);
    expect(session).toMatchObject({
      title: "강사가 수정한 제목",
      date: "2026-11-03",
      body: "현재 공개된 안내",
      curriculum: { topics: ["수정한 교육 내용"] },
    });
    expect(
      sessions.filter((item) => item.id !== "S02").every((item) => !item.materials?.length),
    ).toBe(true);
    expect(editableSessionContent("S02", doc)["materials"]).toEqual([material]);
    expect(mergeSessions([]).every((item) => !item.materials?.length)).toBe(true);
  });
  it("ignores unsafe or incomplete downloads and never renders malformed file sizes", () => {
    const material = {
      id: "valid",
      title: "수업 자료",
      fileName: "lesson.zip",
      url: "https://example.com/lesson.zip",
      sizeBytes: 11249358,
    };
    const invalidSizes = [
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.MAX_SAFE_INTEGER + 1,
      "",
      "1 MB",
      true,
      null,
      {},
    ];
    const session = mergeSessions([
      publication("session", "S02", {
        materials: [
          material,
          { ...material, title: "동일 ID의 중복 파일" },
          null,
          "invalid",
          { ...material, id: "javascript", url: "javascript:alert(1)" },
          { ...material, id: "http", url: "http://example.com/lesson.zip" },
          { ...material, id: "credentials", url: "https://user:password@example.com/lesson.zip" },
          { ...material, id: "" },
          { ...material, id: "missing-title", title: " " },
          { ...material, id: "missing-file", fileName: "" },
          ...invalidSizes.map((sizeBytes, index) => ({
            ...material,
            id: `size-${index}`,
            sizeBytes,
          })),
        ],
      }),
    ]).find((item) => item.id === "S02")!;
    expect(session.materials).toHaveLength(1 + invalidSizes.length);
    expect(session.materials?.[0]).toEqual(material);
    expect(session.materials?.slice(1).every((item) => item.sizeBytes === undefined)).toBe(true);
    expect(
      mergeSessions([publication("session", "S02", { materials: {} })]).find(
        (item) => item.id === "S02",
      )?.materials,
    ).toEqual([]);
  });
  it("preserves legacy lesson details when older documents contain only a title and schedule", () => {
    const original = mergeSessions([]).find((item) => item.id === "S02")!;
    const doc = editableSessionContent("S02", { title: "강사가 수정한 제목", body: "준비물 안내" });
    const session = mergeSessions([publication("session", "S02", doc)]).find(
      (item) => item.id === "S02",
    )!;
    expect(session.title).toBe("강사가 수정한 제목");
    expect(session.curriculum?.topics).toEqual(original.curriculum?.topics);
    expect(session.curriculum?.terms).toEqual(original.curriculum?.terms);
    expect(session.body).toBe("준비물 안내");
  });
  it("publishes editable curriculum fields and honors intentionally empty lists", () => {
    const doc = editableSessionContent("S02");
    doc["curriculum"] = {
      number: 99,
      sourceWeek: "잘못된 회차",
      title: "직접 수정한 수업",
      cycle: "개인 프로젝트",
      project: "포트폴리오 v2",
      stage: null,
      goalOutput: "검증한 배포 링크",
      topics: ["새 교육 내용"],
      terms: [{ name: "CTA", description: "행동을 유도하는 요소" }],
      tools: [],
      homework: "동료 테스트 결과 제출",
    };
    const lesson = mergeSessions([publication("session", "S02", doc)]).find(
      (item) => item.id === "S02",
    )!.curriculum!;
    expect(lesson).toMatchObject({
      number: 2,
      cycle: "개인 프로젝트",
      project: "포트폴리오 v2",
      stage: null,
      goalOutput: "검증한 배포 링크",
      topics: ["새 교육 내용"],
      tools: [],
      homework: "동료 테스트 결과 제출",
    });
    expect(lesson.sourceWeek).not.toBe("잘못된 회차");
    expect(lesson.terms).toEqual([{ name: "CTA", description: "행동을 유도하는 요소" }]);
    expect(mergeSessions([]).find((item) => item.id === "S02")?.curriculum?.topics).not.toEqual([
      "새 교육 내용",
    ]);
  });
  it("requires paired term names and definitions without deleting incomplete drafts", () => {
    const doc = editableSessionContent("S02");
    doc["curriculum"] = { terms: [{ name: "CTA", description: "" }] };
    expect(validateContent("session", doc)).toContain("이름과 설명");
    expect(doc["curriculum"]).toEqual({ terms: [{ name: "CTA", description: "" }] });
  });
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
        {
          date: "2026-11-03",
          startTime: "09:30",
          endTime: "16:30",
          body: "비공개",
          materials: [
            {
              id: "private",
              title: "자료",
              fileName: "lesson.zip",
              url: "https://example.com/lesson.zip",
            },
          ],
        },
        true,
      ),
    ]);
    const session = sessions.find((item) => item.id === "S02")!;
    expect(session.date).toBe("2026-11-03");
    expect(session.startTime).toBe("09:30");
    expect(session.curriculum).toBeNull();
    expect(session.detailsPublished).toBe(false);
    expect(session.body).toBeUndefined();
    expect(session.materials).toBeUndefined();
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
