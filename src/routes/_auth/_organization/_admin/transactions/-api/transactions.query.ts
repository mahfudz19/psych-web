import { useQuery } from "@tanstack/react-query";
import type { BaseListParams } from "../../../../../../components/reusebale-components/DataTable";
import * as api from "./transactions.api";

export const userKeys = {
  all: ["transactions"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...userKeys.lists(), { filters }] as const,

  // soon
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useTransactionsQuery(params: BaseListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => api.getTransactions(params),
  });
}
