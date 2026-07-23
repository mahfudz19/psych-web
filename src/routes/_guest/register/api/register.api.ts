import type { User } from "../../../../types/user";
import { api } from "../../../../utils/api";
import { removeEmptyValues } from "../../../../utils/src/utils/removeEmptyValues";

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
  return api.post<{ user: User; token: string; expiresIn: number }>(
    "/api/v1/auth/register",
    { body: removeEmptyValues(JSON.stringify(data)) },
  );
}
