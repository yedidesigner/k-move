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
    if (busy) return;
    setSuccess(false);
    setError("");
    if (next !== confirm) {
      setError("새 비밀번호와 확인란이 일치하지 않습니다.");
      return;
    }
    if (!/^[0-9]{4}$/.test(current) || !/^[0-9]{4}$/.test(next)) {
      setError("현재 및 새 비밀번호는 숫자 4자리로 입력해 주세요.");
      return;
    }
    if (current === next) {
      setError("현재 비밀번호와 다른 비밀번호를 선택해 주세요.");
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
          : code === "auth/not-signed-in"
          ? "로그인이 필요합니다. 다시 로그인해 주세요."
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
          임시 비밀번호로 로그인한 뒤, 본인이 원하는 숫자 4자리로 변경할 수 있습니다.
        </p>
      </header>
      <div className="mb-5 border border-border bg-card px-5 py-4">
        <p className="text-xs text-muted-foreground">로그인 계정</p>
        <p className="mt-1 text-base font-semibold">{String(user?.user_metadata?.["username"] ?? "수강생")}</p>
      </div>
      <form onSubmit={(event) => void submit(event)} className="space-y-5">
        <div>
          <label htmlFor="current-password" className="mb-2 block text-sm font-medium">현재 비밀번호</label>
          <input id="current-password" type="password" required minLength={4} maxLength={4}
            inputMode="numeric" pattern="[0-9]{4}" disabled={busy}
            autoComplete="current-password" value={current} onChange={(event) => setCurrent(event.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="현재 비밀번호 숫자 4자리"
            className="min-h-12 w-full border border-input bg-card px-3 text-base" />
        </div>
        <div>
          <label htmlFor="new-password" className="mb-2 block text-sm font-medium">새 비밀번호</label>
          <input id="new-password" type="password" required minLength={4} maxLength={4}
            inputMode="numeric" pattern="[0-9]{4}" disabled={busy}
            autoComplete="new-password" value={next} onChange={(event) => setNext(event.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="새 비밀번호 숫자 4자리"
            className="min-h-12 w-full border border-input bg-card px-3 text-base" />
          <p className="mt-1 text-xs text-muted-foreground">기존 비밀번호와 다른 숫자 4자리를 입력해 주세요.</p>
        </div>
        <div>
          <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium">새 비밀번호 확인</label>
          <input id="confirm-password" type="password" required minLength={4} maxLength={4}
            inputMode="numeric" pattern="[0-9]{4}" disabled={busy}
            autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="새 비밀번호 4자리 확인"
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
