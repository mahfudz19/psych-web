import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMembers, kickMember } from "./member.api";
import type { MembersListParams } from "../-types/member.types";
import toast from "../../../../../components/ui/Toast";

export const memberKeys = {
  /** Key untuk list members */
  list: (orgId: string, params?: MembersListParams) =>
    ["organizationMembers", orgId, params] as const,
};

export function useMembersListQuery(orgId: string, params?: MembersListParams) {
  return useQuery({
    queryKey: memberKeys.list(orgId, params),
    queryFn: () => getMembers(orgId, params),
    staleTime: 1000 * 60 * 2, // 2 menit
    enabled: !!orgId,
  });
}

export function useKickMemberMutation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => kickMember(orgId, memberId),
    onSuccess: (response) => {
      // Invalidate query members list untuk refetch otomatis
      queryClient.invalidateQueries({ queryKey: memberKeys.list(orgId) });

      toast.success(
        response.message || "Member berhasil dikeluarkan dari organisasi.",
      );
    },
    onError: (error) => {
      toast.error(
        error.message || "Gagal mengeluarkan member dari organisasi.",
      );
    },
  });
}
