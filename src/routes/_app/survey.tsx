import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { loadOwnResponse, submitResponse } from "@/lib/survey-api";
import { formatSubmitted, type Answers, type SurveyResponse } from "@/lib/survey";
import { SurveyAnswers, SurveyForm, surveyButton } from "@/components/SurveyForm";
import { PageHeader, Spinner } from "@/components/lms";

export const Route = createFileRoute("/_app/survey")({
  head: () => ({
    meta: [{ title: "1주차 설문조사 | K-Move LMS" }, { name: "robots", content: "noindex" }],
  }),
  component: SurveyPage,
});

function SurveyPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const username = String(user?.user_metadata?.["username"] ?? "");
  const [response, setResponse] = useState<SurveyResponse | null>(null);
  const [initialAnswers, setInitialAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [retry, setRetry] = useState(0);
  const key = `kmove:survey:v2:${userId}`;
  useEffect(() => {
    if (!userId) return;
    let active = true;
    setLoading(true);
    setError(null);
    void loadOwnResponse(userId)
      .then((saved) => {
        if (!active) return;
        setResponse(saved);
        let draft: Answers = saved?.answers ?? { name: username };
        try {
          const raw = sessionStorage.getItem(key);
          if (raw) {
            const parsed: unknown = JSON.parse(raw);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
              draft = parsed as Answers;
          }
        } catch {
          /* Storage may be disabled. */
        }
        setInitialAnswers(draft);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId, username, retry, key]);
  async function save(answers: Answers) {
    if (!user) throw new Error("다시 로그인해 주세요.");
    const saved = await submitResponse(user.id, answers);
    setResponse(saved);
    setInitialAnswers(saved.answers);
    setEditing(false);
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* Nonessential cleanup. */
    }
    window.scrollTo({ top: 0 });
  }
  return (
    <>
      <Link
        to="/sessions/$id"
        params={{ id: "S01" }}
        className="mb-5 inline-block text-sm text-muted-foreground"
      >
        ← 1주차
      </Link>
      <PageHeader
        title="설문조사"
        description="AI 경험과 디자인 도구 활용 수준을 바탕으로 수업을 준비합니다."
      />
      {loading ? (
        <Spinner />
      ) : error ? (
        <div role="alert" className="border-y border-border bg-card p-6">
          <p className="text-sm">{error}</p>
          <button className={surveyButton + " mt-4"} onClick={() => setRetry((r) => r + 1)}>
            다시 확인
          </button>
        </div>
      ) : response && !editing ? (
        <>
          <section className="mb-6 border-y border-foreground bg-card p-6">
            <CheckCircle2 aria-hidden className="mb-4 size-7" />
            <h2 className="text-xl font-semibold">제출이 완료되었습니다</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              응답이 저장되어 강사가 확인할 수 있습니다.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              최종 저장: {formatSubmitted(response.updated_at)}
            </p>
            <button className={surveyButton + " mt-5"} onClick={() => setEditing(true)}>
              응답 수정
            </button>
          </section>
          <div className="border border-border bg-card p-5 sm:p-8">
            <SurveyAnswers answers={response.answers} />
          </div>
        </>
      ) : (
        <SurveyForm
          key={editing ? "edit" : "new"}
          initialAnswers={initialAnswers}
          onSubmit={save}
          {...(response
            ? {
                onCancel: () => {
                  setEditing(false);
                  setInitialAnswers(response.answers);
                  try {
                    sessionStorage.removeItem(key);
                  } catch {
                    /* Storage may be disabled. */
                  }
                },
              }
            : {})}
          onDraft={(answers) => {
            setInitialAnswers(answers);
            try {
              sessionStorage.setItem(key, JSON.stringify(answers));
            } catch {
              /* Submission does not depend on local storage. */
            }
          }}
        />
      )}
    </>
  );
}
