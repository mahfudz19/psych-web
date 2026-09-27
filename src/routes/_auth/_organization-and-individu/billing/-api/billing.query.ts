import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSubscriptionPlans,
  checkout,
  getTransaction,
  cancelTransaction,
  getTransactionStatus,
  cancelActiveSubscription,
} from "./billing.api";
import type { CheckoutRequest } from "./billing.type";
import toast from "../../../../../components/ui/Toast";

import { getTransactionHistory } from "./billing.api";
import type { BaseListParams } from "../../../../../components/reusebale-components/DataTable";

export const useGetTransactionHistory = (params?: BaseListParams) => {
  return useQuery({
    queryKey: ["transactions", "history", params],
    queryFn: () => getTransactionHistory(params),
  });
};

export const useGetSubscriptionPlans = () => {
  return useQuery({
    queryKey: ["subscription-plans", "store"],
    queryFn: getSubscriptionPlans,
  });
};

export const useCheckout = () => {
  return useMutation({
    mutationFn: (data: CheckoutRequest) => checkout(data),
    onError: ({ message }) => {
      toast.error(message);
    },
  });
};

export const useGetTransaction = (
  referenceId: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false | ((query: any) => number | false);
  },
) => {
  return useQuery({
    queryKey: ["transaction", referenceId],
    queryFn: () => getTransaction(referenceId),
    enabled: !!referenceId && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
  });
};

export const useCancelTransaction = () => {
  return useMutation({
    mutationFn: (referenceId: string) => cancelTransaction(referenceId),
    onError: ({ message }) => {
      toast.error(message);
    },
  });
};

export const useGetTransactionStatus = () => {
  return useQuery({
    queryKey: ["transactions", "status"],
    queryFn: getTransactionStatus,
  });
};

export const useCancelActiveSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelActiveSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", "status"] });
      toast.success("Langganan berhasil dibatalkan.");
    },
    onError: ({ message }) => {
      toast.error(message);
    },
  });
};
