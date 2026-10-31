import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "./supabase";

export type AuthStatus = "loading" | "notConfigured" | "signedOut" | "student" | "instructor" | "error";

interface AuthState {
  status: AuthStatus;
  user: User | null;
  errorDetail: string | null;
  signIn: (loginId: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

function normalizeLoginId(loginId: string) {
  return loginId.trim().normalize("NFKC").toLocaleLowerCase("ko-KR");
}

function validateCredentials(loginId: string, password: string) {
  const normalizedId = normalizeLoginId(loginId);
  if (normalizedId.length < 2 || normalizedId.length > 30) throw new Error("auth/invalid-login-id");
  if (!/^\d{4}$/.test(password)) throw new Error("auth/invalid-pin");
  return normalizedId;
}

async function internalCredentials(loginId: string, password: string) {
  const normalizedId = validateCredentials(loginId, password);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalizedId));
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  // The UI uses a four-digit PIN. Add an app-specific prefix before sending it
  // to Supabase Auth so it satisfies the provider's password length policy.
  return { normalizedId, email: `${hash}@login.kmove.local`, password: `Kmove:${password}` };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setStatus("notConfigured");
      return;
    }
    const supabase = getSupabase();
    let active = true;
    let generation = 0;
    let verifiedUserId: string | null = null;
    let verifiedRole: "student" | "instructor" | null = null;
    const timers = new Set<number>();

    const applyUser = (nextUser: User | null) => {
      if (!active) return;
      const request = ++generation;
      setUser(nextUser);
      setErrorDetail(null);
      if (!nextUser) {
        verifiedUserId = null;
        verifiedRole = null;
        setStatus("signedOut");
        return;
      }
      // Keep same-account refreshes mounted (including password verification).
      // A different account must wait for its own verified role.
      if (verifiedUserId === nextUser.id && verifiedRole) {
        setStatus(verifiedRole);
      } else {
        verifiedUserId = null;
        verifiedRole = null;
        setStatus("loading");
      }
      // Keep Supabase queries outside its auth callback to avoid auth-lock deadlocks.
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        void (async () => {
          if (!active || request !== generation) return;
          try {
            const { data, error } = await supabase
              .from("kmove_profiles")
              .select("role")
              .eq("id", nextUser.id)
              .maybeSingle();
            if (!active || request !== generation) return;
            if (error || !data || !["student", "instructor"].includes(data.role)) {
              verifiedUserId = null;
              verifiedRole = null;
              setErrorDetail(error?.message ?? "계정 권한을 확인하지 못했습니다.");
              setStatus("error");
              return;
            }
            verifiedUserId = nextUser.id;
            verifiedRole = data.role === "instructor" ? "instructor" : "student";
            setStatus(verifiedRole);
          } catch (error) {
            if (!active || request !== generation) return;
            verifiedUserId = null;
            verifiedRole = null;
            setErrorDetail(error instanceof Error ? error.message : "계정 권한을 확인하지 못했습니다.");
            setStatus("error");
          }
        })();
      }, 0);
      timers.add(timer);
    };

    const initialGeneration = generation;
    void supabase.auth.getSession().then(({ data, error }) => {
      // A newer sign-in/sign-out event always wins over initial session hydration.
      if (!active || generation !== initialGeneration) return;
      if (error) {
        setErrorDetail(error.message);
        setStatus("error");
        return;
      }
      applyUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null);
    });
    return () => {
      active = false;
      generation++;
      for (const timer of timers) window.clearTimeout(timer);
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (loginId: string, password: string) => {
    const credentials = await internalCredentials(loginId, password);
    const { error } = await getSupabase().auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) throw error;
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user?.email) throw new Error("auth/not-signed-in");
    if (!/^\d{4}$/.test(currentPassword) || !/^\d{4}$/.test(newPassword)) {
      throw new Error("auth/invalid-pin");
    }
    if (newPassword === currentPassword) throw new Error("auth/password-unchanged");
    const db = getSupabase();
    const { error: verifyError } = await db.auth.signInWithPassword({
      email: user.email,
      password: `Kmove:${currentPassword}`,
    });
    if (verifyError) {
      if (verifyError.code === "invalid_credentials") throw new Error("auth/current-password-incorrect");
      throw verifyError;
    }
    const { error } = await db.auth.updateUser({ password: `Kmove:${newPassword}` });
    if (error) throw error;
  }, [user]);

  const signOut = useCallback(async () => {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
  }, []);

  return <Ctx.Provider value={{ status, user, errorDetail, signIn, signOut, changePassword }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useAuth outside AuthProvider");
  return value;
}
