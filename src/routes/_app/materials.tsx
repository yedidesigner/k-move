import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/lms";

export const Route = createFileRoute("/_app/materials")({
  head: () => ({
    meta: [
      { title: "자료실 | K-Move LMS" },
      { name: "description", content: "회차별 교재·실습 파일·프롬프트 자료" },
      { property: "og:title", content: "자료실" },
      { property: "og:description", content: "회차별 교재·실습 파일·프롬프트 자료" },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="자료실" description="회차별 교재, 실습 파일, 프롬프트 자료" />
      <EmptyState title="공개된 자료가 없습니다" reason="자료 목록이 확정되어 공개되면 회차별로 표시됩니다." />
    </>
  ),
});
