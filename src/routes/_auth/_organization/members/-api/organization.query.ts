import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MembersListParams } from "../../../../../types";
import { getMembers, kickMember } from "../../-api/organization.api";
import toast from "../../../../../components/ui/Toast";

export const memberKeys = {
  all: ["organizationMembers"] as const,
  list: (orgId: string, params?: MembersListParams) =>
    [...memberKeys.all, orgId, params] as const,
};

export function useMembersListQuery(orgId: string, params?: MembersListParams) {
  return useQuery({
    queryKey: memberKeys.list(orgId, params),
    queryFn: () => getMembers(orgId, params),
    staleTime: 1000 * 60 * 2,
    enabled: !!orgId,
  });
}

export function useKickMemberMutation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => kickMember(orgId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.list(orgId),
        exact: false,
      });

      toast.success("Member berhasil dikeluarkan.");
    },
    onError: (error) =>
      toast.error(error?.message || "Gagal mengeluarkan member."),
  });
}
