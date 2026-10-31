import { useEditorExitGuard } from "@/lib/editor-exit-guard";
import { useBlocker } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Send } from "lucide-react";
import { FeedbackWorkspace } from "@/components/FeedbackWorkspace";
import {
  listSubmissionDrafts,
  markFeedbackRead,
  saveSubmissionDraft,
  submitAssignment,
  type Assignment,
  type AssignmentTarget,
  type Enrollment,
  type ReviewPublication,
  type Submission,
  type SubmissionAsset,
  type SubmissionDraft,
} from "@/lib/instructor-api";
import { AssetViewer } from "./AssetViewer";
import { PublishedReview } from "./ReviewWorkspace";
import {
  errorMessage,
  formatWorkspaceDate,
  loadWorkspaceAssets,
  type WorkspaceAsset,
} from "./workspace-utils";

type Props = {
  assignment: Assignment;
  student: Enrollment;
  target: AssignmentTarget;
  initialDraft?: SubmissionDraft | undefined;
  submissions: Submission[];
  allSubmissions: Submission[];
  assetRefs: SubmissionAsset[];
  publications: ReviewPublication[];
  onChanged: () => void;
  onDraftSaved?: (draft: SubmissionDraft) => void;
  registerLeaveGuard?: (guard: (() => Promise<boolean>) | null) => void;
};
export function StudentSubmissions(props: Props) {
  return <SubmissionEditor key={`${props.student.user_id}:${props.assignment.id}`} {...props} />;
}

