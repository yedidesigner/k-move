import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Pencil, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

const SHARED_PROMISES = [
  "긍정적인 자세로 배웁니다",
  "긍정적인 에너지를 전하는 학생이 됩니다",
  "모르는 것에 대해서 부끄러워 하지 않습니다",
  "친구들간에 도와주는 자세를 가집니다",
  "서로 칭찬하는 분위기를 가집니다",
  "예의를 갖춰 대화합니다",
  "적극적인 태도로 듣습니다",
  "포기하지 않습니다",
  "스스로를 자랑스럽게 여깁니다",
] as const;

const MAX_PROMISE_LENGTH = 500;
const focusStyle = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground";

interface SavedPromise {
  content: string;
  updated_at: string;
}

const savedAtFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  dateStyle: "medium",
  timeStyle: "short",
});

function PersonalPromise({ userId, displayName }: { userId: string; displayName: string }) {
  const [saved, setSaved] = useState<SavedPromise | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const mounted = useRef(false);
  const saveInFlight = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const focusAfterRender = useRef<"editor" | "editButton" | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);

    async function load() {
      try {
        const { data, error } = await getSupabase()
          .from("kmove_promises")
          .select("content, updated_at")
          .eq("user_id", userId)
          .maybeSingle();
        if (!active) return;
        if (error) throw error;
        const record = data as SavedPromise | null;
        setSaved(record);
        setDraft(record?.content ?? "");
        setEditing(!record);
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [userId, retry]);

  useEffect(() => {
    if (focusAfterRender.current === "editor" && editing) {
      textareaRef.current?.focus();
      focusAfterRender.current = null;
    } else if (focusAfterRender.current === "editButton" && !editing) {
      editButtonRef.current?.focus();
      focusAfterRender.current = null;
    }
  }, [editing]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saveInFlight.current || loading || loadError) return;
    setSaveError("");
    setSavedMessage("");
    const content = draft.trim();
    if (!content) {
      setSaveError("나의 약속을 작성해 주세요. 빈칸만으로는 저장할 수 없습니다.");
      textareaRef.current?.focus();
      return;
    }
    if (content.length > MAX_PROMISE_LENGTH) {
      setSaveError("약속은 500자 이내로 작성해 주세요.");
      return;
    }

    saveInFlight.current = true;
    setSaving(true);
    try {
      const { data, error } = await getSupabase()
        .from("kmove_promises")
        .upsert({ user_id: userId, content }, { onConflict: "user_id" })
        .select("content, updated_at")
        .single();
      if (!mounted.current) return;
      if (error || !data) throw error ?? new Error("promise/no-saved-record");
      const record = data as SavedPromise;
      setSaved(record);
      setDraft(record.content);
      setSavedMessage("나의 약속이 저장되었습니다.");
      focusAfterRender.current = "editButton";
      setEditing(false);
    } catch {
      if (mounted.current) {
        setSaveError("약속을 저장하지 못했습니다. 작성한 내용은 그대로 있으니 다시 시도해 주세요.");
      }
    } finally {
      saveInFlight.current = false;
      if (mounted.current) setSaving(false);
    }
  }

  function startEditing() {
    setDraft(saved?.content ?? "");
    setSaveError("");
    setSavedMessage("");
    focusAfterRender.current = "editor";
    setEditing(true);
  }

  function cancelEditing() {
    setDraft(saved?.content ?? "");
    setSaveError("");
    focusAfterRender.current = "editButton";
    setEditing(false);
  }

  return (
    <div className="min-w-0 flex-1">
      <h2 className="text-lg font-bold tracking-tight sm:text-xl">나의 열 번째 약속</h2>
      <p id="promise-help" className="mt-2 text-sm leading-relaxed text-muted-foreground break-keep">
        스스로에게 하고 싶은 약속을 적어 주세요. 저장한 약속은 본인만 보고 수정할 수 있습니다.
      </p>

      {loading ? (
        <p role="status" className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
          나의 약속을 불러오는 중…
        </p>
      ) : loadError ? (
        <div className="mt-6 border border-border bg-background p-4">
          <p role="alert" className="text-sm leading-relaxed">약속을 불러오지 못했습니다. 다시 시도해 주세요.</p>
          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className={`mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold ${focusStyle}`}
          >
            <RefreshCw className="size-4" aria-hidden="true" /> 다시 불러오기
          </button>
        </div>
      ) : editing ? (
        <form onSubmit={(event) => void submit(event)} className="mt-6">
          <label htmlFor="personal-promise" className="mb-2 block text-sm font-semibold">
            {displayName ? `${displayName}님의 약속` : "나의 약속"}
          </label>
          <textarea
            ref={textareaRef}
            id="personal-promise"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              if (saveError) setSaveError("");
            }}
            rows={4}
            maxLength={MAX_PROMISE_LENGTH}
            disabled={saving}
            aria-describedby={saveError ? "promise-help promise-count promise-error" : "promise-help promise-count"}
            aria-invalid={Boolean(saveError)}
            placeholder="예: 작은 도전도 꾸준히 이어 가겠습니다."
            className="min-h-36 w-full resize-y border border-input bg-background px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-60"
          />
          <p id="promise-count" className="mt-2 text-right text-xs tabular-nums text-muted-foreground">
            {draft.length} / {MAX_PROMISE_LENGTH}자
          </p>
          {saveError && (
            <p id="promise-error" role="alert" className="mt-3 border-l-2 border-foreground pl-3 text-sm leading-relaxed">
              {saveError}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            {saved && (
              <button
                type="button"
                disabled={saving}
                onClick={cancelEditing}
                className={`min-h-11 border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50 ${focusStyle}`}
              >
                취소
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex min-h-11 items-center justify-center gap-2 bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50 ${focusStyle}`}
            >
              {saving && <RefreshCw className="size-4 animate-spin" aria-hidden="true" />}
              {saving ? "저장 중…" : saved ? "변경 내용 저장" : "약속 저장"}
            </button>
          </div>
        </form>
      ) : saved ? (
        <div className="mt-6">
          <p className="whitespace-pre-wrap break-words border-l-2 border-foreground pl-4 text-lg font-semibold leading-relaxed">
            {saved.content}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="size-3.5" aria-hidden="true" />
              <time dateTime={saved.updated_at}>{savedAtFormat.format(new Date(saved.updated_at))}</time> 저장
            </p>
            <button
              ref={editButtonRef}
              type="button"
              onClick={startEditing}
              className={`inline-flex min-h-11 items-center gap-2 border border-border bg-background px-4 text-sm font-semibold transition-colors hover:bg-muted ${focusStyle}`}
            >
              <Pencil className="size-3.5" aria-hidden="true" /> 수정하기
            </button>
          </div>
        </div>
      ) : null}
      <p role="status" aria-live="polite" className={savedMessage ? "mt-3 text-sm font-medium" : "sr-only"}>
        {savedMessage}
      </p>
    </div>
  );
}

export function OurPromises() {
  const { user } = useAuth();
  const username = user?.user_metadata?.["username"];
  const displayName = typeof username === "string" ? username : "";

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-3 border-b border-foreground pb-6 sm:pb-8">
        <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-muted-foreground">OUR PROMISES</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">우리의 약속</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground break-keep sm:text-base">
          함께 배우고 성장하는 시간을 위해, 서로와 나에게 약속합니다.
        </p>
      </header>

      <ol role="list" aria-label="우리의 열 가지 약속" className="list-none">
        {SHARED_PROMISES.map((promise, index) => (
          <li key={promise} className="flex items-start gap-4 border-b border-border py-5 sm:gap-6">
            <span aria-hidden="true" className="w-7 shrink-0 pt-0.5 text-sm font-medium tabular-nums text-muted-foreground sm:w-8">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="min-w-0 text-base font-semibold leading-relaxed break-keep sm:text-lg">{promise}</p>
          </li>
        ))}
        <li className="mt-6 flex items-start gap-4 border border-foreground bg-card p-5 sm:gap-6 sm:p-6">
          <span aria-hidden="true" className="w-7 shrink-0 pt-0.5 text-sm font-semibold tabular-nums sm:w-8">10</span>
          {user ? (
            <PersonalPromise key={user.id} userId={user.id} displayName={displayName} />
          ) : (
            <p className="text-sm leading-relaxed">로그인하면 나의 열 번째 약속을 작성할 수 있습니다.</p>
          )}
        </li>
      </ol>
    </div>
  );
}
