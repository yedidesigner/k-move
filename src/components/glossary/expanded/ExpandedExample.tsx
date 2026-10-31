import manifest from "@/data/expansion/manifest.json";
import { VisualExamples } from "./VisualExamples";
import { ProductionExamples } from "./ProductionExamples";
import { InteractionExamples } from "./InteractionExamples";
import { ResearchExamples } from "./ResearchExamples";

const groups = [
  { ids: manifest.visual, Component: VisualExamples },
  { ids: manifest.production, Component: ProductionExamples },
  { ids: manifest.interaction, Component: InteractionExamples },
  { ids: manifest.research, Component: ResearchExamples },
];
const byId = new Map(
  groups.flatMap(({ ids, Component }) => ids.map((id) => [id, Component] as const)),
);
export function ExpandedExample({ termId }: { termId: string }) {
  const Scene = byId.get(termId);
  if (!Scene) return null;
  return (
    <div className="gl-expanded-example" data-expanded-example={termId}>
      {manifest.production.includes(termId) && (
        <p className="gl-expanded-label">교육용 가상 예시 · 정적 자료</p>
      )}
      <Scene termId={termId} />
    </div>
  );
}
