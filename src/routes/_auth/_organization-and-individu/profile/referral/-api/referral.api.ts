import type {
  User,
  ReferralStats,
  RegenerateReferralResponse,
} from "../../../../../../types/user";
import { api } from "../../../../../../utils/api";

export interface ReferralStatsResponse {
  stats: ReferralStats;
}

export interface RegenerateReferralRequest {
  reason: "regenerated" | "user_request" | "security";
}

export function getReferralStats() {
  return api.get<ReferralStatsResponse>("/api/v1/referral/stats");
}

export function regenerateReferralCode(data: RegenerateReferralRequest) {
  return api.post<RegenerateReferralResponse>(
    "/api/v1/referral/regenerate",
    data,
  );
}

export function getReferralHistory() {
  return api.get<ReferralStats>("/api/v1/referral/history");
}

export function getUserProfile() {
  return api.get<User>("/api/v1/auth/me");
}
