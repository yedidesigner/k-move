import { GLOSSARY, type GlossaryEntry } from "@/data/glossary";
import { VISUAL_LESSONS } from "@/data/visual-lesson-labels";
import { STUDY_GUIDES, type StudyGuide } from "@/data/study-materials";
import { CLASS_END, CLASS_START, SESSIONS, type Session } from "@/data/schedule";
import { TOPICS, type TopicId } from "@/data/design-sources";

export type ContentKind = "session" | "announcement" | "glossary" | "guide" | "path";
export type ContentDocument = Record<string, unknown>;
export type PublishedContentRow = {
  kind: ContentKind;
  content_key: string;
  document: ContentDocument;
  hidden: boolean;
  published_at: string;
};
export type ManagedTerm = GlossaryEntry & {
  managed?: boolean;
  topic?: string;
  structure?: string;
  context?: string;
  misconception?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageBasis?: string;
  referenceUrl?: string;
};
export type ManagedSession = Session & {
  startTime: string;
  endTime: string;
  body?: string;
  objectives?: string[];
  guideIds?: string[];
  termIds?: string[];
  progress?: "scheduled" | "completed";
  managed?: boolean;
};
export type LearningPath = {
  id: string;
  title: string;
  topic: string;
  description: string;
  guideIds: string[];
};

export function textValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}
export function linesValue(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}
export function safeContentUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}
export function contentRowKey(kind: ContentKind, key: string) {
  return `${kind}:${key}`;
}

export function mergeGlossary(rows: PublishedContentRow[]): ManagedTerm[] {
  const terms = new Map<string, ManagedTerm>(GLOSSARY.map((entry) => [entry.id, entry]));
  for (const row of rows.filter((item) => item.kind === "glossary")) {
    if (row.hidden) {
      terms.delete(row.content_key);
      continue;
    }
    const doc = row.document;
    const previous = terms.get(row.content_key);
    const english = textValue(doc["english"], previous?.english).trim();
    if (!english) continue;
    terms.set(row.content_key, {
      ...previous,
      id: row.content_key,
      managed: true,
      english,
      korean: textValue(doc["korean"], previous?.korean),
      pronunciation: textValue(doc["pronunciation"], previous?.pronunciation),
      description: textValue(doc["description"], previous?.description),
      example: textValue(doc["example"], previous?.example),
      letter: english.charAt(0).toUpperCase(),
      aliases: doc["aliases"] ? linesValue(doc["aliases"]) : (previous?.aliases ?? []),
      topic: textValue(doc["topic"]),
      structure: textValue(doc["structure"]),
      context: textValue(doc["context"]),
      misconception: textValue(doc["misconception"]),
      imageUrl: safeContentUrl(doc["imageUrl"]),
      imageAlt: textValue(doc["imageAlt"]),
      imageBasis: textValue(doc["imageBasis"]),
      referenceUrl: safeContentUrl(doc["referenceUrl"]),
    });
  }
  return [...terms.values()].sort((a, b) =>
    a.english.localeCompare(b.english, "en", { sensitivity: "base" }),
  );
}

