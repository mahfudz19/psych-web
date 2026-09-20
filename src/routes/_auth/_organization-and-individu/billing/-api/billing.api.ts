import { api } from "../../../../../utils/api";
import type {
  SubscriptionPlan,
  CheckoutRequest,
  TransactionDetail,
} from "./billing.type";

export const BASE_URL = "/api/v1";

export const getSubscriptionPlans = async () => {
  return api.get<SubscriptionPlan[]>(`${BASE_URL}/subscription-plans/store`);
};

export const checkout = async (data: CheckoutRequest) => {
  return api.post<TransactionDetail>(`${BASE_URL}/transactions/checkout`, data);
};

export const getTransaction = async (referenceId: string) => {
  return api.get<TransactionDetail>(`${BASE_URL}/transactions/${referenceId}`);
};
