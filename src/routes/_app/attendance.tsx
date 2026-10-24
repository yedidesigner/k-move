import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/lms";

export const Route = createFileRoute("/_app/attendance")({
  head: () => ({
    meta: [
      { title: "내 출석 | K-Move LMS" },
      { name: "description", content: "강사가 확정한 본인 출석 기록" },
      { property: "og:title", content: "내 출석" },
      { property: "og:description", content: "강사가 확정한 본인 출석 기록" },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="내 출석" description="강사가 확정한 기록을 읽기 전용으로 보여줍니다." />
      <EmptyState title="확정된 출석 기록이 없습니다" reason="강사가 출석을 확정하면 이곳에 표시됩니다." />
    </>
  ),
});
