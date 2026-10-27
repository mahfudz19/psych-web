import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BaseListParams } from "../../../../../../components/reusebale-components/DataTable";
import toast from "../../../../../../components/ui/Toast";
import * as testApi from "./test-definitions.api";
import type {
  ItemListParams,
  TestDefinitionCreatePayload,
  TestDefinitionUpdatePayload,
  TestItemCreatePayload,
  TestItemUpdatePayload,
  TestScaleCreatePayload,
  TestScaleUpdatePayload,
  TestSectionCreatePayload,
  TestSectionUpdatePayload,
} from "./test-definitions.type";
import type { NormPayload } from "../$testId/-components/NormTableService/Normform";

// --- QUERY KEYS FACTORY ---
export const testDefinitionKeys = {
  all: ["test-definitions"] as const,
  lists: () => [...testDefinitionKeys.all, "list"] as const,
  list: (params?: BaseListParams) =>
    [...testDefinitionKeys.lists(), { params }] as const,
  details: () => [...testDefinitionKeys.all, "detail"] as const,
  detail: (id: string) => [...testDefinitionKeys.details(), id] as const,

  // Sections
  sections: (testId: string) =>
    [...testDefinitionKeys.detail(testId), "sections"] as const,
  sectionLists: (testId: string) =>
    [...testDefinitionKeys.sections(testId), "list"] as const,
  sectionList: (testId: string, params?: BaseListParams) =>
    [...testDefinitionKeys.sectionLists(testId), { params }] as const,
  sectionDetails: (testId: string) =>
    [...testDefinitionKeys.sections(testId), "detail"] as const,
  sectionDetail: (testId: string, sectionId: string) =>
    [...testDefinitionKeys.sectionDetails(testId), sectionId] as const,

  // Scales
  scales: (testId: string) =>
    [...testDefinitionKeys.detail(testId), "scales"] as const,
  scaleLists: (testId: string) =>
    [...testDefinitionKeys.scales(testId), "list"] as const,
  scaleList: (
    testId: string,
    params?: BaseListParams & { sectionId?: string },
  ) => [...testDefinitionKeys.scaleLists(testId), { params }] as const,
  scaleDetails: (testId: string) =>
    [...testDefinitionKeys.scales(testId), "detail"] as const,
  scaleDetail: (testId: string, scaleId: string) =>
    [...testDefinitionKeys.scaleDetails(testId), scaleId] as const,

  // Items
  items: (testId: string) =>
    [...testDefinitionKeys.detail(testId), "items"] as const,
  itemLists: (testId: string) =>
    [...testDefinitionKeys.items(testId), "list"] as const,
  itemList: (testId: string, params?: ItemListParams) =>
    [...testDefinitionKeys.itemLists(testId), { params }] as const,
  itemDetails: (testId: string) =>
    [...testDefinitionKeys.items(testId), "detail"] as const,
  itemDetail: (testId: string, itemId: string) =>
    [...testDefinitionKeys.itemDetails(testId), itemId] as const,
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
export function useGetTestSections(testId: string, params?: BaseListParams) {
  return useQuery({
    queryKey: testDefinitionKeys.sectionList(testId, params),
    queryFn: () =>
      testApi.getTestSections(testId, params).catch((error) => {
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
    onError: (error: any) =>
      toast.error(error?.data?.message || "Gagal membuat section"),
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
  params?: BaseListParams & { sectionId?: string },
) {
  return useQuery({
    queryKey: testDefinitionKeys.scaleList(testId, params),
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

export function useCreateTestScale(testId: string) {
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

export function useUpdateTestScale(testId: string) {
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

// --- 4. TEST ITEM HOOKS ---
export function useGetTestItems(testId: string, params?: ItemListParams) {
  return useQuery({
    queryKey: testDefinitionKeys.itemList(testId, params),
    queryFn: () =>
      testApi.getTestItems(testId, params).catch((error) => {
        toast.error(error?.data?.message || "Gagal mengambil daftar soal");
        throw error;
      }),
    enabled: !!testId,
  });
}

export function useGetTestItem(testId: string, itemId: string) {
  return useQuery({
    queryKey: testDefinitionKeys.itemDetail(testId, itemId),
    queryFn: () =>
      testApi.getTestItemDetail(testId, itemId).catch((error) => {
        toast.error(error?.data?.message || "Gagal mengambil detail soal");
        throw error;
      }),
    enabled: !!testId && !!itemId,
  });
}

export function useCreateTestItem(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TestItemCreatePayload) =>
      testApi.createTestItem(testId, payload),
    onSuccess: (res) => {
      toast.success(res?.message || "Soal berhasil dibuat");
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.items(testId),
      });
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.detail(testId),
      });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal membuat soal");
    },
  });
}

export function useUpdateTestItem(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: TestItemUpdatePayload;
    }) => testApi.updateTestItem(testId, itemId, payload),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.items(testId),
      });
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.itemDetail(testId, variables.itemId),
      });
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.detail(testId),
      });
      toast.success(res?.message || "Soal berhasil diperbarui");
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal memperbarui soal");
    },
  });
}

