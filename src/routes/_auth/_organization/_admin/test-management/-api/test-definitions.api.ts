import type { NormPayload } from "../$testId/-components/NormTableService/Normform";
import type { BaseListParams } from "../../../../../../components/reusebale-components/DataTable";
import { api } from "../../../../../../utils/api";
import type {
  TestDefinition,
  TestDefinitionCreatePayload,
  TestDefinitionDetail,
  TestDefinitionUpdatePayload,
  TestScale,
  TestScaleCreatePayload,
  TestScaleUpdatePayload,
  TestSection,
  TestSectionCreatePayload,
  TestSectionUpdatePayload,
  TestItem,
  TestItemCreatePayload,
  TestItemUpdatePayload,
  ItemListParams,
  NormTable,
} from "./test-definitions.type";

const BASE = "/api/v1/admin/tests";

// --- 1. TEST DEFINITION ---
export function getTestDefinitions(params?: BaseListParams) {
  return api.get<TestDefinition[]>(BASE, { params });
}

export function getTestDefinitionDetail(id: string) {
  return api.get<TestDefinitionDetail>(`${BASE}/${id}`);
}

export function createTestDefinition(payload: TestDefinitionCreatePayload) {
  return api.post<TestDefinition>(BASE, payload);
}

export function updateTestDefinition(
  id: string,
  payload: TestDefinitionUpdatePayload,
) {
  return api.put<TestDefinition>(`${BASE}/${id}`, payload);
}

export function deleteTestDefinition(id: string) {
  return api.delete<null>(`${BASE}/${id}`);
}

export function publishTestDefinition(id: string) {
  return api.post<TestDefinition>(`${BASE}/${id}/publish`);
}

export function archiveTestDefinition(id: string) {
  return api.post<TestDefinition>(`${BASE}/${id}/archive`);
}

// --- 2. TEST SECTION ---
export function getTestSections(testId: string, params?: BaseListParams) {
  return api.get<TestSection[]>(`${BASE}/${testId}/sections`, { params });
}

export function getTestSectionDetail(testId: string, sectionId: string) {
  return api.get<TestSection>(`${BASE}/${testId}/sections/${sectionId}`);
}

export function createTestSection(
  testId: string,
  payload: TestSectionCreatePayload,
) {
  return api.post<TestSection>(`${BASE}/${testId}/sections`, payload);
}

export function updateTestSection(
  testId: string,
  sectionId: string,
  payload: TestSectionUpdatePayload,
) {
  return api.put<TestSection>(
    `${BASE}/${testId}/sections/${sectionId}`,
    payload,
  );
}

export function deleteTestSection(testId: string, sectionId: string) {
  return api.delete<null>(`${BASE}/${testId}/sections/${sectionId}`);
}

// --- 3. TEST SCALE ---
export function getTestScales(
  testId: string,
  params?: BaseListParams & { sectionId?: string },
) {
  return api.get<TestScale[]>(`${BASE}/${testId}/scales`, { params });
}

export function getTestScaleDetail(testId: string, scaleId: string) {
  return api.get<TestScale>(`${BASE}/${testId}/scales/${scaleId}`);
}

export function createTestScale(
  testId: string,
  payload: TestScaleCreatePayload,
) {
  return api.post<TestScale>(`${BASE}/${testId}/scales`, payload);
}

export function updateTestScale(
  testId: string,
  scaleId: string,
  payload: TestScaleUpdatePayload,
) {
  return api.put<TestScale>(`${BASE}/${testId}/scales/${scaleId}`, payload);
}

export function deleteTestScale(testId: string, scaleId: string) {
  return api.delete<null>(`${BASE}/${testId}/scales/${scaleId}`);
}

// --- 4. TEST ITEM ---
export function getTestItems(testId: string, params?: ItemListParams) {
  return api.get<TestItem[]>(`${BASE}/${testId}/items`, { params });
}

export function getTestItemDetail(testId: string, itemId: string) {
  return api.get<TestItem>(`${BASE}/${testId}/items/${itemId}`);
}

export function createTestItem(testId: string, payload: TestItemCreatePayload) {
  return api.post<TestItem>(`${BASE}/${testId}/items`, payload);
}

export function updateTestItem(
  testId: string,
  itemId: string,
  payload: TestItemUpdatePayload,
) {
  return api.put<TestItem>(`${BASE}/${testId}/items/${itemId}`, payload);
}

export function deleteTestItem(testId: string, itemId: string) {
  return api.delete<null>(`${BASE}/${testId}/items/${itemId}`);
}

// --- 5. TEST NORM ---
export function getTestNorms(
  testId: string,
  params?: { scaleId?: string; status?: string },
) {
  return api.get<NormTable[]>(`${BASE}/${testId}/norms`, { params });
}

export function createTestNorm(testId: string, payload: NormPayload) {
  return api.post<NormTable>(`${BASE}/${testId}/norms`, payload);
}

export function updateTestNorm(
  testId: string,
  normId: string,
  payload: Omit<NormPayload, "scaleId">,
) {
  return api.put<NormTable>(`${BASE}/${testId}/norms/${normId}`, payload);
}

export function deleteTestNorm(testId: string, normId: string) {
  return api.delete<null>(`${BASE}/${testId}/norms/${normId}`);
}

export function activateTestNorm(testId: string, normId: string) {
  return api.post<NormTable>(`${BASE}/${testId}/norms/${normId}/activate`);
}

export function archiveTestNorm(testId: string, normId: string) {
  return api.post<NormTable>(`${BASE}/${testId}/norms/${normId}/archive`);
}
