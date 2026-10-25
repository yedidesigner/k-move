import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "./supabase";

export type AuthStatus =
  "loading" | "notConfigured" | "signedOut" | "student" | "instructor" | "error";

interface AuthState {
  status: AuthStatus;
  user: User | null;
  errorDetail: string | null;
  signIn: (loginId: string, password: string) => Promise<void>;
  signUp: (loginId: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

function normalizeLoginId(loginId: string) {
  return loginId.trim().normalize("NFKC").toLocaleLowerCase("ko-KR");
}

function validateCredentials(loginId: string, password: string, requireKoreanId = false) {
  const normalizedId = normalizeLoginId(loginId);
  if (normalizedId.length < 2 || normalizedId.length > 30) throw new Error("auth/invalid-login-id");
  if (requireKoreanId && !/^[가-힣]+$/.test(normalizedId))
    throw new Error("auth/korean-login-id-required");
  if (!/^\d{4}$/.test(password)) throw new Error("auth/invalid-pin");
  return normalizedId;
}

async function internalCredentials(loginId: string, password: string, requireKoreanId = false) {
  const normalizedId = validateCredentials(loginId, password, requireKoreanId);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalizedId));
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
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
    let requestId = 0;
    let resolvedUserId: string | null = null;

    const applyUser = async (nextUser: User | null) => {
      if (!active) return;
      const currentRequest = ++requestId;
      setUser(nextUser);
      setErrorDetail(null);
      if (!nextUser) {
        resolvedUserId = null;
        setStatus("signedOut");
        return;
      }
      if (resolvedUserId !== nextUser.id) setStatus("loading");
      const { data, error } = await supabase
        .from("kmove_profiles")
        .select("role")
        .eq("id", nextUser.id)
        .maybeSingle();
      if (!active || currentRequest !== requestId) return;
      if (error || !data) {
        setErrorDetail(error?.message ?? "회원 정보를 불러오지 못했습니다.");
        setStatus("error");
        return;
      }
      resolvedUserId = nextUser.id;
      setStatus(data.role === "instructor" ? "instructor" : "student");
    };

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error && active) {
        setErrorDetail(error.message);
        setStatus("error");
        return;
      }
      void applyUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => void applyUser(session?.user ?? null), 0);
    });
    return () => {
      active = false;
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

  const signUp = useCallback(async (loginId: string, password: string) => {
    const credentials = await internalCredentials(loginId, password, true);
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: { data: { username: credentials.normalizedId } },
    });
    if (error) {
      // Pre-provisioned instructor accounts can use the same signup form.
      // The password is still verified by Auth; the role comes only from the database.
      if (error.code === "user_already_exists") {
        const result = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });
        if (result.error) throw result.error;
        return;
      }
      throw error;
    }
    if (!data.session) throw new Error("auth/email-confirmation-required");
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
  }, []);

  return (
    <Ctx.Provider value={{ status, user, errorDetail, signIn, signUp, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useAuth outside AuthProvider");
  return value;
}
