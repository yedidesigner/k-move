import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useBlocker } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Check, Eye, Plus, Save, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { GLOSSARY } from "@/data/glossary";
import { STUDY_GUIDES } from "@/data/study-materials";
import { SESSIONS, seoulToday } from "@/data/schedule";
import { TOPICS } from "@/data/design-sources";
import { DesignGuideContent } from "@/components/StudyMaterials";
import {
  listContentDrafts,
  listContentPublications,
  latestPublications,
  saveContentDraft,
  publishContent,
  cancelContentSchedule,
  type ContentDraft,
  type ContentPublication,
} from "@/lib/instructor-api";
import {
  currentPublishedSession,
  initialContent,
  isDocument,
  linesValue,
  mergeGlossary,
  mergeGuides,
  safeContentUrl,
  textValue,
  validateContent,
  type ContentDocument,
  type ContentKind,
} from "@/lib/content-model";
import { usePublishedContent } from "@/lib/published-content";
import { useEditorExitGuard } from "@/lib/editor-exit-guard";

const KINDS: { value: ContentKind; label: string }[] = [
  { value: "glossary", label: "용어집" },
  { value: "guide", label: "학습자료" },
  { value: "path", label: "주제별 이어 배우기" },
  { value: "announcement", label: "공지" },
];
const inputClass =
  "min-h-11 w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-offset-2 focus:outline-2 focus:outline-black disabled:opacity-60";
const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100 disabled:opacity-40";
const primaryClass = `${buttonClass} border-black bg-black text-white hover:bg-neutral-800`;

function errorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return /conflict|version|stale/i.test(message)
    ? "다른 화면에서 내용이 변경되었습니다. 작성 내용을 복사해 보관한 뒤 최신 내용을 다시 불러와 주세요."
    : `저장하지 못했습니다. 작성 내용은 그대로 유지됩니다. (${message})`;
}
function Field({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
  hint,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
  hint?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
        {required && <span className="ml-1 text-neutral-500">*</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={4}
          maxLength={30000}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} leading-7`}
        />
      ) : (
        <input
          id={id}
          type={type}
          maxLength={2000}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
      {hint && <p className="text-xs leading-5 text-neutral-500">{hint}</p>}
    </div>
  );
}
function EditorGroup({
  title,
  children,
  open = false,
}: {
  title: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="border-t border-neutral-200 py-4">
      <summary className="cursor-pointer py-2 text-base font-semibold">{title}</summary>
      <div className="mt-4 space-y-5">{children}</div>
    </details>
  );
}

function OrderedChoice({
  label,
  value,
  choices,
  onChange,
}: {
  label: string;
  value: string[];
  choices: { id: string; title: string }[];
  onChange: (value: string[]) => void;
}) {
  const id = useId();
  function move(index: number, delta: number) {
    const next = [...value];
    const other = index + delta;
    if (!next[index] || other < 0 || other >= next.length) return;
    [next[index], next[other]] = [next[other]!, next[index]!];
    onChange(next);
  }
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      <select
        id={id}
        value=""
        onChange={(event) => {
          if (event.target.value && !value.includes(event.target.value))
            onChange([...value, event.target.value]);
        }}
        className={inputClass}
      >
        <option value="">추가할 항목 선택</option>
        {choices
          .filter((choice) => !value.includes(choice.id))
          .map((choice) => (
            <option key={choice.id} value={choice.id}>
              {choice.title}
            </option>
          ))}
      </select>
      <ol className="mt-2 divide-y divide-neutral-200">
        {value.map((key, index) => (
          <li key={key} className="flex items-center gap-2 py-2">
            <span className="w-6 text-xs text-neutral-500">{index + 1}</span>
            <span className="min-w-0 flex-1 text-sm">
              {choices.find((choice) => choice.id === key)?.title ?? `${key} (현재 비공개)`}
            </span>
            <button
              type="button"
              disabled={index === 0}
              aria-label={`${index + 1}번째 항목 위로`}
              onClick={() => move(index, -1)}
              className="flex size-10 items-center justify-center disabled:opacity-20"
            >
              <ArrowUp size={15} />
            </button>
            <button
              type="button"
              disabled={index === value.length - 1}
              aria-label={`${index + 1}번째 항목 아래로`}
              onClick={() => move(index, 1)}
              className="flex size-10 items-center justify-center disabled:opacity-20"
            >
              <ArrowDown size={15} />
            </button>
            <button
              type="button"
              aria-label={`${index + 1}번째 항목 제거`}
              onClick={() => onChange(value.filter((item) => item !== key))}
              className="flex size-10 items-center justify-center"
            >
              <X size={15} />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ContentFields({
  kind,
  doc,
  setDoc,
}: {
  kind: ContentKind;
  doc: ContentDocument;
  setDoc: (doc: ContentDocument) => void;
}) {
  const { glossary, guides } = usePublishedContent();
  const update = (field: string, value: unknown) => setDoc({ ...doc, [field]: value });
  const field = (
    key: string,
    label: string,
    multiline = false,
    hint?: string,
    required = false,
    type = "text",
  ) => (
    <Field
      key={key}
      label={label}
      value={textValue(doc[key])}
      onChange={(value) => update(key, value)}
      multiline={multiline}
      {...(hint ? { hint } : {})}
      required={required}
      type={type}
    />
  );
  const lines = (key: string, label: string, hint = "한 줄에 하나씩 입력해 주세요.") => (
    <Field
      key={key}
      label={label}
      value={linesValue(doc[key]).join("\n")}
      onChange={(value) => update(key, value.split("\n"))}
      multiline
      hint={hint}
    />
  );
  const topic = (
    <label className="block space-y-2 text-sm font-semibold">
      학습 주제
      <select
        value={textValue(doc["topic"], "foundations")}
        onChange={(event) => update("topic", event.target.value)}
        className={inputClass}
      >
        {TOPICS.map((item) => (
          <option value={item.id} key={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
  const termChoices = glossary.map((term) => ({
    id: term.id,
    title: `${term.english} · ${term.korean}`,
  }));
  const guideChoices = guides.map((guide) => ({ id: guide.id, title: guide.title }));
  if (kind === "session")
    return (
      <>
        <div className="space-y-5">
          {field("title", "수업 제목", false, undefined, true)}
          <div className="grid gap-4 sm:grid-cols-3">
            {field("date", "수업 날짜", false, undefined, true, "date")}
            {field("startTime", "시작 시각", false, "한국 시간", true, "time")}
            {field("endTime", "종료 시각", false, "한국 시간", true, "time")}
          </div>
          <label className="block space-y-2 text-sm font-semibold">
            진행 상태
            <select
              value={textValue(doc["progress"], "scheduled")}
              onChange={(event) => update("progress", event.target.value)}
              className={inputClass}
            >
              <option value="scheduled">수업 예정 / 일정 경과</option>
              <option value="completed">진행 완료</option>
            </select>
          </label>
          {lines("objectives", "학습 목표")}
          {field("body", "수업 안내·진행 순서", true)}
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 size-4"
              checked={doc["keepCurriculum"] !== false}
              onChange={(event) => update("keepCurriculum", event.target.checked)}
            />
            <span>
              기존 상세 커리큘럼도 함께 표시
              <span className="mt-1 block text-xs leading-6 text-neutral-500">
                해제하면 위에서 작성한 안내와 연결 자료만 표시합니다. 원본 커리큘럼은 보존됩니다.
              </span>
            </span>
          </label>
        </div>
        <EditorGroup title="연결할 학습 콘텐츠">
          <OrderedChoice
            label="학습자료"
            value={linesValue(doc["guideIds"])}
            choices={guideChoices}
            onChange={(value) => update("guideIds", value)}
          />
          <OrderedChoice
            label="용어집"
            value={linesValue(doc["termIds"])}
            choices={termChoices}
            onChange={(value) => update("termIds", value)}
          />
        </EditorGroup>
        <EditorGroup title="강사 전용 준비 메모">
          {field(
            "instructorNotes",
            "비공개 메모",
            true,
            "초안에만 보관되며 학생 공개본에는 포함되지 않습니다.",
          )}
        </EditorGroup>
        <p className="border border-neutral-300 bg-neutral-50 p-4 text-xs leading-6">
          수업 날짜를 변경해도 과제 마감과 공개 예약은 자동 변경되지 않습니다. ‘과제·피드백’에서
          관련 마감을 함께 확인해 주세요.
        </p>
      </>
    );
  if (kind === "glossary")
    return (
      <>
        <div className="space-y-5">
          {field("english", "영어 용어", false, undefined, true)}
          <div className="grid gap-4 sm:grid-cols-2">
            {field("pronunciation", "한국어 발음")}
            {field("korean", "한국어 뜻", false, undefined, true)}
          </div>
          {topic}
          {field("description", "정의", true, undefined, true)}
          {field("example", "실제 맥락의 예시", true)}
        </div>
        <EditorGroup title="핵심 구조와 학습 포인트">
          {field("structure", "핵심 구조", true)}
          {field("context", "관찰할 점", true)}
          {field("misconception", "기억할 점·오개념", true)}
          {lines("aliases", "함께 검색할 표현")}
        </EditorGroup>
        <EditorGroup title="예시 이미지와 출처">
          {field(
            "imageUrl",
            "예시 이미지 주소",
            false,
            "HTTPS 이미지 주소. 기존 제작 예시와 실습은 유지됩니다.",
          )}
          {field(
            "imageAlt",
            "이미지 설명",
            true,
            "학생이 이미지에서 무엇을 봐야 하는지 구체적으로 적어 주세요.",
          )}
          {field(
            "imageBasis",
            "이미지 사용 근거",
            true,
            "직접 제작, 사용 허락, 이용 조건 등 확인한 근거를 적어 주세요.",
          )}
          {field("referenceUrl", "참고 링크")}
        </EditorGroup>
      </>
    );
  if (kind === "path")
    return (
      <div className="space-y-5">
        {field("title", "학습 경로 제목", false, undefined, true)}
        {topic}
        {field("description", "학습 순서 안내", true)}
        <OrderedChoice
          label="이어 배울 가이드 순서"
          value={linesValue(doc["guideIds"])}
          choices={guideChoices}
          onChange={(value) => update("guideIds", value)}
        />
      </div>
    );
  if (kind === "announcement")
    return (
      <div className="space-y-5">
        {field("title", "공지 제목", false, undefined, true)}
        <label className="block space-y-2 text-sm font-semibold">
          표시 위치
          <select
            className={inputClass}
            value={Number(doc["sessionNumber"] ?? 0)}
            onChange={(event) => update("sessionNumber", Number(event.target.value) || null)}
          >
            <option value={0}>과정 전체 · 홈</option>
            {SESSIONS.map((session) => (
              <option value={session.number} key={session.id}>
                {String(session.number).padStart(2, "0")}회차
              </option>
            ))}
          </select>
        </label>
        {field("body", "공지 내용", true, undefined, true)}
      </div>
    );
  const decision = isDocument(doc["decision"]) ? doc["decision"] : {};
  const exercise = isDocument(doc["exercise"]) ? doc["exercise"] : {};
  const sections = Array.isArray(doc["sections"]) ? doc["sections"].filter(isDocument) : [];
  const references = Array.isArray(doc["references"]) ? doc["references"].filter(isDocument) : [];
  const changeSection = (index: number, field: string, value: unknown) =>
    update(
      "sections",
      sections.map((section, i) => (i === index ? { ...section, [field]: value } : section)),
    );
  return (
    <>
      <div className="space-y-5">
        {field("title", "가이드 제목", false, undefined, true)}
        {topic}
        {field("category", "분류 이름")}
        {field("summary", "한 문장 요약", true, undefined, true)}
        {field("intro", "개념 이해 · 시작 설명", true, undefined, true)}
        {lines("objectives", "학습 목표")}
      </div>
      <EditorGroup title="본문 구성" open>
        {sections.map((section, index) => (
          <fieldset key={index} className="space-y-4 border border-neutral-200 p-4">
            <legend className="px-2 text-sm font-semibold">본문 {index + 1}</legend>
            <Field
              label="소제목"
              value={textValue(section["title"])}
              onChange={(value) => changeSection(index, "title", value)}
            />
            <Field
              label="본문 설명"
              value={textValue(section["body"])}
              onChange={(value) => changeSection(index, "body", value)}
              multiline
            />
            <Field
              label="핵심 항목 · 한 줄에 하나"
              value={linesValue(section["bullets"]).join("\n")}
              onChange={(value) => changeSection(index, "bullets", value.split("\n"))}
              multiline
            />
            <div className="flex gap-2">
              <button
                type="button"
                className={buttonClass}
                disabled={index === 0}
                onClick={() => {
                  const next = [...sections];
                  [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
                  update("sections", next);
                }}
              >
                위로
              </button>
              <button
                type="button"
                className={buttonClass}
                onClick={() =>
                  update(
                    "sections",
                    sections.filter((_, i) => i !== index),
                  )
                }
              >
                본문 삭제
              </button>
            </div>
          </fieldset>
        ))}
        <button
          type="button"
          className={buttonClass}
          onClick={() => update("sections", [...sections, { title: "", body: "", bullets: [] }])}
        >
          <Plus size={15} />
          본문 추가
        </button>
      </EditorGroup>
      <EditorGroup title="설계 판단">
        {(
          [
            ["context", "상황"],
            ["choice", "설계 선택"],
            ["why", "선택한 이유"],
            ["alternatives", "다른 선택지"],
            ["validation", "확인할 방법"],
          ] as const
        ).map(([key, label]) => (
          <Field
            key={key}
            label={label}
            value={textValue(decision[key])}
            onChange={(value) => update("decision", { ...decision, [key]: value })}
            multiline
          />
        ))}
        {lines("pitfalls", "주의할 오개념")}
      </EditorGroup>
      <EditorGroup title="내 작업에 적용">
        <Field
          label="적용 과제"
          value={textValue(exercise["brief"])}
          onChange={(value) => update("exercise", { ...exercise, brief: value })}
          multiline
        />
        <Field
          label="만들 산출물"
          value={textValue(exercise["deliverable"])}
          onChange={(value) => update("exercise", { ...exercise, deliverable: value })}
          multiline
        />
        <Field
          label="확인 기준 · 한 줄에 하나"
          value={linesValue(exercise["criteria"]).join("\n")}
          onChange={(value) => update("exercise", { ...exercise, criteria: value.split("\n") })}
          multiline
        />
      </EditorGroup>
      <EditorGroup title="연결 용어와 시각 예시">
        <OrderedChoice
          label="관련 용어"
          value={linesValue(doc["relatedTermIds"])}
          choices={termChoices}
          onChange={(value) => update("relatedTermIds", value)}
        />
        <label className="block space-y-2 text-sm font-semibold">
          기존 시각 예시 연결
          <select
            className={inputClass}
            value={textValue(doc["visualTermId"])}
            onChange={(event) => update("visualTermId", event.target.value)}
          >
            <option value="">연결하지 않음</option>
            {termChoices.map((choice) => (
              <option key={choice.id} value={choice.id}>
                {choice.title}
              </option>
            ))}
          </select>
        </label>
      </EditorGroup>
      <EditorGroup title="참고 근거">
        {references.map((ref, index) => (
          <div className="space-y-4 border border-neutral-200 p-4" key={index}>
            {(
              [
                ["title", "자료명"],
                ["location", "참고 위치·페이지"],
                ["note", "참고한 내용"],
                ["url", "참고 링크"],
              ] as const
            ).map(([key, label]) => (
              <Field
                key={key}
                label={label}
                value={textValue(ref[key])}
                onChange={(value) =>
                  update(
                    "references",
                    references.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
                  )
                }
              />
            ))}
            <button
              type="button"
              className={buttonClass}
              onClick={() =>
                update(
                  "references",
                  references.filter((_, i) => i !== index),
                )
              }
            >
              참고 자료 제거
            </button>
          </div>
        ))}
        <button
          type="button"
          className={buttonClass}
          onClick={() =>
            update("references", [...references, { title: "", location: "", note: "", url: "" }])
          }
        >
          참고 자료 추가
        </button>
      </EditorGroup>
    </>
  );
}

function DraftPreview({
  kind,
  contentKey,
  doc,
  hidden,
}: {
  kind: ContentKind;
  contentKey: string;
  doc: ContentDocument;
  hidden: boolean;
}) {
  if (hidden)
    return (
      <p className="border border-neutral-300 p-6 text-sm">
        숨김을 공개하면 학생 목록과 상세 화면에서 이 콘텐츠가 표시되지 않습니다.
      </p>
    );
  const row = {
    kind,
    content_key: contentKey,
    document: doc,
    hidden,
    published_at: new Date().toISOString(),
  };
  if (kind === "guide") {
    const guide = mergeGuides([row]).find((item) => item.id === contentKey);
    return guide ? <DesignGuideContent guide={guide} /> : <p>제목과 내용을 입력해 주세요.</p>;
  }
  if (kind === "glossary") {
    const term = mergeGlossary([row]).find((item) => item.id === contentKey);
    if (!term) return <p>용어를 입력해 주세요.</p>;
    return (
      <article className="space-y-6">
        <header>
          <h3 className="text-3xl font-bold">{term.english}</h3>
          <p className="mt-2 text-sm">
            [{term.pronunciation}] / {term.korean}
          </p>
        </header>
        <p className="whitespace-pre-wrap leading-7">{term.description}</p>
        {term.structure && (
          <section>
            <h4 className="mb-2 font-semibold">핵심 구조</h4>
            <p className="whitespace-pre-wrap text-sm leading-7">{term.structure}</p>
          </section>
        )}
        {term.imageUrl && (
          <figure>
            <img
              src={term.imageUrl}
              alt={term.imageAlt || term.english}
              referrerPolicy="no-referrer"
              className="max-h-96 w-full object-contain"
            />
            <figcaption className="mt-2 text-xs text-neutral-600">{term.imageAlt}</figcaption>
          </figure>
        )}
        <section>
          <h4 className="mb-2 font-semibold">예시</h4>
          <p className="whitespace-pre-wrap text-sm leading-7">{term.example}</p>
        </section>
        {term.context && <p className="whitespace-pre-wrap text-sm leading-7">{term.context}</p>}
        {term.misconception && (
          <section>
            <h4 className="mb-2 font-semibold">기억할 점</h4>
            <p className="whitespace-pre-wrap text-sm leading-7">{term.misconception}</p>
          </section>
        )}
        <p className="border-t pt-4 text-xs text-neutral-500">
          기존 용어의 제작 예시와 직접 해보기는 공개 후에도 유지됩니다.
        </p>
      </article>
    );
  }
  return (
    <article>
      <h3 className="text-2xl font-bold">{textValue(doc["title"])}</h3>
      {kind === "session" && (
        <p className="mt-3 text-sm text-neutral-600">
          {textValue(doc["date"])} · {textValue(doc["startTime"])}–{textValue(doc["endTime"])} ·
          한국 시간
        </p>
      )}
      <p className="mt-5 whitespace-pre-wrap text-sm leading-7">
        {textValue(doc["body"], textValue(doc["description"]))}
      </p>
      {linesValue(doc["objectives"]).length > 0 && (
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm">
          {linesValue(doc["objectives"]).map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
      {kind === "path" && (
        <ol className="mt-4 list-inside list-decimal space-y-2 text-sm">
          {linesValue(doc["guideIds"]).map((id) => (
            <li key={id}>{STUDY_GUIDES.find((guide) => guide.id === id)?.title ?? id}</li>
          ))}
        </ol>
      )}
    </article>
  );
}

export function ContentEditor({
  kind,
  contentKey,
  draft,
  publication,
  onSaved,
  onDirtyChange,
  history = [],
  onPublished,
}: {
  kind: ContentKind;
  contentKey: string;
  draft?: ContentDraft;
  publication?: ContentPublication;
  onSaved: (draft: ContentDraft) => void;
  onDirtyChange: (dirty: boolean, busy?: boolean) => void;
  history?: ContentPublication[];
  onPublished?: () => Promise<void>;
}) {
  const initial = draft?.document ?? publication?.document ?? initialContent(kind, contentKey);
  const [doc, setDoc] = useState<ContentDocument>(initial);
  const [hidden, setHidden] = useState(draft?.hidden ?? publication?.hidden ?? false);
  const [version, setVersion] = useState(draft?.version ?? 0);
  const [saved, setSaved] = useState(
    JSON.stringify({ document: initial, hidden: draft?.hidden ?? publication?.hidden ?? false }),
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [publishAt, setPublishAt] = useState("");
  const mounted = useRef(true);
  const { reload } = usePublishedContent();
  const dirty = saved !== JSON.stringify({ document: doc, hidden });
  useEffect(() => {
    onDirtyChange(dirty, busy);
  }, [dirty, busy, onDirtyChange]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!dirty && !busy) return;
    const block = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", block);
    return () => window.removeEventListener("beforeunload", block);
  }, [dirty, busy]);
  async function persist(shouldPublish: boolean, scheduled = false) {
    if (busy) return;
    const validation = hidden ? null : validateContent(kind, doc);
    if (validation) {
      setError(validation);
      return;
    }
    const scheduledTime = scheduled && publishAt ? new Date(`${publishAt}:00+09:00`) : null;
    if (
      scheduled &&
      (!scheduledTime ||
        Number.isNaN(scheduledTime.getTime()) ||
        scheduledTime.getTime() <= Date.now())
    ) {
      setError("공개할 미래 시각을 한국 시간으로 입력해 주세요.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    let publicationSaved = false;
    try {
      const result = await saveContentDraft(kind, contentKey, { document: doc, hidden }, version);
      if (!mounted.current) return;
      setVersion(result.version);
      setSaved(JSON.stringify({ document: doc, hidden }));
      onSaved(result);
      if (shouldPublish) {
        await publishContent(
          kind,
          contentKey,
          result.version,
          scheduledTime?.toISOString() ?? null,
        );
        publicationSaved = true;
        if (!mounted.current) return;
        onSaved({ ...result, published_version: result.version });
        await reload();
        await onPublished?.();
      }
      if (mounted.current)
        setMessage(
          shouldPublish
            ? scheduled
              ? "공개를 예약했습니다. 예약 시각 전까지 기존 공개 내용이 유지됩니다."
              : hidden
                ? "학생 화면에서 숨겼습니다."
                : "학생에게 공개했습니다."
            : "비공개 초안을 저장했습니다.",
        );
    } catch (cause) {
      if (mounted.current)
        setError(
          publicationSaved
            ? "공개 처리는 완료됐지만 최신 목록을 불러오지 못했습니다. 다시 공개하지 말고 화면을 새로고침해 확인해 주세요."
            : errorMessage(cause),
        );
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  async function cancelSchedule(id: string) {
    if (busy || !window.confirm("이 공개 예약을 취소할까요? 현재 공개본은 유지됩니다.")) return;
    setBusy(true);
    setError("");
    try {
      await cancelContentSchedule(id);
      const current = (await listContentDrafts()).find(
        (item) => item.kind === kind && item.content_key === contentKey,
      );
      if (mounted.current && current) {
        setVersion(current.version);
        onSaved(current);
      }
      await onPublished?.();
      if (mounted.current) setMessage("공개 예약을 취소했습니다. 현재 작성 내용은 유지됩니다.");
    } catch (cause) {
      if (mounted.current) setError(errorMessage(cause));
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <section className="min-w-0 border border-neutral-200 bg-white" aria-label="콘텐츠 편집">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 p-5">
        <div>
          <p className="text-xs text-neutral-500">
            {kind === "session" ? `${Number(contentKey.replace("S", ""))}회차` : "강사 편집"} · 초안
            v{version}
          </p>
          <h2 className="mt-1 text-lg font-bold">
            {kind === "glossary"
              ? textValue(doc["english"]) || "새 용어"
              : textValue(doc["title"]) || "새 콘텐츠"}
          </h2>
        </div>
        <button type="button" className={buttonClass} onClick={() => setPreview((value) => !value)}>
          <Eye size={15} />
          {preview ? "편집으로 돌아가기" : "초안 미리보기"}
        </button>
      </header>
      <div className="space-y-5 p-5 sm:p-6">
        <p className="text-xs leading-6 text-neutral-500">
          초안은 강사에게만 보입니다. ‘학생에게 공개’를 눌러야 학습 화면에 반영됩니다.
        </p>
        {preview ? (
          <div className="border border-neutral-200 p-5">
            <p className="mb-5 text-xs font-semibold text-neutral-500">
              초안 미리보기 · 아직 공개되지 않음
            </p>
            <DraftPreview kind={kind} contentKey={contentKey} doc={doc} hidden={hidden} />
          </div>
        ) : (
          <fieldset disabled={busy} className="space-y-5">
            <ContentFields kind={kind} doc={doc} setDoc={setDoc} />
          </fieldset>
        )}
        <label className="flex items-start gap-3 border-t border-neutral-200 pt-5 text-sm">
          <input
            type="checkbox"
            className="mt-1 size-4"
            checked={hidden}
            disabled={busy}
            onChange={(event) => setHidden(event.target.checked)}
          />
          <span>
            학생 화면에서 숨기기
            <span className="mt-1 block text-xs leading-6 text-neutral-500">
              체크한 뒤 공개 버튼을 누르면 적용됩니다. 초안과 이전 공개 기록은 보존됩니다.
            </span>
          </span>
        </label>
        <details className="border-t border-neutral-200 pt-4">
          <summary className="cursor-pointer py-2 text-sm font-semibold">
            공개 예약과 이전 버전
          </summary>
          <div className="mt-4 space-y-4">
            <Field
              label="공개 예약 시각"
              type="datetime-local"
              value={publishAt}
              onChange={setPublishAt}
              hint="한국 시간 기준입니다. 예약 전까지 학생은 현재 공개된 내용을 봅니다."
            />
            <button
              type="button"
              disabled={busy || !publishAt}
              className={buttonClass}
              onClick={() => void persist(true, true)}
            >
              이 내용으로 공개 예약
            </button>
            <ul className="divide-y divide-neutral-200">
              {[...history]
                .sort((a, b) => b.published_at.localeCompare(a.published_at))
                .slice(0, 12)
                .map((item) => {
                  const future = new Date(item.published_at).getTime() > Date.now();
                  return (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs"
                    >
                      <span>
                        v{item.version} ·{" "}
                        {new Intl.DateTimeFormat("ko-KR", {
                          timeZone: "Asia/Seoul",
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(new Date(item.published_at))}{" "}
                        ·{" "}
                        {item.cancelled_at
                          ? "예약 취소"
                          : future
                            ? "공개 예약"
                            : item.hidden
                              ? "숨김"
                              : "공개본"}
                      </span>
                      {future && !item.cancelled_at ? (
                        <button
                          type="button"
                          disabled={busy}
                          className="min-h-10 px-2 underline"
                          onClick={() => void cancelSchedule(item.id)}
                        >
                          예약 취소
                        </button>
                      ) : (
                        !item.cancelled_at && (
                          <button
                            type="button"
                            disabled={busy}
                            className="min-h-10 px-2 underline"
                            onClick={() => {
                              if (
                                !dirty ||
                                window.confirm("작성 중인 내용을 이 버전으로 바꿀까요?")
                              ) {
                                setDoc({
                                  ...item.document,
                                  ...(kind === "session"
                                    ? { instructorNotes: textValue(doc["instructorNotes"]) }
                                    : {}),
                                });
                                setHidden(item.hidden);
                                setPreview(false);
                                setMessage(
                                  "이전 공개본을 편집 화면에 불러왔습니다. 저장·공개 전에는 학생 화면이 바뀌지 않습니다.",
                                );
                              }
                            }}
                          >
                            이 버전을 초안으로
                          </button>
                        )
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>
        </details>
        {error && (
          <p role="alert" className="border border-neutral-400 p-4 text-sm leading-6">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="flex items-center gap-2 text-sm">
            <Check size={15} />
            {message}
          </p>
        )}
      </div>
      <footer className="sticky bottom-16 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-white p-4 md:bottom-0">
        <span className="text-xs text-neutral-500" role="status">
          {busy ? "저장 중…" : dirty ? "저장하지 않은 변경 사항" : "저장된 내용"}
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            className={buttonClass}
            onClick={() => void persist(false)}
          >
            <Save size={15} />
            초안 저장
          </button>
          <button
            type="button"
            disabled={busy}
            className={primaryClass}
            onClick={() => void persist(true)}
          >
            {hidden ? "숨김 적용" : "학생에게 공개"}
          </button>
        </div>
      </footer>
    </section>
  );
}

export function ContentManager({
  initialKind = "glossary",
  sessionOnly = false,
}: {
  initialKind?: ContentKind;
  sessionOnly?: boolean;
}) {
  const { status, user } = useAuth();
  const { sessions } = usePublishedContent();
  const [kind, setKind] = useState<ContentKind>(sessionOnly ? "session" : initialKind);
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [publications, setPublications] = useState<ContentPublication[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(
    sessionOnly
      ? (sessions.find(
          (session) => session.number === currentPublishedSession(sessions, seoulToday()),
        )?.id ?? "S01")
      : null,
  );
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [editorGeneration, setEditorGeneration] = useState(0);
  const dirtyRef = useRef(false);
  const busyRef = useRef(false);
  const onDirtyChange = useRef((value: boolean, busy = false) => {
    dirtyRef.current = value;
    busyRef.current = busy;
  }).current;
  useEditorExitGuard(allowChange);
  useBlocker({
    shouldBlockFn: () => !allowChange(),
    enableBeforeUnload: () => dirtyRef.current || busyRef.current,
  });
  useEffect(() => {
    let active = true;
    if (status !== "instructor") return;
    setLoading(true);
    setError("");
    void Promise.all([listContentDrafts(), listContentPublications()])
      .then(([draftRows, publishedRows]) => {
        if (active) {
          setDrafts(draftRows);
          setPublications(publishedRows);
          setEditorGeneration((value) => value + 1);
          dirtyRef.current = false;
        }
      })
      .catch(() => {
        if (active) setError("편집 내용을 불러오지 못했습니다. 다시 시도해 주세요.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status, user?.id, attempt]);
  const items = useMemo(() => {
    const map = new Map<string, { key: string; title: string }>();
    if (kind === "glossary")
      GLOSSARY.forEach((term) => map.set(term.id, { key: term.id, title: term.english }));
    if (kind === "guide")
      STUDY_GUIDES.forEach((guide) => map.set(guide.id, { key: guide.id, title: guide.title }));
    if (kind === "session")
      SESSIONS.forEach((session) =>
        map.set(session.id, {
          key: session.id,
          title: `${String(session.number).padStart(2, "0")}회차 · ${session.title}`,
        }),
      );
    [...latestPublications(publications), ...drafts]
      .filter((item) => item.kind === kind)
      .forEach((item) =>
        map.set(item.content_key, {
          key: item.content_key,
          title:
            (kind === "session" ? `${Number(item.content_key.replace("S", ""))}회차 · ` : "") +
            textValue(item.document[kind === "glossary" ? "english" : "title"], "새 콘텐츠"),
        }),
      );
    return [...map.values()].sort((a, b) =>
      kind === "session"
        ? a.key.localeCompare(b.key)
        : a.title.localeCompare(b.title, kind === "glossary" ? "en" : "ko"),
    );
  }, [kind, drafts, publications]);
  function allowChange() {
    if (busyRef.current) return false;
    return (
      !dirtyRef.current ||
      window.confirm("저장하지 않은 변경 사항이 있습니다. 변경 사항을 버리고 이동할까요?")
    );
  }
  function choose(key: string) {
    if (key !== selectedKey && allowChange()) {
      dirtyRef.current = false;
      setSelectedKey(key);
    }
  }
  function changeKind(next: ContentKind) {
    if (allowChange()) {
      dirtyRef.current = false;
      setKind(next);
      setSelectedKey(null);
      setQuery("");
    }
  }
  function add() {
    if (allowChange()) {
      dirtyRef.current = false;
      const key = `${kind}-${crypto.randomUUID().slice(0, 12)}`;
      setSelectedKey(key);
    }
  }
  function updated(row: ContentDraft) {
    setDrafts((previous) => [
      ...previous.filter((item) => item.kind !== row.kind || item.content_key !== row.content_key),
      row,
    ]);
  }
  async function refreshPublications() {
    setPublications(await listContentPublications());
  }
  const latest = latestPublications(publications);
  if (status !== "instructor")
    return <p className="py-8 text-sm">강사만 사용할 수 있는 화면입니다.</p>;
  const matches = items.filter((item) =>
    item.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  return (
    <div className="space-y-6">
      {!sessionOnly && (
        <header>
          <h1 className="text-3xl font-bold tracking-tight">콘텐츠 관리</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            수업에 필요한 설명과 예시를 다듬고, 공개할 내용을 직접 확인하세요.
          </p>
        </header>
      )}
      {!sessionOnly && (
        <div className="flex flex-wrap gap-2" aria-label="콘텐츠 종류">
          {KINDS.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={kind === item.value}
              className={kind === item.value ? primaryClass : buttonClass}
              onClick={() => changeKind(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      {loading ? (
        <p role="status" className="py-8 text-sm text-neutral-600">
          편집 내용을 불러오는 중…
        </p>
      ) : error ? (
        <div role="alert" className="space-y-4 border p-5">
          <p>{error}</p>
          <button
            type="button"
            className={buttonClass}
            onClick={() => setAttempt((value) => value + 1)}
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
          <aside
            className="min-w-0 border border-neutral-200 bg-white p-4"
            aria-label="편집할 콘텐츠"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">
                {sessionOnly ? "수업 회차" : KINDS.find((item) => item.value === kind)?.label}{" "}
                <span className="text-neutral-500">{items.length}</span>
              </p>
              {kind !== "session" && (
                <button
                  type="button"
                  className="flex min-h-10 items-center gap-1 text-xs font-semibold"
                  onClick={add}
                >
                  <Plus size={14} />
                  새로 추가
                </button>
              )}
            </div>
            <label className="mt-3 block">
              <span className="sr-only">콘텐츠 검색</span>
              <input
                type="search"
                placeholder="제목 검색"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={inputClass}
              />
            </label>
            <ul className="mt-3 max-h-64 overflow-y-auto xl:max-h-[65vh]">
              {matches.map((item) => {
                const draft = drafts.find(
                  (row) => row.kind === kind && row.content_key === item.key,
                );
                const pub = latest.find((row) => row.kind === kind && row.content_key === item.key);
                const pending = publications.some(
                  (row) =>
                    row.kind === kind &&
                    row.content_key === item.key &&
                    !row.cancelled_at &&
                    new Date(row.published_at).getTime() > Date.now(),
                );
                const label =
                  draft && draft.version > draft.published_version
                    ? "작성 중"
                    : pending
                      ? "공개 예약"
                      : pub?.hidden
                        ? "숨김"
                        : draft?.published_version ||
                            pub ||
                            ["guide", "glossary"].includes(kind) ||
                            (kind === "session" &&
                              SESSIONS.find((session) => session.id === item.key)?.detailsPublished)
                          ? "공개"
                          : "작성 중";
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      aria-current={selectedKey === item.key ? "true" : undefined}
                      onClick={() => choose(item.key)}
                      className={`w-full border-b border-neutral-100 px-3 py-3 text-left text-sm ${selectedKey === item.key ? "bg-black text-white" : "hover:bg-neutral-50"}`}
                    >
                      <span className="block break-words font-medium">
                        {item.title || "새 콘텐츠"}
                      </span>
                      <span
                        className={`mt-1 block text-xs ${selectedKey === item.key ? "text-white/70" : "text-neutral-500"}`}
                      >
                        {label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {!matches.length && (
              <p className="py-5 text-xs text-neutral-500">일치하는 콘텐츠가 없습니다.</p>
            )}
          </aside>
          {selectedKey ? (
            <ContentEditor
              key={`${kind}:${selectedKey}:${editorGeneration}`}
              kind={kind}
              contentKey={selectedKey}
              {...(drafts.find((item) => item.kind === kind && item.content_key === selectedKey)
                ? {
                    draft: drafts.find(
                      (item) => item.kind === kind && item.content_key === selectedKey,
                    )!,
                  }
                : {})}
              {...(latest.find((item) => item.kind === kind && item.content_key === selectedKey)
                ? {
                    publication: latest.find(
                      (item) => item.kind === kind && item.content_key === selectedKey,
                    )!,
                  }
                : {})}
              onSaved={updated}
              onDirtyChange={onDirtyChange}
              history={publications.filter(
                (item) => item.kind === kind && item.content_key === selectedKey,
              )}
              onPublished={refreshPublications}
            />
          ) : (
            <div className="flex min-h-60 items-center justify-center border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">
              목록에서 편집할 항목을 선택하거나 새 콘텐츠를 추가하세요.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
