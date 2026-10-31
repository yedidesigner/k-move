import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth";
import { latestPublications, listContentPublications } from "@/lib/instructor-api";
import {
  mergeGlossary,
  mergeGuides,
  mergePaths,
  mergeSessions,
  orderGuidesByPaths,
  type PublishedContentRow,
} from "@/lib/content-model";

function resolveContent(rows: PublishedContentRow[]) {
  const glossary = mergeGlossary(rows);
  const paths = mergePaths(rows);
  return {
    rows,
    glossary,
    paths,
    guides: orderGuidesByPaths(mergeGuides(rows, glossary), paths),
    sessions: mergeSessions(rows),
  };
}
const baseline = resolveContent([]);
type PublishedState = ReturnType<typeof resolveContent> & {
  reload: () => Promise<void>;
  error: string | null;
};
const Context = createContext<PublishedState>({ ...baseline, reload: async () => {}, error: null });

/** Auth-keyed by the application. An unavailable publication index never exposes a hidden baseline. */
export function PublishedContentProvider({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();
  const [rows, setRows] = useState<PublishedContentRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const mounted = useRef(true);
  const reload = useCallback(async () => {
    const request = ++generation.current;
    try {
      const publications = await listContentPublications();
      if (!mounted.current || request !== generation.current) return;
      setRows(latestPublications(publications));
      setLoaded(true);
      setError(null);
    } catch {
      if (mounted.current && request === generation.current)
        setError("공개된 학습 내용을 불러오지 못했습니다. 다시 시도해 주세요.");
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    if (!user || !["student", "instructor"].includes(status)) return;
    void reload();
    const refresh = () => {
      if (document.visibilityState !== "hidden") void reload();
    };
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    return () => {
      mounted.current = false;
      generation.current++;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [user?.id, status, reload]);
  const value = useMemo(() => ({ ...resolveContent(rows), reload, error }), [rows, reload, error]);
  if (!loaded)
    return (
      <div className="p-6 text-sm" role={error ? "alert" : "status"}>
        <p>{error ?? "수업과 학습 내용을 불러오는 중…"}</p>
        {error && (
          <button
            type="button"
            className="mt-4 min-h-11 border border-neutral-300 px-4"
            onClick={() => void reload()}
          >
            다시 시도
          </button>
        )}
      </div>
    );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function usePublishedContent() {
  return useContext(Context);
}
export function usePublishedSessions() {
  return useContext(Context).sessions;
}

export function PublishedAnnouncements({ sessionNumber }: { sessionNumber?: number }) {
  const { rows } = usePublishedContent();
  const notices = rows.filter(
    (row) =>
      row.kind === "announcement" &&
      !row.hidden &&
      (sessionNumber === undefined
        ? !row.document["sessionNumber"]
        : row.document["sessionNumber"] === sessionNumber),
  );
  if (!notices.length) return null;
  return (
    <section
      aria-label={sessionNumber ? "수업 공지" : "과정 공지"}
      className="mb-6 divide-y divide-neutral-200 border-y border-neutral-300 bg-white"
    >
      {notices.map((row) => (
        <article key={row.content_key} className="px-5 py-4">
          <p className="mb-2 text-xs font-medium text-neutral-500">
            {sessionNumber ? "수업 공지" : "공지"}
          </p>
          <h2 className="text-base font-semibold">{String(row.document["title"] ?? "공지")}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-neutral-700">
            {String(row.document["body"] ?? "")}
          </p>
        </article>
      ))}
    </section>
  );
}
