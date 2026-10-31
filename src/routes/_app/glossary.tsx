import { createFileRoute } from "@tanstack/react-router";
import { Glossary } from "@/components/Glossary";

export const Route = createFileRoute("/_app/glossary")({
  validateSearch: (search: Record<string, unknown>): { term?: string } =>
    typeof search["term"] === "string" && search["term"].trim()
      ? { term: search["term"].trim().slice(0, 160) }
      : {},
  head: () => ({
    meta: [
      { title: "디자인 용어집 | K-Move LMS" },
      {
        name: "description",
        content:
          "타이포그래피, 색상, UX·UI, 리서치, 브랜딩과 제작을 정의·시각 예시·실습으로 연결하는 디자인 용어집",
      },
    ],
  }),
  component: GlossaryPage,
});

function GlossaryPage() {
  const { term = "" } = Route.useSearch();
  return <Glossary key={term} initialQuery={term} />;
}
