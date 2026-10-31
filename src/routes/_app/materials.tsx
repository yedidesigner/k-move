import { createFileRoute } from "@tanstack/react-router";
import { StudyMaterials } from "@/components/StudyMaterials";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/materials")({
  validateSearch: (search: Record<string, unknown>): { guide?: string } =>
    typeof search["guide"] === "string" && /^[a-z0-9-]{1,100}$/.test(search["guide"])
      ? { guide: search["guide"] }
      : {},
  head: () => ({
    meta: [
      { title: "디자인 학습자료 | K-Move LMS" },
      {
        name: "description",
        content: "디자인 이론을 주제별로 연결하고 설계 판단과 자신의 작업에 적용하는 학습자료",
      },
    ],
  }),
  component: MaterialsPage,
});

function MaterialsPage() {
  const { status } = useAuth();
  const { guide } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <>
      {status === "instructor" && (
        <div className="mb-5 flex flex-wrap justify-end gap-2">
          <a
            href="/admin?tab=content&type=guide"
            className="inline-flex min-h-11 items-center border border-neutral-300 px-4 text-sm font-medium"
          >
            학습자료 편집
          </a>
          <a
            href="/admin?tab=content&type=path"
            className="inline-flex min-h-11 items-center border border-neutral-300 px-4 text-sm font-medium"
          >
            학습 순서 관리
          </a>
        </div>
      )}
      <StudyMaterials
        guideId={guide}
        onGuideChange={(id) => {
          void navigate({ search: id ? { guide: id } : {} });
        }}
      />
    </>
  );
}
