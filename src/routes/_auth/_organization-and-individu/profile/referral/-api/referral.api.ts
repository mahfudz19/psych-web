import type {
  ReferralStats,
  RegenerateReferralResponse,
} from "../../../../../../types/user";
import { api } from "../../../../../../utils/api";

const BASE = "/api/v1/referral";

export interface RegenerateReferralRequest {
  reason: "regenerated" | "user_request" | "security";
}

export function getReferralStats() {
  return api.get<ReferralStats>(`${BASE}/stats`);
}

export function regenerateReferralCode(data: RegenerateReferralRequest) {
  return api.post<RegenerateReferralResponse>(`${BASE}/regenerate`, data);
}

export function getReferralHistory() {
  return api.get<ReferralStats>(`${BASE}/history`);
}
