import type { BaseListParams } from "../../../../../components/reusebale-components/DataTable";
import { api } from "../../../../../utils/api";
import type { SubscriptionPlan } from "../../../_organization/_admin/subscription-plan-management/-api/subscriptionPlan.type";
import type {
  CheckoutRequest,
  TransactionDetail,
  TransactionHistoryItem,
  TransactionStatusResponse,
} from "./billing.type";

export const BASE_URL = "/api/v1";

export const getSubscriptionPlans = async () => {
  return api.get<Omit<SubscriptionPlan, "createdAt" | "updatedAt">[]>(
    `${BASE_URL}/subscription-plans/store`,
  );
};

export const checkout = async (data: CheckoutRequest) => {
  return api.post<TransactionDetail>(`${BASE_URL}/transactions/checkout`, data);
};

export const getTransaction = async (referenceId: string) => {
  return api.get<TransactionDetail>(`${BASE_URL}/transactions/${referenceId}`);
};

export const cancelTransaction = async (referenceId: string) => {
  return api.post(`${BASE_URL}/transactions/${referenceId}/cancel`);
};

export const cancelActiveSubscription = async () => {
  return api.post(`${BASE_URL}/transactions/subscription/cancel`);
};

export const getTransactionHistory = async (params?: BaseListParams) => {
  return api.get<TransactionHistoryItem[]>(`${BASE_URL}/transactions`, {
    params,
  });
};

export const getTransactionStatus = async () => {
  return api.get<TransactionStatusResponse>(`${BASE_URL}/transactions/status`);
};
