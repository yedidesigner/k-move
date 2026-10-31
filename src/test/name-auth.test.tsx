import { createHash, webcrypto } from "node:crypto";
import type { ReactNode } from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/lib/auth";

const db = vi.hoisted(() => ({
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
  updateUser: vi.fn(),
  unsubscribe: vi.fn(),
  profile: vi.fn(),
  listener: null as null | ((_event: string, session: { user: { id: string; email: string } } | null) => void),
}));
vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => true,
  getSupabase: () => ({
    auth: {
      getSession: db.getSession,
      signInWithPassword: db.signInWithPassword,
      updateUser: db.updateUser,
      onAuthStateChange: (listener: NonNullable<typeof db.listener>) => { db.listener = listener; return { data: { subscription: { unsubscribe: db.unsubscribe } } }; },
    },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: db.profile }) }) }),
  }),
}));

const account = { id: "test-account", email: "existing@login.kmove.local" };
const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => {
  vi.stubGlobal("crypto", webcrypto);
  db.listener = null;
  db.profile.mockReset().mockResolvedValue({ data: { role: "student" }, error: null });
  db.getSession.mockReset().mockResolvedValue({ data: { session: { user: account } }, error: null });
  db.signInWithPassword.mockReset().mockResolvedValue({ data: { user: account }, error: null });
  db.updateUser.mockReset().mockResolvedValue({ data: { user: account }, error: null });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

async function authenticatedState() {
  const { result } = renderHook(useAuth, { wrapper });
  await waitFor(() => expect(result.current.status).toBe("student"));
  return result;
}

describe("Name login compatibility and password verification", () => {
  it.each(["강예지", "tomset", "홍길동", "홍길순"])("preserves existing credential mapping for %s", async name => {
    const result = await authenticatedState();
    await act(async () => { await result.current.signIn(name, "2479"); });
    const hash = createHash("sha256").update(name).digest("hex");
    expect(db.signInWithPassword).toHaveBeenCalledWith({ email: `${hash}@login.kmove.local`, password: "Kmove:2479" });
    expect("signUp" in result.current).toBe(false);
  });

  it("preserves login normalization without restricting legacy Latin names", async () => {
    const result = await authenticatedState();
    await act(async () => { await result.current.signIn(" ＴＯＭＳＥＴ ", "2479"); });
    const hash = createHash("sha256").update("tomset").digest("hex");
    expect(db.signInWithPassword).toHaveBeenCalledWith({ email: `${hash}@login.kmove.local`, password: "Kmove:2479" });
  });

  it("verifies the current password before updating the authenticated user's password", async () => {
    const result = await authenticatedState();
    await act(async () => { await result.current.changePassword("1111", "2479"); });
    expect(db.signInWithPassword).toHaveBeenCalledWith({ email: account.email, password: "Kmove:1111" });
    expect(db.updateUser).toHaveBeenCalledWith({ password: "Kmove:2479" });
    expect(db.signInWithPassword.mock.invocationCallOrder[0]).toBeLessThan(db.updateUser.mock.invocationCallOrder[0]!);
  });

  it("does not update a password after failed current-password verification", async () => {
    const result = await authenticatedState();
    db.signInWithPassword.mockResolvedValue({ error: { code: "invalid_credentials" } });
    await expect(result.current.changePassword("1111", "2479")).rejects.toThrow("auth/current-password-incorrect");
    expect(db.updateUser).not.toHaveBeenCalled();
  });

  it("keeps a service outage distinct from incorrect credentials", async () => {
    const result = await authenticatedState();
    const outage = new Error("Network unavailable");
    db.signInWithPassword.mockResolvedValue({ error: outage });
    await expect(result.current.changePassword("1111", "2479")).rejects.toBe(outage);
    expect(db.updateUser).not.toHaveBeenCalled();
  });

  it("rejects invalid or unchanged passwords before any API request", async () => {
    const result = await authenticatedState();
    await expect(result.current.changePassword("1111", "1111")).rejects.toThrow("auth/password-unchanged");
    await expect(result.current.changePassword("1111", "12")).rejects.toThrow("auth/invalid-pin");
    expect(db.signInWithPassword).not.toHaveBeenCalled();
    expect(db.updateUser).not.toHaveBeenCalled();
  });

  it("propagates update failures without claiming completion", async () => {
    const result = await authenticatedState();
    const failure = new Error("Unable to update password");
    db.updateUser.mockResolvedValue({ error: failure });
    await expect(result.current.changePassword("1111", "2479")).rejects.toBe(failure);
  });

  it("does not change passwords for a signed-out session", async () => {
    db.getSession.mockResolvedValue({ data: { session: null }, error: null });
    const { result } = renderHook(useAuth, { wrapper });
    await waitFor(() => expect(result.current.status).toBe("signedOut"));
    await expect(result.current.changePassword("1111", "2479")).rejects.toThrow("auth/not-signed-in");
    expect(db.signInWithPassword).not.toHaveBeenCalled();
    expect(db.updateUser).not.toHaveBeenCalled();
  });
});

describe("Auth role request isolation", () => {
  it("ignores an old instructor role response after a student signs in", async () => {
    let resolveInstructor!: (value: unknown) => void;
    db.profile.mockReturnValueOnce(new Promise(resolve => { resolveInstructor = resolve; }));
    const { result } = renderHook(useAuth, { wrapper });
    await waitFor(() => expect(db.profile).toHaveBeenCalledTimes(1));
    expect(result.current.status).toBe("loading");
    act(() => db.listener!("SIGNED_IN", { user: { id: "new-student", email: "student@login.kmove.local" } }));
    await waitFor(() => expect(result.current.status).toBe("student"));
    await act(async () => resolveInstructor({ data: { role: "instructor" }, error: null }));
    expect(result.current.user?.id).toBe("new-student");
    expect(result.current.status).toBe("student");
  });

  it("does not restore a role after logout while a profile query is pending", async () => {
    let finish!: (value: unknown) => void;
    db.profile.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    const { result } = renderHook(useAuth, { wrapper });
    await waitFor(() => expect(db.profile).toHaveBeenCalledTimes(1));
    act(() => db.listener!("SIGNED_OUT", null));
    expect(result.current.status).toBe("signedOut");
    expect(result.current.user).toBeNull();
    await act(async () => finish({ data: { role: "instructor" }, error: null }));
    expect(result.current.status).toBe("signedOut");
    expect(result.current.user).toBeNull();
  });

  it("ignores initial session hydration that finishes after a newer login", async () => {
    let hydrate!: (value: unknown) => void;
    db.getSession.mockReturnValueOnce(new Promise(resolve => { hydrate = resolve; }));
    const { result } = renderHook(useAuth, { wrapper });
    act(() => db.listener!("SIGNED_IN", { user: { id: "new-student", email: "student@login.kmove.local" } }));
    await waitFor(() => expect(result.current.status).toBe("student"));
    await act(async () => hydrate({ data: { session: { user: account } }, error: null }));
    expect(result.current.user?.id).toBe("new-student");
    expect(db.profile).toHaveBeenCalledTimes(1);
  });

  it("keeps the verified same-account view mounted during refresh or password verification", async () => {
    const result = await authenticatedState();
    let finish!: (value: unknown) => void;
    db.profile.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
    act(() => db.listener!("SIGNED_IN", { user: account }));
    expect(result.current.status).toBe("student");
    await waitFor(() => expect(db.profile).toHaveBeenCalledTimes(2));
    expect(result.current.status).toBe("student");
    await act(async () => finish({ data: { role: "student" }, error: null }));
  });

  it("does not grant a default student role when profile verification fails", async () => {
    db.profile.mockResolvedValueOnce({ data: null, error: new Error("connection failed") });
    const { result } = renderHook(useAuth, { wrapper });
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.errorDetail).toBe("connection failed");
  });
});
