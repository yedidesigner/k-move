import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { PageHeader, Panel, Spinner, StatusBadge } from "@/components/lms";

export const Route = createFileRoute("/_app/portfolio")({
  head: () => ({
    meta: [
      { title: "내 포트폴리오 | K-Move LMS" },
      { name: "description", content: "목표 직무, 소개문, 대표 프로젝트와 진행 상태" },
      { property: "og:title", content: "내 포트폴리오" },
      { property: "og:description", content: "목표 직무, 소개문, 대표 프로젝트와 진행 상태" },
    ],
  }),
  component: Portfolio,
});

const EMPTY = {
  targetRole: "", titleKo: "", titleEn: "", introKo: "", introEn: "",
  projects: "", webUrl: "", pdfUrl: "", progress: "not_started",
};
type Form = typeof EMPTY;
const PROGRESS: Record<string, string> = { not_started: "시작 전", drafting: "작성 중", reviewing: "검토 중", done: "완성" };

function Portfolio() {
  const { user } = useAuth();
  const [form, setForm] = useState<Form>(EMPTY);
  const [state, setState] = useState<"loading" | "ready" | "saving" | "saved" | "error" | "loadError">("loading");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data, error } = await getSupabase()
          .from("kmove_portfolios")
          .select("target_role,title_ko,title_en,intro_ko,intro_en,projects,web_url,pdf_url,progress")
          .eq("user_id", user.id)
          .maybeSingle();
        if (error) throw error;
        if (data) setForm({
          targetRole: data.target_role, titleKo: data.title_ko, titleEn: data.title_en,
          introKo: data.intro_ko, introEn: data.intro_en, projects: data.projects,
          webUrl: data.web_url, pdfUrl: data.pdf_url, progress: data.progress,
        });
        setState("ready");
      } catch {
        setState("loadError");
      }
    })();
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setState("saving");
    try {
      const { error } = await getSupabase().from("kmove_portfolios").upsert({
        user_id: user.id,
        target_role: form.targetRole,
        title_ko: form.titleKo,
        title_en: form.titleEn,
        intro_ko: form.introKo,
        intro_en: form.introEn,
        projects: form.projects,
        web_url: form.webUrl,
        pdf_url: form.pdfUrl,
        progress: form.progress,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setState("saved");
    } catch {
      setState("error");
    }
  };

  if (state === "loading") return <Spinner />;
  if (state === "loadError")
    return <><PageHeader title="내 포트폴리오" /><p role="alert" className="text-destructive">불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p></>;

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [k]: e.target.value });
    if (state === "saved" || state === "error") setState("ready");
  };
  const input = "mt-1 block min-h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-base";
  const F = ({ k, label, area, type = "text" }: { k: keyof Form; label: string; area?: boolean; type?: string }) => (
    <label className="block text-sm font-medium">
      {label}
      {area ? <textarea rows={4} className={input} value={form[k]} onChange={set(k)} /> : <input type={type} className={input} value={form[k]} onChange={set(k)} />}
    </label>
  );

  return (
    <>
      <PageHeader title="내 포트폴리오" description="제목과 소개문은 한국어와 영어로 입력할 수 있습니다." />
      <form onSubmit={save} className="space-y-4">
        <Panel className="space-y-4">
          {F({ k: "targetRole", label: "목표 직무" })}
          <div className="grid gap-4 md:grid-cols-2">
            {F({ k: "titleKo", label: "포트폴리오 제목 (한국어)" })}
            {F({ k: "titleEn", label: "Portfolio title (English)" })}
            {F({ k: "introKo", label: "소개문 (한국어)", area: true })}
            {F({ k: "introEn", label: "Introduction (English)", area: true })}
          </div>
          {F({ k: "projects", label: "대표 프로젝트 (한 줄에 하나씩)", area: true })}
          <div className="grid gap-4 md:grid-cols-2">
            {F({ k: "webUrl", label: "웹 포트폴리오 주소", type: "url" })}
            {F({ k: "pdfUrl", label: "PDF 포트폴리오 링크 (Google Drive)", type: "url" })}
          </div>
          <label className="block text-sm font-medium">
            제작 진행 상태
            <select className={input} value={form.progress} onChange={set("progress")}>
              {Object.entries(PROGRESS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </Panel>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={state === "saving"} className="min-h-11 rounded-lg bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {state === "saving" ? "저장 중…" : "저장"}
          </button>
          <span aria-live="polite">
            {state === "saved" && <StatusBadge tone="success">저장 완료</StatusBadge>}
            {state === "error" && <StatusBadge tone="danger">저장 실패 · 잠시 후 다시 시도해 주세요</StatusBadge>}
          </span>
        </div>
      </form>
    </>
  );
}
