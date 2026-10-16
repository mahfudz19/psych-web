import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BaseListParams } from "../../../../../../components/reusebale-components/DataTable";
import toast from "../../../../../../components/ui/Toast";
import * as testApi from "./test-definitions.api";
import type {
  TestDefinitionCreatePayload,
  TestDefinitionUpdatePayload,
  TestScaleCreatePayload,
  TestScaleUpdatePayload,
  TestSectionCreatePayload,
  TestSectionUpdatePayload,
} from "./test-definitions.type";

// --- QUERY KEYS FACTORY ---
export const testDefinitionKeys = {
  all: ["test-definitions"] as const,
  lists: () => [...testDefinitionKeys.all, "list"] as const,
  list: (params?: BaseListParams) =>
    [...testDefinitionKeys.lists(), { params }] as const,
  details: () => [...testDefinitionKeys.all, "detail"] as const,
  detail: (id: string) => [...testDefinitionKeys.details(), id] as const,

  sections: (testId: string) =>
    [...testDefinitionKeys.detail(testId), "sections"] as const,
  sectionDetail: (testId: string, sectionId: string) =>
    [...testDefinitionKeys.sections(testId), sectionId] as const,

  scales: (testId: string, params?: { sectionId?: string }) =>
    [...testDefinitionKeys.detail(testId), "scales", { params }] as const,
  scaleDetail: (testId: string, scaleId: string) =>
    [...testDefinitionKeys.detail(testId), "scale", scaleId] as const,
};

// --- 1. TEST DEFINITION HOOKS ---
export function useGetTestDefinitions(params?: BaseListParams) {
  return useQuery({
    queryKey: testDefinitionKeys.list(params),
    queryFn: () =>
      testApi.getTestDefinitions(params).catch((error) => {
        toast.error(
          error?.data?.message || "Gagal mengambil data test definition",
        );
        throw error;
      }),
  });
}

export function useGetTestDefinition(id: string) {
  return useQuery({
    queryKey: testDefinitionKeys.detail(id),
    queryFn: () =>
      testApi.getTestDefinitionDetail(id).catch((error) => {
        toast.error(
          error?.data?.message || "Gagal mengambil detail test definition",
        );
        throw error;
      }),
    enabled: !!id,
  });
}

export function useCreateTestDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TestDefinitionCreatePayload) =>
      testApi.createTestDefinition(payload),
    onSuccess: (res) => {
      toast.success(res?.message || "Test definition berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: testDefinitionKeys.all });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal membuat test definition");
    },
  });
}

export function useUpdateTestDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: TestDefinitionUpdatePayload;
    }) => testApi.updateTestDefinition(id, payload),
    onSuccess: (res, variables) => {
      toast.success(res?.message || "Test definition berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: testDefinitionKeys.all });
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.detail(variables.id),
      });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal memperbarui test definition");
    },
  });
}

export function useDeleteTestDefinitionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testApi.deleteTestDefinition(id),
    onSuccess: (res) => {
      toast.success(res?.message || "Test definition berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: testDefinitionKeys.all });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal menghapus test definition");
    },
  });
}

export function usePublishTestDefinitionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testApi.publishTestDefinition(id),
    onSuccess: (res, id) => {
      toast.success(res?.message || "Test definition berhasil dipublish");
      queryClient.invalidateQueries({ queryKey: testDefinitionKeys.all });
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.detail(id),
      });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal mempublish test definition");
    },
  });
}

export function useArchiveTestDefinitionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testApi.archiveTestDefinition(id),
    onSuccess: (res, id) => {
      toast.success(res?.message || "Test definition berhasil diarsipkan");
      queryClient.invalidateQueries({ queryKey: testDefinitionKeys.all });
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.detail(id),
      });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal mengarsipkan test definition");
    },
  });
}

// --- 2. TEST SECTION HOOKS ---
export function useGetTestSections(testId: string) {
  return useQuery({
    queryKey: testDefinitionKeys.sections(testId),
    queryFn: () =>
      testApi.getTestSections(testId).catch((error) => {
        toast.error(error?.data?.message || "Gagal mengambil daftar section");
        throw error;
      }),
    enabled: !!testId,
  });
}

export function useGetTestSection(testId: string, sectionId: string) {
  return useQuery({
    queryKey: testDefinitionKeys.sectionDetail(testId, sectionId),
    queryFn: () =>
      testApi.getTestSectionDetail(testId, sectionId).catch((error) => {
        toast.error(error?.data?.message || "Gagal mengambil detail section");
        throw error;
      }),
    enabled: !!testId && !!sectionId,
  });
}

export function useCreateTestSectionMutation(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TestSectionCreatePayload) =>
      testApi.createTestSection(testId, payload),
    onSuccess: (res) => {
      toast.success(res?.message || "Section berhasil dibuat");
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.sections(testId),
      });
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.detail(testId),
      });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal membuat section");
    },
  });
}

export function useUpdateTestSectionMutation(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sectionId,
      payload,
    }: {
      sectionId: string;
      payload: TestSectionUpdatePayload;
    }) => testApi.updateTestSection(testId, sectionId, payload),
    onSuccess: (res, variables) => {
      toast.success(res?.message || "Section berhasil diperbarui");
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.sections(testId),
      });
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.sectionDetail(testId, variables.sectionId),
      });
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.detail(testId),
      });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal memperbarui section");
    },
  });
}

export function useDeleteTestSectionMutation(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sectionId: string) =>
      testApi.deleteTestSection(testId, sectionId),
    onSuccess: (res) => {
      toast.success(res?.message || "Section berhasil dihapus");
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.sections(testId),
      });
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.detail(testId),
      });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal menghapus section");
    },
  });
}

// --- 3. TEST SCALE HOOKS ---
export function useGetTestScales(
  testId: string,
  params?: { sectionId?: string },
) {
  return useQuery({
    queryKey: testDefinitionKeys.scales(testId, params),
    queryFn: () =>
      testApi.getTestScales(testId, params).catch((error) => {
        toast.error(error?.data?.message || "Gagal mengambil daftar skala");
        throw error;
      }),
    enabled: !!testId,
  });
}

export function useGetTestScale(testId: string, scaleId: string) {
  return useQuery({
    queryKey: testDefinitionKeys.scaleDetail(testId, scaleId),
    queryFn: () =>
      testApi.getTestScaleDetail(testId, scaleId).catch((error) => {
        toast.error(error?.data?.message || "Gagal mengambil detail skala");
        throw error;
      }),
    enabled: !!testId && !!scaleId,
  });
}

export function useCreateTestScaleMutation(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TestScaleCreatePayload) =>
      testApi.createTestScale(testId, payload),
    onSuccess: (res) => {
      toast.success(res?.message || "Skala berhasil dibuat");
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.scales(testId),
      });
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.detail(testId),
      });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal membuat skala");
    },
  });
}

export function useUpdateTestScaleMutation(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      scaleId,
      payload,
    }: {
      scaleId: string;
      payload: TestScaleUpdatePayload;
    }) => testApi.updateTestScale(testId, scaleId, payload),
    onSuccess: (res, variables) => {
      toast.success(res?.message || "Skala berhasil diperbarui");
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.scales(testId),
      });
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.scaleDetail(testId, variables.scaleId),
      });
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.detail(testId),
      });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal memperbarui skala");
    },
  });
}

export function useDeleteTestScaleMutation(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scaleId: string) => testApi.deleteTestScale(testId, scaleId),
    onSuccess: (res) => {
      toast.success(res?.message || "Skala berhasil dihapus");
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.scales(testId),
      });
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.detail(testId),
      });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal menghapus skala");
    },
  });
}
