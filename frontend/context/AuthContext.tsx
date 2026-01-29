"use client";

import {
  getCurrentUser,
  isAuthenticated as isAuthenticatedFn,
  logoutUser,
  type AuthUser,
} from "@/lib/api/authApi";
import {
  clearAuthStorage,
  isBrowser,
  USER_DATA_KEY,
} from "@/lib/utils/authUtils";
import * as React from "react";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
  login: (userData: AuthUser) => void;
  logout: () => void;
  updateUser: (userData: Partial<AuthUser>) => void;
};

export const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Hydrate from localStorage on first mount
    const authed = isAuthenticatedFn();
    if (!authed) {
      clearAuthStorage();
      setUser(null);
      setLoading(false);
      return;
    }
    const u = getCurrentUser();
    if (!u) {
      clearAuthStorage();
      setUser(null);
      setLoading(false);
      return;
    }
    setUser(u);
    setLoading(false);
  }, []);

  const login = React.useCallback((userData: AuthUser) => {
    setUser(userData);
    if (isBrowser()) {
      window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    }
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
    logoutUser();
  }, []);

  const updateUser = React.useCallback((userData: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...userData };
      if (isBrowser()) {
        window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const isAuthenticated = !!user && isAuthenticatedFn();
  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated,
      isAdmin,
      isUser,
      login,
      logout,
      updateUser,
    }),
    [
      user,
      loading,
      isAuthenticated,
      isAdmin,
      isUser,
      login,
      logout,
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
