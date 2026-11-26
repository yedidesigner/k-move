import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, StudentPreviewProvider, instructorViewKey } from "@/lib/auth";
import { requestEditorExit } from "@/lib/editor-exit-guard";

type View = "instructor" | "student";

function savedView(session: string): View | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(instructorViewKey) ?? "null");
    return saved?.session === session && (saved.view === "student" || saved.view === "instructor")
      ? saved.view : null;
  } catch {
    return null;
  }
}

export function InstructorView({ session, children }: { session: string; children: ReactNode }) {
  const [view, setView] = useState<View | null>(() => savedView(session));
  const [logoutError, setLogoutError] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  function select(next: View | null) {
    try {
      if (next) sessionStorage.setItem(instructorViewKey, JSON.stringify({ session, view: next }));
      else sessionStorage.removeItem(instructorViewKey);
    } catch {
      // The current tab can still switch views when browser storage is unavailable.
    }
    setView(next);
  }
  async function switchView() {
    if (!(await requestEditorExit())) return;
    select(null);
    await navigate({ to: "/", replace: true });
  }
  if (!view) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12">
        <p className="text-sm font-semibold">K-MOVE LMS · 강예지</p>
        <h1 className="mb-7 mt-3 text-3xl font-bold tracking-tight">어떤 화면으로 들어갈까요?</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => select("instructor")} className="border border-foreground bg-foreground p-5 text-left text-background">
            <strong className="block">강사용</strong><span className="mt-2 block text-sm">수업 운영과 학생 관리</span>
          </button>
          <button type="button" onClick={() => select("student")} className="border border-foreground p-5 text-left hover:bg-muted">
            <strong className="block">학생용</strong><span className="mt-2 block text-sm">학생에게 보이는 수업과 메뉴 미리보기</span>
          </button>
        </div>
        <button type="button" onClick={() => { setLogoutError(false); void signOut().catch(() => setLogoutError(true)); }} className="mt-4 min-h-11 self-start text-sm underline">로그아웃</button>
        {logoutError && <p role="alert" className="text-sm text-destructive">로그아웃하지 못했습니다. 다시 시도해 주세요.</p>}
      </main>
    );
  }
  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-1 text-sm">
        <strong>{view === "student" ? "학생용 미리보기 · 읽기 전용" : "강사용"}</strong>
        <button type="button" onClick={() => void switchView()} className="min-h-11 px-2 underline">화면 전환</button>
      </div>
      {view === "student" ? <StudentPreviewProvider>{children}</StudentPreviewProvider> : children}
    </>
  );
}
