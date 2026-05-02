"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ACCESS = "shop_access";
const REFRESH = "shop_refresh";
const USER = "shop_username";

type AuthState = {
  access: string | null;
  refresh: string | null;
  username: string | null;
  ready: boolean;
  setSession: (access: string, refresh: string, username: string) => void;
  clearSession: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [access, setAccess] = useState<string | null>(null);
  const [refresh, setRefresh] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAccess(sessionStorage.getItem(ACCESS));
    setRefresh(sessionStorage.getItem(REFRESH));
    setUsername(sessionStorage.getItem(USER));
    setReady(true);
  }, []);

  const setSession = useCallback((a: string, r: string, u: string) => {
    sessionStorage.setItem(ACCESS, a);
    sessionStorage.setItem(REFRESH, r);
    sessionStorage.setItem(USER, u);
    setAccess(a);
    setRefresh(r);
    setUsername(u);
  }, []);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(ACCESS);
    sessionStorage.removeItem(REFRESH);
    sessionStorage.removeItem(USER);
    setAccess(null);
    setRefresh(null);
    setUsername(null);
  }, []);

  const value = useMemo(
    () => ({
      access,
      refresh,
      username,
      ready,
      setSession,
      clearSession,
    }),
    [access, refresh, username, ready, setSession, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
