import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { EmptyState, PageHeader, Panel, Spinner, StatusBadge } from "@/components/lms";
import { SetupGuide } from "@/components/SetupGuide";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({ meta: [{ title: "관리자 | K-Move LMS" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

interface Profile { id: string; username: string; role: "student" | "instructor"; created_at: string }

function Admin() {
  const { status } = useAuth();
  const [rows, setRows] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "instructor") return;
    void getSupabase().from("kmove_profiles").select("id,username,role,created_at").order("created_at").then(({ data, error }) => {
      if (error) setError(error.message);
      else setRows((data ?? []) as Profile[]);
    });
  }, [status]);

  if (status !== "instructor") return <Navigate to="/" />;
  return <>
    <PageHeader title="관리자" description="Supabase에 등록된 K-Move 사용자" />
    {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
    {rows === null && !error ? <Spinner /> : rows?.length === 0 ? <EmptyState title="등록된 사용자가 없습니다" reason="사용자가 회원가입하면 여기에 표시됩니다." /> : (
      <div className="space-y-2">{rows?.map((row) => <Panel key={row.id} className="flex items-center justify-between gap-3">
        <span className="font-semibold">{row.username}</span>
        <StatusBadge tone={row.role === "instructor" ? "success" : "neutral"}>{row.role === "instructor" ? "강사" : "수강생"}</StatusBadge>
      </Panel>)}</div>
    )}
    <div className="mt-10"><SetupGuide /></div>
  </>;
}
