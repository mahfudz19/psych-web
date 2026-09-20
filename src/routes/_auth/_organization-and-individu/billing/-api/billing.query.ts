import { useQuery, useMutation } from "@tanstack/react-query";
import { getSubscriptionPlans, checkout, getTransaction } from "./billing.api";
import type { CheckoutRequest } from "./billing.type";
import toast from "../../../../../components/ui/Toast";

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
