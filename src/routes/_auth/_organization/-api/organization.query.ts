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
import { useTranslation } from "react-i18next";

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
  });
}

export function useUpdateOrganizationMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      orgId,
      data,
    }: {
      orgId: string;
      data: UpdateOrganizationRequest;
    }) => updateOrganization({ orgId, data }),
    onSuccess: (response) => {
      toast.success(t("organization.create.success"));

      if (response.data) {
        queryClient.setQueryData(
          organizationKeys.detail(response.data.organization.id),
          response,
        );
      }

      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: () => toast.error(t("organization.create.error")),
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
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.removeQueries({ queryKey: organizationKeys.all });
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
