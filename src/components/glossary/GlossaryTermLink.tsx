import { useContext, type ReactNode } from "react";
import { usePublishedContent } from "@/lib/published-content";
import { GlossaryNavigationContext } from "./navigation-context";

export function GlossaryTermLink({ termId, children }: { termId: string; children: ReactNode }) {
  const openTerm = useContext(GlossaryNavigationContext);
  const { glossary } = usePublishedContent();
  const term = glossary.find((item) => item.id === termId);
  if (!term) return null;
  return (
    <a
      href={`/glossary?term=${encodeURIComponent(term.english)}`}
      onClick={(event) => {
        if (
          !openTerm ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        openTerm(termId, event.currentTarget);
      }}
    >
      {children}
    </a>
  );
}
