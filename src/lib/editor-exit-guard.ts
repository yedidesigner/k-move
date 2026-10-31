import { useEffect, useRef } from "react";

type EditorExitGuard = () => boolean | Promise<boolean>;
const guards = new Set<EditorExitGuard>();
let pendingExit: Promise<boolean> | null = null;

/** Register an allow-exit check for actions that unmount editors outside router navigation. */
export function useEditorExitGuard(guard: EditorExitGuard) {
  const currentGuard = useRef(guard);
  currentGuard.current = guard;

  useEffect(() => {
    const check = () => currentGuard.current();
    guards.add(check);
    return () => {
      guards.delete(check);
    };
  }, []);
}

/** Flush or confirm mounted editors before sign-out; failure always preserves the current session. */
export function requestEditorExit(): Promise<boolean> {
  if (pendingExit) return pendingExit;
  const checks = [...guards];
  pendingExit = (async () => {
    try {
      for (const check of checks) {
        // A previous guard can cause an editor to unmount after its work is saved.
        if (guards.has(check) && !(await check())) return false;
      }
      return true;
    } catch {
      return false;
    }
  })();
  const result = pendingExit;
  void result.finally(() => {
    if (pendingExit === result) pendingExit = null;
  });
  return result;
}
