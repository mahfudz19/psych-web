import type { User } from "../../../types/user";

export const BASE = "/api/v1/auth";

export type Auth = {
  user?: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: 900;
  tokenType: "Bearer";
};

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

export interface GoogleRegisterRequest extends Omit<
  RegisterRequest,
  "email" | "password" | "fullName"
> {
  token: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
