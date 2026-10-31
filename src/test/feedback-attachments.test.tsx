import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FeedbackAttachments } from "@/components/FeedbackAttachments";
import { FeedbackWorkspace } from "@/components/FeedbackWorkspace";
import {
  FEEDBACK_FILE_BUCKET,
  FEEDBACK_FILE_LIMIT,
  FEEDBACK_IMAGE_BUCKET,
  FEEDBACK_IMAGE_LIMIT,
  FEEDBACK_UPLOAD_ACCEPT,
  normalizeFeedbackUrl,
  validateFeedbackFile,
  validateFeedbackUpload,
} from "@/lib/feedback-attachments";

const state = vi.hoisted(() => ({
  rows: [] as Record<string, unknown>[],
  comments: [] as Record<string, unknown>[],
  images: [] as Record<string, unknown>[],
  pins: [] as Record<string, unknown>[],
  inserted: [] as { table: string; data: Record<string, unknown> }[],
  uploads: [] as { bucket: string; path: string; file: File; options: unknown }[],
  removals: [] as { bucket: string; paths: string[] }[],
  upload: vi.fn(),
  remove: vi.fn(),
  signed: vi.fn(),
  failInsert: false,
  folderError: false,
  folders: [] as Record<string, unknown>[],
  students: [] as Record<string, unknown>[],
  lookups: [] as { table: string; key: string; value: string | number }[],
}));
vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    storage: {
      from: (bucket: string) => ({
        upload: (path: string, file: File, options: unknown) => {
          state.uploads.push({ bucket, path, file, options });
          return state.upload(path, file, options);
        },
        remove: (paths: string[]) => {
          state.removals.push({ bucket, paths });
          return state.remove(paths);
        },
        createSignedUrl: state.signed,
      }),
    },
    from: (table: string) => {
      let op = "select",
        payload: Record<string, unknown> = {},
        id: string | undefined;
      const filters: Record<string, string | number> = {};
      let inFilter: { key: string; values: string[] } | undefined;
      const collection = () => {
        if (table === "kmove_feedback_attachments") return state.rows;
        if (table === "kmove_feedback_attachment_comments") return state.comments;
        if (table === "kmove_feedback_images") return state.images;
        if (table === "kmove_feedback_pins") return state.pins;
        if (table === "kmove_student_drive_folders") return state.folders;
        if (table === "kmove_feedback_students") return state.students;
        throw new Error(`Unexpected table: ${table}`);
      };
      const matchingRows = () =>
        collection().filter(
          (row) =>
            Object.entries(filters).every(([key, value]) => row[key] === value) &&
            (!inFilter || inFilter.values.includes(String(row[inFilter.key]))),
        );
      const query = {
        select: () => query,
        eq: (key: string, value: string | number) => {
          filters[key] = value;
          state.lookups.push({ table, key, value });
          if (key === "id") id = String(value);
          return query;
        },
        in: (key: string, values: string[]) => {
          inFilter = { key, values };
          return query;
        },
        order: async () => ({ data: [...matchingRows()], error: null }),
        maybeSingle: async () =>
          state.folderError
            ? { data: null, error: new Error("offline") }
            : { data: matchingRows()[0] ?? null, error: null },
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
  state.images = [];
  state.pins = [];
  state.inserted = [];
  state.uploads = [];
  state.removals = [];
  state.failInsert = false;
  state.folderError = false;
  state.lookups = [];
  state.students = [{ id: props.studentId, user_id: props.userId }];
  state.folders = [
    {
      user_id: props.userId,
      name: "테스트 수강생",
      assignment_folder_url: "https://drive.google.com/drive/folders/own-folder",
      google_email: "own@example.com",
      sharing_ready: true,
    },
  ];
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

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

describe("feedback submission validation", () => {
  it.each([
    ["draft.JPG", "image/jpeg", "jpg", "image/jpeg"],
    ["draft.JPEG", "", "jpg", "image/jpeg"],
    ["draft.PNG", "application/octet-stream", "png", "image/png"],
    ["draft.webp", "image/webp", "webp", "image/webp"],
  ])(
    "accepts raster image %s and normalizes its storage type",
    (name, type, extension, mimeType) => {
      expect(validateFeedbackUpload({ name: name!, type: type!, size: 100 })).toEqual({
        kind: "image",
        extension,
        mimeType,
      });
    },
  );

  it("enforces image bounds and MIME while keeping design-source files in regular attachments", () => {
    expect(
      validateFeedbackUpload({ name: "a.jpg", size: FEEDBACK_IMAGE_LIMIT, type: "image/jpeg" })
        .kind,
    ).toBe("image");
    expect(() =>
      validateFeedbackUpload({ name: "a.jpg", size: FEEDBACK_IMAGE_LIMIT + 1, type: "image/jpeg" }),
    ).toThrow("10MB");
    expect(() => validateFeedbackUpload({ name: "a.png", size: 0, type: "image/png" })).toThrow(
      "내용이 없는",
    );
    expect(() =>
      validateFeedbackUpload({ name: "a.png", size: 10, type: "application/pdf" }),
    ).toThrow("일치하지");
    expect(() =>
      validateFeedbackUpload({ name: "a".repeat(240) + ".png", size: 10, type: "image/png" }),
    ).toThrow("240자");
    expect(
      validateFeedbackUpload({
        name: "design.PSD",
        size: FEEDBACK_FILE_LIMIT,
        type: "image/vnd.adobe.photoshop",
      }),
    ).toMatchObject({
      kind: "file",
      extension: "psd",
      mimeType: "image/vnd.adobe.photoshop",
    });
    expect(() =>
      validateFeedbackUpload({
        name: "design.zip",
        size: FEEDBACK_FILE_LIMIT + 1,
        type: "application/zip",
      }),
    ).toThrow("10MB");
    for (const name of ["a.exe", "a.html", "a.svg", "a.constructor"])
      expect(() => validateFeedbackUpload({ name, size: 3, type: "" })).toThrow("JPG, JPEG, PNG");
  });

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
    ).toThrow("10MB");
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
  it("uses one picker for JPEG, PDF, and ZIP while refreshing the existing image preview", async () => {
    render(<FeedbackWorkspace {...props} studentName="테스트 수강생" />);
    await settle();
    const picker = screen.getByLabelText("과제 파일 선택");
    expect(document.querySelectorAll('input[type="file"]')).toHaveLength(1);
    expect(picker).toHaveAttribute("accept", FEEDBACK_UPLOAD_ACCEPT);
    expect(picker).toHaveAttribute("multiple");
    expect(screen.getByRole("button", { name: "과제 업로드" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "이미지 업로드" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "파일 첨부" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "링크 추가" })).toBeVisible();

    const files = [
      new File(["image"], "draft.JPEG", { type: "" }),
      new File(["pdf"], "brief.pdf", { type: "application/pdf" }),
      new File(["zip"], "source.zip", { type: "application/zip" }),
    ];
    fireEvent.change(picker, { target: { files } });
    expect(await screen.findByRole("status")).toHaveTextContent("과제 3개를 업로드했습니다.");
    expect(
      await screen.findByRole("img", { name: "테스트 수강생 2주차 이미지 1" }),
    ).toHaveAttribute("src", "https://example.com/signed-download");
    expect(screen.getByText("brief.pdf")).toBeVisible();
    expect(screen.getByText("source.zip")).toBeVisible();
    expect(state.uploads.map((item) => item.bucket)).toEqual([
      FEEDBACK_IMAGE_BUCKET,
      FEEDBACK_FILE_BUCKET,
      FEEDBACK_FILE_BUCKET,
    ]);
    expect(state.uploads[0]).toMatchObject({
      path: expect.stringMatching(/^student-record\/02\/.+\.jpg$/),
      file: files[0],
      options: { upsert: false, contentType: "image/jpeg" },
    });
    expect(state.inserted.map((item) => item.table)).toEqual([
      "kmove_feedback_images",
      "kmove_feedback_attachments",
      "kmove_feedback_attachments",
    ]);
    for (const { data } of state.inserted) {
      expect(data).toMatchObject({
        student_id: props.studentId,
        week: 2,
        created_by: props.userId,
      });
    }
    expect(state.images).toHaveLength(1);
    expect(state.rows).toHaveLength(2);
  });

  it("validates the entire mixed selection before starting any upload", async () => {
    render(<FeedbackAttachments {...props} />);
    await settle();
    fireEvent.change(screen.getByLabelText("과제 파일 선택"), {
      target: {
        files: [
          new File(["image"], "a.png", { type: "image/png" }),
          new File(["invalid"], "b.pdf", { type: "text/html" }),
        ],
      },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("형식이 일치하지 않습니다");
    expect(state.upload).not.toHaveBeenCalled();
    expect(state.inserted).toHaveLength(0);
    expect(screen.getByRole("button", { name: "과제 업로드" })).toBeEnabled();
  });

  it("blocks duplicate uploads and respects a busy image-feedback operation", async () => {
    const pending = deferred<{ error: null }>();
    state.upload.mockReturnValueOnce(pending.promise);
    const onUploadBusyChange = vi.fn();
    const view = render(<FeedbackAttachments {...props} onUploadBusyChange={onUploadBusyChange} />);
    await settle();
    const picker = screen.getByLabelText("과제 파일 선택");
    const files = [new File(["zip"], "a.zip", { type: "application/zip" })];
    fireEvent.change(picker, { target: { files } });
    fireEvent.change(picker, { target: { files } });
    expect(state.upload).toHaveBeenCalledTimes(1);
    expect(picker).toBeDisabled();
    expect(screen.getByRole("button", { name: "업로드 중…" })).toBeDisabled();
    expect(onUploadBusyChange).toHaveBeenCalledWith(true);
    await act(async () => pending.resolve({ error: null }));
    await screen.findByText("a.zip");
    expect(screen.getByRole("button", { name: "과제 업로드" })).toBeEnabled();
    expect(onUploadBusyChange.mock.calls.map((call) => call[0])).toEqual([true, false]);

    view.rerender(<FeedbackAttachments {...props} uploadDisabled />);
    expect(screen.getByLabelText("과제 파일 선택")).toBeDisabled();
    fireEvent.change(screen.getByLabelText("과제 파일 선택"), { target: { files } });
    expect(state.upload).toHaveBeenCalledTimes(1);
  });

  it("stops queued files when the account or week changes during an upload", async () => {
    const pending = deferred<{ error: null }>();
    state.upload.mockReturnValueOnce(pending.promise);
    const oldImagesUploaded = vi.fn();
    const newImagesUploaded = vi.fn();
    const view = render(<FeedbackAttachments {...props} onImagesUploaded={oldImagesUploaded} />);
    await settle();
    fireEvent.change(screen.getByLabelText("과제 파일 선택"), {
      target: {
        files: [
          new File(["image"], "old.png", { type: "image/png" }),
          new File(["pdf"], "queued.pdf", { type: "application/pdf" }),
        ],
      },
    });
    expect(state.upload).toHaveBeenCalledTimes(1);
    view.rerender(
      <FeedbackAttachments
        {...props}
        studentId="other-student"
        userId="other-user"
        week={3}
        onImagesUploaded={newImagesUploaded}
      />,
    );
    await settle();
    await act(async () => pending.resolve({ error: null }));
    expect(state.upload).toHaveBeenCalledTimes(1);
    expect(
      state.inserted.every(
        (item) =>
          item.data["student_id"] === props.studentId && item.data["created_by"] === props.userId,
      ),
    ).toBe(true);
    expect(oldImagesUploaded).not.toHaveBeenCalled();
    expect(newImagesUploaded).not.toHaveBeenCalled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText("queued.pdf")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "과제 업로드" })).toBeEnabled();
  });

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
    fireEvent.change(screen.getByLabelText("과제 파일 선택"), { target: { files: [file] } });
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

  it.each([
    ["a.zip", "application/zip", FEEDBACK_FILE_BUCKET],
    ["a.png", "image/png", FEEDBACK_IMAGE_BUCKET],
  ])(
    "cleans %s from its correct bucket when the database rejects the record",
    async (name, type, bucket) => {
      state.failInsert = true;
      const onImagesUploaded = vi.fn();
      render(<FeedbackAttachments {...props} onImagesUploaded={onImagesUploaded} />);
      await settle();
      fireEvent.change(screen.getByLabelText("과제 파일 선택"), {
        target: { files: [new File(["test"], name!, { type: type! })] },
      });
      expect(await screen.findByRole("alert")).toHaveTextContent("과제 업로드 실패");
      expect(state.removals).toEqual([{ bucket, paths: [state.uploads[0]!.path] }]);
      expect(onImagesUploaded).not.toHaveBeenCalled();
      expect(state.images).toHaveLength(0);
      expect(state.rows).toHaveLength(0);
    },
  );

  it("refreshes both the image preview and files after a partially successful mixed upload", async () => {
    state.upload
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: new Error("offline") });
    render(<FeedbackWorkspace {...props} studentName="테스트 수강생" />);
    await settle();
    fireEvent.change(screen.getByLabelText("과제 파일 선택"), {
      target: {
        files: [
          new File(["image"], "a.webp", { type: "image/webp" }),
          new File(["pdf"], "b.pdf", { type: "application/pdf" }),
          new File(["zip"], "c.zip", { type: "application/zip" }),
        ],
      },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("과제 2개는 업로드되었습니다");
    expect(await screen.findByRole("img", { name: "테스트 수강생 2주차 이미지 1" })).toBeVisible();
    expect(await screen.findByText("b.pdf")).toBeVisible();
    expect(screen.queryByText("c.zip")).not.toBeInTheDocument();
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

function uploadFile(name: string, size: number, type = "application/zip") {
  const file = new File(["test"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("large feedback files", () => {
  it.each([
    ["large.zip", "application/zip"],
    ["large.jpg", "image/jpeg"],
  ])("shows a Drive dialog for %s before any upload", async (name, type) => {
    render(<FeedbackAttachments {...props} />);
    await settle();
    fireEvent.change(screen.getByLabelText("과제 파일 선택"), {
      target: { files: [uploadFile(name!, FEEDBACK_FILE_LIMIT + 1, type)] },
    });
    expect(await screen.findByRole("dialog")).toHaveTextContent(
      "10MB를 넘는 파일은 Google Drive로 제출해 주세요",
    );
    expect(screen.getByRole("list", { name: "10MB 초과 파일" })).toHaveTextContent(name!);
    const folder = await screen.findByRole("link", { name: /본인 과제 폴더 열기/ });
    expect(folder).toHaveAttribute("href", "https://drive.google.com/drive/folders/own-folder");
    expect(state.lookups).toContainEqual({
      table: "kmove_student_drive_folders",
      key: "user_id",
      value: props.userId,
    });
    expect(state.lookups.some((q) => q.table === "kmove_feedback_students")).toBe(false);
    expect(state.upload).not.toHaveBeenCalled();
    expect(state.inserted).toHaveLength(0);
  });

  it("accepts exactly 10MB and requires an explicit choice for smaller files in a mixed selection", async () => {
    render(<FeedbackAttachments {...props} />);
    await settle();
    const small = uploadFile("exact.zip", FEEDBACK_FILE_LIMIT);
    const large = uploadFile("large.zip", FEEDBACK_FILE_LIMIT + 1);
    fireEvent.change(screen.getByLabelText("과제 파일 선택"), {
      target: { files: [small, large] },
    });
    await screen.findByRole("dialog");
    expect(state.upload).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "10MB 이하 파일만 업로드" }));
    expect(await screen.findByRole("status")).toHaveTextContent("과제 1개를 업로드했습니다");
    expect(state.uploads).toHaveLength(1);
    expect(state.uploads[0]?.file).toBe(small);
    expect(state.inserted).toHaveLength(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens and focuses the link form without automatically saving a link", async () => {
    render(<FeedbackAttachments {...props} />);
    await settle();
    fireEvent.change(screen.getByLabelText("과제 파일 선택"), {
      target: { files: [uploadFile("large.zip", FEEDBACK_FILE_LIMIT + 1)] },
    });
    await screen.findByRole("dialog");
    fireEvent.click(screen.getByRole("button", { name: "링크 등록하기" }));
    const input = await screen.findByRole("textbox", { name: "URL" });
    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveValue("");
    expect(state.upload).not.toHaveBeenCalled();
    expect(state.inserted).toHaveLength(0);
  });

  it("resolves the instructor's selected student rather than the instructor account", async () => {
    render(<FeedbackAttachments {...props} userId="instructor-user" instructor />);
    await settle();
    fireEvent.change(screen.getByLabelText("과제 파일 선택"), {
      target: { files: [uploadFile("large.zip", FEEDBACK_FILE_LIMIT + 1)] },
    });
    expect(
      await screen.findByRole("link", { name: /테스트 수강생 과제 폴더 열기/ }),
    ).toHaveAttribute("href", "https://drive.google.com/drive/folders/own-folder");
    expect(state.lookups).toContainEqual({
      table: "kmove_feedback_students",
      key: "id",
      value: props.studentId,
    });
    expect(state.lookups).toContainEqual({
      table: "kmove_student_drive_folders",
      key: "user_id",
      value: props.userId,
    });
    expect(state.lookups).not.toContainEqual({
      table: "kmove_student_drive_folders",
      key: "user_id",
      value: "instructor-user",
    });
  });

  it.each(["missing", "pending", "unsafe", "error"])(
    "does not substitute a shared/root folder when mapping is %s",
    async (mode) => {
      if (mode === "missing") state.folders = [];
      if (mode === "pending") state.folders[0]!["sharing_ready"] = false;
      if (mode === "unsafe") state.folders[0]!["assignment_folder_url"] = "javascript:alert(1)";
      if (mode === "error") state.folderError = true;
      render(<FeedbackAttachments {...props} />);
      await settle();
      fireEvent.change(screen.getByLabelText("과제 파일 선택"), {
        target: { files: [uploadFile("large.zip", FEEDBACK_FILE_LIMIT + 1)] },
      });
      await screen.findByRole("dialog");
      await waitFor(() =>
        expect(screen.queryByText("과제 폴더를 확인하는 중…")).not.toBeInTheDocument(),
      );
      expect(screen.queryByRole("link", { name: /과제 폴더 열기/ })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "링크 등록하기" })).toBeEnabled();
      expect(state.upload).not.toHaveBeenCalled();
      if (mode === "error") {
        state.folderError = false;
        fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
        await screen.findByRole("link", { name: /본인 과제 폴더 열기/ });
      }
    },
  );

  it("clears the large-file dialog on account changes without carrying the old folder link", async () => {
    const view = render(<FeedbackAttachments {...props} />);
    await settle();
    fireEvent.change(screen.getByLabelText("과제 파일 선택"), {
      target: { files: [uploadFile("large.zip", FEEDBACK_FILE_LIMIT + 1)] },
    });
    await screen.findByRole("link", { name: /본인 과제 폴더 열기/ });
    view.rerender(<FeedbackAttachments {...props} userId="other-user" studentId="other-record" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /본인 과제 폴더 열기/ })).not.toBeInTheDocument();
    expect(state.upload).not.toHaveBeenCalled();
  });
});
