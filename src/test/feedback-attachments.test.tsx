import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FeedbackAttachments } from "@/components/FeedbackAttachments";
import {
  FEEDBACK_FILE_LIMIT,
  normalizeFeedbackUrl,
  validateFeedbackFile,
} from "@/lib/feedback-attachments";

const state = vi.hoisted(() => ({
  rows: [] as Record<string, unknown>[],
  comments: [] as Record<string, unknown>[],
  inserted: [] as { table: string; data: Record<string, unknown> }[],
  upload: vi.fn(),
  remove: vi.fn(),
  signed: vi.fn(),
  failInsert: false,
}));
vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    storage: {
      from: () => ({ upload: state.upload, remove: state.remove, createSignedUrl: state.signed }),
    },
    from: (table: string) => {
      let op = "select",
        payload: Record<string, unknown> = {},
        id: string | undefined;
      const collection = () =>
        table === "kmove_feedback_attachments" ? state.rows : state.comments;
      const query = {
        select: () => query,
        eq: (key: string, value: string) => {
          if (key === "id") id = value;
          return query;
        },
        in: () => query,
        order: async () => ({ data: [...collection()], error: null }),
        insert: (data: Record<string, unknown>) => {
          op = "insert";
          payload = data;
          return query;
        },
        update: (data: Record<string, unknown>) => {
          op = "update";
          payload = data;
          return query;
        },
        delete: () => {
          op = "delete";
          return query;
        },
        then: (resolve: (value: unknown) => void) => {
          if (op === "insert") {
            if (state.failInsert) return resolve({ data: null, error: new Error("DB rejected") });
            state.inserted.push({ table, data: payload });
            const row = {
              id: `new-${state.inserted.length}`,
              ...payload,
              created_at: "2026-11-01T00:00:00Z",
            };
            collection().push(row);
            return resolve({ data: [{ id: row.id }], error: null });
          }
          if (op === "update") {
            const row = collection().find((row) => row["id"] === id);
            if (row) Object.assign(row, payload);
            return resolve({ data: row ? [{ id }] : [], error: null });
          }
          if (op === "delete") {
            const index = collection().findIndex((row) => row["id"] === id);
            if (index >= 0) collection().splice(index, 1);
            return resolve({ data: index >= 0 ? [{ id }] : [], error: null });
          }
          return resolve({ data: [...collection()], error: null });
        },
      };
      return query;
    },
  }),
}));
const props = { studentId: "student-record", week: 2, userId: "student-user", instructor: false };
const link = (overrides = {}) => ({
  id: "attachment-1",
  student_id: props.studentId,
  week: 2,
  kind: "link",
  title: "프로토타입",
  url: "https://www.figma.com/design/example",
  object_path: null,
  mime_type: null,
  file_size: null,
  created_by: props.userId,
  created_at: "2026-11-01T00:00:00Z",
  ...overrides,
});
beforeEach(() => {
  state.rows = [];
  state.comments = [];
  state.inserted = [];
  state.failInsert = false;
  state.upload.mockReset().mockResolvedValue({ data: {}, error: null });
  state.remove.mockReset().mockResolvedValue({ data: {}, error: null });
  state.signed
    .mockReset()
    .mockResolvedValue({ data: { signedUrl: "https://example.com/signed-download" }, error: null });
  vi.spyOn(window, "confirm").mockReturnValue(true);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function settle() {
  await waitFor(() =>
    expect(screen.queryByText("첨부 자료를 불러오는 중…")).not.toBeInTheDocument(),
  );
}

describe("feedback submission validation", () => {
  it.each(["pdf", "zip", "txt", "docx", "pptx", "xlsx", "psd", "ai", "fig"])(
    "accepts supported %s with unknown browser MIME",
    (extension) => {
      expect(
        validateFeedbackFile({ name: `design.${extension}`, size: 123, type: "" }).extension,
      ).toBe(extension);
    },
  );
  it("rejects executables, HTML and SVG even with a permitted MIME", () => {
    for (const name of ["a.exe", "a.html", "a.svg", "a.zip.exe"])
      expect(() => validateFeedbackFile({ name, size: 3, type: "application/zip" })).toThrow();
  });
  it("rejects conflicting MIME, empty and oversized files before upload", () => {
    expect(() => validateFeedbackFile({ name: "a.pdf", size: 10, type: "text/html" })).toThrow();
    expect(() =>
      validateFeedbackFile({ name: "a.zip", size: 0, type: "application/zip" }),
    ).toThrow();
    expect(() =>
      validateFeedbackFile({
        name: "a.zip",
        size: FEEDBACK_FILE_LIMIT + 1,
        type: "application/zip",
      }),
    ).toThrow("50MB");
    expect(
      validateFeedbackFile({
        name: "A.ZIP",
        size: FEEDBACK_FILE_LIMIT,
        type: "application/x-zip-compressed",
      }).mimeType,
    ).toBe("application/zip");
  });
  it("only permits web URLs without embedded credentials", () => {
    for (const url of [
      "javascript:alert(1)",
      "data:text/html,hi",
      "file:///tmp/test",
      "https://user:password@example.com",
      "example.com",
    ])
      expect(() => normalizeFeedbackUrl(url)).toThrow();
    expect(normalizeFeedbackUrl(" https://figma.com/design/abc ")).toBe(
      "https://figma.com/design/abc",
    );
  });
});

describe("feedback files and links", () => {
  it("saves a link under the current student/week and opens it safely", async () => {
    render(<FeedbackAttachments {...props} />);
    await settle();
    fireEvent.click(screen.getByRole("button", { name: "링크 추가" }));
    fireEvent.change(screen.getByRole("textbox", { name: /링크 제목/ }), {
      target: { value: "디자인 리뷰" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "URL" }), {
      target: { value: "https://www.figma.com/design/example" },
    });
    fireEvent.click(screen.getByRole("button", { name: "링크 등록" }));
    const target = await screen.findByRole("link", { name: /링크 열기/ });
    expect(target).toHaveAttribute("href", "https://www.figma.com/design/example");
    expect(target).toHaveAttribute("rel", "noopener noreferrer");
    expect(state.inserted[0]).toEqual({
      table: "kmove_feedback_attachments",
      data: {
        student_id: props.studentId,
        week: 2,
        kind: "link",
        title: "디자인 리뷰",
        url: "https://www.figma.com/design/example",
        created_by: props.userId,
      },
    });
    expect(screen.queryByRole("button", { name: "피드백 작성" })).not.toBeInTheDocument();
  });

  it("uploads a ZIP then saves metadata and never renders it inline", async () => {
    render(<FeedbackAttachments {...props} />);
    await settle();
    const file = new File(["fake zip for test"], "portfolio.zip", { type: "application/zip" });
    fireEvent.change(screen.getByLabelText("첨부 파일 선택"), { target: { files: [file] } });
    await screen.findByText("portfolio.zip");
    expect(state.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^student-record\/02\/.+\.zip$/),
      file,
      { upsert: false, contentType: "application/zip" },
    );
    expect(state.inserted[0]!.data).toMatchObject({
      kind: "file",
      title: "portfolio.zip",
      week: 2,
      student_id: props.studentId,
      created_by: props.userId,
      file_size: file.size,
    });
    expect(screen.getByRole("button", { name: "다운로드" })).toBeVisible();
    expect(document.querySelector("iframe")).toBeNull();
    expect(state.signed).not.toHaveBeenCalled();
  });

  it("uses short-lived signed URLs with attachment download filename on demand", async () => {
    state.rows = [
      link({
        kind: "file",
        title: "portfolio.zip",
        object_path: "student-record/02/test.zip",
        url: null,
        file_size: 20,
      }),
    ];
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<FeedbackAttachments {...props} />);
    await settle();
    fireEvent.click(screen.getByRole("button", { name: "다운로드" }));
    await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
    expect(state.signed).toHaveBeenCalledWith("student-record/02/test.zip", 60, {
      download: "portfolio.zip",
    });
  });

  it("cleans uploaded objects when the database rejects their record", async () => {
    state.failInsert = true;
    render(<FeedbackAttachments {...props} />);
    await settle();
    fireEvent.change(screen.getByLabelText("첨부 파일 선택"), {
      target: { files: [new File(["zip"], "a.zip", { type: "application/zip" })] },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("파일 등록 실패");
    expect(state.remove).toHaveBeenCalledWith([expect.stringMatching(/\.zip$/)]);
    expect(state.rows).toHaveLength(0);
  });

  it("shows successful files even if a later upload fails", async () => {
    state.upload
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: new Error("offline") });
    render(<FeedbackAttachments {...props} />);
    await settle();
    fireEvent.change(screen.getByLabelText("첨부 파일 선택"), {
      target: { files: [new File(["a"], "a.zip"), new File(["b"], "b.zip")] },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("1개 파일은 등록되었습니다");
    await screen.findByText("a.zip");
    expect(screen.queryByText("b.zip")).not.toBeInTheDocument();
  });

  it("limits deletion to the creator for students and hides unsafe legacy links", async () => {
    state.rows = [link({ created_by: "instructor-user", url: "javascript:alert(1)" })];
    render(<FeedbackAttachments {...props} />);
    await settle();
    expect(screen.queryByRole("button", { name: "프로토타입 삭제" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /링크 열기/ })).not.toBeInTheDocument();
  });

  it("lets instructors save, edit and delete attachment feedback", async () => {
    state.rows = [link()];
    render(<FeedbackAttachments {...props} userId="instructor-user" instructor />);
    await settle();
    fireEvent.click(screen.getByRole("button", { name: "피드백 작성" }));
    fireEvent.change(screen.getByRole("textbox", { name: "자료 피드백" }), {
      target: { value: "CTA를 더 명확하게 표현해 주세요." },
    });
    fireEvent.click(screen.getByRole("button", { name: "피드백 저장" }));
    await screen.findByText("CTA를 더 명확하게 표현해 주세요.");
    expect(state.inserted[0]).toEqual({
      table: "kmove_feedback_attachment_comments",
      data: {
        attachment_id: "attachment-1",
        content: "CTA를 더 명확하게 표현해 주세요.",
        created_by: "instructor-user",
      },
    });
    fireEvent.click(await screen.findByRole("button", { name: "수정" }));
    fireEvent.change(screen.getByRole("textbox", { name: "자료 피드백" }), {
      target: { value: "수정 확인했습니다." },
    });
    fireEvent.click(screen.getByRole("button", { name: "피드백 저장" }));
    await waitFor(() =>
      expect(screen.queryByRole("textbox", { name: "자료 피드백" })).not.toBeInTheDocument(),
    );
    await screen.findByText("수정 확인했습니다.");
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    await waitFor(() => expect(screen.queryByText("수정 확인했습니다.")).not.toBeInTheDocument());
  });

  it("removes previous account data immediately when the scope changes", async () => {
    state.rows = [link()];
    const { rerender } = render(<FeedbackAttachments {...props} />);
    await settle();
    expect(screen.getByText("프로토타입")).toBeVisible();
    state.rows = [];
    rerender(<FeedbackAttachments {...props} studentId="other-student" userId="other-user" />);
    expect(screen.queryByText("프로토타입")).not.toBeInTheDocument();
    await settle();
  });
});
