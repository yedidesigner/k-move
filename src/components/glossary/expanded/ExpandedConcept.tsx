import manifest from "@/data/expansion/manifest.json";
import { VisualConcept } from "./VisualConcept";
import { ProductionConcept } from "./ProductionConcept";
import { InteractionConcept } from "./InteractionConcept";
import { ResearchConcept } from "./ResearchConcept";

const groups = [
  { ids: manifest.visual, Component: VisualConcept },
  { ids: manifest.production, Component: ProductionConcept },
  { ids: manifest.interaction, Component: InteractionConcept },
  { ids: manifest.research, Component: ResearchConcept },
];
const byId = new Map(
  groups.flatMap(({ ids, Component }) => ids.map((id) => [id, Component] as const)),
);

export function ExpandedConcept({ termId }: { termId: string }) {
  const Diagram = byId.get(termId);
  return Diagram ? (
    <div className="gl-expanded-concept" data-expanded-concept={termId}>
      <Diagram termId={termId} />
    </div>
  ) : null;
}
