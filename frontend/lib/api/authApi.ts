import { api } from "@/lib/api/axiosConfig";
import {
  AUTH_TOKEN_KEY,
  clearAuthStorage,
  getStoredExpiresAt,
  getStoredToken,
  isBrowser,
  isTokenExpired,
  TOKEN_EXPIRES_AT_KEY,
  USER_DATA_KEY,
} from "@/lib/utils/authUtils";
import {
  type BackendRole,
  type FrontendRole,
  toBackendRole,
  toFrontendRole,
} from "@/lib/utils/roleMapper";
import axios from "axios";

function getApiBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.VITE_API_BASE_URL;
  return url?.trim() || "http://192.168.11.12:8080/api/v1";
}

type ApiEnvelope<T> = {
  success: boolean;
  status_code: number;
  data: T;
};

export type AuthUser = {
  user_id: string;
  email: string;
  full_name: string;
  role: FrontendRole; // "user" | "admin"
};

export async function registerUser(userData: {
  email: string;
  password: string;
  full_name: string;
  role: FrontendRole;
}): Promise<ApiEnvelope<AuthUser>> {
  const payload = {
    email: userData.email,
    password: userData.password,
    full_name: userData.full_name,
    role: toBackendRole(userData.role),
  };

  const res = await api.post<
    ApiEnvelope<{
      user_id: string;
      email: string;
      full_name: string;
      role: BackendRole;
    }>
  >("/auth/register", payload);

  const u = res.data.data;
  return {
    ...res.data,
    data: {
      user_id: u.user_id,
      email: u.email,
      full_name: u.full_name,
      role: toFrontendRole(u.role),
    },
  };
}

export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<ApiEnvelope<{ token: string; expires_at: number } & AuthUser>> {
  const res = await api.post<
    ApiEnvelope<{
      token: string;
      user_id: string;
      email: string;
      full_name: string;
      role: BackendRole;
      expires_at: number;
    }>
  >("/auth/login", credentials);

  const data = res.data.data;
  const user: AuthUser = {
    user_id: data.user_id,
    email: data.email,
    full_name: data.full_name,
    role: toFrontendRole(data.role),
  };

  if (isBrowser()) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    window.localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(data.expires_at));
    window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }

  return {
    ...res.data,
    data: {
      token: data.token,
      expires_at: data.expires_at,
      ...user,
    },
  };
}

export async function refreshToken(): Promise<
  ApiEnvelope<{ token: string; expires_at: number }>
> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No auth token found");
  }
  const res = await axios.post<
    ApiEnvelope<{ token: string; expires_at: number }>
  >(
    `${getApiBaseUrl()}/auth/refresh`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (isBrowser()) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, res.data.data.token);
    window.localStorage.setItem(
      TOKEN_EXPIRES_AT_KEY,
      String(res.data.data.expires_at),
    );
  }

  return res.data;
}

export function logoutUser(): void {
  clearAuthStorage();
  if (isBrowser()) {
    window.location.assign("/login");
  }
}

export function getCurrentUser(): AuthUser | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(USER_DATA_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = getStoredToken();
  if (!token) return false;
  return !isTokenExpired(getStoredExpiresAt());
}
