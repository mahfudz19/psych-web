import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "../../../../../components/ui/Toast";
import {
  cancelActiveSubscription,
  cancelTransaction,
  checkout,
  getSubscriptionPlans,
  getTransaction,
  getTransactionStatus,
} from "./billing.api";
import type { CheckoutRequest } from "./billing.type";

import { useTranslation } from "react-i18next";
import type { BaseListParams } from "../../../../../components/reusebale-components/DataTable";
import { authStore } from "../../../../../utils/authStore";
import { me } from "../../../../_guest/-api/auth.api";
import { getTransactionHistory } from "./billing.api";

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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CheckoutRequest) => checkout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", "status"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "history"] });
      toast.success(t("billing.checkoutSuccess", "Tagihan berhasil dibuat!"));
    },
    onError: ({ message }) => toast.error(message),
  });
};

export const useGetTransaction = (
  referenceId: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false | ((query: any) => number | false);
  },
) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["transaction", referenceId],
    queryFn: () => getTransaction(referenceId),
    enabled: !!referenceId && (options?.enabled ?? true),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (status === "PAID" || status === "EXPIRED" || status === "FAILED") {
        if (status === "PAID") {
          me().then(({ data: updatedUser }) => {
            if (updatedUser) authStore.set({ user: updatedUser });
          });
        }
        queryClient.invalidateQueries({ queryKey: ["transactions", "status"] });
        return false;
      }
      return 5000;
    },
  });
};

export const useCancelTransaction = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (referenceId: string) => cancelTransaction(referenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", "status"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "history"] });
      toast.success(
        t("billing.cancelSuccess", "Transaksi sebelumnya berhasil dibatalkan."),
      );
    },
    onError: ({ message }) => toast.error(message),
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
      me().then(({ data: updatedUser }) => {
        if (updatedUser) authStore.set({ user: updatedUser });
      });
      queryClient.invalidateQueries({ queryKey: ["transactions", "status"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "history"] });
      toast.success("Langganan berhasil dibatalkan.");
    },
    onError: ({ message }) => toast.error(message),
  });
};
