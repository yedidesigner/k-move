import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { useAuth } from "@/lib/auth";
import { Spinner } from "@/components/lms";
import { OperationsSettings } from "@/components/instructor/OperationsSettings";

const StudentManager = lazy(() =>
  import("@/components/instructor/StudentManager").then((module) => ({
    default: module.StudentManager,
  })),
);
const ContentManager = lazy(() =>
  import("@/components/instructor/ContentManager").then((module) => ({
    default: module.ContentManager,
  })),
);
const SessionManager = lazy(() =>
  import("@/components/instructor/SessionManager").then((module) => ({
    default: module.SessionManager,
  })),
);
type AdminTab = "students" | "content" | "sessions" | "settings";
export const Route = createFileRoute("/_app/admin")({
  head: () => ({
    meta: [{ title: "강사 관리 | K-Move LMS" }, { name: "robots", content: "noindex" }],
  }),
  validateSearch: (search: Record<string, unknown>): { tab?: AdminTab; type?: string } => ({
    ...(["students", "content", "sessions", "settings"].includes(String(search["tab"]))
      ? { tab: search["tab"] as AdminTab }
      : {}),
    ...(typeof search["type"] === "string" ? { type: search["type"] } : {}),
  }),
  component: Admin,
});
function Admin() {
  const { status, user } = useAuth();
  const { tab = "students", type } = Route.useSearch();
  if (status !== "instructor") return <Navigate to="/" />;
  const kind = (
    ["glossary", "guide", "path", "announcement"].includes(type ?? "") ? type : "glossary"
  ) as "glossary" | "guide" | "path" | "announcement";
  return (
    <div key={user?.id}>
      <nav
        aria-label="강사 관리"
        className="mb-6 flex flex-wrap gap-2 border-b border-neutral-200 pb-4"
      >
        {(
          [
            { tab: "students", label: "학생 관리" },
            { tab: "content", label: "콘텐츠 편집" },
            { tab: "sessions", label: "수업 편집" },
            { tab: "settings", label: "운영 설정" },
          ] as const
        ).map((item) => (
          <Link
            key={item.tab}
            to="/admin"
            search={{ tab: item.tab }}
            className={`inline-flex min-h-10 items-center border px-4 text-xs font-medium ${tab === item.tab ? "border-black bg-black text-white" : "border-neutral-300 hover:bg-neutral-100"}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Suspense fallback={<Spinner label="관리 화면을 불러오는 중" />}>
        {tab === "students" ? (
          <StudentManager />
        ) : tab === "content" ? (
          <ContentManager key={kind} initialKind={kind} />
        ) : tab === "sessions" ? (
          <SessionManager />
        ) : (
          <OperationsSettings />
        )}
      </Suspense>
    </div>
  );
}
