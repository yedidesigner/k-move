import { getSupabase } from "@/lib/supabase";
import { normalizeFeedbackUrl, validateFeedbackUpload } from "@/lib/feedback-attachments";

export const PRACTICE_BUCKET = "kmove-practice-files";
export const PRACTICE_TABLE = "kmove_practice_messages";
export const PRACTICE_BODY_LIMIT = 20_000;
export const PRACTICE_FILE_COUNT = 5;
export const PRACTICE_LINK_COUNT = 10;

export type PracticeLink = { url: string; title?: string };
export type PracticeAttachment = {
  id: string;
  path: string;
  name: string;
  size: number;
  mime: string;
  kind: "image" | "file";
};
export type PracticeMessage = {
  id: string;
  session_number: number;
  author_id: string;
  author_name: string;
  author_role: "student" | "instructor";
  body: string;
  parent_id: string | null;
  links: PracticeLink[];
  attachments: PracticeAttachment[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
export type PracticeInput = {
  body: string;
  files: File[];
  parentId?: string | null;
  links?: PracticeLink[];
};
export type PracticeDraft = {
  id: string;
  sessionNumber: number;
  userId: string;
  fingerprint: string;
  uploaded: PracticeAttachment[];
  attemptedInsert: boolean;
};

const COLUMNS = "id,session_number,author_id,author_name,author_role,body,parent_id,links,attachments,is_pinned,created_at,updated_at,deleted_at";

const PRACTICE_URL_PATTERN = /https?:\/\/[^\s<>"\u201c\u201d]+/gi;

function trimPracticeUrlCandidate(candidate: string) {
  let value = candidate.replace(/[.,;:!?\u3002\uFF0C\uFF01\uFF1F]+$/, "");
  while (value.endsWith(")") &&
    (value.match(/\)/g)?.length ?? 0) > (value.match(/\(/g)?.length ?? 0)) {
    value = value.slice(0, -1);
  }
  return value.replace(/[\]}]+$/, "");
}

/** Extract safe, deduplicated bookmark metadata from pasted URLs. */
export function extractPracticeLinks(body: string): PracticeLink[] {
  const matches = body.match(PRACTICE_URL_PATTERN) ?? [];
  const seen = new Set<string>();
  const result: PracticeLink[] = [];
  for (const candidate of matches) {
    try {
      const url = normalizeFeedbackUrl(trimPracticeUrlCandidate(candidate));
      if (!seen.has(url)) {
        seen.add(url);
        result.push({ url });
      }
    } catch { /* Invalid or credential-bearing URLs are never linked. */ }
  }
  return result;
}

/** Hide raw URLs already displayed as bookmark cards, including in older posts. */
export function practiceDisplayBody(body: string, links: PracticeLink[]) {
  if (!links.length) return body.trim();
  const linked = new Set(links.map(link => link.url));
  const withoutLinks = body.replace(PRACTICE_URL_PATTERN, candidate => {
    try {
      if (linked.has(normalizeFeedbackUrl(trimPracticeUrlCandidate(candidate)))) return "";
    } catch { /* Invalid text must not silently disappear. */ }
    return candidate;
  });
  return withoutLinks
    .split(/\r?\n/)
    .map(line => line.replace(/[ \t]{2,}/g, " ").replace(/\(\s*\)/g, "")
      .replace(/\s+([,.!?])/g, "$1").trim())
    .filter(line => line.length > 0 &&
      !/^[,.;:!?)\]]+$/.test(line) &&
      !/^(?:링크|주소|URL|사이트|참고 링크)\s*[:：]$/i.test(line))
    .join("\n")
    .trim();
}

export function preparePracticeInput(input: PracticeInput) {
  const body = input.body.trim();
  if (body.length > PRACTICE_BODY_LIMIT) throw new Error("내용은 20,000자 이내로 입력해 주세요.");
  if (input.files.length > PRACTICE_FILE_COUNT) throw new Error("한 번에 파일을 최대 5개까지 공유할 수 있습니다.");
  input.files.forEach(validateFeedbackUpload);

  const links = extractPracticeLinks(body);
  const seen = new Set(links.map(link => link.url));
  for (const link of input.links ?? []) {
    const url = normalizeFeedbackUrl(link.url);
    if (!seen.has(url)) {
      seen.add(url);
      links.push(link.title ? { url, title: link.title } : { url });
    }
  }
  if (links.length > PRACTICE_LINK_COUNT) throw new Error("한 글에 링크를 최대 10개까지 공유할 수 있습니다.");
  if (!body && !input.files.length && !links.length)
    throw new Error("내용이나 링크를 입력하거나 파일을 첨부해 주세요.");
  return { body, links, files: input.files, parentId: input.parentId ?? null };
}

