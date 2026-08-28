import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useApolloClient, useLazyQuery } from "@apollo/client";
import { supabase } from "../lib/supabaseClient";
import { ME } from "../lib/graphql";
import type { User } from "../lib/graphql";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const apolloClient = useApolloClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // "me" is fetched from our own backend (not Supabase directly) because
  // it returns app-level fields like role, sourced from the profiles table.
  const [fetchMe] = useLazyQuery<{ me: User | null }>(ME, {
    fetchPolicy: "network-only",
  });

  // Supabase's onAuthStateChange fires immediately with the current session
  // on mount, then again on every sign-in/sign-out/token-refresh — so this
  // single subscription replaces the old "ask backend who am I" bootstrap.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const { data } = await fetchMe();
        setUser(data?.me ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [fetchMe]);

  async function login(email: string, password: string) {
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      throw err;
    }
    // onAuthStateChange picks up the new session and sets `user`.
  }

  async function register(email: string, password: string) {
    setError(null);
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) {
      setError(err.message);
      throw err;
    }
    // If email confirmation is enabled in Supabase Auth settings, there's
    // no session yet at this point — onAuthStateChange fires once they
    // confirm and sign in.
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    await apolloClient.clearStore(); // wipe cached parts tied to this session
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
