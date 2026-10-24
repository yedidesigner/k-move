import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Spinner } from "@/components/lms";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { status } = useAuth();
  if (status === "loading") return <Spinner />;
  if (status === "student" || status === "instructor")
    return (
      <AppShell>
        <Outlet />
      </AppShell>
    );
  return <Navigate to="/login" />;
}