export function useDeleteTestItemMutation(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => testApi.deleteTestItem(testId, itemId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.items(testId),
      });
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.detail(testId),
      });
      toast.success(res?.message || "Soal berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal menghapus soal");
    },
  });
}

// --- 4. TEST NORM HOOKS ---
// --- QUERY KEYS ---
export const testNormKeys = {
  all: (testId: string) => ["test-norms", testId] as const,
  list: (testId: string, params?: { scaleId?: string; status?: string }) =>
    [...testNormKeys.all(testId), { params }] as const,
};

// --- HOOKS ---
export function useGetTestNorms(
  testId: string,
  params?: { scaleId?: string; status?: string },
) {
  return useQuery({
    queryKey: testNormKeys.list(testId, params),
    queryFn: () =>
      testApi.getTestNorms(testId, params).catch((error) => {
        toast.error(error?.data?.message || "Gagal mengambil daftar norma");
        throw error;
      }),
    enabled: !!testId,
  });
}

export function useCreateTestNormMutation(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NormPayload) =>
      testApi.createTestNorm(testId, payload),
    onSuccess: (res) => {
      toast.success(res?.message || "Norma berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: testNormKeys.all(testId) });
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.detail(testId),
      });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal membuat norma");
    },
  });
}

export function useUpdateTestNormMutation(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      normId,
      payload,
    }: {
      normId: string;
      payload: Omit<NormPayload, "scaleId">;
    }) => testApi.updateTestNorm(testId, normId, payload),
    onSuccess: (res) => {
      toast.success(res?.message || "Norma berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: testNormKeys.all(testId) });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal memperbarui norma");
    },
  });
}

export function useDeleteTestNormMutation(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (normId: string) => testApi.deleteTestNorm(testId, normId),
    onSuccess: (res) => {
      toast.success(res?.message || "Norma berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: testNormKeys.all(testId) });
      queryClient.invalidateQueries({
        queryKey: testDefinitionKeys.detail(testId),
      });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal menghapus norma");
    },
  });
}

export function useActivateTestNormMutation(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (normId: string) => testApi.activateTestNorm(testId, normId),
    onSuccess: (res) => {
      toast.success(res?.message || "Norma berhasil diaktifkan");
      queryClient.invalidateQueries({ queryKey: testNormKeys.all(testId) });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal mengaktifkan norma");
    },
  });
}

export function useArchiveTestNormMutation(testId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (normId: string) => testApi.archiveTestNorm(testId, normId),
    onSuccess: (res) => {
      toast.success(res?.message || "Norma berhasil diarsipkan");
      queryClient.invalidateQueries({ queryKey: testNormKeys.all(testId) });
    },
    onError: (error: any) => {
      toast.error(error?.data?.message || "Gagal mengarsipkan norma");
    },
  });
}
