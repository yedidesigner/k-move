import { GlossaryTermLink } from "./GlossaryTermLink";
import { GLOSSARY } from "@/data/glossary";
import { getGlossaryDepth } from "@/data/glossary-depth";
import { TOPICS, sourceReference } from "@/data/design-sources";
import "./glossary-depth.css";

export function GlossaryDepthPanel({ termId }: { termId: string }) {
  const profile = getGlossaryDepth(termId);
  if (!profile) return null;
  const topic = TOPICS.find((item) => item.id === profile.topic);
  return (
    <section className="gd-panel" aria-label="용어 실무 해설" data-depth-term={termId}>
      <header className="gd-heading">
        <span>{topic?.label}</span>
        <h3>왜 이렇게 설계할까?</h3>
        <p>{profile.essential}</p>
      </header>
      <details className="gd-disclosure" open>
        <summary>
          실무에 적용하기 <span>상황과 선택</span>
        </summary>
        <p className="gd-example-note">
          학습용 가상 상황 · 적용 방식은 제품과 사용자 맥락에 따라 달라집니다.
        </p>
        <dl className="gd-reading">
          <div>
            <dt>상황</dt>
            <dd>{profile.application.scenario}</dd>
          </div>
          <div>
            <dt>설계 판단</dt>
            <dd>{profile.application.decision}</dd>
          </div>
        </dl>
      </details>
      <details className="gd-disclosure">
        <summary>
          판단 기준 더 보기 <span>한계와 검증</span>
        </summary>
        <dl className="gd-reading">
          <div>
            <dt>한계·트레이드오프</dt>
            <dd>{profile.critique.tradeoff}</dd>
          </div>
          <div>
            <dt>확인할 근거</dt>
            <dd>{profile.critique.evidence}</dd>
          </div>
        </dl>
      </details>
      {profile.confusedWith.length > 0 && (
        <section className="gd-comparison" aria-label="헷갈리는 용어 구분">
          <h4>헷갈리는 용어 구분</h4>
          <ul>
            {profile.confusedWith.map((item) => {
              const other = GLOSSARY.find((entry) => entry.id === item.id);
              return other ? (
                <li key={item.id}>
                  <GlossaryTermLink termId={other.id}>
                    <span lang="en">{other.english}</span>
                    <span>{other.korean} ↗</span>
                  </GlossaryTermLink>
                  <p>{item.difference}</p>
                </li>
              ) : null;
            })}
          </ul>
        </section>
      )}
    </section>
  );
}

export function GlossarySourceDetails({ termId }: { termId: string }) {
  const profile = getGlossaryDepth(termId);
  if (!profile) return null;
  return (
    <details className="gd-sources gd-source-footer">
      <summary>출처·제작 정보</summary>
      <p>
        용어 설명과 적용 예시는 K-Move 학습용으로 정리했습니다. 문헌 근거와 편집 해설의 범위를
        아래에 표시합니다.
      </p>
      {profile.sourceRefs.length > 0 && (
        <ul>
          {profile.sourceRefs.map((citation, index) => {
            const reference = sourceReference(citation);
            return (
              <li key={`${citation.sourceId}-${index}`}>
                <strong>{reference.title}</strong>
                <span>{reference.location}</span>
                <small>{reference.note}</small>
              </li>
            );
          })}
        </ul>
      )}
      {profile.sourceNote && <p className="gd-source-scope">{profile.sourceNote}</p>}
      {profile.webReferences && profile.webReferences.length > 0 && (
        <ul>
          {profile.webReferences.map((reference) => (
            <li key={reference.url}>
              <strong>
                <a href={reference.url} target="_blank" rel="noopener noreferrer">
                  {reference.title} ↗<span className="sr-only"> (새 탭)</span>
                </a>
              </strong>
              <small>{reference.note}</small>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}
