import { useId, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import type { GlossaryEntry } from "@/data/glossary";
import type { GlossaryLearning } from "@/data/learning/types";
import type { GlossaryPractice } from "@/data/practice/types";
import { GlossaryExampleFigure } from "./GlossaryExampleFigure";
import { PracticeExercise } from "./GlossaryPracticeLesson";
import "./glossary-learning.css";
import { RelatedDesignGuides } from "../StudyMaterials";
import { GlossaryDepthPanel, GlossarySourceDetails } from "./GlossaryDepthPanel";
import { LessonTabs } from "./LessonTabs";
import { VisualGlossaryLesson, VISUAL_LESSONS } from "./VisualGlossaryLesson";
import { hasExpandedPractice } from "@/data/expansion/practice";
import { InteractionLab } from "./expanded/InteractionLab";

function LessonSection({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <section className="gl-section" aria-labelledby={id}>
      <h3 id={id}>{title}</h3>
      {children}
    </section>
  );
}

export function GlossaryLearningLesson({
  entry,
  learning,
  practice,
}: {
  entry: GlossaryEntry;
  learning: GlossaryLearning;
  practice?: GlossaryPractice | undefined;
}) {
  const [definition, note] = entry.description.split("[실무 참고]");
  const expandedPractice = hasExpandedPractice(entry.id);
  const hasPractice =
    learning.mode === "practice" && Boolean(practice || entry.lessonId || expandedPractice);
  return (
    <article className="gp-lesson gl-lesson" data-learning-mode={learning.mode}>
      <header className="gl-header">
        <p className="gl-eyebrow">DESIGN GLOSSARY</p>
        <h2 lang="en">{entry.lessonId ? VISUAL_LESSONS[entry.lessonId].english : entry.english}</h2>
        <p className="gl-pronunciation">
          [{entry.pronunciation}] / {entry.korean}
        </p>
        <p className="gl-definition">{definition}</p>
      </header>
      <LessonTabs
        items={[
          {
            id: "structure",
            label: "핵심 구조",
            content: (
              <LessonSection title="핵심 구조">
                {entry.lessonId ? (
                  <VisualGlossaryLesson lessonId={entry.lessonId} stage="structure" hideHeader />
                ) : (
                  <GlossaryExampleFigure
                    figure={learning.figure}
                    termId={entry.id}
                    presentation="structure"
                  />
                )}
                <p className="gl-essential">{learning.figure.focus}</p>
              </LessonSection>
            ),
          },
          {
            id: "example",
            label: hasPractice ? "예시 · 실습" : "예시 보기",
            content: (
              <>
                {entry.lessonId ? (
                  <VisualGlossaryLesson lessonId={entry.lessonId} stage="example" hideHeader />
                ) : (
                  <LessonSection title="실제 맥락에서 보기">
                    <GlossaryExampleFigure
                      figure={learning.figure}
                      termId={entry.id}
                      presentation="context"
                    />
                  </LessonSection>
                )}
                {hasPractice && practice && !entry.lessonId && (
                  <LessonSection title="직접 해보기">
                    <p className="gp-scenario">
                      <span>연습 상황</span>
                      {practice.scenario}
                    </p>
                    <p className="gp-instruction">{practice.instruction}</p>
                    <PracticeExercise practice={practice} />
                  </LessonSection>
                )}
                {hasPractice && expandedPractice && (
                  <LessonSection title="직접 해보기">
                    <InteractionLab termId={entry.id} />
                  </LessonSection>
                )}
                {learning.references.length > 0 && (
                  <details className="gl-more-examples">
                    <summary>실제 사례 더 보기</summary>
                    <ul className="gl-references">
                      {learning.references.map((reference, index) => (
                        <li key={`${reference.url}-${index}`}>
                          <a href={reference.url} target="_blank" rel="noopener noreferrer">
                            {reference.title}
                            <ArrowUpRight size={16} aria-hidden="true" />
                            <span className="gl-sr-only"> (새 탭)</span>
                          </a>
                          <p>{reference.note}</p>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                {!entry.lessonId && (
                  <LessonSection title="기억할 점">
                    <p className="gl-takeaway">
                      {practice?.takeaway || note?.trim() || learning.figure.caption}
                    </p>
                  </LessonSection>
                )}
              </>
            ),
          },
          {
            id: "reasoning",
            label: "실무 해설",
            content: (
              <>
                <GlossaryDepthPanel termId={entry.id} />
                <RelatedDesignGuides termId={entry.id} />
              </>
            ),
          },
        ]}
      />
      <GlossarySourceDetails termId={entry.id} />
    </article>
  );
}
