import { webcrypto } from "node:crypto";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePracticeRoom } from "@/hooks/use-practice-room";
import type { PracticeMessage } from "@/lib/practice";

type TestChannel = {
  name: string;
  settings?: { filter: string; table: string };
  event?: () => void;
  status?: (status: string) => void;
  on: (...args: unknown[]) => TestChannel;
  subscribe: (callback: (status: string) => void) => TestChannel;
};

const state = vi.hoisted(() => ({
  user: { id: "11111111-1111-4111-8111-111111111111" } as { id: string } | null,
  list: vi.fn(),
  save: vi.fn(),
  discard: vi.fn(),
  edit: vi.fn(),
  remove: vi.fn(),
  pin: vi.fn(),
  channels: [] as TestChannel[],
  removeChannel: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ useAuth: () => ({ user: state.user, status: "student" }) }));
vi.mock("@/lib/practice", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/practice")>();
  return {
    ...actual,
    listPracticeMessages: state.list,
    savePracticeMessage: state.save,
    discardPracticeDraft: state.discard,
    editPracticeMessage: state.edit,
    deletePracticeMessage: state.remove,
    pinPracticeMessage: state.pin,
  };
});
vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({
    channel: (name: string) => {
      const channel: TestChannel = {
        name,
        on: (_event, settings, callback) => {
          channel.settings = settings as NonNullable<TestChannel["settings"]>;
          channel.event = callback as () => void;
          return channel;
        },
        subscribe: (callback) => {
          channel.status = callback;
          return channel;
        },
      };
      state.channels.push(channel);
      return channel;
    },
    removeChannel: state.removeChannel,
  }),
}));

function message(overrides: Partial<PracticeMessage> = {}): PracticeMessage {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    session_number: 3,
    author_id: "11111111-1111-4111-8111-111111111111",
    author_name: "테스트 수강생",
    author_role: "student",
    body: "실습 결과",
    parent_id: null,
    links: [],
    attachments: [],
    is_pinned: false,
    created_at: "2026-11-08T04:00:00Z",
    updated_at: "2026-11-08T04:00:00Z",
    deleted_at: null,
    ...overrides,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

async function flush() {
  await act(async () => {});
}
async function advance(ms = 150) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("crypto", webcrypto);
  state.user = { id: "11111111-1111-4111-8111-111111111111" };
  state.list.mockReset().mockResolvedValue([]);
  state.save
    .mockReset()
    .mockImplementation(async (draft, input) =>
      message({ id: draft.id, session_number: draft.sessionNumber, body: input.body }),
    );
  state.discard.mockReset().mockResolvedValue(null);
  state.edit.mockReset().mockImplementation(async (id, _session, body) => message({ id, body }));
  state.remove
    .mockReset()
    .mockImplementation(async (id) =>
      message({ id, body: "", deleted_at: "2026-11-08T05:00:00Z" }),
    );
  state.pin
    .mockReset()
    .mockImplementation(async (id, _session, is_pinned) => message({ id, is_pinned }));
  state.channels = [];
  state.removeChannel.mockReset().mockResolvedValue("ok");
});
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Practice room history and connection recovery", () => {
  it("loads the selected session and refreshes server history when a new message arrives", async () => {
    const first = message();
    state.list.mockResolvedValueOnce([first]);
    const { result } = renderHook(() => usePracticeRoom(3));
    await flush();
    expect(result.current.messages).toEqual([first]);
    expect(result.current.loading).toBe(false);
    expect(state.channels[0]?.settings).toMatchObject({
      table: "kmove_practice_messages",
      filter: "session_number=eq.3",
    });
    const next = message({ id: "second", body: "새로운 실습" });
    state.list.mockResolvedValueOnce([first, next]);
    act(() => {
      state.channels[0]?.event?.();
    });
    await advance();
    expect(result.current.messages).toEqual([first, next]);
    expect(state.list.mock.calls.every(([session]) => session === 3)).toBe(true);
  });

  it("re-fetches missed messages on reconnect rather than relying on live events alone", async () => {
    const { result } = renderHook(() => usePracticeRoom(3));
    await flush();
    act(() => {
      state.channels[0]?.status?.("SUBSCRIBED");
    });
    await advance();
    expect(result.current.connected).toBe(true);
    act(() => {
      state.channels[0]?.status?.("CHANNEL_ERROR");
    });
    expect(result.current.connected).toBe(false);
    state.list.mockResolvedValueOnce([message({ body: "연결이 끊긴 동안 올라온 글" })]);
    act(() => {
      state.channels[0]?.status?.("SUBSCRIBED");
    });
    await advance();
    expect(result.current.connected).toBe(true);
    expect(result.current.messages[0]?.body).toBe("연결이 끊긴 동안 올라온 글");
  });

  it("discards a slower previous-session response after the student changes rooms", async () => {
    const old = deferred<PracticeMessage[]>();
    const current = deferred<PracticeMessage[]>();
    state.list.mockImplementation((session) => (session === 3 ? old.promise : current.promise));
    const { result, rerender } = renderHook(({ session }) => usePracticeRoom(session), {
      initialProps: { session: 3 },
    });
    rerender({ session: 4 });
    await act(async () => {
      current.resolve([message({ session_number: 4, body: "4회차 결과" })]);
    });
    await act(async () => {
      old.resolve([message({ body: "늦게 온 3회차 결과" })]);
    });
    expect(result.current.messages.map((entry) => entry.body)).toEqual(["4회차 결과"]);
    expect(result.current.loading).toBe(false);
    expect(state.removeChannel).toHaveBeenCalledWith(state.channels[0]);
    expect(state.channels[1]?.settings?.filter).toBe("session_number=eq.4");
  });

  it("clears the previous account's records and ignores its pending response", async () => {
    const old = deferred<PracticeMessage[]>();
    state.list
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce([message({ author_id: "account-b", body: "새 계정의 조회 결과" })]);
    const { result, rerender } = renderHook(() => usePracticeRoom(3));
    state.user = { id: "account-b" };
    rerender();
    await flush();
    await act(async () => {
      old.resolve([message({ body: "이전 계정 조회 결과" })]);
    });
    expect(result.current.messages.map((entry) => entry.body)).toEqual(["새 계정의 조회 결과"]);
    expect(state.removeChannel).toHaveBeenCalledWith(state.channels[0]);
  });

  it("does not let an old send cancel the new room's in-flight history load", async () => {
    const outgoing = deferred<PracticeMessage>();
    const newHistory = deferred<PracticeMessage[]>();
    state.save.mockReturnValueOnce(outgoing.promise);
    state.list.mockResolvedValueOnce([]).mockReturnValueOnce(newHistory.promise);
    const { result, rerender } = renderHook(({ session }) => usePracticeRoom(session), {
      initialProps: { session: 3 },
    });
    await flush();
    let sent!: Promise<void>;
    act(() => {
      sent = result.current.send({ body: "3회차에 보내는 글", files: [] });
    });
    rerender({ session: 4 });
    await act(async () => {
      outgoing.resolve(message());
      await sent;
    });
    expect(state.list.mock.calls.map(([session]) => session)).toEqual([3, 4]);
    await act(async () => {
      newHistory.resolve([message({ session_number: 4, body: "4회차 기록" })]);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.messages.map((entry) => entry.body)).toEqual(["4회차 기록"]);
  });

  it("keeps a confirmed edit when an older history snapshot arrives later", async () => {
    const old = deferred<PracticeMessage[]>();
    state.list.mockReturnValueOnce(old.promise);
    const { result } = renderHook(() => usePracticeRoom(3));
    await act(async () => {
      await result.current.edit(message().id, "저장된 수정본");
    });
    await act(async () => {
      old.resolve([message({ body: "수정 전 내용" })]);
    });
    expect(result.current.messages[0]?.body).toBe("저장된 수정본");
    expect(result.current.loading).toBe(false);
  });

  it("removes live subscriptions, timers, and event listeners when the room closes", async () => {
    const { unmount } = renderHook(() => usePracticeRoom(3));
    await flush();
    const channel = state.channels[0]!;
    state.list.mockClear();
    unmount();
    act(() => {
      window.dispatchEvent(new Event("focus"));
      window.dispatchEvent(new Event("online"));
      channel.event?.();
      channel.status?.("SUBSCRIBED");
    });
    await advance(30_500);
    expect(state.list).not.toHaveBeenCalled();
    expect(state.removeChannel).toHaveBeenCalledWith(channel);
  });
});

