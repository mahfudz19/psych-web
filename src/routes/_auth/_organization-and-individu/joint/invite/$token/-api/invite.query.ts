import { useMutation, useQueryClient } from "@tanstack/react-query";
import { joinOrganization } from "../../../../../_organization/-api/organization.api";

export function useJoinOrganizationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId }: { orgId: string }) => joinOrganization(orgId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
  });
}
