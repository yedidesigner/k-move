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
        <h3>개념에서 실무 판단으로</h3>
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
          한 단계 더 깊게 <span>한계와 검증</span>
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
                  <a href={`/glossary?term=${encodeURIComponent(other.english)}`}>
                    <span lang="en">{other.english}</span>
                    <span>{other.korean} ↗</span>
                  </a>
                  <p>{item.difference}</p>
                </li>
              ) : null;
            })}
          </ul>
        </section>
      )}
      <details className="gd-disclosure gd-sources">
        <summary>
          학습 근거와 적용 범위{" "}
          <span>
            {profile.sourceRefs.length ? `${profile.sourceRefs.length}개 참고` : "편집 해설"}
          </span>
        </summary>
        <p>
          실무 상황과 판단 예시는 K-Move에서 학습용으로 재구성했습니다. 개념 근거·적용 참고·관련
          맥락을 구분해 표시합니다.
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
        {profile.sourceNote && <p>{profile.sourceNote}</p>}
        {!profile.sourceRefs.length && !profile.sourceNote && (
          <p>
            제공된 PDF에서 이 용어의 직접적인 설명을 확인하지 못했습니다. 기존 용어 정의를 바탕으로
            적용·비교 관점을 편집했습니다.
          </p>
        )}
        <a href="/materials">주제별 가이드와 참고 자료 보기 ↗</a>
      </details>
    </section>
  );
}
