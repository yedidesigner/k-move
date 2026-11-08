import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import {
  PRACTICE_TABLE, deletePracticeMessage, discardPracticeDraft, editPracticeMessage,
  listPracticeMessages, pinPracticeMessage, practiceFingerprint, preparePracticeInput, savePracticeMessage,
  type PracticeDraft, type PracticeInput, type PracticeMessage,
} from "@/lib/practice";

export function usePracticeRoom(sessionNumber: number) {
  const { user } = useAuth();
  const userId = user?.id;
  const [messages, setMessages] = useState<PracticeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const generation = useRef(0);
  const mounted = useRef(false);
  const scope = useRef("");
  const draft = useRef<PracticeDraft | null>(null);
  const sending = useRef(false);
  const identity = `${userId ?? ""}:${sessionNumber}`;

  const reload = useCallback(async () => {
    if (!userId || !mounted.current || scope.current !== identity) return;
    const request = ++generation.current;
    try {
      const records = await listPracticeMessages(sessionNumber);
      if (!mounted.current || request !== generation.current || scope.current !== identity) return;
      setMessages(records);
      setError(null);
    } catch {
      if (mounted.current && request === generation.current && scope.current === identity)
        setError("대화를 불러오지 못했습니다. 연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      if (mounted.current && request === generation.current && scope.current === identity) setLoading(false);
    }
  }, [userId, sessionNumber, identity]);

  useEffect(() => {
    mounted.current = true;
    scope.current = identity;
    draft.current = null;
    setMessages([]); setLoading(true); setError(null); setConnected(false);
    if (!userId) { setLoading(false); return; }
    const db = getSupabase();
    let refreshTimer: number | undefined;
    let active = true;
    const queueRefresh = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => { if (active) void reload(); }, 120);
    };
    // Subscribe first, then load history. A second load on SUBSCRIBED closes the handshake gap.
    const channel = db.channel(`practice:${sessionNumber}:${userId}:${crypto.randomUUID()}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: PRACTICE_TABLE, filter: `session_number=eq.${sessionNumber}`,
      }, queueRefresh)
      .subscribe((status) => {
        if (!active) return;
        setConnected(status === "SUBSCRIBED");
        if (status === "SUBSCRIBED") queueRefresh();
      });
    void reload();
    const refresh = () => { if (document.visibilityState !== "hidden") queueRefresh(); };
    const offline = () => { if (active) setConnected(false); };
    const poll = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    window.addEventListener("offline", offline);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false; mounted.current = false; generation.current++;
      window.clearTimeout(refreshTimer); window.clearInterval(poll);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", offline);
      document.removeEventListener("visibilitychange", refresh);
      void db.removeChannel(channel);
    };
  }, [identity, reload, sessionNumber, userId]);

  const accept = useCallback((record: PracticeMessage) => {
    if (!mounted.current || scope.current !== identity) return;
    // Invalidate an older snapshot so it cannot overwrite a newly confirmed write.
    generation.current++;
    setMessages((current) => [...current.filter((message) => message.id !== record.id), record]
      .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id)));
    setLoading(false); setError(null);
  }, [identity]);

  const send = useCallback(async (input: PracticeInput, onProgress?: (label: string) => void) => {
    if (!userId) throw new Error("다시 로그인해 주세요.");
    if (sending.current) throw new Error("이전 글을 공유하는 중입니다.");
    if (navigator.onLine === false) throw new Error("인터넷 연결을 확인한 뒤 다시 공유해 주세요.");
    const prepared = preparePracticeInput(input);
    const fingerprint = practiceFingerprint(prepared);
    sending.current = true;
    try {
      const previous = draft.current;
      if (previous && previous.fingerprint !== fingerprint) {
        // Resolve a prior uncertain write before accepting an edited retry.
        const saved = await discardPracticeDraft(previous);
        draft.current = null;
        if (saved) {
          accept(saved);
          throw new Error("이전 글은 이미 공유되었습니다. 대화에서 해당 글을 수정해 주세요.");
        }
      }
      if (!draft.current) draft.current = {
        id: crypto.randomUUID(), sessionNumber, userId, fingerprint, uploaded: [], attemptedInsert: false,
      };
      const pending = draft.current;
      const record = await savePracticeMessage(pending, prepared, onProgress);
      if (draft.current === pending) draft.current = null;
      accept(record);
      void reload();
    } finally { sending.current = false; }
  }, [userId, sessionNumber, accept, reload]);

  const edit = useCallback(async (id: string, body: string) => {
    accept(await editPracticeMessage(id, sessionNumber, body));
  }, [accept, sessionNumber]);
  const remove = useCallback(async (id: string) => {
    accept(await deletePracticeMessage(id, sessionNumber));
  }, [accept, sessionNumber]);
  const togglePin = useCallback(async (id: string, pinned: boolean) => {
    accept(await pinPracticeMessage(id, sessionNumber, pinned));
  }, [accept, sessionNumber]);

  return { messages, loading, error, connected, reload, send, edit, remove, togglePin };
}
