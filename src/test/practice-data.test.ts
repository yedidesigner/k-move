import { webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PRACTICE_BUCKET,
  PRACTICE_TABLE,
  deletePracticeMessage,
  discardPracticeDraft,
  editPracticeMessage,
  extractPracticeLinks,
  getPracticeFileUrl,
  listPracticeMessages,
  practiceFingerprint,
  preparePracticeInput,
  savePracticeMessage,
  type PracticeAttachment,
  type PracticeDraft,
  type PracticeMessage,
} from "@/lib/practice";

const db = vi.hoisted(() => ({
  list: vi.fn(),
  lookup: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  signedUrl: vi.fn(),
  storageBucket: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    from: (table: string) => {
      const filters: Record<string, unknown> = {};
      const orders: [string, unknown][] = [];
      let operation = "read";
      let values: unknown;
      const query = {
        select: () => query,
        eq: (key: string, value: unknown) => {
          filters[key] = value;
          return query;
        },
        is: (key: string, value: unknown) => {
          filters[key] = value;
          return query;
        },
        order: (key: string, options: unknown) => {
          orders.push([key, options]);
          return query;
        },
        range: (start: number, end: number) => db.list({ table, filters, orders, start, end }),
        insert: (input: unknown) => {
          operation = "insert";
          values = input;
          return query;
        },
        update: (input: unknown) => {
          operation = "update";
          values = input;
          return query;
        },
        maybeSingle: () => db.lookup(filters["id"]),
        single: () => (operation === "insert" ? db.save(values) : db.update(values, filters)),
      };
      return query;
    },
    storage: {
      from: (bucket: string) => {
        db.storageBucket(bucket);
        return { upload: db.upload, remove: db.remove, createSignedUrl: db.signedUrl };
      },
    },
  }),
}));

function message(overrides: Partial<PracticeMessage> = {}): PracticeMessage {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    session_number: 3,
    author_id: "11111111-1111-4111-8111-111111111111",
    author_name: "테스트 수강생",
    author_role: "student",
    body: "실습 결과입니다.",
    parent_id: null,
    links: [],
    attachments: [],
    is_pinned: false,
    created_at: "2026-11-08T04:00:00Z",
    updated_at: "2026-11-08T04:00:00Z",
    deleted_at: null,
    ...overrides,
  };
}

function draft(overrides: Partial<PracticeDraft> = {}): PracticeDraft {
  return {
    id: message().id,
    sessionNumber: 3,
    userId: message().author_id,
    fingerprint: "same-draft",
    uploaded: [],
    attemptedInsert: false,
    ...overrides,
  };
}

function attachment(overrides: Partial<PracticeAttachment> = {}): PracticeAttachment {
  const id = "55555555-5555-4555-8555-555555555555";
  return {
    id,
    path: `${message().author_id}/3/${message().id}/${id}.pdf`,
    name: "실습.pdf",
    size: 256,
    mime: "application/pdf",
    kind: "file",
    ...overrides,
  };
}

beforeEach(() => {
  vi.stubGlobal("crypto", webcrypto);
  db.list.mockReset().mockResolvedValue({ data: [], error: null });
  db.lookup.mockReset().mockResolvedValue({ data: null, error: null });
  db.save.mockReset().mockImplementation(async (input) => ({ data: message(input), error: null }));
  db.update.mockReset().mockImplementation(async (input, filters) => ({
    data: message({ ...input, id: filters.id }),
    error: null,
  }));
  db.upload.mockReset().mockResolvedValue({ data: {}, error: null });
  db.remove.mockReset().mockResolvedValue({ data: [], error: null });
  db.signedUrl
    .mockReset()
    .mockResolvedValue({ data: { signedUrl: "https://files.example.test/signed" }, error: null });
  db.storageBucket.mockClear();
});
afterEach(() => vi.unstubAllGlobals());

