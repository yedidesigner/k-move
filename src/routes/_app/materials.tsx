import { createFileRoute } from "@tanstack/react-router";
import { StudyMaterials } from "@/components/StudyMaterials";

export const Route = createFileRoute("/_app/materials")({
  head: () => ({
    meta: [
      { title: "디자인 학습 자료 | K-Move LMS" },
      {
        name: "description",
        content: "UX·UI 디자인 개념을 연결해 읽는 주제별 학습 가이드와 관련 용어",
      },
      { property: "og:title", content: "디자인 학습 자료 | K-Move LMS" },
      {
        property: "og:description",
        content: "UX 리서치부터 디자인 시스템과 케이스 스터디까지, 주제별 학습 가이드",
      },
    ],
  }),
  component: StudyMaterials,
});
