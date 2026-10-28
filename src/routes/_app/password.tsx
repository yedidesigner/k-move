import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/password")({
  head: () => ({
    meta: [{ title: "비밀번호 변경 | K-Move LMS" }, { name: "robots", content: "noindex" }],
  }),
  component: PasswordPage,
});

function PasswordPage() {
  const { user, changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(false);
    setError("");
    if (next !== confirm) {
      setError("새 비밀번호와 확인란이 일치하지 않습니다.");
      return;
    }
    if (next.length < 8 || next.length > 64 || !/[A-Za-z]/.test(next) || !/[0-9]/.test(next)) {
      setError("새 비밀번호는 영문과 숫자를 포함한 8~64자로 설정해 주세요.");
      return;
    }
    setBusy(true);
    try {
      await changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      setSuccess(true);
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      setError(
        code === "auth/current-password-incorrect"
          ? "현재 비밀번호가 일치하지 않습니다."
          : code === "auth/password-unchanged"
          ? "현재 비밀번호와 다른 비밀번호를 선택해 주세요."
          : "비밀번호를 변경하지 못했습니다. 다시 시도해 주세요."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-8 border-b border-foreground pb-6">
        <div className="mb-3 flex items-center gap-2">
          <KeyRound className="size-5" aria-hidden="true" />
          <span className="text-xs font-semibold tracking-[0.2em]">ACCOUNT SECURITY</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">비밀번호 변경</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          발급된 4자리 임시 비밀번호로 로그인한 뒤, 본인만 아는 비밀번호로 변경해 주세요.
        </p>
      </header>
      <div className="mb-5 border border-border bg-card px-5 py-4">
        <p className="text-xs text-muted-foreground">로그인 계정</p>
        <p className="mt-1 text-base font-semibold">{String(user?.user_metadata?.["username"] ?? "수강생")}</p>
      </div>
      <form onSubmit={(event) => void submit(event)} className="space-y-5">
        <div>
          <label htmlFor="current-password" className="mb-2 block text-sm font-medium">현재 비밀번호</label>
          <input id="current-password" type="password" required minLength={4} maxLength={64}
            autoComplete="current-password" value={current} onChange={(event) => setCurrent(event.target.value)}
            placeholder="기존 4자리 PIN 또는 현재 비밀번호"
            className="min-h-12 w-full border border-input bg-card px-3 text-base" />
        </div>
        <div>
          <label htmlFor="new-password" className="mb-2 block text-sm font-medium">새 비밀번호</label>
          <input id="new-password" type="password" required minLength={8} maxLength={64}
            autoComplete="new-password" value={next} onChange={(event) => setNext(event.target.value)}
            placeholder="영문과 숫자를 포함한 8자 이상"
            className="min-h-12 w-full border border-input bg-card px-3 text-base" />
          <p className="mt-1 text-xs text-muted-foreground">영문·숫자 포함, 8~64자. 다른 서비스와 중복되지 않도록 설정해 주세요.</p>
        </div>
        <div>
          <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium">새 비밀번호 확인</label>
          <input id="confirm-password" type="password" required minLength={8} maxLength={64}
            autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)}
            placeholder="새 비밀번호를 다시 입력"
            className="min-h-12 w-full border border-input bg-card px-3 text-base" />
        </div>
        {error && <p role="alert" className="border-l-2 border-foreground bg-muted px-4 py-3 text-sm">{error}</p>}
        {success && <p role="status" className="border-l-2 border-foreground bg-muted px-4 py-3 text-sm">
          비밀번호가 변경되었습니다. 다음 로그인부터 새 비밀번호를 사용하세요.
        </p>}
        <button type="submit" disabled={busy}
          className="min-h-12 w-full bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50">
          {busy ? "변경 중…" : "비밀번호 변경"}
        </button>
      </form>
    </div>
  );
}
