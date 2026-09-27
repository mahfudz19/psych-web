export type TargetAudience = "USER" | "ORGANIZATION";

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  price: number;
  durationDays: number;
  targetAudience: TargetAudience;
  maxSeats: number | null;
  createdAt: string;
  updatedAt: string;
  recommended: boolean;
}

export interface PayloadSubscriptionPlanRequest {
  name: string;
  code: string;
  price: number;
  durationDays: number;
  targetAudience: TargetAudience;
  maxSeats?: number | null;
  recommended: boolean;
}