describe("Practice input and safe link extraction", () => {
  it("deduplicates normalized links, trims sentence punctuation, and keeps balanced parentheses in URLs", () => {
    expect(
      extractPracticeLinks(
        "자료 https://EXAMPLE.com/scene.\n다시 (https://example.com/scene)\n설명 https://example.org/Guide_(Design).",
      ),
    ).toEqual([
      { url: "https://example.com/scene" },
      { url: "https://example.org/Guide_(Design)" },
    ]);
  });

  it("never makes script, data, or credential-bearing URLs into resource links", () => {
    expect(
      extractPracticeLinks(
        "javascript:alert(1) data:text/html,hello https://user:password@example.com/private https://safe.example.test/view",
      ),
    ).toEqual([{ url: "https://safe.example.test/view" }]);
    expect(() =>
      preparePracticeInput({ body: "", files: [], links: [{ url: "javascript:alert(1)" }] }),
    ).toThrow();
    expect(() =>
      preparePracticeInput({
        body: "",
        files: [],
        links: [{ url: "https://name:secret@example.com" }],
      }),
    ).toThrow();
    expect(db.save).not.toHaveBeenCalled();
  });

  it("keeps explicit links editable in the body without appending the same URL twice", () => {
    const prepared = preparePracticeInput({
      body: "시안 https://example.test/one",
      files: [],
      links: [{ url: "https://example.test/one" }, { url: "https://example.test/two" }],
    });
    expect(prepared.body).toBe("시안 https://example.test/one\nhttps://example.test/two");
    expect(prepared.links).toHaveLength(2);
    expect(practiceFingerprint(prepared)).toBe(
      practiceFingerprint(preparePracticeInput({ body: prepared.body, files: [] })),
    );
  });

  it("allows file-only posts and rejects empty posts, excessive body text, or more than ten unique links", () => {
    const file = new File(["example"], "결과.txt", { type: "text/plain" });
    expect(preparePracticeInput({ body: "", files: [file] }).files).toEqual([file]);
    expect(() => preparePracticeInput({ body: "  \n  ", files: [] })).toThrow(/내용이나 링크/);
    expect(() => preparePracticeInput({ body: "가".repeat(20_001), files: [] })).toThrow(/20,000/);
    expect(() =>
      preparePracticeInput({
        body: Array.from({ length: 11 }, (_, i) => `https://example.test/${i}`).join("\n"),
        files: [],
      }),
    ).toThrow(/10개/);
  });

  it("checks file count, size, and format before any upload starts", () => {
    const pdf = new File(["pdf"], "결과.pdf", { type: "application/pdf" });
    const oversized = new File(["x"], "큰파일.zip", { type: "application/zip" });
    Object.defineProperty(oversized, "size", { value: 10 * 1024 * 1024 + 1 });
    expect(() => preparePracticeInput({ body: "", files: Array(6).fill(pdf) })).toThrow(/5개/);
    expect(() => preparePracticeInput({ body: "", files: [oversized] })).toThrow(/10MB/);
    expect(() =>
      preparePracticeInput({
        body: "",
        files: [new File(["x"], "시안.pdf", { type: "image/png" })],
      }),
    ).toThrow(/형식이 일치/);
    expect(() =>
      preparePracticeInput({
        body: "",
        files: [new File(["x"], "실행.html", { type: "text/html" })],
      }),
    ).toThrow();
    expect(db.upload).not.toHaveBeenCalled();
  });
});

describe("Stored practice history", () => {
  it("returns all 1,005 records from the requested session with stable ordering", async () => {
    const rows = Array.from({ length: 1_005 }, (_, index) =>
      message({ id: `post-${String(index).padStart(4, "0")}` }),
    );
    db.list.mockImplementation(async ({ start, end }) => ({
      data: rows.slice(start, end + 1),
      error: null,
    }));
    const result = await listPracticeMessages(3);
    expect(result).toHaveLength(1_005);
    expect(new Set(result.map((entry) => entry.id)).size).toBe(1_005);
    expect(db.list.mock.calls.map(([query]) => [query.start, query.end])).toEqual([
      [0, 499],
      [500, 999],
      [1_000, 1_499],
    ]);
    for (const [query] of db.list.mock.calls) {
      expect(query.table).toBe(PRACTICE_TABLE);
      expect(query.filters).toEqual({ session_number: 3 });
      expect(query.orders).toEqual([
        ["created_at", { ascending: true }],
        ["id", { ascending: true }],
      ]);
    }
  });

  it("reports a later page failure instead of presenting partial history as complete", async () => {
    db.list
      .mockResolvedValueOnce({ data: Array.from({ length: 500 }, () => message()), error: null })
      .mockResolvedValueOnce({ data: null, error: new Error("history unavailable") });
    await expect(listPracticeMessages(3)).rejects.toThrow("history unavailable");
  });

  it("constrains edits to the selected session and treats a rejected update as a failure", async () => {
    await editPracticeMessage(message().id, 3, "수정 내용 https://example.test/updated");
    expect(db.update).toHaveBeenCalledWith(
      {
        body: "수정 내용 https://example.test/updated",
        links: [{ url: "https://example.test/updated" }],
      },
      { id: message().id, session_number: 3, deleted_at: null },
    );
    db.update.mockResolvedValueOnce({ data: null, error: { code: "42501" } });
    await expect(editPracticeMessage(message().id, 3, "다른 학생 수정 시도")).rejects.toThrow(
      /수정하지 못했습니다/,
    );
  });
});

