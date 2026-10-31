import { useEffect, useState } from "react";
import { FolderCollection } from "@/components/FolderCollection";
import { PageHeader, Spinner } from "@/components/lms";
import { ASSIGNMENT_ROOT_FOLDER_URL, PORTFOLIO_ROOT_FOLDER_URL } from "@/data/student-roster";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

type FolderKind = "assignment" | "portfolio";
type FolderAccess = {
  user_id: string;
  name: string;
  google_email: string;
  assignment_folder_url: string;
  portfolio_folder_url: string;
  sharing_ready: boolean;
  sort_order: number;
};

const FOLDER_PAGES = {
  assignment: { title: "ASSIGNMENTS", label: "과제", tone: "sky", root: ASSIGNMENT_ROOT_FOLDER_URL },
  portfolio: { title: "PORTFOLIO", label: "포트폴리오", tone: "yellow", root: PORTFOLIO_ROOT_FOLDER_URL },
} as const;

export function StudentDriveFolders({ kind }: { kind: FolderKind }) {
  const { user, status } = useAuth();
  if (!user || (status !== "student" && status !== "instructor")) {
    return <><PageHeader title={FOLDER_PAGES[kind].title} /><Spinner label="로그인 상태 확인 중" /></>;
  }
  // A new identity/role unmounts all previously fetched rows before rendering.
  return <AuthorizedFolders key={`${user.id}:${status}:${kind}`} kind={kind} userId={user.id} instructor={status === "instructor"} />;
}

function AuthorizedFolders({ kind, userId, instructor }: { kind: FolderKind; userId: string; instructor: boolean }) {
  const [rows, setRows] = useState<FolderAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const page = FOLDER_PAGES[kind];

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    setRows([]);
    async function load() {
      try {
        let query = getSupabase().from("kmove_student_drive_folders")
          .select("user_id,name,google_email,assignment_folder_url,portfolio_folder_url,sharing_ready,sort_order");
        if (!instructor) query = query.eq("user_id", userId);
        const { data, error } = await query.order("sort_order", { ascending: true });
        if (error) throw error;
        if (!active) return;
        const permitted = (data ?? []) as FolderAccess[];
        // Database RLS is authoritative; this check also prevents accidental UI leakage.
        setRows(instructor ? permitted : permitted.filter(row => row.user_id === userId));
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [userId, instructor, attempt]);

  if (loading) return <><PageHeader title={page.title} /><Spinner label="내 폴더 확인 중" /></>;
  if (failed) return (
    <><PageHeader title={page.title} /><div role="alert" className="border-y border-border py-6">
      <p>폴더 정보를 불러오지 못했습니다.</p>
      <button onClick={() => setAttempt(value => value + 1)} className="mt-3 min-h-11 border border-foreground px-4 text-sm">다시 시도</button>
    </div></>
  );
  if (!rows.length) return (
    <><PageHeader title={page.title} /><p className="border-y border-border py-6 text-sm text-muted-foreground">이 계정에 연결된 폴더가 없습니다. 강사에게 문의해 주세요.</p></>
  );

  const own = instructor ? null : rows[0];
  if (own && !own.sharing_ready) return (
    <><PageHeader title={page.title} /><div role="status" className="border-y border-border py-6 text-sm">
      <p className="font-semibold">Google Drive 공유 권한 확인 중</p>
      <p className="mt-2 text-muted-foreground">{own.google_email}</p>
      <p className="mt-2 text-muted-foreground">공유 가능한 Google 계정을 강사에게 확인해 주세요. 권한이 준비되면 본인 폴더를 열 수 있습니다.</p>
    </div></>
  );

  return (
    <>
      <FolderCollection
        title={page.title}
        {...(instructor ? { rootFolderUrl: page.root } : {})}
        folders={rows.map(row => ({ name: row.name, url: kind === "assignment" ? row.assignment_folder_url : row.portfolio_folder_url }))}
        tone={page.tone}
        listLabel={instructor ? `수강생 ${page.label} 폴더` : `내 ${page.label} 폴더`}
      />
      {own && <div className="mt-6 border-t border-border pt-4 text-sm leading-relaxed">
        <p>Google Drive 계정: <span className="font-medium break-all">{own.google_email}</span></p>
        <p className="mt-1 text-muted-foreground">위 Google 계정으로 Drive에 로그인해 주세요. LMS 로그인과 Google 로그인은 별도로 유지됩니다.</p>
      </div>}
    </>
  );
}
