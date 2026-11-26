import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Spinner } from "@/components/lms";
import { AuthRedirect } from "@/components/AuthRedirect";
import { useAuth } from "@/lib/auth";
import { PublishedContentProvider } from "@/lib/published-content";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { status, user, needsPinSetup } = useAuth();
  const location = useLocation();
  if (status === "loading") return <Spinner />;
  if (status === "student" && needsPinSetup && location.pathname.replace(/\/+$/, "") !== "/password") {
    return <AuthRedirect to="/password" />;
  }
  if (status === "student" || status === "instructor")
    return (
      <PublishedContentProvider key={`${user?.id}:${status}`}>
        <AppShell key={`${user?.id}:${status}`}>
          <Outlet />
        </AppShell>
      </PublishedContentProvider>
    );
  return <AuthRedirect to="/login" />;
}
