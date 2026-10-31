import type { LearningFigure } from "@/data/learning/types";
import { VisualScenes, VISUAL_TERM_IDS } from "./VisualScenes";
import { InteractionScenes, INTERACTION_TERM_IDS } from "./InteractionScenes";
import { ArtifactScenes, ARTIFACT_TERM_IDS } from "./ArtifactScenes";
import { WorkScenes, WORK_TERM_IDS } from "./WorkScenes";
import { ResearchScenes, RESEARCH_TERM_IDS } from "./ResearchScenes";
import "./context-frame.css";

export const CONTEXTUAL_GROUPS = [
  { name: "visual", ids: VISUAL_TERM_IDS, Component: VisualScenes },
  { name: "interaction", ids: INTERACTION_TERM_IDS, Component: InteractionScenes },
  { name: "artifacts", ids: ARTIFACT_TERM_IDS, Component: ArtifactScenes },
  { name: "work", ids: WORK_TERM_IDS, Component: WorkScenes },
  { name: "research", ids: RESEARCH_TERM_IDS, Component: ResearchScenes },
] as const;

const contextualById = new Map(
  CONTEXTUAL_GROUPS.flatMap((group) => group.ids.map((id) => [id, group.Component] as const)),
);

export function hasContextualExample(id: string) {
  return contextualById.has(id);
}

export function ContextualExample({ termId, figure }: { termId: string; figure: LearningFigure }) {
  const Scene = contextualById.get(termId);
  if (!Scene) return null;
  return (
    <div className="cx-example" data-contextual-term={termId}>
      <div className="cx-section-label">
        <strong>실제 맥락에서 보기</strong>
        <span>학습용 가상 예시 · 정적 화면</span>
      </div>
      <Scene termId={termId} figure={figure} />
      {termId !== "curb-cut" && (
        <p className="cx-source-note">
          화면의 구성과 표시된 부분을 관찰해 보세요. 이 예시 안의 버튼·메뉴는 화면 설명용입니다.
        </p>
      )}
      <details className="cx-photo-credits">
        <summary>예시 사진 출처</summary>
        <p>학습용 화면에 사용하는 사진 · Unsplash</p>
        <ul>
          <li>
            <a
              href="https://unsplash.com/photos/the-sun-shines-through-the-tall-trees-in-the-forest-cfAjqji6bLw"
              target="_blank"
              rel="noopener noreferrer"
            >
              숲 · Adrien Olichon
            </a>
          </li>
          <li>
            <a
              href="https://unsplash.com/photos/rocky-coast-meets-the-blue-ocean-under-a-clear-sky-8n3adyIkyiY"
              target="_blank"
              rel="noopener noreferrer"
            >
              해안 · Aditya Rajguru
            </a>
          </li>
          <li>
            <a
              href="https://unsplash.com/photos/brown-desert-under-blue-sky-2BMSj-xN008"
              target="_blank"
              rel="noopener noreferrer"
            >
              사막 · Mark Kuiper
            </a>
          </li>
        </ul>
      </details>
    </div>
  );
}
