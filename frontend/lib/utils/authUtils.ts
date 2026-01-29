export const AUTH_TOKEN_KEY = "auth_token";
export const USER_DATA_KEY = "user_data";
export const TOKEN_EXPIRES_AT_KEY = "token_expires_at";

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getStoredToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredExpiresAt(): number | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function isTokenExpired(expiresAt: number | null): boolean {
  if (!expiresAt) return true;
  // Backend returns epoch seconds
  const nowSec = Math.floor(Date.now() / 1000);
  // 15s skew to avoid edge races
  return nowSec >= expiresAt - 15;
}

export function clearAuthStorage(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(USER_DATA_KEY);
  window.localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
}