describe("Upload and message retry integrity", () => {
  it("confirms a committed tombstone after a lost update response and still removes the original files", async () => {
    const file = attachment();
    const original = message({ attachments: [file] });
    const deleted = message({ body: "", deleted_at: "2026-11-08T05:00:00Z" });
    db.lookup
      .mockResolvedValueOnce({ data: original, error: null })
      .mockResolvedValueOnce({ data: deleted, error: null });
    db.update.mockResolvedValueOnce({ data: null, error: { message: "response lost" } });

    await expect(deletePracticeMessage(original.id, 3)).resolves.toEqual(deleted);
    expect(db.update).toHaveBeenCalledTimes(1);
    expect(db.remove).toHaveBeenCalledWith([file.path]);
  });

  it("treats deleting an existing tombstone as a successful idempotent retry", async () => {
    const deleted = message({ body: "", deleted_at: "2026-11-08T05:00:00Z" });
    db.lookup.mockResolvedValueOnce({ data: deleted, error: null });

    await expect(deletePracticeMessage(deleted.id, 3)).resolves.toEqual(deleted);
    expect(db.update).not.toHaveBeenCalled();
    expect(db.remove).not.toHaveBeenCalled();
  });

  it("returns the stored message when the insert response was lost and does not insert it again", async () => {
    const input = preparePracticeInput({ body: "공유한 글", files: [] });
    const pending = draft();
    const stored = message({ body: input.body });
    db.save.mockResolvedValue({ data: null, error: { message: "response lost" } });
    db.lookup.mockResolvedValue({ data: stored, error: null });

    expect(await savePracticeMessage(pending, input)).toEqual(stored);
    expect(await savePracticeMessage(pending, input)).toEqual(stored);
    expect(db.save).toHaveBeenCalledTimes(1);
    expect(db.save.mock.calls[0]![0].id).toBe(pending.id);
  });

  it("reuses the original UUID when both the first response and confirmation query fail", async () => {
    const input = preparePracticeInput({ body: "연결 복구 후 확인", files: [] });
    const pending = draft();
    db.save.mockResolvedValueOnce({ data: null, error: { message: "network unavailable" } });
    db.lookup.mockResolvedValueOnce({ data: null, error: { message: "network unavailable" } });
    await expect(savePracticeMessage(pending, input)).rejects.toThrow(
      /공유 결과를 확인하지 못했습니다/,
    );
    expect(pending.attemptedInsert).toBe(true);

    db.lookup.mockResolvedValueOnce({ data: message({ body: input.body }), error: null });
    await expect(savePracticeMessage(pending, input)).resolves.toMatchObject({
      id: pending.id,
      body: input.body,
    });
    expect(db.save).toHaveBeenCalledTimes(1);
  });

  it("uploads files under the author/session/message path and reuses confirmed uploads on retry", async () => {
    const file = new File(["image"], "시안.jpeg", { type: "image/jpeg" });
    const input = preparePracticeInput({ body: "시안", files: [file] });
    const pending = draft();
    db.save.mockResolvedValueOnce({ data: null, error: { message: "temporary outage" } });
    await expect(savePracticeMessage(pending, input)).rejects.toThrow();
    expect(pending.uploaded).toHaveLength(1);
    const uploaded = pending.uploaded[0]!;
    expect(uploaded.path).toBe(`${pending.userId}/3/${pending.id}/${uploaded.id}.jpg`);
    expect(uploaded.mime).toBe("image/jpeg");
    expect(uploaded.kind).toBe("image");
    expect(db.upload).toHaveBeenCalledWith(
      uploaded.path,
      expect.objectContaining({ size: file.size, type: "image/jpeg" }),
      { contentType: "image/jpeg", upsert: false, cacheControl: "3600" },
    );

    await expect(savePracticeMessage(pending, input)).resolves.toMatchObject({
      id: pending.id,
      attachments: [uploaded],
    });
    expect(db.upload).toHaveBeenCalledTimes(1);
    expect(db.save.mock.calls.map(([value]) => value.id)).toEqual([pending.id, pending.id]);
    expect(db.storageBucket.mock.calls.every(([bucket]) => bucket === PRACTICE_BUCKET)).toBe(true);
  });

  it.each([
    ["archive.zip", "application/x-zip-compressed", "application/zip"],
    ["design.psd", "", "image/vnd.adobe.photoshop"],
    ["vector.ai", "application/pdf", "application/postscript"],
  ])(
    "normalizes the uploaded Blob itself for %s so Storage metadata agrees with the saved attachment",
    async (name, browserMime, canonicalMime) => {
      const file = new File(["file contents"], name, { type: browserMime });
      const input = preparePracticeInput({ body: "실습 자료", files: [file] });
      const result = await savePracticeMessage(draft(), input);
      const uploadedBody = db.upload.mock.calls[0]![1] as Blob;
      // storage-js sends a File/Blob in FormData; options.contentType does not rewrite the part's MIME.
      expect(uploadedBody.size).toBe(file.size);
      expect(uploadedBody.type).toBe(canonicalMime);
      expect(result.attachments[0]?.mime).toBe(canonicalMime);
    },
  );

  it("does not publish a partial multi-file post when one upload fails", async () => {
    const input = preparePracticeInput({
      body: "두 파일 함께 공유",
      files: [
        new File(["a"], "a.txt", { type: "text/plain" }),
        new File(["b"], "b.txt", { type: "text/plain" }),
      ],
    });
    const pending = draft();
    db.upload
      .mockResolvedValueOnce({ data: {}, error: null })
      .mockResolvedValueOnce({ data: null, error: new Error("upload failed") });
    await expect(savePracticeMessage(pending, input)).rejects.toThrow(/파일을 올리지 못했습니다/);
    expect(db.save).not.toHaveBeenCalled();
    expect(pending.uploaded).toHaveLength(1);
    await savePracticeMessage(pending, input);
    expect(db.upload).toHaveBeenCalledTimes(3);
    expect(db.save).toHaveBeenCalledTimes(1);
    expect(db.save.mock.calls[0]![0].attachments).toHaveLength(2);
  });

  it("confirms text-only uncertain drafts before allowing them to be replaced", async () => {
    const stored = message();
    const pending = draft({ attemptedInsert: true });
    db.lookup.mockResolvedValueOnce({ data: stored, error: null });
    await expect(discardPracticeDraft(pending)).resolves.toEqual(stored);
    expect(db.lookup).toHaveBeenCalledWith(pending.id);
    expect(db.remove).not.toHaveBeenCalled();
  });

  it("never deletes files of a committed or unresolved post", async () => {
    const files = [attachment()];
    const pending = draft({ attemptedInsert: true, uploaded: files });
    db.lookup.mockResolvedValueOnce({ data: message({ attachments: files }), error: null });
    await discardPracticeDraft(pending);
    expect(db.remove).not.toHaveBeenCalled();
    db.lookup.mockResolvedValueOnce({ data: null, error: new Error("cannot confirm") });
    await expect(discardPracticeDraft(pending)).rejects.toThrow("cannot confirm");
    expect(db.remove).not.toHaveBeenCalled();
  });

  it("cleans only unreferenced confirmed uploads after confirming that no post exists", async () => {
    const file = attachment();
    const pending = draft({ uploaded: [file] });
    await discardPracticeDraft(pending);
    expect(db.remove).toHaveBeenCalledWith([file.path]);
    expect(pending.uploaded).toEqual([]);
  });

  it("requests short-lived private URLs on demand without persisting a public file URL", async () => {
    const file = attachment();
    expect(await getPracticeFileUrl(file)).toBe("https://files.example.test/signed");
    expect(db.storageBucket).toHaveBeenCalledWith(PRACTICE_BUCKET);
    expect(db.signedUrl).toHaveBeenCalledWith(file.path, 300, { download: "실습.pdf" });
    expect(db.save).not.toHaveBeenCalled();
    db.signedUrl.mockResolvedValueOnce({ data: null, error: { message: "not authorized" } });
    await expect(getPracticeFileUrl(file)).rejects.toThrow(/파일을 열지 못했습니다/);
  });
});
