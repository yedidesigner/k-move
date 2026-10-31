import { useId, useRef, useState, type ReactNode } from "react";

export function LessonTabs({
  items,
}: {
  items: { id: string; label: string; content: ReactNode }[];
}) {
  const uid = useId();
  const [active, setActive] = useState(0);
  const [visited, setVisited] = useState(() => new Set([0]));
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  function select(index: number, focus = false) {
    setActive(index);
    setVisited((previous) => new Set([...previous, index]));
    if (focus) buttons.current[index]?.focus();
  }
  return (
    <div className="gl-lesson-steps">
      <div role="tablist" aria-label="용어 학습 단계" className="gl-step-tabs">
        {items.map((item, index) => (
          <button
            type="button"
            role="tab"
            key={item.id}
            id={`${uid}-tab-${item.id}`}
            aria-controls={`${uid}-panel-${item.id}`}
            aria-selected={active === index}
            tabIndex={active === index ? 0 : -1}
            ref={(el) => {
              buttons.current[index] = el;
            }}
            onClick={() => select(index)}
            onKeyDown={(event) => {
              const next =
                event.key === "ArrowRight"
                  ? (index + 1) % items.length
                  : event.key === "ArrowLeft"
                    ? (index + items.length - 1) % items.length
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? items.length - 1
                        : null;
              if (next !== null) {
                event.preventDefault();
                select(next, true);
              }
            }}
          >
            <span aria-hidden="true">0{index + 1}</span>
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${uid}-panel-${item.id}`}
          aria-labelledby={`${uid}-tab-${item.id}`}
          hidden={active !== index}
          tabIndex={0}
          className="gl-step-panel"
        >
          {visited.has(index) && item.content}
          {index < items.length - 1 && (
            <button type="button" className="gl-next-step" onClick={() => select(index + 1, true)}>
              다음: {items[index + 1]?.label}
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
