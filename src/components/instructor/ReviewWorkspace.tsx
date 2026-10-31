import { useEditorExitGuard } from "@/lib/editor-exit-guard";
import { useBlocker } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Trash2 } from "lucide-react";
import {
  publishReview,
  saveReviewDraft,
  type Assignment,
  type Enrollment,
  type ReviewDraft,
  type ReviewPublication,
  type ReviewPin,
  type Submission,
} from "@/lib/instructor-api";
import { AssetViewer } from "./AssetViewer";
import {
  EMPTY_REVIEW,
  errorMessage,
  formatWorkspaceDate,
  hasReviewContent,
  normalizeReviewContent,
  type ReviewContent,
  type WorkspaceAsset,
} from "./workspace-utils";
import "./workspace.css";

type Props = {
  assignment: Assignment;
  student: Enrollment;
  submission: Submission;
  assets: WorkspaceAsset[];
  initialDraft?: ReviewDraft | undefined;
  publications: ReviewPublication[];
  previous?: { submission: Submission; assets: WorkspaceAsset[] } | undefined;
  onChanged: () => void;
  onDraftSaved?: (draft: ReviewDraft) => void;
  onNext?: () => void;
  registerLeaveGuard?: (guard: (() => Promise<boolean>) | null) => void;
};

export function PublishedReview({
  publication,
  assets = [],
  onSelectPin,
}: {
  publication: ReviewPublication;
  assets?: WorkspaceAsset[];
  onSelectPin?: (pin: ReviewPin) => void;
}) {
  return (
    <div className="iw-readonly">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="iw-badge" data-tone="strong">
          공개 피드백
        </span>
        <span className="iw-muted">{formatWorkspaceDate(publication.published_at)}</span>
        <span className="iw-badge">
          {publication.decision === "changes_requested" ? "수정 요청" : "검토 완료"}
        </span>
      </div>
      {(
        [
          ["좋았던 점", publication.strengths],
          ["개선할 점", publication.improvements],
          ["다음 작업", publication.next_steps],
        ] as const
      ).map(
        ([label, value]) =>
          value && (
            <section key={label} className="mb-4">
              <h4>{label}</h4>
              <p className="iw-prewrap">{value}</p>
            </section>
          ),
      )}
      {publication.pins?.length > 0 && (
        <section>
          <h4>위치별 피드백</h4>
          {publication.pins.map((pin) => (
            <div
              key={pin.id}
              id={`published-pin-${publication.id}-${pin.id}`}
              tabIndex={-1}
              className="iw-pin-card"
            >
              <button
                type="button"
                className="mb-2 block text-xs font-semibold underline disabled:no-underline"
                disabled={!onSelectPin}
                onClick={() => onSelectPin?.(pin)}
              >
                {assets.find((asset) => asset.id === pin.image_id)?.title ?? "이미지"} · 위치{" "}
                {publication.pins
                  .filter((p) => p.image_id === pin.image_id)
                  .findIndex((p) => p.id === pin.id) + 1}
              </button>
              <p className="whitespace-pre-wrap">{pin.content}</p>
            </div>
          ))}
        </section>
      )}
      {Object.values(publication.asset_comments ?? {}).filter(Boolean).length > 0 && (
        <section>
          <h4>자료별 의견</h4>
          {Object.entries(publication.asset_comments)
            .filter(([, v]) => v)
            .map(([id, value]) => (
              <p key={id} className="iw-prewrap mb-2">
                <strong className="block text-xs">
                  {assets.find((asset) => asset.id === id)?.title ?? "첨부 자료"}
                </strong>
                {value}
              </p>
            ))}
        </section>
      )}
    </div>
  );
}

export function ReviewWorkspace(props: Props) {
  return <ReviewEditor key={props.submission.id} {...props} />;
}

