import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "../../../../../../components/ui/Toast";
import {
  getReferralStats,
  regenerateReferralCode,
  type RegenerateReferralRequest,
} from "./referral.api";

export const referralKeys = {
  all: ["referral"] as const,
  stats: () => [...referralKeys.all, "stats"] as const,
  history: () => [...referralKeys.all, "history"] as const,
};

export function useReferralStatsQuery() {
  return useQuery({
    queryKey: referralKeys.stats(),
    queryFn: getReferralStats,
    staleTime: 1000 * 60 * 5, // 5 menit
    retry: false,
  });
}

export function useRegenerateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegenerateReferralRequest) =>
      regenerateReferralCode(data),
    onSuccess: () => {
      toast.success("Kode referral berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: referralKeys.all });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: any) => {
      const message =
        error?.data?.code === "RATE_LIMIT_EXCEEDED"
          ? "Terlalu banyak permintaan. Silakan coba lagi nanti."
          : error?.data?.message || "Gagal memperbarui kode referral";
      toast.error(message);
    },
  });
}
