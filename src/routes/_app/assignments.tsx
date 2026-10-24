import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/lms";

export const Route = createFileRoute("/_app/assignments")({
  head: () => ({
    meta: [
      { title: "과제 | K-Move LMS" },
      { name: "description", content: "과제 안내, 마감, 제출 상태와 피드백" },
      { property: "og:title", content: "과제" },
      { property: "og:description", content: "과제 안내, 마감, 제출 상태와 피드백" },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="과제" description="과제 안내, 마감일, 제출 상태, 개인 피드백" />
      <EmptyState title="등록된 과제가 없습니다" reason="과제가 확정되면 이곳에서 안내와 제출 링크를 확인할 수 있습니다." />
    </>
  ),
});
