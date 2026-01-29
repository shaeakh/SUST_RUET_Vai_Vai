import {
  AUTH_TOKEN_KEY,
  clearAuthStorage,
  getStoredToken,
  isBrowser,
  TOKEN_EXPIRES_AT_KEY,
} from "@/lib/utils/authUtils";
import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

function getApiBaseUrl(): string {
  // Next.js: client-exposed env vars must be NEXT_PUBLIC_*
  const url =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.VITE_API_BASE_URL;
  return url?.trim() || "http://192.168.11.12:8080/api/v1";
}

export const api: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

type FailedQueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};
let failedQueue: FailedQueueItem[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token ?? "");
  });
  failedQueue = [];
}

async function refreshTokenDirect(): Promise<string> {
  const token = getStoredToken();
  if (!token) throw new Error("No token to refresh");

  const res = await axios.post(
    `${getApiBaseUrl()}/auth/refresh`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );

  const nextToken = res?.data?.data?.token as string | undefined;
  const expiresAt = res?.data?.data?.expires_at as number | undefined;

  if (!nextToken || !expiresAt) throw new Error("Refresh response invalid");
  window.localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
  window.localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(expiresAt));
  return nextToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const status = error.response?.status;
    if (!originalRequest || status !== 401) {
      throw error;
    }

    if (originalRequest._retry) {
      throw error;
    }
    originalRequest._retry = true;

    if (!isBrowser()) {
      throw error;
    }

    if (isRefreshing) {
      return await new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    refreshPromise = refreshPromise ?? refreshTokenDirect();

    try {
      const newToken = await refreshPromise;
      processQueue(null, newToken);
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return await api(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      clearAuthStorage();
      // Redirect to login (client-side only)
      window.location.assign(
        "/login?reason=session_expired&message=" +
          encodeURIComponent("Session expired. Please login again."),
      );
      throw refreshErr;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  },
);
