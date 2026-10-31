import { createFileRoute } from "@tanstack/react-router";
import { Glossary } from "@/components/Glossary";

export const Route = createFileRoute("/_app/glossary")({
  validateSearch: (search: Record<string, unknown>): { term?: string } =>
    typeof search["term"] === "string" && search["term"].trim()
      ? { term: search["term"].trim().slice(0, 160) }
      : {},
  head: () => ({
    meta: [
      { title: "UX/UI 용어집 | K-Move LMS" },
      {
        name: "description",
        content: "영어 용어를 클릭해 한국어 뜻과 설명을 확인하는 UX/UI 학습 카드",
      },
    ],
  }),
  component: GlossaryPage,
});

function GlossaryPage() {
  const { term = "" } = Route.useSearch();
  return <Glossary key={term} initialQuery={term} />;
}
