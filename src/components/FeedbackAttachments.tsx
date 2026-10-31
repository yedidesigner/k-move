import { useEffect, useRef, useState, type FormEvent } from "react";
import { Download, ExternalLink, FileUp, Link2, Trash2 } from "lucide-react";
import { FeedbackLargeFileDialog } from "@/components/FeedbackLargeFileDialog";
import { getSupabase } from "@/lib/supabase";
import {
  FEEDBACK_FILE_BUCKET,
  FEEDBACK_FILE_LIMIT,
  FEEDBACK_IMAGE_BUCKET,
  FEEDBACK_UPLOAD_ACCEPT,
  feedbackFileSize,
  normalizeFeedbackUrl,
  validateFeedbackUpload,
} from "@/lib/feedback-attachments";

export type FeedbackAttachment = {
  id: string;
  student_id: string;
  week: number;
  kind: "file" | "link";
  title: string;
  object_path: string | null;
  url: string | null;
  mime_type: string | null;
  file_size: number | null;
  created_by: string;
  created_at: string;
};
type Comment = {
  id: string;
  attachment_id: string;
  content: string;
  created_by: string;
  created_at: string;
};
type Props = {
  studentId: string;
  week: number;
  userId: string;
  instructor: boolean;
  onImagesUploaded?: () => void;
  onAssetsChanged?: () => void;
  readOnly?: boolean;
  lockedAssetIds?: readonly string[];
  uploadDisabled?: boolean;
  onUploadBusyChange?: (busy: boolean) => void;
};
const errorText = (error: unknown) =>
  error instanceof Error ? error.message : "요청을 처리하지 못했습니다.";
const actionClass =
  "inline-flex min-h-10 items-center justify-center gap-2 border border-black bg-white px-3 text-xs font-semibold text-black disabled:opacity-50";

export function FeedbackAttachments(props: Props) {
  return (
    <AttachmentContent
      key={`${props.studentId}:${props.week}:${props.userId}:${props.instructor}`}
      {...props}
    />
  );
}