describe("Practice composer submission integrity", () => {
  it("uses the same pending message ID after a failed send", async () => {
    state.save.mockRejectedValueOnce(new Error("connection lost"));
    const { result } = renderHook(() => usePracticeRoom(3));
    await flush();
    await act(async () => {
      await expect(result.current.send({ body: "다시 보내는 글", files: [] })).rejects.toThrow(
        "connection lost",
      );
    });
    const originalId = state.save.mock.calls[0]![0].id;
    await act(async () => {
      await result.current.send({ body: "다시 보내는 글", files: [] });
    });
    expect(state.save.mock.calls[1]![0].id).toBe(originalId);
    expect(state.discard).not.toHaveBeenCalled();
  });

  it("resolves a committed uncertain post before accepting an edited retry", async () => {
    state.save.mockRejectedValueOnce(new Error("response lost"));
    const { result } = renderHook(() => usePracticeRoom(3));
    await flush();
    await act(async () => {
      await expect(result.current.send({ body: "원래 내용", files: [] })).rejects.toThrow();
    });
    const saved = message({ id: state.save.mock.calls[0]![0].id, body: "원래 내용" });
    state.discard.mockResolvedValueOnce(saved);
    await act(async () => {
      await expect(result.current.send({ body: "고친 내용", files: [] })).rejects.toThrow(
        /이미 공유되었습니다/,
      );
    });
    expect(state.save).toHaveBeenCalledTimes(1);
    expect(result.current.messages).toEqual([saved]);
  });

  it("prevents simultaneous duplicate sends before the first save resolves", async () => {
    const pending = deferred<PracticeMessage>();
    state.save.mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => usePracticeRoom(3));
    await flush();
    let sent!: Promise<void>;
    act(() => {
      sent = result.current.send({ body: "한 번만 공유", files: [] });
    });
    await expect(result.current.send({ body: "한 번만 공유", files: [] })).rejects.toThrow(
      /공유하는 중/,
    );
    expect(state.save).toHaveBeenCalledTimes(1);
    await act(async () => {
      pending.resolve(message());
      await sent;
    });
  });

  it("blocks offline sends before creating an upload or insert", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    const { result } = renderHook(() => usePracticeRoom(3));
    await flush();
    await expect(result.current.send({ body: "오프라인 글", files: [] })).rejects.toThrow(
      /인터넷 연결/,
    );
    expect(state.save).not.toHaveBeenCalled();
  });
});
