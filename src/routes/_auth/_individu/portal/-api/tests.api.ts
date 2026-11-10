import type { BaseListParams } from "../../../../../components/reusebale-components/DataTable";
import { api } from "../../../../../utils/api";
import type {
  Attempt,
  AttemptResponse,
  FinishAttemptResponse,
  SaveAnswersRequest,
  SaveAnswersResponse,
  SectionStartResponse,
  SubmitSectionRequest,
  SubmitSectionResponse,
  TestCatalog,
  TestDetailPublicResponse,
} from "./tests.type";

const BASE = "/api/v1/tests";

export function getCatalog(params?: BaseListParams) {
  return api.get<TestCatalog[]>(`${BASE}/catalog`, { params });
}

export function getTestDetail(testId: string) {
  return api.get<TestDetailPublicResponse>(`${BASE}/catalog/${testId}`);
}

export function startOrResumeAttempt(testId: string) {
  return api.get<AttemptResponse>(`${BASE}/attempts/start/${testId}`);
}

export function getAttempts(params?: BaseListParams) {
  return api.get<Attempt[]>(`${BASE}/attempts`, { params });
}

export function getAttempt(attemptId: string) {
  return api.get<AttemptResponse>(`${BASE}/attempts/${attemptId}`);
}

export function startSection(attemptId: string, sectionId: string) {
  return api.post<SectionStartResponse>(
    `${BASE}/attempts/${attemptId}/sections/${sectionId}/start`,
  );
}

export function saveAnswers(
  attemptId: string,
  sectionId: string,
  payload: SaveAnswersRequest,
) {
  return api.put<SaveAnswersResponse>(
    `${BASE}/attempts/${attemptId}/sections/${sectionId}/answers`,
    payload,
  );
}

export function submitSection(
  attemptId: string,
  sectionId: string,
  payload?: SubmitSectionRequest,
) {
  return api.post<SubmitSectionResponse>(
    `${BASE}/attempts/${attemptId}/sections/${sectionId}/submit`,
    payload || {},
  );
}

export function finishAttempt(attemptId: string) {
  return api.post<FinishAttemptResponse>(
    `${BASE}/attempts/${attemptId}/finish`,
  );
}
