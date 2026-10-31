import { createFileRoute } from "@tanstack/react-router";
import { Glossary } from "@/components/Glossary";
import { useAuth } from "@/lib/auth";

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
  const { status } = useAuth();
  const { term = "" } = Route.useSearch();
  return (
    <>
      {status === "instructor" && (
        <div className="mb-5 flex justify-end">
          <a
            href="/admin?tab=content&type=glossary"
            className="inline-flex min-h-11 items-center border border-neutral-300 px-4 text-sm font-medium"
          >
            용어 편집·추가
          </a>
        </div>
      )}
      <Glossary key={term} initialQuery={term} />
    </>
  );
}
