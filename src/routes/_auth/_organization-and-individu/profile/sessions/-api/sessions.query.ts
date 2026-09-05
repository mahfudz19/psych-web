import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "../../../../../../components/ui/Toast";
import * as authApi from "../../../../../_guest/-api/auth.api";
import type { BaseListParams } from "../../../../../../components/reusebale-components/DataTable";

export const sessionKeys = {
  all: ["userSessions"] as const,
  lists: () => [...sessionKeys.all, "list"] as const,
  list: (params?: BaseListParams) => [...sessionKeys.lists(), params] as const,
};

export function useGetSessions(params: BaseListParams) {
  return useQuery({
    queryKey: sessionKeys.list(params),
    queryFn: () => authApi.getSessions(params),
    staleTime: 1000 * 60 * 2, // 2 menit
  });
}

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (refreshTokenId?: string) => authApi.logout(refreshTokenId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      toast.success("Sesi berhasil diakhiri");
    },
    onError: () => {
      toast.error("Gagal mengakhiri sesi");
    },
  });
}