function SubmissionEditor({
  assignment,
  student,
  target,
  initialDraft,
  submissions,
  allSubmissions,
  assetRefs,
  publications,
  onChanged,
  onDraftSaved,
  registerLeaveGuard,
}: Props) {
  const [assets, setAssets] = useState<WorkspaceAsset[]>([]),
    [assetsLoading, setAssetsLoading] = useState(true),
    [revision, setRevision] = useState(0),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [note, setNote] = useState(initialDraft?.note ?? ""),
    [selected, setSelected] = useState<string[]>([
      ...(initialDraft?.image_ids ?? []),
      ...(initialDraft?.attachment_ids ?? []),
    ]),
    [saving, setSaving] = useState(false),
    [submitting, setSubmitting] = useState(false),
    [uploading, setUploading] = useState(false),
    [saveLabel, setSaveLabel] = useState(
      initialDraft ? "작성 중인 내용 불러옴" : "자료와 설명을 모은 뒤 제출해 주세요.",
    ),
    [historyId, setHistoryId] = useState(submissions[0]?.id ?? ""),
    [historyAsset, setHistoryAsset] = useState(""),
    [historyPin, setHistoryPin] = useState(""),
    [publicationId, setPublicationId] = useState(""),
    [feedbackOpen, setFeedbackOpen] = useState(false),
    [readError, setReadError] = useState("");
  const alive = useRef(true),
    draftVersion = useRef(initialDraft?.version ?? 0),
    generation = useRef(0),
    savedGeneration = useRef(0),
    payloadRef = useRef({ note, selected }),
    savingRef = useRef<Promise<boolean> | null>(null),
    failed = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    setAssetsLoading(true);
    void loadWorkspaceAssets(student.student_id, assignment.session_number)
      .then((rows) => {
        if (active) setAssets(rows);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setAssetsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [student.student_id, assignment.session_number, revision]);
  const assetsRef = useRef(assets);
  assetsRef.current = assets;
  const flush = useCallback(
    async (force = false): Promise<boolean> => {
      if (savingRef.current) return savingRef.current;
      if (!force && generation.current === savedGeneration.current) return true;
      const work = (async () => {
        if (alive.current) {
          setSaving(true);
          setSaveLabel("초안 저장 중…");
          setError("");
        }
        failed.current = false;
        let first = true;
        try {
          while (
            alive.current &&
            ((first && force) || generation.current !== savedGeneration.current)
          ) {
            first = false;
            const snapshot = payloadRef.current,
              revision = generation.current;
            const current = assetsRef.current;
            const draft = await saveSubmissionDraft(
              assignment.id,
              {
                note: snapshot.note,
                image_ids: snapshot.selected.filter((id) =>
                  current.some((a) => a.id === id && a.kind === "image"),
                ),
                attachment_ids: snapshot.selected.filter((id) =>
                  current.some((a) => a.id === id && a.kind !== "image"),
                ),
              },
              draftVersion.current,
            );
            draftVersion.current = draft.version;
            savedGeneration.current = revision;
            if (alive.current) onDraftSaved?.(draft);
          }
          if (alive.current) setSaveLabel("초안 저장됨 · 아직 제출되지 않았습니다.");
          return true;
        } catch (e) {
          failed.current = true;
          if (alive.current) {
            setError(
              errorMessage(e) +
                " 작성 내용을 보존했습니다. 다른 창에서 작성 중이라면 내용을 복사하고 다시 열어 주세요.",
            );
            setSaveLabel("초안 저장 실패");
          }
          return false;
        } finally {
          savingRef.current = null;
          if (alive.current) setSaving(false);
        }
      })();
      savingRef.current = work;
      return work;
    },
    [assignment.id, onDraftSaved],
  );
  useEffect(() => {
    registerLeaveGuard?.(() => (uploading || submitting ? Promise.resolve(false) : flush()));
    return () => registerLeaveGuard?.(null);
  }, [flush, registerLeaveGuard, uploading, submitting]);
  useEffect(() => {
    if (assetsLoading || generation.current === savedGeneration.current || failed.current) return;
    const timer = window.setTimeout(() => void flush(), 1000);
    return () => window.clearTimeout(timer);
  }, [note, selected, assetsLoading, flush]);
  useEditorExitGuard(() => (uploading || submitting ? false : flush()));
  useBlocker({
    shouldBlockFn: async () => uploading || submitting || !(await flush()),
    enableBeforeUnload: () =>
      uploading ||
      submitting ||
      generation.current !== savedGeneration.current ||
      Boolean(savingRef.current),
  });

  function change(nextNote: string, nextSelected: string[]) {
    payloadRef.current = { note: nextNote, selected: nextSelected };
    generation.current++;
    setNote(nextNote);
    setSelected(nextSelected);
    setNotice("");
    if (!failed.current) setSaveLabel("초안 저장 대기");
  }
  const foreignSubmissionIds = new Set(
    allSubmissions
      .filter((s) => s.user_id === student.user_id && s.assignment_id !== assignment.id)
      .map((s) => s.id),
  );
  const foreignAssets = new Set(
    assetRefs
      .filter((a) => foreignSubmissionIds.has(a.submission_id))
      .map((a) => a.image_id ?? a.attachment_id),
  );
  const opened = !assignment.opens_at || new Date(assignment.opens_at).getTime() <= Date.now();
  const canSubmit =
    assignment.status === "published" &&
    !target.exempt &&
    opened &&
    (!submissions.length || assignment.allow_resubmit);
  async function submit() {
    if (submitting || uploading || !canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      if (!selected.length) throw new Error("제출할 이미지·파일·링크를 하나 이상 선택해 주세요.");
      if (!(await flush(true))) return;
      const result = await submitAssignment(assignment.id, draftVersion.current);
      if (!alive.current) return;
      setNotice(
        `제출 v${result.version}이 완료되었습니다. 제출한 원본은 이력 보존을 위해 삭제할 수 없습니다.`,
      );
      setHistoryId(result.id);
      setFeedbackOpen(false);
      setPublicationId("");
      const drafts = await listSubmissionDrafts();
      const after = drafts.find(
        (d) => d.assignment_id === assignment.id && d.user_id === student.user_id,
      );
      draftVersion.current = after?.version ?? 0;
      const next = {
        note: after?.note ?? "",
        selected: [...(after?.image_ids ?? []), ...(after?.attachment_ids ?? [])],
      };
      payloadRef.current = next;
      setNote(next.note);
      setSelected(next.selected);
      generation.current = 0;
      savedGeneration.current = 0;
      setSaveLabel("제출 완료");
      onChanged();
    } catch (e) {
      if (alive.current) setError(errorMessage(e));
    } finally {
      if (alive.current) setSubmitting(false);
    }
  }
  const chosenSubmission = submissions.find((s) => s.id === historyId) ?? submissions[0];
  const refs = assetRefs.filter((a) => a.submission_id === chosenSubmission?.id);
  const historyAssets = assets.filter((a) =>
    refs.some((r) => r.image_id === a.id || r.attachment_id === a.id),
  );
  const chosenAsset = historyAssets.find((a) => a.id === historyAsset) ?? historyAssets[0];
  const published = publications
    .filter((p) => p.submission_id === chosenSubmission?.id)
    .sort((a, b) => b.version - a.version);
  const publication = published.find((p) => p.id === publicationId) ?? published[0];
  async function openFeedback() {
    if (!publication) return;
    setFeedbackOpen(true);
    setReadError("");
    try {
      await markFeedbackRead(publication.id);
    } catch {
      if (alive.current)
        setReadError("확인 상태를 저장하지 못했습니다. 피드백 내용은 아래에서 읽을 수 있습니다.");
    }
  }
  return (
    <section className="iw-section" aria-label={`${assignment.title} 제출`}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight">{assignment.title}</h2>
        <p className="iw-muted mt-2">
          {assignment.session_number}회차 · 마감{" "}
          {formatWorkspaceDate(target.due_at ?? assignment.due_at)}
          {target.due_at ? " (개별 마감)" : ""}
        </p>
        {assignment.description && <p className="iw-prewrap mt-4">{assignment.description}</p>}
        {assignment.requirements && (
          <div className="iw-notice">
            <strong className="block mb-1">제출할 내용</strong>
            <p className="whitespace-pre-wrap">{assignment.requirements}</p>
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="iw-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="iw-notice">
          {notice}
        </p>
      )}
      {target.exempt && <p className="iw-notice">이 과제는 제출 면제입니다.</p>}
      {!opened && (
        <p className="iw-notice">
          {formatWorkspaceDate(assignment.opens_at)}부터 제출할 수 있습니다.
        </p>
      )}
      {submissions.length > 0 && !assignment.allow_resubmit && (
        <p className="iw-notice">제출이 완료되었습니다. 이 과제는 추가 제출을 받지 않습니다.</p>
      )}
      {canSubmit && (
        <>
          <details
            className="mb-5 border border-neutral-200 p-4"
            open={assets.length === 0 ? true : undefined}
          >
            <summary className="cursor-pointer text-sm font-semibold">1. 자료 업로드·관리</summary>
            <p className="iw-muted mt-2">
              업로드한 자료는 아래에서 선택한 뒤 ‘제출하기’를 눌러야 최종 제출됩니다.
            </p>
            <div className="mt-3">
              <FeedbackWorkspace
                studentId={student.student_id}
                studentName={student.name}
                week={assignment.session_number}
                userId={student.user_id}
                instructor={false}
                lockedAssetIds={assetRefs
                  .map((row) => row.image_id ?? row.attachment_id)
                  .filter((id): id is string => Boolean(id))}
                onAssetsChanged={() => setRevision((v) => v + 1)}
                onUploadBusyChange={setUploading}
              />
            </div>
          </details>
          <fieldset className="iw-fieldset">
            <legend>2. 제출할 자료 선택</legend>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="iw-muted">같은 회차의 자료 중 이 과제에 제출할 항목만 선택하세요.</p>
              <button
                type="button"
                className="iw-button"
                disabled={assetsLoading || uploading || submitting}
                onClick={() => setRevision((v) => v + 1)}
              >
                목록 새로고침
              </button>
            </div>
            {assetsLoading ? (
              <p className="iw-muted">자료 확인 중…</p>
            ) : assets.length === 0 ? (
              <p className="iw-empty">먼저 이미지·파일을 업로드하거나 링크를 등록해 주세요.</p>
            ) : (
              <div className="iw-asset-list">
                {assets.map((asset) => (
                  <label className="iw-asset-option" key={asset.id}>
                    <input
                      type="checkbox"
                      disabled={foreignAssets.has(asset.id) || submitting}
                      checked={selected.includes(asset.id)}
                      onChange={(e) =>
                        change(
                          note,
                          e.target.checked
                            ? [...selected, asset.id]
                            : selected.filter((id) => id !== asset.id),
                        )
                      }
                    />
                    <span>
                      <strong>{asset.title}</strong>
                      <small className="iw-muted block">
                        {asset.kind === "image"
                          ? "이미지"
                          : asset.kind === "link"
                            ? "링크"
                            : "파일"}{" "}
                        · {formatWorkspaceDate(asset.created_at)}
                        {foreignAssets.has(asset.id) ? " · 다른 과제에 제출된 자료" : ""}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>
          <label className="iw-label">
            3. 제출 설명 · 특히 피드백 받고 싶은 점
            <textarea
              className="iw-input"
              rows={4}
              maxLength={10000}
              value={note}
              disabled={submitting}
              onChange={(e) => change(e.target.value, selected)}
              placeholder="작업 의도와 확인받고 싶은 부분을 적어 주세요."
            />
          </label>
          <div className="iw-sticky-actions mt-4">
            <p className="iw-muted" aria-live="polite">
              {saveLabel}
            </p>
            <div className="flex gap-2">
              <button
                className="iw-button"
                disabled={assetsLoading || saving || submitting || uploading}
                onClick={() => void flush(true)}
              >
                초안 저장
              </button>
              <button
                className="iw-button iw-primary"
                disabled={assetsLoading || submitting || uploading || !selected.length}
                onClick={() => void submit()}
              >
                <Send size={14} />
                {submitting ? "제출 중…" : submissions.length ? "수정본 제출하기" : "제출하기"}
              </button>
            </div>
          </div>
        </>
      )}
      <section className="iw-section">
        <h3 className="iw-section-title">제출 이력과 피드백</h3>
        {!submissions.length ? (
          <p className="iw-empty">아직 최종 제출한 기록이 없습니다.</p>
        ) : (
          <>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <label className="iw-label">
                제출 버전
                <select
                  className="iw-input"
                  value={chosenSubmission?.id ?? ""}
                  onChange={(e) => {
                    setHistoryId(e.target.value);
                    setHistoryAsset("");
                    setFeedbackOpen(false);
                    setPublicationId("");
                  }}
                >
                  {submissions.map((s) => (
                    <option key={s.id} value={s.id}>
                      v{s.version} · {formatWorkspaceDate(s.submitted_at)}
                      {s.late ? " · 지각" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="iw-label">
                제출한 자료
                <select
                  className="iw-input"
                  value={chosenAsset?.id ?? ""}
                  onChange={(e) => setHistoryAsset(e.target.value)}
                >
                  {historyAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {chosenSubmission?.note && (
              <details className="mb-4">
                <summary className="text-sm font-medium cursor-pointer">제출 설명 보기</summary>
                <p className="iw-prewrap mt-2">{chosenSubmission.note}</p>
              </details>
            )}
            {chosenAsset && (
              <div id="student-submission-viewer">
                <AssetViewer
                  key={chosenAsset.id}
                  asset={chosenAsset}
                  pins={feedbackOpen ? (publication?.pins ?? []) : []}
                  activePin={historyPin}
                  onSelectPin={(id) => {
                    setHistoryPin(id);
                    const node = document.getElementById(`published-pin-${publication?.id}-${id}`);
                    node?.scrollIntoView?.({ block: "center" });
                    node?.focus();
                  }}
                />
              </div>
            )}
            <div className="iw-section">
              {publication ? (
                <>
                  <div className="flex flex-wrap items-end gap-3">
                    <label className="iw-label flex-1">
                      공개 피드백 버전
                      <select
                        className="iw-input"
                        value={publication.id}
                        onChange={(e) => {
                          setPublicationId(e.target.value);
                          setFeedbackOpen(false);
                        }}
                      >
                        {published.map((p) => (
                          <option key={p.id} value={p.id}>
                            피드백 v{p.version} · {formatWorkspaceDate(p.published_at)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button className="iw-button iw-primary" onClick={() => void openFeedback()}>
                      <Check size={14} />
                      {feedbackOpen ? "피드백 확인함" : "피드백 열기"}
                    </button>
                  </div>
                  {readError && (
                    <p role="alert" className="iw-error">
                      {readError}
                    </p>
                  )}
                  {feedbackOpen && (
                    <div id="student-published-review" className="mt-4">
                      <PublishedReview
                        publication={publication}
                        assets={historyAssets}
                        onSelectPin={(pin) => {
                          setHistoryAsset(pin.image_id);
                          setHistoryPin(pin.id);
                          window.setTimeout(
                            () =>
                              document
                                .getElementById("student-submission-viewer")
                                ?.scrollIntoView?.({ block: "start" }),
                            0,
                          );
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <p className="iw-empty">강사가 피드백을 공개하면 이곳에서 확인할 수 있습니다.</p>
              )}
            </div>
          </>
        )}
      </section>
    </section>
  );
}