function AttachmentContent({
  studentId,
  week,
  userId,
  instructor,
  onImagesUploaded,
  onAssetsChanged,
  readOnly = false,
  lockedAssetIds = [],
  uploadDisabled = false,
  onUploadBusyChange,
}: Props) {
  const [rows, setRows] = useState<FeedbackAttachment[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [commentDraft, setCommentDraft] = useState<{
    attachmentId: string;
    commentId?: string;
    content: string;
  } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadButton = useRef<HTMLButtonElement>(null);
  const linkInput = useRef<HTMLInputElement>(null);
  const dialogFocusTarget = useRef<"upload" | "link">("upload");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const alive = useRef(true);
  const busyRef = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    (async () => {
      try {
        const db = getSupabase();
        const result = await db
          .from("kmove_feedback_attachments")
          .select(
            "id,student_id,week,kind,title,object_path,url,mime_type,file_size,created_by,created_at",
          )
          .eq("student_id", studentId)
          .eq("week", week)
          .order("created_at", { ascending: true });
        if (result.error) throw result.error;
        const attachments = (result.data ?? []) as FeedbackAttachment[];
        const notes = attachments.length
          ? await db
              .from("kmove_feedback_attachment_comments")
              .select("id,attachment_id,content,created_by,created_at")
              .in(
                "attachment_id",
                attachments.map((row) => row.id),
              )
              .order("created_at", { ascending: true })
          : { data: [], error: null };
        if (notes.error) throw notes.error;
        if (active) {
          setRows(attachments);
          setComments((notes.data ?? []) as Comment[]);
        }
      } catch (e) {
        if (active) setLoadError("첨부 자료를 불러오지 못했습니다. 다시 시도해 주세요.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [studentId, week, revision]);

  function start() {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    return true;
  }
  function finish() {
    busyRef.current = false;
    if (alive.current) setBusy(false);
  }
  function refresh() {
    if (alive.current) setRevision((value) => value + 1);
  }

  function closeLargeFileDialog() {
    setPendingFiles([]);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function upload(files: FileList | File[] | null) {
    if (!files?.length || readOnly || uploadDisabled || busyRef.current) return;
    const chosen = Array.from(files);
    if (chosen.some((file) => file.size > FEEDBACK_FILE_LIMIT)) {
      setError("");
      setNotice("");
      dialogFocusTarget.current = "upload";
      setPendingFiles(chosen);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    if (!start()) return;
    setUploading(true);
    onUploadBusyChange?.(true);
    let saved = 0;
    let savedImages = 0;
    let savedFiles = 0;
    try {
      // Validate the entire mixed selection before uploading any file.
      const selection = Array.from(files).map((file) => ({
        file,
        ...validateFeedbackUpload(file),
      }));
      const db = getSupabase();
      for (const { file, kind, extension, mimeType } of selection) {
        if (!alive.current) break;
        const objectPath = `${studentId}/${String(week).padStart(2, "0")}/${crypto.randomUUID()}.${extension}`;
        const bucket = kind === "image" ? FEEDBACK_IMAGE_BUCKET : FEEDBACK_FILE_BUCKET;
        const stored = await db.storage
          .from(bucket)
          .upload(objectPath, file, { upsert: false, contentType: mimeType });
        if (stored.error) throw stored.error;
        const record =
          kind === "image"
            ? await db.from("kmove_feedback_images").insert({
                student_id: studentId,
                week,
                object_path: objectPath,
                created_by: userId,
              })
            : await db.from("kmove_feedback_attachments").insert({
                student_id: studentId,
                week,
                kind: "file",
                title: file.name,
                object_path: objectPath,
                mime_type: mimeType,
                file_size: file.size,
                created_by: userId,
              });
        if (record.error) {
          const cleanup = await db.storage.from(bucket).remove([objectPath]);
          if (cleanup.error)
            throw new Error("등록에 실패했고 임시 파일 정리가 필요합니다. 강사에게 문의해 주세요.");
          throw record.error;
        }
        saved++;
        if (kind === "image") savedImages++;
        else savedFiles++;
      }
      if (alive.current && saved) setNotice(`과제 ${saved}개를 업로드했습니다.`);
    } catch (e) {
      if (alive.current)
        setError(
          `${saved ? `과제 ${saved}개는 업로드되었습니다. 나머지 ` : ""}과제 업로드 실패: ${errorText(e)}`,
        );
    } finally {
      if (savedFiles) refresh();
      if (saved && alive.current) onAssetsChanged?.();
      if (alive.current) {
        if (savedImages) onImagesUploaded?.();
        setUploading(false);
        onUploadBusyChange?.(false);
      }
      finish();
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function saveLink(event: FormEvent) {
    event.preventDefault();
    if (readOnly || !start()) return;
    try {
      const url = normalizeFeedbackUrl(linkUrl);
      const title = linkTitle.trim() || new URL(url).hostname;
      const result = await getSupabase().from("kmove_feedback_attachments").insert({
        student_id: studentId,
        week,
        kind: "link",
        title,
        url,
        created_by: userId,
      });
      if (result.error) throw result.error;
      if (alive.current) {
        setLinkOpen(false);
        setLinkTitle("");
        setLinkUrl("");
        setNotice("링크를 등록했습니다.");
        refresh();
        onAssetsChanged?.();
      }
    } catch (e) {
      if (alive.current) setError(errorText(e));
    } finally {
      finish();
    }
  }

  async function download(row: FeedbackAttachment) {
    if (!row.object_path || !start()) return;
    try {
      const result = await getSupabase()
        .storage.from(FEEDBACK_FILE_BUCKET)
        .createSignedUrl(row.object_path, 60, { download: row.title });
      if (result.error) throw result.error;
      if (!alive.current) return;
      const anchor = document.createElement("a");
      anchor.href = result.data.signedUrl;
      anchor.download = row.title;
      anchor.rel = "noopener noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch (e) {
      if (alive.current) setError("다운로드 실패: " + errorText(e));
    } finally {
      finish();
    }
  }

  async function remove(row: FeedbackAttachment) {
    if (
      readOnly ||
      lockedAssetIds.includes(row.id) ||
      (!instructor && row.created_by !== userId) ||
      busyRef.current ||
      !window.confirm("이 자료와 연결된 피드백을 삭제할까요?")
    )
      return;
    if (!start()) return;
    try {
      const db = getSupabase();
      const result = await db
        .from("kmove_feedback_attachments")
        .delete()
        .eq("id", row.id)
        .select("id");
      if (result.error) throw result.error;
      if (result.data?.length !== 1) throw new Error("삭제 권한이 없거나 이미 삭제된 자료입니다.");
      refresh();
      if (row.object_path) {
        const removed = await db.storage.from(FEEDBACK_FILE_BUCKET).remove([row.object_path]);
        if (removed.error)
          throw new Error(
            "목록은 삭제됐지만 저장소 파일 정리가 필요합니다. 강사에게 문의해 주세요.",
          );
      }
      if (alive.current) {
        setCommentDraft(null);
        setNotice("자료를 삭제했습니다.");
        onAssetsChanged?.();
      }
    } catch (e) {
      if (alive.current) setError(errorText(e));
    } finally {
      finish();
    }
  }

  async function saveComment(event: FormEvent) {
    event.preventDefault();
    if (readOnly || !instructor || !commentDraft?.content.trim() || !start()) return;
    try {
      const db = getSupabase();
      const result = commentDraft.commentId
        ? await db
            .from("kmove_feedback_attachment_comments")
            .update({ content: commentDraft.content.trim() })
            .eq("id", commentDraft.commentId)
            .select("id")
        : await db
            .from("kmove_feedback_attachment_comments")
            .insert({
              attachment_id: commentDraft.attachmentId,
              content: commentDraft.content.trim(),
              created_by: userId,
            })
            .select("id");
      if (result.error) throw result.error;
      if (result.data?.length !== 1) throw new Error("피드백을 저장하지 못했습니다.");
      if (alive.current) {
        setCommentDraft(null);
        setNotice("피드백을 저장했습니다.");
        refresh();
      }
    } catch (e) {
      if (alive.current) setError(errorText(e));
    } finally {
      finish();
    }
  }

  async function removeComment(id: string) {
    if (
      readOnly ||
      !instructor ||
      busyRef.current ||
      !window.confirm("이 피드백을 삭제할까요?") ||
      !start()
    )
      return;
    try {
      const result = await getSupabase()
        .from("kmove_feedback_attachment_comments")
        .delete()
        .eq("id", id)
        .select("id");
      if (result.error) throw result.error;
      if (result.data?.length !== 1) throw new Error("피드백을 삭제하지 못했습니다.");
      refresh();
    } catch (e) {
      if (alive.current) setError(errorText(e));
    } finally {
      finish();
    }
  }

  return (
    <section aria-label="피드백 자료 제출" className="space-y-4 border-b border-neutral-200 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold">피드백 자료</h4>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            이미지·문서·압축파일을 한 번에 선택해 이 회차에 등록할 수 있습니다.
          </p>
        </div>
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInput}
              type="file"
              multiple
              accept={FEEDBACK_UPLOAD_ACCEPT}
              aria-label="과제 파일 선택"
              aria-describedby="feedback-upload-formats"
              disabled={busy || uploadDisabled}
              className="sr-only"
              onChange={(event) => void upload(event.target.files)}
            />
            <button
              ref={uploadButton}
              type="button"
              disabled={busy || uploadDisabled}
              onClick={() => fileInput.current?.click()}
              className="inline-flex min-h-10 items-center justify-center gap-2 border border-black bg-black px-4 text-xs font-semibold text-white disabled:opacity-50"
            >
              <FileUp className="size-4" aria-hidden="true" />
              {uploading ? "업로드 중…" : "과제 업로드"}
            </button>
            <button
              type="button"
              disabled={busy}
              aria-expanded={linkOpen}
              onClick={() => setLinkOpen((value) => !value)}
              className={actionClass}
            >
              <Link2 className="size-4" aria-hidden="true" />
              링크 추가
            </button>
          </div>
        )}
      </div>
      <p id="feedback-upload-formats" className="text-xs leading-5 text-neutral-500">
        이미지·PDF·ZIP·문서·디자인 원본은 파일당 최대 10MB입니다. 더 큰 파일은 Google Drive에
        업로드한 뒤 링크로 제출해 주세요.
      </p>
      {pendingFiles.length > 0 && (
        <FeedbackLargeFileDialog
          files={pendingFiles.filter((file) => file.size > FEEDBACK_FILE_LIMIT)}
          eligibleCount={pendingFiles.filter((file) => file.size <= FEEDBACK_FILE_LIMIT).length}
          studentId={studentId}
          userId={userId}
          instructor={instructor}
          onClose={closeLargeFileDialog}
          onRegisterLink={() => {
            dialogFocusTarget.current = "link";
            setLinkOpen(true);
            closeLargeFileDialog();
          }}
          onUploadEligible={() => {
            const eligible = pendingFiles.filter((file) => file.size <= FEEDBACK_FILE_LIMIT);
            closeLargeFileDialog();
            void upload(eligible);
          }}
          onAfterClose={() => {
            if (dialogFocusTarget.current === "link") linkInput.current?.focus();
            else uploadButton.current?.focus();
          }}
        />
      )}
      {linkOpen && (
        <form
          onSubmit={(event) => void saveLink(event)}
          className="grid gap-3 border border-neutral-300 p-4"
        >
          <label className="text-xs font-medium">
            링크 제목 <span className="text-neutral-500">(선택)</span>
            <input
              value={linkTitle}
              onChange={(event) => setLinkTitle(event.target.value)}
              maxLength={240}
              placeholder="예: Figma 프로토타입"
              className="mt-1 min-h-10 w-full border border-neutral-300 px-3 text-sm"
            />
          </label>
          <label className="text-xs font-medium">
            URL
            <input
              ref={linkInput}
              type="url"
              required
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              maxLength={2048}
              placeholder="https://"
              className="mt-1 min-h-10 w-full border border-neutral-300 px-3 text-sm"
            />
          </label>
          <p className="text-xs text-neutral-500">
            Figma·Drive 등 원본 서비스에서 강사가 열 수 있는 공유 권한을 설정해 주세요.
          </p>
          <div className="flex gap-2">
            <button disabled={busy} className={actionClass}>
              링크 등록
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setLinkOpen(false)}
              className="min-h-10 px-3 text-xs"
            >
              취소
            </button>
          </div>
        </form>
      )}
      {error && (
        <p role="alert" className="border-l-2 border-black px-3 text-sm">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-xs text-neutral-600">
          {notice}
        </p>
      )}
      {loadError && (
        <div role="alert" className="text-sm">
          <p>{loadError}</p>
          <button type="button" onClick={refresh} className="min-h-10 text-xs underline">
            첨부 자료 다시 불러오기
          </button>
        </div>
      )}
      {loading && <p className="text-xs text-neutral-500">첨부 자료를 불러오는 중…</p>}
      {!loading && !loadError && rows.length > 0 && (
        <ul
          aria-label="첨부 파일과 링크"
          className="divide-y divide-neutral-200 border-t border-neutral-200"
        >
          {rows.map((row) => {
            let safeUrl: string | null = null;
            if (row.url) {
              try {
                safeUrl = normalizeFeedbackUrl(row.url);
              } catch {
                /* Reject unsafe legacy data at render too. */
              }
            }
            const notes = comments.filter((comment) => comment.attachment_id === row.id);
            return (
              <li key={row.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold tracking-wider text-neutral-500">
                      {row.kind === "link" ? "LINK" : "FILE"}
                    </span>
                    <p className="break-all text-sm font-medium">{row.title}</p>
                    {lockedAssetIds.includes(row.id) && (
                      <p className="mt-1 text-xs text-neutral-500">제출된 원본 · 이력 보존</p>
                    )}
                    {row.file_size != null && (
                      <p className="mt-1 text-xs text-neutral-500">
                        {feedbackFileSize(row.file_size)}
                      </p>
                    )}
                    {safeUrl && (
                      <p className="mt-1 break-all text-xs text-neutral-500">
                        {new URL(safeUrl).hostname}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {row.kind === "file" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void download(row)}
                        className="inline-flex min-h-10 items-center gap-1 text-xs underline"
                      >
                        <Download className="size-3.5" aria-hidden="true" />
                        다운로드
                      </button>
                    )}
                    {safeUrl && (
                      <a
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 items-center gap-1 text-xs underline"
                      >
                        링크 열기
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">(새 탭)</span>
                      </a>
                    )}
                    {!readOnly &&
                      !lockedAssetIds.includes(row.id) &&
                      (instructor || row.created_by === userId) && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void remove(row)}
                          aria-label={`${row.title} 삭제`}
                          className="inline-flex min-h-10 items-center gap-1 text-xs text-neutral-500"
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                          삭제
                        </button>
                      )}
                  </div>
                </div>
                {notes.map((comment) => (
                  <div key={comment.id} className="mt-3 border-l-2 border-neutral-300 pl-3">
                    <div className="flex items-center gap-3">
                      <strong className="text-xs">강사 피드백</strong>
                      {instructor && !readOnly && (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            className="min-h-9 text-xs underline"
                            onClick={() =>
                              setCommentDraft({
                                attachmentId: row.id,
                                commentId: comment.id,
                                content: comment.content,
                              })
                            }
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            className="min-h-9 text-xs underline"
                            onClick={() => void removeComment(comment.id)}
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {comment.content}
                    </p>
                  </div>
                ))}
                {instructor && !readOnly && commentDraft?.attachmentId !== row.id && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setCommentDraft({ attachmentId: row.id, content: "" })}
                    className="mt-2 min-h-10 text-xs underline"
                  >
                    피드백 작성
                  </button>
                )}
                {instructor && !readOnly && commentDraft?.attachmentId === row.id && (
                  <form onSubmit={(event) => void saveComment(event)} className="mt-3 space-y-2">
                    <label className="text-xs font-semibold">
                      자료 피드백
                      <textarea
                        required
                        maxLength={3000}
                        value={commentDraft.content}
                        onChange={(event) =>
                          setCommentDraft({ ...commentDraft, content: event.target.value })
                        }
                        rows={3}
                        className="mt-1 w-full border border-neutral-300 p-3 text-sm"
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        disabled={busy || !commentDraft.content.trim()}
                        className={actionClass}
                      >
                        피드백 저장
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setCommentDraft(null)}
                        className="min-h-10 px-3 text-xs"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
