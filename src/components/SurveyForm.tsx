import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  answerLabel,
  cleanAnswers,
  hasOther,
  steps,
  survey,
  toggleChoice,
  validateQuestion,
  type Answers,
  type Question,
} from "@/lib/survey";

const inputClass =
  "min-h-12 w-full border border-input bg-card px-3 py-2 text-base focus:outline-2 focus:outline-offset-2 focus:outline-foreground";
export const surveyButton =
  "inline-flex min-h-12 items-center justify-center gap-2 bg-foreground px-5 py-3 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-50";

function QuestionField({
  q,
  answers,
  onChange,
  error,
}: {
  q: Question;
  answers: Answers;
  onChange: (id: string, value: Answers[string]) => void;
  error?: string;
}) {
  const value = answers[q.id];
  const selected = Array.isArray(value) ? value : [];
  const matrix = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const otherVisible = q.otherText || (q.other && hasOther(q, value));
  const textValue = typeof value === "string" ? value : "";
  const choose = (id: string) => onChange(q.id, toggleChoice(q, selected, id));
  return (
    <fieldset
      id={`question-${q.id}`}
      tabIndex={-1}
      aria-describedby={error ? `error-${q.id}` : undefined}
      className="min-w-0 border-b border-border py-8 first:pt-2 last:border-0"
    >
      <legend className="float-left mb-5 w-full text-base font-semibold leading-relaxed sm:text-lg">
        <span className="mr-3 text-xs tabular-nums text-muted-foreground">
          {String(q.number).padStart(2, "0")}
        </span>
        {q.title}
        {q.required && (
          <span className="ml-1" aria-label="필수">
            *
          </span>
        )}
      </legend>
      <div className="clear-both">
        {q.help && <p className="mb-4 text-sm text-muted-foreground">{q.help}</p>}
        {(q.type === "text" || q.type === "textarea") &&
          (q.type === "text" ? (
            <input
              aria-label={q.title}
              autoComplete="name"
              className={inputClass}
              value={textValue}
              maxLength={q.maxLength}
              onChange={(e) => onChange(q.id, e.target.value)}
            />
          ) : (
            <>
              <textarea
                aria-label={q.title}
                className={inputClass + " min-h-32 resize-y"}
                value={textValue}
                maxLength={q.maxLength}
                onChange={(e) => onChange(q.id, e.target.value)}
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {textValue.length} / {q.maxLength}
              </p>
            </>
          ))}
        {q.type === "single" && (
          <div className="grid gap-2">
            {q.options?.map((o) => (
              <label
                key={o.id}
                className={`flex cursor-pointer items-start gap-3 border p-4 ${value === o.id ? "border-foreground bg-muted" : "border-border bg-card"}`}
              >
                <input
                  type="radio"
                  name={q.id}
                  checked={value === o.id}
                  onChange={() => onChange(q.id, o.id)}
                  className="mt-1 size-4 shrink-0 accent-black"
                />
                <span>
                  <span className="block text-sm font-medium">{o.title}</span>
                  {o.description && (
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      {o.description}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        )}
        {q.type === "multi" &&
          (q.layout === "servicePlans" ? (
            <>
              <div className="grid grid-cols-[minmax(0,1fr)_4rem_4rem] items-center border-b border-foreground pb-2 text-sm">
                <span>AI 서비스</span>
                <span className="text-center">무료</span>
                <span className="text-center">유료</span>
              </div>
              {q.services?.map((s) => (
                <div
                  key={s.id}
                  className="grid min-h-14 grid-cols-[minmax(0,1fr)_4rem_4rem] items-center border-b border-border text-sm"
                >
                  <span>{s.title}</span>
                  {["free", "paid"].map((plan) => (
                    <label
                      key={plan}
                      className="flex min-h-12 cursor-pointer items-center justify-center"
                    >
                      <input
                        type="checkbox"
                        aria-label={`${s.title} ${plan === "free" ? "무료" : "유료"}`}
                        checked={selected.includes(`${s.id}_${plan}`)}
                        onChange={() => choose(`${s.id}_${plan}`)}
                        className="size-5 accent-black"
                      />
                    </label>
                  ))}
                </div>
              ))}
              <label className="mt-4 flex min-h-12 cursor-pointer items-center gap-3 border border-border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes("none")}
                  onChange={() => choose("none")}
                  className="size-4 accent-black"
                />
                사용해 본 적이 없습니다
              </label>
            </>
          ) : (
            <>
              <div className="grid gap-2">
                {q.options?.map((o) => {
                  const checked = selected.includes(o.id);
                  return (
                    <label
                      key={o.id}
                      className={`flex min-h-14 cursor-pointer items-center gap-3 border p-3 text-sm ${checked ? "border-foreground bg-muted" : "border-border bg-card"}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={
                          !checked && !!q.max && selected.length >= q.max && o.id !== q.exclusive
                        }
                        onChange={() => choose(o.id)}
                        className="size-4 shrink-0 accent-black disabled:opacity-30"
                      />
                      {o.title}
                    </label>
                  );
                })}
              </div>
              {q.max && (
                <p className="mt-2 text-right text-xs text-muted-foreground" aria-live="polite">
                  {selected.length} / {q.max}개 선택
                </p>
              )}
            </>
          ))}
        {q.type === "matrix" && (
          <div className="space-y-4">
            {q.rows?.map((row) => (
              <fieldset key={row.id} className="min-w-0 border border-border p-3 sm:p-4">
                <legend className="px-1 text-sm font-semibold">{row.title}</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {survey.levels.map((level) => (
                    <label
                      key={level.id}
                      className={`flex min-h-12 cursor-pointer items-center gap-2 px-2 text-xs ${matrix[row.id] === level.id ? "bg-foreground text-background" : "bg-muted"}`}
                    >
                      <input
                        type="radio"
                        name={row.id}
                        aria-label={`${row.title} ${level.short}`}
                        checked={matrix[row.id] === level.id}
                        onChange={() => onChange(q.id, { ...matrix, [row.id]: level.id })}
                        className="size-4 shrink-0 accent-black"
                      />
                      {level.short}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <div className="grid gap-1 text-xs text-muted-foreground">
              {survey.levels.map((l) => (
                <p key={l.id}>
                  {l.short} · {l.description}
                </p>
              ))}
            </div>
          </div>
        )}
        {otherVisible && (
          <label className="mt-4 block text-sm font-medium">
            {q.otherText ? "기타 디자인 프로그램" : "기타 내용"}
            <textarea
              className={inputClass + " mt-2 min-h-20 resize-y"}
              placeholder={
                q.otherText
                  ? "프로그램 이름과 활용 수준을 적어 주세요. (선택)"
                  : "선택한 기타 항목을 구체적으로 적어 주세요."
              }
              maxLength={q.otherMaxLength ?? 150}
              value={
                typeof answers[q.id + "Other"] === "string"
                  ? (answers[q.id + "Other"] as string)
                  : ""
              }
              onChange={(e) => onChange(q.id + "Other", e.target.value)}
            />
          </label>
        )}
        {error && (
          <p
            id={`error-${q.id}`}
            role="alert"
            className="mt-3 border-l-2 border-foreground pl-3 text-sm font-medium"
          >
            {error}
          </p>
        )}
      </div>
    </fieldset>
  );
}

export function SurveyAnswers({ answers }: { answers: Answers }) {
  return (
    <dl className="divide-y divide-border">
      {survey.questions.map((q) => (
        <div key={q.id} className="py-5 first:pt-0">
          <dt className="text-sm font-semibold">
            {q.number}. {q.title}
          </dt>
          <dd className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
            {answerLabel(q, answers)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SurveyForm({
  initialAnswers,
  onSubmit,
  onCancel,
  onDraft,
  initialStep = 0,
}: {
  initialAnswers: Answers;
  onSubmit: (answers: Answers) => Promise<void>;
  onCancel?: () => void;
  onDraft?: (answers: Answers) => void;
  initialStep?: number;
}) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [step, setStep] = useState(initialStep);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const top = useRef<HTMLHeadingElement>(null);
  const submitting = useRef(false);
  function change(id: string, value: Answers[string]) {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    onDraft?.(next);
    setErrors({});
    setSaveError(null);
  }
  function go(next: number) {
    setStep(next);
    setErrors({});
    setConfirmed(false);
    requestAnimationFrame(() => {
      top.current?.focus();
      top.current?.scrollIntoView({ block: "start" });
    });
  }
  function validate(all: boolean) {
    const invalid: Record<string, string> = {};
    for (const q of survey.questions.filter((q) => all || q.step === step)) {
      const error = validateQuestion(q, answers);
      if (error) invalid[q.id] = error;
    }
    setErrors(invalid);
    const first = survey.questions.find((q) => invalid[q.id]);
    if (first) {
      setStep(first.step);
      requestAnimationFrame(() => document.getElementById(`question-${first.id}`)?.focus());
      return false;
    }
    return true;
  }
  async function submit() {
    if (submitting.current || !confirmed || !validate(true)) return;
    submitting.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      await onSubmit(cleanAnswers(answers));
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "저장하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }
  return (
    <div className="border-y border-foreground bg-card p-5 sm:p-8">
      <div className="mb-8 flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>사전 학습 설문</span>
        <span>{step < 3 ? `${step + 1} / 3단계` : "제출 전 확인"}</span>
      </div>
      <div className="mb-8 grid grid-cols-3 gap-1" aria-label="설문 진행 단계">
        {steps.map((label, i) => (
          <div
            key={label}
            className={`border-t-2 pt-3 text-xs ${i <= step ? "border-foreground text-foreground" : "border-border text-muted-foreground"}`}
          >
            {String(i + 1).padStart(2, "0")}
            <span className="mt-1 block">{label}</span>
          </div>
        ))}
      </div>
      <h2 ref={top} tabIndex={-1} className="mb-7 scroll-mt-6 text-xl font-semibold">
        {steps[step] ?? "응답을 확인해 주세요"}
      </h2>
      {step < 3 ? (
        <>
          {survey.questions
            .filter((q) => q.step === step)
            .map((q) => (
              <QuestionField
                key={q.id}
                q={q}
                answers={answers}
                onChange={change}
                {...(errors[q.id] ? { error: errors[q.id] } : {})}
              />
            ))}
          <p className="mt-4 text-xs text-muted-foreground">
            * 필수 항목 · 작성 중인 내용은 이 브라우저 탭에 임시 보관됩니다. 마지막 제출 버튼을
            눌러야 강사에게 전달됩니다.
          </p>
        </>
      ) : (
        <>
          <SurveyAnswers answers={answers} />
          <label className="my-5 flex cursor-pointer items-start gap-3 border border-border bg-muted p-4 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 size-4 shrink-0 accent-black"
            />
            <span>
              응답 내용을 확인했습니다. 제출한 내용은 수업 준비를 위해 강사가 확인하며, 제출 후에도
              수정할 수 있습니다.
            </span>
          </label>
        </>
      )}
      {saveError && (
        <p role="alert" className="my-4 border-l-2 border-foreground bg-muted p-4 text-sm">
          {saveError} 입력한 내용은 유지됩니다.
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        {step > 0 ? (
          <button
            type="button"
            disabled={saving}
            onClick={() => go(step - 1)}
            className="inline-flex min-h-12 items-center gap-2 px-3 text-sm"
          >
            <ArrowLeft className="size-4" aria-hidden />
            이전
          </button>
        ) : onCancel ? (
          <button type="button" onClick={onCancel} className="min-h-12 px-3 text-sm">
            수정 취소
          </button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <button
            type="button"
            className={surveyButton}
            onClick={() => {
              if (validate(false)) go(step + 1);
            }}
          >
            {step === 2 ? "응답 확인" : "다음"}
            <ArrowRight className="size-4" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            className={surveyButton}
            disabled={saving || !confirmed}
            onClick={() => void submit()}
          >
            <Check className="size-4" aria-hidden />
            {saving ? "제출 중…" : "설문 제출"}
          </button>
        )}
      </div>
    </div>
  );
}
