import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { loadDashboard } from "@/lib/survey-api";
import { type Profile, type SurveyResponse } from "@/lib/survey";
import { Spinner } from "@/components/lms";
import { InstructorDashboard } from "@/components/InstructorDashboard";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({
    meta: [{ title: "강사 대시보드 | K-Move LMS" }, { name: "robots", content: "noindex" }],
  }),
  component: Admin,
});

function Admin() {
  const { status } = useAuth();
  const [data, setData] = useState<{ profiles: Profile[]; responses: SurveyResponse[] } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(true);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (status !== "instructor") return;
    let active = true;
    setRefreshing(true);
    setError(null);
    void loadDashboard()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setRefreshing(false);
      });
    return () => {
      active = false;
    };
  }, [status, refresh]);
  if (status === "loading") return <Spinner />;
  if (status !== "instructor") return <Navigate to="/" />;
  return (
    <>
      {error && (
        <div role="alert" className="mb-5 border-l-2 border-foreground bg-muted p-5">
          <p className="text-sm">{error}</p>
          <button
            className="mt-3 min-h-11 border border-border px-4 text-sm"
            onClick={() => setRefresh((r) => r + 1)}
          >
            다시 불러오기
          </button>
        </div>
      )}
      {!data ? (
        refreshing && <Spinner />
      ) : (
        <InstructorDashboard
          {...data}
          refreshing={refreshing}
          onRefresh={() => setRefresh((r) => r + 1)}
        />
      )}
    </>
  );
}
