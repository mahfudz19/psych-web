import * as authApi from "../routes/_guest/-api/auth.api";
import type { ApiResponse } from "../types";
import { authStore } from "./authStore";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

// --- STATE UNTUK REFRESH TOKEN CONCURRENCY ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

// --- BASE REQUEST FUNCTION ---
const request = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const headers = new Headers(options.headers);

  if (!headers.has("X-Timezone")) {
    headers.set("X-Timezone", getUserTimezone());
  }

  // 1. INJEKSI ACCESS TOKEN
  const token = authStore.get().accessToken;
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (
    !headers.has("Content-Type") &&
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  // Tembakan pertama
  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // 2. KATEGORI 1: REFRESH TOKEN
  if (response.status === 401 && !endpoint.includes(`${authApi.BASE}/login`)) {
    if (isRefreshing) {
      // Jika sedang proses refresh, antre request ini
      try {
        const newToken = await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        headers.set("Authorization", `Bearer ${newToken}`);
        response = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: "include",
        });
      } catch (err) {
        throw err;
      }
    } else {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${BASE_URL}${authApi.BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
          credentials: "include",
        });

        if (!refreshRes.ok) throw new Error("Refresh token expired");

        const refreshData = await refreshRes.json();
        const newAccessToken = refreshData.data.accessToken;

        authStore.set({ accessToken: newAccessToken });
        processQueue(null, newAccessToken);

        headers.set("Authorization", `Bearer ${newAccessToken}`);
        response = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: "include",
        });
      } catch (error) {
        processQueue(error, null);
        authStore.clear();

        const currentPath = window.location.pathname;
        const isGuestRoute =
          currentPath.startsWith("/login") ||
          currentPath.startsWith("/forgot-password") ||
          currentPath.startsWith("/reset-password") ||
          currentPath.startsWith("/register");

        if (!isGuestRoute) window.location.href = "/login";

        throw new ApiError(401, "Session expired, please login again.", error);
      } finally {
        isRefreshing = false;
      }
    }
  }

  // 3. HANDLE RESPONSE NORMAL
  if (response.status === 204) {
    return {
      success: true,
      message: "No Content",
      data: null,
    } as ApiResponse<T>;
  }

  // Cast as any sementara untuk mengekstrak error code
  const responseData: any = await response.json();

  if (!response.ok || responseData.success === false) {
    const errorCode =
      responseData.code || responseData.error?.code || responseData.error;

    switch (response.status) {
      case 401:
        authStore.clear();
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = `/login?reason=${errorCode || "UNAUTHORIZED"}`;
        }
        break;

      case 403:
        // if (!window.location.pathname.startsWith("/unauthorized")) {
        //   window.location.href = `/unauthorized?reason=${errorCode || "FORBIDDEN"}`;
        // }
        break;

      case 404:
        // if (!window.location.pathname.startsWith("/not-found")) {
        //   window.location.href = `/not-found?reason=${errorCode || "NOT_FOUND"}`;
        // }
        break;

      case 429:
        break;

      case 500:
        break;

      default:
        break;
    }

    // Tetap lemparkan error agar mutation/query menangkap kegagalannya
    throw new ApiError(
      response.status,
      responseData.message || "Request failed",
      responseData,
    );
  }

  return responseData;
};

// Create api object with HTTP methods (Tetap Sama)
export const api = Object.assign(request, {
  get<T = unknown>(endpoint: string, options?: RequestInit) {
    return request<T>(endpoint, { ...options, method: "GET" });
  },
  post<T = unknown>(endpoint: string, data?: any, options?: RequestInit) {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },
  put<T = unknown>(endpoint: string, data?: any, options?: RequestInit) {
    return request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },
  patch<T = unknown>(endpoint: string, data?: any, options?: RequestInit) {
    return request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },
  delete<T = unknown>(endpoint: string, options?: RequestInit) {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },
});
