import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "../../../../../../components/ui/Toast";
import {
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscriptionPlans,
  updateSubscriptionPlan,
} from "./subscriptionPlan.api";
import type {
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from "./subscriptionPlan.type";
import type { BaseListParams } from "../../../../../../components/reusebale-components/DataTable";

export const subscriptionPlanKeys = {
  all: ["subscription-plans"] as const,
  lists: () => [...subscriptionPlanKeys.all, "list"] as const,
  list: (params?: BaseListParams) =>
    [...subscriptionPlanKeys.lists(), { params }] as const,
};

export function useGetSubscriptionPlans(params?: BaseListParams) {
  return useQuery({
    queryKey: subscriptionPlanKeys.list(params),
    queryFn: () =>
      getSubscriptionPlans(params).catch((error) => {
        toast.error(
          error?.data?.message || "Gagal mengambil data subscription plan",
        );
        throw error;
      }),
  });
}

export function useCreateSubscriptionPlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubscriptionPlanRequest) =>
      createSubscriptionPlan(data),
    onSuccess: (res) => {
      toast.success(res?.message || "Subscription plan berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: subscriptionPlanKeys.all });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal membuat subscription plan");
    },
  });
}

export function useUpdateSubscriptionPlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSubscriptionPlanRequest;
    }) => updateSubscriptionPlan(id, data),
    onSuccess: (res) => {
      toast.success(res?.message || "Subscription plan berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: subscriptionPlanKeys.all });
    },
    onError: (error: any) => {
      toast.error(
        error?.data?.message || "Gagal memperbarui subscription plan",
      );
    },
  });
}

export function useDeleteSubscriptionPlanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSubscriptionPlan(id),
    onSuccess: (res) => {
      toast.success(res?.message || "Subscription plan berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: subscriptionPlanKeys.all });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal menghapus subscription plan");
    },
  });
}
