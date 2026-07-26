import type {
  KickMemberResponse,
  MembersListParams,
  OrganizationMember,
} from "../-types/member.types";
import { api } from "../../../../../utils/api";

export async function getMembers(orgId: string, params?: MembersListParams) {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params?.role) queryParams.append("role", params.role);
  if (params?.status) queryParams.append("status", params.status);

  const queryString = queryParams.toString();
  const endpoint = `/api/v1/organizations/${orgId}/members${queryString ? `?${queryString}` : ""}`;

  return await api.get<OrganizationMember[]>(endpoint);
}

export function kickMember(orgId: string, memberId: string) {
  return api.delete<KickMemberResponse>(
    `/api/v1/organizations/${orgId}/members/${memberId}`,
  );
}
