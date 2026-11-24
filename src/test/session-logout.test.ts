import { describe, expect, it, vi } from "vitest";
import { authStorageKey, clearStoredAuth, signOutCurrentSession } from "@/lib/session-logout";

describe("session logout", () => {
  it("logs out this browser without affecting other devices", async () => {
    const auth = { signOut: vi.fn().mockResolvedValue({ error: null }), stopAutoRefresh: vi.fn() };
    const clear = vi.fn();
    await signOutCurrentSession(auth, clear);
    expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(clear).not.toHaveBeenCalled();
  });
  it("clears local auth when server returns 403 session_not_found", async () => {
    const auth = { signOut: vi.fn().mockResolvedValue({ error: { status: 403, code: "session_not_found" } }),
      stopAutoRefresh: vi.fn().mockResolvedValue(undefined) };
    const clear = vi.fn();
    await signOutCurrentSession(auth, clear);
    expect(auth.stopAutoRefresh).toHaveBeenCalledOnce();
    expect(clear).toHaveBeenCalledOnce();
  });
  it("does not discard a session after an unrelated error", async () => {
    const error = { status: 403, code: "unexpected_failure" };
    const auth = { signOut: vi.fn().mockResolvedValue({ error }), stopAutoRefresh: vi.fn() };
    const clear = vi.fn();
    await expect(signOutCurrentSession(auth, clear)).rejects.toEqual(error);
    expect(clear).not.toHaveBeenCalled();
  });
  it("preserves draft and other project data", () => {
    const key = authStorageKey("https://example.supabase.co");
    const values = new Map([[key, "old"], [key + "-user", "user"], [key + "-code-verifier", "verifier"],
      ["kmove-draft", "draft"], ["sb-other-auth-token", "other"]]);
    clearStoredAuth({ removeItem: k => { values.delete(k); }, getItem: k => values.get(k) ?? null }, key);
    expect([...values.entries()]).toEqual([["kmove-draft", "draft"], ["sb-other-auth-token", "other"]]);
  });
});
