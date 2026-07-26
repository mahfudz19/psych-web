import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  Organization,
  UpdateOrganizationRequest,
} from "../types/organization";
import { api } from "../utils/api";
import toast from "../components/ui/Toast";

export function useOrganization(orgId?: string | null) {
  return useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => api.get<Organization>(`/api/v1/organizations/${orgId}`),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 menit
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) =>
      api.post<CreateOrganizationResponse>("/api/v1/organizations", data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      if (response.data) {
        queryClient.setQueryData(
          ["organization", response.data.organization.id],
          response.data.organization,
        );
      }
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orgId,
      data,
    }: {
      orgId: string;
      data: UpdateOrganizationRequest;
    }) => api.patch<Organization>(`/api/v1/organizations/${orgId}`, data),
    onSuccess: ({ data }) => {
      // Update cache organization
      if (data) {
        queryClient.setQueryData(["organization", data.id], data);
      }

      // Invalidate list organizations
      queryClient.invalidateQueries({ queryKey: ["organizations"] });

      // Invalidate user profile karena organizationName mungkin berubah
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: () => toast.error("Login failed"),
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orgId,
      confirmation,
    }: {
      orgId: string;
      confirmation: "DELETE_MY_ORGANIZATION";
    }) =>
      api.delete(`/api/v1/organizations/${orgId}`, {
        body: JSON.stringify({ confirmation }),
      }),
    onSuccess: () => {
      // Invalidate dan hapus cache user profile
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.removeQueries({ queryKey: ["organization"] });
      queryClient.removeQueries({ queryKey: ["organizations"] });
    },
  });
}

/**
 * Hook untuk upload logo organisasi
 * @returns Object berisi fungsi uploadLogo dan status mutation
 */
export function useUploadOrganizationLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, file }: { orgId: string; file: File }) => {
      const formData = new FormData();
      formData.append("logo", file);
      return api.post<Organization>(
        `/api/v1/organizations/${orgId}/logo`,
        formData,
      );
    },
    onSuccess: (response, { orgId }) => {
      // Update cache organization dengan logo baru
      if (response.data) {
        queryClient.setQueryData(["organization", orgId], response.data);
      }
    },
  });
}

/**
 * Hook kombinasi untuk management organisasi
 * Berguna untuk halaman settings yang membutuhkan banyak operasi
 * @param orgId - ID organisasi yang akan dikelola
 * @returns Object berisi data organisasi dan fungsi-fungsi CRUD
 */
export function useOrganizationManagement(orgId?: string | null) {
  const { data, isLoading, isError } = useOrganization(orgId);
  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization();
  const deleteMutation = useDeleteOrganization();
  const uploadLogoMutation = useUploadOrganizationLogo();

  return {
    organization: data?.data,
    isLoading,
    isError,
    createOrganization: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateOrganization: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteOrganization: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    uploadLogo: uploadLogoMutation.mutateAsync,
    isUploadingLogo: uploadLogoMutation.isPending,
  };
}
