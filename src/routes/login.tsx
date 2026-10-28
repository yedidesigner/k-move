import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { SITE_NAME, COURSE_NAME } from "@/data/schedule";
import { useAuth } from "@/lib/auth";
import { Spinner, StatusBadge } from "@/components/lms";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: `로그인 | ${SITE_NAME}` },
      { name: "description", content: "아이디와 숫자 4자리 비밀번호로 K-Move LMS에 로그인합니다." },
      { property: "og:title", content: `로그인 | ${SITE_NAME}` },
      {
        property: "og:description",
        content: "아이디와 숫자 4자리 비밀번호로 K-Move LMS에 로그인합니다.",
      },
    ],
  }),
  component: Login,
});

type Mode = "login" | "signup";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "이미 사용 중인 아이디입니다.",
  "auth/invalid-credential": "아이디 또는 비밀번호가 올바르지 않습니다.",
  "auth/user-not-found": "아이디 또는 비밀번호가 올바르지 않습니다.",
  "auth/wrong-password": "아이디 또는 비밀번호가 올바르지 않습니다.",
  "auth/too-many-requests": "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.",
  "auth/network-request-failed": "네트워크 연결을 확인해 주세요.",
  "auth/invalid-login-id": "아이디는 2~30자로 입력해 주세요.",
  "auth/korean-login-id-required": "아이디는 한글로만 입력해 주세요.",
  "auth/invalid-pin": "비밀번호는 숫자 4자리로 입력해 주세요.",
  "auth/email-confirmation-required": "Supabase Authentication에서 Confirm email을 꺼 주세요.",
  invalid_credentials: "아이디 또는 비밀번호가 올바르지 않습니다.",
  user_already_exists: "이미 사용 중인 아이디입니다.",
  "permission-denied": "회원 정보 저장 권한이 없습니다. Supabase 설정을 확인해 주세요.",
};

function errorCode(error: unknown) {
  if (error instanceof Error && error.message.startsWith("auth/")) return error.message;
  return (error as { code?: string })?.code ?? "unknown";
}

function Login() {
  const { status, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "student" || status === "instructor") return <Navigate to="/" />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup" && password !== passwordConfirm) {
        setError("비밀번호가 서로 일치하지 않습니다.");
        return;
      }
      if (mode === "signup") await signUp(loginId, password);
      else await signIn(loginId, password);
    } catch (err) {
      const code = errorCode(err);
      setError(ERROR_MESSAGES[code] ?? "처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
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

        <div
          className="mt-7 grid grid-cols-2 border-b border-border"
          role="group"
          aria-label="로그인 방식"
        >
          {(["login", "signup"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={mode === item}
              onClick={() => {
                setMode(item);
                setError(null);
              }}
              className={`min-h-12 px-3 py-2 text-sm font-semibold transition-colors ${
                mode === item
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {item === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
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
                  아이디
                </label>
                <input
                  id="login-id"
                  value={loginId}
                  onChange={(event) => setLoginId(event.target.value)}
                  minLength={2}
                  maxLength={30}
                  pattern={mode === "signup" ? "[가-힣]{2,30}" : undefined}
                  title={mode === "signup" ? "아이디는 한글 2~30자로 입력해 주세요." : undefined}
                  autoComplete="username"
                  required
                  className="min-h-12 w-full border border-input bg-card px-3 text-base outline-none focus:ring-2 focus:ring-ring"
                  placeholder="사용할 아이디"
                />
                {mode === "signup" && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    한글 2~30자로 입력해 주세요.
                  </p>
                )}
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
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  className="min-h-12 w-full border border-input bg-card px-3 text-base outline-none focus:ring-2 focus:ring-ring"
                  placeholder="숫자 4자리"
                />
              </div>
              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="password-confirm"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    비밀번호 확인
                  </label>
                  <input
                    id="password-confirm"
                    type="password"
                    minLength={4}
                    maxLength={4}
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value.replace(/\D/g, "").slice(0, 4))}
                    autoComplete="new-password"
                    required
                    className="min-h-12 w-full border border-input bg-card px-3 text-base outline-none focus:ring-2 focus:ring-ring"
                    placeholder="비밀번호를 다시 입력"
                  />
                </div>
              )}
              <button
                disabled={busy || !/^\d{4}$/.test(password)}
                className="flex min-h-12 w-full items-center justify-center bg-primary px-4 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {busy ? "처리 중…" : mode === "login" ? "로그인" : "회원가입"}
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
                {mode === "signup"
                  ? "비밀번호는 숫자 4자리로 설정해 주세요."
                  : "배부된 임시 비밀번호 또는 직접 변경한 숫자 4자리 비밀번호를 입력하세요."}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
