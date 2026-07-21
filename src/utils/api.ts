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

export const api = async <T = unknown>(
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
