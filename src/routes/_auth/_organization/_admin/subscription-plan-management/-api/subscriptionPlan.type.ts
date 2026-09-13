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
}

export interface CreateSubscriptionPlanRequest {
  name: string;
  code: string;
  price: number;
  durationDays: number;
  targetAudience: TargetAudience;
  maxSeats?: number | null;
}

export interface UpdateSubscriptionPlanRequest {
  name?: string;
  code?: string;
  price?: number;
  durationDays?: number;
  targetAudience?: TargetAudience;
  maxSeats?: number | null;
}
