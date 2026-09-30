import type { BaseListParams } from "../../../../../../components/reusebale-components/DataTable";
import { api } from "../../../../../../utils/api";
import type { AdminTransactionsInfo } from "./transactions.type";

export async function getTransactions(params?: BaseListParams) {
  return api.get<AdminTransactionsInfo[]>("/api/v1/transactions/admin/all", {
    params,
  });
}
