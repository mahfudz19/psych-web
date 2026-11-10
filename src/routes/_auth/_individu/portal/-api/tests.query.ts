import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { BaseListParams } from "../../../../../components/reusebale-components/DataTable";
import * as testApi from "./tests.api";
import type { SaveAnswersRequest, SubmitSectionRequest } from "./tests.type";

export const testKeys = {
  all: ["tests"] as const,

  catalogs: () => [...testKeys.all, "catalogs"] as const,
  catalogList: (params?: BaseListParams) =>
    [...testKeys.catalogs(), "list", { params }] as const,
  catalogDetails: () => [...testKeys.catalogs(), "detail"] as const,
  catalogDetail: (id: string) => [...testKeys.catalogDetails(), id] as const,

  attempts: () => [...testKeys.all, "attempts"] as const,
  attemptList: (params?: BaseListParams) =>
    [...testKeys.attempts(), "list", { params }] as const,
  attemptDetails: () => [...testKeys.attempts(), "detail"] as const,
  attemptDetail: (id: string) => [...testKeys.attemptDetails(), id] as const,
  startOrResume: (testId: string) =>
    [...testKeys.attempts(), "start", testId] as const,
};

export const useGetCatalog = (params?: BaseListParams) => {
  return useQuery({
    queryKey: testKeys.catalogList(params),
    queryFn: () => testApi.getCatalog(params),
  });
};

export const useGetTestDetail = (testId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: testKeys.catalogDetail(testId),
    queryFn: () => testApi.getTestDetail(testId),
    enabled: !!testId && enabled,
  });
};

export const useGetAttempts = (params?: BaseListParams) => {
  return useQuery({
    queryKey: testKeys.attemptList(params),
    queryFn: () => testApi.getAttempts(params),
  });
};

export const useGetAttempt = (attemptId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: testKeys.attemptDetail(attemptId),
    queryFn: () => testApi.getAttempt(attemptId),
    enabled: !!attemptId && enabled,
  });
};

export const useStartOrResumeAttempt = (
  testId: string,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: testKeys.startOrResume(testId),
    queryFn: () => testApi.startOrResumeAttempt(testId),
    enabled: !!testId && enabled,
  });
};

export const useStartSection = () => {
  return useMutation({
    mutationFn: ({
      attemptId,
      sectionId,
    }: {
      attemptId: string;
      sectionId: string;
    }) => testApi.startSection(attemptId, sectionId),
  });
};

export const useSaveAnswers = () => {
  return useMutation({
    mutationFn: ({
      attemptId,
      sectionId,
      payload,
    }: {
      attemptId: string;
      sectionId: string;
      payload: SaveAnswersRequest;
    }) => testApi.saveAnswers(attemptId, sectionId, payload),
  });
};

export const useSubmitSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      attemptId,
      sectionId,
      payload,
    }: {
      attemptId: string;
      sectionId: string;
      payload?: SubmitSectionRequest;
    }) => testApi.submitSection(attemptId, sectionId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: testKeys.attemptDetail(variables.attemptId),
      });
    },
  });
};

export const useFinishAttempt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attemptId: string) => testApi.finishAttempt(attemptId),
    onSuccess: (_, attemptId) => {
      queryClient.invalidateQueries({
        queryKey: testKeys.attemptDetail(attemptId),
      });
      queryClient.invalidateQueries({ queryKey: testKeys.attempts() });
    },
  });
};
