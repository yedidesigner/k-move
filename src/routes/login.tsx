import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { SITE_NAME, COURSE_NAME } from "@/data/schedule";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { Spinner, StatusBadge } from "@/components/lms";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: `로그인 | ${SITE_NAME}` },
      { name: "description", content: "등록된 이름과 숫자 4자리 비밀번호로 K-Move LMS에 로그인합니다." },
      { property: "og:title", content: `로그인 | ${SITE_NAME}` },
      {
        property: "og:description",
        content: "등록된 이름과 숫자 4자리 비밀번호로 K-Move LMS에 로그인합니다.",
      },
    ],
  }),
  component: Login,
});

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "이름 또는 비밀번호가 올바르지 않습니다.",
  "auth/user-not-found": "이름 또는 비밀번호가 올바르지 않습니다.",
  "auth/wrong-password": "이름 또는 비밀번호가 올바르지 않습니다.",
  "auth/too-many-requests": "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.",
  "auth/network-request-failed": "네트워크 연결을 확인해 주세요.",
  "auth/invalid-login-id": "로그인 이름은 2~30자로 입력해 주세요.",
  "auth/invalid-pin": "비밀번호는 숫자 4자리로 입력해 주세요.",
  invalid_credentials: "이름 또는 비밀번호가 올바르지 않습니다.",
  over_request_rate_limit: "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.",
};

function errorCode(error: unknown) {
  if (error instanceof Error && error.message.startsWith("auth/")) return error.message;
  return (error as { code?: string })?.code ?? "unknown";
}

function Login() {
  const { status, signIn } = useAuth();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [externalEmail, setExternalEmail] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailNotice, setEmailNotice] = useState("");
  const [emailError, setEmailError] = useState("");

  if (status === "student" || status === "instructor") return <Navigate to="/" />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await signIn(loginId, password);
    } catch (err) {
      const code = errorCode(err);
      setError(ERROR_MESSAGES[code] ?? "처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function requestExternalLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (emailBusy) return;
    setEmailBusy(true); setEmailNotice(""); setEmailError("");
    try {
      const { error: failure } = await getSupabase().auth.signInWithOtp({
        email: externalEmail.trim().toLowerCase(),
        options: { shouldCreateUser: false, emailRedirectTo: new URL("/login", window.location.origin).href },
      });
      if (failure) {
        setEmailError("로그인 링크를 요청하지 못했습니다. 초대받은 이메일인지 확인하고 잠시 후 다시 시도해 주세요.");
      } else {
        setEmailNotice("등록된 이메일로 로그인 링크를 요청했습니다. 받은 편지함을 확인해 주세요.");
      }
    } catch {
      setEmailError("네트워크 연결을 확인해 주세요.");
    } finally { setEmailBusy(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md border-y border-foreground bg-card px-5 py-8 sm:px-8">
        <p className="mb-6 text-3xl font-bold tracking-tight">
          K-MOVE
          <span className="ml-3 text-xs font-medium tracking-[0.16em] text-muted-foreground">
            LMS
          </span>
        </p>
        <h1 className="text-xl font-bold leading-snug text-foreground break-keep">{SITE_NAME}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{COURSE_NAME}</p>

        <div className="mt-7 border-b border-border pb-4">
          <h2 className="text-base font-semibold">로그인</h2>
          <p className="mt-1 text-sm text-muted-foreground">본명으로 로그인</p>
        </div>

        <div className="mt-6">
          {status === "loading" ? (
            <Spinner />
          ) : status === "notConfigured" ? (
            <div className="space-y-3">
              <StatusBadge tone="warning">설정 필요</StatusBadge>
              <p className="text-sm text-muted-foreground">Supabase 연결 설정이 필요합니다.</p>
              <Link to="/setup" className="inline-block text-xs text-muted-foreground underline">
                운영자 설정 안내
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={submit}>
              <div>
                <label
                  htmlFor="login-id"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  로그인 이름
                </label>
                <input
                  id="login-id"
                  value={loginId}
                  onChange={(event) => setLoginId(event.target.value)}
                  minLength={2}
                  maxLength={30}
                  autoComplete="username"
                  disabled={busy}
                  required
                  className="min-h-12 w-full border border-input bg-card px-3 text-base outline-none focus:ring-2 focus:ring-ring"
                  placeholder="이름"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  minLength={4}
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  value={password}
                  onChange={(event) => setPassword(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  autoComplete="current-password"
                  disabled={busy}
                  required
                  className="min-h-12 w-full border border-input bg-card px-3 text-base outline-none focus:ring-2 focus:ring-ring"
                  placeholder="숫자 4자리"
                />
              </div>
              <button
                disabled={busy || !/^\d{4}$/.test(password)}
                className="flex min-h-12 w-full items-center justify-center bg-primary px-4 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {busy ? "로그인 중…" : "로그인"}
              </button>
              {(error || status === "error") && (
                <p
                  role="alert"
                  className="border-l-2 border-foreground bg-muted px-3 py-2 text-sm text-foreground"
                >
                  {error ?? "로그인 상태를 확인하지 못했습니다. 다시 시도해 주세요."}
                </p>
              )}
              <p className="text-xs leading-relaxed text-muted-foreground">
                배부된 임시 비밀번호 또는 직접 변경한 숫자 4자리 비밀번호를 입력하세요.
                로그인 후 메뉴의 ‘비밀번호 변경’에서 바꿀 수 있습니다.
              </p>
            </form>
          )}
        </div>
        {(status === "signedOut" || status === "error") && (
          <section className="mt-7 border-t border-border pt-5" aria-labelledby="external-login-title">
            <h2 id="external-login-title" className="text-base font-semibold">외부 학생 이메일 로그인</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">초대받은 이메일을 입력하면 로그인 링크를 받을 수 있습니다. 정규 수강생은 위의 이름과 비밀번호로 로그인하세요.</p>
            <form onSubmit={requestExternalLink} className="mt-3 space-y-3">
              <label htmlFor="external-email" className="block text-sm font-medium">이메일</label>
              <input id="external-email" type="email" autoComplete="email" maxLength={254} required
                value={externalEmail} onChange={e => setExternalEmail(e.target.value)}
                className="min-h-12 w-full border border-input bg-card px-3 text-base" disabled={emailBusy} />
              <button type="submit" disabled={emailBusy || !externalEmail.trim()}
                className="min-h-12 w-full border border-foreground px-4 text-sm font-semibold disabled:opacity-50">
                {emailBusy ? "요청 중…" : "이메일 로그인 링크 받기"}
              </button>
              {emailNotice && <p role="status" className="text-sm">{emailNotice}</p>}
              {emailError && <p role="alert" className="text-sm">{emailError}</p>}
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
