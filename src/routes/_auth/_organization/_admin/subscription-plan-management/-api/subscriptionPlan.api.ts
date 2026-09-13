import type { BaseListParams } from "../../../../../../components/reusebale-components/DataTable";
import { api } from "../../../../../../utils/api";
import type {
  CreateSubscriptionPlanRequest,
  SubscriptionPlan,
  UpdateSubscriptionPlanRequest,
} from "./subscriptionPlan.type";

const BASE = "/api/v1/subscription-plans";

export function getSubscriptionPlans(params?: BaseListParams) {
  return api.get<SubscriptionPlan[]>(BASE, { params });
}

export function createSubscriptionPlan(data: CreateSubscriptionPlanRequest) {
  return api.post<SubscriptionPlan>(BASE, data);
}

export function updateSubscriptionPlan(
  id: string,
  data: UpdateSubscriptionPlanRequest,
) {
  return api.patch<SubscriptionPlan>(`${BASE}/${id}`, data);
}

export function deleteSubscriptionPlan(id: string) {
  return api.delete<null>(`${BASE}/${id}`);
}