function ReviewEditor({
  assignment,
  student,
  submission,
  assets,
  initialDraft,
  publications,
  previous,
  onChanged,
  onDraftSaved,
  onNext,
  registerLeaveGuard,
}: Props) {
  const [content, setContent] = useState<ReviewContent>(() =>
    normalizeReviewContent(initialDraft ?? EMPTY_REVIEW),
  );
  const [version, setVersion] = useState(initialDraft?.version ?? 0),
    [publishedVersion, setPublishedVersion] = useState(initialDraft?.published_version ?? 0);
  const [saveState, setSaveState] = useState<"idle" | "dirty" | "saving" | "saved" | "error">(
      "idle",
    ),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [publishing, setPublishing] = useState(false),
    [selectedAsset, setSelectedAsset] = useState(assets[0]?.id ?? ""),
    [activePin, setActivePin] = useState(""),
    [panel, setPanel] = useState<"asset" | "review">("asset"),
    [compare, setCompare] = useState(false),
    [previousAsset, setPreviousAsset] = useState(previous?.assets[0]?.id ?? "");
  const contentRef = useRef(content),
    versionRef = useRef(version),
    generation = useRef(0),
    savedGeneration = useRef(0),
    alive = useRef(true),
    saving = useRef<Promise<boolean> | null>(null),
    failed = useRef(false),
    editorRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const flush = useCallback(
    async (force = false): Promise<boolean> => {
      if (saving.current) return saving.current;
      if (!force && generation.current === savedGeneration.current) return true;
      const work = (async () => {
        failed.current = false;
        if (alive.current) {
          setSaveState("saving");
          setError("");
        }
        let first = true;
        try {
          while (
            alive.current &&
            ((force && first) || generation.current !== savedGeneration.current)
          ) {
            first = false;
            const snapshot = contentRef.current;
            const revision = generation.current;
            const saved = await saveReviewDraft(submission.id, snapshot, versionRef.current);
            versionRef.current = saved.version;
            savedGeneration.current = revision;
            if (alive.current) {
              setVersion(saved.version);
              onDraftSaved?.(saved);
              setSaveState(generation.current === savedGeneration.current ? "saved" : "saving");
            }
          }
          return true;
        } catch (e) {
          failed.current = true;
          if (alive.current) {
            setError(
              errorMessage(e) +
                " 작성 내용은 화면에 보존되어 있습니다. 다른 창에서 수정했다면 내용을 복사한 뒤 다시 열어 주세요.",
            );
            setSaveState("error");
          }
          return false;
        } finally {
          saving.current = null;
        }
      })();
      saving.current = work;
      return work;
    },
    [submission.id, onDraftSaved],
  );
  useEffect(() => {
    registerLeaveGuard?.(() => (publishing ? Promise.resolve(false) : flush()));
    return () => registerLeaveGuard?.(null);
  }, [flush, registerLeaveGuard, publishing]);
  useEffect(() => {
    if (generation.current === savedGeneration.current || failed.current) return;
    const timer = window.setTimeout(() => void flush(), 1000);
    return () => window.clearTimeout(timer);
  }, [content, flush]);
  useEditorExitGuard(() => (publishing ? false : flush()));
  useBlocker({
    shouldBlockFn: async () => publishing || !(await flush()),
    enableBeforeUnload: () =>
      publishing || generation.current !== savedGeneration.current || Boolean(saving.current),
  });

  function change(next: ReviewContent) {
    contentRef.current = next;
    generation.current++;
    setContent(next);
    if (!failed.current) setSaveState("dirty");
    setNotice("");
  }
  async function publish() {
    if (publishing) return;
    if (content.pins.some((pin) => !pin.content.trim())) {
      setError("내용이 없는 위치 메모를 작성하거나 삭제해 주세요.");
      return;
    }
    if (!hasReviewContent(content)) {
      setError("학생에게 전달할 피드백을 작성해 주세요.");
      return;
    }
    setPublishing(true);
    setError("");
    try {
      if (!(await flush())) return;
      const published = await publishReview(submission.id, versionRef.current);
      if (alive.current) {
        setPublishedVersion(published.version);
        setNotice(`${student.name} 학생의 제출 v${submission.version} 피드백을 공개했습니다.`);
        onChanged();
      }
    } catch (e) {
      if (alive.current) setError(errorMessage(e));
    } finally {
      if (alive.current) setPublishing(false);
    }
  }
  const current = assets.find((asset) => asset.id === selectedAsset) ?? assets[0];
  const prevAsset =
    previous?.assets.find((asset) => asset.id === previousAsset) ?? previous?.assets[0];
  const published = publications
    .filter((row) => row.submission_id === submission.id)
    .sort((a, b) => b.version - a.version);
  const ownPins = current ? content.pins.filter((pin) => pin.image_id === current.id) : [];
  function selectPin(id: string) {
    setActivePin(id);
    setPanel("review");
    window.setTimeout(() => editorRefs.current[id]?.focus(), 0);
  }
  async function next() {
    if (await flush()) onNext?.();
  }
  return (
    <section aria-label={`${student.name} 제출 v${submission.version} 검토`} className="iw-section">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="iw-muted">
            {assignment.session_number.toString().padStart(2, "0")}회차 · {assignment.title}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            {student.name}{" "}
            <span className="ml-2 text-sm font-normal text-neutral-500">
              제출 v{submission.version}
            </span>
          </h2>
          <div className="iw-summary">
            <span>{formatWorkspaceDate(submission.submitted_at)}</span>
            {submission.late && (
              <span className="iw-badge" data-tone="attention">
                지각 제출
              </span>
            )}
            <span className="iw-badge">
              {published.length ? "공개 피드백 있음" : version ? "검토 중" : "검토 대기"}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {version === 0 && (
            <button
              className="iw-button"
              onClick={() => void flush(true)}
              disabled={publishing || saveState === "saving"}
            >
              검토 시작
            </button>
          )}
          {onNext && (
            <button className="iw-button" onClick={() => void next()} disabled={publishing}>
              다음 검토 대상 <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
      {submission.note && (
        <details className="mb-4 border-y border-neutral-200 py-3" open>
          <summary className="cursor-pointer text-sm font-semibold">학생의 제출 설명</summary>
          <p className="iw-prewrap mt-2">{submission.note}</p>
        </details>
      )}
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
      <div className="iw-mobile-tabs iw-tabs" role="tablist" aria-label="검토 화면">
        <button role="tab" aria-selected={panel === "asset"} onClick={() => setPanel("asset")}>
          제출물
        </button>
        <button role="tab" aria-selected={panel === "review"} onClick={() => setPanel("review")}>
          피드백 작성
        </button>
      </div>
      <div className="iw-review-layout">
        <div className={panel !== "asset" ? "iw-panel-hidden" : ""}>
          <div className="mb-4 flex flex-wrap items-end gap-2">
            <label className="iw-label min-w-0 flex-1">
              제출 자료
              <select
                className="iw-input"
                value={current?.id ?? ""}
                onChange={(e) => {
                  setSelectedAsset(e.target.value);
                  setActivePin("");
                }}
              >
                {assets.map((asset, i) => (
                  <option key={asset.id} value={asset.id}>
                    {i + 1}. {asset.title}
                  </option>
                ))}
              </select>
            </label>
            {previous && (
              <button
                className="iw-button"
                aria-pressed={compare}
                onClick={() => setCompare((v) => !v)}
              >
                {compare ? "비교 닫기" : "이전 버전 비교"}
              </button>
            )}
          </div>
          {compare && previous && (
            <div className="mb-5 border border-neutral-200 p-3">
              <label className="iw-label">
                이전 제출 v{previous.submission.version}
                <select
                  className="iw-input"
                  value={prevAsset?.id ?? ""}
                  onChange={(e) => setPreviousAsset(e.target.value)}
                >
                  {previous.assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.title}
                    </option>
                  ))}
                </select>
              </label>
              <p className="iw-muted my-2">
                {formatWorkspaceDate(previous.submission.submitted_at)} · 아래 최신 제출과
                비교하세요.
              </p>
              {prevAsset && <AssetViewer key={prevAsset.id} asset={prevAsset} />}
            </div>
          )}
          {current ? (
            <AssetViewer
              key={current.id}
              asset={current}
              pins={content.pins}
              activePin={activePin}
              onSelectPin={selectPin}
              onAddPin={
                publishing
                  ? undefined
                  : (point) => {
                      const id = crypto.randomUUID();
                      change({
                        ...contentRef.current,
                        pins: [...contentRef.current.pins, { id, ...point, content: "" }],
                      });
                      selectPin(id);
                    }
              }
            />
          ) : (
            <p className="iw-empty">이 제출에 연결된 자료를 불러오지 못했습니다.</p>
          )}
          {current && (
            <label className="iw-label mt-4">
              이 자료에 대한 의견
              <textarea
                className="iw-input"
                rows={3}
                maxLength={5000}
                value={content.asset_comments[current.id] ?? ""}
                disabled={publishing}
                onChange={(e) =>
                  change({
                    ...content,
                    asset_comments: { ...content.asset_comments, [current.id]: e.target.value },
                  })
                }
                placeholder="자료 전체에 대한 의견을 작성하세요."
              />
            </label>
          )}
        </div>
        <div className={`iw-review-panel ${panel !== "review" ? "iw-panel-hidden" : ""}`}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="iw-section-title mb-0">피드백 작성</h3>
            <span className="iw-badge">
              {version > publishedVersion
                ? "비공개 초안"
                : publishedVersion
                  ? "공개본과 동일"
                  : "비공개"}
            </span>
          </div>
          {ownPins.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold">선택한 이미지의 위치 메모</h4>
              {ownPins.map((pin, i) => (
                <div className="iw-pin-card" data-active={activePin === pin.id} key={pin.id}>
                  <div className="mb-2 flex items-center justify-between">
                    <button
                      className="text-xs font-semibold underline"
                      onClick={() => {
                        setActivePin(pin.id);
                        setPanel("asset");
                      }}
                    >
                      위치 {i + 1} 보기
                    </button>
                    <button
                      aria-label={`위치 메모 ${i + 1} 삭제`}
                      disabled={publishing}
                      className="min-h-9 px-2"
                      onClick={() =>
                        change({ ...content, pins: content.pins.filter((p) => p.id !== pin.id) })
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <textarea
                    ref={(node) => {
                      editorRefs.current[pin.id] = node;
                    }}
                    className="iw-input"
                    aria-label={`위치 메모 ${i + 1}`}
                    rows={3}
                    maxLength={3000}
                    value={pin.content}
                    disabled={publishing}
                    onFocus={() => setActivePin(pin.id)}
                    onChange={(e) =>
                      change({
                        ...content,
                        pins: content.pins.map((p) =>
                          p.id === pin.id ? { ...p, content: e.target.value } : p,
                        ),
                      })
                    }
                  />
                </div>
              ))}
            </div>
          )}
          {(
            [
              ["strengths", "좋았던 점", "유지하면 좋은 설계와 표현을 구체적으로 알려 주세요."],
              ["improvements", "개선할 점", "관찰한 문제와 그 이유를 설명해 주세요."],
              ["next_steps", "다음 작업", "학생이 실행할 다음 작업을 안내해 주세요."],
            ] as const
          ).map(([key, label, placeholder]) => (
            <label key={key} className="iw-label">
              {label}
              <textarea
                className="iw-input"
                rows={4}
                maxLength={10000}
                placeholder={placeholder}
                value={content[key]}
                disabled={publishing}
                onChange={(e) => change({ ...content, [key]: e.target.value })}
              />
            </label>
          ))}
          <label className="iw-label">
            검토 결과
            <select
              className="iw-input"
              value={content.decision}
              disabled={publishing}
              onChange={(e) =>
                change({ ...content, decision: e.target.value as ReviewContent["decision"] })
              }
            >
              <option value="accepted">검토 완료</option>
              <option value="changes_requested">수정 요청</option>
            </select>
          </label>
          <details className="border-t border-neutral-200 pt-3">
            <summary className="cursor-pointer text-sm font-semibold">강사 전용 메모</summary>
            <label className="iw-label mt-3">
              <small>학생에게 공개되지 않습니다.</small>
              <textarea
                className="iw-input"
                rows={3}
                maxLength={10000}
                value={content.private_note}
                disabled={publishing}
                onChange={(e) => change({ ...content, private_note: e.target.value })}
              />
            </label>
          </details>
          <div className="iw-sticky-actions">
            <p aria-live="polite" className="iw-muted">
              {saveState === "saving"
                ? "저장 중…"
                : saveState === "dirty"
                  ? "저장 대기"
                  : saveState === "saved"
                    ? "초안 저장됨"
                    : saveState === "error"
                      ? "저장 실패"
                      : "작성 내용은 초안으로 저장됩니다."}
            </p>
            <div className="flex gap-2">
              <button
                className="iw-button"
                disabled={publishing || saveState === "saving"}
                onClick={() => void flush()}
              >
                초안 저장
              </button>
              <button
                className="iw-button iw-primary"
                disabled={publishing || !hasReviewContent(content)}
                onClick={() => void publish()}
              >
                <Check size={14} />
                {publishing ? "공개 중…" : "피드백 공개"}
              </button>
            </div>
            <p className="iw-muted w-full">
              공개 대상: {student.name} · 제출 v{submission.version}
            </p>
          </div>
        </div>
      </div>
      {published.length > 0 && (
        <details className="iw-section">
          <summary className="cursor-pointer text-sm font-semibold">
            학생에게 공개된 피드백 · {published.length}개 버전
          </summary>
          <div className="mt-4 grid gap-3">
            {published.map((row) => (
              <PublishedReview
                key={row.id}
                publication={row}
                assets={assets}
                onSelectPin={(pin) => {
                  setSelectedAsset(pin.image_id);
                  setActivePin(pin.id);
                  setPanel("asset");
                }}
              />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
