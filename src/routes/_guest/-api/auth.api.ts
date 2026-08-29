import type { User } from "../../../types/user";
import { api } from "../../../utils/api";
import { removeEmptyValues } from "../../../utils/removeEmptyValues";

export const BASE = "/api/v1/auth";

type Auth = {
  user?: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: 900;
  tokenType: "Bearer";
};

export function me() {
  return api.get<User>(`${BASE}/me`);
}

export function login(data: { email: string; password: string }) {
  return api.post<Auth>(`${BASE}/login`, data);
}

export function googleLogin(data: { token: string }) {
  return api.post<Auth>(`${BASE}/google/login`, data);
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  referralCode?: string;
  inviteCode?: string;
  invitedBy?: string;
  invitedOrganizationId?: string;
  accountType: User["accountType"];
}
export function register(data: RegisterRequest) {
  return api.post<User>(`${BASE}/register`, removeEmptyValues(data));
}

export interface GoogleRegisterRequest extends Omit<
  RegisterRequest,
  "email" | "password" | "fullName"
> {
  token: string;
}
export function googleRegister(data: GoogleRegisterRequest) {
  return api.post<Auth>(`${BASE}/google/register`, removeEmptyValues(data));
}

export function logout(refreshTokenId?: string[]) {
  const payload =
    refreshTokenId && refreshTokenId.length > 0 ? { refreshTokenId } : {};

  return api.post(`${BASE}/logout`, payload);
}

export function resendVerifyEmail(email: string) {
  return api.post<User>(`${BASE}/resend-verify-email`, { email });
}

export function verifyEmail(email: string, plainToken: string) {
  return api.post<Auth>(`${BASE}/verify-email`, { email, plainToken });
}

export function forgotPassword(email: string) {
  return api.post(`${BASE}/forgot-password`, { email });
}

export function resetPassword(token: string, newPassword: string) {
  return api.post(`${BASE}/reset-password`, { token, newPassword });
}
