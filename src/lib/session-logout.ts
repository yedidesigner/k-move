/** Only a specifically absent/expired server session is safe to discard
 * when the SDK returns a sign-out error. Other failures must remain visible.
 */
export function isGoneSession(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; name?: string };
  return e.code === "session_not_found" || e.code === "session_expired" ||
    e.name === "AuthSessionMissingError";
}

// Match the SDK's existing default namespace to keep existing logins intact.
export function authStorageKey(url: string) {
  return `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;
}

export function clearStoredAuth(storage: Pick<Storage, "removeItem" | "getItem">, key: string) {
  for (const item of [key, `${key}-user`, `${key}-code-verifier`]) {
    storage.removeItem(item);
    if (storage.getItem(item) !== null) throw new Error("auth/local-session-clear-failed");
  }
}

export async function signOutCurrentSession(
  auth: { signOut: (options: { scope: "local" }) => Promise<{ error: unknown }>;
    stopAutoRefresh: () => Promise<void> },
  clearStale: () => void,
) {
  const { error } = await auth.signOut({ scope: "local" });
  if (!error) return;
  if (!isGoneSession(error)) throw error;
  // The server confirms the session no longer exists. Prevent another refresh
  // and remove only this project's old Auth entries, not LMS drafts or settings.
  await auth.stopAutoRefresh();
  clearStale();
}
