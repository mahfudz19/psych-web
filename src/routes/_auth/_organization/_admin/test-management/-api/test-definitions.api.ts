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
export function getTestSections(testId: string) {
  return api.get<TestSection[]>(`${BASE}/${testId}/sections`);
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
export function getTestScales(testId: string, params?: { sectionId?: string }) {
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
