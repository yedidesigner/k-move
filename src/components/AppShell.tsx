import { Link, useLocation } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Home,
  CalendarDays,
  BookOpen,
  Library,
  ClipboardList,
  Briefcase,
  MessageSquareText,
  Wrench,
  LogOut,
  KeyRound,
  Handshake,
  Users,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { SITE_NAME, COURSE_NAME } from "@/data/schedule";
import { useAuth } from "@/lib/auth";
import { requestEditorExit } from "@/lib/editor-exit-guard";

const STUDENT_NAV = [
  { to: "/", label: "홈", icon: Home },
  { to: "/sessions", label: "전체 수업", icon: CalendarDays },
  { to: "/glossary", label: "용어집", icon: BookOpen },
  { to: "/materials", label: "학습자료", icon: Library },
  { to: "/assignments", label: "과제", icon: ClipboardList },
  { to: "/portfolio", label: "내 포트폴리오", icon: Briefcase },
  { to: "/feedback", label: "피드백", icon: MessageSquareText },
  { to: "/tools", label: "실습 도구", icon: Wrench },
  { to: "/promises", label: "우리의 약속", icon: Handshake },
] as const;
const INSTRUCTOR_NAV = [
  { to: "/", label: "강사 홈", icon: Home, group: "수업 운영" },
  { to: "/sessions", label: "수업 관리", icon: CalendarDays, group: "수업 운영" },
  { to: "/assignments", label: "과제·피드백", icon: ClipboardList, group: "수업 운영" },
  { to: "/admin", label: "학생 관리", icon: Users, group: "수업 운영" },
  { to: "/portfolio", label: "학생 포트폴리오", icon: Briefcase, group: "수업 운영" },
  { to: "/glossary", label: "용어집", icon: BookOpen, group: "학습 콘텐츠" },
  { to: "/materials", label: "학습자료", icon: Library, group: "학습 콘텐츠" },
  { to: "/tools", label: "실습 도구", icon: Wrench, group: "보조 메뉴" },
  { to: "/promises", label: "우리의 약속", icon: Handshake, group: "보조 메뉴" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { status, user, signOut } = useAuth();
  const instructor = status === "instructor";
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const feedback = location.pathname === "/feedback";
  const nav = instructor ? INSTRUCTOR_NAV : STUDENT_NAV;
  const mobilePaths = instructor
    ? ["/", "/assignments", "/admin", "/sessions", "/portfolio"]
    : ["/", "/sessions", "/glossary", "/materials", "/assignments"];
  const linkCls =
    "flex min-h-11 items-center gap-3 border-l-2 border-transparent px-3 text-sm font-medium transition-colors hover:bg-sidebar-accent data-[nav-active=true]:border-sidebar-primary data-[nav-active=true]:bg-sidebar-primary data-[nav-active=true]:text-sidebar-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2";
  const activeTab = (location.search as Record<string, unknown>)["tab"] ?? "students";
  const navActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : instructor && path === "/assignments"
        ? ["/assignments", "/feedback"].includes(location.pathname)
        : instructor && path === "/admin"
          ? location.pathname === "/admin" && activeTab !== "settings"
          : location.pathname.startsWith(path);
  const accountName = user?.user_metadata?.["username"] ?? user?.email;
  async function logout() {
    setLogoutError(false);
    try {
      if (!(await requestEditorExit())) return;
      await signOut();
    } catch {
      setLogoutError(true);
    }
  }
  return (
    <div className="min-h-screen bg-background md:flex">
      <a
        href="#lms-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-white focus:p-3 focus:text-black"
      >
        본문 바로가기
      </a>
      <aside
        className={`hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:sticky md:top-0 md:flex md:h-screen ${instructor ? (collapsed ? "md:w-[68px]" : "md:w-56") : feedback ? "md:w-80" : "md:w-72"}`}
      >
        <div
          className={`shrink-0 border-b border-sidebar-border ${instructor ? "px-4 py-6" : "px-6 py-10"}`}
        >
          <div className="flex items-start justify-between gap-2">
            {!collapsed || !instructor ? (
              <p
                className={`font-bold leading-[1.2] tracking-tight ${instructor ? "text-xl" : "text-2xl"}`}
              >
                <span className="block">K-MOVE</span>
                <span className="block">DESIGN</span>
              </p>
            ) : (
              <span className="text-lg font-bold">K</span>
            )}
            {instructor && (
              <button
                type="button"
                onClick={() => setCollapsed((value) => !value)}
                className="flex min-h-8 min-w-8 items-center justify-center hover:bg-muted"
                aria-label={collapsed ? "메뉴 펼치기" : "메뉴 접기"}
              >
                {collapsed ? (
                  <PanelLeftOpen className="size-4" />
                ) : (
                  <PanelLeftClose className="size-4" />
                )}
              </button>
            )}
          </div>
          {(!collapsed || !instructor) && (
            <p
              className={`${instructor ? "mt-4 text-xs" : "mt-7 text-[13px]"} font-light leading-relaxed tracking-tight text-muted-foreground break-keep`}
            >
              {SITE_NAME}
            </p>
          )}
        </div>
        <nav
          aria-label={instructor ? "강사 주요 메뉴" : "주요 메뉴"}
          className="flex-1 space-y-1 overflow-y-auto px-2 py-4"
        >
          {nav.map((item, index) => {
            const Icon = item.icon;
            const group = "group" in item ? item.group : null;
            const previous = nav[index - 1];
            const previousGroup = previous && "group" in previous ? previous.group : null;
            return (
              <div key={item.to}>
                {group && group !== previousGroup && !collapsed && (
                  <p
                    className={`${index ? "mt-6" : ""} px-3 pb-2 text-[11px] font-semibold tracking-wide text-muted-foreground`}
                  >
                    {group}
                  </p>
                )}
                <Link
                  to={item.to}
                  data-nav-active={navActive(item.to)}
                  className={linkCls}
                  activeOptions={{ exact: item.to === "/" }}
                  title={collapsed && instructor ? item.label : undefined}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />{" "}
                  <span className={collapsed && instructor ? "sr-only" : ""}>{item.label}</span>
                </Link>
              </div>
            );
          })}
          {instructor && (
            <Link
              to="/admin"
              search={{ tab: "settings" }}
              data-nav-active={location.pathname === "/admin" && activeTab === "settings"}
              className={`${linkCls} mt-3`}
              title={collapsed ? "운영 설정" : undefined}
            >
              <Settings className="size-4 shrink-0" aria-hidden />
              <span className={collapsed ? "sr-only" : ""}>운영 설정</span>
            </Link>
          )}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          {(!collapsed || !instructor) && (
            <p className="flex items-center gap-2 text-sm">
              <span className="truncate">{accountName}</span>
              {instructor && (
                <span className="shrink-0 border border-border px-1.5 py-0.5 text-[10px] font-semibold">
                  강사
                </span>
              )}
            </p>
          )}
          <Link
            to="/password"
            title="비밀번호 변경"
            className="mt-2 flex min-h-10 items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <KeyRound className="size-4 shrink-0" aria-hidden />
            <span className={collapsed && instructor ? "sr-only" : ""}>비밀번호 변경</span>
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            title="로그아웃"
            className="flex min-h-10 items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4 shrink-0" aria-hidden />
            <span className={collapsed && instructor ? "sr-only" : ""}>로그아웃</span>
          </button>
          {logoutError && (
            <p role="alert" className="text-xs text-destructive">
              로그아웃에 실패했습니다. 다시 시도해 주세요.
            </p>
          )}
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="border-b border-border bg-card px-4 py-3 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold">K-MOVE DESIGN</p>
            {instructor && <span className="text-xs">{accountName} · 강사</span>}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{COURSE_NAME}</p>
          <details className="mt-1">
            <summary className="min-h-10 cursor-pointer py-2 text-xs font-medium">
              {instructor ? "전체 메뉴" : "추가 메뉴"}
            </summary>
            <nav aria-label="모바일 전체 메뉴" className="flex flex-wrap gap-2 pb-2">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="min-h-10 border border-border px-3 py-2 text-xs"
                >
                  {item.label}
                </Link>
              ))}
              {instructor && (
                <Link
                  to="/admin"
                  search={{ tab: "settings" }}
                  className="min-h-10 border border-border px-3 py-2 text-xs"
                >
                  운영 설정
                </Link>
              )}
              <Link to="/password" className="min-h-10 border border-border px-3 py-2 text-xs">
                비밀번호 변경
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="min-h-10 border border-border px-3 py-2 text-xs"
              >
                로그아웃
              </button>
            </nav>
            {logoutError && (
              <p role="alert" className="text-xs text-destructive">
                로그아웃에 실패했습니다. 다시 시도해 주세요.
              </p>
            )}
          </details>
        </header>
        <main
          id="lms-main"
          tabIndex={-1}
          className={
            instructor
              ? "mx-auto w-full min-w-0 max-w-[1600px] px-4 pb-24 pt-6 outline-none md:px-7 md:pb-10 lg:px-9"
              : feedback
                ? "min-w-0 w-full p-0 outline-none"
                : "mx-auto min-w-0 w-full max-w-5xl px-4 pb-28 pt-6 outline-none md:px-10 md:pb-12 md:pt-10"
          }
        >
          {children}
        </main>
      </div>
      <nav
        aria-label="하단 메뉴"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {mobilePaths
          .map((path) => nav.find((item) => item.to === path))
          .filter((item) => !!item)
          .map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                data-nav-active={navActive(item.to)}
                activeOptions={{ exact: item.to === "/" }}
                className="flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] data-[nav-active=true]:bg-primary data-[nav-active=true]:text-primary-foreground"
              >
                <Icon className="size-5" aria-hidden />
                {instructor
                  ? (
                      {
                        "/": "홈",
                        "/assignments": "과제·피드백",
                        "/admin": "학생",
                        "/sessions": "수업",
                        "/portfolio": "포트폴리오",
                      } as Record<string, string>
                    )[item.to]
                  : item.label.replace("내 ", "")}
              </Link>
            );
          })}
      </nav>
    </div>
  );
}
