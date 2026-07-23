import type { ApiResponse } from "../types";

const BASE_URL = "http://localhost:8080";

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

// Base request function
const request = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const headers = new Headers(options.headers);

  if (
    !headers.has("Content-Type") &&
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 204) {
    return {
      success: true,
      message: "No Content",
      data: null,
    } as ApiResponse<T>;
  }

  const responseData: ApiResponse<T> = await response.json();

  if (!response.ok || !responseData.success) {
    throw new ApiError(
      response.status,
      responseData.message || "Request failed",
      responseData,
    );
  }

  return responseData;
};

// Create api object with HTTP methods
export const api = Object.assign(
  request, // api() still callable directly
  {
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
  },
);
