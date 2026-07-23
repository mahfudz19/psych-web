import type { User } from "../../../../types/user";
import { api } from "../../../../utils/api";

interface LoginRequest {
  email: string;
  password: string;
}

export function login(data: LoginRequest) {
  return api.post<{ user: User; token: string; expiresIn: number }>(
    "/api/v1/auth/login",
    data,
  );
}
