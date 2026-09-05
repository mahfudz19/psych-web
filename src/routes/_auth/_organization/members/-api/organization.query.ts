import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MembersListParams } from "../../../../../types";
import * as apiOrganization from "../../-api/organization.api";
import toast from "../../../../../components/ui/Toast";

export const memberKeys = {
  all: ["organizationMembers"] as const,
  lists: () => [...memberKeys.all, "list"] as const,
  list: (orgId: string, params?: MembersListParams) =>
    [...memberKeys.lists(), orgId, params] as const,
  details: () => [...memberKeys.all, "detail"] as const,
  detail: (orgId: string, memberId: string) =>
    [...memberKeys.details(), orgId, memberId] as const,
};

export function useMembersListQuery(orgId: string, params?: MembersListParams) {
  return useQuery({
    queryKey: memberKeys.list(orgId, params),
    queryFn: () => apiOrganization.getMembers(orgId, params),
    staleTime: 1000 * 60 * 2,
    enabled: !!orgId,
  });
}

export function useMemberByIdQuery(orgId: string, memberId: string) {
  return useQuery({
    queryKey: memberKeys.detail(orgId, memberId),
    queryFn: () => apiOrganization.getMemberById(orgId, memberId),
    staleTime: 1000 * 60 * 2,
    enabled: !!orgId && !!memberId,
  });
}

export function useKickMemberMutation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) =>
      apiOrganization.kickMember(orgId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.lists(),
      });

      toast.success("Member berhasil dikeluarkan.");
    },
    onError: (error) =>
      toast.error(error?.message || "Gagal mengeluarkan member."),
  });
}
