import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useApolloClient, useMutation } from "@apollo/client";
import { ME, LOGIN, REGISTER, LOGOUT } from "../lib/graphql";
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
  const client = useApolloClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [loginMutation] = useMutation(LOGIN);
  const [registerMutation] = useMutation(REGISTER);
  const [logoutMutation] = useMutation(LOGOUT);

  // On first load, ask the backend "who am I?" — the httpOnly cookie
  // (if present from a previous session) answers this without us
  // ever touching the token directly.
  useEffect(() => {
    client
      .query<{ me: User | null }>({ query: ME, fetchPolicy: "network-only" })
      .then(({ data }) => setUser(data.me))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [client]);

  async function login(email: string, password: string) {
    setError(null);
    try {
      const { data } = await loginMutation({ variables: { email, password } });
      setUser(data.login.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    }
  }

  async function register(email: string, password: string) {
    setError(null);
    try {
      const { data } = await registerMutation({ variables: { email, password } });
      setUser(data.register.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    }
  }

  async function logout() {
    await logoutMutation();
    setUser(null);
    await client.clearStore(); // wipe cached parts tied to this session
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