export function emptyGuide(id: string): StudyGuide {
  return {
    id,
    topic: "foundations",
    category: "디자인 기초",
    title: "",
    summary: "",
    keywords: [],
    intro: "",
    objectives: [],
    sections: [],
    decision: { context: "", choice: "", why: "", alternatives: "", validation: "" },
    exercise: { brief: "", deliverable: "", criteria: [] },
    pitfalls: [],
    relatedTerms: [],
    references: [],
    sourceRefs: [],
  };
}
export function mergeGuides(
  rows: PublishedContentRow[],
  glossary = mergeGlossary(rows),
): StudyGuide[] {
  const guides = new Map(STUDY_GUIDES.map((guide) => [guide.id, guide]));
  for (const row of rows.filter((item) => item.kind === "guide")) {
    if (row.hidden) {
      guides.delete(row.content_key);
      continue;
    }
    const base = guides.get(row.content_key) ?? emptyGuide(row.content_key);
    const doc = row.document;
    const topic = TOPICS.some((item) => item.id === doc["topic"])
      ? (doc["topic"] as TopicId)
      : base.topic;
    const textFields = ["title", "summary", "intro", "category"] as const;
    const merged = { ...base, id: row.content_key, topic };
    for (const field of textFields) merged[field] = textValue(doc[field], base[field]);
    if (!merged.title.trim()) continue;
    if (Array.isArray(doc["objectives"])) merged.objectives = linesValue(doc["objectives"]);
    if (Array.isArray(doc["pitfalls"])) merged.pitfalls = linesValue(doc["pitfalls"]);
    if (Array.isArray(doc["sections"]))
      merged.sections = doc["sections"].filter(isDocument).map((section) => ({
        title: textValue(section["title"]),
        body: textValue(section["body"]),
        bullets: linesValue(section["bullets"]),
      }));
    if (isDocument(doc["decision"]))
      merged.decision = {
        context: textValue(doc["decision"]["context"]),
        choice: textValue(doc["decision"]["choice"]),
        why: textValue(doc["decision"]["why"]),
        alternatives: textValue(doc["decision"]["alternatives"]),
        validation: textValue(doc["decision"]["validation"]),
      };
    if (isDocument(doc["exercise"]))
      merged.exercise = {
        brief: textValue(doc["exercise"]["brief"]),
        deliverable: textValue(doc["exercise"]["deliverable"]),
        criteria: linesValue(doc["exercise"]["criteria"]),
      };
    if (typeof doc["visualTermId"] === "string") merged.visualTermId = doc["visualTermId"];
    const relatedIds = Array.isArray(doc["relatedTermIds"])
      ? linesValue(doc["relatedTermIds"])
      : base.relatedTerms.map((term) => term.id);
    merged.relatedTerms = relatedIds.flatMap((id) => {
      const term = glossary.find((entry) => entry.id === id);
      return term ? [{ id: term.id, english: term.english, korean: term.korean }] : [];
    });
    merged.keywords = [
      ...merged.relatedTerms.flatMap((term) => [term.english, term.korean]),
      ...linesValue(doc["keywords"]),
    ];
    if (Array.isArray(doc["references"]))
      merged.references = doc["references"].filter(isDocument).map((ref) => ({
        title: textValue(ref["title"]),
        location: textValue(ref["location"]),
        note: textValue(ref["note"]),
        url: safeContentUrl(ref["url"]),
      }));
    guides.set(row.content_key, merged);
  }
  return [...guides.values()].map((guide) => ({
    ...guide,
    relatedTerms: guide.relatedTerms.flatMap((related) => {
      const term = glossary.find((item) => item.id === related.id);
      return term ? [{ id: term.id, english: term.english, korean: term.korean }] : [];
    }),
  }));
}
export function isDocument(value: unknown): value is ContentDocument {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
export function mergePaths(rows: PublishedContentRow[]): LearningPath[] {
  return rows
    .filter((row) => row.kind === "path" && !row.hidden)
    .map((row) => ({
      id: row.content_key,
      title: textValue(row.document["title"]),
      topic: textValue(row.document["topic"]),
      description: textValue(row.document["description"]),
      guideIds: linesValue(row.document["guideIds"]),
    }));
}
export function orderGuidesByPaths(guides: StudyGuide[], paths: LearningPath[]): StudyGuide[] {
  const ids = paths.flatMap((path) => path.guideIds);
  const priority = new Map<string, number>();
  ids.forEach((id) => {
    if (!priority.has(id)) priority.set(id, priority.size);
  });
  return [...guides].sort(
    (a, b) =>
      (priority.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
      (priority.get(b.id) ?? Number.MAX_SAFE_INTEGER),
  );
}
export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
export function mergeSessions(rows: PublishedContentRow[]): ManagedSession[] {
  return SESSIONS.map((base) => {
    const row = rows.find((item) => item.kind === "session" && item.content_key === base.id);
    const session: ManagedSession = { ...base, startTime: CLASS_START, endTime: CLASS_END };
    if (!row) return session;
    const doc = row.document;
    if (row.hidden)
      return {
        ...session,
        date: validDate(doc["date"]) ? doc["date"] : session.date,
        startTime: textValue(doc["startTime"], CLASS_START),
        endTime: textValue(doc["endTime"], CLASS_END),
        curriculum: null,
        title: "수업 내용 준비 중",
        detailsPublished: false,
        managed: true,
      };
    return {
      ...session,
      managed: true,
      curriculum: doc["keepCurriculum"] === false ? null : session.curriculum,
      title: textValue(doc["title"], session.title),
      date: validDate(doc["date"]) ? doc["date"] : session.date,
      startTime: /^\d{2}:\d{2}$/.test(textValue(doc["startTime"]))
        ? textValue(doc["startTime"])
        : CLASS_START,
      endTime: /^\d{2}:\d{2}$/.test(textValue(doc["endTime"]))
        ? textValue(doc["endTime"])
        : CLASS_END,
      body: textValue(doc["body"]),
      objectives: linesValue(doc["objectives"]),
      guideIds: linesValue(doc["guideIds"]),
      termIds: linesValue(doc["termIds"]),
      progress: doc["progress"] === "completed" ? "completed" : "scheduled",
      detailsPublished: true,
    };
  });
}
export function nextPublishedSession(
  sessions: ManagedSession[],
  today: string,
): ManagedSession | undefined {
  return [...sessions]
    .sort((a, b) => a.date.localeCompare(b.date) || a.number - b.number)
    .find((session) => session.date >= today);
}
export function currentPublishedSession(sessions: ManagedSession[], today: string): number {
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date) || a.number - b.number);
  return sorted.filter((session) => session.date <= today).at(-1)?.number ?? sorted[0]?.number ?? 1;
}

