import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "../../../../components/ui/Toast";
import type {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from "../../../../types/organization";
import {
  createOrganization,
  deleteOrganization,
  getOrganization,
  updateOrganization,
  uploadOrganizationLogo,
} from "./organization.api";

export const organizationKeys = {
  all: ["organization"] as const,
  detail: (orgId: string) =>
    [...organizationKeys.all, "detail", orgId] as const,
};

export function useOrganizationQuery(orgId?: string | null) {
  return useQuery({
    queryKey: organizationKeys.detail(orgId!),
    queryFn: () => getOrganization(orgId!),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 menit
    retry: false,
  });
}

export function useCreateOrganizationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) => createOrganization(data),
    onSuccess: (response) => {
      toast.success("Organisasi berhasil dibuat");

      // Invalidate user profile karena organizationId berubah
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      // Set cache organization baru
      if (response.data?.organization) {
        queryClient.setQueryData(
          organizationKeys.detail(response.data.organization.id),
          response.data.organization,
        );
      }
    },
    onError: () => {
      toast.error("Gagal membuat organisasi");
    },
  });
}

export function useUpdateOrganizationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orgId,
      data,
    }: {
      orgId: string;
      data: UpdateOrganizationRequest;
    }) => updateOrganization({ orgId, data }),
    onSuccess: (response) => {
      // ✅ Ubah parameter name
      toast.success("Organisasi berhasil diperbarui");

      if (response.data) {
        queryClient.setQueryData(
          organizationKeys.detail(response.data.organization.id),
          response,
        );
      }

      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: () => toast.error("Gagal memperbarui organisasi"),
  });
}

export function useDeleteOrganizationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orgId,
      confirmation,
    }: {
      orgId: string;
      confirmation: "DELETE_MY_ORGANIZATION";
    }) => deleteOrganization({ orgId, confirmation }),
    onSuccess: () => {
      toast.success("Organisasi berhasil dihapus");

      // Invalidate user profile
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      // Remove organization cache
      queryClient.removeQueries({ queryKey: organizationKeys.all });
    },
    onError: () => {
      toast.error("Gagal menghapus organisasi");
    },
  });
}

export function useUploadOrganizationLogoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, file }: { orgId: string; file: File }) =>
      uploadOrganizationLogo({ orgId, file }),
    onSuccess: ({ data }, { orgId }) => {
      toast.success("Logo berhasil diunggah");

      // Update cache organization dengan logo baru
      if (data) {
        queryClient.setQueryData(organizationKeys.detail(orgId), data);
      }
    },
    onError: () => {
      toast.error("Gagal mengunggah logo");
    },
  });
}
