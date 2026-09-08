import type { BaseListParams } from "../../../components/reusebale-components/DataTable";
import type { Session, User } from "../../../types/user";
import { api } from "../../../utils/api";
import { removeEmptyValues } from "../../../utils/removeEmptyValues";
import type { UpdateProfileRequest } from "../../_auth/_organization-and-individu/profile/-api/profile.type";
import type {
  Auth,
  ChangePasswordRequest,
  GoogleRegisterRequest,
  RegisterRequest,
} from "./auth.type";

export const BASE = "/api/v1/auth";

export function me() {
  return api.get<User>(`${BASE}/me`);
}

export function updateProfile(data: UpdateProfileRequest) {
  return api.put<User>(`${BASE}/me`, data);
}

export function getSessions(params: BaseListParams) {
  return api.get<Session[]>(`${BASE}/sessions`, { params });
}

export function login(data: { email: string; password: string }) {
  return api.post<Auth>(`${BASE}/login`, data);
}

export function googleLogin(data: { token: string }) {
  return api.post<Auth>(`${BASE}/google/login`, data);
}

export function register(data: RegisterRequest) {
  return api.post<User>(`${BASE}/register`, removeEmptyValues(data));
}

export function googleRegister(data: GoogleRegisterRequest) {
  return api.post<Auth>(`${BASE}/google/register`, removeEmptyValues(data));
}

export function logout(targetSessionId?: string) {
  const payload = targetSessionId ? { targetSessionId } : {};

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

export function changePassword(data: ChangePasswordRequest) {
  return api.put(`${BASE}/password`, data);
}