export function initialContent(kind: ContentKind, key: string): ContentDocument {
  if (kind === "glossary") {
    const term = GLOSSARY.find((item) => item.id === key);
    return term
      ? {
          ...term,
          english: term.lessonId ? VISUAL_LESSONS[term.lessonId].english : term.english,
          aliases: [
            ...new Set([...(term.aliases ?? []), ...(term.lessonId ? [term.english] : [])]),
          ],
        }
      : {
          english: "",
          korean: "",
          pronunciation: "",
          description: "",
          example: "",
          aliases: [],
          topic: "foundations",
        };
  }
  if (kind === "guide") {
    const guide = STUDY_GUIDES.find((item) => item.id === key) ?? emptyGuide(key);
    return { ...guide, relatedTermIds: guide.relatedTerms.map((term) => term.id) };
  }
  if (kind === "session") {
    const session = SESSIONS.find((item) => item.id === key);
    return {
      title: session?.title ?? "",
      date: session?.date ?? "",
      startTime: CLASS_START,
      endTime: CLASS_END,
      body: "",
      objectives: [],
      guideIds: [],
      termIds: [],
      progress: "scheduled",
      instructorNotes: "",
      keepCurriculum: true,
    };
  }
  if (kind === "path") return { title: "", description: "", topic: "foundations", guideIds: [] };
  return { title: "", body: "", sessionNumber: null };
}
export function validateContent(kind: ContentKind, doc: ContentDocument): string | null {
  const title = kind === "glossary" ? doc["english"] : doc["title"];
  if (!textValue(title).trim())
    return kind === "glossary" ? "영어 용어를 입력해 주세요." : "제목을 입력해 주세요.";
  if (
    kind === "glossary" &&
    (!textValue(doc["korean"]).trim() || !textValue(doc["description"]).trim())
  )
    return "한국어 뜻과 정의를 입력해 주세요.";
  for (const key of ["imageUrl", "referenceUrl"])
    if (textValue(doc[key]).trim() && !safeContentUrl(doc[key]))
      return "이미지와 출처 주소는 로그인 정보가 없는 HTTPS 링크를 사용해 주세요.";
  if (
    textValue(doc["imageUrl"]).trim() &&
    (!textValue(doc["imageAlt"]).trim() || !textValue(doc["imageBasis"]).trim())
  )
    return "이미지 설명과 사용 근거를 함께 입력해 주세요.";
  if (kind === "session") {
    if (!validDate(doc["date"])) return "유효한 수업 날짜를 선택해 주세요.";
    const start = textValue(doc["startTime"]),
      end = textValue(doc["endTime"]);
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timePattern.test(start) || !timePattern.test(end) || end <= start)
      return "수업 종료 시각은 시작 시각보다 늦어야 합니다.";
  }
  if (kind === "guide" && (!textValue(doc["summary"]).trim() || !textValue(doc["intro"]).trim()))
    return "학습 요약과 본문을 입력해 주세요.";
  if (kind === "path" && !linesValue(doc["guideIds"]).length)
    return "학습 경로에 가이드를 하나 이상 추가해 주세요.";
  if (kind === "announcement" && !textValue(doc["body"]).trim())
    return "공지 내용을 입력해 주세요.";
  return null;
}
