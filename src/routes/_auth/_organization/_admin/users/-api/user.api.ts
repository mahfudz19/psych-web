import type { BaseListParams } from "../../../../../../components/reusebale-components/DataTable";
import { api } from "../../../../../../utils/api";
import type { Users } from "./user.type";

const BASE = "/api/v1/users";

export interface UserListParams extends BaseListParams {
  page?: number;
  limit?: number;
  search?: string;
  filter?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | "";
}
export async function getUsers(params: UserListParams) {
  return api.get<Users[]>(`${BASE}`, { params });
}

export async function getUserById(userId: string) {
  return api.get<Users>(`${BASE}/${userId}/detail`);
}
