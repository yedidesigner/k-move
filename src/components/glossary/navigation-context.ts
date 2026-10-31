import { createContext } from "react";

export const GlossaryNavigationContext = createContext<
  ((termId: string, trigger: HTMLAnchorElement) => void) | null
>(null);
