import type { BaseListParams } from "../../../../../../components/reusebale-components/DataTable";
import type { Session } from "../../../../../../types/user";
import { api } from "../../../../../../utils/api";
import type { TransactionHistoryItem } from "../../../../_organization-and-individu/billing/-api/billing.type";
import type { Users } from "./user.type";

const BASE = "/api/v1/users";

export async function getUsers(params: BaseListParams) {
  return api.get<Users[]>(`${BASE}`, { params });
}

export async function getUserById(userId: string) {
  return api.get<Users>(`${BASE}/${userId}/detail`);
}

export async function getSessionsByUserId(
  userId: string,
  params?: BaseListParams,
) {
  return api.get<Session[]>(`${BASE}/${userId}/sessions`, { params });
}

export async function getTransactionsByUser(
  userId: string,
  params?: BaseListParams,
) {
  return api.get<TransactionHistoryItem[]>(`${BASE}/${userId}/transactions`, {
    params,
  });
}
