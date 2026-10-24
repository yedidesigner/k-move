import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Home,
  CalendarDays,
  FolderOpen,
  ClipboardList,
  Briefcase,
  Wrench,
  Shield,
  LogOut,
} from "lucide-react";
import { SITE_NAME, COURSE_NAME } from "@/data/schedule";
import { useAuth } from "@/lib/auth";

const NAV = [
  { to: "/", label: "홈", icon: Home },
  { to: "/sessions", label: "전체 수업", icon: CalendarDays },
  { to: "/materials", label: "자료실", icon: FolderOpen },
  { to: "/assignments", label: "과제", icon: ClipboardList },
  { to: "/portfolio", label: "내 포트폴리오", icon: Briefcase },
  { to: "/tools", label: "실습 도구", icon: Wrench },
] as const;

const MOBILE = ["/", "/sessions", "/materials", "/assignments", "/portfolio"];

export function AppShell({ children }: { children: ReactNode }) {
  const { status, user, signOut } = useAuth();
  const isInstructor = status === "instructor";
  const linkCls =
    "flex min-h-12 items-center gap-3 border-l-2 border-transparent px-4 text-sm font-medium transition-colors hover:bg-sidebar-accent data-[status=active]:border-sidebar-primary data-[status=active]:bg-sidebar-primary data-[status=active]:text-sidebar-primary-foreground";
  const active = { className: "font-semibold" };

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex md:sticky md:top-0 md:h-screen">
        <div className="border-b border-sidebar-border px-6 py-7">
          <p className="mb-4 text-2xl font-bold tracking-tight">
            K-MOVE
            <span className="ml-2 text-xs font-medium tracking-[0.16em] text-muted-foreground">
              LMS
            </span>
          </p>
          <p className="text-base font-bold leading-snug text-sidebar-foreground break-keep">
            {SITE_NAME}
          </p>
          <p className="mt-1 text-sm text-muted-foreground break-keep">{COURSE_NAME}</p>
        </div>
        <nav aria-label="주요 메뉴" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={linkCls}
              activeProps={active}
              activeOptions={{ exact: to === "/" }}
            >
              <Icon className="h-4 w-4" aria-hidden /> {label}
            </Link>
          ))}
          {isInstructor && (
            <div className="mt-4 border-t border-sidebar-border pt-4">
              <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground">강사 메뉴</p>
              <Link to="/admin" className={linkCls} activeProps={active}>
                <Shield className="h-4 w-4" aria-hidden /> 관리자
              </Link>
            </div>
          )}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <p className="truncate text-sm text-foreground">
            {user?.user_metadata?.["username"] ?? user?.email}
          </p>
          <button
            onClick={() => void signOut()}
            className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden /> 로그아웃
          </button>
        </div>
      </aside>

      <header className="border-b border-border bg-card px-4 py-3 md:hidden">
        <p className="text-sm font-bold leading-snug text-foreground break-keep">{SITE_NAME}</p>
        <p className="text-xs text-muted-foreground break-keep">{COURSE_NAME}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            to="/tools"
            className="border border-border px-3 py-2 text-xs transition-colors hover:bg-muted"
          >
            실습 도구
          </Link>
          {isInstructor && (
            <Link
              to="/admin"
              className="border border-border px-3 py-2 text-xs transition-colors hover:bg-muted"
            >
              관리자
            </Link>
          )}
          <button
            onClick={() => void signOut()}
            className="border border-border px-3 py-2 text-xs transition-colors hover:bg-muted"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="mx-auto min-w-0 w-full max-w-5xl flex-1 px-4 pb-28 pt-6 md:px-10 md:pb-12 md:pt-10">
        {children}
      </main>

      <nav
        aria-label="하단 메뉴"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {NAV.filter((n) => MOBILE.includes(n.to)).map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
            activeProps={{ className: "font-semibold" }}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {label.replace("내 ", "")}
          </Link>
        ))}
      </nav>
    </div>
  );
}
