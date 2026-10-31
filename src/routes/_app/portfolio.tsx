import { createFileRoute } from "@tanstack/react-router";
import { PortfolioManager } from "@/components/instructor/PortfolioManager";

export const Route = createFileRoute("/_app/portfolio")({
  head: () => ({
    meta: [
      { title: "포트폴리오 | K-Move LMS" },
      { name: "description", content: "프로젝트별 작업 버전과 수정 이력" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  return <PortfolioManager />;
}