export function practiceFingerprint(input: ReturnType<typeof preparePracticeInput>) {
  return JSON.stringify([input.body, input.parentId,
    input.links.map(link => [link.url, link.title ?? ""]),
    input.files.map(file => [file.name, file.size, file.type, file.lastModified])]);
}

function row(value: unknown): PracticeMessage {
  const result = value as PracticeMessage;
  return { ...result, links: Array.isArray(result.links) ? result.links : [], attachments: Array.isArray(result.attachments) ? result.attachments : [] };
}

export async function listPracticeMessages(sessionNumber: number) {
  const records: PracticeMessage[] = [];
  const pageSize = 500;
  // Explicit paging keeps older records accessible beyond the server's default row limit.
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await getSupabase().from(PRACTICE_TABLE).select(COLUMNS)
      .eq("session_number", sessionNumber).order("created_at", { ascending: true })
      .order("id", { ascending: true }).range(offset, offset + pageSize - 1);
    if (error) throw error;
    records.push(...(data ?? []).map(row));
    if (!data || data.length < pageSize) return records;
  }
}

async function existingMessage(id: string) {
  const { data, error } = await getSupabase().from(PRACTICE_TABLE).select(COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? row(data) : null;
}

/** Clean up only uploads whose message is confirmed absent, never an uncertain committed post. */
export async function discardPracticeDraft(draft: PracticeDraft) {
  if (!draft.uploaded.length && !draft.attemptedInsert) return null;
  const existing = await existingMessage(draft.id);
  if (existing) return existing;
  if (!draft.uploaded.length) return null;
  const { error } = await getSupabase().storage.from(PRACTICE_BUCKET).remove(draft.uploaded.map((file) => file.path));
  if (error) throw error;
  draft.uploaded = [];
  return null;
}

export async function savePracticeMessage(
  draft: PracticeDraft,
  input: ReturnType<typeof preparePracticeInput>,
  onProgress?: (label: string) => void,
) {
  // The same UUID is reused after a network error. A lost response cannot create a second post.
  if (draft.attemptedInsert) {
    onProgress?.("이전 전송 결과를 확인하는 중…");
    const existing = await existingMessage(draft.id);
    if (existing) return existing;
  }
  const storage = getSupabase().storage.from(PRACTICE_BUCKET);
  for (let index = draft.uploaded.length; index < input.files.length; index++) {
    const file = input.files[index]!;
    const type = validateFeedbackUpload(file);
    const id = crypto.randomUUID();
    const path = `${draft.userId}/${draft.sessionNumber}/${draft.id}/${id}.${type.extension}`;
    onProgress?.(`파일 업로드 중 (${index + 1}/${input.files.length})…`);
    // storage-js uses the multipart Blob's MIME, not options.contentType, for File uploads.
    const uploadBody = file.slice(0, file.size, type.mimeType);
    const { error } = await storage.upload(path, uploadBody, { contentType: type.mimeType, upsert: false, cacheControl: "3600" });
    if (error) throw new Error("파일을 올리지 못했습니다. 연결을 확인한 뒤 다시 공유해 주세요.");
    draft.uploaded.push({ id, path, name: file.name, size: file.size, mime: type.mimeType, kind: type.kind });
  }
  onProgress?.("대화에 저장하는 중…");
  draft.attemptedInsert = true;
  const { data, error } = await getSupabase().from(PRACTICE_TABLE).insert({
    id: draft.id, session_number: draft.sessionNumber, author_id: draft.userId,
    body: input.body, parent_id: input.parentId, links: input.links, attachments: draft.uploaded,
  }).select(COLUMNS).single();
  if (!error && data) return row(data);
  // Check the canonical record after conflicts/timeouts before telling the user to retry.
  try {
    const existing = await existingMessage(draft.id);
    if (existing) return existing;
  } catch { /* Keep the draft UUID and uploaded objects until a retry resolves the result. */ }
  if (error && ["23514", "42501"].includes(error.code)) {
    throw new Error(/[가-힣]/.test(error.message)
      ? error.message
      : "공유 권한 또는 첨부파일을 확인하지 못했습니다. 강사에게 확인해 주세요.");
  }
  throw new Error("공유 결과를 확인하지 못했습니다. 내용은 유지되며, 다시 공유하면 중복 없이 확인합니다.");
}

export async function editPracticeMessage(id: string, sessionNumber: number, body: string) {
  const trimmed = body.trim();
  if (trimmed.length > PRACTICE_BODY_LIMIT) throw new Error("내용은 20,000자 이내로 입력해 주세요.");
  const previous = await existingMessage(id);
  if (!previous || previous.session_number !== sessionNumber || previous.deleted_at)
    throw new Error("수정할 글을 찾을 수 없습니다.");

  // Retain bookmarks added via the link button when editing explanatory text.
  const originalPasted = new Set(extractPracticeLinks(previous.body).map(link => link.url));
  const links = extractPracticeLinks(trimmed);
  const seen = new Set(links.map(link => link.url));
  for (const link of previous.links) {
    if (!originalPasted.has(link.url) && !seen.has(link.url)) {
      seen.add(link.url);
      links.push(link);
    }
  }
  if (links.length > PRACTICE_LINK_COUNT) throw new Error("한 글에 링크를 최대 10개까지 공유할 수 있습니다.");
  if (!trimmed && !links.length && !previous.attachments.length)
    throw new Error("본문이나 북마크가 없는 글로 수정할 수 없습니다.");
  const { data, error } = await getSupabase().from(PRACTICE_TABLE)
    .update({ body: trimmed, links }).eq("id", id).eq("session_number", sessionNumber)
    .is("deleted_at", null).select(COLUMNS).single();
  if (error || !data) throw new Error("수정하지 못했습니다. 본인이 작성한 글인지 확인하고 다시 시도해 주세요.");
  return row(data);
}

export async function pinPracticeMessage(id: string, sessionNumber: number, pinned: boolean) {
  const { data, error } = await getSupabase().from(PRACTICE_TABLE)
    .update({ is_pinned: pinned }).eq("id", id).eq("session_number", sessionNumber)
    .is("deleted_at", null).select(COLUMNS).single();
  if (error || !data) throw new Error("고정 상태를 변경하지 못했습니다. 강사 계정에서 다시 시도해 주세요.");
  return row(data);
}

export async function deletePracticeMessage(id: string, sessionNumber: number) {
  const original = await existingMessage(id);
  if (!original || original.session_number !== sessionNumber) throw new Error("삭제할 글을 찾을 수 없습니다.");
  if (original.deleted_at) return original;
  const { data, error } = await getSupabase().from(PRACTICE_TABLE)
    .update({ deleted_at: new Date().toISOString() }).eq("id", id).eq("session_number", sessionNumber)
    .select(COLUMNS).single();
  let deleted = !error && data ? row(data) : null;
  if (!deleted) {
    // A committed tombstone may outlive a lost response. Confirm it before retrying
    // an update that the immutable-tombstone guard would reject.
    try {
      const canonical = await existingMessage(id);
      if (canonical?.session_number === sessionNumber && canonical.deleted_at) deleted = canonical;
    } catch { /* An unresolved deletion is still reported as a failure. */ }
    if (!deleted) throw new Error("글을 삭제하지 못했습니다. 다시 시도해 주세요.");
  }
  // The database removes attachment references first, immediately revoking classmates' file access.
  if (original.attachments.length) {
    try {
      const storage = getSupabase().storage.from(PRACTICE_BUCKET);
      const paths = original.attachments.map((file) => file.path);
      const cleanup = await storage.remove(paths);
      if (cleanup.error) {
        const retry = await storage.remove(paths);
        if (retry.error) console.warn("Practice attachment cleanup needs a retry.");
      }
    } catch { console.warn("Practice attachment cleanup needs a retry."); }
  }
  return deleted;
}

/** Issue short-lived access only after Storage has checked the current member's permissions. */
export async function getPracticeFileUrl(attachment: PracticeAttachment) {
  const { data, error } = await getSupabase().storage.from(PRACTICE_BUCKET)
    .createSignedUrl(attachment.path, 300, attachment.kind === "file" ? { download: attachment.name } : undefined);
  if (error || !data?.signedUrl) throw new Error("파일을 열지 못했습니다. 다시 시도해 주세요.");
  return data.signedUrl;
}
