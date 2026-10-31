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
  const hasPractice = learning.mode === "practice" && practice;
  return (
    <article className="gp-lesson gl-lesson" data-learning-mode={learning.mode}>
      <header className="gl-header">
        <p className="gl-eyebrow">UX / UI GLOSSARY</p>
        <h2 lang="en">{entry.english}</h2>
        <p className="gl-pronunciation">
          [{entry.pronunciation}] / {entry.korean}
        </p>
        <p className="gl-definition">{definition}</p>
      </header>
      <LessonSection title="시각 예시">
        <GlossaryExampleFigure figure={learning.figure} termId={entry.id} />
      </LessonSection>
      {learning.references.length > 0 && (
        <LessonSection title="실제 사례 더 보기">
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
        </LessonSection>
      )}
      {hasPractice && (
        <LessonSection title="직접 해보기">
          {learning.practiceReason && (
            <p className="gl-practice-reason">{learning.practiceReason}</p>
          )}
          <p className="gp-scenario">
            <span>연습 상황</span>
            {practice.scenario}
          </p>
          <p className="gp-instruction">{practice.instruction}</p>
          <PracticeExercise practice={practice} />
        </LessonSection>
      )}
      <GlossaryDepthPanel termId={entry.id} />
      <LessonSection title="기억할 점">
        <p className="gl-takeaway">
          {practice?.takeaway || note?.trim() || learning.figure.caption}
        </p>
      </LessonSection>
      <RelatedDesignGuides termId={entry.id} />
      <GlossarySourceDetails termId={entry.id} />
    </article>
  );
}
